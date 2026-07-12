const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail, layout, button, CLIENT_URL } = require("../utils/mailer");

const sanitize = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt });

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt");
    res.json(users.map(sanitize));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    let { password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });

    const generated = !password;
    if (!password) password = crypto.randomBytes(6).toString("base64url");

    const user = await User.create({ name, email, password, role });

    const loginUrl = `${CLIENT_URL}/login`;
    try {
      const body = `
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f2a4a;">Welcome aboard, ${name} 👋</h1>
        <p style="margin:0 0 20px;color:#54637a;">An account has been created for you on <b>TransitOps</b>. You can sign in with the credentials below.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;background-color:#f6f8fb;border:1px solid #e6ebf1;border-radius:10px;">
          <tr>
            <td style="padding:18px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1f2d3d;">
                <tr>
                  <td style="padding:6px 0;color:#8a97a8;width:150px;">Role</td>
                  <td style="padding:6px 0;font-weight:600;text-transform:capitalize;">${role}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#8a97a8;">Email</td>
                  <td style="padding:6px 0;font-weight:600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#8a97a8;">Temporary password</td>
                  <td style="padding:6px 0;">
                    <span style="display:inline-block;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#0f2a4a;background-color:#e7eefb;padding:4px 10px;border-radius:6px;letter-spacing:0.5px;">${password}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${button("Log in to TransitOps", loginUrl)}
        <p style="margin:20px 0 0;font-size:13px;color:#8a97a8;">For your security, please change your password after your first login. If the button above doesn't work, copy and paste this link into your browser:<br />
          <a href="${loginUrl}" style="color:#2f80ed;word-break:break-all;">${loginUrl}</a>
        </p>`;

      await sendEmail({
        to: email,
        subject: "Your TransitOps account is ready",
        text: `Hi ${name},\n\nAn account has been created for you on TransitOps as ${role}.\n\nEmail: ${email}\nTemporary password: ${password}\n\nLog in at ${loginUrl}\n\nFor your security, please change your password after your first login.\n\n— The TransitOps Team`,
        html: layout({
          title: "Your TransitOps account is ready",
          preheader: `Your TransitOps login and temporary password are inside.`,
          body,
        }),
      });
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr.message);
    }

    res.status(201).json({ user: sanitize(user), emailedPassword: generated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const update = {};
    if (req.body.role !== undefined) update.role = req.body.role;
    if (req.body.active !== undefined) update.active = req.body.active;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitize(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
