const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "devicehub_jwt_secret_key_2026";

// @desc    Auth user & get token (Supports separate Admin & Staff login portals)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { identifier, email, username, password, role } = req.body;

    const loginIdentity = (identifier || email || username || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const requestedRole = (role || "").trim().toLowerCase();

    console.log(`\n--- [AUTH ATTEMPT] ---`);
    console.log(`Identity: "${loginIdentity}" | Role: "${requestedRole}"`);

    if (!loginIdentity || !cleanPassword) {
      return res.status(400).json({ message: "Please provide your email/username and password." });
    }

    // =========================================================================
    // 1. HARDCODED SYSTEM ADMIN (Strictly for Admin Portal)
    // =========================================================================
    if (
      (loginIdentity === "admin" || loginIdentity === "admin@devicehub.edu") &&
      (cleanPassword === "admin123" || cleanPassword === "admin")
    ) {
      // If they attempted to log into the staff portal using admin credentials
      if (requestedRole && requestedRole !== "admin") {
        return res.status(401).json({
          message: "Access denied. Administrator credentials cannot be used on the Staff portal.",
        });
      }

      console.log("-> Admin Fallback Authenticated Successfully.");
      const token = jwt.sign(
        { id: "default-admin", role: "admin", username: "Admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        role: "admin",
        username: "Admin",
        name: "College System Administrator",
        email: "admin@devicehub.edu",
      });
    }

    // =========================================================================
    // 2. MONGODB USER LOOKUP (For Database Users / Staff Members / DB Admins)
    // =========================================================================
    const user = await User.findOne({
      $or: [
        { email: loginIdentity },
        { username: { $regex: new RegExp(`^${loginIdentity}$`, "i") } },
      ],
    });

    if (!user) {
      console.log(`-> User "${loginIdentity}" NOT FOUND in database.`);
      return res.status(401).json({ message: "No account found with this username or email." });
    }

    // Check account status
    if (user.status && user.status.toLowerCase() === "inactive") {
      console.log(`-> User "${loginIdentity}" is Inactive.`);
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact the administrator.",
      });
    }

    // Check role match based on which login page they used
    const dbUserRole = (user.role || "staff").toLowerCase();
    if (requestedRole && dbUserRole !== requestedRole) {
      console.log(`-> Role mismatch: DB has "${dbUserRole}", requested "${requestedRole}".`);
      return res.status(401).json({
        message: `Access denied. This account belongs to the '${dbUserRole}' role. Please use the appropriate login portal.`,
      });
    }

    // =========================================================================
    // 3. SAFE PASSWORD VERIFICATION (Bcrypt or Plain text fallback)
    // =========================================================================
    let isMatch = false;

    if (
      user.password &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"))
    ) {
      try {
        isMatch = await bcrypt.compare(cleanPassword, user.password);
      } catch (err) {
        console.error("Bcrypt comparison error, checking plain text fallback:", err.message);
        isMatch = user.password === cleanPassword;
      }
    } else {
      isMatch = user.password === cleanPassword;
    }

    if (!isMatch) {
      console.log(`-> Password incorrect for "${loginIdentity}".`);
      return res.status(401).json({ message: "Incorrect password. Please verify your credentials." });
    }

    console.log(`-> User "${user.name || user.username}" authenticated successfully as ${dbUserRole}.`);

    // =========================================================================
    // 4. GENERATE JWT TOKEN
    // =========================================================================
    const token = jwt.sign(
      {
        id: user._id,
        role: dbUserRole,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // =========================================================================
    // 5. SEND SUCCESS RESPONSE
    // =========================================================================
    res.json({
      token,
      role: dbUserRole,
      username: user.username || user.name,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
      staffId: user.staffId,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({ message: error.message || "Server error during login." });
  }
};