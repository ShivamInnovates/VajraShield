import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiBarChart2, FiClipboard, FiFileText, 
  FiCheckSquare, FiSettings, FiBell, FiLogOut 
} from 'react-icons/fi';

export default function Sidebar({ darkMode }) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Home',
      path: '/',
      icon: FiHome,
      category: 'TRANSACTION REVIEW',
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: FiBarChart2,
      category: 'TRANSACTION REVIEW',
    },
    {
      label: 'Review Queue',
      path: '/queue',
      icon: FiClipboard,
      category: 'TRANSACTION REVIEW',
    },
  ];

  const complianceItems = [
    { label: 'Audit Logs', icon: FiFileText, path: '/audit' },
    { label: 'Compliance Reports', icon: FiCheckSquare, path: '/compliance' },
  ];

  const settingsItems = [
    { label: 'RBI Configuration', icon: FiSettings, path: '/settings' },
    { label: 'Alert Settings', icon: FiBell, path: '/alerts' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`w-64 h-screen ${darkMode ? 'bg-black border-r border-gray-900' : 'bg-white border-r border-gray-200'} p-6 overflow-y-auto flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${
          darkMode ? 'bg-white text-black' : 'bg-black text-white'
        }`}>
          V
        </div>
        <div>
          <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>VajraShield</h1>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Risk Management</p>
        </div>
      </div>

      {/* Navigation Section 1 */}
      <div className="mb-8">
        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-4`}>
          Transaction Review
        </p>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? darkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                    : darkMode
                      ? 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Compliance Section */}
      <div className="mb-8">
        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-4`}>
          Compliance
        </p>
        <nav className="space-y-2">
          {complianceItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings Section */}
      <div className="mb-8">
        <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-4`}>
          Settings
        </p>
        <nav className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile (bottom) */}
      <div className={`pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            darkMode ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shivaji</p>
            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyst</p>
          </div>
        </div>
        <button className={`w-full mt-2 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
        }`}>
          <FiLogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
