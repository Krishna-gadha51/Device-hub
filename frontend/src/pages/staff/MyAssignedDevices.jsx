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
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import {
  LaptopOutlined as LaptopOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  BuildOutlined as BuildOutlinedIcon,
  DevicesOtherOutlined as DevicesOtherOutlinedIcon,
} from "@mui/icons-material";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

function MyAssignedDevices() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Staff Member";
  const userEmail = localStorage.getItem("email") || "";

  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDevices = async (query = "") => {
    setLoading(true);

    try {
      // Calls the dedicated staff endpoint with query params
      const response = await API.get("/staff/my-devices", {
        params: query ? { search: query } : {},
      });

      setDevices(response.data.devices || []);
    } catch (err) {
      console.error("Error fetching staff assigned devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchDevices(term);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleReportIssue = (device) => {
    navigate("/staff/report-problem", {
      state: { device },
    });
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
        activeTab="devices"
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

          {/* FIXED: alignItems moved into sx */}
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
        {/* HEADER & SUMMARY */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
          }}
        >
          <Box>
            {/* FIXED: alignItems moved into sx */}
            <Stack
              direction="row"
              spacing={1.2}
              sx={{
                alignItems: "center",
              }}
            >
              <LaptopOutlinedIcon
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
                My Assigned Devices
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#64748b",
                mt: 0.5,
              }}
            >
              List of electronic equipment specifically allocated to your
              custody
            </Typography>
          </Box>

          <Chip
            label={`Total Assigned: ${devices.length} Devices`}
            sx={{
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: "12px",
              height: "32px",
              borderRadius: "8px",
              px: 1,
            }}
          />
        </Box>

        {/* SEARCH BAR */}
        <Paper
          elevation={0}
          sx={{
            p: "14px 20px",
            mb: 2,
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* FIXED: alignItems moved into sx */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <DevicesOtherOutlinedIcon
              sx={{
                color: "#1769ff",
                fontSize: 20,
              }}
            />

            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Custodian: {username}
            </Typography>
          </Stack>

          <TextField
            size="small"
            placeholder="Search by Asset ID, Model, or Serial Number..."
            value={searchTerm}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon
                      sx={{
                        color: "#94a3b8",
                        fontSize: 18,
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                sm: 340,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                fontSize: "13px",
              },
            }}
          />
        </Paper>

        {/* TABLE */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
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
                    DEVICE NAME
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    TYPE
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    BRAND & MODEL
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    SERIAL NUMBER
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

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                  >
                    CONDITION
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#475569",
                      py: 1.8,
                    }}
                    align="right"
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{
                        py: 6,
                      }}
                    >
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{
                        py: 5,
                        color: "#64748b",
                        fontSize: "13.5px",
                      }}
                    >
                      No devices currently allocated to your account.
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => {
                    const brandModel =
                      [device.brand, device.model]
                        .filter(Boolean)
                        .join(" ") || "—";

                    return (
                      <TableRow
                        key={device._id || device.assetId}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                          "&:hover": {
                            backgroundColor: "#f8fafc",
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
                            fontWeight: 600,
                            color: "#0f172a",
                            py: 1.5,
                          }}
                        >
                          {device.deviceName}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#475569",
                            py: 1.5,
                          }}
                        >
                          {device.deviceType || "Computer"}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#475569",
                            py: 1.5,
                          }}
                        >
                          {brandModel}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12px",
                            fontFamily: "monospace",
                            color: "#64748b",
                            py: 1.5,
                          }}
                        >
                          {device.serialNumber || "—"}
                        </TableCell>

                        <TableCell
                          sx={{
                            py: 1.5,
                          }}
                        >
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

                        <TableCell
                          sx={{
                            py: 1.5,
                          }}
                        >
                          <Chip
                            label={device.condition || "Good"}
                            size="small"
                            sx={{
                              backgroundColor:
                                device.condition === "Needs Repair"
                                  ? "#fee2e2"
                                  : device.condition === "Fair"
                                  ? "#fef9c3"
                                  : "#ecfdf5",

                              color:
                                device.condition === "Needs Repair"
                                  ? "#b91c1c"
                                  : device.condition === "Fair"
                                  ? "#a16207"
                                  : "#047857",

                              fontWeight: 600,
                              fontSize: "11px",
                              borderRadius: "6px",
                              height: "22px",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            py: 1.5,
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={
                              <BuildOutlinedIcon
                                sx={{
                                  fontSize: 14,
                                }}
                              />
                            }
                            onClick={() => handleReportIssue(device)}
                            sx={{
                              borderColor: "#fde68a",
                              backgroundColor: "#fffbeb",
                              color: "#d97706",
                              fontWeight: 600,
                              fontSize: "11px",
                              textTransform: "none",
                              borderRadius: "6px",
                              px: 1.5,
                              py: 0.4,

                              "&:hover": {
                                borderColor: "#d97706",
                                backgroundColor: "#fef3c7",
                              },
                            }}
                          >
                            Report Issue
                          </Button>
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

export default MyAssignedDevices;