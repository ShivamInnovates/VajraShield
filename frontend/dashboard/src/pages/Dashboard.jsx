import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchDashboardMetrics } from '../services/api';
import StatusCard from '../components/StatusCard';
import FeatureCard from '../components/FeatureCard';
import { FiTrendingUp, FiAlertCircle, FiClock, FiCheckCircle, FiDownloadCloud } from 'react-icons/fi';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ darkMode }) {
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      // Mock data for now
      const data = {
        totalTransactions: 1524,
        flaggedCount: 47,
        pendingReview: 12,
        accuracy: 94.2,
        slaCompliance: 98.5,
        modelStatus: 'Active',
        weeklyData: [
          { day: 'Mon', count: 215, risk_avg: 0.42 },
          { day: 'Tue', count: 289, risk_avg: 0.48 },
          { day: 'Wed', count: 342, risk_avg: 0.45 },
          { day: 'Thu', count: 298, risk_avg: 0.51 },
          { day: 'Fri', count: 380, risk_avg: 0.49 },
          { day: 'Sat', count: 0, risk_avg: 0 },
          { day: 'Sun', count: 0, risk_avg: 0 },
        ],
        riskDistribution: [
          { risk: 'Low', count: 892, percentage: 58.5 },
          { risk: 'Medium', count: 467, percentage: 30.6 },
          { risk: 'High', count: 142, percentage: 9.3 },
          { risk: 'Critical', count: 23, percentage: 1.5 },
        ],
        hourlyTrend: [
          { time: '00:00', transactions: 45, processed: 42 },
          { time: '02:00', transactions: 38, processed: 36 },
          { time: '04:00', transactions: 62, processed: 60 },
          { time: '06:00', transactions: 78, processed: 75 },
          { time: '08:00', transactions: 89, processed: 85 },
          { time: '10:00', transactions: 112, processed: 110 },
          { time: '12:00', transactions: 127, processed: 125 },
          { time: '14:00', transactions: 98, processed: 96 },
          { time: '16:00', transactions: 76, processed: 74 },
          { time: '18:00', transactions: 65, processed: 64 },
          { time: '20:00', transactions: 54, processed: 52 },
          { time: '22:00', transactions: 43, processed: 41 },
        ],
        performanceMetrics: {
          avgResponseTime: '420ms',
          processingRate: '98.2%',
          modelAccuracy: '94.2%',
          falsePositiveRate: '3.8%',
        },
      };
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleExportReport = () => {
    console.log('Exporting report...');
    // TODO: Implement report export functionality
  };

  if (!metrics) return <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className={`flex items-center justify-between p-6 rounded-lg ${
        darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'
      }`}>
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
            Analytics Dashboard
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive transaction risk analysis and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-black'
            }`}
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={handleExportReport}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/10 hover:bg-black/20 text-black'
            } transition-colors`}
          >
            <FiDownloadCloud className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          label="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          icon={FiTrendingUp}
          darkMode={darkMode}
        />
        <StatusCard
          label="Flagged"
          value={metrics.flaggedCount}
          icon={FiAlertCircle}
          highlight="red"
          darkMode={darkMode}
        />
        <StatusCard
          label="Model Accuracy"
          value={`${metrics.accuracy}%`}
          icon={FiCheckCircle}
          highlight="green"
          darkMode={darkMode}
        />
        <StatusCard
          label="SLA Compliance"
          value={`${metrics.slaCompliance}%`}
          icon={FiClock}
          highlight="blue"
          darkMode={darkMode}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(metrics.performanceMetrics).map(([key, value]) => (
          <div key={key} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {key.replace(/_/g, ' ').toUpperCase().replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Transaction Trend */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Hourly Transaction Volume
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={metrics.hourlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2a2a' : '#e5e5e5'} />
              <XAxis dataKey="time" stroke={darkMode ? '#6b7280' : '#9ca3af'} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1a1a1a' : 'white', border: 'none', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
              <Legend />
              <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} name="Received" />
              <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2} name="Processed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Weekly Trend
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2a2a' : '#e5e5e5'} />
              <XAxis dataKey="day" stroke={darkMode ? '#6b7280' : '#9ca3af'} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1a1a1a' : 'white', border: 'none', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Transaction Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={metrics.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Categories Table */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Risk Breakdown
          </h3>
          <div className="space-y-3">
            {metrics.riskDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.risk}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.count.toLocaleString()}
                  </span>
                  <div className={`w-24 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-10 text-right ${darkMode ? 'text-white' : 'text-black'}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Text */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm">
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            <span>Model accuracy remains consistently above 94%, indicating reliable risk scoring</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            <span>98.5% SLA compliance maintained with average processing time of 420ms</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            <span className="text-amber-500 font-bold mt-0.5">!</span>
            <span>47 flagged transactions require review - 3.1% of total volume</span>
          </li>
          <li className={`flex items-start space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            <span className="text-blue-500 font-bold mt-0.5">→</span>
            <span>Peak transaction volume occurs between 10:00-14:00 daily</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
