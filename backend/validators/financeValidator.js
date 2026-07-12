const { body } = require("express-validator");
const { EXPENSE_TYPES } = require("../models/Expense");

const createFuelRules = [
  body("vehicle").isMongoId().withMessage("A valid vehicle is required"),
  body("liters").isFloat({ min: 0 }).withMessage("Litres must be a positive number").toFloat(),
  body("cost").isFloat({ min: 0 }).withMessage("Cost must be a positive number").toFloat(),
  body("date").optional().isISO8601().withMessage("Invalid date").toDate(),
];

const createExpenseRules = [
  body("vehicle").isMongoId().withMessage("A valid vehicle is required"),
  body("type").isIn(EXPENSE_TYPES).withMessage("Invalid expense type"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number").toFloat(),
  body("date").optional().isISO8601().withMessage("Invalid date").toDate(),
];

module.exports = { createFuelRules, createExpenseRules };
