const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");
const PDFDocument = require("pdfkit");
const path = require("path");


const router = express.Router();

const STATE_PRESENT = 1;
const STATE_ABSENT = 2;
const STATE_SICK = 3;

const intToLabel = (state) => {
  if (state === STATE_PRESENT) return "PRESENT";
  if (state === STATE_ABSENT) return "ABSENT";
  return "SICK";
};

const cycleState = (current) => {
  if (current === STATE_PRESENT) return STATE_ABSENT;
  if (current === STATE_ABSENT) return STATE_SICK;
  return STATE_PRESENT;
};

const parseDate = (value) => {
  const d = new Date(String(value));
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseMonthRange = (value) => {
  const [y, m] = String(value).split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const to = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { from, to };
};

async function getTeacherClassWithChildren(userId) {
  return prisma.groupClass.findFirst({
    where: { classTeacherId: Number(userId) },
    include: { children: true },
  });
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Neautorizovaný prístup." });
    }

    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, error: "Missing date (YYYY-MM-DD)" });
    }

    const teacherClass = await getTeacherClassWithChildren(userId);

    if (!teacherClass) {
      return res.json({
        success: true,
        data: {
          date,
          groupName: null,
          children: [],
          attendance: {},
          logs: [],
        },
      });
    }

    const dateObj = parseDate(date);
    const children = teacherClass.children;
    const childIds = children.map((c) => c.id);

    if (!childIds.length) {
      return res.json({
        success: true,
        data: {
          date,
          groupName: teacherClass.name,
          children: [],
          attendance: {},
          logs: [],
        },
      });
    }

    const rows = await prisma.attendance.findMany({
      where: {
        childId: { in: childIds },
        date: dateObj,
      },
      orderBy: [{ childId: "asc" }],
    });

    const attendance = {};
    for (const row of rows) {
      attendance[String(row.childId)] = intToLabel(row.state);
    }

    const logsRows = await prisma.attendanceLog.findMany({
      where: {
        childId: { in: childIds },
        date: dateObj,
      },
      orderBy: { createdAt: "desc" },
      include: {
        child: true,
      },
    });

    const logs = logsRows.map((l) => ({
      id: l.id,
      timestamp: l.createdAt,
      childName: `${l.child.firstName} ${l.child.lastName}`,
      from: intToLabel(l.from),
      to: intToLabel(l.to),
      userEmail: l.userEmail,
    }));

    return res.json({
      success: true,
      data: {
        date,
        groupName: teacherClass.name,
        children: children.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
        })),
        attendance,
        logs,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? req.userId;
    const userEmail = req.user?.email ?? req.userEmail;

    if (!userId || !userEmail) {
      return res
        .status(401)
        .json({ success: false, error: "Neautorizovaný prístup." });
    }

    const { date, childId } = req.body;

    if (!date || !childId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing date or childId" });
    }

    const teacherClass = await getTeacherClassWithChildren(userId);
    if (!teacherClass) {
      return res.status(403).json({
        success: false,
        error: "Nemáte priradenú žiadnu triedu.",
      });
    }

    const childIdNum = Number(childId);

    const belongsToClass = teacherClass.children.some(
      (c) => c.id === childIdNum
    );
    if (!belongsToClass) {
      return res.status(403).json({
        success: false,
        error: "Nemôžete meniť dochádzku dieťaťa mimo vašej triedy.",
      });
    }

    const dateObj = parseDate(date);

    const existing = await prisma.attendance.findFirst({
      where: {
        childId: childIdNum,
        date: dateObj,
      },
    });

    const prevState = existing?.state ?? STATE_PRESENT;
    const nextState = cycleState(prevState);

    let attendanceRow;
    if (existing) {
      attendanceRow = await prisma.attendance.update({
        where: { id: existing.id },
        data: { state: nextState },
      });
    } else {
      attendanceRow = await prisma.attendance.create({
        data: {
          childId: childIdNum,
          date: dateObj,
          state: nextState,
        },
      });
    }

    const logRow = await prisma.attendanceLog.create({
      data: {
        childId: childIdNum,
        date: dateObj,
        from: prevState,
        to: nextState,
        userId: Number(userId),
        userEmail,
      },
      include: { child: true },
    });

    return res.json({
      success: true,
      data: {
        attendance: {
          childId: attendanceRow.childId,
          state: intToLabel(attendanceRow.state),
        },
        log: {
          id: logRow.id,
          timestamp: logRow.createdAt,
          childName: `${logRow.child.firstName} ${logRow.child.lastName}`,
          from: intToLabel(logRow.from),
          to: intToLabel(logRow.to),
          userEmail: logRow.userEmail,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/report", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Neautorizovaný prístup." });
    }

    const { month } = req.query;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, error: "Missing month (YYYY-MM)" });
    }

    const teacherClass = await getTeacherClassWithChildren(userId);
    if (!teacherClass) {
      return res.status(403).json({
        success: false,
        error: "Nemáte priradenú žiadnu triedu.",
      });
    }

    const { from, to } = parseMonthRange(month);
    const children = teacherClass.children;
    const childIds = children.map((c) => c.id);

    if (!childIds.length) {
      return res.json({
        success: true,
        data: {
          month,
          groupName: teacherClass.name,
          rows: [],
        },
      });
    }

    const rows = await prisma.attendance.findMany({
      where: {
        childId: { in: childIds },
        date: {
          gte: from,
          lt: to,
        },
      },
    });

    const stats = new Map();
    for (const child of children) {
      stats.set(child.id, { present: 0, absent: 0, sick: 0 });
    }

    for (const row of rows) {
      const s = stats.get(row.childId);
      if (!s) continue;
      if (row.state === STATE_PRESENT) s.present += 1;
      else if (row.state === STATE_ABSENT) s.absent += 1;
      else if (row.state === STATE_SICK) s.sick += 1;
    }

    const resultRows = children.map((c) => {
      const s = stats.get(c.id) ?? { present: 0, absent: 0, sick: 0 };
      return {
        childId: c.id,
        name: `${c.firstName} ${c.lastName}`,
        present: s.present,
        absent: s.absent,
        sick: s.sick,
      };
    });

    return res.json({
      success: true,
      data: {
        month,
        groupName: teacherClass.name,
        rows: resultRows,
      },
    });
  } catch (err) {
    next(err);
  }
});


router.get("/report/pdf", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Neautorizovaný prístup." });
    }

    const { month } = req.query;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, error: "Missing month (YYYY-MM)" });
    }

    const teacherClass = await getTeacherClassWithChildren(userId);
    if (!teacherClass) {
      return res.status(403).json({
        success: false,
        error: "Nemáte priradenú žiadnu triedu.",
      });
    }

    const { from, to } = parseMonthRange(month);
    const children = teacherClass.children;
    const childIds = children.map((c) => c.id);

    if (!childIds.length) {
      return res.status(400).json({
        success: false,
        error: "Trieda nemá žiadne deti.",
      });
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const dayKeyOf = (d) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    const rows = await prisma.attendance.findMany({
      where: {
        childId: { in: childIds },
        date: { gte: from, lt: to },
      },
      orderBy: [{ childId: "asc" }, { date: "asc" }],
    });

    const workingDays = [];
    const dayKeys = [];
    const cur = new Date(from);

    while (cur < to) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) {
        const dCopy = new Date(cur.getTime());
        workingDays.push(dCopy);
        dayKeys.push(dayKeyOf(dCopy));
      }
      cur.setDate(cur.getDate() + 1);
    }

    const childMap = new Map();
    for (const c of children) {
      const byDate = {};
      for (const key of dayKeys) byDate[key] = "p";
      childMap.set(c.id, {
        name: `${c.firstName} ${c.lastName}`,
        byDate,
      });
    }

    for (const row of rows) {
      const entry = childMap.get(row.childId);
      if (!entry) continue;

      const key = dayKeyOf(new Date(row.date));
      if (!entry.byDate.hasOwnProperty(key)) continue;

      if (row.state === STATE_PRESENT) entry.byDate[key] = "p";
      else if (row.state === STATE_ABSENT) entry.byDate[key] = "n";
      else if (row.state === STATE_SICK) entry.byDate[key] = "ch";
    }

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

    const fontPath = path.join(__dirname, "..", "..", "fonts", "DejaVuSans.ttf");
    doc.font(fontPath);

    const safeClassName = teacherClass.name || "trieda";
    const filename = `dochadzka_${month}_${safeClassName}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    doc.pipe(res);

    doc.fontSize(18).text(`Mesačný prehľad dochádzky`, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).text(`Trieda: ${teacherClass.name}`, { align: "center" });
    doc.text(`Mesiac: ${month}`, { align: "center" });
    doc.moveDown(1);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;
    let y = doc.y;

    const nameColWidth = 150;
    const daysCount = dayKeys.length || 1;
    const dayColWidth = (pageWidth - nameColWidth) / daysCount;
    const rowHeight = 18;

    const tableWidth = nameColWidth + dayColWidth * daysCount;

    const hLine = (yy) => {
      doc.moveTo(startX, yy).lineTo(startX + tableWidth, yy).stroke();
    };
    const vLine = (xx, y1, y2) => {
      doc.moveTo(xx, y1).lineTo(xx, y2).stroke();
    };

    doc.fontSize(9);

    hLine(y);
    doc.text("Meno a priezvisko", startX + 4, y + 4, {
      width: nameColWidth - 8,
    });

    dayKeys.forEach((key, idx) => {
      const dayNumber = Number(key.slice(8, 10));
      const x = startX + nameColWidth + idx * dayColWidth;
      doc.text(String(dayNumber), x, y + 4, {
        width: dayColWidth,
        align: "center",
      });
    });

    hLine(y + rowHeight);

    vLine(startX, y, y + rowHeight);
    vLine(startX + nameColWidth, y, y + rowHeight);
    for (let i = 0; i < daysCount; i++) {
      const x = startX + nameColWidth + (i + 1) * dayColWidth;
      vLine(x, y, y + rowHeight);
    }

    y += rowHeight;

    for (const c of children) {
      const entry = childMap.get(c.id);
      if (!entry) continue;

      doc.text(entry.name, startX + 4, y + 4, {
        width: nameColWidth - 8,
        ellipsis: true,
      });

      dayKeys.forEach((key, idx) => {
        const val = entry.byDate[key] || "";
        const x = startX + nameColWidth + idx * dayColWidth;
        doc.text(val, x, y + 4, {
          width: dayColWidth,
          align: "center",
        });
      });

      hLine(y + rowHeight);
      vLine(startX, y, y + rowHeight);
      vLine(startX + nameColWidth, y, y + rowHeight);
      for (let i = 0; i < daysCount; i++) {
        const x = startX + nameColWidth + (i + 1) * dayColWidth;
        vLine(x, y, y + rowHeight);
      }

      y += rowHeight;

      if (y > doc.page.height - doc.page.margins.bottom - 2 * rowHeight) {
        doc.addPage({ size: "A4", layout: "landscape" });
        doc.font(fontPath);
        y = doc.page.margins.top;
      }
    }

    y += 10;
    doc.fontSize(10).text("Legenda:", startX, y);
    doc.text("p = prítomný", startX, y + 14);
    doc.text("n = neprítomný", startX + 120, y + 14);
    doc.text("ch = chorý", startX + 260, y + 14);

    doc.end();
  } catch (err) {
    next(err);
  }
});





module.exports = router;
