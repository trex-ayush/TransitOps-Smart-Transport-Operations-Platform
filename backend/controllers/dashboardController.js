const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

const getKpis = async (req, res) => {
  try {
    const vehicleAgg = await Vehicle.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const vehicleStatus = { Available: 0, "On Trip": 0, "In Shop": 0, Retired: 0 };
    vehicleAgg.forEach(({ _id, count }) => {
      if (_id in vehicleStatus) vehicleStatus[_id] = count;
    });

    const totalVehicles = Object.values(vehicleStatus).reduce((a, b) => a + b, 0);
    const activeVehicles = totalVehicles - vehicleStatus.Retired;

    const [activeTrips, pendingTrips, driversOnDuty] = await Promise.all([
      Trip.countDocuments({ status: "Dispatched" }),
      Trip.countDocuments({ status: "Draft" }),
      Driver.countDocuments({ status: { $in: ["Available", "On Trip"] } }),
    ]);

    const fleetUtilization = activeVehicles ? Math.round((vehicleStatus["On Trip"] / activeVehicles) * 100) : 0;

    res.json({
      activeVehicles,
      availableVehicles: vehicleStatus.Available,
      inMaintenance: vehicleStatus["In Shop"],
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization,
      vehicleStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getKpis };
