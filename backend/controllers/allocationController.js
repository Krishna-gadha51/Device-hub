const Allocation = require("../models/Allocation");
const Device = require("../models/Device");
const Activity = require("../models/Activity");
const DeviceRequest = require("../models/DeviceRequest");

const getNextAllocationId = async () => {
  const lastAlloc = await Allocation.findOne().sort({ createdAt: -1 });
  if (!lastAlloc || !lastAlloc.allocationId) return "ALC-001";
  const numPart = parseInt(lastAlloc.allocationId.replace("ALC-", ""), 10);
  const nextNum = isNaN(numPart) ? 1 : numPart + 1;
  return `ALC-${String(nextNum).padStart(3, "0")}`;
};

exports.createAllocation = async (req, res) => {
  try {
    const {
      requestId,
      destinationLocation,
      location,
      department,
      allocatedTo,
      deviceType,
      allocatedDeviceIds,
      allocationDate,
      remarks,
    } = req.body;

    const targetLocation = (destinationLocation || location || "").trim();
    const cleanStaffName = (allocatedTo || "").trim();
    const finalAllocationDate = allocationDate || new Date().toISOString().split("T")[0];

    if (!allocatedDeviceIds || !Array.isArray(allocatedDeviceIds) || allocatedDeviceIds.length === 0) {
      return res.status(400).json({ message: "No devices selected for allocation." });
    }

    if (!cleanStaffName) {
      return res.status(400).json({ message: "Staff member (Allocated To) is required." });
    }

    if (!targetLocation) {
      return res.status(400).json({ message: "Destination room / lab location is required." });
    }

    const devices = await Device.find({ assetId: { $in: allocatedDeviceIds } });

    if (!devices || devices.length === 0) {
      return res.status(404).json({ message: "Selected devices were not found in the inventory." });
    }

    // 🛡️ CRITICAL CHECK: Prevent double-allocation by ensuring all devices are strictly "Available"
    const alreadyAllocatedDevice = devices.find((d) => (d.status || "").toLowerCase() !== "available");
    if (alreadyAllocatedDevice) {
      return res.status(400).json({
        message: `Error: Device ${alreadyAllocatedDevice.assetId} is already allocated and cannot be assigned to multiple staff members simultaneously.`,
      });
    }

    const allocationId = await getNextAllocationId();

    // Update each device's status and tracking history safely
    await Promise.all(
      devices.map((device) => {
        device.status = "Allocated";
        device.location = targetLocation;
        device.allocatedTo = cleanStaffName;
        device.incharge = cleanStaffName;
        device.responsibleStaff = cleanStaffName;
        device.department = department || device.department;
        device.allocationId = allocationId;
        device.allocatedDate = finalAllocationDate;

        if (!Array.isArray(device.timeline)) {
          device.timeline = [];
        }

        device.timeline.unshift({
          title: `Allocated to ${targetLocation}`,
          details: `Allocated via ${allocationId}. Responsible Staff: ${cleanStaffName}.`,
          location: targetLocation,
          status: "Allocated",
          performedBy: req.user?.username || "College System Administrator",
          date: new Date().toISOString(),
        });

        return device.save();
      })
    );

    const allocation = new Allocation({
      allocationId,
      allocationDate: finalAllocationDate,
      destinationLocation: targetLocation,
      department: department || "General",
      allocatedTo: cleanStaffName,
      deviceType: deviceType || "Mixed Assets",
      devices: devices.map((d) => d._id),
      allocatedDeviceIds,
      remarks: remarks || "",
    });

    await allocation.save();

    // Fulfill partial or full requisition quantities using the Mongoose model
    if (requestId) {
      try {
        const reqDoc = await DeviceRequest.findOne({ 
          $or: [{ requestId: requestId }, { _id: requestId }] 
        });

        if (reqDoc) {
          const currentAllocated = Number(reqDoc.allocatedQuantity) || 0;
          const newlyAllocatedCount = allocatedDeviceIds.length;
          const totalAllocatedSoFar = currentAllocated + newlyAllocatedCount;
          const totalRequested = Number(reqDoc.quantity) || 1;

          let newStatus = "Partially Allocated";
          let notificationNote = remarks || "";

          if (totalAllocatedSoFar >= totalRequested) {
            newStatus = "Allocated";
            notificationNote = `Fully Allocated: All ${totalRequested} requested units have been assigned. ${remarks || ''}`.trim();
          } else {
            const remaining = totalRequested - totalAllocatedSoFar;
            notificationNote = `Partial Allocation: ${totalAllocatedSoFar}/${totalRequested} units assigned. The remaining ${remaining} unit(s) will be allocated later as inventory becomes available.`;
          }

          reqDoc.allocatedQuantity = totalAllocatedSoFar;
          reqDoc.status = newStatus;
          reqDoc.allocationId = allocationId;
          reqDoc.allocatedDate = finalAllocationDate;
          reqDoc.adminNote = notificationNote;
          reqDoc.adminRemarks = notificationNote;

          await reqDoc.save();
        }
      } catch (reqUpdateErr) {
        console.warn("Requisition status update warning:", reqUpdateErr.message);
      }
    }

    // Log the audit activity
    try {
      await Activity.create({
        action: `Allocated to ${targetLocation}`,
        note: `${devices.length} asset(s) allocated to ${cleanStaffName} via ${allocationId}`,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        admin: req.user?.username || "College System Administrator",
      });
    } catch (e) {
      console.warn("Activity logging skipped:", e.message);
    }

    res.status(201).json({
      message: `Successfully allocated ${devices.length} asset(s) to ${cleanStaffName}!`,
      allocationId,
    });
  } catch (error) {
    console.error("Allocation error:", error);
    res.status(500).json({ message: error.message || "Failed to complete allocation." });
  }
};

exports.getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find().populate("devices").sort({ createdAt: -1 });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};