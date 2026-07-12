const mongoose = require("mongoose");

const STATUSES = ["Available", "On Trip", "In Shop", "Retired"];

const vehicleSchema = new mongoose.Schema(
  {
    regNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    maxCapacity: { type: Number, required: true, min: 0 },
    odometer: { type: Number, default: 0, min: 0 },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: STATUSES, default: "Available" },
    region: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
module.exports.STATUSES = STATUSES;
