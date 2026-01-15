const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");
const router = express.Router();
const { buildPayBySquareString } = require("../utils/qr-utils");

router.get("/payment-settings",  authenticate, async (req, res, next) => {
    try {
        const now = new Date();

        let current = await prisma.paymentSettings.findFirst({
            where: {
                validFrom: { lte: now },
                validTo:   { gte: now },
            },
            orderBy: {
                validFrom: "desc",
            },
        });

        if (!current) {
            current = await prisma.paymentSettings.findFirst({
                orderBy: { validFrom: "desc" },
            });
        }

        if (!current) {
            return res.status(404).json({
                success: false,
                error: "Nenašli sa žiadne nastavenia platieb.",
            });
        }

        return res.json({
            success: true,
            data: current,
        });
    } catch (err) {
        console.error("GET /api/payment-settings error:", err);
        return next(err);
    }
});

router.post('/add-payment', authenticate, async (req, res) => {
    try {
        const { childId, amount, feeType, paidAt } = req.body;

        if (!childId || !amount || !feeType || !paidAt) {
            return res.status(400).json({
                success: false,
                error: 'Chýbajú povinné údaje (childId, amount, feeType, paidAt).',
            });
        }

        const paidDate = new Date(paidAt);

        const payment = await prisma.payment.create({
            data: {
                childId: Number(childId),
                amount: Number(amount),
                feeType,
                paidAt: paidDate,
            },
        });

        if (feeType === 'STRAVA') {
            const year = paidDate.getFullYear();
            const month = paidDate.getMonth(); // 0–11
            const monthStart = new Date(year, month, 1);
            const monthEnd   = new Date(year, month + 1, 1);

            const statement = await prisma.mealMonthlyStatement.findUnique({
                where: {
                    childId_month: {
                        childId: Number(childId),
                        month: monthStart,
                    },
                },
            });

            if (statement) {

                const agg = await prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: {
                        childId: Number(childId),
                        feeType: 'STRAVA',
                        paidAt: {
                            gte: monthStart,
                            lt: monthEnd,
                        },
                    },
                });

                const sumPaid = Number(agg._sum.amount ?? 0);
                const totalToPay = Number(statement.totalToPay);

                let newStatus = 'UNPAID';
                if (sumPaid <= 0) {
                    newStatus = 'UNPAID';
                } else if (sumPaid < totalToPay) {
                    newStatus = 'PARTIAL';
                } else {
                    newStatus = 'PAID';
                }
                await prisma.mealMonthlyStatement.update({
                    where: { id: statement.id },
                    data: {
                        status: newStatus,
                        paidAt: sumPaid > 0 ? paidDate : null,
                    },
                });
            }
        }

        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: 'Chyba pri ukladaní platby.',
        });
    }
});




router.get('/change-logs', async (req, res) => {
    try {
        const logs = await prisma.changeLog.findMany({
            include: { user: true },
            orderBy: { changedAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: logs });  // 👈 data
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, error: 'Chyba pri načítavaní logov zmien.' }); // 👈 error
    }
});

router.post('/edit-payment-settings', authenticate, async (req, res) => {
    const userId = req.user?.id ?? req.userId;
    const { newSettings } = req.body;
    console.log(userId);
    const now = new Date();
    const currentSettings = await prisma.paymentSettings.findFirst({
        orderBy: {
            validFrom: "desc",
        },
    });
    if (!currentSettings) {
        return res.status(404).json({ message: 'Fixné hodnoty neexistujú.' });
    }
    const parsedValidFrom = new Date(newSettings.validFrom);
    if (isNaN(parsedValidFrom.getTime())) {
        return res.status(400).json({ error: "Invalid birthDate format." });
    }
    const parsedValidTo = new Date(newSettings.validTo);
    if (isNaN(parsedValidTo.getTime())) {
        return res.status(400).json({ error: "Invalid birthDate format." });
    }


    const oldValues = JSON.stringify({
        breakfastFee: currentSettings.breakfastFee,
        lunchFee: currentSettings.lunchFee,
        snackFee: currentSettings.snackFee,
        tuitionFee: currentSettings.tuitionFee,
        tuitionFeeExt: currentSettings.tuitionFeeExt,
        mealsIban: currentSettings.mealsIban,
        tuitionIban: currentSettings.tuitionIban,
        mealsVarSym: currentSettings.mealsVarSym,
        tuitionVarSym: currentSettings.tuitionVarSym,
        validFrom: currentSettings.validFrom,
        validTo: currentSettings.validTo,
    });

    const newValues = JSON.stringify({
        breakfastFee: newSettings.breakfastFee,
        lunchFee: newSettings.lunchFee,
        snackFee: newSettings.snackFee,
        tuitionFee: newSettings.tuitionFee,
        tuitionFeeExt: newSettings.tuitionFeeExt,
        mealsIban: newSettings.mealsIban,
        tuitionIban: newSettings.tuitionIban,
        mealsVarSym: newSettings.mealsVarSym,
        tuitionVarSym: newSettings.tuitionVarSym,
        validFrom: parsedValidFrom,
        validTo: parsedValidTo,
    });

    try {
        const createdSettings = await prisma.paymentSettings.create({
            data: {
                breakfastFee: newSettings.breakfastFee,
                lunchFee: newSettings.lunchFee,
                snackFee: newSettings.snackFee,
                tuitionFee: newSettings.tuitionFee,
                tuitionFeeExt: newSettings.tuitionFeeExt,
                mealsIban: newSettings.mealsIban,
                tuitionIban: newSettings.tuitionIban,
                mealsVarSym: newSettings.mealsVarSym,
                tuitionVarSym: newSettings.tuitionVarSym,
                validFrom: parsedValidFrom,
                validTo: parsedValidTo,
            },
        });

        await prisma.changeLog.create({
            data: {
                userId: userId,
                oldValues: oldValues,
                newValues: newValues,
                description: 'Aktualizácia všetkých fixných hodnôt',
            },
        });

        res.status(200).json({ success: true, data: createdSettings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Chyba pri aktualizácii fixných hodnôt.' });
    }
});

router.delete("/payments/:id", authenticate, async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.payment.delete({ where: { id } });

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Delete failed" });
    }
});


router.get("/my-meal-statements", authenticate, async (req, res, next) => {
    try {
        const userId = req.user?.id ?? req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, error: "Not authenticated" });
        }

        const guardians = await prisma.childGuardian.findMany({
            where: { userId: Number(userId) },
            select: { childId: true },
        });

        const childIds = guardians.map((g) => g.childId);
        if (childIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const statements = await prisma.mealMonthlyStatement.findMany({
            where: { childId: { in: childIds } },
            include: {
                child: true,
                paymentSettings: true,
            },
            orderBy: [{ childId: "asc" }, { month: "desc" }],
        });

        const data = statements.map((s) => {
            const fullName = `${s.child.firstName ?? ""} ${s.child.lastName ?? ""}`.trim();

            const d = new Date(s.month);
            const monthHuman = d.getMonth() + 1;
            const year = d.getFullYear();

            const recipientName = "Materská škola Upeješko";
            const iban = s.paymentSettings?.mealsIban ?? "";
            const vs = s.paymentSettings?.mealsVarSym ?? "";

            const note = `${fullName}-stravné`.trim().slice(0, 140);

            return {
                id: s.id,
                childId: s.childId,
                childName: fullName || `Dieťa #${s.childId}`,
                month: s.month.toISOString(),
                plannedDays: s.plannedDays,
                mealsAmount: s.mealsAmount,
                carryOverIn: s.carryOverIn,
                totalToPay: s.totalToPay,
                carryOverOut: s.carryOverOut,
                status: s.status,
                qrPayload: s.qrPayload,

                paymentDetails: {
                    recipientName,
                    iban,
                    vs,
                    amount: Number(s.totalToPay ?? 0),
                    note,
                },
            };
        });

        return res.json({ success: true, data });
    } catch (err) {
        console.error("my-meal-statements error:", err);
        next(err);
    }
});


function getPlannedDaysForChildInMonth(childStartDate, year, month) {

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const childStart = childStartDate
        ? (childStartDate instanceof Date ? childStartDate : new Date(childStartDate))
        : null;

    let count = 0;
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day === 0 || day === 6) continue;
        if (childStart && d < childStart) continue;
        count++;
    }
    return count;
}



router.delete("/meal-monthly-statements/all", async (req, res) => {
    try {
        const result = await prisma.mealMonthlyStatement.deleteMany({});
        return res.json({
            success: true,
            deletedCount: result.count,
        });
    } catch (err) {
        console.error("clear mealMonthlyStatement failed:", err);
        return res.status(500).json({
            success: false,
            error: "Delete failed",
        });
    }
});

router.get("/my-meals-payments", authenticate, async (req, res) => {
    try {
        const userId = req.user?.id ?? req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Neautorizovaný prístup." });
        }

        const guardians = await prisma.childGuardian.findMany({
            where: { userId: Number(userId) },
            select: { childId: true },
        });

        const childIds = guardians.map((g) => g.childId);
        if (childIds.length === 0) return res.json({ success: true, data: [] });

        const payments = await prisma.payment.findMany({
            where: {
                childId: { in: childIds },
                feeType: "STRAVA",
            },
            orderBy: { paidAt: "desc" },
            include: { child: true },
        });

        const data = payments.map((p) => {
            const childName = p.child
                ? `${p.child.firstName ?? ""} ${p.child.lastName ?? ""}`.trim() || `Dieťa #${p.childId}`
                : `Dieťa #${p.childId}`;

            return {
                id: p.id,
                childId: p.childId,
                childName,
                amount: p.amount,
                paidAt: p.paidAt.toISOString(),
            };
        });

        return res.json({ success: true, data });
    } catch (err) {
        console.error("Error loading STRAVA payments:", err);
        return res.status(500).json({ success: false, error: "Nepodarilo sa načítať platby za stravu." });
    }
});


router.delete("/payment-settings/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, error: "Neplatné ID." });
        }

        await prisma.paymentSettings.delete({
            where: { id },
        });

        return res.json({ success: true });
    } catch (err) {
        console.error("DELETE payment-settings failed:", err);
        return res
            .status(500)
            .json({ success: false, error: "Chyba pri mazaní nastavenia." });
    }
});


router.post("/generate-meals-statements", async (req, res) => {
    try {
        let { year, month } = req.body || {};
        const now = new Date();

        const targetYear = Number.isInteger(year) ? year : now.getFullYear();
        const targetMonthHuman = Number.isInteger(month)
            ? month
            : now.getMonth() + 1;

        if (
            !Number.isInteger(targetYear) ||
            !Number.isInteger(targetMonthHuman) ||
            targetMonthHuman < 1 ||
            targetMonthHuman > 12
        ) {
            return res
                .status(400)
                .json({ success: false, error: "Neplatný year / month." });
        }

        const targetMonth = targetMonthHuman - 1; // 0–11
        const monthStart = new Date(targetYear, targetMonth, 1);
        const monthEnd = new Date(targetYear, targetMonth + 1, 1);


        const settings = await prisma.paymentSettings.findFirst({
            where: {
                validFrom: { lt: monthEnd },
                OR: [
                    { validTo: null },
                    { validTo: { gte: monthStart } },
                ],
            },
            orderBy: { validFrom: "desc" },
        });

        if (!settings) {
            return res.status(400).json({
                success: false,
                error: "Nie sú nastavené ceny stravy (PaymentSettings) pre daný mesiac.",
            });
        }

        const breakfastFee = Number(settings.breakfastFee ?? 0);
        const lunchFee = Number(settings.lunchFee ?? 0);
        const snackFee = Number(settings.snackFee ?? 0);
        const dayPrice = breakfastFee + lunchFee + snackFee;

        const children = await prisma.child.findMany({
            orderBy: { id: "asc" },
        });

        const results = [];

        for (const child of children) {
            const plannedDays = getPlannedDaysForChildInMonth(
                child.startDate,
                targetYear,
                targetMonth
            );

            const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;
            const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
            const prevMonthStart = new Date(prevYear, prevMonth, 1);

            const prevStatement = await prisma.mealMonthlyStatement.findUnique({
                where: {
                    childId_month: {
                        childId: child.id,
                        month: prevMonthStart,
                    },
                },
            });

            const carryOverIn = prevStatement
                ? Number(prevStatement.carryOverOut ?? 0)
                : 0;

            const mealsAmount = plannedDays * dayPrice;
            const totalToPay = mealsAmount - carryOverIn;

            const childName = `${child.firstName ?? ""} ${child.lastName ?? ""}`.trim();

            const qrPayload = await buildPayBySquareString({
                iban: settings.mealsIban,
                amount: totalToPay,
                vs: settings.mealsVarSym,
                childName,
                recipientName: "Materská škola Upeješko",
            });

            const statement = await prisma.mealMonthlyStatement.upsert({
                where: {
                    childId_month: {
                        childId: child.id,
                        month: monthStart,
                    },
                },
                create: {
                    childId: child.id,
                    month: monthStart,
                    plannedDays,
                    breakfastCount: 0,
                    lunchCount: 0,
                    snackCount: 0,
                    mealsAmount,
                    carryOverIn,
                    totalToPay,
                    carryOverOut: 0,
                    status: "UNPAID",
                    paymentSettingsId: settings.id,
                    qrPayload,
                },
                update: {
                    plannedDays,
                    mealsAmount,
                    carryOverIn,
                    totalToPay,
                    paymentSettingsId: settings.id,
                    qrPayload,
                },
            });

            results.push(statement);
        }

        return res.json({ success: true, data: results });
    } catch (err) {
        console.error("generate-meals-statements failed:", err);
        return res.status(500).json({
            success: false,
            error: "Chyba pri generovaní mesačných predpisov za stravu.",
        });
    }
});


router.post("/close-meals-month", async (req, res) => {
    try {
        let { year, month } = req.body || {};

        const now = new Date();


        const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const defaultMonthHuman = now.getMonth() === 0 ? 12 : now.getMonth(); // 1–12

        const targetYear = Number.isInteger(year) ? year : defaultYear;
        const targetMonthHuman = Number.isInteger(month)
            ? month
            : defaultMonthHuman;

        if (
            !Number.isInteger(targetYear) ||
            !Number.isInteger(targetMonthHuman) ||
            targetMonthHuman < 1 ||
            targetMonthHuman > 12
        ) {
            return res
                .status(400)
                .json({ success: false, error: "Neplatný year / month." });
        }

        const targetMonth = targetMonthHuman - 1;
        const monthStart = new Date(targetYear, targetMonth, 1);
        const monthEnd = new Date(targetYear, targetMonth + 1, 1);


        const statements = await prisma.mealMonthlyStatement.findMany({
            where: { month: monthStart },
            include: {
                child: true,
                paymentSettings: true,
            },
        });

        if (statements.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: "Žiadne predpisy na uzavretie pre daný mesiac.",
            });
        }

        const updated = [];

        for (const stmt of statements) {
            const attendances = await prisma.mealAttendance.findMany({
                where: {
                    childId: stmt.childId,
                    date: {
                        gte: monthStart,
                        lt: monthEnd,
                    },
                },
            });

            const plannedDays = stmt.plannedDays;

            let missedBreakfast = 0;
            let missedLunch = 0;
            let missedSnack = 0;

            for (const a of attendances) {

                const mask = a.mask ?? 7;

                if ((mask & 4) === 0) missedBreakfast++;
                if ((mask & 2) === 0) missedLunch++;
                if ((mask & 1) === 0) missedSnack++;
            }

            let breakfastFee = 0;
            let lunchFee = 0;
            let snackFee = 0;

            if (stmt.paymentSettings) {
                breakfastFee = Number(stmt.paymentSettings.breakfastFee ?? 0);
                lunchFee = Number(stmt.paymentSettings.lunchFee ?? 0);
                snackFee = Number(stmt.paymentSettings.snackFee ?? 0);
            } else if (stmt.paymentSettingsId) {
                const s2 = await prisma.paymentSettings.findUnique({
                    where: { id: stmt.paymentSettingsId },
                });
                breakfastFee = Number(s2?.breakfastFee ?? 0);
                lunchFee = Number(s2?.lunchFee ?? 0);
                snackFee = Number(s2?.snackFee ?? 0);
            }

            const breakfastCount = plannedDays - missedBreakfast;
            const lunchCount = plannedDays - missedLunch;
            const snackCount = plannedDays - missedSnack;

            const carryOverOut =
                missedBreakfast * breakfastFee +
                missedLunch * lunchFee +
                missedSnack * snackFee;

            const updatedStmt = await prisma.mealMonthlyStatement.update({
                where: { id: stmt.id },
                data: {
                    breakfastCount,
                    lunchCount,
                    snackCount,
                    carryOverOut,
                },
            });

            updated.push(updatedStmt);
        }

        return res.json({ success: true, data: updated });
    } catch (err) {
        console.error("close-meals-month failed:", err);
        return res.status(500).json({
            success: false,
            error: "Chyba pri uzatváraní mesiaca (výpočet preplatkov).",
        });
    }
});


router.get("/my-meal-statements", authenticate, async (req, res, next) => {
    try {
        const userId = req.user?.id ?? req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, error: "Not authenticated" });
        }


        const guardians = await prisma.childGuardian.findMany({
            where: { userId: Number(userId) },
            select: { childId: true },
        });

        const childIds = guardians.map((g) => g.childId);
        if (childIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const statements = await prisma.mealMonthlyStatement.findMany({
            where: { childId: { in: childIds } },
            include: { child: true },
            orderBy: [{ childId: "asc" }, { month: "desc" }],
        });

        const data = statements.map((s) => {
            const fullName = `${s.child.firstName ?? ""} ${
                s.child.lastName ?? ""
            }`.trim();
            return {
                id: s.id,
                childId: s.childId,
                childName: fullName || `Dieťa #${s.childId}`,
                month: s.month.toISOString(),
                plannedDays: s.plannedDays,
                mealsAmount: s.mealsAmount,
                carryOverIn: s.carryOverIn,
                totalToPay: s.totalToPay,
                carryOverOut: s.carryOverOut,
                status: s.status,
                qrPayload: s.qrPayload,
            };
        });

        return res.json({ success: true, data });
    } catch (err) {
        console.error("my-meal-statements error:", err);
        next(err);
    }
});

module.exports = router;