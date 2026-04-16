import React, { useState } from 'react';
import { FiSave, FiAlertCircle, FiCheckCircle, FiToggle2 } from 'react-icons/fi';

export default function RBIConfiguration({ darkMode }) {
  const [settings, setSettings] = useState({
    neftEnabled: true,
    rtgsEnabled: true,
    neftLimit: 200000,
    rtgsLimit: 10000000,
    amlThreshold: 0.7,
    slaTime: 30,
    velocityCheck: true,
    geographicCheck: true,
    newAccountFlag: true,
    suspiciousBehavior: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          RBI Configuration
        </h1>
        <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure transaction processing rules and RBI compliance parameters
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-100 border border-green-300'}`}>
          <FiCheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <p className={`${darkMode ? 'text-green-300' : 'text-green-700'}`}>Settings saved successfully!</p>
        </div>
      )}

      {/* Payment Gateway Settings */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Payment Gateway Settings
        </h2>

        <div className="space-y-6">
          {/* NEFT Settings */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>NEFT (National Electronic Funds Transfer)</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable/disable NEFT transaction processing
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.neftEnabled}
                  onChange={(e) => handleChange('neftEnabled', e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
            {settings.neftEnabled && (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  NEFT Transaction Limit (₹)
                </label>
                <input
                  type="number"
                  value={settings.neftLimit}
                  onChange={(e) => handleChange('neftLimit', Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none`}
                />
              </div>
            )}
          </div>

          {/* RTGS Settings */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>RTGS (Real Time Gross Settlement)</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable/disable RTGS transaction processing
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rtgsEnabled}
                  onChange={(e) => handleChange('rtgsEnabled', e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
            {settings.rtgsEnabled && (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  RTGS Transaction Limit (₹)
                </label>
                <input
                  type="number"
                  value={settings.rtgsLimit}
                  onChange={(e) => handleChange('rtgsLimit', Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Assessment Settings */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Risk Assessment Settings
        </h2>

        <div className="space-y-4">
          {/* AML Threshold */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              AML Risk Threshold (0.0 - 1.0)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.amlThreshold}
                onChange={(e) => handleChange('amlThreshold', Number(e.target.value))}
                className="flex-1"
              />
              <span className={`text-lg font-bold px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {settings.amlThreshold.toFixed(1)}
              </span>
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Transactions above this threshold will be flagged for review
            </p>
          </div>

          {/* SLA Time */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              SLA Processing Time (minutes)
            </label>
            <input
              type="number"
              value={settings.slaTime}
              onChange={(e) => handleChange('slaTime', Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none`}
            />
          </div>
        </div>
      </div>

      {/* Advanced Detection Rules */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Advanced Detection Rules
        </h2>

        <div className="space-y-3">
          {[
            { key: 'velocityCheck', label: 'Transaction Velocity Check', description: 'Monitor rapid successive transactions' },
            { key: 'geographicCheck', label: 'Geographic Anomaly Detection', description: 'Detect location mismatches' },
            { key: 'newAccountFlag', label: 'New Account Detection', description: 'Flag transactions from newly created accounts' },
            { key: 'suspiciousBehavior', label: 'Suspicious Behavior Monitoring', description: 'Monitor unusual account patterns' },
          ].map((rule) => (
            <div key={rule.key} className={`p-4 rounded-lg flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rule.label}</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rule.description}</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[rule.key]}
                  onChange={(e) => handleChange(rule.key, e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <FiSave className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
        <button className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          darkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        }`}>
          Reset to Defaults
        </button>
      </div>

      {/* Info Box */}
      <div className={`p-4 rounded-lg flex items-start space-x-3 border ${
        darkMode
          ? 'bg-blue-900/30 border-blue-700/50'
          : 'bg-blue-100 border-blue-300'
      }`}>
        <FiAlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <p className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Changes will take effect immediately</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            Your configuration changes will be applied to all new transactions immediately. Existing transactions in review will not be affected.
          </p>
        </div>
      </div>
    </div>
  );
}
