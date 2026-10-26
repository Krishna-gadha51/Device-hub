import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Avatar, Divider, Chip, Button } from "@mui/material";

// Common & Admin Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined"; // Updated for Bulk Registration
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";

// Staff Icons
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

export const drawerWidth = 240;

function Sidebar({ username, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = (localStorage.getItem("role") || "admin").toLowerCase();
  const isStaff = role === "staff";
  const currentUser =
    username ||
    localStorage.getItem("username") ||
    (isStaff ? "Prof. John Doe" : "Admin");

  // 1. ADMIN MENU SECTIONS (Configured for Bulk Registration Only)
  const adminSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <DashboardOutlinedIcon />,
          route: "/admin/dashboard",
        },
      ],
    },
    {
      title: "DEVICE MANAGEMENT",
      items: [
        {
          id: "registration",
          label: "Device Registration",
          icon: <LibraryAddOutlinedIcon />,
          route: "/admin/bulk-register", // Updated to point directly to bulk registration
        },
        {
          id: "inventory",
          label: "Device List",
          icon: <Inventory2OutlinedIcon />,
          route: "/admin/devices",
        },
        {
          id: "allocation",
          label: "Device Allocation",
          icon: <AssignmentTurnedInOutlinedIcon />,
          route: "/admin/allocation",
        },
        {
          id: "tracking",
          label: "Asset Tracking",
          icon: <LocationOnOutlinedIcon />,
          route: "/admin/tracking",
        },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        {
          id: "maintenance",
          label: "Maintenance",
          icon: <BuildOutlinedIcon />,
          route: "/admin/maintenance",
        },
        {
          id: "requests",
          label: "Device Requests",
          icon: <AssignmentIndOutlinedIcon />,
          route: "/admin/requests",
        },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        {
          id: "reports",
          label: "Reports",
          icon: <BarChartOutlinedIcon />,
          route: "/admin/reports",
        },
        {
          id: "ewaste",
          label: "E-Waste",
          icon: <DeleteOutlineOutlinedIcon />,
          route: "/admin/ewaste",
        },
        {
          id: "staff",
          label: "Staff Management",
          icon: <PeopleAltOutlinedIcon />,
          route: "/admin/staff",
        },
      ],
    },
  ];

  // 2. STAFF MENU SECTIONS
  const staffSections = [
    {
      title: "STAFF PORTAL",
      items: [
        {
          id: "staff-dashboard",
          label: "Dashboard",
          icon: <DashboardOutlinedIcon />,
          route: "/staff/dashboard",
        },
        {
          id: "staff-devices",
          label: "My Assigned Devices",
          icon: <DevicesOutlinedIcon />,
          route: "/staff/devices",
        },
      ],
    },
    {
      title: "REQUESTS & ISSUES",
      items: [
        {
          id: "staff-requests",
          label: "Device Requisitions",
          icon: <AddCircleOutlinedIcon />,
          route: "/staff/requests",
        },
        {
          id: "staff-report-problem",
          label: "Report Problem",
          icon: <ReportProblemOutlinedIcon />,
          route: "/staff/report-problem",
        },
        {
          id: "staff-maintenance-history",
          label: "Maintenance History",
          icon: <HistoryOutlinedIcon />,
          route: "/staff/maintenance-history",
        },
      ],
    },
  ];

  const currentSections = isStaff ? staffSections : adminSections;

  const handleMenuClick = (route) => {
    navigate(route);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      {/* LOGO & ROLE PILL */}
      <Box
        onClick={() => navigate(isStaff ? "/staff/dashboard" : "/admin/dashboard")}
        sx={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            backgroundColor: "#1769ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LaptopOutlinedIcon sx={{ color: "#ffffff", fontSize: 20 }} />
        </Box>

        <Box sx={{ overflow: "hidden", flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1769ff",
                lineHeight: 1.1,
              }}
            >
              DEVICE- Hub
            </Typography>
            {isStaff && (
              <Chip
                label="Staff"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: "#eff6ff",
                  color: "#1769ff",
                  borderRadius: "4px",
                }}
              />
            )}
          </Box>

          <Typography
            sx={{
              fontSize: "8.5px",
              color: "#94a3b8",
              letterSpacing: "0.8px",
              fontWeight: 600,
              mt: 0.2,
            }}
          >
            {isStaff ? "FACULTY PORTAL" : "FISAT ASSET HUB"}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* MENU ITEMS */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 1.25,
          py: 1.5,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: "4px",
          },
        }}
      >
        {currentSections.map((section) => (
          <Box key={section.title} sx={{ marginBottom: 2 }}>
            <Typography
              sx={{
                fontSize: "9.5px",
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: "0.8px",
                paddingLeft: 1.25,
                marginBottom: 0.5,
              }}
            >
              {section.title}
            </Typography>

            {section.items.map((item) => {
              const isActive =
                location.pathname === item.route ||
                (item.id === "registration" && location.pathname.includes("register")) ||
                (item.id === "staff-requests" && location.pathname.includes("request"));

              return (
                <Box
                  key={item.id}
                  onClick={() => handleMenuClick(item.route)}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    padding: "8px 12px",
                    marginBottom: "2px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: isActive ? "#1769ff" : "#64748b",
                    backgroundColor: isActive ? "#eff6ff" : "transparent",
                    transition: "all 0.15s ease",
                    overflow: "hidden",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      color: "#1769ff",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "15%",
                      height: "70%",
                      width: isActive ? "3.5px" : "0px",
                      backgroundColor: "#1769ff",
                      borderRadius: "0 4px 4px 0",
                    },
                    "& svg": {
                      fontSize: 18,
                    },
                  }}
                >
                  {item.icon}

                  <Typography
                    sx={{
                      fontSize: "12.5px",
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* USER PROFILE & LOGOUT */}
      <Box
        sx={{
          borderTop: "1px solid #e2e8f0",
          padding: 1.25,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "8px 10px",
            marginBottom: 1,
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#1769ff",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {currentUser.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#1e293b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser}
            </Typography>

            <Typography
              sx={{
                fontSize: "10.5px",
                color: "#94a3b8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isStaff ? "FISAT Faculty" : "FISAT Administrator"}
            </Typography>
          </Box>
        </Box>

        {isStaff ? (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleLogoutClick}
            sx={{
              borderColor: "#fecaca",
              color: "#ef4444",
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              py: 0.8,
              "&:hover": {
                borderColor: "#ef4444",
                backgroundColor: "#fef2f2",
              },
            }}
          >
            Logout
          </Button>
        ) : (
          <Box
            onClick={handleLogoutClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#dc2626",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: "#fef2f2",
              },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: "12.5px",
                fontWeight: 600,
              }}
            >
              Logout
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Sidebar;