const express = require("express");
const router = express.Router();
const eWasteController = require("../controllers/ewasteController");
const authMiddleware = require("../middleware/authMiddleware");

// Fallback checks to prevent undefined handler crashes
const protect = authMiddleware.protect || authMiddleware;
const getEWasteList = eWasteController.getEWasteList;
const assignToEWaste = eWasteController.assignToEWaste;
const updateDisposalStatus = eWasteController.updateDisposalStatus;

if (typeof getEWasteList !== "function") {
  console.error("CRITICAL ERROR: getEWasteList is not a function in eWasteController.js");
}
if (typeof assignToEWaste !== "function") {
  console.error("CRITICAL ERROR: assignToEWaste is not a function in eWasteController.js");
}
if (typeof updateDisposalStatus !== "function") {
  console.error("CRITICAL ERROR: updateDisposalStatus is not a function in eWasteController.js");
}
if (typeof protect !== "function") {
  console.error("CRITICAL ERROR: protect is not a function in authMiddleware.js");
}

// --------------------------------------------------
// E-WASTE API ENDPOINTS
// --------------------------------------------------
router.get("/", protect, getEWasteList);
router.post("/", protect, assignToEWaste);                     // Supports frontend POST /api/ewaste
router.post("/assign-unrepairable", protect, assignToEWaste);  // Supports maintenance workflow POST

router.put("/:id", protect, updateDisposalStatus);             // Supports frontend PUT /api/ewaste/:id
router.put("/:scrapId", protect, updateDisposalStatus);        // Supports alternate param name
router.patch("/:id/status", protect, updateDisposalStatus);    // Supports PATCH alternative

module.exports = router;