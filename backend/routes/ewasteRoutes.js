const express = require("express");
const router = express.Router();
const eWasteController = require("../controllers/eWasteController");
const authMiddleware = require("../middleware/authMiddleware");

// Fallback checks to prevent undefined handler crashes
const protect = authMiddleware.protect || authMiddleware;
const getEWasteList = eWasteController.getEWasteList;
const assignToEWaste = eWasteController.assignToEWaste;

if (typeof getEWasteList !== "function") {
  console.error("CRITICAL ERROR: getEWasteList is not a function in eWasteController.js");
}
if (typeof assignToEWaste !== "function") {
  console.error("CRITICAL ERROR: assignToEWaste is not a function in eWasteController.js");
}
if (typeof protect !== "function") {
  console.error("CRITICAL ERROR: protect is not a function in authMiddleware.js");
}

router.get("/", protect, getEWasteList);
router.post("/assign-unrepairable", protect, assignToEWaste);

module.exports = router;