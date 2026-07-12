const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");

const getReports = async (req, res) => {
  try {
    const [vehicles, trips, fuel, maintenance, expenses] = await Promise.all([
      Vehicle.find(),
      Trip.find(),
      FuelLog.find(),
      Maintenance.find(),
      Expense.find(),
    ]);

    const byVehicle = {};
    vehicles.forEach((v) => {
      byVehicle[v._id] = {
        name: v.name,
        regNumber: v.regNumber,
        acquisitionCost: v.acquisitionCost,
        revenue: 0,
        distance: 0,
        fuel: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        expenseCost: 0,
      };
    });

    const completedTrips = trips.filter((t) => t.status === "Completed");
    completedTrips.forEach((t) => {
      const r = byVehicle[t.vehicle];
      if (!r) return;
      r.revenue += t.revenue || 0;
      r.distance += t.plannedDistance || 0;
      r.fuel += t.fuelConsumed || 0;
    });
    fuel.forEach((f) => {
      if (byVehicle[f.vehicle]) byVehicle[f.vehicle].fuelCost += f.cost || 0;
    });
    maintenance.forEach((m) => {
      if (byVehicle[m.vehicle]) byVehicle[m.vehicle].maintenanceCost += m.cost || 0;
    });
    expenses.forEach((e) => {
      if (byVehicle[e.vehicle]) byVehicle[e.vehicle].expenseCost += e.amount || 0;
    });

    const vehicleReports = Object.values(byVehicle).map((r) => {
      const operationalCost = r.fuelCost + r.maintenanceCost + r.expenseCost;
      const roi = r.acquisitionCost
        ? Math.round(((r.revenue - (r.maintenanceCost + r.fuelCost)) / r.acquisitionCost) * 100)
        : 0;
      const fuelEfficiency = r.fuel ? +(r.distance / r.fuel).toFixed(1) : 0;
      return { ...r, operationalCost, roi, fuelEfficiency };
    });

    const totalDistance = vehicleReports.reduce((s, r) => s + r.distance, 0);
    const totalFuel = vehicleReports.reduce((s, r) => s + r.fuel, 0);
    const totalRevenue = vehicleReports.reduce((s, r) => s + r.revenue, 0);
    const totalAcquisition = vehicleReports.reduce((s, r) => s + r.acquisitionCost, 0);
    const operationalCost = vehicleReports.reduce((s, r) => s + r.operationalCost, 0);

    const fuelEfficiency = totalFuel ? +(totalDistance / totalFuel).toFixed(1) : 0;
    const avgRoi = totalAcquisition ? Math.round(((totalRevenue - operationalCost) / totalAcquisition) * 100) : 0;

    const activeVehicles = vehicles.filter((v) => v.status !== "Retired").length;
    const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
    const fleetUtilization = activeVehicles ? Math.round((onTrip / activeVehicles) * 100) : 0;

    const monthly = {};
    completedTrips.forEach((t) => {
      const month = new Date(t.updatedAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthly[month] = (monthly[month] || 0) + (t.revenue || 0);
    });
    const monthlyRevenue = Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));

    const topCostliestVehicles = [...vehicleReports]
      .sort((a, b) => b.operationalCost - a.operationalCost)
      .slice(0, 5)
      .map((r) => ({ name: r.name, cost: r.operationalCost }));

    res.json({
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      avgRoi,
      totalRevenue,
      monthlyRevenue,
      topCostliestVehicles,
      vehicleReports,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReports };
