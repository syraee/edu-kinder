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

export async function sendInvitationMail(to, token) {
    const invLink = `http://localhost:3000/registration?token=${token}`;

    const mailOptions = {
        from: `"EDUkinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Registracia pouzivatela",
        html: `
      <h2>Vitaj v EDUkinder!</h2>
      <p>Pre zaregistrovanie svojho účtu rodica klikni na tento odkaz:</p>
      <a href="${invLink}" target="_blank">Registračný formulár</a>
      <p>Ak si sa neregistroval ty, tento e-mail môžeš ignorovať.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendLoginMail(to, link) {

    const mailOptions = {
        from: `"EduKinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Prihlasenie do uctu",
        html: `
      <h3>Ahoj,</h3>
      <p>Klikni na tlačidlo nižšie pre prihlásenie do svojho účtu:</p>
      <a href="${link}" style="background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;"> Prihlásiť sa </a>
      <p>Platnosť linku vyprší o 15 minút.</p>
    `
    };

    await transporter.sendMail(mailOptions);
}