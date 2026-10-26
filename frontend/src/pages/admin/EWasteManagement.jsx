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
  "Sent to Recycler",
  "Dismantled for Parts",
];

function EWasteManagement() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Disposal Statuses");

  // Update Status Modal State
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
        console.warn("Dedicated e-waste endpoint lookup skipped.");
      }

      setRecords(ewasteData);
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
    setUpdateVendor(record.disposalVendor || record.recyclingVendor || "GreenIndia Certified E-Waste Recyclers");
    setCertificateNumber(record.certificateNumber || "");
    setOpenUpdateModal(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetId = selectedRecord.scrapId || selectedRecord.ewasteId;
      await API.put(`/ewaste/${targetId}`, {
        disposalStatus: updateStatus,
        disposalVendor: updateVendor,
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
                    <TableRow key={row.scrapId || row.ewasteId || row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      {/* E-WASTE ID */}
                      <TableCell sx={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                        {row.scrapId}
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
                          {row.deviceType || "Standard"}
                        </Typography>
                      </TableCell>

                      {/* SERIAL NUMBER */}
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", color: "#475569" }}>
                        {row.serialNumber}
                      </TableCell>

                      {/* REASON */}
                      <TableCell sx={{ fontSize: "12.5px", color: "#475569", maxWidth: 200 }}>
                        {row.reasonForScrap}
                      </TableCell>

                      {/* CONDITION */}
                      <TableCell>
                        <Chip
                          label="Beyond Repair"
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
                          label={row.disposalStatus || "Pending Disposal"}
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
                        {row.disposalVendor}
                      </TableCell>

                      {/* DATE */}
                      <TableCell sx={{ fontSize: "12px", color: "#64748b" }}>
                        {row.disposalDate ? row.disposalDate.split("T")[0] : "—"}
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
              Update Record: {selectedRecord?.scrapId}
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
                  <MenuItem value="Sent to Recycler">Sent to Recycler</MenuItem>
                  <MenuItem value="Dismantled for Parts">Dismantled for Parts</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Recycling Vendor / Contractor"
                slotProps={{ inputLabel: { shrink: true } }}
                value={updateVendor}
                onChange={(e) => setUpdateVendor(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              <TextField
                fullWidth
                size="small"
                label="Destruction Certificate / Manifest No."
                slotProps={{ inputLabel: { shrink: true } }}
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
      </Box>
    </Box>
  );
}

export default EWasteManagement;