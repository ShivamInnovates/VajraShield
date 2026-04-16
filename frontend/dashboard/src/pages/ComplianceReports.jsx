import React, { useState } from 'react';
import { FiDownload, FiCalendar, FiFilter, FiBarChart3, FiPieChart, FiTrendingUp } from 'react-icons/fi';

export default function ComplianceReports({ darkMode }) {
  const [reports, setReports] = useState([
    {
      id: 'RPT001',
      name: 'Daily Compliance Report',
      date: '2026-04-16',
      type: 'daily',
      period: '2026-04-16',
      status: 'completed',
      metrics: {
        totalTransactions: 1524,
        flaggedTransactions: 47,
        approvedCount: 1420,
        rejectedCount: 57,
        averageProcessingTime: '4.2 min',
        slaCompliance: '98.5%',
      },
      rbiCompliance: {
        neftCompliant: true,
        rtgsCompliant: true,
        amlScore: 94.2,
      },
    },
    {
      id: 'RPT002',
      name: 'Weekly Compliance Report',
      date: '2026-04-14',
      type: 'weekly',
      period: '2026-04-08 to 2026-04-14',
      status: 'completed',
      metrics: {
        totalTransactions: 10640,
        flaggedTransactions: 312,
        approvedCount: 9890,
        rejectedCount: 438,
        averageProcessingTime: '4.5 min',
        slaCompliance: '97.8%',
      },
      rbiCompliance: {
        neftCompliant: true,
        rtgsCompliant: true,
        amlScore: 93.1,
      },
    },
    {
      id: 'RPT003',
      name: 'Monthly Compliance Report',
      date: '2026-04-01',
      type: 'monthly',
      period: 'April 2026',
      status: 'completed',
      metrics: {
        totalTransactions: 45280,
        flaggedTransactions: 1341,
        approvedCount: 42150,
        rejectedCount: 1789,
        averageProcessingTime: '4.3 min',
        slaCompliance: '98.1%',
      },
      rbiCompliance: {
        neftCompliant: true,
        rtgsCompliant: true,
        amlScore: 93.8,
      },
    },
  ]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filteredReports = filterType === 'all' ? reports : reports.filter((r) => r.type === filterType);

  const handleDownload = (report) => {
    console.log('Downloading report:', report.id);
    alert(`Report ${report.name} would be downloaded as PDF`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Compliance Reports
        </h1>
        <p className={`mt-2 text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate and review regulatory compliance reports
        </p>
      </div>

      {/* Filter & Generate */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Report Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
            >
              <option value="all">All Reports</option>
              <option value="daily">Daily Reports</option>
              <option value="weekly">Weekly Reports</option>
              <option value="monthly">Monthly Reports</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
              <FiBarChart3 className="w-4 h-4" />
              <span>Generate New Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className={`p-6 rounded-xl border transition-all hover:shadow-lg cursor-pointer ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-blue-600'
                : 'bg-white border-gray-200 hover:border-blue-400'
            }`}
            onClick={() => setSelectedReport(report)}
          >
            {/* Report Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  report.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                  report.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {report.name}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {report.period}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(report);
                }}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FiDownload className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Key Metrics */}
            <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Transactions
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.metrics.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Flagged
                  </p>
                  <p className={`text-2xl font-bold mt-1 text-red-600`}>
                    {report.metrics.flaggedTransactions}
                  </p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Avg Processing
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.metrics.averageProcessingTime}
                  </p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    SLA Compliance
                  </p>
                  <p className={`text-2xl font-bold mt-1 text-green-600`}>
                    {report.metrics.slaCompliance}
                  </p>
                </div>
              </div>
            </div>

            {/* RBI Compliance */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    RBI Compliance
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>NEFT</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>RTGS</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    AML Score
                  </p>
                  <p className={`text-3xl font-bold text-green-600`}>
                    {report.rbiCompliance.amlScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail View Modal */}
      {selectedReport && (
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedReport.name} - Detailed View
            </h2>
            <button
              onClick={() => setSelectedReport(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Close
            </button>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Approved</p>
              <p className={`text-3xl font-bold mt-2 text-green-600`}>{selectedReport.metrics.approvedCount}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Rejected</p>
              <p className={`text-3xl font-bold mt-2 text-red-600`}>{selectedReport.metrics.rejectedCount}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Total Transactions</p>
              <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReport.metrics.totalTransactions}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Flagged</p>
              <p className={`text-3xl font-bold mt-2 text-amber-600`}>{selectedReport.metrics.flaggedTransactions}</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex gap-3">
            <button className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
              <FiDownload className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              darkMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}>
              <FiDownload className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
