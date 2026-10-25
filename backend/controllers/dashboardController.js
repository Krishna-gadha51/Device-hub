const Device = require("../models/Device");
const Activity = require("../models/Activity");

// @desc    Get dashboard metrics, recent registrations, and activity logs
// @route   GET /api/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments();
    const availableDevices = await Device.countDocuments({ status: "Available" });
    const allocatedDevices = await Device.countDocuments({ status: "Allocated" });
    const maintenanceDevices = await Device.countDocuments({ status: "Under Maintenance" });
    const ewasteDevices = await Device.countDocuments({ status: "E-Waste" });

    const recentDevices = await Device.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("assetId deviceName model status location");

    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        total: totalDevices,
        available: availableDevices,
        allocated: allocatedDevices,
        maintenance: maintenanceDevices,
        ewaste: ewasteDevices,
      },
      recentDevices,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};