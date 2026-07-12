const express = require("express");
const { register, setupStatus, login, me, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/status", setupStatus);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);

module.exports = router;
