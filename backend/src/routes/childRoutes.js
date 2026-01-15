const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");

// ✅ GET /api/child – všetky deti s informáciami o triede
router.get("/", async (req, res, next) => {
  try {
    const children = await prisma.child.findMany({
      include: {
        group: true,
      },
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      data: children.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        groupName: c.group?.name || "Nezaradené",
        className: c.group?.class || "",
        classYear: c.group?.classYear || null,
      })),
    });
  } catch (err) {
    next(err);
  }
});


// GET /api/child/mine
router.get("/mine", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const guardians = await prisma.childGuardian.findMany({
      where: { userId: Number(userId) },
      include: {
        child: true,
      },
      orderBy: { childId: "asc" },
    });

    const children = guardians.map((g) => ({
      id: g.child.id,
      firstName: g.child.firstName,
      lastName: g.child.lastName,
      groupId: g.child.groupId,
    }));

    return res.json({ success: true, data: children });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, birthDate, groupId } = req.body;

    if (!firstName || !lastName || !birthDate || !groupId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const parsedDate = new Date(birthDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid birthDate format." });
    }

    const newChild = await prisma.child.create({
      data: {
        firstName,
        lastName,
        birthday: parsedDate,
        groupId: Number(groupId),
        startDate: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Dieťa bolo úspešne pridané.",
      data: newChild,
    });
  } catch (err) {
    console.error("Error creating child:", err);
    next(err);
  }
});

// ✅ PATCH /api/child/:id – úprava údajov dieťaťa
router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid child ID" });

    const { firstName, lastName, groupName, className } = req.body;

    // získať ID triedy podľa mena
    const group = await prisma.groupClass.findFirst({
      where: { name: groupName },
    });

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        firstName,
        lastName,
        groupId: group ? group.id : null,
      },
    });

    res.json({ success: true, data: updatedChild });
  } catch (err) {
    console.error("❌ Error updating child:", err);
    next(err);
  }
});

module.exports = router;
