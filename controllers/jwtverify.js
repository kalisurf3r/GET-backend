const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET; 

// * Verify token
router.post("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json(decoded);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;