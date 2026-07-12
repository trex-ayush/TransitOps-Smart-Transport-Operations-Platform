const { body } = require("express-validator");
const { STATUSES } = require("../models/Vehicle");

const createVehicleRules = [
  body("regNumber").trim().notEmpty().withMessage("Registration number is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("type").trim().notEmpty().withMessage("Type is required"),
  body("maxCapacity").isFloat({ min: 0 }).withMessage("Max capacity must be a positive number").toFloat(),
  body("odometer").optional().isFloat({ min: 0 }).withMessage("Odometer must be a positive number").toFloat(),
  body("acquisitionCost").optional().isFloat({ min: 0 }).withMessage("Acquisition cost must be a positive number").toFloat(),
  body("status").optional().isIn(STATUSES).withMessage("Invalid status"),
  body("region").optional().trim(),
];

const updateVehicleRules = [
  body("regNumber").optional().trim().notEmpty().withMessage("Registration number cannot be empty"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("type").optional().trim().notEmpty().withMessage("Type cannot be empty"),
  body("maxCapacity").optional().isFloat({ min: 0 }).withMessage("Max capacity must be a positive number").toFloat(),
  body("odometer").optional().isFloat({ min: 0 }).toFloat(),
  body("acquisitionCost").optional().isFloat({ min: 0 }).toFloat(),
  body("status").optional().isIn(STATUSES).withMessage("Invalid status"),
  body("region").optional().trim(),
];

module.exports = { createVehicleRules, updateVehicleRules };
