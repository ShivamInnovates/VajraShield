import React, { useState } from 'react';
import { FiFileText, FiSearch, FiDownload, FiFilter, FiCalendar, FiChevronDown, FiChevronRight, FiDatabase, FiLock } from 'react-icons/fi';

const auditLogs = [
  { id: 'AUD-0001', timestamp: '2026-04-16 19:23:15', type: 'transaction', action: 'TXN_APPROVED', user: 'system', txnId: 'TXN001', details: 'Lane 1 auto-approved — risk score 0.12', source: 'decision_engine' },
  { id: 'AUD-0002', timestamp: '2026-04-16 19:22:50', type: 'transaction', action: 'TXN_FLAGGED', user: 'system', txnId: 'TXN002', details: 'Auto-flagged — risk score 0.78, routed to Lane 3', source: 'filter_engine' },
  { id: 'AUD-0003', timestamp: '2026-04-16 19:20:00', type: 'review', action: 'REVIEW_SUBMITTED', user: 'shivaji', txnId: 'TXN003', details: 'Decision: APPROVE — Analyst verified identity', source: 'human_review' },
  { id: 'AUD-0004', timestamp: '2026-04-16 19:15:30', type: 'model', action: 'MODEL_UPDATE', user: 'system', txnId: null, details: 'River ML model v2.3.1 → v2.3.2 (canary)', source: 'river_updater' },
  { id: 'AUD-0005', timestamp: '2026-04-16 19:10:00', type: 'security', action: 'LOGIN_ATTEMPT', user: 'analyst2', txnId: null, details: 'MFA verified, session started from 10.0.0.55', source: 'auth_service' },
  { id: 'AUD-0006', timestamp: '2026-04-16 19:05:45', type: 'transaction', action: 'TXN_BLOCKED', user: 'system', txnId: 'TXN004', details: 'Blocked after human review — suspicious offshore transfer', source: 'human_review' },
  { id: 'AUD-0007', timestamp: '2026-04-16 18:55:00', type: 'config', action: 'CONFIG_CHANGED', user: 'admin', txnId: null, details: 'Lane 3 threshold changed from 0.7 to 0.65', source: 'admin_panel' },
  { id: 'AUD-0008', timestamp: '2026-04-16 18:45:00', type: 'graph', action: 'GRAPH_UPDATED', user: 'system', txnId: 'TXN005', details: 'New edge added: ACC_0001 → ACC_0092 (ring pattern detected)', source: 'neo4j_updater' },
  { id: 'AUD-0009', timestamp: '2026-04-16 18:30:00', type: 'compliance', action: 'REPORT_GENERATED', user: 'system', txnId: null, details: 'Monthly RBI PCI-DSS compliance report generated', source: 'rbi_reporter' },
  { id: 'AUD-0010', timestamp: '2026-04-16 18:00:00', type: 'security', action: 'IP_BLOCKED', user: 'system', txnId: null, details: 'IP 45.33.32.156 blocked after 5 failed login attempts', source: 'waf' },
];

const typeConfig = {
  transaction: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  review: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  model: { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  security: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  config: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  graph: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  compliance: { color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

export default function AuditLogPage({ darkMode }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = auditLogs.filter(log => {
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (search && !log.details.toLowerCase().includes(search.toLowerCase()) && !log.action.toLowerCase().includes(search.toLowerCase()) && !(log.txnId || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gray-500/20">
              <FiFileText className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Immutable Audit Log</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiLock className="w-3 h-3 inline mr-1" />
                PostgreSQL-backed • Tamper-proof • RBI/PCI-DSS Compliant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <FiDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <FiDownload className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:border-indigo-500`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'transaction', 'review', 'security', 'model', 'config', 'graph', 'compliance'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white'
                  : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filtered.map(log => {
          const tc = typeConfig[log.type] || typeConfig.transaction;
          return (
            <div
              key={log.id}
              className={`rounded-xl border transition-all ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <button
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {expanded === log.id ? (
                    <FiChevronDown className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <FiChevronRight className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                  <span className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'} w-20 flex-shrink-0`}>{log.id}</span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${tc.bg} ${tc.color} flex-shrink-0`}>{log.type}</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex-shrink-0`}>{log.action}</span>
                  <span className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.details}</span>
                </div>
                <span className={`text-xs flex-shrink-0 ml-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{log.timestamp}</span>
              </button>
              {expanded === log.id && (
                <div className={`px-4 pb-4 ml-8 space-y-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'} pt-3`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>User</p><p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{log.user}</p></div>
                    <div><p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Source</p><p className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.source}</p></div>
                    {log.txnId && <div><p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Transaction</p><p className={`text-sm font-mono ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{log.txnId}</p></div>}
                    <div><p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Timestamp</p><p className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.timestamp}</p></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
