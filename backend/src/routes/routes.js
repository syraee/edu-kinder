const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const childRoutes = require("./childRoutes");


router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/child", childRoutes);

module.exports = router;
