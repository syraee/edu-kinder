const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

router.get("/:idUser/:idChild", async (req, res) => {
    try {
        const id = req.params['id'];

        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const users = await prisma.user.findMany();
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        next(err);
    }
})

module.exports = router;