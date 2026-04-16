import React, { useState } from 'react';
import { FiSettings, FiSave, FiRefreshCw, FiSliders, FiClock, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function RBIConfigPage({ darkMode }) {
  const [config, setConfig] = useState({
    lane3Threshold: 0.65,
    slaTarget: 400,
    humanReviewSLA: 30,
    coldStartThreshold: 10,
    rateLimit_IP: 100,
    rateLimit_VPA: 50,
    circuitBreakerThreshold: 50,
    autoBlockScore: 0.92,
    mfaRequired: true,
    auditRetention: 365,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const ConfigField = ({ label, description, children }) => (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <FiSettings className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>RBI Configuration</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System thresholds, SLA targets, and compliance settings</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {saved ? <><FiRefreshCw className="w-4 h-4" /><span>Saved!</span></> : <><FiSave className="w-4 h-4" /><span>Save Configuration</span></>}
          </button>
        </div>
      </div>

      {/* Risk Thresholds */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <FiSliders className="w-5 h-5 text-amber-400" />
          <span>Risk Thresholds</span>
        </h3>
        <div className="space-y-3">
          <ConfigField label="Lane 3 Score Threshold" description="Transactions with risk score above this are routed to Lane 3 (Suspicious)">
            <div className="flex items-center space-x-3">
              <input
                type="range" min="0.5" max="0.95" step="0.05"
                value={config.lane3Threshold}
                onChange={e => updateConfig('lane3Threshold', parseFloat(e.target.value))}
                className="w-32"
              />
              <span className={`text-sm font-bold w-12 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.lane3Threshold}</span>
            </div>
          </ConfigField>
          <ConfigField label="Auto-Block Score" description="Transactions at or above this score are directly blocked (Lane 3)">
            <div className="flex items-center space-x-3">
              <input
                type="range" min="0.8" max="1.0" step="0.01"
                value={config.autoBlockScore}
                onChange={e => updateConfig('autoBlockScore', parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-bold text-red-400 w-12 text-right">{config.autoBlockScore}</span>
            </div>
          </ConfigField>
          <ConfigField label="Cold Start Threshold" description="Accounts with fewer transactions than this are routed to Lane 2 for deep analysis">
            <input
              type="number" min="1" max="50"
              value={config.coldStartThreshold}
              onChange={e => updateConfig('coldStartThreshold', parseInt(e.target.value))}
              className={`w-20 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
        </div>
      </div>

      {/* SLA Settings */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <FiClock className="w-5 h-5 text-cyan-400" />
          <span>SLA Settings</span>
        </h3>
        <div className="space-y-3">
          <ConfigField label="Processing SLA (ms)" description="Maximum allowed response time for transaction processing">
            <input
              type="number" min="100" max="1000" step="50"
              value={config.slaTarget}
              onChange={e => updateConfig('slaTarget', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
          <ConfigField label="Human Review SLA (min)" description="Maximum time allowed for human review of flagged transactions">
            <input
              type="number" min="5" max="120" step="5"
              value={config.humanReviewSLA}
              onChange={e => updateConfig('humanReviewSLA', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <FiShield className="w-5 h-5 text-red-400" />
          <span>Security & Rate Limiting</span>
        </h3>
        <div className="space-y-3">
          <ConfigField label="Per-IP Rate Limit (req/min)" description="Maximum requests per minute from a single IP">
            <input
              type="number" min="10" max="500"
              value={config.rateLimit_IP}
              onChange={e => updateConfig('rateLimit_IP', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
          <ConfigField label="Per-VPA Rate Limit (req/min)" description="Maximum requests per minute from a single VPA">
            <input
              type="number" min="10" max="200"
              value={config.rateLimit_VPA}
              onChange={e => updateConfig('rateLimit_VPA', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
          <ConfigField label="Circuit Breaker Failure Threshold (%)" description="Open circuit breaker when failure rate exceeds this percentage">
            <input
              type="number" min="10" max="100"
              value={config.circuitBreakerThreshold}
              onChange={e => updateConfig('circuitBreakerThreshold', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
          <ConfigField label="MFA Required" description="Require multi-factor authentication for all dashboard users">
            <button
              onClick={() => updateConfig('mfaRequired', !config.mfaRequired)}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.mfaRequired ? 'bg-indigo-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${config.mfaRequired ? 'left-6' : 'left-0.5'}`} />
            </button>
          </ConfigField>
          <ConfigField label="Audit Log Retention (days)" description="Number of days to retain immutable audit logs">
            <input
              type="number" min="90" max="730"
              value={config.auditRetention}
              onChange={e => updateConfig('auditRetention', parseInt(e.target.value))}
              className={`w-24 px-3 py-1.5 rounded-lg border text-center text-sm font-bold ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          </ConfigField>
        </div>
      </div>

      {/* Warning */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-amber-950/30 border-amber-800/30' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Configuration changes are audited</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>All threshold changes are logged to the immutable audit trail and require admin role. Changes take effect within 30 seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
