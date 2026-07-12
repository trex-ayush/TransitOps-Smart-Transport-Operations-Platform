const nodemailer = require("nodemailer");

let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[email skipped - SMTP not configured] to=${to} subject="${subject}"`);
    return { skipped: true };
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || `TransitOps <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
