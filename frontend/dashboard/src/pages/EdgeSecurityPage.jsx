import React, { useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiActivity, FiGlobe, FiLock, FiZap, FiServer, FiRefreshCw } from 'react-icons/fi';

const wafData = {
  status: 'Active',
  totalRequests: 284521,
  blocked: 1247,
  allowed: 283274,
  ruleHits: [
    { rule: 'SQL Injection (CRS-942)', hits: 423, severity: 'critical' },
    { rule: 'XSS (CRS-941)', hits: 312, severity: 'high' },
    { rule: 'Path Traversal (CRS-930)', hits: 189, severity: 'high' },
    { rule: 'RCE (CRS-932)', hits: 156, severity: 'critical' },
    { rule: 'Scanner Detection (CRS-913)', hits: 167, severity: 'medium' },
  ],
  blockedIPs: [
    { ip: '45.33.32.156', country: 'Unknown', requests: 342, reason: 'Brute Force' },
    { ip: '103.21.58.13', country: 'CN', requests: 189, reason: 'SQL Injection' },
    { ip: '185.220.101.34', country: 'DE', requests: 156, reason: 'Scanner' },
    { ip: '23.129.64.142', country: 'US', requests: 98, reason: 'XSS Attempt' },
  ],
};

const rateLimiterData = {
  perIP: { limit: 100, window: '1 min', current: 67, status: 'normal' },
  perVPA: { limit: 50, window: '1 min', current: 23, status: 'normal' },
  throttled: 34,
  recentThrottles: [
    { ip: '192.168.1.100', vpa: 'user@bank', count: 156, time: '2 min ago' },
    { ip: '10.0.0.55', vpa: 'merchant@pay', count: 89, time: '8 min ago' },
  ],
};

const gatewayData = {
  status: 'Healthy',
  activeConnections: 1247,
  jwtValidations: { success: 28451, failed: 23 },
  mtlsStatus: 'Enforced',
  latency: { p50: '12ms', p95: '45ms', p99: '89ms' },
  uptime: '99.97%',
};

function GaugeBar({ value, max, color, darkMode }) {
  const pct = Math.min((value / max) * 100, 100);
  const isHigh = pct > 80;
  return (
    <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function EdgeSecurityPage({ darkMode }) {
  const [activeTab, setActiveTab] = useState('waf');

  const tabs = [
    { id: 'waf', label: 'WAF Monitor', icon: FiShield, color: 'text-red-400' },
    { id: 'rate', label: 'Rate Limiter', icon: FiZap, color: 'text-amber-400' },
    { id: 'gateway', label: 'API Gateway', icon: FiLock, color: 'text-cyan-400' },
  ];

  const severityColor = {
    critical: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
    high: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' },
    medium: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900 to-red-950/30 border-gray-800' : 'bg-gradient-to-r from-white to-red-50 border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-red-500/20">
              <FiShield className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edge Security</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>WAF • Rate Limiter • API Gateway — All traffic passes through here first</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>All Systems Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100'}`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? darkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow'
                  : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* WAF Tab */}
      {activeTab === 'waf' && (
        <div className="space-y-6">
          {/* WAF Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: wafData.totalRequests.toLocaleString(), color: darkMode ? 'text-white' : 'text-gray-900' },
              { label: 'Blocked', value: wafData.blocked.toLocaleString(), color: 'text-red-400' },
              { label: 'Allowed', value: wafData.allowed.toLocaleString(), color: 'text-green-400' },
              { label: 'Block Rate', value: `${((wafData.blocked / wafData.totalRequests) * 100).toFixed(2)}%`, color: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OWASP Rule Hits */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>OWASP Rule Hits</h3>
              <div className="space-y-3">
                {wafData.ruleHits.map((rule, i) => {
                  const sc = severityColor[rule.severity];
                  return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rule.rule}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${sc.bg} ${sc.text}`}>{rule.severity}</span>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${sc.text}`}>{rule.hits}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blocked IPs */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Blocked IPs</h3>
              <div className="space-y-3">
                {wafData.blockedIPs.map((ip, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                      <FiGlobe className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-mono font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ip.ip}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{ip.country} • {ip.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{ip.requests}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limiter Tab */}
      {activeTab === 'rate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Per-IP Gauge */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Per-IP Rate</p>
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Normal</span>
              </div>
              <p className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {rateLimiterData.perIP.current}<span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/{rateLimiterData.perIP.limit}</span>
              </p>
              <GaugeBar value={rateLimiterData.perIP.current} max={rateLimiterData.perIP.limit} color="bg-cyan-500" darkMode={darkMode} />
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Window: {rateLimiterData.perIP.window}</p>
            </div>

            {/* Per-VPA Gauge */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Per-VPA Rate</p>
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Normal</span>
              </div>
              <p className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {rateLimiterData.perVPA.current}<span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/{rateLimiterData.perVPA.limit}</span>
              </p>
              <GaugeBar value={rateLimiterData.perVPA.current} max={rateLimiterData.perVPA.limit} color="bg-indigo-500" darkMode={darkMode} />
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Window: {rateLimiterData.perVPA.window}</p>
            </div>

            {/* Throttled */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Throttled Today</p>
              <p className="text-3xl font-bold text-amber-400 mb-3">{rateLimiterData.throttled}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Requests that exceeded limits</p>
            </div>
          </div>

          {/* Recent Throttles */}
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Throttle Events</h3>
            <div className="space-y-3">
              {rateLimiterData.recentThrottles.map((t, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center space-x-3">
                    <FiAlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.ip}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>VPA: {t.vpa}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{t.count} req</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Gateway Tab */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Status', value: gatewayData.status, color: 'text-green-400' },
              { label: 'Active Connections', value: gatewayData.activeConnections.toLocaleString(), color: darkMode ? 'text-white' : 'text-gray-900' },
              { label: 'mTLS', value: gatewayData.mtlsStatus, color: 'text-cyan-400' },
              { label: 'Uptime', value: gatewayData.uptime, color: 'text-green-400' },
            ].map((s, i) => (
              <div key={i} className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JWT Validations */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>JWT Validations</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Successful</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">{gatewayData.jwtValidations.success.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiXCircle className="w-5 h-5 text-red-400" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Failed</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">{gatewayData.jwtValidations.failed}</span>
                </div>
                <div className={`h-0.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {((gatewayData.jwtValidations.success / (gatewayData.jwtValidations.success + gatewayData.jwtValidations.failed)) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Latency */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gateway Latency</h3>
              <div className="space-y-4">
                {Object.entries(gatewayData.latency).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className={`text-sm font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{k}</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'}`}>
                <p className={`text-xs ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  <FiLock className="w-3 h-3 inline mr-1" />
                  mTLS enforced on all internal hops — zero-trust architecture
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
