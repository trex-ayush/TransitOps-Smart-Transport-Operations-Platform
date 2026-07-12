const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

module.exports = { register, setupStatus, login, me, logout };
