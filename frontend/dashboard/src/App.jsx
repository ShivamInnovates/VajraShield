import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReviewQueue from './pages/ReviewQueue';
import TransactionDetail from './pages/TransactionDetail';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import EdgeSecurityPage from './pages/EdgeSecurityPage';
import LanePipelineView from './pages/LanePipelineView';
import KafkaMonitorPage from './pages/KafkaMonitorPage';
import SystemHealthPage from './pages/SystemHealthPage';
import AuditLogPage from './pages/AuditLogPage';
import ComplianceReportPage from './pages/ComplianceReportPage';
import RBIConfigPage from './pages/RBIConfigPage';
import AlertSettingsPage from './pages/AlertSettingsPage';
import MFASetupPage from './pages/MFASetupPage';
import SecurityAuditLog from './pages/SecurityAuditLog';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FloatingChat from './components/FloatingChat';
import AuthGuard from './components/AuthGuard';
import authService from './services/authService';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [authVersion, setAuthVersion] = useState(0); // triggers re-render on login/logout

  const handleLogin = () => setAuthVersion(v => v + 1);

  const handleLogout = () => {
    authService.logout();
    setAuthVersion(v => v + 1);
  };

  return (
    <Router>
      <Routes>
        {/* Login page — no sidebar/topbar */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* All protected routes */}
        <Route path="*" element={
          <AuthGuard key={authVersion}>
            <div className={`flex min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
              <Sidebar darkMode={darkMode} onLogout={handleLogout} />
              <div className="flex-1 flex flex-col">
                <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className={`flex-1 overflow-auto p-4 sm:p-5 ${darkMode ? 'bg-black' : 'bg-white'}`}>
                  <Routes>
                    <Route path="/" element={<Home darkMode={darkMode} />} />
                    <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
                    <Route path="/queue" element={<ReviewQueue darkMode={darkMode} />} />
                    <Route path="/transaction/:id" element={<TransactionDetail darkMode={darkMode} />} />

                    {/* Edge Security */}
                    <Route path="/edge-security" element={<EdgeSecurityPage darkMode={darkMode} />} />

                    {/* Lane Pipeline */}
                    <Route path="/lane-pipeline" element={<LanePipelineView darkMode={darkMode} />} />

                    {/* Event Bus */}
                    <Route path="/kafka" element={<KafkaMonitorPage darkMode={darkMode} />} />

                    {/* Observability */}
                    <Route path="/system-health" element={<SystemHealthPage darkMode={darkMode} />} />

                    {/* Compliance & Audit */}
                    <Route path="/audit" element={<AuditLogPage darkMode={darkMode} />} />
                    <Route path="/compliance" element={<ComplianceReportPage darkMode={darkMode} />} />

                    {/* Settings */}
                    <Route path="/settings" element={<RBIConfigPage darkMode={darkMode} />} />
                    <Route path="/alerts" element={<AlertSettingsPage darkMode={darkMode} />} />

                    {/* Security */}
                    <Route path="/mfa-setup" element={<MFASetupPage darkMode={darkMode} />} />
                    <Route path="/security-log" element={<SecurityAuditLog darkMode={darkMode} />} />
                  </Routes>
                </main>
              </div>
            </div>
            <FloatingChat darkMode={darkMode} />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}
