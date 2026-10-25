const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    note: { type: String, required: true },
    admin: { type: String, default: "College System Administrator" },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);