const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

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

    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
    try {
      await sendEmail({
        to: email,
        subject: "Your TransitOps account is ready",
        text: `Hi ${name}, an account has been created for you on TransitOps as ${role}. Email: ${email}, temporary password: ${password}. Log in at ${loginUrl}`,
        html: `<p>Hi ${name},</p>
          <p>An account has been created for you on <b>TransitOps</b> with the role <b>${role}</b>.</p>
          <p><b>Email:</b> ${email}<br/><b>Temporary password:</b> ${password}</p>
          <p><a href="${loginUrl}">Log in to TransitOps</a></p>`,
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
