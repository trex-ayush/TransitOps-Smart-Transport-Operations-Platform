const express = require("express");
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createDriverRules, updateDriverRules } = require("../validators/driverValidator");

const router = express.Router();

router.use(protect);
router.get("/", getDrivers);
router.post("/", createDriverRules, validate, createDriver);
router.get("/:id", getDriver);
router.put("/:id", updateDriverRules, validate, updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
