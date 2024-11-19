const router = require("express").Router();
router.use("/users", require("./users"));
router.use("/posts", require("./posts"));
router.use("/jwtverify", require("./jwtverify"));
router.use("/comments", require("./comments"));

module.exports = router;