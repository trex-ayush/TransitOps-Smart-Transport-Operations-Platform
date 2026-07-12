const express = require("express");
const { getFuelLogs, createFuelLog, deleteFuelLog } = require("../controllers/financeController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createFuelRules } = require("../validators/financeValidator");

const router = express.Router();

router.use(protect);
router.get("/", getFuelLogs);
router.post("/", createFuelRules, validate, createFuelLog);
router.delete("/:id", deleteFuelLog);

module.exports = router;
