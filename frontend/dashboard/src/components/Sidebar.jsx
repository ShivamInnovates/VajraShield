import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiBarChart2, FiClipboard, FiFileText,
  FiCheckSquare, FiSettings, FiBell, FiLogOut,
  FiShield, FiZap, FiServer, FiActivity,
  FiLock, FiSmartphone, FiEye, FiDatabase
} from 'react-icons/fi';

export default function Sidebar({ darkMode, onLogout }) {
  const location = useLocation();

  const sections = [
    {
      label: 'Transaction Review',
      items: [
        { label: 'Home', path: '/', icon: FiHome },
        { label: 'Dashboard', path: '/dashboard', icon: FiBarChart2 },
        { label: 'Review Queue', path: '/queue', icon: FiClipboard },
        { label: 'Lane Pipeline', path: '/lane-pipeline', icon: FiActivity },
      ],
    },
    {
      label: 'Edge Security',
      items: [
        { label: 'WAF / Rate Limiter / Gateway', path: '/edge-security', icon: FiShield },
      ],
    },
    {
      label: 'System Health',
      items: [
        { label: 'Observability & Health', path: '/system-health', icon: FiEye },
        { label: 'Kafka Event Bus', path: '/kafka', icon: FiServer },
      ],
    },
    {
      label: 'Compliance',
      items: [
        { label: 'Audit Logs', path: '/audit', icon: FiFileText },
        { label: 'Compliance Reports', path: '/compliance', icon: FiCheckSquare },
      ],
    },
    {
      label: 'Security',
      items: [
        { label: 'Security Audit Log', path: '/security-log', icon: FiLock },
        { label: 'MFA Setup', path: '/mfa-setup', icon: FiSmartphone },
      ],
    },
    {
      label: 'Settings',
      items: [
        { label: 'RBI Configuration', path: '/settings', icon: FiSettings },
        { label: 'Alert Settings', path: '/alerts', icon: FiBell },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  return (
    <div className={`w-64 h-screen ${darkMode ? 'bg-black border-r border-gray-900' : 'bg-white border-r border-gray-200'} p-6 overflow-y-auto flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${
          darkMode ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white' : 'bg-black text-white'
        }`}>
          V
        </div>
        <div>
          <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>VajraShield</h1>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Risk Management</p>
        </div>
      </div>

      {/* Navigation Sections */}
      {sections.map((section, si) => (
        <div key={si} className="mb-6">
          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-3`}>
            {section.label}
          </p>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive(item.path)
                      ? darkMode ? 'bg-white/10 text-white font-semibold' : 'bg-black/10 text-black font-semibold'
                      : darkMode
                        ? 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile (bottom) */}
      <div className={`pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            darkMode ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white' : 'bg-black text-white'
          }`}>
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shivaji</p>
            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Senior Analyst</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full mt-2 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            darkMode ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <FiLogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
