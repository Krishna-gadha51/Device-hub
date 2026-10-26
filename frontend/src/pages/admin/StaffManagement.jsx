import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
} from "@mui/material";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const sidebarWidth = drawerWidth || 240;

// Institutional Department List
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

// College Faculty & Staff Designation List
const INSTITUTIONAL_DESIGNATIONS = [
  "Professor & Head of Department (HOD)",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
  "Head",
  "Lecturer",
  "Laboratory In-Charge",
  "Senior Lab Assistant",
  "Lab Assistant / Technician",
  " Lab Instructor",
  "System Administrator",
  "Network Administrator",
  "Librarian / Assistant Librarian",
  "Placement Officer",
  "Administrative Officer",
  "Office Superintendent",
  "Store In-Charge",
  "Technical Assistant",
  "Other",
];

function StaffManagement() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search state

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "Computer Applications (MCA)",
    designation: "Assistant Professor",
  });

  const fetchStaff = async () => {
    setLoading(true);
    setPageError("");
    try {
      const response = await API.get("/staff-management");
      const rawData = response.data || [];

      // Sort staff strictly alphabetical by name (A-Z)
      const sortedData = rawData.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setStaffList(sortedData);
    } catch (err) {
      console.error("Error loading staff directory:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Failed to load staff directory.";
      setPageError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenAddModal = () => {
    setEditingStaffId(null);
    setErrorMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      department: "Computer Applications (MCA)",
      designation: "Assistant Professor",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaffId(staff._id);
    setErrorMessage("");
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      password: "", // Keep blank unless updating
      department: staff.department || "Computer Applications (MCA)",
      designation: staff.designation || "Assistant Professor",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStaffId(null);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!editingStaffId && (!formData.password || formData.password.length < 6)) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (editingStaffId && formData.password && formData.password.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const generatedUsername = formData.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
      const payload = {
        ...formData,
        username: generatedUsername,
      };

      if (editingStaffId) {
        await API.put(`/staff-management/${editingStaffId}`, payload);
      } else {
        await API.post("/staff-management", payload);
      }
      handleCloseModal();
      fetchStaff();
    } catch (err) {
      console.error("Staff save error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Failed to save staff member.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/staff-management/${id}/toggle-status`);
      setStaffList((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Filtered staff list based on search query by name
  const filteredStaffList = staffList.filter((staff) =>
    (staff.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", overflowX: "hidden" }}>
      <Sidebar activeTab="admin-staff" username={username} onLogout={handleLogout} />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${sidebarWidth}px)`,
          left: `${sidebarWidth}px`,
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
                admin@devicehub.edu • <span style={{ color: "#1769ff", fontWeight: 700 }}>Admin</span>
              </Typography>
            </Box>
            <Avatar sx={{ backgroundColor: "#e0edff", color: "#1769ff", width: 38, height: 38, fontWeight: 700 }}>
              C
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${sidebarWidth}px)`,
          marginLeft: `${sidebarWidth}px`,
          marginTop: "64px",
          padding: { xs: 2.5, sm: 3.5, md: 4 },
          boxSizing: "border-box",
        }}
      >
        {pageError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }} onClose={() => setPageError("")}>
            {pageError}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <GroupOutlinedIcon sx={{ color: "#1769ff", fontSize: 26 }} />
              <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                Staff Account Management
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13.5px", color: "#64748b", mt: 0.5 }}>
              Create, manage, and assign permissions for laboratory in-charges and faculty members
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PersonAddAlt1OutlinedIcon />}
            onClick={handleOpenAddModal}
            sx={{
              backgroundColor: "#1e3a8a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              py: 0.9,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#172554", boxShadow: "none" },
            }}
          >
            + Add Staff Member
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Header & Search Bar Bar */}
          <Box sx={{ p: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Staff Accounts Directory ({filteredStaffList.length})
            </Typography>

            <TextField
              size="small"
              placeholder="Search staff by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", sm: "260px" }, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow sx={{ borderBottom: "1px solid #e2e8f0" }}>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>STAFF NAME</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>EMAIL ADDRESS</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>DEPARTMENT</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>DESIGNATION</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>ROLE</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8 }}>ACCOUNT STATUS</TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#475569", py: 1.8, textAlign: "right" }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filteredStaffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#64748b" }}>
                      {searchQuery ? "No staff members found matching your search." : 'No staff accounts found. Click "+ Add Staff Member" to add one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaffList.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#1769ff", width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                            {(row.name || "S").charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                            {row.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.8 }}>
                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                          {row.email}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ fontSize: "13px", color: "#334155", py: 1.8 }}>
                        {row.department || "Computer Applications (MCA)"}
                      </TableCell>

                      <TableCell sx={{ fontSize: "13px", color: "#334155", py: 1.8 }}>
                        {row.designation || "Assistant Professor"}
                      </TableCell>

                      <TableCell sx={{ py: 1.8 }}>
                        <Chip
                          label="Staff"
                          size="small"
                          sx={{
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            fontSize: "11px",
                            borderRadius: "6px",
                            height: "22px",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.8 }}>
                        <Chip
                          label={row.status || "Active"}
                          size="small"
                          sx={{
                            backgroundColor: row.status === "Inactive" ? "#fee2e2" : "#ecfdf5",
                            color: row.status === "Inactive" ? "#b91c1c" : "#047857",
                            fontWeight: 700,
                            fontSize: "11px",
                            borderRadius: "6px",
                            height: "22px",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.8, textAlign: "right" }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleOpenEditModal(row)}
                            sx={{
                              textTransform: "none",
                              color: "#475569",
                              borderColor: "#cbd5e1",
                              fontSize: "12px",
                              fontWeight: 600,
                              py: 0.4,
                              px: 1.2,
                              borderRadius: "6px",
                              "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PowerSettingsNewOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleToggleStatus(row._id)}
                            sx={{
                              textTransform: "none",
                              color: row.status === "Inactive" ? "#16a34a" : "#dc2626",
                              borderColor: row.status === "Inactive" ? "#bbf7d0" : "#fecaca",
                              fontSize: "12px",
                              fontWeight: 600,
                              py: 0.4,
                              px: 1.2,
                              borderRadius: "6px",
                              "&:hover": {
                                backgroundColor: row.status === "Inactive" ? "#f0fdf4" : "#fef2f2",
                                borderColor: row.status === "Inactive" ? "#86efac" : "#fca5a5",
                              },
                            }}
                          >
                            {row.status === "Inactive" ? "Activate" : "Deactivate"}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Shared Dialog for Add and Edit */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
            {editingStaffId ? "Edit Staff Member" : "Add New Staff Member"}
          </Typography>
          <IconButton size="small" onClick={handleCloseModal}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: "10px !important" }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: "12px" }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSaveStaff}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                Full Name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Prof. David Miller"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                Institutional Email *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="e.g. david.miller@devicehub.edu"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                {editingStaffId ? "Password (Leave blank to keep existing)" : "Password * (Min 6 chars)"}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder={editingStaffId ? "Enter new password to change" : "Enter temporary password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            {/* Department Dropdown */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                Department *
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  {INSTITUTIONAL_DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept} sx={{ fontSize: "13px" }}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Dynamic Designation Dropdown */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                Designation / Role *
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  {INSTITUTIONAL_DESIGNATIONS.map((role) => (
                    <MenuItem key={role} value={role} sx={{ fontSize: "13px" }}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                onClick={handleCloseModal}
                disabled={submitting}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#64748b",
                  borderRadius: "8px",
                  backgroundColor: "#f1f5f9",
                  px: 2,
                  "&:hover": { backgroundColor: "#e2e8f0" },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  backgroundColor: "#1e3a8a",
                  fontWeight: 700,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2.5,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#172554", boxShadow: "none" },
                }}
              >
                {submitting ? "Saving..." : editingStaffId ? "Save Changes" : "Create Account"}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StaffManagement;