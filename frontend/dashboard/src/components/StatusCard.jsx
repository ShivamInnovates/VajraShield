import React from 'react';

export default function StatusCard({ label, value, icon: IconComponent, highlight, darkMode }) {
  const bgColors = {
    red: darkMode ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200',
    yellow: darkMode ? 'bg-amber-950/30 border-amber-900' : 'bg-amber-50 border-amber-200',
    green: darkMode ? 'bg-green-950/30 border-green-900' : 'bg-green-50 border-green-200',
    default: darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
  };

  const textColors = {
    red: darkMode ? 'text-red-500' : 'text-red-700',
    yellow: darkMode ? 'text-amber-500' : 'text-amber-700',
    green: darkMode ? 'text-green-500' : 'text-green-700',
    default: darkMode ? 'text-gray-300' : 'text-gray-900',
  };

  const bg = bgColors[highlight] || bgColors.default;
  const textColor = textColors[highlight] || textColors.default;

  return (
    <div className={`p-6 rounded-lg border ${bg} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-3 ${textColor}`}>
            {value}
          </p>
        </div>
        <div className={`${textColor}`}>
          <IconComponent className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
