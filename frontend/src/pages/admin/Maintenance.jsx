import React, { useState, useEffect, useMemo } from "react";
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
  InputLabel,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

import Sidebar, { drawerWidth } from "../../components/Sidebar";
import API from "../../api/axios";

function Maintenance() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Update Status Modal State
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("Reported");
  const [updateCost, setUpdateCost] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const ticketRes = await API.get("/maintenance");
      setTickets(ticketRes.data || []);
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getEffectiveStatus = (row) => {
    return row.status || "Reported";
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === "All") {
      return tickets;
    }

    return tickets.filter(
      (ticket) => getEffectiveStatus(ticket) === statusFilter
    );
  }, [tickets, statusFilter]);

  const handleOpenUpdate = (ticket) => {
    setSelectedTicket(ticket);

    setUpdateStatus(getEffectiveStatus(ticket));

    setUpdateCost(
      ticket.actualCost !== undefined
        ? ticket.actualCost
        : ticket.cost || ""
    );

    setResolutionNotes(
      ticket.resolutionNotes ||
        ticket.technicianNotes ||
        ticket.remarks ||
        ""
    );

    setOpenUpdateModal(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();

    if (!selectedTicket) {
      return;
    }

    setSubmitting(true);

    try {
      const ticketId = selectedTicket.ticketId || selectedTicket._id;

      const payload = {
        status: updateStatus,
        cost: Number(updateCost) || 0,
        resolutionNotes: resolutionNotes,
        remarks: resolutionNotes,
      };

      await API.put(`/maintenance/${ticketId}`, payload);

      if (
        updateStatus === "Unrepairable" &&
        selectedTicket.assetId
      ) {
        try {
          await API.post("/ewaste", {
            assetId: selectedTicket.assetId,
            deviceName:
              selectedTicket.deviceName || "Hardware Asset",
            model:
              selectedTicket.model ||
              selectedTicket.deviceModel ||
              "Standard Model",
            serialNumber:
              selectedTicket.serialNumber || "N/A",
            decommissionReason:
              resolutionNotes || "Declared unrepairable",
            condition: "Beyond Repair",
            disposalStatus: "Pending Disposal",
            recyclingVendor:
              "GreenIndia Certified E-Waste Recyclers",
            decommissionDate: new Date()
              .toISOString()
              .split("T")[0],
          });

          try {
            await API.patch(
              `/devices/${selectedTicket.assetId}/status`,
              {
                status: "E-Waste",
              }
            );
          } catch (deviceError) {
            console.error(
              "Device E-Waste status update failed:",
              deviceError
            );
          }
        } catch (ewasteError) {
          console.error(
            "E-Waste routing error:",
            ewasteError.response || ewasteError
          );
        }
      }

      setOpenUpdateModal(false);
      setSelectedTicket(null);

      if (updateStatus === "Unrepairable") {
        const confirmed = window.confirm(
          `Asset ${selectedTicket.assetId} moved to E-Waste. Navigate now?`
        );

        if (confirmed) {
          navigate("/admin/ewaste");
          return;
        }
      }

      await fetchData();
    } catch (error) {
      console.error(
        "Status update error details:",
        error.response || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update ticket status. Check browser console for details."
      );
    } finally {
      setSubmitting(false);
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
      <Sidebar
        activeTab="maintenance"
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
              COLLEGE ASSET PORTAL
            </Typography>

            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              MCA Electronic Device Management System
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center" }}
          >
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                College System Administrator
              </Typography>

              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                {username.toLowerCase()}@devicehub.edu • Admin
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

      {/* MAIN */}
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
        {/* HEADER */}
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
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
            >
              <BuildOutlinedIcon
                sx={{ color: "#1769ff", fontSize: 24 }}
              />

              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Maintenance & Problem Ticket Management
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: 0.5,
              }}
            >
              Review staff fault reports, track repair costs,
              restore fixed devices, or decommission unrepairable
              units directly to E-Waste.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <FilterListOutlinedIcon
              sx={{ color: "#64748b", fontSize: 20 }}
            />

            <FormControl
              size="small"
              sx={{ minWidth: 160 }}
            >
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                sx={{
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                <MenuItem value="Reported">
                  Reported
                </MenuItem>

                <MenuItem value="Under Maintenance">
                  Under Maintenance
                </MenuItem>

                <MenuItem value="Resolved">
                  Resolved
                </MenuItem>

                <MenuItem value="Unrepairable">
                  Unrepairable (E-Waste)
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* TABLE */}
        <Paper
          elevation={0}
          sx={{
            p: "20px 24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              mb: 2,
            }}
          >
            Service & Repair Tickets ({filteredTickets.length})
          </Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#ffffff" }}>
                <TableRow
                  sx={{
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    TICKET ID
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    ASSET ID
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    DEVICE / LOCATION
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    PROBLEM CATEGORY
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    DESCRIPTION
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    REPORTED BY
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    STATUS
                  </TableCell>

                  <TableCell sx={{ fontSize: "11px", fontWeight: 700 }}>
                    COST (₹)
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={26} />
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        py: 6,
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      No service & repair tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((row) => {
                    const dispStatus =
                      getEffectiveStatus(row);

                    return (
                      <TableRow
                        key={row.ticketId || row._id}
                        hover
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#1769ff",
                            fontSize: "13px",
                          }}
                        >
                          {row.ticketId}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "13px",
                          }}
                        >
                          {row.assetId}
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {row.deviceName}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "11.5px",
                              color: "#64748b",
                            }}
                          >
                            {row.location}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              row.problemCategory ||
                              "Hardware Failure"
                            }
                            size="small"
                            sx={{
                              backgroundColor: "#fef9c3",
                              color: "#854d0e",
                              fontWeight: 700,
                              fontSize: "11px",
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "12.5px",
                            color: "#475569",
                            maxWidth: 220,
                          }}
                        >
                          {row.issueDescription ||
                            row.description}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {row.reportedBy}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              dispStatus === "Unrepairable"
                                ? "Unrepairable (E-Waste)"
                                : dispStatus
                            }
                            size="small"
                            icon={
                              dispStatus ===
                              "Unrepairable" ? (
                                <DeleteSweepOutlinedIcon
                                  sx={{
                                    fontSize:
                                      "14px !important",
                                  }}
                                />
                              ) : undefined
                            }
                            sx={{
                              backgroundColor:
                                dispStatus ===
                                "Resolved"
                                  ? "#ecfdf5"
                                  : dispStatus ===
                                    "Unrepairable"
                                  ? "#fee2e2"
                                  : dispStatus ===
                                    "Reported"
                                  ? "#eff6ff"
                                  : "#ffedd5",

                              color:
                                dispStatus ===
                                "Resolved"
                                  ? "#047857"
                                  : dispStatus ===
                                    "Unrepairable"
                                  ? "#b91c1c"
                                  : dispStatus ===
                                    "Reported"
                                  ? "#1d4ed8"
                                  : "#c2410c",

                              fontWeight: 700,
                              fontSize: "11px",
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#0f172a",
                            fontWeight: 600,
                          }}
                        >
                          ₹
                          {Number(
                            row.actualCost ||
                              row.cost ||
                              0
                          ).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell
                          sx={{ textAlign: "right" }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={
                              <EditNoteOutlinedIcon
                                sx={{ fontSize: 16 }}
                              />
                            }
                            onClick={() =>
                              handleOpenUpdate(row)
                            }
                            sx={{
                              backgroundColor: "#1e40af",
                              textTransform: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "6px",
                              boxShadow: "none",
                              px: 1.5,
                              "&:hover": {
                                backgroundColor:
                                  "#1e3a8a",
                              },
                            }}
                          >
                            Update Status
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

        {/* UPDATE STATUS MODAL */}
        <Dialog
          open={openUpdateModal}
          onClose={() =>
            !submitting && setOpenUpdateModal(false)
          }
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Update Ticket: {selectedTicket?.ticketId} (
              {selectedTicket?.assetId})
            </Typography>

            <IconButton
              onClick={() =>
                !submitting &&
                setOpenUpdateModal(false)
              }
            >
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <Box
            component="form"
            onSubmit={handleSaveUpdate}
          >
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 3,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel shrink>
                  Ticket Status *
                </InputLabel>

                <Select
                  notched
                  label="Ticket Status *"
                  value={updateStatus}
                  onChange={(e) =>
                    setUpdateStatus(e.target.value)
                  }
                  sx={{ borderRadius: "8px" }}
                >
                  <MenuItem value="Reported">
                    Reported
                  </MenuItem>

                  <MenuItem value="Under Maintenance">
                    Under Maintenance
                  </MenuItem>

                  <MenuItem value="Resolved">
                    Resolved (Restore to Available)
                  </MenuItem>

                  <MenuItem value="Unrepairable">
                    Unrepairable (Move to E-Waste)
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                type="number"
                label="Repair / Scrapping Cost (₹)"
                value={updateCost}
                onChange={(e) =>
                  setUpdateCost(e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Resolution / Disposal Remarks"
                value={resolutionNotes}
                onChange={(e) =>
                  setResolutionNotes(e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button
                onClick={() =>
                  setOpenUpdateModal(false)
                }
                variant="outlined"
                disabled={submitting}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  backgroundColor:
                    updateStatus === "Unrepairable"
                      ? "#dc2626"
                      : "#1769ff",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {submitting
                  ? "Saving..."
                  : "Save Update"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Maintenance;