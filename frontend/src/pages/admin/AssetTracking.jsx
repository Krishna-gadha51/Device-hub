import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  Avatar,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

function AssetTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "Admin";

  const [searchInput, setSearchInput] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [activeAsset, setActiveAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async (query = "") => {
    setLoading(true);
    try {
      const url = query ? `/devices?search=${encodeURIComponent(query)}` : "/devices";
      const response = await API.get(url);
      const devices = response.data.map((d) => ({
        ...d,
        id: d.assetId,
        name: d.deviceName,
        serial: d.serialNumber,
      }));
      setDeviceList(devices);
      if (devices.length > 0) setActiveAsset(devices[0]);
      else setActiveAsset(null);
    } catch (error) {
      console.error("Asset query failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if an ID was passed via router state from the dashboard audit log
    const passedQuery = location.state?.searchId || location.state?.searchQuery || "";
    if (passedQuery) {
      setSearchInput(passedQuery);
      fetchAssets(passedQuery);
    } else {
      fetchAssets();
    }
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    fetchAssets(searchInput.trim());
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
      <Sidebar username={username} onLogout={handleLogout} />

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
              FISAT ASSET PORTAL
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Electronic Device Management System
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
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
          </Stack>
        </Toolbar>
      </AppBar>

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
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleTrackSubmit}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            marginBottom: 3,
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
          }}
        >
          <InputAdornment position="start" sx={{ pl: 1, pr: 0.5 }}>
            <SearchIcon sx={{ color: "#64748b", fontSize: 22 }} />
          </InputAdornment>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search by Location (e.g. Computer Lab 1, Staff Room), Asset ID, Serial Number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
              },
            }}
            sx={{ "& input": { fontSize: "14px", color: "#1e293b", py: 0.8 } }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#174ea6",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 1,
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#0d3b87", boxShadow: "none" },
            }}
          >
            Track Asset
          </Button>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "32% 68%" }, gap: 2.5, width: "100%", alignItems: "start" }}>
          {/* TRACKED DEVICES LIST */}
          <Paper elevation={0} sx={{ padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Tracked Devices ({deviceList.length})
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>
                Click an asset to view tracking card
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : deviceList.length === 0 ? (
                <Typography sx={{ fontSize: "12px", color: "#64748b", py: 2 }}>
                  No matching assets found for this location or search term.
                </Typography>
              ) : (
                deviceList.map((item) => {
                  const isSelected = activeAsset?.id === item.id;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => setActiveAsset(item)}
                      sx={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: isSelected ? "1.5px solid #bfdbfe" : "1px solid #e2e8f0",
                        backgroundColor: isSelected ? "#eef4ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1769ff" }}>
                          {item.id}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            height: "20px",
                            fontSize: "10.5px",
                            fontWeight: 600,
                            backgroundColor: item.status === "Allocated" ? "#eff6ff" : "#ecfdf5",
                            color: item.status === "Allocated" ? "#1d4ed8" : "#059669",
                            borderRadius: "4px",
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#64748b", mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        {item.location}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Paper>

          {/* ACTIVE ASSET DETAILS & TIMELINE */}
          {activeAsset && (
            <Paper elevation={0} sx={{ padding: "24px 28px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                    Active Asset Tracking Card
                  </Typography>
                  <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", mt: 0.3 }}>
                    {activeAsset.id} — {activeAsset.name}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate("/admin/devices")}
                  sx={{ textTransform: "none", borderColor: "#1769ff", color: "#1769ff", fontWeight: 600, borderRadius: "6px", fontSize: "12px" }}
                >
                  Full Profile
                </Button>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                    Current Physical Location
                  </Typography>
                  <Typography sx={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", mt: 0.4 }}>
                    {activeAsset.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 16, color: "#1769ff" }} />
                    Assigned Staff Incharge
                  </Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", mt: 0.4 }}>
                    {activeAsset.incharge || "Unassigned"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, rowGap: 2.5, columnGap: 2, mb: 3.5 }}>
                <Box>
                  <Typography className="meta-label">Current Status</Typography>
                  <Box sx={{ mt: 0.4 }}>
                    <Chip label={activeAsset.status} size="small" sx={{ backgroundColor: activeAsset.status === "Allocated" ? "#eff6ff" : "#ecfdf5", color: activeAsset.status === "Allocated" ? "#1d4ed8" : "#059669", fontWeight: 600, fontSize: "11px", borderRadius: "4px" }} />
                  </Box>
                </Box>
                <Box>
                  <Typography className="meta-label">Physical Condition</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", mt: 0.4 }}>
                    {activeAsset.condition}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="meta-label">Serial Number</Typography>
                  <Typography sx={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#1769ff", mt: 0.4 }}>
                    {activeAsset.serial}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="meta-label">Purchase Date</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", mt: 0.4 }}>
                    {activeAsset.purchaseDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="meta-label">Vendor</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", mt: 0.4 }}>
                    {activeAsset.vendor}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="meta-label">Purchase Cost</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.4 }}>
                    ₹{Number(activeAsset.purchaseCost || 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <AccessTimeOutlinedIcon sx={{ color: "#1769ff", fontSize: 18 }} />
                  Movement & Event Timeline (Never Deleted)
                </Typography>

                <Stack spacing={2}>
                  {(activeAsset.timeline || []).map((event, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <CircleOutlinedIcon sx={{ fontSize: 16, color: "#1769ff", marginTop: "4px", flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            {event.title}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                          {event.details}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#94a3b8", mt: 0.4 }}>
                          Location: <strong>{event.location}</strong> • Status: <strong>{event.status}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      <style>
        {`
          .meta-label {
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #64748b !important;
            letter-spacing: 0.2px;
          }
        `}
      </style>
    </Box>
  );
}

export default AssetTracking;