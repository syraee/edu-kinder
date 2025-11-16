const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

// GET /api/child
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

router.get("/", async (req, res, next) => {
    // #swagger.tags = ['Children']
    // #swaggers.summary = 'Get all children in kindergarten
    try{
        const children = await prisma.child.findMany();
        res.json({
            success: true,
            data: children
        })
    }catch (err) {
        next(err);
    }
})

router.post("/", async (req, res, next) => {
  // #swagger.tags = ['Children']
  // #swagger.summary = 'Create a new child'
  // #swagger.description = 'Creates a new child record in DB'

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


module.exports = router;