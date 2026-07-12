const express = require("express");
const {
  getMaintenance,
  createMaintenance,
  closeMaintenance,
} = require("../controllers/maintenanceController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createMaintenanceRules } = require("../validators/maintenanceValidator");

const router = express.Router();

router.use(protect);
router.get("/", getMaintenance);
router.post("/", createMaintenanceRules, validate, createMaintenance);
router.patch("/:id/close", closeMaintenance);

module.exports = router;
