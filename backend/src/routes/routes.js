const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const childRoutes = require("./childRoutes");
const guardianRoutes = require("./guardianRoutes");


router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/child", childRoutes);
router.use("/guardian", guardianRoutes);

module.exports = router;
