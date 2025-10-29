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
router.post("/", (req, res) => {
    res.send("User created");
});

module.exports = router;
