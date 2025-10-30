const express = require("express");
const sendVerificationEmail = require("../utils/mailer.js").sendVerificationEmail;
const router = express.Router();

router.post("/send-mail", async (req, res) => {
    const { email, name } = req.body;

    try {
        const token = Math.random().toString(36).substring(2, 12);

        await sendVerificationEmail(email, token);

        res.status(200).json({ message: `Úspešne zaregistrovaný pouzivatel ${name}. Skontroluj e-mail pre overenie.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Nepodarilo sa zaregistrovať používateľa." });
    }
});

module.exports = router;