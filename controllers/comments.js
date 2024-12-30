const router = require("express").Router();
const Users = require("../models/Users");
const Posts  = require("../models/Posts");
const Comments = require("../models/Comments");
const jwt = require("jsonwebtoken");
const tokenauth = require("../utils/tokenauth");

// * create a new comment
router.post("/", async (req, res) => {
  try {
    const { user_id, post_id, date, content, likes } = req.body;

    if (!user_id || !post_id || !content) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const newComment = await Comments.create({
      user_id,
      post_id,
      date: date ? new Date(date) : new Date(),
      content,
      likes: likes || 0,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment", details: error });
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