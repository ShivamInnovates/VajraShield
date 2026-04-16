import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatusCard from '../components/StatusCard';
import { FiTrendingUp, FiAlertCircle, FiClock, FiCheckCircle, FiDownloadCloud } from 'react-icons/fi';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockMetrics = {
  totalTransactions: 1524,
  flaggedCount: 47,
  pendingReview: 12,
  accuracy: 94.2,
  slaCompliance: 98.5,
  weeklyData: [
    { day: 'Mon', count: 215 }, { day: 'Tue', count: 289 }, { day: 'Wed', count: 342 },
    { day: 'Thu', count: 298 }, { day: 'Fri', count: 380 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 },
  ],
  riskDistribution: [
    { risk: 'Low', count: 892, percentage: 58.5 },
    { risk: 'Medium', count: 467, percentage: 30.6 },
    { risk: 'High', count: 142, percentage: 9.3 },
    { risk: 'Critical', count: 23, percentage: 1.5 },
  ],
  hourlyTrend: [
    { time: '00:00', transactions: 45, processed: 42 }, { time: '02:00', transactions: 38, processed: 36 },
    { time: '04:00', transactions: 62, processed: 60 }, { time: '06:00', transactions: 78, processed: 75 },
    { time: '08:00', transactions: 89, processed: 85 }, { time: '10:00', transactions: 112, processed: 110 },
    { time: '12:00', transactions: 127, processed: 125 }, { time: '14:00', transactions: 98, processed: 96 },
    { time: '16:00', transactions: 76, processed: 74 }, { time: '18:00', transactions: 65, processed: 64 },
    { time: '20:00', transactions: 54, processed: 52 }, { time: '22:00', transactions: 43, processed: 41 },
  ],
  performanceMetrics: {
    'Avg Response Time': '420ms',
    'Processing Rate': '98.2%',
    'Model Accuracy': '94.2%',
    'False Positive Rate': '3.8%',
  },
};

export default function Dashboard({ darkMode }) {
  const [metrics] = useState(mockMetrics);
  const [timeRange, setTimeRange] = useState('24h');

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
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className={`p-4 rounded-xl border ${card} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <h1 className={`text-xl font-bold ${title}`}>Analytics Dashboard</h1>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Hourly Trend */}
        <div className={`p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Hourly Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={metrics.hourlyTrend}>
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

        {/* Weekly Trend */}
        <div className={`p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metrics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="day" stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} tick={{ fontSize: 10, fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Pie */}
        <div className={`p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={metrics.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                dataKey="count"
              >
                {metrics.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Breakdown Table */}
        <div className={`p-4 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-3 ${title}`}>Risk Breakdown</h3>
          <div className="space-y-2.5">
            {metrics.riskDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.risk}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${sub}`}>{item.count.toLocaleString()}</span>
                  <div className={`w-24 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index] }}></div>
                  </div>
                  <span className={`text-sm font-bold w-10 text-right ${title}`}>{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className={`p-4 rounded-xl border ${card}`}>
        <h3 className={`text-sm font-bold mb-3 ${title}`}>Key Insights</h3>
        <div className="space-y-2">
          {[
            { icon: '✓', color: 'text-green-500', text: 'Model accuracy remains consistently above 94%, indicating reliable risk scoring' },
            { icon: '✓', color: 'text-green-500', text: '98.5% SLA compliance maintained with average processing time of 420ms' },
            { icon: '!', color: 'text-amber-500', text: '47 flagged transactions require review — 3.1% of total volume' },
            { icon: '→', color: 'text-indigo-500', text: 'Peak transaction volume occurs between 10:00–14:00 daily' },
          ].map((insight, i) => (
            <div key={i} className={`flex items-start space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <span className={`font-bold text-sm flex-shrink-0 mt-0.5 ${insight.color}`}>{insight.icon}</span>
              <span className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
