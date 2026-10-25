const Device = require("../models/Device");
const DeviceRequest = require("../models/DeviceRequest");
const Maintenance = require("../models/Maintenance");

// Extracts every identifier variation of the logged-in staff member
const getStaffIdentifiers = (req) => {
  const name = (req.user?.name || "").trim();
  const username = (req.user?.username || "").trim();
  const email = (req.user?.email || "").trim().toLowerCase();
  const staffId = (req.user?.staffId || "").trim();

  const terms = [name, username, email, staffId].filter(Boolean);

  // Extract first name (e.g. "Rahul" from "Rahul Sharma")
  if (name.includes(" ")) {
    const first = name.split(" ")[0].trim();
    if (first.length > 1) terms.push(first);
  }

  return { name, username, email, terms: Array.from(new Set(terms)) };
};

// Builds a query matching allocatedTo, incharge, or responsibleStaff
const buildStaffDeviceQuery = (req) => {
  const { terms, email } = getStaffIdentifiers(req);

  const orConditions = [];

  terms.forEach((term) => {
    const regex = new RegExp(term, "i");
    orConditions.push({ allocatedTo: { $regex: regex } });
    orConditions.push({ incharge: { $regex: regex } });
    orConditions.push({ responsibleStaff: { $regex: regex } });
  });

  if (email) {
    orConditions.push({ allocatedEmail: email });
  }

  return {
    status: "Allocated",
    $or: orConditions.length > 0 ? orConditions : [{ allocatedTo: "__no_match__" }],
  };
};

// @desc    Get dashboard metrics & summary for logged-in staff member
// @route   GET /api/staff/dashboard-summary
exports.getStaffDashboardSummary = async (req, res) => {
  try {
    const { name, terms } = getStaffIdentifiers(req);
    const staffQuery = buildStaffDeviceQuery(req);

    // 1. Fetch devices allocated to this staff member
    const assignedDevices = await Device.find(staffQuery).sort({ assetId: 1 });

    // 2. Fetch requisitions submitted by this staff member
    const myRequests = await DeviceRequest.find({
      $or: terms.length > 0 ? terms.map((t) => ({ requestedBy: { $regex: new RegExp(t, "i") } })) : [{ requestedBy: name }],
    }).sort({ createdAt: -1 });

    // 3. Fetch tickets reported by this staff member
    const myTickets = await Maintenance.find({
      $or: terms.length > 0 ? terms.map((t) => ({ reportedBy: { $regex: new RegExp(t, "i") } })) : [{ reportedBy: name }],
    }).sort({ createdAt: -1 });

    const pendingRequestsCount = myRequests.filter((r) => r.status === "Pending").length;
    const approvedRequestsCount = myRequests.filter((r) => r.status === "Approved").length;

    res.json({
      metrics: {
        assignedDevicesCount: assignedDevices.length,
        pendingRequestsCount,
        approvedRequestsCount,
        problemReportsCount: myTickets.length,
      },
      assignedDevices: assignedDevices.slice(0, 6),
      recentRequisitions: myRequests.slice(0, 5),
      recentTickets: myTickets.slice(0, 5),
    });
  } catch (error) {
    console.error("Staff dashboard summary error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get devices assigned to the logged-in staff member
// @route   GET /api/staff/my-devices
exports.getMyDevices = async (req, res) => {
  try {
    const { name } = getStaffIdentifiers(req);
    const search = (req.query.search || "").trim();

    const query = buildStaffDeviceQuery(req);

    if (search) {
      query.$and = [
        {
          $or: [
            { assetId: { $regex: search,$options: "i" } },
            { deviceName: { $regex: search,$options: "i" } },
            { brand: { $regex: search,$options: "i" } },
            { model: { $regex: search,$options: "i" } },
            { serialNumber: { $regex: search,$options: "i" } },
          ],
        },
      ];
    }

    const devices = await Device.find(query).sort({ assetId: 1 });

    res.json({
      staffMember: name,
      totalCount: devices.length,
      devices,
    });
  } catch (error) {
    console.error("Error fetching staff devices:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requisitions submitted by the staff member
// @route   GET /api/staff/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const { name, terms } = getStaffIdentifiers(req);

    const requests = await DeviceRequest.find({
      $or: terms.length > 0 ? terms.map((t) => ({ requestedBy: { $regex: new RegExp(t, "i") } })) : [{ requestedBy: name }],
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching staff requisitions:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a new device requisition
// @route   POST /api/staff/request-device
exports.submitDeviceRequest = async (req, res) => {
  try {
    const { deviceType, quantity, requiredLocation, requiredDate, purpose } = req.body;
    const { name, username } = getStaffIdentifiers(req);

    if (!deviceType || !requiredLocation || !requiredDate) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const lastRequest = await DeviceRequest.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastRequest && lastRequest.requestId) {
      const parsed = parseInt(lastRequest.requestId.replace("REQ-", ""), 10);
      nextNum = isNaN(parsed) ? 1 : parsed + 1;
    }
    const requestId = `REQ-${String(nextNum).padStart(3, "0")}`;

    const newRequest = await DeviceRequest.create({
      requestId,
      requestedBy: name || username || "Staff Member",
      staffId: req.user?.staffId || "STF-1024",
      department: req.user?.department || "Computer Applications",
      deviceType,
      quantity: Number(quantity) || 1,
      requiredLocation,
      requiredDate,
      purpose: purpose || "",
      status: "Pending",
      adminRemarks: "—",
    });

    res.status(201).json({
      message: "Device requisition submitted successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error submitting device requisition:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a problem on an equipment
// @route   POST /api/staff/report-problem
exports.reportProblem = async (req, res) => {
  try {
    const { assetId, deviceName, issueDescription, problemCategory, priority, location } = req.body;
    const { name, username } = getStaffIdentifiers(req);

    if (!assetId || !issueDescription) {
      return res.status(400).json({ message: "Asset ID and issue description are required." });
    }

    const targetDevice = await Device.findOne({ assetId });

    const lastTicket = await Maintenance.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastTicket && lastTicket.ticketId) {
      const parsed = parseInt(lastTicket.ticketId.replace("MNT-", ""), 10);
      nextNum = isNaN(parsed) ? 1 : parsed + 1;
    }
    const ticketId = `MNT-${String(nextNum).padStart(3, "0")}`;

    const newTicket = await Maintenance.create({
      ticketId,
      assetId,
      deviceName: deviceName || targetDevice?.deviceName || "Assigned Device",
      problemCategory: problemCategory || "Hardware Issue",
      issueDescription,
      priority: priority || "High",
      location: location || targetDevice?.location || "Designated Location",
      reportedBy: name || username || "Staff Member",
      status: "Under Maintenance",
      cost: 0,
    });

    await Device.findOneAndUpdate(
      { assetId },
      {
        status: "Under Maintenance",
        condition: "Needs Repair",
      }
    );

    res.status(201).json({
      message: "Problem reported successfully. Device status updated to Under Maintenance.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error reporting problem:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get maintenance tickets reported by this staff member
// @route   GET /api/staff/maintenance-history
exports.getMaintenanceHistory = async (req, res) => {
  try {
    const { name, terms } = getStaffIdentifiers(req);

    const ticketConditions = terms.map((t) => ({
      reportedBy: { $regex: new RegExp(t, "i") },
    }));

    const history = await Maintenance.find({
      $or: ticketConditions.length > 0 ? ticketConditions : [{ reportedBy: name }],
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error("Error fetching maintenance history:", error);
    res.status(500).json({ message: error.message });
  }
};