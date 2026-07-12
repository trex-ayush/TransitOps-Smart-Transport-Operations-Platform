const { body } = require("express-validator");

const createMaintenanceRules = [
  body("vehicle").isMongoId().withMessage("A valid vehicle is required"),
  body("serviceType").trim().notEmpty().withMessage("Service type is required"),
  body("cost").optional().isFloat({ min: 0 }).withMessage("Cost must be a positive number").toFloat(),
  body("date").optional().isISO8601().withMessage("Invalid date").toDate(),
];

module.exports = { createMaintenanceRules };
