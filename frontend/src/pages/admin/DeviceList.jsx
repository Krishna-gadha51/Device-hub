import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const DEVICE_TYPES = [
  "Desktop",
  "Laptop",
  "Monitor",
  "Printer",
  "Projector",
  "Wi-Fi Access Point",
  "Network Switch",
  "Router",
  "UPS",
  "CCTV Camera",
  "Keyboard",
  "Mouse",
  "Smart Board",
  "Scanner",
  "External Hard Drive",
  "Server",
];

function DeviceList() {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [viewingDevice, setViewingDevice] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrDevice, setSelectedQrDevice] = useState(null);

  const username = localStorage.getItem("username") || "Admin";

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await API.get("/devices");
      const mapped = response.data.map((d) => ({
        ...d,
        id: d.assetId,
        name: d.deviceName,
        type: d.deviceType,
        serial: d.serialNumber,
      }));
      setDevices(mapped);
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedStatus("All");
    setSelectedLocation("All");
    setSelectedCondition("All");
    setPage(0);
  };

  const handleOpenEdit = (device) => {
    setEditForm({ ...device });
    setEditModalOpen(true);
  };

  const handleOpenQr = (device) => {
    setSelectedQrDevice(device);
    setQrModalOpen(true);
  };

  const handlePrintQr = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Asset Label - ${selectedQrDevice.id}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .label-card {
              width: 320px;
              border: 2px dashed #000;
              padding: 16px;
              text-align: center;
              border-radius: 8px;
            }
            .title {
              font-size: 11px;
              font-weight: bold;
              letter-spacing: 0.5px;
              color: #555;
            }
            .asset-id {
              font-size: 20px;
              font-weight: 800;
              margin: 6px 0;
              color: #1769ff;
            }
            .meta {
              font-size: 12px;
              margin: 4px 0;
              color: #222;
            }
            .serial {
              font-family: monospace;
              font-size: 11px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">CAMPUS ELECTRONIC DEVICE INVENTORY</div>
            <div class="asset-id">${selectedQrDevice.id}</div>
            <div style="margin: 12px 0;">
              ${printRef.current ? printRef.current.innerHTML : ""}
            </div>
            <div class="meta"><strong>${selectedQrDevice.name}</strong></div>
            <div class="serial">SN: ${selectedQrDevice.serial}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        deviceName: editForm.name,
        brand: editForm.brand,
        model: editForm.model,
        serialNumber: editForm.serial,
        condition: editForm.condition,
        purchaseCost: Number(editForm.purchaseCost),
        vendor: editForm.vendor,
        warrantyExpiry: editForm.warrantyExpiry || null,
        remarks: editForm.remarks,
      };

      await API.put(`/devices/${editForm.id}`, payload);

      setDevices((prev) =>
        prev.map((item) => (item.id === editForm.id ? { ...editForm } : item))
      );

      if (viewingDevice && viewingDevice.id === editForm.id) {
        setViewingDevice({ ...editForm });
      }

      setEditModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update device details.");
    } finally {
      setEditLoading(false);
    }
  };

  // Dynamically extract unique location values from loaded devices
  const distinctLocations = useMemo(() => {
    const locs = new Set();
    devices.forEach((d) => {
      if (d.location) locs.add(d.location);
    });
    return Array.from(locs).sort();
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices
      .filter((device) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          (device.id || "").toLowerCase().includes(search) ||
          (device.name || "").toLowerCase().includes(search) ||
          (device.serial || "").toLowerCase().includes(search) ||
          (device.brand || "").toLowerCase().includes(search) ||
          (device.model || "").toLowerCase().includes(search);

        const matchesType = selectedType === "All" || device.type === selectedType;
        const matchesStatus = selectedStatus === "All" || device.status === selectedStatus;
        const matchesLocation = selectedLocation === "All" || device.location === selectedLocation;
        const matchesCondition = selectedCondition === "All" || device.condition === selectedCondition;

        return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesCondition;
      })
      .sort((a, b) =>
        (a.id || "").localeCompare(b.id || "", undefined, { numeric: true, sensitivity: "base" })
      );
  }, [devices, searchTerm, selectedType, selectedStatus, selectedLocation, selectedCondition]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    const headers = [
      "Asset ID",
      "Device Type",
      "Device Name",
      "Brand",
      "Model",
      "Serial Number",
      "Status",
      "Location",
      "Condition",
      "Purchase Date",
      "Purchase Cost",
      "Vendor",
      "Warranty Expiry",
    ];

    const rows = filteredDevices.map((device) => [
      device.id,
      device.type,
      device.name,
      device.brand,
      device.model,
      device.serial,
      device.status,
      device.location,
      device.condition,
      device.purchaseDate,
      device.purchaseCost,
      device.vendor,
      device.warrantyExpiry || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "device-inventory.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <Sidebar username={username} onLogout={handleLogout} />

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
              FISAT ASSET PORTAL
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
        {viewingDevice ? (
          <Box sx={{ width: "100%" }}>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => setViewingDevice(null)}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                color: "#64748b",
                fontWeight: 600,
                padding: 0,
                marginBottom: 1.5,
                "&:hover": { backgroundColor: "transparent", color: "#1769ff" },
              }}
            >
              Back to Inventory
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, marginBottom: 3 }}>
              <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                {viewingDevice.id}
              </Typography>
              <Chip
                label={viewingDevice.status}
                size="small"
                sx={{
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid #bfdbfe",
                }}
              />
              <Chip
                label={`${viewingDevice.condition} Condition`}
                size="small"
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                padding: "24px 28px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                marginBottom: 3,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2.5 }}>
                <LaptopOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Device Specifications & Hardware Info
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <Box>
                  <Typography className="detail-label">Device Name</Typography>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", mt: 0.3 }}>
                    {viewingDevice.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">Device Type</Typography>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", mt: 0.3 }}>
                    {viewingDevice.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">Brand & Model</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                    {viewingDevice.brand} {viewingDevice.model}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">Physical Serial Number</Typography>
                  <Typography sx={{ fontSize: "14px", fontFamily: "monospace", fontWeight: 600, color: "#1769ff", mt: 0.3 }}>
                    {viewingDevice.serial}
                  </Typography>
                </Box>

                <Box sx={{ gridColumn: { sm: "span 2" }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
                  <Box>
                    <Typography className="detail-label">Purchase Date</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                      {viewingDevice.purchaseDate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="detail-label">Purchase Cost</Typography>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", mt: 0.3 }}>
                      ₹{Number(viewingDevice.purchaseCost || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="detail-label">Vendor / Supplier</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                      {viewingDevice.vendor}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="detail-label">Warranty Expiry Date</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                      {viewingDevice.warrantyExpiry || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                padding: "24px 28px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                marginBottom: 3,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2.5 }}>
                <LocationOnOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Current Location & Responsible Staff
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3 }}>
                <Box>
                  <Typography className="detail-label">Assigned Location</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                    {viewingDevice.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="detail-label">Responsible Faculty / Staff</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", mt: 0.3 }}>
                    {viewingDevice.incharge || "Unassigned"}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                padding: "16px 24px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<QrCode2OutlinedIcon />}
                onClick={() => handleOpenQr(viewingDevice)}
                sx={{
                  textTransform: "none",
                  borderColor: "#cbd5e1",
                  color: "#1769ff",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 2.5,
                }}
              >
                View QR Label
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => handleOpenEdit(viewingDevice)}
                sx={{
                  textTransform: "none",
                  borderColor: "#cbd5e1",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 2.5,
                }}
              >
                Edit Details
              </Button>
              <Button
                variant="contained"
                onClick={() => setViewingDevice(null)}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#1769ff",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 2.5,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#1256d6", boxShadow: "none" },
                }}
              >
                Done
              </Button>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                padding: "20px 24px",
                marginBottom: 2.5,
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      backgroundColor: "#eff6ff",
                      color: "#1769ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FormatListBulletedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                    Device List
                  </Typography>
                  <Chip
                    label={`${devices.length} Total Assets`}
                    size="small"
                    sx={{
                      backgroundColor: "#eff6ff",
                      color: "#1769ff",
                      fontWeight: 700,
                      fontSize: "12px",
                      borderRadius: "6px",
                      border: "1px solid #dbeafe",
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
                  Search, filter, inspect, and manage complete electronic asset records across campus.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={handleExport}
                  sx={{
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                    color: "#15803d",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "13px",
                    padding: "8px 16px",
                    "&:hover": { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
                  }}
                >
                  Export Excel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlinedIcon />}
                  onClick={() => navigate("/admin/bulk-register")}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#1769ff",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "13px",
                    padding: "8px 18px",
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#1256d6", boxShadow: "none" },
                  }}
                >
                  Register Device
                </Button>
              </Box>
            </Paper>

            {/* FILTERS */}
            <Paper
              elevation={0}
              sx={{
                padding: "16px 20px",
                marginBottom: 2.5,
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr repeat(4, 1fr) auto",
                  },
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search Asset ID, Serial, Name, Brand..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />

                <FormControl size="small">
                  <Select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: "8px", fontSize: "13px" }}
                  >
                    <MenuItem value="All">All Types</MenuItem>
                    {DEVICE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: "8px", fontSize: "13px" }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Allocated">Allocated</MenuItem>
                    <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                    <MenuItem value="E-Waste">E-Waste</MenuItem>
                  </Select>
                </FormControl>

                {/* DYNAMIC LOCATIONS DROPDOWN */}
                <FormControl size="small">
                  <Select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: "8px", fontSize: "13px" }}
                  >
                    <MenuItem value="All">All Locations</MenuItem>
                    {distinctLocations.map((loc) => (
                      <MenuItem key={loc} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={selectedCondition}
                    onChange={(e) => {
                      setSelectedCondition(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: "8px", fontSize: "13px" }}
                  >
                    <MenuItem value="All">All Conditions</MenuItem>
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Fair">Fair</MenuItem>
                    <MenuItem value="Damaged">Damaged</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestartAltOutlinedIcon />}
                  onClick={handleReset}
                  sx={{
                    height: 40,
                    borderColor: "#cbd5e1",
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "13px",
                    "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Paper>

            {/* TABLE */}
            <Paper
              elevation={0}
              sx={{
                padding: "20px 24px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
              }}
            >
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Asset ID</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Device Type</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Device Name</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Brand</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Model</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Serial Number</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Status</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Location</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>Condition</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5, textAlign: "right" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : filteredDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6, color: "#64748b", fontSize: "14px" }}>
                          No devices found matching the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDevices
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>
                              <Chip
                                label={row.id}
                                size="small"
                                sx={{
                                  backgroundColor: "#eff6ff",
                                  color: "#1769ff",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  borderRadius: "6px",
                                  border: "1px solid #dbeafe",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.type}
                                size="small"
                                sx={{
                                  backgroundColor: "#f8fafc",
                                  color: "#475569",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  border: "1px solid #e2e8f0",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                              {row.name}
                            </TableCell>
                            <TableCell sx={{ fontSize: "13px", color: "#64748b" }}>{row.brand}</TableCell>
                            <TableCell sx={{ fontSize: "13px", color: "#64748b" }}>{row.model}</TableCell>
                            <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", color: "#334155" }}>
                              {row.serial}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                size="small"
                                sx={{
                                  backgroundColor: row.status === "Available" ? "#ecfdf5" : "#eff6ff",
                                  color: row.status === "Available" ? "#047857" : "#1d4ed8",
                                  fontWeight: 600,
                                  fontSize: "11px",
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: "13px", color: "#475569" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                <DomainOutlinedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                <span>{row.location}</span>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.condition}
                                size="small"
                                sx={{
                                  backgroundColor: row.condition === "New" ? "#eff6ff" : "#ecfdf5",
                                  color: row.condition === "New" ? "#1d4ed8" : "#047857",
                                  fontWeight: 600,
                                  fontSize: "11px",
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: "right" }}>
                              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<QrCode2OutlinedIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => handleOpenQr(row)}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "12px",
                                    borderColor: "#e2e8f0",
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
                                  }}
                                >
                                  QR
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => setViewingDevice(row)}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "12px",
                                    borderColor: "#bfdbfe",
                                    color: "#2563eb",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    "&:hover": { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => handleOpenEdit(row)}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "12px",
                                    borderColor: "#cbd5e1",
                                    color: "#475569",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                                  }}
                                >
                                  Edit
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* PAGINATION NUMBERS FOOTER */}
              <TablePagination
                component="div"
                count={filteredDevices.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 15, 25, 50]}
                sx={{
                  borderTop: "1px solid #e2e8f0",
                  mt: 2,
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: "13px",
                    color: "#64748b",
                  },
                }}
              />
            </Paper>
          </Box>
        )}

        {/* QR CODE MODAL */}
        <Dialog
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <QrCode2OutlinedIcon sx={{ color: "#1769ff", fontSize: 22 }} />
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Asset QR Code
              </Typography>
            </Box>
            <IconButton onClick={() => setQrModalOpen(false)} sx={{ color: "#94a3b8" }}>
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>
          <Divider />

          {selectedQrDevice && (
            <DialogContent sx={{ textAlign: "center", py: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: "inline-block",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>
                  COLLEGE ASSET PORTAL
                </Typography>
                <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#1769ff", mb: 2 }}>
                  {selectedQrDevice.id}
                </Typography>

                <Box ref={printRef} sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                  <QRCodeSVG
                    value={JSON.stringify({
                      assetId: selectedQrDevice.id,
                      name: selectedQrDevice.name,
                      serial: selectedQrDevice.serial,
                      status: selectedQrDevice.status,
                      location: selectedQrDevice.location,
                    })}
                    size={160}
                    level="H"
                    includeMargin
                  />
                </Box>

                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 1.5 }}>
                  {selectedQrDevice.name}
                </Typography>
                <Typography sx={{ fontSize: "12px", fontFamily: "monospace", color: "#64748b", mt: 0.3 }}>
                  SN: {selectedQrDevice.serial}
                </Typography>
              </Paper>
            </DialogContent>
          )}

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button
                onClick={() => setQrModalOpen(false)}
                variant="outlined"
                sx={{ textTransform: "none", borderColor: "#cbd5e1", color: "#475569", borderRadius: "8px" }}
              >
                Close
              </Button>
              <Button
                onClick={handlePrintQr}
                variant="contained"
                startIcon={<PrintOutlinedIcon />}
                sx={{
                  backgroundColor: "#1769ff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#1256d6" },
                }}
              >
                Print Sticker
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", padding: 0.5 } }}
        >
          <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
              <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Edit Device:</Typography>
              <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#1769ff" }}>{editForm?.id}</Typography>
            </Box>
            <IconButton onClick={() => setEditModalOpen(false)} sx={{ color: "#94a3b8" }}>
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          {editForm && (
            <form onSubmit={handleSaveEdit}>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5, mb: 2.5 }}>
                  <Box>
                    <Typography className="field-label">Device Name *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                  <Box>
                    <Typography className="field-label">Brand *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                  <Box>
                    <Typography className="field-label">Model *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editForm.model}
                      onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5, mb: 2.5 }}>
                  <Box>
                    <Typography className="field-label">Serial Number *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editForm.serial}
                      onChange={(e) => setEditForm({ ...editForm, serial: e.target.value })}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                  <Box>
                    <Typography className="field-label">Condition *</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                        sx={{ borderRadius: "8px" }}
                      >
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Fair">Fair</MenuItem>
                        <MenuItem value="Damaged">Damaged</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography className="field-label">Purchase Cost (₹)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editForm.purchaseCost}
                      onChange={(e) => setEditForm({ ...editForm, purchaseCost: e.target.value })}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <Box>
                    <Typography className="field-label">Vendor / Supplier</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editForm.vendor}
                      onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                  <Box>
                    <Typography className="field-label">Warranty Expiry Date</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      value={editForm.warrantyExpiry || ""}
                      onChange={(e) => setEditForm({ ...editForm, warrantyExpiry: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography className="field-label">Remarks</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editForm.remarks || ""}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2.5, pt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%" }}>
                  <Button
                    onClick={() => setEditModalOpen(false)}
                    variant="outlined"
                    disabled={editLoading}
                    sx={{
                      textTransform: "none",
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      fontWeight: 600,
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={editLoading}
                    sx={{
                      textTransform: "none",
                      backgroundColor: "#1769ff",
                      fontWeight: 600,
                      borderRadius: "8px",
                      px: 3,
                      boxShadow: "none",
                      "&:hover": { backgroundColor: "#1256d6", boxShadow: "none" },
                    }}
                  >
                    {editLoading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                  </Button>
                </Box>
              </DialogActions>
            </form>
          )}
        </Dialog>
      </Box>

      <style>
        {`
          .detail-label {
            font-size: 11.5px !important;
            font-weight: 600 !important;
            color: #64748b !important;
            letter-spacing: 0.2px;
          }
          .field-label {
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #334155 !important;
            margin-bottom: 6px !important;
            letter-spacing: 0.2px;
          }
        `}
      </style>
    </Box>
  );
}

export default DeviceList;