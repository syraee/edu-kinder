const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.get("/payment-settings", /* authenticate, */ async (req, res, next) => {
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

router.post('/add-payment', async (req, res) => {
    const { feeType, amount, parentId, paidAt } = req.body;

    if (!feeType || !amount || !parentId) {
        return res.status(400).json({ message: 'Chýbajú povinné údaje (feeType, amount, parentId).' });
    }

    try {
        const payment = await prisma.payment.create({
            data: {
                feeType,
                amount,
                userId: parseInt(parentId),
                paidAt: new Date(paidAt),
            },
        });

        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Chyba pri ukladaní platby.' });
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
        where: {
            validFrom: { lte: now },
            validTo:   { gte: now },
        },
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


router.get("/my-meals-payments", authenticate, async (req, res) => {
    try {
        const userId = req.user?.id ?? req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, error: "Neautorizovaný prístup." });
        }

        const payments = await prisma.payment.findMany({
            where: {
                userId: Number(userId),
                feeType: "STRAVA",
            },
            orderBy: {
                paidAt: "desc",
            },
        });

        return res.json({ success: true, data: payments });
    } catch (err) {
        console.error("Error loading STRAVA payments:", err);
        return res.status(500).json({
            success: false,
            error: "Nepodarilo sa načítať platby za stravu.",
        });
    }
});




module.exports = router;