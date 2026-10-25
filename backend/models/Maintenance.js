const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    assetId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Computer Lab 1",
    },
    problemCategory: {
      type: String,
      default: "Display/Screen",
    },
    issueDescription: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
    },
    reportedBy: {
      type: String,
      default: "Prof. John Doe",
    },
    status: {
      type: String,
      enum: ["Reported", "Under Maintenance", "Resolved", "Unrepairable"],
      default: "Reported",
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    reportedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    technicianNotes: {
      type: String,
      default: "Awaiting Technician Inspection",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);