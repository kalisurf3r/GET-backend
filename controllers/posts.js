const router = require("express").Router();
const Users = require("../models/Users");
const Posts = require("../models/Posts");
const Comments = require("../models/Comments");
const jwt = require("jsonwebtoken");
const tokenauth = require("../utils/tokenauth");
const sendEmail = require("./Sendgrid");
const Subscribe = require("../models/Subscribe");

/// * create a new post
router.post("/", tokenauth, async (req, res) => {
  try {
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
    });

    const user = await Users.findByPk(userId);

    // * Get all subscribers
    const subscribers = await Subscribe.findAll({
      where: {
        subscribedToId: userId,
      },
      include: [{ model: Users, as: 'Subscriber' }],
    });

    // Send email notification
    const subject = 'New Post Created';
    const text = `Hello ${user.userName}, you have successfully created a new post.`;
    const html = `<strong>Hello ${user.userName}, you have successfully created a new post.</strong>`;

    const emailPromises = subscribers.map(subscriber => 
      sendEmail(subscriber.Subscriber.email, subject, text, html)
    );

    await Promise.all(emailPromises);

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

module.exports = router;
