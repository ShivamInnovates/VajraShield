import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiFilter, FiCalendar, FiUser, FiActivity } from 'react-icons/fi';

export default function AuditLogs({ darkMode }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterAndSortLogs();
  }, [logs, searchTerm, filterType, sortBy]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          id: 'LOG001',
          timestamp: '2026-04-16 10:30:45',
          user: 'Shivaji Analyst',
          action: 'TRANSACTION_REVIEWED',
          description: 'Reviewed transaction TXN001 - Approved',
          status: 'success',
          details: {
            transactionId: 'TXN001',
            decision: 'approved',
            notes: 'Transaction verified as legitimate',
          },
        },
        {
          id: 'LOG002',
          timestamp: '2026-04-16 10:25:30',
          user: 'Admin',
          action: 'SYSTEM_LOGIN',
          description: 'User logged into VajraShield',
          status: 'success',
          details: { ipAddress: '192.168.1.1' },
        },
        {
          id: 'LOG003',
          timestamp: '2026-04-16 10:20:15',
          user: 'Shivaji Analyst',
          action: 'REPORT_GENERATED',
          description: 'Daily compliance report generated',
          status: 'success',
          details: { reportType: 'daily_compliance' },
        },
        {
          id: 'LOG004',
          timestamp: '2026-04-16 10:15:00',
          user: 'System',
          action: 'ALERT_TRIGGERED',
          description: 'High-risk transaction alert triggered',
          status: 'warning',
          details: {
            transactionId: 'TXN004',
            riskScore: 0.92,
          },
        },
        {
          id: 'LOG005',
          timestamp: '2026-04-16 10:10:45',
          user: 'Shivaji Analyst',
          action: 'SETTINGS_MODIFIED',
          description: 'RBI Configuration rules updated',
          status: 'success',
          details: { section: 'rbi_rules' },
        },
        {
          id: 'LOG006',
          timestamp: '2026-04-16 10:05:30',
          user: 'Guest',
          action: 'UNAUTHORIZED_ACCESS',
          description: 'Unauthorized access attempt detected',
          status: 'error',
          details: { ipAddress: '203.0.113.45' },
        },
      ];
      setLogs(mockData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
    setLoading(false);
  };

  const filterAndSortLogs = () => {
    let filtered = logs.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        log.action.includes(filterType) ||
        log.status === filterType;

      return matchesSearch && matchesFilter;
    });

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'action') {
      filtered.sort((a, b) => a.action.localeCompare(b.action));
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action) => {
    const iconProps = 'w-4 h-4';
    if (action.includes('REVIEWED')) return <FiCheckCircle className={iconProps} />;
    if (action.includes('LOGIN')) return <FiUser className={iconProps} />;
    if (action.includes('REPORT')) return <FiDownload className={iconProps} />;
    if (action.includes('TRIGGERED')) return <FiActivity className={iconProps} />;
    return <FiActivity className={iconProps} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'warning':
        return darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700';
      case 'error':
        return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default:
        return darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Audit Logs
        </h1>
        <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Complete system activity and compliance audit trail
        </p>
      </div>

      {/* Controls */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none`}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <FiFilter className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none transition-all ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
            >
              <option value="all">All Actions</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="LOGIN">Login</option>
              <option value="REPORT">Report</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <FiCalendar className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none transition-all ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
            >
              <option value="date">Sort by Date (Newest)</option>
              <option value="action">Sort by Action</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            <FiDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="p-12 text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No audit logs found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-50 border-b border-gray-200'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timestamp
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    User
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Action
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id} className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.timestamp}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {log.user}
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="font-mono text-xs">{log.action}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.description}
                    </td>
                    <td className={`px-6 py-4 text-sm`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
        <div className="flex items-center space-x-2">
          <button className={`px-4 py-2 rounded-lg transition-all ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            Previous
          </button>
          <button className={`px-4 py-2 rounded-lg transition-all ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
