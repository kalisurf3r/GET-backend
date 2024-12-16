const router = require("express").Router();
const Users = require("../models/Users");
const Posts = require("../models/Posts");
const Comments = require("../models/Comments");
const jwt = require("jsonwebtoken");
const tokenauth = require("../utils/tokenauth");
const sendEmail = require("./Sendgrid");
const Subscribe = require("../models/Subscribe");
const { Op } = require("sequelize");

/// * create a new post
router.post("/", tokenauth, async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const userId = req.user.id;

    const newPost = await Posts.create({
      // in insomnia, the user_id is not
      // required because we are getting
      // the user_id from the token
      user_id: userId,
      date: req.body.date,
      title: req.body.title,
      content: req.body.content,
      likes: req.body.likes,
      dislikes: req.body.dislikes,
      topics: req.body.topics,
    });

    const user = await Users.findByPk(userId);

    // * Get all subscribers
    const subscribers = await Subscribe.findAll({
      where: {
        subscribedToId: userId,
      },
      include: [{ model: Users, as: 'Subscriber' }],
    });

    // * send email notification to subscribers
    const subSubject = 'New Post Created';
    const subText = `Hello, ${user.userName} has created a new post.`;
    const subHtml = `<strong>Hello, ${user.userName} has created a new post.</strong>`;

    const subEmailPromises = subscribers.map(subscriber => {
      console.log(`Sending email to subscriber: ${subscriber.Subscriber.email}`);
      return sendEmail(subscriber.Subscriber.email, subSubject, subText, subHtml);
    });

    await Promise.all(subEmailPromises);


    // * Send email notification to post owner
    const subject = 'New Post Created';
    const text = `Hello ${user.userName}, you have successfully created a new post.`;
    const html = `<strong>Hello ${user.userName}, you have successfully created a new post.</strong>`;

    await sendEmail(user.email, subject, text, html);

    res.status(200).json(newPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      include: [
        { model: Users },
        {
          model: Comments,
          include: [{ model: Users }],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get post by id
router.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id, {
      include: [{ model: Users }],
    });

    res.status(200).json(post);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * like a post
router.put("/like/:id", tokenauth, async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id);

    post.likes += 1;

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * dislike a post
router.put("/dislike/:id", tokenauth, async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id);

    post.dislikes += 1;

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * retrieve all posts by a user
router.get("/user/:id", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      where: {
        user_id: req.params.id,
      },
      include: [{ model: Users }],
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * update or edit a post
router.put("/:id", tokenauth, async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id);

    if (post.user_id === req.user.id) {
      post.date = req.body.date;
      post.title = req.body.title;
      post.content = req.body.content;

      await post.save();

      res.status(200).json(post);
    } else {
      res
        .status(401)
        .json("Error updating post; need to be the owner of the post");
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get all posts by topic
router.get("/topic/:topic", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      where: {
        topics: {
          [Op.contains]: [req.params.topic], // For array or JSONB column
        },
      },
      include: [{ model: Users }],
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts by topic:", err);
    res.status(400).json(err);
  }
});

module.exports = router;
