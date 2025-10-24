const express = require("express");
const router = express.Router();

// GET /api/users
router.get("/", (req, res) => {
    res.send("List of users");
});

// POST /api/users
router.post("/", (req, res) => {
    res.send("User created");
});

module.exports = router;
