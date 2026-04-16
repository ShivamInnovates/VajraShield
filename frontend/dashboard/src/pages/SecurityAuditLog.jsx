import React, { useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiMapPin, FiMonitor, FiClock, FiSearch, FiDownload } from 'react-icons/fi';

const mockLogs = [
  { id: 1, action: 'Login Success', user: 'shivaji@vajrashield.in', ip: '192.168.1.42', location: 'Mumbai, IN', device: 'Chrome / macOS', time: '2026-04-16 19:23:00', status: 'success' },
  { id: 2, action: 'Login Failed', user: 'admin@vajrashield.in', ip: '103.21.58.13', location: 'Delhi, IN', device: 'Firefox / Windows', time: '2026-04-16 18:45:00', status: 'failed' },
  { id: 3, action: 'MFA Verified', user: 'shivaji@vajrashield.in', ip: '192.168.1.42', location: 'Mumbai, IN', device: 'Chrome / macOS', time: '2026-04-16 19:23:15', status: 'success' },
  { id: 4, action: 'Password Change', user: 'analyst2@vajrashield.in', ip: '10.0.0.55', location: 'Bangalore, IN', device: 'Safari / iOS', time: '2026-04-16 17:10:00', status: 'success' },
  { id: 5, action: 'Login Failed', user: 'unknown@test.com', ip: '45.33.32.156', location: 'Unknown', device: 'curl / Linux', time: '2026-04-16 16:32:00', status: 'failed' },
  { id: 6, action: 'Session Expired', user: 'shivaji@vajrashield.in', ip: '192.168.1.42', location: 'Mumbai, IN', device: 'Chrome / macOS', time: '2026-04-16 14:00:00', status: 'warning' },
  { id: 7, action: 'Login Failed', user: 'unknown@test.com', ip: '45.33.32.156', location: 'Unknown', device: 'curl / Linux', time: '2026-04-16 16:33:00', status: 'failed' },
  { id: 8, action: 'Login Failed', user: 'unknown@test.com', ip: '45.33.32.156', location: 'Unknown', device: 'curl / Linux', time: '2026-04-16 16:34:00', status: 'failed' },
  { id: 9, action: 'IP Blocked', user: 'unknown@test.com', ip: '45.33.32.156', location: 'Unknown', device: 'N/A', time: '2026-04-16 16:35:00', status: 'blocked' },
  { id: 10, action: 'Role Changed', user: 'analyst2@vajrashield.in', ip: '10.0.0.1', location: 'Bangalore, IN', device: 'Chrome / Windows', time: '2026-04-16 12:00:00', status: 'success' },
];

export default function SecurityAuditLog({ darkMode }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredLogs = mockLogs.filter(log => {
    if (filter !== 'all' && log.status !== filter) return false;
    if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.ip.includes(search) && !log.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusConfig = {
    success: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: FiCheckCircle },
    failed: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: FiAlertTriangle },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: FiClock },
    blocked: { color: 'text-red-500', bg: 'bg-red-600/10 border-red-600/20', icon: FiShield },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-500/20">
              <FiShield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Audit Log</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Login attempts, access events, and security alerts</p>
            </div>
          </div>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <FiDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: '10', color: 'text-white' },
          { label: 'Successful', value: '4', color: 'text-green-400' },
          { label: 'Failed Attempts', value: '4', color: 'text-red-400' },
          { label: 'Blocked IPs', value: '1', color: 'text-red-500' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4`}>
        <div className={`relative flex-1 w-full`}>
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, IP, or action..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:border-indigo-500`}
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'success', 'failed', 'blocked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              {['Status', 'Action', 'User', 'IP Address', 'Location', 'Device', 'Time'].map(h => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
            {filteredLogs.map(log => {
              const cfg = statusConfig[log.status] || statusConfig.success;
              const StatusIcon = cfg.icon;
              return (
                <tr key={log.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="capitalize">{log.status}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{log.action}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.user}</td>
                  <td className={`px-4 py-3 text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.ip}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      <FiMapPin className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      <FiMonitor className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.device}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{log.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
