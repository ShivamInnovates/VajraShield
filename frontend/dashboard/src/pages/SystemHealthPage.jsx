import React, { useState } from 'react';
import { FiActivity, FiCheckCircle, FiAlertTriangle, FiXCircle, FiServer, FiCpu, FiHardDrive, FiWifi, FiClock, FiRefreshCw, FiTrendingUp, FiEye } from 'react-icons/fi';

const services = [
  { name: 'Payment App (FastAPI)', status: 'healthy', latency: '12ms', uptime: '99.99%', cpu: 23, memory: 45 },
  { name: 'WAF (OWASP)', status: 'healthy', latency: '2ms', uptime: '99.99%', cpu: 8, memory: 12 },
  { name: 'Rate Limiter', status: 'healthy', latency: '1ms', uptime: '99.98%', cpu: 5, memory: 15 },
  { name: 'API Gateway', status: 'healthy', latency: '8ms', uptime: '99.97%', cpu: 18, memory: 34 },
  { name: 'Redis Cluster', status: 'healthy', latency: '3ms', uptime: '99.99%', cpu: 12, memory: 67 },
  { name: 'Layer 3.5 Filter', status: 'healthy', latency: '4ms', uptime: '99.98%', cpu: 15, memory: 28 },
  { name: 'River ML (AdaptiveRF)', status: 'healthy', latency: '45ms', uptime: '99.95%', cpu: 67, memory: 78 },
  { name: 'Neo4j Graph', status: 'warning', latency: '89ms', uptime: '99.90%', cpu: 45, memory: 82 },
  { name: 'Decision Engine', status: 'healthy', latency: '12ms', uptime: '99.97%', cpu: 34, memory: 42 },
  { name: 'PostgreSQL', status: 'healthy', latency: '5ms', uptime: '99.99%', cpu: 22, memory: 56 },
  { name: 'Supabase', status: 'healthy', latency: '15ms', uptime: '99.96%', cpu: 18, memory: 38 },
  { name: 'Kafka Cluster', status: 'healthy', latency: '3ms', uptime: '99.99%', cpu: 28, memory: 52 },
  { name: 'Jaeger (Tracing)', status: 'healthy', latency: '8ms', uptime: '99.95%', cpu: 15, memory: 24 },
  { name: 'Prometheus', status: 'healthy', latency: '2ms', uptime: '99.99%', cpu: 10, memory: 35 },
  { name: 'Grafana', status: 'healthy', latency: '25ms', uptime: '99.97%', cpu: 8, memory: 22 },
  { name: 'RBI Reporter', status: 'healthy', latency: '18ms', uptime: '99.94%', cpu: 12, memory: 28 },
];

const circuitBreakers = [
  { service: 'River ML', state: 'CLOSED', failureRate: 0.2, threshold: 50, fallback: 'Rule-based scoring' },
  { service: 'Neo4j Graph', state: 'HALF_OPEN', failureRate: 8.5, threshold: 50, fallback: 'Skip graph features' },
  { service: 'Decision Engine', state: 'CLOSED', failureRate: 0.1, threshold: 50, fallback: 'Lane 1 auto-approve' },
  { service: 'Supabase', state: 'CLOSED', failureRate: 0.0, threshold: 50, fallback: 'PostgreSQL direct' },
];

const driftData = {
  status: 'stable', confidence: 0.94, drift: 0.012, threshold: 0.05,
  features: [
    { name: 'amount_zscore', drift: 0.008, status: 'stable' },
    { name: 'velocity_1h', drift: 0.015, status: 'stable' },
    { name: 'geo_distance', drift: 0.042, status: 'warning' },
    { name: 'recipient_age', drift: 0.003, status: 'stable' },
  ],
};

const cbStateColor = {
  CLOSED: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', label: 'Closed (Normal)' },
  OPEN: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Open (Failing)' },
  HALF_OPEN: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Half-Open (Testing)' },
};

export default function SystemHealthPage({ darkMode }) {
  const [tab, setTab] = useState('services');

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const warningCount = services.filter(s => s.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900 to-violet-950/30 border-gray-800' : 'bg-gradient-to-r from-white to-violet-50 border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <FiActivity className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Health & Observability</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jaeger • Prometheus • Grafana • ADWIN • Circuit Breakers • PagerDuty</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Services</p>
              <p className="text-lg font-bold text-green-400">{healthyCount}/{services.length}</p>
            </div>
            {warningCount > 0 && (
              <div className="text-right">
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Warnings</p>
                <p className="text-lg font-bold text-amber-400">{warningCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100'}`}>
        {[
          { id: 'services', label: 'Service Health', icon: FiServer },
          { id: 'circuits', label: 'Circuit Breakers', icon: FiRefreshCw },
          { id: 'drift', label: 'Model Drift', icon: FiTrendingUp },
          { id: 'observability', label: 'Observability', icon: FiEye },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? darkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow'
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {tab === 'services' && (
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                {['Service', 'Status', 'Latency', 'Uptime', 'CPU', 'Memory'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
              {services.map((svc, i) => (
                <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{svc.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${svc.status === 'healthy' ? 'text-green-400' : 'text-amber-400'}`}>
                      {svc.status === 'healthy' ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiAlertTriangle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{svc.status}</span>
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{svc.latency}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{svc.uptime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className={`h-full rounded-full ${svc.cpu > 70 ? 'bg-red-500' : svc.cpu > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${svc.cpu}%` }} />
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{svc.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className={`h-full rounded-full ${svc.memory > 80 ? 'bg-red-500' : svc.memory > 60 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${svc.memory}%` }} />
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{svc.memory}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Circuit Breakers Tab */}
      {tab === 'circuits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circuitBreakers.map((cb, i) => {
            const stateStyle = cbStateColor[cb.state] || cbStateColor.CLOSED;
            return (
              <div key={i} className={`p-5 rounded-xl border-2 ${darkMode ? 'bg-gray-900 ' : 'bg-white '} ${stateStyle.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cb.service}</h3>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${stateStyle.bg} ${stateStyle.text}`}>{stateStyle.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Failure Rate</p>
                    <p className={`text-lg font-bold ${cb.failureRate > 5 ? 'text-amber-400' : 'text-green-400'}`}>{cb.failureRate}%</p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Threshold</p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cb.threshold}%</p>
                  </div>
                </div>
                <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">Fallback:</span> {cb.fallback}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Drift Tab */}
      {tab === 'drift' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>ADWIN Status</p>
              <p className="text-2xl font-bold text-green-400 capitalize mt-1">{driftData.status}</p>
            </div>
            <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Overall Drift</p>
              <p className={`text-2xl font-bold mt-1 ${driftData.drift > driftData.threshold ? 'text-red-400' : 'text-green-400'}`}>
                {driftData.drift} <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>/ {driftData.threshold}</span>
              </p>
            </div>
            <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Model Confidence</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{(driftData.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Feature Drift (ADWIN Monitor)</h3>
            <div className="space-y-3">
              {driftData.features.map((f, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${f.status === 'stable' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className={`text-sm font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{f.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className={`h-full rounded-full ${f.drift > 0.03 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(f.drift / driftData.threshold) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${f.status === 'stable' ? 'text-green-400' : 'text-amber-400'}`}>{f.drift}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Observability Tab */}
      {tab === 'observability' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Jaeger', desc: 'Distributed Tracing', status: 'Running', icon: FiActivity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', url: 'http://localhost:16686', badge: 'new' },
            { name: 'Prometheus', desc: 'Metrics Collection', status: 'Running', icon: FiTrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10', url: 'http://localhost:9090', badge: 'new' },
            { name: 'Grafana', desc: 'Dashboards & Alerts', status: 'Running', icon: FiEye, color: 'text-green-400', bg: 'bg-green-500/10', url: 'http://localhost:3000', badge: 'new' },
            { name: 'ADWIN Monitor', desc: 'Drift Detection', status: 'Active', icon: FiCpu, color: 'text-violet-400', bg: 'bg-violet-500/10', badge: 'now wired' },
            { name: 'Circuit Breakers', desc: 'Fallback → Rules', status: '3/4 Closed', icon: FiRefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'new' },
            { name: 'PagerDuty', desc: 'On-Call Alerts', status: 'Connected', icon: FiWifi, color: 'text-red-400', bg: 'bg-red-500/10', badge: 'new' },
          ].map((tool, i) => (
            <div key={i} className={`p-5 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:shadow-xl'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${tool.bg}`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                {tool.badge && (
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/30">{tool.badge}</span>
                )}
              </div>
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tool.name}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tool.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-semibold text-green-400">{tool.status}</span>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noreferrer" className={`text-xs font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                    Open →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
