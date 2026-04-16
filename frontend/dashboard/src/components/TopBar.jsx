import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiSun, FiMoon, FiUser, FiLogOut } from 'react-icons/fi';

export default function TopBar({ darkMode, setDarkMode }) {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/queue')) return 'Review Queue';
    if (location.pathname.startsWith('/transaction')) return 'Transaction Details';
    return 'VajraShield';
  };

  return (
    <div className={`border-b ${darkMode ? 'bg-black border-gray-900' : 'bg-white border-gray-200'} px-6 py-4 flex items-center justify-between`}>
      <div>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getPageTitle()}
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          Manage and review high-risk transactions
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className={`p-2 rounded-lg transition-colors relative ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}>
            <FiBell className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {darkMode ? (
            <FiSun className="w-5 h-5 text-yellow-500" />
          ) : (
            <FiMoon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Account Menu */}
        <div className="flex items-center space-x-2 pl-4 border-l" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}>
            <FiUser className="w-4 h-4" />
            <span className="text-sm font-medium">Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
