const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const auth = require("./authRoutes");


router.use("/users", userRoutes);
router.use("/register", auth);

module.exports = router;
