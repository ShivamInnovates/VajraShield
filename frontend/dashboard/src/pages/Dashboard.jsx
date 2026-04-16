import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatusCard from '../components/StatusCard';
import { FiTrendingUp, FiAlertCircle, FiClock, FiCheckCircle, FiDownloadCloud, FiActivity } from 'react-icons/fi';

// Recharts Colors
const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ darkMode }) {
  const metrics    = useStore(state => state.metrics);
  const liveEvents = useStore(state => state.liveEvents);
  const isConnected = useStore(state => state.isConnected);
  const [timeRange, setTimeRange] = useState('24h');

  // ── Compute hourly trend live from raw events (never from persisted state) ──
  const hourlyTrend = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, i) => ({
      time:         `${i.toString().padStart(2, '0')}:00`,
      transactions: 0,
      processed:    0,
    }));
    liveEvents.forEach(ev => {
      // _hour is stamped at ingest time; fall back to parsing createdAt
      let h = ev._hour;
      if (h === undefined && ev.createdAt) {
        h = new Date(ev.createdAt).getHours();
      }
      if (typeof h === 'number' && h >= 0 && h < 24) {
        buckets[h].transactions += 1;
        buckets[h].processed    += 1;
      }
    });
    return buckets;
  }, [liveEvents]);

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const title = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-600';
  const label = darkMode ? 'text-gray-500' : 'text-gray-500';
  const gridLine = darkMode ? '#374151' : '#e5e7eb';
  const axisColor = darkMode ? '#6b7280' : '#9ca3af';
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: darkMode ? '#f9fafb' : '#111827',
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className={`p-4 rounded-xl border ${card} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className={`text-xl font-bold ${title}`}>Analytics Dashboard</h1>
            <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          <p className={`text-sm mt-0.5 ${sub}`}>Comprehensive transaction risk analysis and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button 
            onClick={() => {
              if (window.confirm('Reset all dashboard metrics? This will clear local history.')) {
                useStore.getState().resetMetrics();
              }
            }}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            <FiAlertCircle className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
          <button className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <FiDownloadCloud className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard label="Total Transactions" value={metrics.totalTransactions.toLocaleString()} icon={FiTrendingUp} darkMode={darkMode} />
        <StatusCard label="Flagged" value={metrics.flaggedCount} icon={FiAlertCircle} highlight="red" darkMode={darkMode} />
        <StatusCard label="Model Accuracy" value={`${metrics.accuracy}%`} icon={FiCheckCircle} highlight="green" darkMode={darkMode} />
        <StatusCard label="SLA Compliance" value={`${metrics.slaCompliance}%`} icon={FiClock} highlight="blue" darkMode={darkMode} />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-full">
        {Object.entries(metrics.performanceMetrics).map(([key, value]) => (
          <div key={key} className={`p-4 rounded-xl border ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${label}`}>{key}</p>
            <p className={`text-2xl font-bold mt-1.5 ${title}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Hourly Trend (Wider) */}
        <div className={`lg:col-span-2 p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Hourly Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', color: axisColor }} />
              <Line type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={2} dot={false} name="Received" />
              <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2} dot={false} name="Processed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Transaction Feed (New Component) */}
        <div className={`p-4 rounded-xl border ${card} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${title}`}>Live Events</h3>
            <FiActivity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 custom-scrollbar">
            {liveEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FiActivity className="w-8 h-8 text-gray-600 mb-2 animate-pulse" />
                <p className={`text-xs ${sub}`}>Waiting for live transactions...</p>
              </div>
            ) : (
              liveEvents.map((event, i) => (
                <div key={i} className={`p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'} animate-in fade-in slide-in-from-right-4 duration-500`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-gray-500">{event.txn_id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      event.decision === 'APPROVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {event.decision}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${title}`}>Risk: {(event.unified_score * 100).toFixed(1)}%</span>
                    <span className={`text-[10px] ${sub}`}>{event.latency_budget.split(' ')[0]} ms</span>
                  </div>
                  {event.signals && event.signals.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {event.signals.slice(0, 2).map((sig, j) => (
                        <span key={j} className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                          {sig.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Risk Distribution Pie */}
        <div className={`p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Risk Distribution</h3>
          <div className="flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={metrics.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={70}
                  dataKey="count"
                >
                  {metrics.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-64 space-y-2 mt-4 md:mt-0">
               {metrics.riskDistribution.map((item, index) => (
                 <div key={index} className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                     <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.risk}</span>
                   </div>
                   <span className={`text-xs font-bold ${title}`}>{item.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className={`p-4 rounded-xl border ${card}`}>
            <h3 className={`text-sm font-bold mb-3 ${title}`}>Security Insights</h3>
            <div className="space-y-2">
            {[
                { icon: '✓', color: 'text-green-500', text: 'Decision engine operating within 250ms SLA for parallel analysis' },
                { icon: '✓', color: 'text-green-500', text: 'Cold start handler active for new users to prevent first-transaction fraud' },
                { icon: '!', color: 'text-amber-500', text: `${metrics.flaggedCount} suspicious patterns auto-flagged for human review queue` },
                { icon: 'i', color: 'text-indigo-500', text: 'Graph fraud-ring detection identifying 12% shared device connections' },
            ].map((insight, i) => (
                <div key={i} className={`flex items-start space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className={`font-bold text-sm flex-shrink-0 mt-0.5 ${insight.color}`}>{insight.icon}</span>
                <span className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight.text}</span>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
