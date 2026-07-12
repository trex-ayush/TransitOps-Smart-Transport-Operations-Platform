const mongoose = require("mongoose");

const STATUSES = ["Active", "Completed"];

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    serviceType: { type: String, required: true, trim: true },
    cost: { type: Number, default: 0, min: 0 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: STATUSES, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
module.exports.STATUSES = STATUSES;
