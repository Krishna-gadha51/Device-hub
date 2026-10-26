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
  CircularProgress,
} from "@mui/material";

import {
  AddCircleOutlined as AddCircleOutlineIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  ComputerOutlined as ComputerIcon,
  AccessTimeOutlined as AccessTimeIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  BuildOutlined as BuildOutlinedIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from "@mui/icons-material";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

function StaffDashboard() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Staff Member";
  const userEmail = localStorage.getItem("email") || "";
  const department =
    localStorage.getItem("department") || "Computer Applications";

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    assignedDevicesCount: 0,
    pendingRequestsCount: 0,
    approvedRequestsCount: 0,
    problemReportsCount: 0,
  });

  const [assignedDevices, setAssignedDevices] = useState([]);
  const [recentRequisitions, setRecentRequisitions] = useState([]);

  useEffect(() => {
    const fetchStaffDashboard = async () => {
      setLoading(true);

      try {
        const response = await API.get("/staff/dashboard-summary");

        if (response.data) {
          setMetrics(
            response.data.metrics || {
              assignedDevicesCount: 0,
              pendingRequestsCount: 0,
              approvedRequestsCount: 0,
              problemReportsCount: 0,
            }
          );

          setAssignedDevices(response.data.assignedDevices || []);
          setRecentRequisitions(response.data.recentRequisitions || []);
        }
      } catch (err) {
        console.error("Error loading staff dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDashboard();
  }, []);

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
        activeTab="dashboard"
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
                {userEmail ? `${userEmail} • ` : ""}
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
        {/* HERO BANNER */}
        <Box
          sx={{
            p: "28px 32px",
            mb: 3,
            borderRadius: "16px",
            backgroundColor: "#1769ff",
            color: "#ffffff",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Chip
              label="Staff Portal"
              size="small"
              sx={{
                backgroundColor: "#ffffff",
                color: "#1769ff",
                fontWeight: 700,
                fontSize: "11px",
                height: "22px",
                mb: 1.5,
                borderRadius: "6px",
              }}
            />

            <Typography
              sx={{
                fontSize: "28px",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Welcome back, {username}!
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                opacity: 0.9,
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              {department} • Personal Allocated Equipment Portal
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: { xs: 1, md: 0 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate("/staff/request-device")}
              sx={{
                backgroundColor: "#ffffff",
                color: "#1769ff",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "none",
                borderRadius: "8px",
                px: 2.2,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#f0f4ff",
                  color: "#0d5be1",
                },
              }}
            >
              Request New Device
            </Button>

            <Button
              variant="outlined"
              startIcon={<ReportProblemOutlinedIcon />}
              onClick={() => navigate("/staff/report-problem")}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.7)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "none",
                borderRadius: "8px",
                px: 2.2,
                "&:hover": {
                  borderColor: "#ffffff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Report a Problem
            </Button>
          </Stack>
        </Box>

        {/* METRICS GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
            mb: 3.5,
          }}
        >
          {/* ASSIGNED DEVICES */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                  }}
                >
                  ASSIGNED DEVICES
                </Typography>

                <Typography
                  sx={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#0f172a",
                    mt: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {metrics.assignedDevicesCount}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mt: 0.5,
                  }}
                >
                  Allocated to you
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1769ff",
                }}
              >
                <ComputerIcon fontSize="small" />
              </Box>
            </Box>
          </Paper>

          {/* PENDING REQUESTS */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                  }}
                >
                  PENDING REQUESTS
                </Typography>

                <Typography
                  sx={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#0f172a",
                    mt: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {metrics.pendingRequestsCount}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mt: 0.5,
                  }}
                >
                  Under admin review
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d97706",
                }}
              >
                <AccessTimeIcon fontSize="small" />
              </Box>
            </Box>
          </Paper>

          {/* APPROVED REQUESTS */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                  }}
                >
                  APPROVED REQUESTS
                </Typography>

                <Typography
                  sx={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#0f172a",
                    mt: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {metrics.approvedRequestsCount}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mt: 0.5,
                  }}
                >
                  Ready for allocation
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                }}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </Box>
            </Box>
          </Paper>

          {/* PROBLEM REPORTS */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                  }}
                >
                  PROBLEM REPORTS
                </Typography>

                <Typography
                  sx={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#0f172a",
                    mt: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {metrics.problemReportsCount}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mt: 0.5,
                  }}
                >
                  Submitted service tickets
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                }}
              >
                <BuildOutlinedIcon fontSize="small" />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* 2 PANELS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "7fr 5fr",
            },
            gap: 3,
          }}
        >
          {/* PANEL 1: MY ASSIGNED EQUIPMENT */}
          <Paper
            elevation={0}
            sx={{
              p: "20px 24px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <ComputerIcon
                  sx={{
                    color: "#1769ff",
                    fontSize: 20,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  My Assigned Equipment
                </Typography>
              </Stack>

              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/staff/devices")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#1769ff",
                  p: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                View All ({metrics.assignedDevicesCount})
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#ffffff" }}>
                  <TableRow
                    sx={{
                      borderBottom: "2px solid #f1f5f9",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        py: 1.5,
                      }}
                    >
                      ASSET ID
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        py: 1.5,
                      }}
                    >
                      DEVICE NAME
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        py: 1.5,
                      }}
                    >
                      LOCATION
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        py: 1.5,
                      }}
                    >
                      STATUS
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ py: 4 }}
                      >
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : assignedDevices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{
                          py: 4,
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        No devices currently assigned to your account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedDevices.map((device) => (
                      <TableRow
                        key={device._id || device.assetId}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#1769ff",
                            fontSize: "13px",
                            py: 1.5,
                          }}
                        >
                          {device.assetId}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1e293b",
                            py: 1.5,
                          }}
                        >
                          {device.deviceName}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {device.location || "Designated Location"}
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={device.status || "Allocated"}
                            size="small"
                            sx={{
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              fontWeight: 600,
                              fontSize: "11px",
                              borderRadius: "6px",
                              height: "22px",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* PANEL 2: MY RECENT REQUISITIONS */}
          <Paper
            elevation={0}
            sx={{
              p: "20px 24px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <AccessTimeIcon
                  sx={{
                    color: "#1769ff",
                    fontSize: 20,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  My Recent Requisitions
                </Typography>
              </Stack>

              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/staff/requests-status")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#1769ff",
                  p: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                All Requests
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : recentRequisitions.length === 0 ? (
                <Box
                  sx={{
                    py: 3,
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  No device requisitions submitted yet.
                </Box>
              ) : (
                recentRequisitions.map((req) => (
                  <Paper
                    key={req._id || req.requestId}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "10px",
                      border: "1px solid #f1f5f9",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {req.requestId}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            mt: 0.3,
                          }}
                        >
                          {req.quantity || 1} {req.deviceType} for{" "}
                          {req.requiredLocation || "Location"}
                        </Typography>
                      </Box>

                      <Chip
                        label={req.status || "Pending"}
                        size="small"
                        sx={{
                          backgroundColor:
                            req.status === "Approved"
                              ? "#ecfdf5"
                              : req.status === "Pending"
                              ? "#fef9c3"
                              : "#fee2e2",

                          color:
                            req.status === "Approved"
                              ? "#047857"
                              : req.status === "Pending"
                              ? "#a16207"
                              : "#b91c1c",

                          fontWeight: 700,
                          fontSize: "11px",
                          borderRadius: "6px",
                          height: "22px",
                        }}
                      />
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default StaffDashboard;