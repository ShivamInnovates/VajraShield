import React from 'react';

const colorMap = {
  red: {
    dark: { bg: 'bg-red-950 border-red-800', text: 'text-red-400', icon: 'text-red-500', label: 'text-red-300' },
    light: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: 'text-red-500', label: 'text-red-600' },
  },
  yellow: {
    dark: { bg: 'bg-amber-950 border-amber-800', text: 'text-amber-400', icon: 'text-amber-500', label: 'text-amber-300' },
    light: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', label: 'text-amber-600' },
  },
  green: {
    dark: { bg: 'bg-green-950 border-green-800', text: 'text-green-400', icon: 'text-green-500', label: 'text-green-300' },
    light: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: 'text-green-500', label: 'text-green-600' },
  },
  blue: {
    dark: { bg: 'bg-blue-950 border-blue-800', text: 'text-blue-400', icon: 'text-blue-500', label: 'text-blue-300' },
    light: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', label: 'text-blue-600' },
  },
  default: {
    dark: { bg: 'bg-gray-800 border-gray-700', text: 'text-white', icon: 'text-gray-400', label: 'text-gray-400' },
    light: { bg: 'bg-white border-gray-200', text: 'text-gray-900', icon: 'text-gray-500', label: 'text-gray-600' },
  },
};

export default function StatusCard({ label, value, icon: IconComponent, highlight, darkMode }) {
  const mode = darkMode ? 'dark' : 'light';
  const colors = (colorMap[highlight] || colorMap.default)[mode];

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider ${colors.label}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${colors.text} truncate`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
          <IconComponent className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
