const Device = require("../models/Device");
const Maintenance = require("../models/Maintenance");

// @desc    Get aggregated statistics for administrative reports
// @route   GET /api/reports/analytics
exports.getReportAnalytics = async (req, res) => {
  try {
    const devices = await Device.find();
    const maintenanceTickets = await Maintenance.find();

    const totalAssets = devices.length;
    const allocatedInLabs = devices.filter((d) => d.status === "Allocated").length;
    const availableInPool = devices.filter((d) => d.status === "Available").length;
    const underMaintenance = devices.filter((d) => d.status === "Under Maintenance").length;
    const ewaste = devices.filter((d) => d.status === "E-Waste").length;

    // Total maintenance expenses
    const totalMaintenanceExpense = maintenanceTickets.reduce(
      (sum, ticket) => sum + (ticket.actualCost || 0),
      0
    );

    // Grouping by Device Type
    const typeCounts = {};
    devices.forEach((d) => {
      const type = d.deviceType || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Grouping by Location
    const locationCounts = {};
    devices.forEach((d) => {
      const loc = d.location || "Not Allocated";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    // Grouping by Brand
    const brandCounts = {};
    devices.forEach((d) => {
      const brand = d.brand || "Generic";
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    // Grouping by Condition
    const conditionCounts = {};
    devices.forEach((d) => {
      const cond = d.condition || "Good";
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
    });

    res.json({
      summary: {
        totalAssets,
        allocatedInLabs,
        availableInPool,
        underMaintenance,
        ewaste,
        totalMaintenanceExpense,
      },
      statusDistribution: {
        Available: availableInPool,
        Allocated: allocatedInLabs,
        "Under Maintenance": underMaintenance,
        "E-Waste": ewaste,
      },
      typeDistribution: typeCounts,
      locationDistribution: locationCounts,
      brandDistribution: brandCounts,
      conditionDistribution: conditionCounts,
      devices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};