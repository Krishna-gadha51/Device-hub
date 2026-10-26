const mongoose = require("mongoose");

const eWasteSchema = new mongoose.Schema(
  {
    scrapId: {
      type: String,
      required: true,
      unique: true,
    },
    ewasteId: {
      type: String,
      default: function() { return this.scrapId; }
    },
    assetId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      default: "Other",
    },
    serialNumber: {
      type: String,
      default: "—",
    },
    previousLocation: {
      type: String,
      default: "—",
    },
    previousCustodian: {
      type: String,
      default: "—",
    },
    reasonForScrap: {
      type: String,
      required: true,
      default: "Beyond Economical Repair (BER)",
    },
    scrappedBy: {
      type: String,
      default: "College System Administrator",
    },
    disposalStatus: {
      type: String,
      enum: ["Pending Disposal", "Sent to Recycler", "Dismantled for Parts", "Sent for Recycling", "Disposed / Scrapped"],
      default: "Pending Disposal",
    },
    disposalVendor: {
      type: String,
      default: "—",
    },
    disposalDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.EWaste || mongoose.model("EWaste", eWasteSchema, "ewastes");