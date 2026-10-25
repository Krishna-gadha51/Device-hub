const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Computer Applications (MCA)",
    },
    designation: {
      type: String,
      default: "Assistant Professor",
    },
    role: {
      type: String,
      enum: ["Admin", "Staff", "admin", "staff"],
      default: "Staff",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "active", "inactive"],
      default: "Active",
    },
    staffId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);