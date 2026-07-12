const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if ((await User.countDocuments()) > 0) {
      return res.status(403).json({ message: "Registration is closed. Ask your administrator to create an account." });
    }
    const user = await User.create({ name, email, password, role: "Fleet Manager" });
    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ user: sendUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setupStatus = async (req, res) => {
  const count = await User.countDocuments();
  res.json({ setupNeeded: count === 0 });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.active) {
      return res.status(403).json({ message: "Your account is inactive. Contact your administrator." });
    }
    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.json({ user: sendUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const me = (req, res) => {
  res.json({ user: sendUser(req.user) });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
      try {
        await sendEmail({
          to: email,
          subject: "Reset your TransitOps password",
          text: `Reset your password using this link (valid 30 minutes): ${resetUrl}`,
          html: `<p>You requested a password reset for <b>TransitOps</b>.</p>
            <p><a href="${resetUrl}">Reset your password</a> — this link is valid for 30 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>`,
        });
      } catch (mailErr) {
        console.error("Failed to send reset email:", mailErr.message);
      }
    }
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Reset link is invalid or has expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true, runValidators: true });
    res.json({ user: sendUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, setupStatus, login, me, logout, forgotPassword, resetPassword, updateProfile, changePassword };
