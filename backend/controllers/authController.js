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
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ user: sendUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
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

module.exports = { register, login, me, logout };
