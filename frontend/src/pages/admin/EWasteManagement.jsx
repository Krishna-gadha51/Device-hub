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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const DISPOSAL_STATUSES = [
  "All Disposal Statuses",
  "Sent for Recycling",
  "Pending Disposal",
  "Disposed / Scrapped",
];

const RECYCLING_VENDORS = [
  "GreenIndia Certified E-Waste Recyclers",
  "EcoTech Recyclers Pvt Ltd",
  "Campus Scrap Clearing Agency",
  "Government Authorized Recycler",
];

function EWasteManagement() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [records, setRecords] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Disposal Statuses");

  // Decommission Modal State
  const [openDecomModal, setOpenDecomModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [decomForm, setDecomForm] = useState({
    assetId: "",
    decommissionReason: "",
    condition: "Beyond Repair",
    disposalStatus: "Sent for Recycling",
    recyclingVendor: "GreenIndia Certified E-Waste Recyclers",
    remarks: "",
  });

  // Update Status Modal State
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("Sent for Recycling");
  const [updateVendor, setUpdateVendor] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      let ewasteData = [];
      try {
        const ewasteRes = await API.get("/ewaste");
        ewasteData = ewasteRes.data || [];
      } catch (err) {
        console.warn("Dedicated e-waste endpoint lookup skipped, using device inventory fallback.");
      }

      const devicesRes = await API.get("/devices");
      const rawDevices = devicesRes.data;
      const allDevs = Array.isArray(rawDevices)
        ? rawDevices
        : Array.isArray(rawDevices?.devices)
        ? rawDevices.devices
        : [];

      // Filter for devices marked as E-Waste or Unrepairable from Maintenance
      const decommissionedDevices = allDevs.filter(
        (d) =>
          (d.status || "").toLowerCase() === "e-waste" ||
          (d.status || "").toLowerCase() === "unrepairable"
      );

      // If e-waste table is empty or missing entries, map them dynamically from device inventory
      if (ewasteData.length === 0 && decommissionedDevices.length > 0) {
        ewasteData = decommissionedDevices.map((d, index) => ({
          ewasteId: d.ewasteId || `EW-${String(index + 1).padStart(3, "0")}`,
          assetId: d.assetId,
          deviceName: d.deviceName || "Hardware Asset",
          model: d.model || d.brand || "Standard",
          serialNumber: d.serialNumber || "N/A",
          decommissionReason: d.remarks || d.location || "Decommissioned via Maintenance",
          condition: "Beyond Repair",
          disposalStatus: "Pending Disposal",
          recyclingVendor: "GreenIndia Certified E-Waste Recyclers",
          decommissionDate: d.allocatedDate || new Date().toISOString().split("T")[0],
        }));
      }

      setRecords(ewasteData);

      const eligible = allDevs.filter((d) => (d.status || "").toLowerCase() !== "e-waste");
      setDevices(eligible);
      if (eligible.length > 0) {
        setDecomForm((prev) => ({ ...prev, assetId: eligible[0].assetId }));
      }
    } catch (error) {
      console.error("Failed to load e-waste data:", error);
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

  const filteredRecords = useMemo(() => {
    if (statusFilter === "All Disposal Statuses") return records;
    return records.filter((r) => r.disposalStatus === statusFilter);
  }, [records, statusFilter]);

  const handleOpenUpdate = (record) => {
    setSelectedRecord(record);
    setUpdateStatus(record.disposalStatus || "Sent for Recycling");
    setUpdateVendor(record.recyclingVendor || "GreenIndia Certified E-Waste Recyclers");
    setCertificateNumber(record.certificateNumber || "");
    setOpenUpdateModal(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/ewaste/${selectedRecord.ewasteId}`, {
        disposalStatus: updateStatus,
        recyclingVendor: updateVendor,
        certificateNumber,
      });

      setOpenUpdateModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecommissionSubmit = async (e) => {
    e.preventDefault();
    if (!decomForm.assetId || !decomForm.decommissionReason.trim()) {
      alert("Please select an asset and supply a decommissioning reason.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/ewaste", decomForm);
      setOpenDecomModal(false);
      setDecomForm({
        assetId: "",
        decommissionReason: "",
        condition: "Beyond Repair",
        disposalStatus: "Sent for Recycling",
        recyclingVendor: "GreenIndia Certified E-Waste Recyclers",
        remarks: "",
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to decommission asset.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", overflowX: "hidden" }}>
      <Sidebar activeTab="ewaste" username={username} onLogout={handleLogout} />

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
              College Asset Portal
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Electronic Device Management System
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTAINER */}
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
        {/* HEADER PANEL */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DeleteOutlineOutlinedIcon sx={{ color: "#ef4444", fontSize: 26 }} />
              <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                E-Waste & Asset Decommissioning Management
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Compliant disposal, recycling tracking, and end-of-lifecycle records for electronic equipment
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListOutlinedIcon sx={{ color: "#64748b", fontSize: 20 }} />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  {DISPOSAL_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={() => setOpenDecomModal(true)}
              sx={{
                backgroundColor: "#dc2626",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "8px",
                boxShadow: "none",
                px: 2.2,
                "&:hover": { backgroundColor: "#b91c1c" },
              }}
            >
              Decommission Asset
            </Button>
          </Box>
        </Paper>

        {/* REGISTRY TABLE */}
        <Paper elevation={0} sx={{ p: "20px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", mb: 2 }}>
            Decommissioned Assets Registry ({filteredRecords.length})
          </Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#ffffff" }}>
                <TableRow sx={{ borderBottom: "2px solid #f1f5f9" }}>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>E-WASTE ID</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>ASSET ID</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>DEVICE / MODEL</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>SERIAL NUMBER</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>DECOMMISSION REASON</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>CONDITION</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>DISPOSAL STATUS</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>RECYCLING VENDOR</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5 }}>DATE</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.5, textAlign: "right" }}>ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={26} />
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6, color: "#64748b", fontSize: "13px" }}>
                      No decommissioned assets recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((row) => (
                    <TableRow key={row.ewasteId || row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      {/* E-WASTE ID */}
                      <TableCell sx={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                        {row.ewasteId}
                      </TableCell>

                      {/* ASSET ID */}
                      <TableCell sx={{ fontWeight: 800, color: "#0f172a", fontSize: "13px" }}>
                        {row.assetId}
                      </TableCell>

                      {/* DEVICE / MODEL */}
                      <TableCell>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                          {row.deviceName}
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", color: "#64748b" }}>
                          {row.model}
                        </Typography>
                      </TableCell>

                      {/* SERIAL NUMBER */}
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", color: "#475569" }}>
                        {row.serialNumber}
                      </TableCell>

                      {/* REASON */}
                      <TableCell sx={{ fontSize: "12.5px", color: "#475569", maxWidth: 200 }}>
                        {row.decommissionReason}
                      </TableCell>

                      {/* CONDITION */}
                      <TableCell>
                        <Chip
                          label={row.condition || "Beyond Repair"}
                          size="small"
                          sx={{
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                            fontWeight: 700,
                            fontSize: "11px",
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>

                      {/* DISPOSAL STATUS */}
                      <TableCell>
                        <Chip
                          label={row.disposalStatus || "Sent for Recycling"}
                          size="small"
                          sx={{
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            fontWeight: 600,
                            fontSize: "11px",
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>

                      {/* VENDOR */}
                      <TableCell sx={{ fontSize: "12.5px", color: "#1e293b", fontWeight: 500 }}>
                        {row.recyclingVendor}
                      </TableCell>

                      {/* DATE */}
                      <TableCell sx={{ fontSize: "12px", color: "#64748b" }}>
                        {row.decommissionDate}
                      </TableCell>

                      {/* ACTION */}
                      <TableCell sx={{ textAlign: "right" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleOpenUpdate(row)}
                          sx={{
                            borderColor: "#cbd5e1",
                            color: "#334155",
                            textTransform: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "6px",
                            px: 1.5,
                            "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                          }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* UPDATE DISPOSAL STATUS MODAL */}
        <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>
              Update Record: {selectedRecord?.ewasteId}
            </Typography>
            <IconButton onClick={() => setOpenUpdateModal(false)}><CloseOutlinedIcon /></IconButton>
          </DialogTitle>
          <Divider />

          <Box component="form" onSubmit={handleSaveUpdate}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Disposal Status *</InputLabel>
                <Select
                  notched
                  label="Disposal Status *"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  sx={{ borderRadius: "8px" }}
                >
                  <MenuItem value="Pending Disposal">Pending Disposal</MenuItem>
                  <MenuItem value="Sent for Recycling">Sent for Recycling</MenuItem>
                  <MenuItem value="Disposed / Scrapped">Disposed / Scrapped</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Recycling Vendor / Contractor"
                InputLabelProps={{ shrink: true }}
                value={updateVendor}
                onChange={(e) => setUpdateVendor(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              <TextField
                fullWidth
                size="small"
                label="Destruction Certificate / Manifest No."
                InputLabelProps={{ shrink: true }}
                placeholder="e.g. CERT-EW-2026-09"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenUpdateModal(false)} variant="outlined" sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  backgroundColor: "#dc2626",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#b91c1c" },
                }}
              >
                {submitting ? "Saving..." : "Save Record"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* DECOMMISSION ASSET MODAL */}
        <Dialog open={openDecomModal} onClose={() => setOpenDecomModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#dc2626" }}>
              Decommission Equipment to E-Waste
            </Typography>
            <IconButton onClick={() => setOpenDecomModal(false)}><CloseOutlinedIcon /></IconButton>
          </DialogTitle>
          <Divider />

          <Box component="form" onSubmit={handleDecommissionSubmit}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Select Asset to Condemn *</InputLabel>
                <Select
                  notched
                  label="Select Asset to Condemn *"
                  value={decomForm.assetId}
                  onChange={(e) => setDecomForm({ ...decomForm, assetId: e.target.value })}
                >
                  {devices.map((d) => (
                    <MenuItem key={d.assetId} value={d.assetId}>
                      {d.assetId} — {d.deviceName} ({d.model}) | Loc: {d.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Decommission Reason / Technical Justification *"
                InputLabelProps={{ shrink: true }}
                placeholder="e.g. Severe motherboard short circuit; repair cost exceeds market value."
                value={decomForm.decommissionReason}
                onChange={(e) => setDecomForm({ ...decomForm, decommissionReason: e.target.value })}
                required
              />

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Disposal Status</InputLabel>
                  <Select
                    notched
                    label="Disposal Status"
                    value={decomForm.disposalStatus}
                    onChange={(e) => setDecomForm({ ...decomForm, disposalStatus: e.target.value })}
                  >
                    <MenuItem value="Sent for Recycling">Sent for Recycling</MenuItem>
                    <MenuItem value="Pending Disposal">Pending Disposal</MenuItem>
                    <MenuItem value="Disposed / Scrapped">Disposed / Scrapped</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel shrink>Recycling Vendor</InputLabel>
                  <Select
                    notched
                    label="Recycling Vendor"
                    value={decomForm.recyclingVendor}
                    onChange={(e) => setDecomForm({ ...decomForm, recyclingVendor: e.target.value })}
                  >
                    {RECYCLING_VENDORS.map((v) => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Remarks"
                InputLabelProps={{ shrink: true }}
                value={decomForm.remarks}
                onChange={(e) => setDecomForm({ ...decomForm, remarks: e.target.value })}
                placeholder="e.g. Approved by MCA HOD for condemnation."
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenDecomModal(false)} variant="outlined" sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  backgroundColor: "#dc2626",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#b91c1c" },
                }}
              >
                {submitting ? "Decommissioning..." : "Confirm Decommission"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
}

export default EWasteManagement;