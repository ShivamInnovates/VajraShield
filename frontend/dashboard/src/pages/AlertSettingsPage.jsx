import React, { useState } from 'react';
import { FiBell, FiMail, FiSlack, FiPhone, FiToggleLeft, FiToggleRight, FiPlus, FiTrash2, FiCheckCircle, FiSave } from 'react-icons/fi';

const defaultRules = [
  { id: 1, name: 'High Risk Transaction', condition: 'risk_score > 0.8', channel: 'pagerduty', severity: 'critical', enabled: true },
  { id: 2, name: 'SLA Breach Warning', condition: 'processing_time > 350ms', channel: 'slack', severity: 'warning', enabled: true },
  { id: 3, name: 'Circuit Breaker Open', condition: 'circuit_state == OPEN', channel: 'pagerduty', severity: 'critical', enabled: true },
  { id: 4, name: 'Model Drift Detected', condition: 'adwin_drift > 0.05', channel: 'email', severity: 'warning', enabled: true },
  { id: 5, name: 'DLQ Depth Alert', condition: 'dlq_count > 10', channel: 'slack', severity: 'high', enabled: true },
  { id: 6, name: 'Failed Login Spike', condition: 'failed_logins_1h > 20', channel: 'pagerduty', severity: 'high', enabled: true },
  { id: 7, name: 'Redis Node Down', condition: 'redis_nodes < 3', channel: 'pagerduty', severity: 'critical', enabled: false },
  { id: 8, name: 'Daily Summary', condition: 'cron: 09:00 IST', channel: 'email', severity: 'info', enabled: true },
];

const severityColors = {
  critical: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' },
  warning: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
  info: { bg: 'bg-teal-500/10 border-teal-500/30', text: 'text-teal-400' },
};

const channelIcons = {
  pagerduty: FiPhone,
  slack: FiSlack,
  email: FiMail,
  sms: FiPhone,
};

export default function AlertSettingsPage({ darkMode }) {
  const [rules, setRules] = useState(defaultRules);
  const [saved, setSaved] = useState(false);

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <FiBell className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alert Settings</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Configure PagerDuty, Slack, Email & SMS alert rules</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {saved ? <><FiCheckCircle className="w-4 h-4" /><span>Saved!</span></> : <><FiSave className="w-4 h-4" /><span>Save Rules</span></>}
          </button>
        </div>
      </div>

      {/* Channel Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { channel: 'PagerDuty', icon: FiPhone, count: rules.filter(r => r.channel === 'pagerduty' && r.enabled).length, color: 'text-red-400', bg: 'bg-red-500/10' },
          { channel: 'Slack', icon: FiSlack, count: rules.filter(r => r.channel === 'slack' && r.enabled).length, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { channel: 'Email', icon: FiMail, count: rules.filter(r => r.channel === 'email' && r.enabled).length, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { channel: 'Active Rules', icon: FiBell, count: rules.filter(r => r.enabled).length, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((ch, i) => (
          <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${ch.bg}`}>
                <ch.icon className={`w-5 h-5 ${ch.color}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{ch.channel}</p>
                <p className={`text-xl font-bold ${ch.color}`}>{ch.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Rules */}
      <div className="space-y-3">
        {rules.map(rule => {
          const sc = severityColors[rule.severity] || severityColors.info;
          const ChannelIcon = channelIcons[rule.channel] || FiBell;
          return (
            <div key={rule.id} className={`p-4 rounded-xl border transition-all ${
              rule.enabled
                ? darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                : darkMode ? 'bg-gray-900/50 border-gray-800/50 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <button onClick={() => toggleRule(rule.id)} className="flex-shrink-0">
                    {rule.enabled ? (
                      <FiToggleRight className="w-8 h-8 text-green-400" />
                    ) : (
                      <FiToggleLeft className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rule.name}</p>
                    <code className={`text-xs mt-1 block ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{rule.condition}</code>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${sc.bg} ${sc.text}`}>{rule.severity}</span>
                  <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <ChannelIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
