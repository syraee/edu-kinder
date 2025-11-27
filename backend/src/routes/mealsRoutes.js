const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");
const { maskToMeals, mealsToMask } = require("../utils/meals");

const router = express.Router();

router.get("/attendance", authenticate, async (req, res, next) => {
  try {
    const { from, to, childIds } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: "Missing from/to" });
    }

    const fromDate = new Date(String(from));
    const toDate = new Date(String(to));

    const where = {
      date: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (childIds) {
      const ids = String(childIds)
        .split(",")
        .map((x) => parseInt(x, 10))
        .filter((x) => !isNaN(x));
      if (ids.length > 0) where.childId = { in: ids };
    }

    const rows = await prisma.mealAttendance.findMany({
      where,
      orderBy: [{ date: "asc" }, { childId: "asc" }],
    });

    const data = {};
    for (const row of rows) {
      const childKey = String(row.childId);
      const dateKey = row.date.toISOString().slice(0, 10);
      if (!data[childKey]) data[childKey] = {};
      data[childKey][dateKey] = maskToMeals(row.mask);
    }

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});


router.post("/attendance", authenticate, async (req, res, next) => {
  try {
    const { date, entries } = req.body;

    if (!date || !Array.isArray(entries)) {
      return res.status(400).json({ success: false, error: "Invalid body" });
    }

    const dateObj = new Date(String(date));

    const tx = entries.map((entry) => {
        const childId = parseInt(entry.childId, 10);
        const mask = mealsToMask(entry.meals);

        if (mask === 7) {
            return prisma.mealAttendance.deleteMany({
            where: {
                childId,
                date: dateObj,
            },
            });
        }

        return prisma.mealAttendance.upsert({
            where: {
            childId_date: { childId, date: dateObj },
            },
            update: { mask },
            create: { childId, date: dateObj, mask },
        });
    });
    if (!tx.length) {
      return res.status(400).json({ success: false, error: "No valid entries" });
    }

    await prisma.$transaction(tx);

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
