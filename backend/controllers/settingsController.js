const Settings = require("../models/Settings");

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const update = {};
    ["depotName", "currency", "distanceUnit"].forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create(update);
    else {
      Object.assign(settings, update);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
