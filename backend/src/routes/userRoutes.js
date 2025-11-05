const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

// GET /api/user
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

// GET /api/user/{id}
router.get("/:id", async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get a user'
    // #swagger.description = 'Get a user by his ID'

    try {
        const id = req.params['id'];

        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
});

// POST /api/user
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

// PATCH /api/user/:id
router.patch("/:id", async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Updates existing user'
    // #swagger.description = 'Updates existing user. These parameters can be updated: firstName, lastName, role, email, active, phone'

    try {
        const id = req.params['id'];

        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const { firstName, lastName, role, email, active, phone} = req.body;

        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (role !== undefined) updateData.roleId = role;
        if (email !== undefined) updateData.email = email;
        if (active !== undefined) updateData.active = active;
        if (phone !== undefined) updateData.phone = phone;


        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.json(updatedUser);
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        next(err);
    }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete user'
    // #swagger.description = 'Delete user by Id'

    try {
        const id = req.params['id'];
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        res.status(204).send();
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }

        next(err);
    }
});

module.exports = router;