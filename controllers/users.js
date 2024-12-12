const router = require("express").Router();
const { Users, Posts, Comments, Subscribe } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sequelize = require("../config/connection");
const tokenauth = require("../utils/tokenauth");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const JWT_SECRET = process.env.JWT_SECRET;

// * Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Failed to authorize token", err);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    next();
  });
};

// * Create a new user
router.post("/signup", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("Request Body:", req.body);

    if (!req.body.userName || !req.body.password) {
      return res.status(400).json({ message: "Missing userName or password" });
    }

    const newUser = await Users.create(
      {
        id: uuidv4(),
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
        profilePic: req.body.profilePic,
        topics: req.body.topics,
      },
      { transaction }
    );

    await transaction.commit();

    // * Generate JWT
    const token = jwt.sign(
      { id: newUser.id, userName: newUser.userName },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user: newUser, token });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating user:", err);
    res.status(400).json(err);
  }
});

// * Login a user
router.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        userName: req.body.userName,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // * Generate JWT
    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id, {
      include: [
        {
          model: Posts, // Fetch associated posts
          attributes: ["id", "title", "content", "createdAt"], // Specify post fields
        },
      ],
      attributes: [
        "id",
        "userName",
        "email",
        "profilePic",
        "password",
        "topics",
      ], // Fetch user fields
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get all users
router.get("/", async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [{ model: Posts }],
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * put edit user by id
router.put("/:id", tokenauth, async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);

    console.log("req.userId:", req.user.id);
    console.log("user.id:", user.id);

    if (user.id === req.user.id) {
      if (req.body.userName) {
        user.userName = req.body.userName;
      }
      if (req.body.profilePic) {
        user.profilePic = req.body.profilePic;
      }
      if (req.body.password) {
        const isSamePassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!isSamePassword) {
          user.password = await bcrypt.hash(req.body.password, 10);
        }
      }
      await user.save();

      res.status(200).json(user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// * subscribe to a user
// * the id in the route is the user id that the current user wants to subscribe to
router.post("/subscribe/:id", tokenauth, async (req, res) => {
  try {
    const subscriber = await Users.findByPk(req.user.id);
    const subscribedTo = await Users.findByPk(req.params.id);

    // Check if the subscription already exists
    const existingSubscription = await Subscribe.findOne({
      where: {
        subscriberId: subscriber.id,
        subscribedToId: subscribedTo.id,
      },
    });

    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "Already subscribed to this user." });
    }

    const subscription = await Subscribe.create({
      id: uuidv4(),
      subscriberId: subscriber.id,
      subscribedToId: subscribedTo.id,
    });

    // * Send email notification
    const msg = {
      to: subscriber.email,
      from: "ayalaarturo925@gmail.com",
      subject: "Now Following",
      text: `Stay up to date with ${subscribedTo.userName}`,
      html: `<p>Stay up to date with <strong>${subscribedTo.userName}</strong></p>`,
    };

    await sgMail.send(msg);

    res.status(200).json(subscription);
  } catch (err) {
    res.status(400).json(err);
  }
});

// * unsubscribe to a user
// * the id in the route is the user id that the current user wants to unsubscribe to
router.delete("/unsubscribe/:id", tokenauth, async (req, res) => {
  try {
    const subscriber = await Users.findByPk(req.user.id);
    const subscribedTo = await Users.findByPk(req.params.id);

    await Subscribe.destroy({
      where: {
        subscriberId: subscriber.id,
        subscribedToId: subscribedTo.id,
      },
    });

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (err) {
    res.status(400).json(err);
  }
});

// * get all a user's subscriptions
router.get("/:id/subscriptions", tokenauth, async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);

    const subscriptions = await Subscribe.findAll({
      where: {
        subscriberId: user.id,
      },
      include: [{ model: Users, as: "SubscribedTo" }],
    });

    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
