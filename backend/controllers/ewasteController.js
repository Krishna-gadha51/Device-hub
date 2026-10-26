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
// @route   POST /api/ewaste
exports.assignToEWaste = async (req, res) => {
  try {
    const { assetId, reasonForScrap, decommissionReason, ticketId, disposalStatus, disposalVendor, recyclingVendor, remarks } = req.body;

    const targetAssetId = assetId;
    if (!targetAssetId || !targetAssetId.trim()) {
      return res.status(400).json({ message: "Asset ID is required." });
    }

    const cleanAssetId = targetAssetId.trim();

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
    const adminName = req.user?.name || req.user?.username || "College System Administrator";
    
    const scrapReason =
      (reasonForScrap && reasonForScrap.trim()) || 
      (decommissionReason && decommissionReason.trim()) || 
      (remarks && remarks.trim()) || 
      "Beyond Economical Repair (BER)";

    const prevLocation = device.location || "—";
    const prevCustodian = device.allocatedTo || device.incharge || device.responsibleStaff || "—";

    const resolvedVendor = disposalVendor || recyclingVendor || "GreenIndia Certified E-Waste Recyclers";
    const resolvedStatus = disposalStatus || "Pending Disposal";

    // 3. Create EWaste record
    const eWasteItem = await EWaste.create({
      scrapId,
      ewasteId: scrapId,
      assetId: device.assetId,
      deviceName: device.deviceName,
      deviceType: device.deviceType || "Other",
      serialNumber: device.serialNumber || "—",
      model: device.model || device.deviceModel || "Standard",
      previousLocation: prevLocation,
      previousCustodian: prevCustodian,
      reasonForScrap: scrapReason,
      scrappedBy: adminName,
      disposalStatus: resolvedStatus,
      disposalVendor: resolvedVendor,
      recyclingVendor: resolvedVendor,
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
      await Maintenance.updateMany(
        { assetId: cleanAssetId, status: { $in: ["Pending", "Under Maintenance", "Reported"] } },
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
          { scrapId: { $regex: search, $options: "i" } },
          { ewasteId: { $regex: search, $options: "i" } },
          { assetId: { $regex: search, $options: "i" } },
          { deviceName: { $regex: search, $options: "i" } },
          { previousCustodian: { $regex: search, $options: "i" } },
          { previousLocation: { $regex: search, $options: "i" } },
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

// @desc    Update disposal status, vendor, and certificate details
// @route   PUT /api/ewaste/:id
exports.updateDisposalStatus = async (req, res) => {
  try {
    const recordId = req.params.scrapId || req.params.id;
    const { disposalStatus, disposalVendor, recyclingVendor, certificateNumber } = req.body;

    const updateFields = {};
    if (disposalStatus) updateFields.disposalStatus = disposalStatus;
    if (disposalVendor || recyclingVendor) {
      updateFields.disposalVendor = disposalVendor || recyclingVendor;
      updateFields.recyclingVendor = disposalVendor || recyclingVendor;
    }
    if (certificateNumber !== undefined) updateFields.certificateNumber = certificateNumber;

    // Search by both scrapId or ewasteId to prevent 404 lookups
    const updatedItem = await EWaste.findOneAndUpdate(
      { $or: [{ scrapId: recordId }, { ewasteId: recordId }] },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: `E-Waste record '${recordId}' not found.` });
    }

    res.json({
      message: `Scrap record ${recordId} updated successfully.`,
      eWasteItem: updatedItem,
    });
  } catch (error) {
    console.error("Update E-Waste Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};