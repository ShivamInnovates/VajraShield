import React, { useState } from 'react';
import { FiBell, FiMail, FiSlack, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function AlertSettings({ darkMode }) {
  const [alerts, setAlerts] = useState({
    highRiskTransaction: {
      enabled: true,
      threshold: 0.8,
      channels: { email: true, slack: true, system: true },
    },
    slaViolation: {
      enabled: true,
      channels: { email: true, slack: true, system: true },
    },
    velocityAnomaly: {
      enabled: true,
      channels: { email: true, slack: false, system: true },
    },
    geographicMismatch: {
      enabled: true,
      channels: { email: true, slack: false, system: true },
    },
    newAccountActivity: {
      enabled: true,
      channels: { email: false, slack: true, system: true },
    },
    systemErrors: {
      enabled: true,
      channels: { email: true, slack: true, system: true },
    },
  });

  const [saved, setSaved] = useState(false);

  const handleToggleAlert = (alertKey) => {
    setAlerts((prev) => ({
      ...prev,
      [alertKey]: {
        ...prev[alertKey],
        enabled: !prev[alertKey].enabled,
      },
    }));
    setSaved(false);
  };

  const handleToggleChannel = (alertKey, channel) => {
    setAlerts((prev) => ({
      ...prev,
      [alertKey]: {
        ...prev[alertKey],
        channels: {
          ...prev[alertKey].channels,
          [channel]: !prev[alertKey].channels[channel],
        },
      },
    }));
    setSaved(false);
  };

  const handleThresholdChange = (alertKey, value) => {
    setAlerts((prev) => ({
      ...prev,
      [alertKey]: {
        ...prev[alertKey],
        threshold: Number(value),
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log('Alert settings saved:', alerts);
  };

  const alertConfig = [
    {
      key: 'highRiskTransaction',
      title: 'High-Risk Transaction Alert',
      description: 'Alerts when transaction risk score exceeds threshold',
      hasThreshold: true,
    },
    {
      key: 'slaViolation',
      title: 'SLA Violation Alert',
      description: 'Alerts when transaction processing time exceeds SLA',
      hasThreshold: false,
    },
    {
      key: 'velocityAnomaly',
      title: 'Velocity Anomaly Alert',
      description: 'Alerts when unusual transaction frequency is detected',
      hasThreshold: false,
    },
    {
      key: 'geographicMismatch',
      title: 'Geographic Mismatch Alert',
      description: 'Alerts when transaction location is suspicious',
      hasThreshold: false,
    },
    {
      key: 'newAccountActivity',
      title: 'New Account Activity Alert',
      description: 'Alerts when new accounts show transaction activity',
      hasThreshold: false,
    },
    {
      key: 'systemErrors',
      title: 'System Error Alert',
      description: 'Alerts when system errors or anomalies are detected',
      hasThreshold: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Alert Settings
        </h1>
        <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure alerts and notifications for transaction events
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${darkMode ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-100 border border-green-300'}`}>
          <FiCheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <p className={`${darkMode ? 'text-green-300' : 'text-green-700'}`}>Alert settings saved successfully!</p>
        </div>
      )}

      {/* Alert Configuration Cards */}
      <div className="space-y-4">
        {alertConfig.map((config) => (
          <div
            key={config.key}
            className={`p-6 rounded-xl border transition-all ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Alert Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {config.title}
                  </h2>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts[config.key].enabled}
                      onChange={() => handleToggleAlert(config.key)}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {config.description}
                </p>
              </div>
            </div>

            {/* Threshold */}
            {config.hasThreshold && alerts[config.key].enabled && (
              <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Risk Score Threshold
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alerts[config.key].threshold}
                    onChange={(e) => handleThresholdChange(config.key, e.target.value)}
                    className="flex-1"
                  />
                  <span className={`text-lg font-bold px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    {alerts[config.key].threshold.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {/* Notification Channels */}
            {alerts[config.key].enabled && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notification Channels
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts[config.key].channels.email}
                      onChange={() => handleToggleChannel(config.key, 'email')}
                      className="w-4 h-4"
                    />
                    <FiMail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Notification</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts[config.key].channels.slack}
                      onChange={() => handleToggleChannel(config.key, 'slack')}
                      className="w-4 h-4"
                    />
                    <FiSlack className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Slack Message</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts[config.key].channels.system}
                      onChange={() => handleToggleChannel(config.key, 'system')}
                      className="w-4 h-4"
                    />
                    <FiBell className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>System Notification</span>
                  </label>
                </div>
              </div>
            )}

            {/* Disabled State */}
            {!alerts[config.key].enabled && (
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This alert is currently disabled
                </p>
              </div>
            )}
          </div>
        ))}
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
          <span>Save Alert Settings</span>
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
          <p className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Email and Slack integration required</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            To receive alerts via email or Slack, ensure your notification preferences are configured in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
