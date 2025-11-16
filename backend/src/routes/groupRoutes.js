const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

// GET /api/group - všetky triedy
router.get("/", async (req, res, next) => {
  try {
    const groups = await prisma.groupClass.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
});
//  POST /api/group – vytvorenie novej triedy
router.post("/", async (req, res, next) => {
  try {
    const { name, classLetter, classYear, teacherId, roomName } = req.body;

    if (!name || !classLetter || !classYear) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // DateTime musí byť v ISO formáte
    const yearDate = new Date(classYear);
    if (isNaN(yearDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format for classYear." });
    }

    const teacherIdInt = teacherId ? parseInt(teacherId, 10) : null;

    const newClass = await prisma.groupClass.create({
      data: {
        name,
        class: classLetter,
        classYear: yearDate,
        classTeacherId: teacherIdInt,
        roomName,
      },
    });

    res.status(201).json({
      success: true,
      message: "Trieda bola úspešne vytvorená ✅",
      data: newClass,
    });
  } catch (err) {
    console.error("❌ Chyba pri vytváraní triedy:", err);
    next(err);
  }
});

module.exports = router;
