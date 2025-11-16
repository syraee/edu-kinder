const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const childRoutes = require("./childRoutes");
const guardianRoutes = require("./guardianRoutes");
const groupRoutes = require("./groupRoutes");


router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/child", childRoutes);
router.use("/guardian", guardianRoutes);
router.use("/group", groupRoutes);


module.exports = router;
