const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, authorize("Fleet Manager"), updateSettings);

module.exports = router;
