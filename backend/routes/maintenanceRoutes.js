const express = require("express");
const router = express.Router();
const {
  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceTicket,
} = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");

// GET all tickets & POST a new ticket
router.route("/")
  .get(protect, getMaintenanceTickets)
  .post(protect, createMaintenanceTicket);

// PUT to update status, repair costs, or condemn to E-Waste
router.route("/:id")
  .put(protect, updateMaintenanceTicket);

module.exports = router;