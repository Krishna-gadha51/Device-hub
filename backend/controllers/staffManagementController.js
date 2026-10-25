const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get all staff members for the directory
// @route   GET /api/staff-management
exports.getAllStaff = async (req, res) => {
  try {
    // Get only staff accounts, regardless of role casing
    const staffList = await User.find({
      role: { $regex: /^staff$/i },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(staffList);
  } catch (error) {
    console.error("Error fetching staff directory:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch staff directory.",
    });
  }
};

// @desc    Add new staff member via Admin modal
// @route   POST /api/staff-management
exports.addStaffMember = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      department,
      designation,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Full Name, Institutional Email, and Password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername =
      (username && username.trim().toLowerCase()) ||
      cleanEmail.split("@")[0];

    // Check if account already exists with either email OR username
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === cleanEmail
            ? "A staff account with this institutional email already exists."
            : "A staff account with this username already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Generate readable Staff ID
    const generatedStaffId = `STF-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newStaff = await User.create({
      staffId: generatedStaffId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      department:
        (department && department.trim()) ||
        "Computer Applications (MCA)",
      designation:
        (designation && designation.trim()) ||
        "Assistant Professor",
      role: "staff",
      status: "Active",
    });

    // Return sanitized object without password
    res.status(201).json({
      message: `Staff account created successfully for ${newStaff.name}.`,
      staff: {
        _id: newStaff._id,
        staffId: newStaff.staffId,
        name: newStaff.name,
        username: newStaff.username,
        email: newStaff.email,
        department: newStaff.department,
        designation: newStaff.designation,
        role: newStaff.role,
        status: newStaff.status,
      },
    });
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).json({
      message: error.message || "Failed to create staff member.",
    });
  }
};

// @desc    Update existing staff member details
// @route   PUT /api/staff-management/:id
exports.updateStaffMember = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      department,
      designation,
      status,
    } = req.body;

    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    // Check if new email is taken by another account
    if (email && email.trim().toLowerCase() !== staff.email) {
      const cleanEmail = email.trim().toLowerCase();

      const emailTaken = await User.findOne({
        email: cleanEmail,
        _id: { $ne: req.params.id },
      });

      if (emailTaken) {
        return res.status(400).json({
          message: "Another account is already using this email.",
        });
      }

      staff.email = cleanEmail;
    }

    if (name) staff.name = name.trim();

    if (username) {
      staff.username = username.trim().toLowerCase();
    }

    if (department) {
      staff.department = department.trim();
    }

    if (designation) {
      staff.designation = designation.trim();
    }

    if (status) {
      staff.status = status;
    }

    // Only re-hash password if admin provided a new one
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password.trim(), salt);
    }

    await staff.save();

    res.json({
      message: `Staff details updated successfully for ${staff.name}.`,
      staff: {
        _id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        username: staff.username,
        email: staff.email,
        department: staff.department,
        designation: staff.designation,
        role: staff.role,
        status: staff.status,
      },
    });
  } catch (error) {
    console.error("Error updating staff member:", error);
    res.status(500).json({
      message: error.message || "Failed to update staff member.",
    });
  }
};

// @desc    Toggle staff Active / Inactive status
// @route   PATCH /api/staff-management/:id/toggle-status
// @route   PATCH /api/staff-management/:id/status
exports.toggleStaffStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    // Allow explicit status OR toggle
    if (req.body.status) {
      user.status = req.body.status;
    } else {
      user.status =
        user.status === "Active" ? "Inactive" : "Active";
    }

    await user.save();

    res.json({
      message: `Staff member marked as ${user.status}.`,
      status: user.status,
    });
  } catch (error) {
    console.error("Error toggling staff status:", error);
    res.status(500).json({
      message: error.message || "Failed to update status.",
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff-management/:id
exports.deleteStaffMember = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    res.json({
      message: "Staff account removed successfully.",
    });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).json({
      message: error.message || "Failed to delete staff member.",
    });
  }
};