const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");


router.get("/", async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get all users'
    // #swagger.description = 'Fetches all users from the database'

    try {
        const users = await prisma.user.findMany();
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/users
router.post("/", async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Create a new user'
    // #swagger.description = 'Create a new user'

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                active: false,
            },
        });

        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
