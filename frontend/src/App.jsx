import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import PrivateRoute from './components/Common/PrivateRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import DonorAuth from './pages/DonorAuth';
import OrphanageAuth from './pages/OrphanageAuth';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DonationHistoryPage from './pages/DonationHistoryPage';
import NotificationCenter from './pages/NotificationCenter';
import ProfileSettings from './pages/ProfileSettings';

// Dashboards
import DonorDashboard from './components/Dashboards/DonorDashboard';
import OrphanageDashboard from './components/Dashboards/OrphanageDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';

import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Pages */}
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/donor-auth" element={<DonorAuth />} />
          <Route path="/orphanage-auth" element={<OrphanageAuth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Donor Routes (Private) */}
          <Route
            path="/donor-dashboard"
            element={
              <PrivateRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <PrivateRoute allowedRoles={['donor', 'orphanage_head']}>
                <DonationHistoryPage />
              </PrivateRoute>
            }
          />

          {/* Orphanage Head Routes (Private) */}
          <Route
            path="/orphanage-dashboard"
            element={
              <PrivateRoute allowedRoles={['orphanage_head']}>
                <OrphanageDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute allowedRoles={['orphanage_head', 'donor']}>
                <NotificationCenter />
              </PrivateRoute>
            }
          />

          {/* Common Settings (Private) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['donor', 'orphanage_head']}>
                <ProfileSettings />
              </PrivateRoute>
            }
          />

          {/* Admin Routes (Private) */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {/* Simple Warm Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Seva Hrudhayam - Food & Resource Donation Platform. Empowering child care institutions.</p>
      </footer>
    </div>
  );
}

export default App;
