const { body } = require("express-validator");

const createTripRules = [
  body("source").trim().notEmpty().withMessage("Source is required"),
  body("destination").trim().notEmpty().withMessage("Destination is required"),
  body("vehicle").isMongoId().withMessage("A valid vehicle is required"),
  body("driver").isMongoId().withMessage("A valid driver is required"),
  body("cargoWeight").isFloat({ min: 0 }).withMessage("Cargo weight must be a positive number").toFloat(),
  body("plannedDistance").isFloat({ min: 0 }).withMessage("Planned distance must be a positive number").toFloat(),
  body("revenue").optional().isFloat({ min: 0 }).withMessage("Revenue must be a positive number").toFloat(),
];

const completeTripRules = [
  body("finalOdometer").isFloat({ min: 0 }).withMessage("Final odometer is required").toFloat(),
  body("fuelConsumed").isFloat({ min: 0 }).withMessage("Fuel consumed is required").toFloat(),
];

module.exports = { createTripRules, completeTripRules };
