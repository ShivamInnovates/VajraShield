import React from 'react';
import { FiCpu, FiActivity, FiWatch, FiShield } from 'react-icons/fi';

const iconMap = { FiCpu, FiActivity, FiWatch, FiShield };

export default function FeatureCard({ title, description, iconName, darkMode }) {
  const IconComponent = iconMap[iconName];

  return (
    <div className={`p-5 rounded-xl border transition-all hover:shadow-lg cursor-pointer ${
      darkMode
        ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
    }`}>
      <div className="flex items-start space-x-4">
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
          {IconComponent && <IconComponent className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm mt-1 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
