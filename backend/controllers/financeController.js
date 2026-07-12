const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");

const getFuelLogs = async (req, res) => {
  try {
    const { vehicle } = req.query;
    const filter = vehicle ? { vehicle } : {};
    const logs = await FuelLog.find(filter).populate("vehicle").sort("-date");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFuelLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, liters, cost, date } = req.body;
    if (!(await Vehicle.exists({ _id: vehicleId }))) return res.status(404).json({ message: "Vehicle not found" });
    const log = await FuelLog.create({ vehicle: vehicleId, liters, cost, date });
    res.status(201).json(await log.populate("vehicle"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Fuel log not found" });
    res.json({ message: "Fuel log deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { vehicle } = req.query;
    const filter = vehicle ? { vehicle } : {};
    const expenses = await Expense.find(filter).populate("vehicle").sort("-date");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { vehicle: vehicleId, type, amount, date } = req.body;
    if (!(await Vehicle.exists({ _id: vehicleId }))) return res.status(404).json({ message: "Vehicle not found" });
    const expense = await Expense.create({ vehicle: vehicleId, type, amount, date });
    res.status(201).json(await expense.populate("vehicle"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFuelLogs, createFuelLog, deleteFuelLog, getExpenses, createExpense, deleteExpense };
