import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(to, token) {
    const verifyLink = `http://localhost:3000/registration`;

    const mailOptions = {
        from: `"EDUkinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Overenie e-mailu",
        html: `
      <h2>Vitaj v EDUkinder!</h2>
      <p>Pre overenie svojho účtu klikni na tento odkaz:</p>
      <a href="${verifyLink}" target="_blank">Registračný formulár</a>
      <p>Ak si sa neregistroval ty, tento e-mail môžeš ignorovať.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
}
