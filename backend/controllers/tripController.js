const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

const isLicenceExpired = (driver) => new Date(driver.licenseExpiry) < new Date();

const getTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const trips = await Trip.find(filter).populate("vehicle driver").sort("-createdAt");
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("vehicle driver");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance, revenue } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (vehicle.status !== "Available") return res.status(400).json({ message: `Vehicle is ${vehicle.status}, not available for dispatch` });
    if (driver.status === "Suspended") return res.status(400).json({ message: "Driver is suspended and cannot be assigned" });
    if (driver.status !== "Available") return res.status(400).json({ message: `Driver is ${driver.status}, not available` });
    if (isLicenceExpired(driver)) return res.status(400).json({ message: "Driver's licence has expired" });
    if (cargoWeight > vehicle.maxCapacity) return res.status(400).json({ message: `Cargo weight exceeds vehicle capacity (${vehicle.maxCapacity} kg)` });

    const trip = await Trip.create({
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      revenue: revenue || 0,
      status: "Draft",
    });
    res.status(201).json(await trip.populate("vehicle driver"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status !== "Draft") return res.status(400).json({ message: `Cannot dispatch a ${trip.status} trip` });

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);
    if (!vehicle || !driver) return res.status(404).json({ message: "Vehicle or driver no longer exists" });
    if (vehicle.status !== "Available") return res.status(400).json({ message: `Vehicle is ${vehicle.status}` });
    if (driver.status !== "Available") return res.status(400).json({ message: `Driver is ${driver.status}` });
    if (isLicenceExpired(driver)) return res.status(400).json({ message: "Driver's licence has expired" });

    vehicle.status = "On Trip";
    driver.status = "On Trip";
    trip.status = "Dispatched";
    await Promise.all([vehicle.save(), driver.save(), trip.save()]);
    res.json(await trip.populate("vehicle driver"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const completeTrip = async (req, res) => {
  try {
    const { finalOdometer, fuelConsumed } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status !== "Dispatched") return res.status(400).json({ message: `Cannot complete a ${trip.status} trip` });

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    trip.finalOdometer = finalOdometer;
    trip.fuelConsumed = fuelConsumed;
    trip.status = "Completed";

    if (vehicle) {
      vehicle.status = "Available";
      vehicle.odometer = finalOdometer;
      await vehicle.save();
    }
    if (driver) {
      driver.status = "Available";
      await driver.save();
    }
    await trip.save();
    res.json(await trip.populate("vehicle driver"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status === "Completed" || trip.status === "Cancelled") {
      return res.status(400).json({ message: `Cannot cancel a ${trip.status} trip` });
    }

    if (trip.status === "Dispatched") {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);
      if (vehicle) {
        vehicle.status = "Available";
        await vehicle.save();
      }
      if (driver) {
        driver.status = "Available";
        await driver.save();
      }
    }

    trip.status = "Cancelled";
    await trip.save();
    res.json(await trip.populate("vehicle driver"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip };
