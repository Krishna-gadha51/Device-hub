const mongoose = require("mongoose");

const deviceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    allocatedQuantity: {
      type: Number,
      default: 0, // <--- Tracks how many units have been assigned so far
    },
    requiredLocation: {
      type: String,
      required: true,
    },
    requiredDate: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    adminNote: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Partially Allocated", "Rejected", "Allocated"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeviceRequest", deviceRequestSchema);