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

module.exports = {
    transporter,
    sendInvitationMail,
    sendLoginMail,
};