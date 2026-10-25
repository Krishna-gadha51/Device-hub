const Device = require("../models/Device");
const Activity = require("../models/Activity");

// Helper: Format audit trail date
const formatActivityDate = () => {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// @desc    Register devices in bulk
// @route   POST /api/devices/bulk-register
exports.registerBulkDevices = async (req, res) => {
  try {
    const {
      items,
      deviceType,
      brand,
      model,
      condition,
      purchaseDate,
      purchaseCost,
      cost,
      vendor,
      warrantyExpiry,
      specifications,
      remarks,
      location,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided for bulk registration." });
    }

    const serialList = items.map((i) => i.serialNumber?.trim()).filter(Boolean);
    const uniqueSerials = new Set(serialList);
    if (uniqueSerials.size !== serialList.length) {
      return res.status(400).json({
        message: "Duplicate serial numbers found in your submitted list. Each serial number must be unique.",
      });
    }

    const existingDevices = await Device.find({
      serialNumber: { $in: serialList },
    }).select("serialNumber assetId");

    if (existingDevices.length > 0) {
      const duplicates = existingDevices.map((d) => `${d.serialNumber} (Asset: ${d.assetId})`).join(", ");
      return res.status(400).json({
        message: `The following serial numbers are already registered in the system: ${duplicates}`,
      });
    }

    const devices = await Device.find({}, { assetId: 1 }).lean();
    let maxNum = 0;
    devices.forEach((d) => {
      if (d.assetId && d.assetId.startsWith("AST-")) {
        const parsed = parseInt(d.assetId.replace("AST-", ""), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    });

    const numericCost = Number(purchaseCost || cost) || 0;
    const assignedLocation = location || "Not Allocated";

    const devicesToInsert = items.map((item, index) => {
      const assetId = `AST-${String(maxNum + index + 1).padStart(3, "0")}`;
      return {
        assetId,
        deviceType: deviceType || item.type || "Desktop",
        deviceName: item.deviceName,
        brand: brand || item.brand,
        model: model || item.model,
        serialNumber: item.serialNumber.trim(),
        condition: condition || "New",
        purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
        purchaseCost: numericCost,
        cost: numericCost,
        vendor: vendor || "Authorized Vendor",
        warrantyExpiry: warrantyExpiry || null,
        specifications: specifications || {},
        status: "Available",
        location: assignedLocation,
        incharge: "Unassigned",
        remarks: remarks || "",
        timeline: [
          {
            title: "Device Registered",
            details: `Registered as part of batch order (${items.length} units).`,
            location: assignedLocation,
            status: "Available",
            performedBy: req.user?.username || "College System Administrator",
            date: new Date().toISOString(),
          },
        ],
      };
    });

    const created = await Device.insertMany(devicesToInsert);

    try {
      await Activity.create({
        action: "Devices Registered",
        note: `Batch of ${created.length} ${deviceType} units registered (${brand} ${model})`,
        date: formatActivityDate(),
        admin: req.user?.username || "College System Administrator",
      });
    } catch (e) {
      console.warn("Activity skipped:", e.message);
    }

    res.status(201).json({
      message: `${created.length} devices registered successfully .`,
      devices: created,
    });
  } catch (error) {
    console.error("Device registration error:", error);
    res.status(500).json({ message: error.message || "Failed to process registration." });
  }
};

// @desc    Get all devices (Supports search across ID, Name, Serial, Brand, Model, and Location)
// @route   GET /api/devices
exports.getDevices = async (req, res) => {
  try {
    const { search, type, status, location, condition } = req.query;
    let query = {};

    if (type && type !== "All" && type !== "All Types") query.deviceType = type;
    if (status && status !== "All") query.status = status;
    if (location && location !== "All") query.location = location;
    if (condition && condition !== "All") query.condition = condition;

    if (search) {
      query.$or = [
        { assetId: { $regex: search,$options: "i" } },
        { deviceName: { $regex: search,$options: "i" } },
        { serialNumber: { $regex: search,$options: "i" } },
        { brand: { $regex: search,$options: "i" } },
        { model: { $regex: search,$options: "i" } },
        { location: { $regex: search,$options: "i" } }, // Added location search capability
      ];
    }

    const fetchedDevices = await Device.find(query).sort({ assetId: 1 });
    res.json(fetchedDevices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track device by ID or Serial
// @route   GET /api/devices/track/:id
exports.trackDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({
      $or: [{ assetId: req.params.id }, { serialNumber: req.params.id }],
    });

    if (!device) return res.status(404).json({ message: "Asset not found" });
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update device details
// @route   PUT /api/devices/:id
exports.updateDevice = async (req, res) => {
  try {
    const updated = await Device.findOneAndUpdate(
      { assetId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Asset not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.findOneAndDelete({ assetId: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Asset not found" });
    res.json({ message: `Asset ${req.params.id} removed successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};