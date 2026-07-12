const mongoose = require("mongoose");

const EXPENSE_TYPES = ["Toll", "Parking", "Permit", "Fine", "Other"];

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    type: { type: String, enum: EXPENSE_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
module.exports.EXPENSE_TYPES = EXPENSE_TYPES;
