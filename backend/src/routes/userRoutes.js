const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

// GET /api/users - vráti všetkých používateľov
router.get("/", async (req, res, next) => {
    try {
        const users = await prisma.user.findMany(); // všetci users z DB
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        next(err); // pošli chybu do globálneho error handlera
    }
});

// POST /api/users
router.post("/", async (req, res, next) => {
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
