import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
  InputLabel,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

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
  "Server",
  "AC",
  "Smart Board",
];

const DEPARTMENTS = [
  "Computer Applications (MCA)",
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Electronics & Instrumentation Engineering (EIE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Business Administration",
  "Administration",
  "Computer Labs",
  "Library",
  "Placement Cell",
  "Examination Cell",
  "Maintenance",
  "Security",
  "Common / Shared",
];

function DeviceRequests() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // New Request Modal State
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestedBy: "",
    department: "Computer Applications (MCA)",
    deviceType: "Desktop",
    quantity: 1,
    requiredLocation: "",
    requiredDate: new Date().toISOString().split("T")[0],
    purpose: "",
  });

  // Request Details Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleOpenDetails = (row) => {
    setSelectedRequest(row);
    setDetailsOpen(true);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await API.get("/device-requests");
      } catch (e) {
        response = await API.get("/requisitions");
      }
      setRequests(Array.isArray(response.data) ? response.data : response.data?.requests || []);
    } catch (error) {
      console.error("Failed to load device requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Metrics calculation
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending" || r.status === "Partially Allocated").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  // Filtered list
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        (item.requestId || "").toLowerCase().includes(s) ||
        (item.requestedBy || item.staffName || "").toLowerCase().includes(s) ||
        (item.department || "").toLowerCase().includes(s) ||
        (item.requiredLocation || "").toLowerCase().includes(s) ||
        (item.purpose || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter ||
        (statusFilter === "Pending" && item.status === "Partially Allocated");
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Handle Approve / Reject without popups
  const handleStatusChange = async (reqItem, status) => {
    const note = status === "Approved" ? "Approved for college lab semester" : "";

    const id = reqItem.requestId || reqItem._id;
    try {
      try {
        await API.patch(`/device-requests/${id}/status`, { status, adminNote: note });
      } catch (e) {
        await API.patch(`/requisitions/${id}/status`, { status, adminRemarks: note });
      }
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update requisition status.");
    }
  };

  // Pre-fills all allocation fields via router state with automatic partial dispatch notes
  const handleAllocate = (row) => {
    let normalizedType = row.deviceType || "";
    if (normalizedType.includes("Desktop")) normalizedType = "Desktop";
    else if (normalizedType.includes("Laptop")) normalizedType = "Laptop";
    else if (normalizedType.includes("Printer")) normalizedType = "Printer";
    else if (normalizedType.includes("Projector")) normalizedType = "Projector";
    else if (normalizedType.includes("Monitor")) normalizedType = "Monitor";

    const totalRequested = Number(row.quantity) || 1;
    const alreadyAllocated = Number(row.allocatedQuantity) || 0;
    const remainingNeeded = Math.max(1, totalRequested - alreadyAllocated);

    navigate("/admin/allocation", {
      state: {
        fromRequisition: true,
        requestId: row.requestId || row._id,
        department: row.department || "Computer Applications (MCA)",
        allocatedTo: row.requestedBy || row.staffName || "",
        destinationLocation: row.requiredLocation || "",
        deviceType: normalizedType || "Desktop",
        quantity: remainingNeeded,
        remarks: `Partial dispatch note: ${remainingNeeded} unit(s) allocated now. Remaining balance will be dispatched later as inventory permits.`,
      },
    });
  };

  // Submit new requisition form
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.requestedBy || !formData.requiredLocation || !formData.purpose) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      try {
        await API.post("/device-requests", formData);
      } catch (e) {
        await API.post("/requisitions", formData);
      }
      alert("Requisition submitted successfully!");
      setOpenModal(false);
      setFormData({
        requestedBy: "",
        department: "Computer Applications (MCA)",
        deviceType: "Desktop",
        quantity: 1,
        requiredLocation: "",
        requiredDate: new Date().toISOString().split("T")[0],
        purpose: "",
      });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", overflowX: "hidden" }}>
      <Sidebar activeTab="device-requests" username={username} onLogout={handleLogout} />

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

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
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
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            marginBottom: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <MailOutlineOutlinedIcon sx={{ color: "#1769ff", fontSize: 24 }} />
              <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                Device Requests Management
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Review staff requisitions, approve equipment requests, and manage partial/full device allocations
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              backgroundColor: "#1769ff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "8px",
              px: 2.5,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#1256d6" },
            }}
          >
            Add Device Request
          </Button>
        </Paper>

        {/* METRICS */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #bfdbfe", backgroundColor: "#eff6ff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e40af" }}>Total Requests</Typography>
              <MailOutlineOutlinedIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#1e3a8a", mt: 1 }}>{totalCount}</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #fed7aa", borderLeft: "4px solid #f97316", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Pending / Partial</Typography>
              <AccessTimeOutlinedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b", mt: 1 }}>{pendingCount}</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #bbf7d0", borderLeft: "4px solid #10b981", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Approved (Ready)</Typography>
              <CheckCircleOutlineOutlinedIcon sx={{ color: "#10b981", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#10b981", mt: 1 }}>{approvedCount}</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #fecaca", borderLeft: "4px solid #ef4444", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Rejected / Closed</Typography>
              <HighlightOffOutlinedIcon sx={{ color: "#ef4444", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#ef4444", mt: 1 }}>{rejectedCount}</Typography>
          </Paper>
        </Box>

        {/* SEARCH & FILTER */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", mb: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Request ID, staff name, department, location, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 220 }}>
              <FilterListOutlinedIcon sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography sx={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>Status:</Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <MenuItem value="All">All Statuses ({totalCount})</MenuItem>
                  <MenuItem value="Pending">Pending / Partial</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Partially Allocated">Partially Allocated</MenuItem>
                  <MenuItem value="Allocated">Fully Allocated</MenuItem>
                  <MenuItem value="Rejected">Rejected ({rejectedCount})</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* REQUISITIONS TABLE */}
        <Paper elevation={0} sx={{ p: "20px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
            <MailOutlineOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              Device Requisitions List ({filteredRequests.length})
            </Typography>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Request ID</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Requested By</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Device Type</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Progress / Qty</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Required Location</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Required Date</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Purpose</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={26} />
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#64748b", fontSize: "13px" }}>
                      No requisitions match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((row) => {
                    const totalQty = Number(row.quantity) || 1;
                    const allocatedQty = Number(row.allocatedQuantity) || 0;
                    const isPartiallyAllocated = row.status === "Partially Allocated" || (allocatedQty > 0 && allocatedQty < totalQty);

                    return (
                      <TableRow key={row.requestId || row._id} hover>
                        <TableCell 
                          sx={{ 
                            fontWeight: 700, 
                            color: "#1769ff", 
                            fontSize: "13px",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" }
                          }}
                          onClick={() => handleOpenDetails(row)}
                        >
                          {row.requestId}
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            {row.requestedBy || row.staffName}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                            {row.department}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={row.deviceType}
                            size="small"
                            sx={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              fontWeight: 600,
                              fontSize: "11px",
                              color: "#334155",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={`${allocatedQty}/${totalQty} Allocated`}
                            size="small"
                            sx={{
                              backgroundColor: isPartiallyAllocated ? "#e0f2fe" : "#eff6ff",
                              color: isPartiallyAllocated ? "#0369a1" : "#1d4ed8",
                              fontWeight: 700,
                              fontSize: "11px",
                              border: "1px solid #bfdbfe",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                            <PlaceOutlinedIcon sx={{ color: "#ef4444", fontSize: 16 }} />
                            <Typography sx={{ fontSize: "12px", color: "#334155" }}>
                              {row.requiredLocation}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                            <CalendarTodayOutlinedIcon sx={{ color: "#64748b", fontSize: 14 }} />
                            <Typography sx={{ fontSize: "12px", color: "#475569" }}>
                              {row.requiredDate}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography sx={{ fontSize: "12px", color: "#334155" }}>
                            {row.purpose}
                          </Typography>
                          {(row.adminNote || row.adminRemarks) && (
                            <Typography sx={{ fontSize: "11px", fontStyle: "italic", color: "#64748b", mt: 0.3 }}>
                              Note: {row.adminNote || row.adminRemarks}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {row.status === "Approved" && (
                            <Chip label="Approved" size="small" sx={{ backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 600, fontSize: "11px" }} />
                          )}
                          {row.status === "Pending" && (
                            <Chip label="Pending" size="small" sx={{ backgroundColor: "#fef9c3", color: "#a16207", fontWeight: 600, fontSize: "11px" }} />
                          )}
                          {isPartiallyAllocated && (
                            <Chip label="Partial" size="small" sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "11px" }} />
                          )}
                          {row.status === "Rejected" && (
                            <Chip label="Rejected" size="small" sx={{ backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: "11px" }} />
                          )}
                          {row.status === "Allocated" && (
                            <Chip label="Allocated" size="small" sx={{ backgroundColor: "#ecfdf5", color: "#047857", fontWeight: 600, fontSize: "11px" }} />
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell sx={{ textAlign: "right" }}>
                          {row.status === "Approved" || isPartiallyAllocated ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ShareOutlinedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleAllocate(row)}
                              sx={{
                                backgroundColor: "#1769ff",
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                boxShadow: "none",
                                px: 1.8,
                                "&:hover": { backgroundColor: "#1256d6" },
                              }}
                            >
                              {isPartiallyAllocated ? "Allocate Remainder" : "Allocate Devices"}
                            </Button>
                          ) : row.status === "Pending" ? (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleStatusChange(row, "Approved")}
                                sx={{
                                  backgroundColor: "#059669",
                                  textTransform: "none",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  boxShadow: "none",
                                  "&:hover": { backgroundColor: "#047857" },
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleStatusChange(row, "Rejected")}
                                sx={{
                                  borderColor: "#f87171",
                                  color: "#dc2626",
                                  textTransform: "none",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  "&:hover": { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
                                }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          ) : row.status === "Allocated" ? (
                            <Chip label="Completed" size="small" variant="outlined" sx={{ color: "#059669", borderColor: "#a7f3d0", fontSize: "11px", fontWeight: 600 }} />
                          ) : (
                            <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>Closed</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ADD REQUISITION MODAL */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
              Add Device Requisition
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}><CloseOutlinedIcon /></IconButton>
          </DialogTitle>
          <Divider />

          <Box component="form" onSubmit={handleCreateRequest}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Requested By (Staff / Faculty) *"
                  slotProps={{ inputLabel: { shrink: true } }}
                  placeholder="e.g. Prof. Robert Chen"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  required
                />

                <FormControl fullWidth size="small">
                  <InputLabel shrink>Department *</InputLabel>
                  <Select
                    notched
                    label="Department *"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Device Type *</InputLabel>
                  <Select
                    notched
                    label="Device Type *"
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  >
                    {DEVICE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Quantity *"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1 } }}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  required
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Required Location *"
                  slotProps={{ inputLabel: { shrink: true } }}
                  placeholder="e.g. IoT & Embedded Hardware Lab"
                  value={formData.requiredLocation}
                  onChange={(e) => setFormData({ ...formData, requiredLocation: e.target.value })}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Required By Date *"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  required
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Requisition Purpose & Justification *"
                slotProps={{ inputLabel: { shrink: true } }}
                placeholder="Describe why these assets are required..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} variant="outlined" sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  backgroundColor: "#1769ff",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#1256d6" },
                }}
              >
                {submitting ? "Submitting..." : "Submit Requisition"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* REQUEST DETAILS MODAL */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
          maxWidth="sm" 
          fullWidth 
          PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
              Requisition Details: {selectedRequest?.requestId}
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}><CloseOutlinedIcon /></IconButton>
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
            {selectedRequest && (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>REQUESTED BY</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.5 }}>
                      {selectedRequest.requestedBy || selectedRequest.staffName}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#475569" }}>
                      Role: {selectedRequest.role || "Faculty / Staff"}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>DEPARTMENT</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.5 }}>
                      {selectedRequest.department}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>DEVICE & QUANTITY</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1769ff", mt: 0.5 }}>
                      {selectedRequest.allocatedQuantity || 0} / {selectedRequest.quantity} Allocated x {selectedRequest.deviceType}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>REQUIRED DATE</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.5 }}>
                      {selectedRequest.requiredDate}
                    </Typography>
                  </Paper>
                </Box>

                <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>REQUIRED LOCATION</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", mt: 0.5 }}>
                    {selectedRequest.requiredLocation}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>PURPOSE & JUSTIFICATION</Typography>
                  <Typography sx={{ fontSize: "13px", color: "#334155", mt: 0.5 }}>
                    {selectedRequest.purpose}
                  </Typography>
                </Paper>

                {(selectedRequest.adminNote || selectedRequest.adminRemarks) && (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                    <Typography sx={{ fontSize: "11px", color: "#1e40af", fontWeight: 600 }}>ADMIN NOTE</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#1e3a8a", mt: 0.5 }}>
                      {selectedRequest.adminNote || selectedRequest.adminRemarks}
                    </Typography>
                  </Paper>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDetailsOpen(false)} variant="contained" sx={{ textTransform: "none", backgroundColor: "#1769ff" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default DeviceRequests;