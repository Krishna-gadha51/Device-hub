const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    allocationId: {
      type: String,
      required: true,
      unique: true,
    },
    allocationDate: {
      type: String,
      required: true,
    },
    destinationLocation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    allocatedTo: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      default: "Mixed Assets",
    },
    // Array of ObjectIds linking directly to the Device collection
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
    // Store original Asset IDs (e.g., AST-001, AST-002) for fast lookup
    allocatedDeviceIds: [
      {
        type: String,
      },
    ],
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Allocation", allocationSchema);