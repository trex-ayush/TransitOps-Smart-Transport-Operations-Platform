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

// Public base URL of the deployed frontend. All links in emails must point
// here (never localhost), so it falls back to a sensible dev default only.
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

/**
 * Wrap body content in a responsive, branded HTML shell.
 * Uses table-based layout + inline styles for broad email-client support.
 */
const layout = ({ title, body, preheader = "" }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(15,42,74,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2a4a 0%,#1e5fa8 100%);padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                    <span style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;background-color:rgba(255,255,255,0.15);border-radius:8px;margin-right:10px;vertical-align:middle;">🚍</span>
                    TransitOps
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 40px;color:#1f2d3d;font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f6f8fb;border-top:1px solid #e6ebf1;color:#8a97a8;font-size:12px;line-height:1.6;">
              You're receiving this email because an account was created for you on TransitOps.<br />
              &copy; ${new Date().getFullYear()} TransitOps &middot; Smart Transport Operations Platform
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Primary call-to-action button (bulletproof-ish for most clients).
 */
const button = (label, url) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#1e5fa8 0%,#2f80ed 100%);">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

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

module.exports = { sendEmail, layout, button, CLIENT_URL };
