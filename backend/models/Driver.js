const mongoose = require("mongoose");

const STATUSES = ["Available", "On Trip", "Off Duty", "Suspended"];
const LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "Trailer"];

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    licenseCategory: { type: String, enum: LICENSE_CATEGORIES, required: true },
    licenseExpiry: { type: Date, required: true },
    contact: { type: String, trim: true },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    status: { type: String, enum: STATUSES, default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
module.exports.STATUSES = STATUSES;
module.exports.LICENSE_CATEGORIES = LICENSE_CATEGORIES;
