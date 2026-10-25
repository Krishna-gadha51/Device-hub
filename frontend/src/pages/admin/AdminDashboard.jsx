import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
} from "@mui/material";

import Sidebar, { drawerWidth } from "../../components/Sidebar";

import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CircleIcon from "@mui/icons-material/Circle";

import API from "../../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    allocated: 0,
    maintenance: 0,
    ewaste: 0,
    deviceRequests: 0,
  });
  const [recentDevices, setRecentDevices] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const username = localStorage.getItem("username") || "Admin";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardRes = await API.get("/dashboard").catch(() => ({ data: {} }));
      
      let unreadCount = 0;
      try {
        const requestsRes = await API.get("/device-requests");
        const requestsList = Array.isArray(requestsRes.data) ? requestsRes.data : requestsRes.data?.requests || [];
        
        const viewedIds = JSON.parse(localStorage.getItem("viewed_device_requests") || "[]");

        const unreadRequests = requestsList.filter((r) => {
          const reqId = r._id || r.requestId;
          const isPending = (r.status || "").toLowerCase() === "pending";
          return isPending && !viewedIds.includes(reqId);
        });

        unreadCount = unreadRequests.length;
      } catch (err) {
        console.warn("Device requests endpoint not reachable.");
      }

      const fetchedStats = dashboardRes.data?.stats || {};

      setStats({
        total: fetchedStats.total ?? 0,
        available: fetchedStats.available ?? 0,
        allocated: fetchedStats.allocated ?? 0,
        maintenance: fetchedStats.maintenance ?? 0,
        ewaste: fetchedStats.ewaste ?? 0,
        deviceRequests: unreadCount,
      });

      setRecentDevices(dashboardRes.data?.recentDevices || []);
      setRecentActivities(dashboardRes.data?.recentActivities || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleViewRequests = async () => {
    try {
      const requestsRes = await API.get("/device-requests");
      const requestsList = Array.isArray(requestsRes.data) ? requestsRes.data : requestsRes.data?.requests || [];
      
      const allIds = requestsList.map((r) => r._id || r.requestId);
      localStorage.setItem("viewed_device_requests", JSON.stringify(allIds));
    } catch (e) {}

    navigate("/admin/device-requests");
  };

  // Handles clicking any item in the Recent Activities feed dynamically
  const handleActivityClick = (act) => {
    const text = `${act.action || ""} ${act.note || ""}`;
    
    // Match Requisition ID (e.g., REQ-003)
    const reqMatch = text.match(/REQ-\d+/i);
    if (reqMatch) {
      navigate("/admin/device-requests", { state: { highlightId: reqMatch[0] } });
      return;
    }

    // Match Maintenance Ticket ID (e.g., MNT-001)
    const mntMatch = text.match(/MNT-\d+/i);
    if (mntMatch) {
      navigate("/admin/maintenance", { state: { highlightId: mntMatch[0] } });
      return;
    }

    // Match Asset ID directly if present (e.g., AST-002)
    const astMatch = text.match(/AST-\d+/i);
    if (astMatch) {
      navigate("/admin/tracking", { state: { searchQuery: astMatch[0], searchId: astMatch[0] } });
      return;
    }

    // Handle allocation logs (e.g. "Allocated to lab2") by searching the target location
    if (text.toLowerCase().includes("allocated")) {
      const locationTarget = (act.action || "").replace(/allocated to/i, "").trim();
      const searchQuery = locationTarget || "Lab";
      
      navigate("/admin/tracking", { 
        state: { 
          searchQuery: searchQuery,
          searchId: searchQuery 
        } 
      });
      return;
    }
  };

  const statCards = [
    {
      label: "TOTAL DEVICES",
      val: stats.total,
      sub: "Campus Inventory",
      icon: <LaptopOutlinedIcon />,
      color: "#1769ff",
      bg: "#eef4ff",
    },
    {
      label: "AVAILABLE DEVICES",
      val: stats.available,
      sub: "Ready to Allocate",
      icon: <CheckCircleOutlinedIcon />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "ALLOCATED DEVICES",
      val: stats.allocated,
      sub: "In Labs & Offices",
      icon: <ShareOutlinedIcon />,
      color: "#0284c7",
      bg: "#f0f9ff",
    },
    {
      label: "DEVICE REQUESTS",
      val: stats.deviceRequests,
      sub: stats.deviceRequests > 0 ? "New Staff Requests" : "No New Requests",
      icon: <AssignmentOutlinedIcon />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "UNDER MAINTENANCE",
      val: stats.maintenance,
      sub: "Active Repair Tickets",
      icon: <WarningAmberOutlinedIcon />,
      color: "#ea580c",
      bg: "#fff7ed",
    },
    {
      label: "E-WASTE",
      val: stats.ewaste,
      sub: "Decommissioned Assets",
      icon: <DeleteOutlineOutlinedIcon />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
  ];

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "Allocated":
        return "primary";
      case "Under Maintenance":
        return "warning";
      case "E-Waste":
      case "Scrapped":
      case "Decommissioned":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f8fafc",
        overflowX: "hidden",
      }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username}
        onLogout={handleLogout}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: `${drawerWidth}px`,
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", padding: "12px 28px !important", minHeight: "64px" }}>
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.5px" }}>
              COLLEGE ASSET PORTAL
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
              Electronic Device Management System
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                College System Administrator
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                {username.toLowerCase()}@devicehub.edu • Admin
              </Typography>
            </Box>
            <Avatar sx={{ backgroundColor: "#e0edff", color: "#1769ff", width: 38, height: 38, fontWeight: 700 }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: `${drawerWidth}px`,
          marginTop: "64px",
          padding: { xs: 2, sm: 3, md: 3.5 },
          boxSizing: "border-box",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            padding: "20px 24px",
            marginBottom: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                Admin Dashboard
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Real-time electronic asset lifecycle, lab allocation, and maintenance overview.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#64748b", display: { xs: "none", lg: "block" } }}>
              Updated: {lastUpdated}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshOutlinedIcon />}
              onClick={fetchDashboardData}
              sx={{
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#334155",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                "&:hover": { borderColor: "#1769ff", backgroundColor: "#f8fafc" },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentOutlinedIcon />}
              onClick={handleViewRequests}
              sx={{
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#7c3aed",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                "&:hover": { backgroundColor: "#f5f3ff", borderColor: "#7c3aed" },
              }}
            >
              Requests {stats.deviceRequests > 0 ? `(${stats.deviceRequests})` : ""}
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<LibraryAddOutlinedIcon />}
              onClick={() => navigate("/admin/register")}
              sx={{
                borderColor: "#cbd5e1",
                color: "#1e293b",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              Register Device
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddOutlinedIcon />}
              onClick={() => navigate("/admin/allocation")}
              sx={{
                backgroundColor: "#1769ff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1256d6", boxShadow: "none" },
              }}
            >
              Allocate
            </Button>
          </Stack>
        </Paper>

        {/* METRICS ROW */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 2,
            width: "100%",
            marginBottom: 3,
            boxSizing: "border-box",
          }}
        >
          {statCards.map((card, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                padding: "18px 20px",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                boxSizing: "border-box",
                cursor: card.label === "DEVICE REQUESTS" ? "pointer" : "default",
                transition: "all 0.2s ease-in-out",
                "&:hover": card.label === "DEVICE REQUESTS" ? { borderColor: "#7c3aed", transform: "translateY(-2px)" } : {},
              }}
              onClick={() => {
                if (card.label === "DEVICE REQUESTS") {
                  handleViewRequests();
                }
              }}
            >
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
                {card.label}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginY: 1.5 }}>
                <Typography sx={{ fontSize: "28px", fontWeight: 800, color: card.label === "DEVICE REQUESTS" && stats.deviceRequests > 0 ? "#7c3aed" : "#0f172a" }}>
                  {loading ? <CircularProgress size={22} /> : card.val}
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    backgroundColor: card.bg,
                    color: card.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card.icon}
                </Box>
              </Box>

              <Typography sx={{ fontSize: "11.5px", color: card.label === "DEVICE REQUESTS" && stats.deviceRequests > 0 ? "#7c3aed" : "#64748b", fontWeight: card.label === "DEVICE REQUESTS" && stats.deviceRequests > 0 ? 600 : 400 }}>
                {card.sub}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* BOTTOM TABLES */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 8 }}>
            <Paper
              elevation={0}
              sx={{
                padding: "24px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Recent Device Registrations
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Newly cataloged devices in the system
                  </Typography>
                </Box>

                <Button
                  onClick={() => navigate("/admin/devices")}
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1769ff",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}
                >
                  View All →
                </Button>
              </Box>

              <TableContainer>
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>ASSET ID</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>DEVICE</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>STATUS</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>LOCATION</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: "#64748b", py: 3 }}>
                          No devices registered yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentDevices.map((row) => (
                        <TableRow key={row.assetId || row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#1769ff" }}>
                            {row.assetId}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                              {row.deviceName || "Unnamed Device"}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                              {row.model || row.brand || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status || "Available"}
                              color={getStatusChipColor(row.status)}
                              size="small"
                              sx={{ fontSize: "11px", fontWeight: 600, borderRadius: "6px" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: "13px", color: "#64748b" }}>
                            {row.location || "Not Allocated"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* AUDIT TRAIL */}
          <Grid size={{ xs: 12, md: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                padding: "24px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2.5 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Recent Activities
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Audit Trail →</Typography>
              </Box>

              <Stack spacing={2.5}>
                {recentActivities.length === 0 ? (
                  <Typography sx={{ fontSize: "12px", color: "#64748b", py: 2 }}>
                    No recorded activities yet.
                  </Typography>
                ) : (
                  recentActivities.map((act, i) => {
                    const text = `${act.action || ""} ${act.note || ""}`;
                    const isClickable = /REQ-\d+|MNT-\d+|ALC-\d+|AST-\d+/i.test(text);

                    return (
                      <Box
                        key={act._id || act.id || `${act.action}-${i}`}
                        onClick={() => {
                          if (isClickable) {
                            handleActivityClick(act);
                          }
                        }}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",
                          padding: "10px",
                          borderRadius: "8px",
                          cursor: isClickable ? "pointer" : "default",
                          transition: "all 0.2s ease-in-out",
                          border: "1px solid transparent",
                          "&:hover": {
                            backgroundColor: isClickable ? "#f8fafc" : "transparent",
                            borderColor: isClickable ? "#e2e8f0" : "transparent",
                          },
                        }}
                      >
                        <CircleIcon sx={{ fontSize: 9, color: "#1769ff", marginTop: 0.8 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                              {act.action}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>{act.date}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "12px", color: "#64748b", marginTop: 0.3 }}>
                            {act.note}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#94a3b8", marginTop: 0.3 }}>
                            by {act.admin || "System Administrator"}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AdminDashboard;