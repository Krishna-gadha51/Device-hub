import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

// Auth Pages (src/pages/auth/)
import AdminLogin from "./pages/auth/AdminLogin";
import StaffLogin from "./pages/auth/StaffLogin";

// Admin Pages (src/pages/admin/)
import AdminDashboard from "./pages/admin/AdminDashboard";
import BulkDeviceRegistration from "./pages/admin/BulkDeviceRegistration";
import DeviceList from "./pages/admin/DeviceList";
import DeviceAllocation from "./pages/admin/DeviceAllocation";
import AssetTracking from "./pages/admin/AssetTracking";
import DeviceRequests from "./pages/admin/DeviceRequests";
import Maintenance from "./pages/admin/Maintenance";
import EWasteManagement from "./pages/admin/EWasteManagement";
import Reports from "./pages/admin/Reports";
import StaffManagement from "./pages/admin/StaffManagement";

// Staff Pages (src/pages/staff/)
import StaffDashboard from "./pages/staff/StaffDashboard";
import MyAssignedDevices from "./pages/staff/MyAssignedDevices";
import StaffRequisitions from "./pages/staff/StaffRequisitions";
import ReportProblem from "./pages/staff/ReportProblem";
import MaintenanceHistory from "./pages/staff/MaintenanceHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Landing Page & Separate Auth Portals */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        
        {/* Legacy login redirects */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Bulk Device Registration (Sole Registration Route & Redirects) */}
        <Route path="/admin/bulk-register" element={<BulkDeviceRegistration />} />
        <Route path="/admin/register" element={<Navigate to="/admin/bulk-register" replace />} />
        <Route path="/single-reg" element={<Navigate to="/admin/bulk-register" replace />} />
        <Route path="/bulk-reg" element={<Navigate to="/admin/bulk-register" replace />} />
        <Route path="/bulk" element={<Navigate to="/admin/bulk-register" replace />} />

        {/* Device Inventory / List Routes */}
        <Route path="/admin/devices" element={<DeviceList />} />
        <Route path="/inventory" element={<Navigate to="/admin/devices" replace />} />

        {/* Device Allocation Routes (Bulk Allocation Only) */}
        <Route path="/admin/allocation" element={<DeviceAllocation />} />
        <Route path="/allocation" element={<Navigate to="/admin/allocation" replace />} />

        {/* Asset Tracking Routes */}
        <Route path="/admin/tracking" element={<AssetTracking />} />
        <Route path="/tracking" element={<Navigate to="/admin/tracking" replace />} />

        {/* Maintenance Routes */}
        <Route path="/admin/maintenance" element={<Maintenance />} />
        <Route path="/maintenance" element={<Navigate to="/admin/maintenance" replace />} />

        {/* Device Requests Routes */}
        <Route path="/admin/device-requests" element={<DeviceRequests />} />
        <Route path="/admin/requests" element={<DeviceRequests />} />
        <Route path="/requests" element={<Navigate to="/admin/device-requests" replace />} />

        {/* E-Waste Management Routes */}
        <Route path="/admin/ewaste" element={<EWasteManagement />} />
        <Route path="/ewaste" element={<Navigate to="/admin/ewaste" replace />} />

        {/* Reports & Analytics Routes */}
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />

        {/* Staff Management Route */}
        <Route path="/admin/staff" element={<StaffManagement />} />

        {/* Staff Portal Routes */}
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/devices" element={<MyAssignedDevices />} />

        {/* Staff Requisitions */}
        <Route path="/staff/requests" element={<StaffRequisitions />} />
        <Route path="/staff/request-device" element={<Navigate to="/staff/requests" replace />} />
        <Route path="/staff/requests-status" element={<Navigate to="/staff/requests" replace />} />

        {/* Staff Report Problem & History */}
        <Route path="/staff/report-problem" element={<ReportProblem />} />
        <Route path="/staff/maintenance-history" element={<MaintenanceHistory />} />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;