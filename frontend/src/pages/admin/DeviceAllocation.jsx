import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";

import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const INSTITUTIONAL_DEPARTMENTS = [
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

const DEVICE_TYPES = [
  "All Types",
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

function DeviceAllocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const reqData = location.state || {};

  const username = localStorage.getItem("username") || "Admin";

  const isFromRequisition = Boolean(reqData.fromRequisition);
  const requestedQty = Number(reqData.quantity) || 1;

  const [department, setDepartment] = useState(
    reqData.department || "Computer Applications (MCA)"
  );
  const [destinationLocation, setDestinationLocation] = useState(
    reqData.destinationLocation || ""
  );
  const [allocatedTo, setAllocatedTo] = useState(reqData.allocatedTo || "");
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState(reqData.remarks || "");

  const [selectedType, setSelectedType] = useState(
    reqData.deviceType || "All Types"
  );

  const [availableDevices, setAvailableDevices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  useEffect(() => {
    if (reqData.fromRequisition) {
      if (reqData.department) setDepartment(reqData.department);
      if (reqData.destinationLocation) setDestinationLocation(reqData.destinationLocation);
      if (reqData.allocatedTo) setAllocatedTo(reqData.allocatedTo);
      if (reqData.deviceType) setSelectedType(reqData.deviceType);
    }
  }, [location.state]);

  const fetchData = async () => {
    setLoading(true);
    try {
      try {
        const devicesRes = await API.get("/devices");
        const rawData = devicesRes.data;
        const allDevs = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.devices)
          ? rawData.devices
          : [];

        // Strict filter: Only pull devices that are explicitly "Available" and NOT already "Allocated"
        const unallocated = allDevs.filter(
          (d) => (d.status || "").toLowerCase() === "available"
        );
        setAvailableDevices(unallocated);
      } catch (devErr) {
        console.error("Error fetching devices:", devErr);
        setAvailableDevices([]);
      }

      try {
        let staffRes;
        try {
          staffRes = await API.get("/staff-management");
        } catch (e) {
          staffRes = await API.get("/api/staff-management");
        }

        const rawStaff = staffRes.data;
        const staffArray = Array.isArray(rawStaff)
          ? rawStaff
          : Array.isArray(rawStaff?.staff)
          ? rawStaff.staff
          : [];
        setStaffList(staffArray);
      } catch (staffErr) {
        console.error("Error fetching staff directory:", staffErr);
        setStaffList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredAvailableDevices = useMemo(() => {
    if (!Array.isArray(availableDevices)) return [];
    if (selectedType === "All Types") return availableDevices;
    return availableDevices.filter((d) => d.deviceType === selectedType);
  }, [availableDevices, selectedType]);

  const filteredStaffList = useMemo(() => {
    if (!Array.isArray(staffList) || !department) return [];

    const currentDept = department.trim().toLowerCase();
    const matched = staffList.filter((staff) => {
      const staffDept = (staff.department || "").trim().toLowerCase();
      return (
        staffDept === currentDept ||
        staffDept.includes(currentDept) ||
        currentDept.includes(staffDept)
      );
    });

    return matched;
  }, [staffList, department]);

  useEffect(() => {
    if (filteredAvailableDevices.length > 0) {
      if (isFromRequisition) {
        setSelectedAssetIds(
          filteredAvailableDevices.slice(0, requestedQty).map((d) => d.assetId)
        );
      }
    } else {
      setSelectedAssetIds([]);
    }
  }, [filteredAvailableDevices, isFromRequisition, requestedQty]);

  useEffect(() => {
    if (isFromRequisition) {
      const allocatedNow = selectedAssetIds.length;
      if (allocatedNow > 0) {
        if (allocatedNow < requestedQty) {
          const remaining = requestedQty - allocatedNow;
          setRemarks(
            `Partial dispatch: ${allocatedNow} unit(s) allocated now. Remaining ${remaining} unit(s) will be dispatched later as inventory permits.`
          );
        } else {
          setRemarks(
            `Full dispatch: All ${requestedQty} requested units have been allocated successfully.`
          );
        }
      }
    }
  }, [selectedAssetIds, requestedQty, isFromRequisition]);

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    setAllocatedTo("");
  };

  const handleToggleSelect = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAssetIds(filteredAvailableDevices.map((d) => d.assetId));
    } else {
      setSelectedAssetIds([]);
    }
  };

  const isAllSelected =
    filteredAvailableDevices.length > 0 &&
    selectedAssetIds.length === filteredAvailableDevices.length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAssetIds || selectedAssetIds.length === 0) {
      alert("Please select at least one device to allocate.");
      return;
    }

    if (!destinationLocation.trim() || !allocatedTo.trim()) {
      alert("Please specify the target location and select an in-charge staff member.");
      return;
    }

    const payload = {
      requestId: reqData.requestId || null,
      allocatedDeviceIds: selectedAssetIds,
      destinationLocation: destinationLocation.trim(),
      department,
      allocatedTo: allocatedTo.trim(),
      deviceType: selectedType,
      allocationDate,
      remarks: remarks.trim(),
    };

    setSubmitting(true);
    try {
      const response = await API.post("/allocations", payload);

      if (reqData.requestId) {
        await API.patch(`/device-requests/${reqData.requestId}/allocate`, {
          quantity: selectedAssetIds.length,
          remarks: remarks.trim(),
        });
      }

      alert(response.data?.message || "Devices allocated successfully!");
      navigate("/admin/device-requests");
    } catch (error) {
      console.error("Allocation submission error:", error);
      alert(error.response?.data?.message || "Allocation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", overflowX: "hidden" }}>
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

      <Box component="main" sx={{ flexGrow: 1, width: `calc(100% - ${drawerWidth}px)`, marginLeft: `${drawerWidth}px`, marginTop: "64px", padding: { xs: 2, sm: 3, md: 3.5 }, boxSizing: "border-box" }}>
        
        {isFromRequisition && (
          <Alert
            icon={<InfoOutlinedIcon />}
            severity="info"
            sx={{ mb: 3, borderRadius: "10px", border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", fontSize: "13px" }}
          >
            Fulfilling Requisition <strong>{reqData.requestId}</strong>: Auto-filled for <strong>{allocatedTo}</strong> ({department}) at <strong>{destinationLocation}</strong>.
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            padding: "20px 24px",
            marginBottom: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LibraryAddOutlinedIcon sx={{ color: "#1769ff", fontSize: 26 }} />
              <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                Device Allocation
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Filter by device type and allocate multiple available assets in bulk.
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            padding: "16px 20px",
            marginBottom: 3,
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FilterListOutlinedIcon sx={{ color: "#1769ff", fontSize: 22 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
              Select Device Type:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                sx={{ borderRadius: "8px", fontSize: "13px" }}
              >
                {DEVICE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Chip
            icon={<DevicesOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`${filteredAvailableDevices.length} Available to Allocate`}
            sx={{
              backgroundColor: "#ecfdf5",
              color: "#059669",
              fontWeight: 700,
              fontSize: "12px",
              border: "1px solid #a7f3d0",
            }}
          />
        </Paper>

        <Box component="form" onSubmit={handleSubmit}>
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              marginBottom: 3,
            }}
          >
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
              Allocation Details
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 2.5,
                marginBottom: 2.5,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel shrink>Department</InputLabel>
                <Select
                  notched
                  label="Department"
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  {INSTITUTIONAL_DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept} sx={{ fontSize: "13px" }}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Target Room / Lab / Hall"
                slotProps={{ inputLabel: { shrink: true } }}
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                placeholder="e.g. MCA Lab 1, Seminar Hall"
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              <FormControl fullWidth size="small">
                <InputLabel shrink>Allocated To (Staff / In-charge)</InputLabel>
                <Select
                  notched
                  label="Allocated To (Staff / In-charge)"
                  value={allocatedTo}
                  onChange={(e) => setAllocatedTo(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <MenuItem value="" disabled>
                    {filteredStaffList.length === 0 ? "No staff found in this department" : "Select Staff Member"}
                  </MenuItem>
                  {allocatedTo && !filteredStaffList.some((s) => s.name === allocatedTo) && (
                    <MenuItem value={allocatedTo}>
                      {allocatedTo} (Requisition In-charge)
                    </MenuItem>
                  )}
                  {filteredStaffList.map((staff) => (
                    <MenuItem key={staff._id || staff.email} value={staff.name} sx={{ fontSize: "13px" }}>
                      {staff.name} — ({staff.designation || "Staff"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                type="date"
                label="Allocation Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={allocationDate}
                onChange={(e) => setAllocationDate(e.target.value)}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Remarks / Allocation Purpose"
              slotProps={{ inputLabel: { shrink: true } }}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Assigned for practical laboratory operations"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              marginBottom: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Select Devices for Bulk Allocation
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                  Showing available devices for: <strong>{selectedType}</strong>
                </Typography>
              </Box>

              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1769ff" }}>
                {selectedAssetIds.length} of {filteredAvailableDevices.length} Selected
              </Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "10px" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={isAllSelected} onChange={handleSelectAll} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Asset ID</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Device Name</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Type</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Brand & Model</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Serial Number</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredAvailableDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#64748b", fontSize: "13px" }}>
                        No available unallocated devices found for "{selectedType}".
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAvailableDevices.map((device) => {
                      const isChecked = selectedAssetIds.includes(device.assetId);
                      return (
                        <TableRow
                          key={device.assetId}
                          hover
                          onClick={() => handleToggleSelect(device.assetId)}
                          selected={isChecked}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={isChecked} />
                          </TableCell>
                          <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#1769ff" }}>
                            {device.assetId}
                          </TableCell>
                          <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                            {device.deviceName}
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px", color: "#64748b" }}>{device.deviceType}</TableCell>
                          <TableCell sx={{ fontSize: "12px", color: "#64748b" }}>
                            {device.brand} {device.model}
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px", fontFamily: "monospace", color: "#334155" }}>
                            {device.serialNumber}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Available"
                              size="small"
                              sx={{
                                backgroundColor: "#ecfdf5",
                                color: "#059669",
                                fontWeight: 600,
                                fontSize: "11px",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/device-requests")}
              disabled={submitting}
              sx={{ textTransform: "none", borderRadius: "8px", px: 3, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !allocatedTo || selectedAssetIds.length === 0}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlinedIcon />}
              sx={{
                backgroundColor: "#1769ff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1256d6" },
              }}
            >
              {submitting ? "Allocating..." : `Allocate Selected (${selectedAssetIds.length}) Devices`}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default DeviceAllocation;