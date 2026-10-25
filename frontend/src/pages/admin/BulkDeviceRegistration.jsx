import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  MenuItem,
  Select,
  FormControl,
  Avatar,
  Stack,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

import Sidebar, { drawerWidth } from "../../components/Sidebar";

import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import API from "../../api/axios";

// Full device types list (AC and Fan removed)
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

const SPECIFICATION_FIELDS = {
  Desktop: [
    ["processor", "Processor", "e.g. Intel Core i5"],
    ["ram", "RAM Size", "e.g. 16GB DDR4"],
    ["storage", "Storage", "e.g. 512GB NVMe SSD"],
    ["os", "Operating System", "e.g. Windows 11 Pro"],
  ],
  Laptop: [
    ["processor", "Processor", "e.g. Apple M2 / Intel i7"],
    ["ram", "RAM Size", "e.g. 16GB"],
    ["storage", "Storage", "e.g. 512GB SSD"],
    ["screenSize", "Screen Size", "e.g. 14-inch"],
  ],
  Monitor: [
    ["resolution", "Resolution", "e.g. 1920x1080 FHD"],
    ["size", "Screen Size", "e.g. 24-inch"],
    ["panelType", "Panel Type", "e.g. IPS LED"],
  ],
  Printer: [
    ["printType", "Print Type", "e.g. Laser / Inkjet"],
    ["colorCapability", "Color Support", "e.g. Monochrome / Color"],
  ],
  Projector: [
    ["resolution", "Resolution", "e.g. 1080p Full HD"],
    ["brightness", "Brightness", "e.g. 3500 Lumens"],
  ],
  Router: [
    ["ports", "Port Count", "e.g. 24-Port Gigabit"],
    ["speed", "Bandwidth", "e.g. 1 Gbps"],
  ],
  UPS: [
    ["capacity", "Capacity", "e.g. 1000VA / 600W"],
    ["batteryType", "Battery Type", "e.g. Lead-Acid"],
  ],
  Server: [
    ["rackUnits", "Rack Units", "e.g. 2U"],
    ["processors", "Processors", "e.g. Dual Intel Xeon"],
    ["ram", "Memory", "e.g. 64GB ECC"],
  ],
  "Smart Board": [
    ["size", "Screen Size", "e.g. 75-inch Touch"],
    ["resolution", "Resolution", "e.g. 4K UHD"],
  ],
};

function BulkDeviceRegistration() {
  const navigate = useNavigate();

  // BASIC DETAILS
  const [deviceType, setDeviceType] = useState("Desktop");
  const [baseName, setBaseName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("New");

  // BULK DETAILS
  const [quantity, setQuantity] = useState("");

  // SERIAL NUMBER
  const [serialStrategy, setSerialStrategy] = useState("auto");
  const [serialPrefix, setSerialPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("");
  const [customSerialsText, setCustomSerialsText] = useState("");

  // PURCHASE DETAILS
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [vendor, setVendor] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");

  // SPECIFICATIONS & REMARKS
  const [specifications, setSpecifications] = useState({});
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDeviceTypeChange = (event) => {
    setDeviceType(event.target.value);
    setSpecifications({});
  };

  const handleSpecificationChange = (key, value) => {
    setSpecifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const parseCustomSerials = () => {
    return customSerialsText
      .split(/[\n,]+/)
      .map((serial) => serial.trim())
      .filter((serial) => serial.length > 0);
  };

  const generatePreview = () => {
    const parsedQty = parseInt(quantity, 10);
    if (!parsedQty || parsedQty <= 0) return [];

    const items = [];
    const count = Math.min(parsedQty, 100);
    const exactName = baseName.trim() || "Device";

    if (serialStrategy === "auto") {
      const startNum = parseInt(startNumber, 10) || 1;
      const prefix = serialPrefix.trim() || "SN";
      for (let i = 0; i < count; i++) {
        items.push({
          deviceName: exactName, // Uses exact name without numbers
          serialNumber: `${prefix}-${startNum + i}`,
          brand: brand.trim() || "—",
          model: model.trim() || "—",
          type: deviceType,
        });
      }
    } else {
      const customList = parseCustomSerials();
      for (let i = 0; i < count; i++) {
        items.push({
          deviceName: exactName, // Uses exact name without numbers
          serialNumber: customList[i] || `[Pending Serial #${i + 1}]`,
          brand: brand.trim() || "—",
          model: model.trim() || "—",
          type: deviceType,
        });
      }
    }

    return items;
  };

  const previewItems = generatePreview();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !baseName.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !purchaseDate ||
      !purchaseCost ||
      Number(purchaseCost) < 0 ||
      !vendor.trim() ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      alert("Please fill all required fields correctly.");
      return;
    }

    if (serialStrategy === "auto" && (!serialPrefix.trim() || !startNumber)) {
      alert("Please enter a Serial Prefix and Starting Number.");
      return;
    }

    if (serialStrategy === "custom" && parseCustomSerials().length < Number(quantity)) {
      alert(`Please provide all ${quantity} serial numbers.`);
      return;
    }

    const batchPayload = {
      deviceType,
      baseName: baseName.trim(),
      brand: brand.trim(),
      model: model.trim(),
      quantity: Number(quantity),
      condition,
      purchaseDate,
      purchaseCost: Number(purchaseCost),
      cost: Number(purchaseCost),
      vendor: vendor.trim(),
      warrantyExpiry: warrantyExpiry || null,
      specifications,
      remarks: remarks.trim(),
      items: previewItems,
    };

    setLoading(true);
    try {
      const response = await API.post("/devices/bulk-register", batchPayload);
      alert(response.data?.message || `Successfully registered ${previewItems.length} devices`);
      navigate("/admin/devices");
    } catch (error) {
      console.error("Bulk register submission error:", error);
      alert(error.response?.data?.message || "Bulk registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
              COLLEGE ASSET PORTAL
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Electronic Device Management System
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                College System Administrator
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                {username.toLowerCase()}@devicehub.edu • Admin
              </Typography>
            </Box>
            <Avatar sx={{ backgroundColor: "#e0edff", color: "#1769ff", width: 38, height: 38, fontWeight: 700 }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            marginBottom: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LibraryAddOutlinedIcon sx={{ color: "#1769ff", fontSize: 28 }} />
              <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                Device Registration
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginTop: 0.5 }}>
              Register multiple electronic devices with common details in one transaction for FISAT campus.
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            padding: "16px 20px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            marginBottom: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#1769ff", fontSize: 20, marginTop: "2px" }} />
          <Typography sx={{ fontSize: "13px", color: "#1e3a8a", lineHeight: 1.6 }}>
            Common information will be applied to all devices in this batch. Asset IDs will be auto-generated sequentially, and devices will register as Not Allocated.
          </Typography>
        </Paper>

        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              marginBottom: 3,
            }}
          >
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: 0.5 }}>
              Basic Asset Information
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginBottom: 2.5 }}>
              Common details applied to all devices in this batch.
            </Typography>
            <Divider sx={{ marginBottom: 3 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography className="field-label">Device Type *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={deviceType} onChange={handleDeviceTypeChange} sx={{ borderRadius: "8px" }}>
                    {DEVICE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography className="field-label">Device Name *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value)}
                  placeholder="e.g. Dell OptiPlex"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>

              <Box>
                <Typography className="field-label">Brand *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dell"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>

              <Box>
                <Typography className="field-label">Model *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. OptiPlex 7090"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>

              <Box>
                <Typography className="field-label">Initial Condition *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={condition} onChange={(e) => setCondition(e.target.value)} sx={{ borderRadius: "8px" }}>
                    <MenuItem value="New">New / Sealed</MenuItem>
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Fair">Fair</MenuItem>
                    <MenuItem value="Damaged">Needs Repair</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography className="field-label">Quantity *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 10"
                  slotProps={{ htmlInput: { min: 1, max: 100 } }}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
            </Box>
          </Paper>

          {/* SERIAL NUMBERS */}
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              marginBottom: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
              <AutoAwesomeOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
              <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                Serial Number
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginBottom: 2.5 }}>
              Each physical device must have a unique serial number.
            </Typography>
            <Divider sx={{ marginBottom: 2.5 }} />

            <RadioGroup
              row
              value={serialStrategy}
              onChange={(e) => setSerialStrategy(e.target.value)}
              sx={{ marginBottom: 2.5 }}
            >
              <FormControlLabel value="auto" control={<Radio size="small" />} label="Auto-generate serial numbers" />
              <FormControlLabel value="custom" control={<Radio size="small" />} label="Enter custom serial numbers" />
            </RadioGroup>

            {serialStrategy === "auto" ? (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2.5 }}>
                <Box>
                  <Typography className="field-label">Serial Prefix *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={serialPrefix}
                    onChange={(e) => setSerialPrefix(e.target.value)}
                    placeholder="e.g. DELL-LAB"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Box>
                <Box>
                  <Typography className="field-label">Starting Number *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    placeholder="e.g. 101"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography className="field-label">Serial Numbers *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={5}
                  value={customSerialsText}
                  onChange={(e) => setCustomSerialsText(e.target.value)}
                  placeholder={`Enter ${quantity || "required"} serial numbers, one per line`}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
            )}
          </Paper>

          {/* DYNAMIC SPECIFICATIONS */}
          {SPECIFICATION_FIELDS[deviceType] && (
            <Paper
              elevation={0}
              sx={{
                padding: "24px 28px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                marginBottom: 3,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: 0.5 }}>
                Technical Specifications ({deviceType})
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#64748b", marginBottom: 2.5 }}>
                These specifications will be applied to all devices in this batch.
              </Typography>
              <Divider sx={{ marginBottom: 3 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {SPECIFICATION_FIELDS[deviceType].map(([key, label, placeholder]) => (
                  <Box key={key}>
                    <Typography className="field-label">{label}</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={specifications[key] || ""}
                      onChange={(e) => handleSpecificationChange(key, e.target.value)}
                      placeholder={placeholder}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* PURCHASE DETAILS */}
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              marginBottom: 3,
              backgroundColor: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: 0.5 }}>
              Purchase & Warranty Details
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#64748b", marginBottom: 2.5 }}>
              Purchase and warranty information shared by all devices in this batch.
            </Typography>
            <Divider sx={{ marginBottom: 3 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography className="field-label">Purchase Date *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
              <Box>
                <Typography className="field-label">Purchase Cost (₹) *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="e.g. 45000"
                  slotProps={{ htmlInput: { min: 0 } }}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
              <Box>
                <Typography className="field-label">Vendor / Supplier *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. ABC Technologies"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
              <Box>
                <Typography className="field-label">Warranty Expiry Date</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>
            </Box>
          </Paper>

          {/* REMARKS */}
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              marginBottom: 3,
              backgroundColor: "#ffffff",
            }}
          >
            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: 0.5 }}>
              Remarks
            </Typography>
            <Divider sx={{ marginY: 2 }} />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks or notes about this batch..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          </Paper>

          {/* PREVIEW */}
          <Paper
            elevation={0}
            sx={{
              padding: "24px 28px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              marginBottom: 3,
              overflowX: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
              <AutoAwesomeOutlinedIcon sx={{ color: "#1769ff", fontSize: 20 }} />
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Generated Items Preview ({previewItems.length} Devices)
              </Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "10px" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Device Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Serial Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#94a3b8" }}>
                        Enter a Device Name, Quantity, and Serial settings above to preview items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewItems.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ color: "#64748b" }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{item.deviceName}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", color: "#1769ff", fontWeight: 600 }}>
                          {item.serialNumber}
                        </TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.brand}</TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.model}</TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.type}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* FOOTER ACTIONS */}
          <Paper
            elevation={0}
            sx={{
              padding: "20px 24px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 4,
              backgroundColor: "#ffffff",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/devices")}
              disabled={loading}
              sx={{
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#475569",
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading || previewItems.length === 0}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
              sx={{
                backgroundColor: "#1769ff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1256d6", boxShadow: "none" },
              }}
            >
              {loading ? "Registering Batch..." : `Register ${previewItems.length || ""} Devices`}
            </Button>
          </Paper>
        </form>
      </Box>

      <style>
        {`
          .field-label {
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #475569 !important;
            margin-bottom: 6px !important;
            letter-spacing: 0.2px;
          }
        `}
      </style>
    </Box>
  );
}

export default BulkDeviceRegistration;