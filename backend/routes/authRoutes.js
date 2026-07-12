const express = require("express");
const { register, setupStatus, login, me, logout, forgotPassword, resetPassword, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/status", setupStatus);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, me);
router.post("/logout", logout);
router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, changePassword);

module.exports = router;
