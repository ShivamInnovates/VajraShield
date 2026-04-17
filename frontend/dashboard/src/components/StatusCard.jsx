import React from 'react';

const colorMap = {
  red: {
    dark: { bg: 'bg-red-950 border-red-800', text: 'text-red-300', icon: 'text-red-400', label: 'text-red-200' },
    light: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: 'text-red-600', label: 'text-red-700' },
  },
  yellow: {
    dark: { bg: 'bg-amber-950 border-amber-800', text: 'text-amber-300', icon: 'text-amber-400', label: 'text-amber-200' },
    light: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: 'text-amber-600', label: 'text-amber-700' },
  },
  green: {
    dark: { bg: 'bg-green-950 border-green-800', text: 'text-green-300', icon: 'text-green-400', label: 'text-green-200' },
    light: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: 'text-green-600', label: 'text-green-700' },
  },
  teal: {
    dark: { bg: 'bg-teal-950 border-teal-800', text: 'text-teal-300', icon: 'text-teal-400', label: 'text-teal-200' },
    light: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-800', icon: 'text-teal-600', label: 'text-teal-700' },
  },
  slate: {
    dark: { bg: 'bg-slate-950 border-slate-800', text: 'text-slate-300', icon: 'text-slate-400', label: 'text-slate-200' },
    light: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-800', icon: 'text-slate-600', label: 'text-slate-700' },
  },
  default: {
    dark: { bg: 'bg-slate-900 border-slate-800', text: 'text-white', icon: 'text-slate-400', label: 'text-slate-400' },
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
