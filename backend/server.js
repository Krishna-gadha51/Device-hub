const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/devices", require("./routes/deviceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/allocations", require("./routes/allocationRoutes"));
app.use("/api/device-requests", require("./routes/deviceRequestRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/ewaste", require("./routes/ewasteRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Admin Staff Directory Route

app.use("/api/staff-management", require("./routes/staffManagementRoutes"));


// Staff Portal Routes
app.use("/api/staff", require("./routes/staffRoutes"));

// Default Health Route
app.get("/", (req, res) => {
  res.send("DeviceHub Asset Management API is online.");
});

// --- ONE-TIME CLEANUP ENDPOINT TO WIPE PHANTOM / SEEDED DEVICES ---
app.get("/api/cleanup-devices", async (req, res) => {
  try {
    const Device = require("./models/Device");
    const countBefore = await Device.countDocuments();
    const result = await Device.deleteMany({});

    res.json({
      success: true,
      message: `Database purged! Deleted ${result.deletedCount} devices from MongoDB Atlas.`,
      countBefore,
      countAfter: await Device.countDocuments(),
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));