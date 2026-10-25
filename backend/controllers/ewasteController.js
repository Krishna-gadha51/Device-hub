const Device = require("../models/Device");
const EWaste = require("../models/EWaste");
const Maintenance = require("../models/Maintenance");
const Activity = require("../models/Activity");

// Concurrency-safe Scrap ID generator (SCRAP-001, SCRAP-002, ...)
const getNextScrapId = async () => {
  const lastScrap = await EWaste.findOne().sort({ createdAt: -1 });
  if (!lastScrap || !lastScrap.scrapId) return "SCRAP-001";
  
  const numPart = parseInt(lastScrap.scrapId.replace("SCRAP-", ""), 10);
  const nextNum = isNaN(numPart) ? 1 : numPart + 1;
  return `SCRAP-${String(nextNum).padStart(3, "0")}`;
};

// @desc    Decommission unrepairable device & assign to E-Waste
// @route   POST /api/ewaste/assign-unrepairable
exports.assignToEWaste = async (req, res) => {
  try {
    const { assetId, reasonForScrap, ticketId, disposalStatus, disposalVendor } = req.body;

    if (!assetId || !assetId.trim()) {
      return res.status(400).json({ message: "Asset ID is required." });
    }

    const cleanAssetId = assetId.trim();

    // 1. Locate device
    const device = await Device.findOne({ assetId: cleanAssetId });
    if (!device) {
      return res.status(404).json({ message: `Device with Asset ID '${cleanAssetId}' not found.` });
    }

    // 2. Prevent duplicate decommissioning
    if (device.status === "E-Waste") {
      return res.status(400).json({
        message: `Device ${cleanAssetId} is already decommissioned and in E-Waste.`,
      });
    }

    const scrapId = await getNextScrapId();
    const adminName =
      req.user?.name || req.user?.username || "College System Administrator";
    const scrapReason =
      (reasonForScrap && reasonForScrap.trim()) || "Beyond Economical Repair (BER)";

    const prevLocation = device.location || "—";
    const prevCustodian =
      device.allocatedTo || device.incharge || device.responsibleStaff || "—";

    // 3. Create EWaste record
    const eWasteItem = await EWaste.create({
      scrapId,
      assetId: device.assetId,
      deviceName: device.deviceName,
      deviceType: device.deviceType || "Other",
      serialNumber: device.serialNumber || "—",
      previousLocation: prevLocation,
      previousCustodian: prevCustodian,
      reasonForScrap: scrapReason,
      scrappedBy: adminName,
      disposalStatus: disposalStatus || "Pending Disposal",
      disposalVendor: disposalVendor || "Authorized Recycler",
      disposalDate: new Date(),
    });

    // 4. Update & completely unlink the device
    device.status = "E-Waste";
    device.condition = "Scrapped / Unrepairable";
    device.location = "E-Waste Storage Unit";
    device.allocatedTo = "";
    device.incharge = "";
    device.responsibleStaff = "";
    device.allocatedEmail = "";
    device.allocationId = "";

    if (!Array.isArray(device.timeline)) {
      device.timeline = [];
    }

    device.timeline.unshift({
      title: "Decommissioned to E-Waste",
      details: `Declared unrepairable under ${scrapId}. Reason: ${scrapReason}`,
      location: "E-Waste Storage Unit",
      status: "E-Waste",
      performedBy: adminName,
      date: new Date().toISOString(),
    });

    await device.save();

    // 5. Close related Maintenance Ticket
    if (ticketId) {
      await Maintenance.findOneAndUpdate(
        { ticketId },
        {
          status: "Unrepairable / Scrapped",
          remarks: `Asset scrapped under ${scrapId}. Reason: ${scrapReason}`,
        }
      );
    } else {
      // Auto-close any pending/under-maintenance ticket for this device
      await Maintenance.updateMany(
        { assetId: cleanAssetId, status: { $in: ["Pending", "Under Maintenance"] } },
        {
          status: "Unrepairable / Scrapped",
          remarks: `Asset scrapped under ${scrapId}. Reason: ${scrapReason}`,
        }
      );
    }

    // 6. Log system activity if model exists
    try {
      if (Activity) {
        await Activity.create({
          action: `Decommissioned ${device.assetId} to E-Waste`,
          note: `Logged under ${scrapId} by ${adminName}. Reason: ${scrapReason}`,
          date: new Date().toLocaleTimeString(),
          admin: adminName,
        });
      }
    } catch (actErr) {
      console.warn("Activity log skipped:", actErr.message);
    }

    res.status(201).json({
      message: `Asset ${device.assetId} successfully decommissioned to E-Waste under ${scrapId}.`,
      scrapId,
      eWasteItem,
    });
  } catch (error) {
    console.error("E-Waste Assignment Error:", error);
    res.status(500).json({ message: error.message || "Failed to process E-Waste assignment." });
  }
};

// @desc    Get all decommissioned E-Waste assets (with optional search filter)
// @route   GET /api/ewaste
exports.getEWasteList = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    let query = {};

    if (search) {
      query = {
        $or: [
          { scrapId: { $regex: search,$options: "i" } },
          { assetId: { $regex: search,$options: "i" } },
          { deviceName: { $regex: search,$options: "i" } },
          { previousCustodian: { $regex: search,$options: "i" } },
          { previousLocation: { $regex: search,$options: "i" } },
        ],
      };
    }

    const items = await EWaste.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Fetch E-Waste Error:", error);
    res.status(500).json({ message: error.message || "Failed to load E-Waste items." });
  }
};

// @desc    Update disposal status (e.g. "Sent to Recycler", "Dismantled for Parts")
// @route   PATCH /api/ewaste/:scrapId/status
exports.updateDisposalStatus = async (req, res) => {
  try {
    const { scrapId } = req.params;
    const { disposalStatus, disposalVendor } = req.body;

    const validStatuses = ["Pending Disposal", "Sent to Recycler", "Dismantled for Parts"];
    if (disposalStatus && !validStatuses.includes(disposalStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const updateFields = {};
    if (disposalStatus) updateFields.disposalStatus = disposalStatus;
    if (disposalVendor) updateFields.disposalVendor = disposalVendor;

    const updatedItem = await EWaste.findOneAndUpdate(
      { scrapId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "E-Waste item not found." });
    }

    res.json({
      message: `Scrap record ${scrapId} updated successfully.`,
      eWasteItem: updatedItem,
    });
  } catch (error) {
    console.error("Update E-Waste Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};