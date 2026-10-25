const express = require("express");
const router = express.Router();
const {
  createAllocation,
  getAllocations,
} = require("../controllers/allocationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createAllocation);
router.get("/", protect, getAllocations);

module.exports = router;