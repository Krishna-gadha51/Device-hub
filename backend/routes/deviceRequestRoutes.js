const express = require("express");
const router = express.Router();
const {
  getRequests,
  createRequest,
  updateRequestStatus,
  recordAllocation, // <--- Import new controller method
} = require("../controllers/deviceRequestController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getRequests);
router.post("/", protect, createRequest);
router.patch("/:id/status", protect, updateRequestStatus);
router.patch("/:id/allocate", protect, recordAllocation); // <--- Add this route

module.exports = router;