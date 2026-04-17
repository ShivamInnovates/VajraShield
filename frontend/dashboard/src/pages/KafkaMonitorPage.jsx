import React, { useState } from 'react';
import { FiServer, FiAlertTriangle, FiCheckCircle, FiActivity, FiRefreshCw, FiInbox, FiDatabase } from 'react-icons/fi';

const kafkaTopics = [
  { name: 'txn-events', partitions: 12, lag: 23, rate: '1.2k/s', status: 'healthy', consumers: 3 },
  { name: 'model-updates', partitions: 3, lag: 0, rate: '45/s', status: 'healthy', consumers: 2 },
  { name: 'graph-updates', partitions: 6, lag: 5, rate: '320/s', status: 'healthy', consumers: 2 },
  { name: 'audit-log', partitions: 6, lag: 0, rate: '890/s', status: 'healthy', consumers: 1, note: 'Immutable' },
  { name: 'dashboard-ws', partitions: 3, lag: 1, rate: '67/s', status: 'healthy', consumers: 1, note: 'JWT-gated' },
];

const dlqMessages = [
  { id: 'DLQ-001', topic: 'txn-events', error: 'Schema validation failed', retries: 3, time: '5 min ago', payload: '{"txn_id":"TXN_9842"}' },
  { id: 'DLQ-002', topic: 'graph-updates', error: 'Neo4j connection timeout', retries: 2, time: '12 min ago', payload: '{"node":"ACC_0092"}' },
  { id: 'DLQ-003', topic: 'model-updates', error: 'River model version mismatch', retries: 1, time: '1 hr ago', payload: '{"model_v":"2.3.1"}' },
];

const consumers = [
  { group: 'postgresql-sink', topics: ['txn-events', 'audit-log'], status: 'running', processed: 284521, errors: 2 },
  { group: 'supabase-sync', topics: ['txn-events'], status: 'running', processed: 142310, errors: 0 },
  { group: 'river-updater', topics: ['model-updates'], status: 'running', processed: 8945, errors: 1 },
  { group: 'neo4j-updater', topics: ['graph-updates'], status: 'running', processed: 67231, errors: 0 },
  { group: 'rbi-reporter', topics: ['audit-log'], status: 'running', processed: 34521, errors: 0 },
  { group: 'dashboard-ws', topics: ['dashboard-ws'], status: 'running', processed: 12456, errors: 0 },
];

export default function KafkaMonitorPage({ darkMode }) {
  const [activeTab, setActiveTab] = useState('topics');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900 to-indigo-950/30 border-gray-800' : 'bg-gradient-to-r from-white to-indigo-50 border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <FiServer className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kafka Event Bus</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Topics • Consumers • Dead Letter Queue — Fire-and-forget replaced with durable messaging</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>3 Brokers Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Topics', value: '5', color: 'text-indigo-400' },
          { label: 'Consumer Groups', value: '6', color: 'text-cyan-400' },
          { label: 'Total Lag', value: '29', color: 'text-amber-400' },
          { label: 'DLQ Depth', value: dlqMessages.length.toString(), color: dlqMessages.length > 5 ? 'text-red-400' : 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100'}`}>
        {[
          { id: 'topics', label: 'Topics', icon: FiActivity },
          { id: 'consumers', label: 'Consumer Groups', icon: FiDatabase },
          { id: 'dlq', label: 'Dead Letter Queue', icon: FiInbox },
        ].map(tab => {
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
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'dlq' && dlqMessages.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{dlqMessages.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                {['Topic', 'Partitions', 'Lag', 'Rate', 'Consumers', 'Status', 'Notes'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
              {kafkaTopics.map(topic => (
                <tr key={topic.name} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 font-mono text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{topic.name}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{topic.partitions}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${topic.lag > 10 ? 'text-red-400' : topic.lag > 0 ? 'text-amber-400' : 'text-green-400'}`}>{topic.lag}</span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{topic.rate}</td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{topic.consumers}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center space-x-1.5 text-xs font-semibold text-green-400">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Healthy</span>
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{topic.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Consumers Tab */}
      {activeTab === 'consumers' && (
        <div className="space-y-3">
          {consumers.map((c, i) => (
            <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className={`font-mono font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.group}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Topics: {c.topics.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Processed</p>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.processed.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Errors</p>
                    <p className={`text-sm font-bold ${c.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>{c.errors}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DLQ Tab */}
      {activeTab === 'dlq' && (
        <div className="space-y-3">
          {dlqMessages.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <FiCheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>DLQ is empty</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>All messages processed successfully</p>
            </div>
          ) : (
            dlqMessages.map(msg => (
              <div key={msg.id} className={`p-4 rounded-xl border-l-4 border-l-red-500 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{msg.error}</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Topic: <span className="font-mono">{msg.topic}</span> • Retries: {msg.retries} • {msg.time}
                      </p>
                      <code className={`text-xs mt-2 block p-2 rounded ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{msg.payload}</code>
                    </div>
                  </div>
                  <button className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <FiRefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
