const Driver = require("../models/Driver");

const ALLOWED_FIELDS = ["name", "licenseNumber", "licenseCategory", "licenseExpiry", "contact", "safetyScore", "status"];

const pickFields = (body) => {
  const data = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
};

const getDrivers = async (req, res) => {
  try {
    const { status, licenseCategory } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (licenseCategory) filter.licenseCategory = licenseCategory;
    const drivers = await Driver.find(filter).sort("-createdAt");
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(pickFields(req.body));
    res.status(201).json(driver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "License number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "License number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Driver deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver };
