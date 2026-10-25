const express = require("express");
const router = express.Router();
const {
  registerBulkDevices,
  getDevices,
  trackDeviceById,
  updateDevice,
  deleteDevice,
} = require("../controllers/deviceController");
const { protect } = require("../middleware/authMiddleware");

// Bulk registration route only (Single registration removed)
router.post("/bulk-register", protect, registerBulkDevices);
router.get("/", protect, getDevices);
router.get("/track/:id", protect, trackDeviceById);
router.put("/:id", protect, updateDevice);
router.delete("/:id", protect, deleteDevice);

module.exports = router;