import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

import {
  Box,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

// Register ChartJS plugins
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Reports() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await API.get("/reports/analytics");
      setData(response.data);
    } catch (error) {
      console.error("Failed to load reports analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Export to Excel / CSV
  const handleExportRawExcel = () => {
    if (!data || !data.devices) return;

    const headers = [
      "Asset ID",
      "Device Name",
      "Type",
      "Brand",
      "Model",
      "Serial Number",
      "Status",
      "Location",
      "Condition",
      "Purchase Cost (INR)",
    ];

    const rows = data.devices.map((d) => [
      d.assetId,
      d.deviceName,
      d.deviceType,
      d.brand,
      d.model,
      d.serialNumber,
      d.status,
      d.location,
      d.condition,
      d.purchaseCost || 0,
    ]);

    const csvContent = [headers, ...rows]
      .map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `college-asset-audit-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <CircularProgress size={36} sx={{ color: "#1769ff" }} />
      </Box>
    );
  }

  // Doughnut Chart Data (Asset Status Breakdown)
  const doughnutData = {
    labels: ["Available", "Allocated", "Under Maintenance", "E-Waste"],
    datasets: [
      {
        data: [
          data.summary.availableInPool,
          data.summary.allocatedInLabs,
          data.summary.underMaintenance,
          data.summary.ewaste,
        ],
        backgroundColor: ["#10b981", "#1d4ed8", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Bar Chart Data (Device Type Distribution)
  const typeLabels = Object.keys(data.typeDistribution);
  const typeValues = Object.values(data.typeDistribution);
  const typeBarData = {
    labels: typeLabels,
    datasets: [
      {
        label: "Devices",
        data: typeValues,
        backgroundColor: "#0ea5e9",
        borderRadius: 4,
      },
    ],
  };

  // Bar Chart Data (Location Allocation Count)
  const locationLabels = Object.keys(data.locationDistribution);
  const locationValues = Object.values(data.locationDistribution);
  const locationBarData = {
    labels: locationLabels,
    datasets: [
      {
        label: "Devices in Location",
        data: locationValues,
        backgroundColor: "#6366f1",
        borderRadius: 4,
      },
    ],
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", overflowX: "hidden" }}>
      <Sidebar activeTab="reports" username={username} onLogout={handleLogout} />

      {/* TOP BAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          left: `${drawerWidth}px`,
          right: 0,
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", padding: "12px 28px !important", minHeight: "64px" }}>
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.5px" }}>
              FISAT Asset Portal
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Electronic Device Management System
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                FISAT System Administrator
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                {username.toLowerCase()}@devicehub.edu • Admin
              </Typography>
            </Box>
            <Avatar sx={{ backgroundColor: "#e0edff", color: "#1769ff", width: 38, height: 38, fontWeight: 700 }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
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
        {/* HEADER PANEL & ACTION BUTTONS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            marginBottom: 3,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DescriptionOutlinedIcon sx={{ color: "#1769ff", fontSize: 24 }} />
              <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                Administrative Reports & Analytics
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Comprehensive audit reports, distribution charts, maintenance expenses, and export tools
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportPDF}
              sx={{
                backgroundColor: "#1e40af",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "8px",
                px: 2,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1e3a8a" },
              }}
            >
              Export Official PDF Report
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportRawExcel}
              sx={{
                borderColor: "#10b981",
                color: "#059669",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "8px",
                px: 2,
                "&:hover": { borderColor: "#059669", backgroundColor: "#ecfdf5" },
              }}
            >
              Export Raw Excel Data
            </Button>
          </Stack>
        </Box>

        {/* 4 SUMMARY METRIC CARDS */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #bfdbfe", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
              TOTAL CAMPUS ASSETS
            </Typography>
            <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#2563eb", mt: 1 }}>
              {data.summary.totalAssets}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #bbf7d0", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
              ALLOCATED IN LABS
            </Typography>
            <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#16a34a", mt: 1 }}>
              {data.summary.allocatedInLabs}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #fef08a", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
              AVAILABLE IN POOL
            </Typography>
            <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#ca8a04", mt: 1 }}>
              {data.summary.availableInPool}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
              MAINTENANCE EXPENSE
            </Typography>
            <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", mt: 1 }}>
              ₹{Number(data.summary.totalMaintenanceExpense || 0).toLocaleString("en-IN")}
            </Typography>
          </Paper>
        </Box>

        {/* 3 VISUAL CHARTS GRID */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 2.5, mb: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AccessTimeOutlinedIcon sx={{ color: "#2563eb", fontSize: 18 }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Asset Status Breakdown
              </Typography>
            </Box>
            <Box sx={{ height: 240, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 12, font: { size: 11, weight: "600" } },
                    },
                  },
                }}
              />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <BarChartOutlinedIcon sx={{ color: "#0ea5e9", fontSize: 18 }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Device Type Distribution
              </Typography>
            </Box>
            <Box sx={{ height: 240 }}>
              <Bar
                data={typeBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 }, maxRotation: 25, minRotation: 25 },
                    },
                  },
                }}
              />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <HubOutlinedIcon sx={{ color: "#6366f1", fontSize: 18 }} />
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Location Allocation Count
              </Typography>
            </Box>
            <Box sx={{ height: 240 }}>
              <Bar
                data={locationBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Devices in Location: ${context.parsed.y}`,
                      },
                    },
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 }, maxRotation: 30, minRotation: 30 },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* 2 DATA TABLES: BRAND BREAKDOWN & HARDWARE CONDITION AUDIT */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Paper elevation={0} sx={{ p: "20px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Brand Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#ffffff" }}>
                  <TableRow sx={{ borderBottom: "2px solid #f1f5f9" }}>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>
                      MANUFACTURER / BRAND
                    </TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5, textAlign: "right" }}>
                      DEVICE COUNT
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.brandDistribution).map(([brand, count]) => (
                    <TableRow key={brand} hover>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", py: 1.2 }}>
                        {brand}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", py: 1.2, textAlign: "right" }}>
                        {count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper elevation={0} sx={{ p: "20px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Hardware Condition Audit
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#ffffff" }}>
                  <TableRow sx={{ borderBottom: "2px solid #f1f5f9" }}>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>
                      PHYSICAL CONDITION
                    </TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5, textAlign: "right" }}>
                      ASSET COUNT
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.conditionDistribution).map(([condition, count]) => (
                    <TableRow key={condition} hover>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", py: 1.2 }}>
                        {condition}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", py: 1.2, textAlign: "right" }}>
                        {count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Reports;