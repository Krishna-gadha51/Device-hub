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
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";

// Icons
import {
  AccessTimeOutlined as AccessTimeIcon,
  AddCircleOutlined as AddCircleIcon,
  SendOutlined as SendIcon,
  InfoOutlined as InfoIcon,
  LocationOnOutlined as LocationIcon,
} from "@mui/icons-material";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

// Aligned with the device types registered across the system
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

function StaffRequisitions() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Staff Member";

  const userEmail =
    localStorage.getItem("email") ||
    `staff.${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@devicehub.edu`;

  const storedDepartment =
    localStorage.getItem("department") || "Computer Applications (MCA)";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getInitialFormData = () => ({
    deviceType: "Desktop",
    quantity: 1,
    department: storedDepartment,
    requiredLocation: "",
    requiredDate: new Date().toISOString().split("T")[0],
    purpose: "",
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const response = await API.get("/staff/my-requests");
      setRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching requisitions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = () => {
    setErrorMsg("");
    setFormData(getInitialFormData());
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    if (
      !formData.deviceType ||
      !formData.requiredLocation.trim() ||
      !formData.requiredDate ||
      !formData.department
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        requestedBy: username,
        staffName: username,
        staffEmail: userEmail,
      };

      await API.post("/staff/request-device", payload);

      setSuccessMsg(
        "Requisition submitted successfully! IT Admin has been notified."
      );

      setOpenModal(false);
      setFormData(getInitialFormData());

      fetchRequests();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to submit requisition."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
        username={username}
        onLogout={handleLogout}
      />

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
        <Toolbar
          sx={{
            justifyContent: "space-between",
            padding: "12px 28px !important",
            minHeight: "64px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              FISAT Asset Portal
            </Typography>

            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Electronic Device Management System
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                {username}
              </Typography>

              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                {userEmail} •{" "}
                <span
                  style={{
                    color: "#1769ff",
                    fontWeight: 700,
                  }}
                >
                  Staff
                </span>
              </Typography>
            </Box>

            <Avatar
              sx={{
                backgroundColor: "#e0edff",
                color: "#1769ff",
                width: 38,
                height: 38,
                fontWeight: 700,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </Stack>
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
        {/* HEADER SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.2}
              sx={{
                alignItems: "center",
              }}
            >
              <AccessTimeIcon
                sx={{
                  color: "#1769ff",
                  fontSize: 24,
                }}
              />

              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                My Submitted Requisitions
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#64748b",
                mt: 0.5,
              }}
            >
              Track approval, partial delivery notifications, and full allocation status for your equipment requests
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={handleOpenModal}
            sx={{
              backgroundColor: "#1769ff",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              py: 1,
              "&:hover": {
                backgroundColor: "#0d5be1",
              },
            }}
          >
            + New Request
          </Button>
        </Box>

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <Alert
            severity="success"
            sx={{
              mb: 2.5,
              borderRadius: "8px",
            }}
            onClose={() => setSuccessMsg("")}
          >
            {successMsg}
          </Alert>
        )}

        {/* TRACKER TABLE PANEL */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Requisition Status Tracker ({requests.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead
                sx={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <TableRow
                  sx={{
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <TableCell sx={headerCellStyle}>REQUEST ID</TableCell>
                  <TableCell sx={headerCellStyle}>DEVICE TYPE</TableCell>
                  <TableCell sx={headerCellStyle}>ALLOCATED / REQUESTED</TableCell>
                  <TableCell sx={headerCellStyle}>DEPARTMENT</TableCell>
                  <TableCell sx={headerCellStyle}>LOCATION</TableCell>
                  <TableCell sx={headerCellStyle}>REQUIRED DATE</TableCell>
                  <TableCell sx={headerCellStyle}>PURPOSE</TableCell>
                  <TableCell sx={headerCellStyle}>STATUS</TableCell>
                  <TableCell sx={headerCellStyle}>ADMIN REMARKS & NOTIFICATIONS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        py: 6,
                      }}
                    >
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        py: 5,
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      No equipment requisitions submitted yet. Click{" "}
                      <b>+ New Request</b> above to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((row) => {
                    const totalQty = Number(row.quantity) || 1;
                    const allocatedQty = Number(row.allocatedQuantity) || 0;
                    const isPartiallyAllocated = row.status === "Partially Allocated" || (allocatedQty > 0 && allocatedQty < totalQty);

                    return (
                      <TableRow
                        key={row.requestId || row._id}
                        hover
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#1769ff",
                            fontSize: "13px",
                            py: 1.5,
                          }}
                        >
                          {row.requestId}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#1e293b",
                            py: 1.5,
                          }}
                        >
                          {row.deviceType}
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={`${allocatedQty} / ${totalQty} Units`}
                            size="small"
                            sx={{
                              backgroundColor: isPartiallyAllocated ? "#e0f2fe" : "#f1f5f9",
                              color: isPartiallyAllocated ? "#0369a1" : "#334155",
                              fontWeight: 700,
                              fontSize: "11px",
                              height: "22px",
                              border: isPartiallyAllocated ? "1px solid #bae6fd" : "none",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {row.department || "—"}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#475569",
                            py: 1.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{
                              alignItems: "center",
                            }}
                          >
                            <LocationIcon
                              sx={{
                                fontSize: 15,
                                color: "#ef4444",
                              }}
                            />
                            <span>{row.requiredLocation}</span>
                          </Stack>
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {row.requiredDate}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#475569",
                            maxWidth: 200,
                            py: 1.5,
                          }}
                          noWrap
                        >
                          {row.purpose || "—"}
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={
                              isPartiallyAllocated
                                ? "Partially Allocated"
                                : row.status || "Pending"
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                row.status === "Approved"
                                  ? "#ecfdf5"
                                  : row.status === "Pending"
                                  ? "#fef9c3"
                                  : isPartiallyAllocated
                                  ? "#e0f2fe"
                                  : row.status === "Allocated"
                                  ? "#dbeafe"
                                  : "#fee2e2",

                              color:
                                row.status === "Approved"
                                  ? "#047857"
                                  : row.status === "Pending"
                                  ? "#a16207"
                                  : isPartiallyAllocated
                                  ? "#0369a1"
                                  : row.status === "Allocated"
                                  ? "#1d4ed8"
                                  : "#b91c1c",

                              fontWeight: 700,
                              fontSize: "11px",
                              borderRadius: "6px",
                              height: "22px",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#475569",
                            py: 1.5,
                            maxWidth: 220,
                          }}
                        >
                          {row.adminRemarks || row.adminNote || "—"}
                          {isPartiallyAllocated && (
                            <Typography sx={{ fontSize: "10px", color: "#0284c7", fontWeight: 700, mt: 0.5 }}>
                              ℹ️ Remaining balance will be allocated later.
                            </Typography>
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

        {/* DEVICE REQUISITION MODAL */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack
              direction="row"
              spacing={1.2}
              sx={{
                alignItems: "center",
              }}
            >
              <AddCircleIcon
                sx={{
                  color: "#1769ff",
                  fontSize: 24,
                }}
              />

              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Device Requisition Form
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#64748b",
                mt: 0.5,
              }}
            >
              Submit electronic equipment requests for classroom lectures,
              workshops, or departmental labs
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 2 }}>
            {errorMsg && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: "6px",
                }}
              >
                {errorMsg}
              </Alert>
            )}

            <Box
              sx={{
                p: 2,
                mb: 2.5,
                backgroundColor: "#eff6ff",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
                display: "flex",
                gap: 1.2,
                alignItems: "flex-start",
              }}
            >
              <InfoIcon
                sx={{
                  color: "#1d4ed8",
                  fontSize: 20,
                  mt: 0.2,
                }}
              />

              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#1e40af",
                  lineHeight: 1.5,
                }}
              >
                <b>Workflow Note:</b> If your requested quantity is only partially available in stock, Admin can allocate available units right away. You will receive an automated notification remark indicating that the remaining balance is queued for future allocation.
              </Typography>
            </Box>

            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* DEVICE TYPE + QUANTITY */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "2fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      mb: 0.5,
                    }}
                  >
                    Requested Device Type *
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                  >
                    {DEVICE_TYPES.map((type) => (
                      <MenuItem
                        key={type}
                        value={type}
                      >
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      mb: 0.5,
                    }}
                  >
                    Quantity Required *
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    name="quantity"
                    inputProps={{
                      min: 1,
                      max: 50,
                    }}
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </Box>
              </Box>

              {/* DEPARTMENT + DATE */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      mb: 0.5,
                    }}
                  >
                    Department *
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    {INSTITUTIONAL_DEPARTMENTS.map((dept) => (
                      <MenuItem
                        key={dept}
                        value={dept}
                      >
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      mb: 0.5,
                    }}
                  >
                    Required By Date *
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    name="requiredDate"
                    value={formData.requiredDate}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </Box>

              {/* LOCATION */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    mb: 0.5,
                  }}
                >
                  Required Location / Venue *
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  name="requiredLocation"
                  placeholder="e.g. Classroom 201, MCA Lab 1"
                  value={formData.requiredLocation}
                  onChange={handleChange}
                />
              </Box>

              {/* PURPOSE */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    mb: 0.5,
                  }}
                >
                  Purpose of Request *
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  name="purpose"
                  placeholder="e.g. Projector required for MCA 3rd Semester Advanced Web Development Seminar & Project Presentations"
                  value={formData.purpose}
                  onChange={handleChange}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                color: "#64748b",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress
                    size={16}
                    color="inherit"
                  />
                ) : (
                  <SendIcon />
                )
              }
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                backgroundColor: "#1769ff",
                color: "#ffffff",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                px: 2.5,
                "&:hover": {
                  backgroundColor: "#0d5be1",
                },
              }}
            >
              Submit Requisition
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

// Table header style
const headerCellStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#475569",
  py: 1.8,
};

export default StaffRequisitions;