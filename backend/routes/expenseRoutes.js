const express = require("express");
const { getExpenses, createExpense, deleteExpense } = require("../controllers/financeController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createExpenseRules } = require("../validators/financeValidator");

const router = express.Router();

router.use(protect);
router.get("/", getExpenses);
router.post("/", createExpenseRules, validate, createExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
