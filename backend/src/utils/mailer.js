require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendInvitationMail(to, token) {
    const invLink = `http://localhost:3000/registration?token=${token}`;

    const mailOptions = {
        from: `"EDUkinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Vitaj v EDUkinder! Dokonči registráciu svojho účtu",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F5; padding: 40px 0; text-align: center;">
              <div style="background-color: #FFFFFF; max-width: 500px; margin: auto; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #0053A6; margin-bottom: 10px;">Vitaj v EDUkinder!</h2>
                <p style="color: #333; font-size: 15px; line-height: 1.6;">
                  Teší nás, že sa chceš pridať k našej komunite rodičov a detí.
                </p>
                <p style="color: #333; font-size: 15px; line-height: 1.6;">
                  Pre dokončenie registrácie klikni na tlačidlo nižšie:
                </p>
                <p style="margin: 25px 0;">
                  <a href="${invLink}" target="_blank"
                     style="background-color: #0053A6; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 6px; font-weight: 600; 
                            display: inline-block;">
                    Dokončiť registráciu
                  </a>
                </p>
                <p style="color: #666; font-size: 13px; margin-top: 30px;">
                  Ak si o tento e-mail nežiadal(a), môžeš ho pokojne ignorovať.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999;">
                  Tento e-mail bol odoslaný automaticky. Prosím, neodpovedaj naň.
                </p>
              </div>
            </div>`
    };



    await transporter.sendMail(mailOptions);
}

async function sendLoginMail(to, link) {

    const mailOptions = {
        from: `"EDUkinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Prihlásenie do tvojho EDUkinder účtu",
        html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F5; padding: 40px 0; text-align: center;">
      <div style="background-color: #FFFFFF; max-width: 500px; margin: auto; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #0053A6; margin-bottom: 10px;">Prihlásenie do účtu</h2>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Ahoj! Pre prihlásenie do svojho účtu klikni na tlačidlo nižšie.
        </p>
        <p style="margin: 25px 0;">
          <a href="${link}" target="_blank"
             style="background-color: #0053A6; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; font-weight: 600;
                    display: inline-block;">
            Prihlásiť sa
          </a>
        </p>
        <p style="color: #666; font-size: 13px; line-height: 1.6;">
          Platnosť tohto odkazu vyprší o <strong>15 minút</strong>. Ak si o tento e-mail nežiadal(a), jednoducho ho ignoruj.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          Tento e-mail bol odoslaný automaticky. Prosím, neodpovedaj naň.
        </p>
      </div>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
}

function escapeHtml(input) {
    return String(input)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function sendNewMessageEmail(to, senderName, preview) {
    const safeSender = escapeHtml(senderName || "Používateľ");
    const safePreview = escapeHtml(preview || "");
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const chatUrl = `${appUrl}/chat`;

    const mailOptions = {
        from: `"EDUkinder" <${process.env.SMTP_USER}>`,
        to,
        subject: "Máte novú správu",
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F5; padding: 40px 12px; text-align: center;">
        <div style="background-color: #FFFFFF; max-width: 520px; margin: auto; padding: 28px 34px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); text-align: left;">
          
          <h2 style="color: #0053A6; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">
            Máte novú správu
          </h2>

          <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
            Od používateľa: <b>${safeSender}</b>
          </p>

          <div style="background: #F3F5F7; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; margin: 0 0 18px 0;">
            <div style="color: #111; font-size: 14px; line-height: 1.55; white-space: pre-wrap;">
              ${safePreview}${safePreview.length >= 120 ? "…" : ""}
            </div>
          </div>

          <div style="text-align: center; margin-top: 8px;">
            <a href="${chatUrl}"
               style="display: inline-block; background: #0053A6; color: #FFFFFF; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;">
              Pozrieť chat
            </a>
          </div>

          <p style="color: #6B7280; font-size: 12px; line-height: 1.5; margin: 18px 0 0 0;">
            Ak ste túto správu neočakávali, ignorujte tento e-mail.
          </p>

        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}


module.exports = {
    transporter,
    sendInvitationMail,
    sendLoginMail,
    sendNewMessageEmail
};