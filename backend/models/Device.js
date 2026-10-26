const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, required: true },
  location: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ["Available", "Allocated", "Under Maintenance", "E-Waste", "Reported"],
  },
  performedBy: { type: String, default: "College System Administrator" },
});

const deviceSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    deviceType: {
      type: String,
      required: true,
    },
    deviceName: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    department: {
      type: String,
      required: true,
      default: "Computer Applications (MCA)", // Default campus department
    },
    purchaseDate: { type: String, required: true },
    purchaseCost: { type: Number, required: true },
    vendor: { type: String, required: true },
    warrantyExpiry: { type: String, default: null },
    condition: {
      type: String,
      enum: ["New", "Good", "Fair", "Damaged", "Needs Repair", "Scrapped / Unrepairable", "Beyond Repair"],
      default: "New",
    },
    status: {
      type: String,
      enum: ["Available", "Allocated", "Under Maintenance", "E-Waste", "Reported"],
      default: "Available",
    },
    location: { type: String, default: "Not Allocated" },
    incharge: { type: String, default: "Unassigned" },
    allocationId: { type: String, default: "" },
    allocatedDate: { type: String, default: "" },
    responsibleStaff: { type: String, default: "" },
    // Use Mixed to allow any nested key/value specifications without casting errors
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    remarks: { type: String, default: "" },
    timeline: [timelineEventSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);