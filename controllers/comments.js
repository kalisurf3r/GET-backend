const router = require("express").Router();
const Users = require("../models/Users");
const Posts  = require("../models/Posts");
const Comments = require("../models/Comments");
const jwt = require("jsonwebtoken");
const tokenauth = require("../utils/tokenauth");

// * create a new comment
router.post("/", tokenauth, async (req, res) => {
  try {

    const userId = req.user.id;

    const newComment = await Comments.create({
      // in insomnia, the user_id is not
      // required because we are getting
      // the user_id from the token
      user_id: userId,
      post_id: req.body.post_id,
      date: req.body.date,
      title: req.body.title,
      content: req.body.content,
    });

    res.status(200).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// * get all comments for a post
router.get("/:post_id", async (req, res) => {
  try {
    const comments = await Comments.findAll({
      where: { post_id: req.params.post_id },
      include: [{ model: Users }],
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// * like a comment
router.put("/like/:id", tokenauth, async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);

    comment.likes += 1;

    await comment.save();

    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

module.exports = router;