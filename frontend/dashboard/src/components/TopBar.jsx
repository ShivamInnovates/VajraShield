import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiSun, FiMoon, FiUser } from 'react-icons/fi';

export default function TopBar({ darkMode, setDarkMode }) {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname === '/dashboard') return 'Analytics Dashboard';
    if (location.pathname.startsWith('/queue')) return 'Review Queue';
    if (location.pathname.startsWith('/transaction')) return 'Transaction Details';
    return 'VajraShield';
  };

  const getPageSubtitle = () => {
    if (location.pathname === '/') return 'Overview of your risk management system';
    if (location.pathname === '/dashboard') return 'Comprehensive transaction risk analysis and performance metrics';
    if (location.pathname.startsWith('/queue')) return 'Manage and review high-risk transactions';
    if (location.pathname.startsWith('/transaction')) return 'Detailed transaction risk assessment';
    return '';
  };

  const bg = darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200';
  const titleColor = darkMode ? 'text-white' : 'text-gray-900';
  const subtitleColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const iconBtnBase = darkMode
    ? 'text-gray-400 hover:text-white hover:bg-zinc-900'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`border-b ${bg} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
      <div>
        <h2 className={`text-xl font-bold ${titleColor}`}>{getPageTitle()}</h2>
        <p className={`text-sm ${subtitleColor} mt-0.5`}>{getPageSubtitle()}</p>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <button className={`relative p-2 rounded-lg transition-all ${iconBtnBase}`}>
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-all ${iconBtnBase}`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode
            ? <FiSun className="w-5 h-5 text-yellow-400" />
            : <FiMoon className="w-5 h-5" />
          }
        </button>

        {/* Divider */}
        <div className={`w-px h-6 mx-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Account */}
        <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${iconBtnBase}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            darkMode ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-black text-white'
          }`}>
            S
          </div>
          <span>Shivaji</span>
        </button>
      </div>
    </div>
  );
}
