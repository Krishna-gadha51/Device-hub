const DeviceRequest = require("../models/DeviceRequest");
const Activity = require("../models/Activity");

// Auto-generates sequential REQ-001, REQ-002, ...
const getNextRequestId = async () => {
  const lastReq = await DeviceRequest.findOne().sort({ createdAt: -1 });
  if (!lastReq || !lastReq.requestId) return "REQ-001";

  const numPart = parseInt(lastReq.requestId.replace("REQ-", ""), 10);
  const nextNum = isNaN(numPart) ? 1 : numPart + 1;
  return `REQ-${String(nextNum).padStart(3, "0")}`;
};

const formatActivityDate = () => {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// @desc    Get requisitions (Admin sees all, Staff sees only their own)
// @route   GET /api/device-requests
exports.getRequests = async (req, res) => {
  try {
    let query = {};

    // Robust case-insensitive check for Admin role
    const userRole = (req.user?.role || "").trim().toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "administrator" || req.user?.isAdmin === true;

    // If the logged-in user is a staff member (not an admin), restrict requests to their name/email
    if (!isAdmin && req.user) {
      const staffName = req.user.name || req.user.username;
      const staffEmail = req.user.email;
      
      query = {
        $or: [
          { requestedBy: { $regex: new RegExp(`^${staffName}$`, "i") } },
          { email: staffEmail }
        ]
      };
    }

    const requests = await DeviceRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new requisition
// @route   POST /api/device-requests
exports.createRequest = async (req, res) => {
  try {
    const {
      requestedBy,
      department,
      deviceType,
      quantity,
      requiredLocation,
      requiredDate,
      purpose,
    } = req.body;

    const requestId = await getNextRequestId();
    const creatorName = requestedBy || req.user?.name || req.user?.username || "Staff Member";
    const creatorEmail = req.user?.email || "";

    const newRequest = new DeviceRequest({
      requestId,
      requestedBy: creatorName,
      email: creatorEmail,
      department,
      deviceType,
      quantity: Number(quantity) || 1,
      allocatedQuantity: 0,
      requiredLocation,
      requiredDate,
      purpose,
      status: "Pending",
    });

    const saved = await newRequest.save();

    await Activity.create({
      action: "Device Requisition Raised",
      note: `${requestId}: ${quantity}x ${deviceType} for ${requiredLocation}`,
      date: formatActivityDate(),
      admin: creatorName,
    });

    res.status(201).json({ message: `Request ${requestId} created successfully.`, request: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject requisition
// @route   PATCH /api/device-requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const request = await DeviceRequest.findOne({ requestId: req.params.id });

    if (!request) {
      return res.status(404).json({ message: "Requisition not found." });
    }

    request.status = status;
    if (adminNote) request.adminNote = adminNote;

    const updated = await request.save();

    await Activity.create({
      action: `Requisition ${status}`,
      note: `${request.requestId} was marked as ${status} by Administrator`,
      date: formatActivityDate(),
      admin: req.user?.username || "College System Administrator",
    });

    res.json({ message: `Requisition ${request.requestId} updated to ${status}.`, request: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record partial or full device allocation from request
// @route   PATCH /api/device-requests/:id/allocate
exports.recordAllocation = async (req, res) => {
  try {
    const { quantity: allocatedNow, remarks } = req.body;
    const request = await DeviceRequest.findOne({ requestId: req.params.id });

    if (!request) {
      return res.status(404).json({ message: "Requisition not found." });
    }

    const currentAllocated = Number(request.allocatedQuantity) || 0;
    const newUnits = Number(allocatedNow) || 1;
    const totalAllocatedSoFar = currentAllocated + newUnits;
    const totalRequested = Number(request.quantity) || 1;

    let newStatus = "Partially Allocated";
    let notificationNote = remarks || "";

    if (totalAllocatedSoFar >= totalRequested) {
      newStatus = "Allocated";
      notificationNote = `Fully Allocated: All ${totalRequested} requested units have been assigned. ${remarks || ''}`.trim();
    } else {
      const remaining = totalRequested - totalAllocatedSoFar;
      notificationNote = `Partial Allocation: ${totalAllocatedSoFar}/${totalRequested} units assigned. The remaining ${remaining} unit(s) will be allocated later when inventory is available.`;
    }

    request.allocatedQuantity = totalAllocatedSoFar;
    request.status = newStatus;
    request.adminNote = notificationNote;

    const updated = await request.save();

    await Activity.create({
      action: "Device Allocated",
      note: `${newUnits} units allocated for ${request.requestId} (${totalAllocatedSoFar}/${totalRequested})`,
      date: formatActivityDate(),
      admin: req.user?.username || "College System Administrator",
    });

    res.json({ message: `Allocation recorded for ${request.requestId}.`, request: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};