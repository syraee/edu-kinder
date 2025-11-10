const express = require("express");
const prisma = require("../../prisma/client");
const {generateToken, verifyToken} = require("../utils/jwt");
const {verify, sign} = require("jsonwebtoken");
const {sendInvitationMail, sendLoginMail} = require("../utils/mailer.js");
const authenticate = require("../middleware/authenticate.js");
const authorize = require("../middleware/authorizeRole.js");
const router = express.Router();


router.post("/register/request", authenticate, authorize(["Admin"]), async (req, res) => {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: "Zoznam emailov je prázdny alebo neplatný." });
    }

    const results = {
        sent: [],
        skipped: [],
        failed: []
    };

    for (const email of emails) {
        try {
            const existing = await prisma.user.findUnique({
                where: { email }
            });

            if (existing) {
                results.skipped.push({
                    email,
                    reason: "Už registrovaný používateľ"
                });
                continue;
            }

            const newUser = await prisma.user.create({
                data: {
                    email,
                    roleId: 3,
                    active: false,
                }
            });

            const token = generateToken(newUser.id, email, newUser.roleId, "registration", "3d" );

            await sendInvitationMail(email, token);
            results.sent.push(email);
        } catch (err) {
            console.error(`Nepodarilo sa odoslať pozvánku na ${email}:`, err);
            results.failed.push({
                email,
                reason: "Chyba pri odosielaní"
            });
        }
    }

    return res.status(200).json({
        message: "Spracovanie dokončené.",
        summary: {
            sent: results.sent.length,
            skipped: results.skipped.length,
            failed: results.failed.length
        },
        details: results
    });
});

router.get("/me", authenticate, (req, res) => {
  try {
    const u = req.user;
    if (!u?.id) return res.status(401).json({ user: null });

    const roleText =
      typeof u.role === "string"
        ? u.role
        : u.role?.name || u.role?.code || u.role?.type || u.roleId || "";

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      user: { id: u.id, email: u.email, role: roleText },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return res.status(500).json({ user: null, error: "Internal error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    path: "/",
    sameSite: "lax",
    secure: false,
    httpOnly: true,
  });
  return res.json({ ok: true });
});



router.post("/login/request", async (req, res) => {
    const { email} = req.body;
    console.log(email);
    if (!email) return res.status(400).json({ error: "Email je povinný" });

    const loginUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!loginUser) return res.status(404).json({ error: "Používateľ neexistuje" });

    const token = generateToken( loginUser.id, email, loginUser.roleId, "login", "15m");

    const link = `http://localhost:5000/api/auth/login/verify?token=${token}`;

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
            user.role.name,
            "access",
            "7d"
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // return res.json({
        //     message: "Prihlásenie úspešné.",
        //     user: {
        //         id: user.id,
        //         email: user.email,
        //         firstName: user.firstName,
        //         lastName: user.lastName,
        //         role: user.role
        //     }
        // });

        return res.redirect(303, "http://localhost:3000/");
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Neplatný alebo expirovaný token." });
    }
});

router.get("/register/verify", async (req, res) => {
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

router.get("/login/verify", async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send("Missing token");

        // over login-token, ktorý si poslal do e-mailu
        const { decoded, user } = await verifyToken(String(token), "login");

        // vydaj access token (alebo aj refresh ak budeš používať)
        const accessToken = generateToken(user.id, user.email, user.role, "access", "7d");

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",                     // pre top-level prechod z e-mailu je OK
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // presmeruj na FE domov (alebo kam chceš)
        return res.redirect(303, "http://localhost:3000/");
    } catch (err) {
        console.error("login/verify failed:", err);
        return res.status(401).send("Neplatný alebo expirovaný token.");
    }
});

module.exports = router;