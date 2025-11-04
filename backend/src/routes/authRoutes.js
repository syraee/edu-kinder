const express = require("express");
const {user} = require("../../prisma/client");
const {generateRegistrationToken} = require("../utils/jwt");
const {verify} = require("jsonwebtoken");
const sendInvitationMail = require("../utils/mailer.js").sendInvitationMail;
const router = express.Router();

router.post("/send-inv-mail", async (req, res) => {
    try {
        const { email} = req.body;

        const newUser = await user.create({ data: {email, active: false} });

        const token = generateRegistrationToken(newUser.id, newUser.email);

        await sendInvitationMail(newUser.email, token);

        res.status(200).json({ message: "Úspešne odoslany registracny mail" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Nepodarilo sa zaregistrovať používateľa." });
    }
});

router.get("/verify", async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = verify(token, process.env.JWT_SECRET);

        if (decoded.type !== "registration") {
            return res.status(400).json({ error: "Neplatný typ tokenu" });
        }

        // await user.update({
        //     where: { id: decoded.user_id },
        //     data: { isActive: true },
        // });

        res.json({ message: "Účet bol úspešne aktivovaný!" });
    } catch (err) {
        res.status(400).json({ error: "Neplatný alebo expirovaný token" });
    }
});

module.exports = router;