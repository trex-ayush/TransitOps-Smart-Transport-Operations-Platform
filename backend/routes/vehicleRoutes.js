const express = require("express");
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createVehicleRules, updateVehicleRules } = require("../validators/vehicleValidator");

const router = express.Router();

router.use(protect);
router.get("/", getVehicles);
router.post("/", createVehicleRules, validate, createVehicle);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicleRules, validate, updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
