import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Typography,
  Container,
  Stack,
  Paper,
  Grid,
} from "@mui/material";

import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    [
      Inventory2OutlinedIcon,
      "Asset Registration",
      "Register electronic devices with complete asset details.",
    ],
    [
      LaptopOutlinedIcon,
      "Inventory Management",
      "Keep all electronic assets organized centrally.",
    ],
    [
      LocationOnOutlinedIcon,
      "Device Allocation",
      "Assign devices to laboratories, offices, classrooms and staff.",
    ],
    [
      TrendingUpOutlinedIcon,
      "Asset Tracking",
      "Track location, availability and device status.",
    ],
    [
      BuildOutlinedIcon,
      "Maintenance",
      "Report device problems and manage maintenance activities.",
    ],
    [
      DeleteSweepOutlinedIcon,
      "E-Waste",
      "Manage unusable devices and their retirement.",
    ],
  ];

  const workflow = [
    ["01", "Register", "Add device and asset details."],
    ["02", "Allocate", "Assign devices to locations or staff."],
    ["03", "Maintain", "Track problems and maintenance."],
    ["04", "Retire", "Manage unusable devices and e-waste."],
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        overflowX: "hidden",
      }}
    >
      {/* NAVBAR */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              minHeight: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                src="/fisat-logo.png"
                alt="FISAT Logo"
                sx={{
                  width: { xs: 42, sm: 50 },
                  height: { xs: 42, sm: 50 },
                  objectFit: "contain",
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 21 },
                    lineHeight: 1.2,
                  }}
                >
                  DeviceHub
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 8, sm: 10 },
                    color: "#64748b",
                    fontWeight: 600,
                    letterSpacing: 0.6,
                  }}
                >
                  FISAT ELECTRONIC ASSET MANAGEMENT
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                onClick={() => navigate("/staff-login")}
                sx={{
                  textTransform: "none",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: { xs: 12, sm: 14 },
                  minWidth: "auto",
                }}
              >
                Staff Login
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/admin-login")}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2.5 },
                  py: 1,
                  fontWeight: 700,
                  background: "#2563eb",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: "#1d4ed8",
                    boxShadow: "none",
                  },
                }}
              >
                Admin Login
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* HERO */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,#eff6ff 0%,#ffffff 55%,#f8fafc 100%)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={{ xs: 4, md: 6 }}
            alignItems="center"
            sx={{ py: { xs: 6, md: 9 } }}
          >
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  mb: 3,
                  borderRadius: 5,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#2563eb",
                  }}
                />

                <Typography fontSize={11} fontWeight={800}>
                  BUILT FOR FISAT CAMPUS
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 39, sm: 48, md: 58 },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: { xs: -1.5, md: -2.5 },
                }}
              >
                Manage Every Device.
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#2563eb",
                    mt: 0.5,
                  }}
                >
                  Track Every Asset.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  mb: 4,
                  maxWidth: 540,
                  color: "#64748b",
                  fontSize: { xs: 14, sm: 16 },
                  lineHeight: 1.9,
                }}
              >
                A centralized electronic asset management platform designed
                to register, allocate, track, maintain and retire devices
                across the Federal Institute of Science and Technology
                (FISAT).
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ maxWidth: { xs: 300, sm: "none" } }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin-login")}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    background: "#2563eb",
                    boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                    "&:hover": {
                      background: "#1d4ed8",
                    },
                  }}
                >
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/staff-login")}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    "&:hover": {
                      borderColor: "#2563eb",
                      background: "#eff6ff",
                    },
                  }}
                >
                  Staff Portal
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 4 }}
              >
                <LocationOnOutlinedIcon
                  sx={{ color: "#2563eb", fontSize: 20 }}
                />

                <Typography fontSize={12} color="#64748b">
                  Hormis Nagar, Mookkannoor, Kerala
                </Typography>
              </Stack>
            </Grid>

            {/* FISAT CAMPUS IMAGE */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", width: "100%" }}>
                <Box
                  component="img"
                  src="/fisat-campus.jpg"
                  alt="FISAT Campus, Hormis Nagar"
                  sx={{
                    display: "block",
                    width: "100%",
                    height: { xs: 280, sm: 360, md: 420 },
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "4px solid #ffffff",
                    boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
                  }}
                />

                <Paper
                  elevation={0}
                  sx={{
                    position: "absolute",
                    left: { xs: 12, sm: 20 },
                    right: { xs: 12, sm: 20 },
                    bottom: 18,
                    p: 2,
                    borderRadius: 2.5,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Inventory2OutlinedIcon
                        sx={{ color: "#2563eb", fontSize: 24 }}
                      />
                    </Box>

                    <Box>
                      <Typography fontWeight={800} fontSize={14}>
                        One Campus. One Inventory.
                      </Typography>

                      <Typography fontSize={11} color="#64748b">
                        Smarter electronic asset management
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box textAlign="center" mb={5}>
          <Typography
            color="#2563eb"
            fontWeight={800}
            fontSize={12}
            letterSpacing={1.2}
          >
            CORE FEATURES
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontSize: { xs: 29, md: 38 },
              fontWeight: 800,
              mt: 1,
            }}
          >
            Everything in One Place
          </Typography>

          <Typography color="#64748b" mt={1.5}>
            Simple tools for complete campus asset management.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map(([Icon, title, description]) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: 195,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: "#bfdbfe",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <Icon sx={{ fontSize: 25 }} />
                </Box>

                <Typography fontWeight={800} fontSize={17}>
                  {title}
                </Typography>

                <Typography
                  color="#64748b"
                  fontSize={13}
                  lineHeight={1.8}
                  mt={1}
                >
                  {description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ASSET LIFECYCLE */}
      <Box
        sx={{
          background: "#0f172a",
          color: "#ffffff",
          py: { xs: 6, md: 9 },
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={5}>
            <Typography
              color="#60a5fa"
              fontWeight={800}
              fontSize={12}
              letterSpacing={1.2}
            >
              ASSET LIFECYCLE
            </Typography>

            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 29, md: 38 },
                fontWeight: 800,
                mt: 1,
              }}
            >
              From Registration to Retirement
            </Typography>

            <Typography color="#94a3b8" mt={1.5} fontSize={14}>
              Follow every device through its entire lifecycle.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {workflow.map(([number, title, description]) => (
              <Grid item xs={12} sm={6} md={3} key={number}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    minHeight: 175,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#60a5fa",
                      background: "rgba(255,255,255,0.075)",
                    },
                  }}
                >
                  <Typography
                    color="#60a5fa"
                    fontWeight={900}
                    fontSize={14}
                    letterSpacing={1}
                  >
                    {number}
                  </Typography>

                  <Typography fontWeight={800} fontSize={20} mt={2}>
                    {title}
                  </Typography>

                  <Typography
                    color="#94a3b8"
                    fontSize={13}
                    lineHeight={1.8}
                    mt={1}
                  >
                    {description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CALL TO ACTION */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            background:
              "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)",
            border: "1px solid #bfdbfe",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <LaptopOutlinedIcon
              sx={{ fontSize: 34, color: "#2563eb" }}
            />
          </Box>

          <Typography
            component="h2"
            sx={{
              fontSize: { xs: 27, md: 36 },
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Manage Your Campus Assets Smarter.
          </Typography>

          <Typography
            color="#64748b"
            mt={2}
            mb={3}
            sx={{
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.8,
              fontSize: 14,
            }}
          >
            Bring device registration, allocation, tracking, maintenance
            and e-waste management together in one platform.
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/admin-login")}
            sx={{
              px: 3.5,
              py: 1.4,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              background: "#2563eb",
              boxShadow: "none",
              "&:hover": {
                background: "#1d4ed8",
                boxShadow: "none",
              },
            }}
          >
            Open Admin Portal
          </Button>
        </Paper>
      </Container>

      {/* FOOTER */}
      <Box
        sx={{
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                component="img"
                src="/fisat-logo.png"
                alt="FISAT Logo"
                sx={{
                  width: 30,
                  height: 30,
                  objectFit: "contain",
                }}
              />

              <Typography fontWeight={800} fontSize={15}>
                DeviceHub
              </Typography>
            </Stack>

            <Typography
              fontSize={12}
              color="#64748b"
              textAlign="center"
            >
              FISAT Electronic Asset Management System © 2026
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;