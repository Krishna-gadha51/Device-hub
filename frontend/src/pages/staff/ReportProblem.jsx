import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Avatar,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";

import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

const PROBLEM_CATEGORIES = [
  "Desktop (Not powering on, Boot failure, Motherboard)",
  "Laptop (Battery, Display hinge, Power adapter)",
  "Monitor / Screen (No signal, Flickering, Lines)",
  "Printer (Paper jam, Toner/Ink issue, Connectivity)",
  "Projector (Lamp failure, Blurry lens, Input source issue)",
  "Wi-Fi Access Point (Signal drop, Not broadcasting)",
  "Network Switch (Port failure, Power down)",
  "Router (WAN connection loss, Configuration issue)",
  "UPS (Battery backup failure, Overload warning)",
  "CCTV Camera (Night vision failure, Feed offline)",
  "Keyboard / Mouse (Unresponsive, Button failure)",
  "Smart Board (Touch calibration, Display panel issue)",
  "Scanner (Feed error, Driver recognition failure)",
  "External Hard Drive (Read/Write error, Not spinning)",
  "Server (RAID failure, Overheating, PSU issue)",
  "AC (Not cooling, Compressor issue, Water leakage)",
  "Fan (Not rotating, Noise/Vibration issue)",
  "Other / General Hardware or Software Issue",
];

const sidebarWidth = drawerWidth || 240;

function ReportProblem() {
  const navigate = useNavigate();
  const location = useLocation();

  const username =
    localStorage.getItem("username") || "Prof. John Doe";

  const userEmail =
    localStorage.getItem("email") ||
    `staff.${username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}@devicehub.edu`;

  const preselectedDevice = location.state?.device;

  const [assignedDevices, setAssignedDevices] = useState([]);

  const [selectedAssetId, setSelectedAssetId] = useState(
    preselectedDevice
      ? preselectedDevice.assetId
      : "AST-001"
  );

  const [classification, setClassification] = useState(
    PROBLEM_CATEGORIES[0]
  );

  const [description, setDescription] = useState("");

  const [loadingDevices, setLoadingDevices] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // ======================================================
  // LOAD ASSIGNED DEVICES
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const fetchDevices = async () => {
      setLoadingDevices(true);

      try {
        const response = await API.get(
          "/staff/my-devices"
        );

        const list =
          response.data?.devices ||
          response.data ||
          [];

        if (isMounted) {
          setAssignedDevices(list);

          if (
            !preselectedDevice &&
            list.length > 0
          ) {
            setSelectedAssetId(
              list[0].assetId
            );
          }
        }
      } catch (err) {
        console.error(
          "Error loading assigned devices:",
          err
        );
      } finally {
        if (isMounted) {
          setLoadingDevices(false);
        }
      }
    };

    fetchDevices();

    return () => {
      isMounted = false;
    };
  }, [preselectedDevice]);

  // ======================================================
  // SUBMIT PROBLEM
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !selectedAssetId ||
      !classification ||
      !description.trim()
    ) {
      setErrorMessage(
        "Please fill in all required fields."
      );
      return;
    }

    setSubmitting(true);

    try {
      await API.post(
        "/maintenance",
        {
          assetId: selectedAssetId,
          problemCategory: classification,
          description: description.trim(),
          reportedBy: username,
          cost: 0,
        }
      );

      setSuccessMessage(
        "Problem ticket submitted successfully! " +
        "The ticket is now marked as Reported and is awaiting administrator action."
      );

      setDescription("");

      setTimeout(() => {
        navigate(
          "/staff/maintenance-history"
        );
      }, 1500);
    } catch (err) {
      console.error(
        "Problem report error:",
        err.response || err
      );

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to submit problem report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("staffId");

    navigate("/login");
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
      <Sidebar
        username={username}
        onLogout={handleLogout}
      />

      {/* TOP APP BAR */}

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${sidebarWidth}px)`,
          left: `${sidebarWidth}px`,
          right: 0,
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderBottom:
            "1px solid #e2e8f0",
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            justifyContent:
              "space-between",
            padding:
              "12px 28px !important",
            minHeight: "64px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600,
                letterSpacing:
                  "0.5px",
              }}
            >
              College Asset Portal
            </Typography>

            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
               Electronic Device
              Management System
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "right",
              }}
            >
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
                backgroundColor:
                  "#e0edff",
                color: "#1769ff",
                width: 38,
                height: 38,
                fontWeight: 700,
              }}
            >
              {username
                .charAt(0)
                .toUpperCase()}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}

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
            md: 4.5,
          },
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: "center",
            }}
          >
            <WarningAmberOutlinedIcon
              sx={{
                color: "#f59e0b",
                fontSize: 26,
              }}
            />

            <Typography
              sx={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Report Device Fault or Problem
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontSize: "13.5px",
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Notify IT administration and
            hardware technicians about
            hardware or software issues
          </Typography>
        </Box>

        {/* LIFECYCLE INFORMATION */}

        <Paper
          elevation={0}
          sx={{
            p: "16px 20px",
            mb: 3.5,
            borderRadius: "12px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <InfoOutlinedIcon
            sx={{
              color: "#d97706",
              fontSize: 20,
              mt: 0.2,
            }}
          />

          <Typography
            sx={{
              fontSize: "13px",
              color: "#92400e",
              lineHeight: 1.6,
            }}
          >
            <b>
              Maintenance Lifecycle:
            </b>{" "}
            Submitting this ticket
            creates a{" "}
            <b>Reported</b> maintenance
            ticket. The administrator will
            review the report and can then
            move it to{" "}
            <b>
              Under Maintenance
            </b>
            .
          </Typography>
        </Paper>

        {/* ERROR */}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "8px",
            }}
            onClose={() =>
              setErrorMessage("")
            }
          >
            {errorMessage}
          </Alert>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: "8px",
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* FORM */}

        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: {
              xs: 2.5,
              sm: 4,
            },
            borderRadius: "16px",
            border:
              "1px solid #e2e8f0",
            backgroundColor:
              "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
              mb: 3,
            }}
          >
            {/* DEVICE */}

            <Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  mb: 0.8,
                }}
              >
                Select Assigned Device
                or Enter Asset ID *
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={
                  selectedAssetId
                }
                onChange={(e) =>
                  setSelectedAssetId(
                    e.target.value
                  )
                }
                disabled={
                  loadingDevices ||
                  submitting
                }
              >
                {assignedDevices.length ===
                0 ? (
                  <MenuItem value="AST-001">
                    AST-001 — Dell
                    OptiPlex 7090
                    Desktop
                  </MenuItem>
                ) : (
                  assignedDevices.map(
                    (device) => (
                      <MenuItem
                        key={
                          device.assetId
                        }
                        value={
                          device.assetId
                        }
                      >
                        {
                          device.assetId
                        }{" "}
                        —{" "}
                        {
                          device.deviceName
                        }
                      </MenuItem>
                    )
                  )
                )}
              </TextField>
            </Box>

            {/* CLASSIFICATION */}

            <Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  mb: 0.8,
                }}
              >
                Problem Classification *
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={
                  classification
                }
                onChange={(e) =>
                  setClassification(
                    e.target.value
                  )
                }
                disabled={
                  submitting
                }
              >
                {PROBLEM_CATEGORIES.map(
                  (cat) => (
                    <MenuItem
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Box>
          </Box>

          {/* DESCRIPTION */}

          <Box sx={{ mb: 3.5 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                mb: 0.8,
              }}
            >
              Problem Description *
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the symptoms in detail (e.g. Device is not powering on, LED blinking or showing fault codes.)"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              disabled={submitting}
            />
          </Box>

          {/* BUTTONS */}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/staff/dashboard"
                )
              }
              disabled={submitting}
              sx={{
                textTransform:
                  "none",
                fontWeight: 600,
                fontSize:
                  "13.5px",
                color: "#64748b",
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress
                    size={16}
                    color="inherit"
                  />
                ) : (
                  <SendOutlinedIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />
                )
              }
              disabled={submitting}
              sx={{
                backgroundColor:
                  "#f59e0b",
                color:
                  "#ffffff",
                fontWeight: 700,
                fontSize:
                  "13.5px",
                textTransform:
                  "none",
                borderRadius:
                  "8px",
                px: 3,
                py: 1,
                boxShadow:
                  "none",

                "&:hover": {
                  backgroundColor:
                    "#d97706",
                },
              }}
            >
              {submitting
                ? "Submitting..."
                : "Submit Problem Report"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default ReportProblem;