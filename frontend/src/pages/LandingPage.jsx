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
    [Inventory2OutlinedIcon, "Asset Registration", "Register devices with complete asset details."],
    [LaptopOutlinedIcon, "Inventory Management", "Keep all electronic assets organized centrally."],
    [LocationOnOutlinedIcon, "Device Allocation", "Assign devices to labs, offices, classrooms and staff."],
    [TrendingUpOutlinedIcon, "Asset Tracking", "Track location, availability and device status."],
    [BuildOutlinedIcon, "Maintenance", "Report problems and manage maintenance activities."],
    [DeleteSweepOutlinedIcon, "E-Waste", "Manage unusable devices and their retirement."],
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
      }}
    >
      {/* NAVBAR */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              height: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LaptopOutlinedIcon sx={{ color: "#fff" }} />
              </Box>

              <Box>
                <Typography fontWeight={800} fontSize={20}>
                  DeviceHub
                </Typography>
                <Typography fontSize={9} color="#64748b">
                  ELECTRONIC ASSET MANAGEMENT
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => navigate("/staff-login")}
                sx={{
                  textTransform: "none",
                  color: "#475569",
                  fontWeight: 600,
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
                  background: "#2563eb",
                  boxShadow: "none",
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
            "linear-gradient(135deg,#eff6ff,#fff 60%,#f8fafc)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={6}
            alignItems="center"
            sx={{ py: { xs: 7, md: 9 } }}
          >
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  display: "inline-block",
                  px: 2,
                  py: 0.8,
                  mb: 3,
                  borderRadius: 5,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                FISAT ELECTRONIC ASSET MANAGEMENT
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 42, md: 58 },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: -2,
                }}
              >
                Manage Every Device.
                <br />
                <Box component="span" color="#2563eb">
                  Track Every Asset.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  mb: 4,
                  maxWidth: 560,
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                A centralized platform to register, allocate, track,
                maintain and retire electronic assets across FISAT.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin-login")}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                    background: "#2563eb",
                  }}
                >
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/staff-login")}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Staff Portal
                </Button>
              </Stack>
            </Grid>

            {/* LAB IMAGE */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
                alt="Computer Lab"
                sx={{
                  width: "100%",
                  height: { xs: 300, md: 420 },
                  objectFit: "cover",
                  borderRadius: 4,
                  border: "4px solid white",
                  boxShadow: "0 20px 50px rgba(15,23,42,.15)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 9 }}>
        <Box textAlign="center" mb={5}>
          <Typography color="#2563eb" fontWeight={700} fontSize={13}>
            CORE FEATURES
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 30, md: 38 },
              fontWeight: 800,
              mt: 1,
            }}
          >
            Everything in one place
          </Typography>

          <Typography color="#64748b" mt={1}>
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
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  transition: ".2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 30px rgba(15,23,42,.08)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Icon />
                </Box>

                <Typography fontWeight={700} fontSize={17}>
                  {title}
                </Typography>

                <Typography
                  color="#64748b"
                  fontSize={13}
                  lineHeight={1.6}
                  mt={1}
                >
                  {description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* WORKFLOW */}
      <Box sx={{ background: "#0f172a", color: "#fff", py: 9 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={5}>
            <Typography color="#60a5fa" fontWeight={700} fontSize={13}>
              ASSET LIFECYCLE
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 30, md: 38 },
                fontWeight: 800,
                mt: 1,
              }}
            >
              Simple from start to finish
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
                    borderRadius: 3,
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)",
                    color: "#fff",
                  }}
                >
                  <Typography
                    color="#60a5fa"
                    fontWeight={800}
                    fontSize={13}
                  >
                    {number}
                  </Typography>

                  <Typography fontWeight={700} fontSize={19} mt={2}>
                    {title}
                  </Typography>

                  <Typography
                    color="#94a3b8"
                    fontSize={13}
                    lineHeight={1.6}
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

      {/* CTA */}
      <Container maxWidth="lg" sx={{ py: 9 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
            }}
          >
            Manage your campus assets smarter.
          </Typography>

          <Typography color="#64748b" mt={2} mb={3}>
            One platform for devices, allocation, maintenance and e-waste.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/admin-login")}
            sx={{
              px: 3,
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              background: "#2563eb",
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
          background: "#fff",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography fontWeight={700}>DeviceHub</Typography>

            <Typography fontSize={12} color="#64748b">
              FISAT Electronic Asset Management System © 2026
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;