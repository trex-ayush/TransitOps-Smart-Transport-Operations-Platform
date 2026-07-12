const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

const getMaintenance = async (req, res) => {
  try {
    const { status, vehicle } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vehicle) filter.vehicle = vehicle;
    const records = await Maintenance.find(filter).populate("vehicle").sort("-createdAt");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMaintenance = async (req, res) => {
  try {
    const { vehicle: vehicleId, serviceType, cost, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicle.status === "Retired") return res.status(400).json({ message: "Cannot service a retired vehicle" });
    if (vehicle.status === "On Trip") return res.status(400).json({ message: "Vehicle is on a trip; complete the trip first" });

    const record = await Maintenance.create({ vehicle: vehicleId, serviceType, cost: cost || 0, date });
    vehicle.status = "In Shop";
    await vehicle.save();

    res.status(201).json(await record.populate("vehicle"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const closeMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Maintenance record not found" });
    if (record.status === "Completed") return res.status(400).json({ message: "Maintenance is already completed" });

    record.status = "Completed";
    await record.save();

    const vehicle = await Vehicle.findById(record.vehicle);
    if (vehicle && vehicle.status !== "Retired") {
      vehicle.status = "Available";
      await vehicle.save();
    }

    res.json(await record.populate("vehicle"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getMaintenance, createMaintenance, closeMaintenance };
