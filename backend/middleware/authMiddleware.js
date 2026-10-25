const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devicehub_jwt_secret_key_2026";

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Handle system admin session fallback
      if (decoded.id === "default-admin") {
        req.user = {
          _id: "default-admin",
          username: "Admin",
          name: "College System Administrator",
          role: "admin",
          email: "admin@devicehub.edu",
        };
        return next();
      }

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found or session expired." });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }
};

// Optional role restriction middleware
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to perform this action.",
      });
    }
    next();
  };
};