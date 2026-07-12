const { body } = require("express-validator");
const { ROLES } = require("../models/User");

const createUserRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("role").isIn(ROLES).withMessage("Invalid role"),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const updateUserRules = [
  body("role").optional().isIn(ROLES).withMessage("Invalid role"),
  body("active").optional().isBoolean().withMessage("Active must be true or false").toBoolean(),
];

module.exports = { createUserRules, updateUserRules };
