import React, { useState } from 'react';
import TransactionCard from '../components/TransactionCard';
import { FiClock, FiCheckCircle, FiTrendingUp, FiSearch } from 'react-icons/fi';
import useStore from '../store/useStore';

export default function ReviewQueue({ darkMode }) {
  const allQueueTransactions = useStore(state => state.reviewQueue);
  const metrics = useStore(state => state.metrics);
  const [filter, setFilter] = useState('pending');

  // Filter the queue transactions based on the selected tab
  const transactions = allQueueTransactions.filter(txn => {
    if (filter === 'pending') return txn.status === 'pending';
    if (filter === 'reviewed') return txn.status === 'approved' || txn.status === 'rejected';
    if (filter === 'escalated') return txn.unified_score > 0.8;
    return true;
  });

  const filterButtons = [
    { label: 'Pending Review', value: 'pending', icon: FiClock },
    { label: 'Reviewed', value: 'reviewed', icon: FiCheckCircle },
    { label: 'Escalated', value: 'escalated', icon: FiTrendingUp },
  ];

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const title = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className={`p-5 rounded-xl border ${card}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${title}`}>Transaction Review Queue</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>30-minute SLA for each flagged transaction</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <FiSearch className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search transactions..."
              className={`bg-transparent text-sm outline-none w-40 ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl border ${card}`}>
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = filter === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: metrics.pendingReview || 0, color: darkMode ? 'text-amber-400' : 'text-amber-600', bg: darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200' },
          { label: 'Reviewed Today', value: (metrics.resolution.blocked || 0) + (metrics.resolution.approved || 0), color: darkMode ? 'text-green-400' : 'text-green-600', bg: darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200' },
          { label: 'Escalated', value: metrics.laneStats.lane3.count || 0, color: darkMode ? 'text-red-400' : 'text-red-600', bg: darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${s.bg}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${card}`}>
          <FiCheckCircle className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`font-medium ${title}`}>No transactions found</p>
          <p className={`text-sm mt-1 ${sub}`}>All caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
          {transactions.map((txn) => (
            <TransactionCard key={txn.id} transaction={txn} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}
