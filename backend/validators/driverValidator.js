const { body } = require("express-validator");
const { STATUSES, LICENSE_CATEGORIES } = require("../models/Driver");

const createDriverRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("licenseNumber").trim().notEmpty().withMessage("License number is required"),
  body("licenseCategory").isIn(LICENSE_CATEGORIES).withMessage("Invalid license category"),
  body("licenseExpiry").isISO8601().withMessage("Valid license expiry date is required").toDate(),
  body("contact").optional().trim(),
  body("safetyScore").optional().isInt({ min: 0, max: 100 }).withMessage("Safety score must be between 0 and 100").toInt(),
  body("status").optional().isIn(STATUSES).withMessage("Invalid status"),
];

const updateDriverRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("licenseNumber").optional().trim().notEmpty().withMessage("License number cannot be empty"),
  body("licenseCategory").optional().isIn(LICENSE_CATEGORIES).withMessage("Invalid license category"),
  body("licenseExpiry").optional().isISO8601().withMessage("Invalid license expiry date").toDate(),
  body("contact").optional().trim(),
  body("safetyScore").optional().isInt({ min: 0, max: 100 }).withMessage("Safety score must be between 0 and 100").toInt(),
  body("status").optional().isIn(STATUSES).withMessage("Invalid status"),
];

module.exports = { createDriverRules, updateDriverRules };
