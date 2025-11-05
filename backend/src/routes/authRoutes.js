const express = require("express");
const prisma = require("../../prisma/client");
const {generateToken, verifyToken} = require("../utils/jwt");
const {verify, sign} = require("jsonwebtoken");
const {sendInvitationMail, sendLoginMail} = require("../utils/mailer.js");
const router = express.Router();

router.post("/register/request", async (req, res) => {
    try {
        const { email} = req.body;

        // const newUser = await prisma.user.create({ data: {email, active: false} });

        const token = jwt.generateToken(9, email, "registration", "3d");

        await sendInvitationMail(email, token);

        res.status(200).json({ message: "Úspešne odoslany registracny mail" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Nepodarilo sa zaregistrovať používateľa." });
    }
});

router.post("/login/request", async (req, res) => {
    const { email} = req.body;

    if (!email) return res.status(400).json({ error: "Email je povinný" });

    const loginUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!loginUser) return res.status(404).json({ error: "Používateľ neexistuje" });

    const token = generateToken( loginUser.id, email, loginUser.roleId, "login", "15m");

    const link = `https://localhost:3000/login?token=${token}`;

    console.log(email);

    await sendLoginMail(email, link);

    return res.json({ message: "Na váš e-mail bol odoslaný prihlasovací odkaz." });
});

router.post("/login/verify", async (req, res) => {
    const { token } = req.body;

    try {
        const {decoded, user} = await verifyToken(token, "login")

        const accessToken = generateToken(
            user.id,
            user.email,
            user.role,
            "access",
            "7d"
        );

        return res.json({
            message: "Prihlásenie úspešné.",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Neplatný alebo expirovaný token." });
    }
});

router.get("/verify", async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = verify(token, process.env.JWT_SECRET);

        if (decoded.type !== "registration") {
            return res.status(400).json({ error: "Neplatný typ tokenu" });
        }

        res.json({ message: "Účet bol úspešne aktivovaný!" });
    } catch (err) {
        res.status(400).json({ error: "Neplatný alebo expirovaný token" });
    }
});

module.exports = router;