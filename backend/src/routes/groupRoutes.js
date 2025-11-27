const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");

// GET /api/group - všetky triedy
router.get("/", async (req, res, next) => {
  try {
    const groups = await prisma.groupClass.findMany({
      orderBy: { name: "asc" },
      include: {
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/group/:id – úprava triedy
router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid group ID" });
    }

    const { name, classLetter, classYear, roomName, teacherId } = req.body;

    const data = {};

    if (name !== undefined) data.name = name;
    if (classLetter !== undefined) data.class = classLetter;
    if (roomName !== undefined) data.roomName = roomName;

    if (classYear !== undefined && classYear !== "") {
      const yearNum = parseInt(classYear, 10);
      if (!isNaN(yearNum)) {
        data.classYear = new Date(yearNum, 8, 1); // 1.9.ROK
      } else {
        const d = new Date(classYear);
        if (isNaN(d.getTime())) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid classYear format" });
        }
        data.classYear = d;
      }
    }

    if (teacherId !== undefined) {
      if (teacherId === null) {
        data.classTeacherId = null;
      } else {
        const tid = parseInt(teacherId, 10);
        if (isNaN(tid)) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid teacherId" });
        }
        data.classTeacherId = tid;
      }
    }

    const updated = await prisma.groupClass.update({
      where: { id },
      data,
      include: {
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Chyba pri úprave triedy:", err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: "Trieda neexistuje" });
    }
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
