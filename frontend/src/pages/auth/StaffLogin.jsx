import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";

import API from "../../api/axios";

function StaffLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password.trim()) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", {
        identifier: trimmedIdentifier,
        username: trimmedIdentifier,
        email: trimmedIdentifier,
        password: password.trim(),
        role: "staff",
      });

      const {
        token,
        role: userRole,
        username: returnedUsername,
        name,
        email: userEmail,
        staffId,
        department,
      } = response.data;

      const resolvedRole = (userRole || "staff").toLowerCase();

      localStorage.setItem("token", token);
      localStorage.setItem("role", resolvedRole);
      localStorage.setItem("username", returnedUsername || trimmedIdentifier);
      localStorage.setItem("name", name || returnedUsername || trimmedIdentifier);
      if (userEmail) localStorage.setItem("email", userEmail);
      if (staffId) localStorage.setItem("staffId", staffId);
      if (department) localStorage.setItem("department", department);

      navigate("/staff/dashboard");
    } catch (error) {
      console.error("Staff login attempt failed:", error);
      const serverMsg =
        error.response?.data?.message ||
        (error.message === "Network Error"
          ? "Cannot connect to server. Please verify your backend is running."
          : null) ||
        error.response?.statusText ||
        "Invalid username, email, or password. Please verify your credentials.";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#1769ff",
            color: "white",
            textAlign: "center",
            padding: "32px 20px",
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              backgroundColor: "white",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <LaptopOutlinedIcon sx={{ fontSize: 40, color: "#1769ff" }} />
          </Box>
          <Typography sx={{ fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }}>
            DeviceHub
          </Typography>
          <Typography sx={{ fontSize: "14px", marginTop: 0.8, opacity: 0.9, letterSpacing: "0.5px" }}>
            Staff Portal Access
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ padding: { xs: "28px 20px", sm: "36px 48px" } }}
        >
          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: 2.5, borderRadius: "8px", fontSize: "13px" }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, marginBottom: 2.5, padding: "12px 16px", backgroundColor: "#eef4ff", borderRadius: "10px", border: "1px solid #d0d7de" }}>
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 28, color: "#1769ff" }} />
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                Staff Member Login
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Enter your staff credentials</Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: 0.5 }}>
            Username or Institutional Email *
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. rahul or rahul@devicehub.edu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            sx={{ marginBottom: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />

          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: 0.5 }}>
            Password *
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ marginBottom: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              padding: "11px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#1769ff",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#0d5be1", boxShadow: "none" },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login to Staff Portal"}
          </Button>

          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>
              Staff accounts are created and managed by College IT Administration.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default StaffLogin;