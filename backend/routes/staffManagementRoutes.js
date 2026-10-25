const express = require("express");
const router = express.Router();
const {
  getAllStaff,
  addStaffMember,
  updateStaffMember,
  toggleStaffStatus,
  deleteStaffMember,
} = require("../controllers/staffManagementController");
const { protect } = require("../middleware/authMiddleware");

// Base: /api/staff-management

// Allow directory reading so allocation dropdowns and public staff lists load reliably
router.get("/", getAllStaff);

// Protected administrative actions
router.post("/", protect, addStaffMember);
router.put("/:id", protect, updateStaffMember);

// Supports both endpoints for frontend compatibility
router.patch("/:id/toggle-status", protect, toggleStaffStatus);
router.patch("/:id/status", protect, toggleStaffStatus);

router.delete("/:id", protect, deleteStaffMember);

module.exports = router;