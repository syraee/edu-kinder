const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");
const authorizeRole = require("../middleware/authorizeRole");


//GET /api/user/parents – všetci rodičia + ich deti
router.get("/parents", async (req, res, next) => {
  try {
    const parents = await prisma.user.findMany({
      where: { roleId: 3 },
      include: {
        children: {
          include: {
            child: true,
          },
        },
      },
    });

    const formatted = parents.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      email: p.email,
      active: p.active,
      createdAt: p.createdAt,
      children: p.children.map((link) => ({
        id: link.child.id,
        firstName: link.child.firstName,
        lastName: link.child.lastName,
      })),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/user
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/user/teachers – získa všetkých učiteľov
router.get("/teachers", async (req, res, next) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { roleId: 2 }, // učitelia
      orderBy: { lastName: "asc" },
        include: {
            teachingClasses: true,
        },
    });

    const formatted = teachers.map(t => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
        phone: t.phone,
        classes: t.teachingClasses.map((g) => g.name),
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error loading teachers:", err);
    next(err);
  }
});


// GET /api/user/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
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

// POST /api/user – vytvorenie nového používateľa (rodiča, učiteľa, admina)
router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, roleId, active, internal } = req.body;

  
    if (!email) {
      return res.status(400).json({ error: "Chýba email." });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Používateľ s týmto e-mailom už existuje." });
    }

 
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName?.trim() || null,
        lastName:  lastName?.trim()  || null,
        email,
        phone:   phone?.trim() || null,
        roleId:  roleId ?? 3,     
        active:  active ?? false,
        internal: internal ?? false,   
      },
    });

    res.status(201).json({
      success: true,
      message: "Používateľ úspešne vytvorený.",
      data: newUser,
    });
  } catch (err) {
    console.error("❌ Chyba pri vytváraní používateľa:", err);
    next(err);
  }
});


// PATCH /api/user/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { firstName, lastName, role, email, active, phone } = req.body;

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

// DELETE /api/user/:id
router.delete("/:id", authenticate, authorizeRole(["admin", "teacher"]), async (req, res, next) => {
  try {
    const id = req.params.id;
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
