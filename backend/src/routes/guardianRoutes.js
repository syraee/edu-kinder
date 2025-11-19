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

// POST /api/guardian/assign – priradenie dieťaťa rodičovi
router.post("/assign", async (req, res, next) => {
  try {
    const { userId, childId, relationship } = req.body;

    if (!userId || !childId) {
      return res.status(400).json({ error: "Missing userId or childId" });
    }

    const link = await prisma.childGuardian.create({
      data: {
        userId: parseInt(userId, 10),
        childId: parseInt(childId, 10),
        relationship: relationship || "parent", // 🔹 default hodnota
      },
    });

    res.json({
      success: true,
      message: "Dieťa bolo priradené rodičovi.",
      data: link,
    });
  } catch (err) {
    console.error("❌ Chyba pri priraďovaní dieťaťa:", err);
    next(err);
  }
});
module.exports = router;