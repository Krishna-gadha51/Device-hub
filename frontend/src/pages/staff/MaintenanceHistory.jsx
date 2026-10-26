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

import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const sidebarWidth = drawerWidth || 240;

function MaintenanceHistory() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Prof. John Doe";

  const userEmail =
    localStorage.getItem("email") ||
    `staff.${username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}@devicehub.edu`;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // FETCH STAFF MAINTENANCE TICKETS
  // ======================================================

  const fetchMaintenanceTickets = async () => {
    setLoading(true);

    try {
      const response = await API.get(
        "/staff/maintenance-history"
      );

      setTickets(response.data || []);
    } catch (err) {
      console.error(
        "Error loading maintenance history:",
        err.response || err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceTickets();
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ======================================================
  // STATUS CHIP
  // ======================================================

  const getStatusChip = (status) => {
    const norm = (status || "Reported")
      .trim()
      .toLowerCase();

    // ----------------------------------------------------
    // REPORTED
    // ----------------------------------------------------

    if (
      norm === "reported" ||
      norm === "pending"
    ) {
      return (
        <Chip
          label="Reported"
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
      );
    }

    // ----------------------------------------------------
    // UNDER MAINTENANCE
    // ----------------------------------------------------

    if (norm === "under maintenance") {
      return (
        <Chip
          label="Under Maintenance"
          size="small"
          sx={{
            backgroundColor: "#ffedd5",
            color: "#c2410c",
            fontWeight: 700,
            fontSize: "11px",
            borderRadius: "6px",
            height: "22px",
          }}
        />
      );
    }

    // ----------------------------------------------------
    // RESOLVED
    // ----------------------------------------------------

    if (
      norm === "resolved" ||
      norm === "completed"
    ) {
      return (
        <Chip
          label="Resolved"
          size="small"
          sx={{
            backgroundColor: "#ecfdf5",
            color: "#047857",
            fontWeight: 700,
            fontSize: "11px",
            borderRadius: "6px",
            height: "22px",
          }}
        />
      );
    }

    // ----------------------------------------------------
    // UNREPAIRABLE
    // ----------------------------------------------------

    if (norm === "unrepairable") {
      return (
        <Chip
          label="Unrepairable (E-Waste)"
          size="small"
          sx={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 700,
            fontSize: "11px",
            borderRadius: "6px",
            height: "22px",
          }}
        />
      );
    }

    // ----------------------------------------------------
    // UNKNOWN STATUS
    // ----------------------------------------------------

    return (
      <Chip
        label={status || "Reported"}
        size="small"
        sx={{
          backgroundColor: "#f1f5f9",
          color: "#475569",
          fontWeight: 700,
          fontSize: "11px",
          borderRadius: "6px",
          height: "22px",
        }}
      />
    );
  };

  // ======================================================
  // PAGE
  // ======================================================

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
      {/* SIDEBAR */}

      <Sidebar
        activeTab="staff-maintenance-history"
        username={username}
        onLogout={handleLogout}
      />

      {/* ==================================================
          TOP BAR
      ================================================== */}

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
        <Toolbar
          sx={{
            justifyContent: "space-between",
            padding: "12px 28px !important",
            minHeight: "64px",
          }}
        >
          {/* LEFT */}

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

          {/* RIGHT */}

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

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${sidebarWidth}px)`,
          marginLeft: `${sidebarWidth}px`,
          marginTop: "64px",
          padding: {
            xs: 2.5,
            sm: 3.5,
            md: 4,
          },
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

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
              sx={{ alignItems: "center" }}
            >
              <BuildOutlinedIcon
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
                My Reported Issues & Maintenance Status
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#64748b",
                mt: 0.5,
              }}
            >
              Real-time tracking of problem reports,
              technician updates, and repair completion
            </Typography>
          </Box>

          {/* REPORT NEW PROBLEM */}

          <Button
            variant="contained"
            startIcon={<AddCircleOutlinedIcon />}
            onClick={() =>
              navigate("/staff/report-problem")
            }
            sx={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              py: 0.9,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#d97706",
                boxShadow: "none",
              },
            }}
          >
            + Report New Problem
          </Button>
        </Box>

        {/* ==================================================
            TICKET TABLE
        ================================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* TABLE TITLE */}

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
              Reported Issue Tickets ({tickets.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">

              {/* TABLE HEADER */}

              <TableHead
                sx={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <TableRow
                  sx={{
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    TICKET ID
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    ASSET ID
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    DEVICE / LOCATION
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    CATEGORY
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    ISSUE DESCRIPTION
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    REPORT DATE
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    TECHNICIAN & REPAIR NOTES
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    STATUS
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* ==================================================
                  TABLE BODY
              ================================================== */}

              <TableBody>
                {/* LOADING */}

                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (

                  /* NO TICKETS */

                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{
                        py: 7,
                        color: "#64748b",
                        fontSize: "13.5px",
                      }}
                    >
                      No problems reported yet.
                    </TableCell>
                  </TableRow>
                ) : (

                  /* TICKETS */

                  tickets.map((row) => {
                    const formattedDate =
                      row.createdAt
                        ? new Date(
                            row.createdAt
                          ).toLocaleDateString()
                        : row.reportedDate || "-";

                    return (
                      <TableRow
                        key={
                          row.ticketId || row._id
                        }
                        hover
                      >
                        {/* TICKET ID */}

                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#1769ff",
                            fontSize: "13px",
                            py: 1.5,
                          }}
                        >
                          {row.ticketId}
                        </TableCell>

                        {/* ASSET ID */}

                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: "13px",
                            py: 1.5,
                          }}
                        >
                          {row.assetId}
                        </TableCell>

                        {/* DEVICE / LOCATION */}

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#334155",
                            py: 1.5,
                          }}
                        >
                          {row.deviceName} •{" "}
                          {row.location ||
                            "Computer Lab 1"}
                        </TableCell>

                        {/* CATEGORY */}

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#475569",
                            py: 1.5,
                          }}
                        >
                          {row.problemCategory ||
                            "Hardware Issue"}
                        </TableCell>

                        {/* DESCRIPTION */}

                        <TableCell
                          sx={{
                            fontSize: "12.5px",
                            color: "#334155",
                            maxWidth: 220,
                            py: 1.5,
                          }}
                          noWrap
                        >
                          {row.issueDescription}
                        </TableCell>

                        {/* REPORT DATE */}

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {formattedDate}
                        </TableCell>

                        {/* TECHNICIAN NOTES */}

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {row.technicianNotes ||
                            row.repairNotes ||
                            row.resolutionNotes ||
                            "Awaiting Technician Inspection"}
                        </TableCell>

                        {/* STATUS */}

                        <TableCell
                          sx={{ py: 1.5 }}
                        >
                          {getStatusChip(
                            row.status
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
      </Box>
    </Box>
  );
}

export default MaintenanceHistory;