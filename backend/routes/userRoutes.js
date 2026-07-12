const express = require("express");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createUserRules, updateUserRules } = require("../validators/userValidator");

const router = express.Router();

router.use(protect, authorize("Fleet Manager"));
router.get("/", getUsers);
router.post("/", createUserRules, validate, createUser);
router.put("/:id", updateUserRules, validate, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
