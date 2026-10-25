const express = require("express");
const router = express.Router();
const {
  getStaffDashboardSummary,
  getMyDevices,
  getMyRequests,
  submitDeviceRequest,
  reportProblem,
  getMaintenanceHistory,
} = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");

// Staff Dashboard & Metrics
router.get("/dashboard-summary", protect, getStaffDashboardSummary);

// Staff Assigned Devices
router.get("/my-devices", protect, getMyDevices);

// Staff Requisitions
router.get("/my-requests", protect, getMyRequests);
router.post("/request-device", protect, submitDeviceRequest);

// Staff Problem Reporting & Maintenance History
router.post("/report-problem", protect, reportProblem);
router.get("/maintenance-history", protect, getMaintenanceHistory);

module.exports = router;