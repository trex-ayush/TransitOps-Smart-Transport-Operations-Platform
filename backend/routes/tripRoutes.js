const express = require("express");
const {
  getTrips,
  getTrip,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createTripRules, completeTripRules } = require("../validators/tripValidator");

const router = express.Router();

router.use(protect);
router.get("/", getTrips);
router.post("/", createTripRules, validate, createTrip);
router.get("/:id", getTrip);
router.patch("/:id/dispatch", dispatchTrip);
router.patch("/:id/complete", completeTripRules, validate, completeTrip);
router.patch("/:id/cancel", cancelTrip);

module.exports = router;
