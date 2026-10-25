const Maintenance = require("../models/Maintenance");
const Device = require("../models/Device");
const Activity = require("../models/Activity");
const EWaste = require("../models/EWaste");

// Helper: Auto-generates sequential MNT-001, MNT-002...
const getNextTicketId = async () => {
  const lastTicket = await Maintenance.findOne().sort({ createdAt: -1 });

  if (!lastTicket || !lastTicket.ticketId) {
    return "MNT-001";
  }

  const numPart = parseInt(
    lastTicket.ticketId.replace("MNT-", ""),
    10
  );

  const nextNum = isNaN(numPart)
    ? 1
    : numPart + 1;

  return `MNT-${String(nextNum).padStart(3, "0")}`;
};

// Helper: Activity date format
const formatActivityDate = () => {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ======================================================
// GET ALL MAINTENANCE TICKETS
// ======================================================
// @route   GET /api/maintenance
// ======================================================

exports.getMaintenanceTickets = async (req, res) => {
  try {
    const tickets = await Maintenance.find()
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(
      "Failed to get maintenance tickets:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// CREATE NEW MAINTENANCE TICKET
// ======================================================
// @route   POST /api/maintenance
// ======================================================

exports.createMaintenanceTicket = async (req, res) => {
  try {
    const {
      assetId,
      problemCategory,
      description,
      reportedBy,
      cost,
    } = req.body;

    // --------------------------------------------------
    // CHECK ASSET
    // --------------------------------------------------

    const device = await Device.findOne({
      assetId,
    });

    if (!device) {
      return res.status(404).json({
        message: `Asset ${assetId} not found.`,
      });
    }

    // --------------------------------------------------
    // GENERATE TICKET ID
    // --------------------------------------------------

    const ticketId = await getNextTicketId();

    // --------------------------------------------------
    // CREATE TICKET
    // --------------------------------------------------

    const newTicket = new Maintenance({
      ticketId,
      assetId,
      deviceName: device.deviceName,
      location: device.location,
      problemCategory:
        problemCategory || "General Fault",
      issueDescription: description,
      reportedBy:
        reportedBy || "Staff Member",
      actualCost: Number(cost) || 0,

      // IMPORTANT:
      // Every newly reported problem strictly starts as Reported.
      status: "Reported",
      technicianNotes: "Awaiting Technician Inspection",
      resolutionNotes: "",

      reportedDate:
        new Date().toISOString().split("T")[0],
    });

    const saved = await newTicket.save();

    // --------------------------------------------------
    // UPDATE DEVICE STATUS TO REPORTED & ADD TIMELINE
    // --------------------------------------------------

    device.status = "Reported";

    device.timeline.unshift({
      title: "Problem Reported",
      details:
        `Ticket ${ticketId}: ${description} ` +
        `(${problemCategory}). ` +
        `Reported by: ${reportedBy || "Staff Member"}.`,
      location: device.location,
      status: "Reported",
      performedBy:
        req.user?.username ||
        reportedBy ||
        "Staff Member",
    });

    await device.save();

    // --------------------------------------------------
    // ACTIVITY LOG
    // --------------------------------------------------

    await Activity.create({
      action: "Maintenance Ticket Opened",
      note:
        `${device.assetId} problem reported ` +
        `(${ticketId}) - ${problemCategory}`,
      date: formatActivityDate(),
      admin:
        req.user?.username ||
        "College System Administrator",
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(201).json({
      message:
        `Ticket ${ticketId} created successfully.`,
      ticket: saved,
    });
  } catch (error) {
    console.error(
      "Maintenance ticket creation error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE MAINTENANCE TICKET
// ======================================================
// @route   PUT /api/maintenance/:id
//
// Possible statuses:
// Reported
// Under Maintenance
// Resolved
// Unrepairable
// ======================================================

exports.updateMaintenanceTicket = async (req, res) => {
  try {
    const {
      status,
      cost,
      resolutionNotes,
    } = req.body;

    // --------------------------------------------------
    // FIND TICKET
    // --------------------------------------------------

    const ticket = await Maintenance.findOne({
      ticketId: req.params.id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    // --------------------------------------------------
    // VALIDATE STATUS
    // --------------------------------------------------

    const allowedStatuses = [
      "Reported",
      "Under Maintenance",
      "Resolved",
      "Unrepairable",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid maintenance status.",
      });
    }

    // --------------------------------------------------
    // UPDATE TICKET STATUS
    // --------------------------------------------------

    if (status) {
      ticket.status = status;
    }

    // --------------------------------------------------
    // UPDATE COST
    // --------------------------------------------------

    if (cost !== undefined) {
      ticket.actualCost = Number(cost) || 0;
    }

    // --------------------------------------------------
    // UPDATE NOTES
    // --------------------------------------------------

    if (resolutionNotes !== undefined) {
      ticket.resolutionNotes = resolutionNotes;

      // Keep technician notes synchronized
      // so staff can see the Admin update.
      ticket.technicianNotes =
        resolutionNotes ||
        "Awaiting Technician Inspection";
    }

    // --------------------------------------------------
    // FIND DEVICE
    // --------------------------------------------------

    const device = await Device.findOne({
      assetId: ticket.assetId,
    });

    // ==================================================
    // REPORTED
    // ==================================================

    if (status === "Reported" && device) {
      device.status = "Reported";

      device.timeline.unshift({
        title: "Problem Reported",
        details:
          `Ticket ${ticket.ticketId} is currently reported.`,
        location: device.location,
        status: "Reported",
        performedBy:
          req.user?.username ||
          "College System Administrator",
      });

      await device.save();
    }

    // ==================================================
    // UNDER MAINTENANCE
    // ==================================================

    else if (
      status === "Under Maintenance" &&
      device
    ) {
      device.status = "Under Maintenance";

      device.timeline.unshift({
        title: "Under Maintenance",
        details:
          `Ticket ${ticket.ticketId} moved ` +
          `Under Maintenance. Notes: ` +
          `${resolutionNotes || "Inspection started."}`,
        location: device.location,
        status: "Under Maintenance",
        performedBy:
          req.user?.username ||
          "College System Administrator",
      });

      await device.save();
    }

    // ==================================================
    // RESOLVED
    // ==================================================

    else if (
      status === "Resolved" &&
      device
    ) {
      device.status =
        device.location === "Not Allocated"
          ? "Available"
          : "Allocated";

      device.condition = "Good";

      device.timeline.unshift({
        title: "Maintenance Completed",
        details:
          `Ticket ${ticket.ticketId} resolved: ` +
          `${resolutionNotes ||
            "Restored to working condition."}`,
        location: device.location,
        status: device.status,
        performedBy:
          req.user?.username ||
          "College System Administrator",
      });

      await device.save();
    }

    // ==================================================
    // UNREPAIRABLE
    // ==================================================

    else if (
      status === "Unrepairable" &&
      device
    ) {
      device.status = "E-Waste";
      device.condition = "Damaged";

      device.timeline.unshift({
        title: "Condemned to E-Waste",
        details:
          `Ticket ${ticket.ticketId}: ` +
          `Asset unrepairable. ` +
          `Transferred to E-Waste Disposal.`,
        location: "E-Waste Storage Area",
        status: "E-Waste",
        performedBy:
          req.user?.username ||
          "College System Administrator",
      });

      await device.save();

      try {
        const existingEWaste = await EWaste.findOne({ assetId: device.assetId });
        if (!existingEWaste) {
          await EWaste.create({
            assetId: device.assetId,
            deviceName: device.deviceName || "Hardware Asset",
            model: device.model || device.deviceModel || "Standard Model",
            serialNumber: device.serialNumber || "N/A",
            decommissionReason: resolutionNotes || ticket.resolutionNotes || "Declared unrepairable via maintenance ticket",
            condition: "Beyond Repair",
            disposalStatus: "Pending Disposal",
            recyclingVendor: "GreenIndia Certified E-Waste Recyclers",
            decommissionDate: new Date().toISOString().split("T")[0],
          });
        }
      } catch (ewasteErr) {
        console.error("Automatic E-Waste module entry error:", ewasteErr);
      }
    }

    // --------------------------------------------------
    // SAVE TICKET
    // --------------------------------------------------

    const updated = await ticket.save();

    // --------------------------------------------------
    // ACTIVITY LOG
    // --------------------------------------------------

    await Activity.create({
      action: "Maintenance Ticket Updated",
      note:
        `${ticket.assetId} - ${ticket.ticketId} ` +
        `status changed to ${ticket.status}`,
      date: formatActivityDate(),
      admin:
        req.user?.username ||
        "College System Administrator",
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.json({
      message:
        `Ticket ${ticket.ticketId} updated.`,
      ticket: updated,
    });
  } catch (error) {
    console.error(
      "Maintenance ticket update error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};