import React from 'react';
import { Link } from 'react-router-dom';

export default function TransactionCard({ transaction, onReload, darkMode }) {
  const getRiskColor = (score) => {
    if (score > 0.8) return { bg: darkMode ? 'bg-red-950/30' : 'bg-red-50', text: darkMode ? 'text-red-500' : 'text-red-700', border: darkMode ? 'border-red-900' : 'border-red-200' };
    if (score > 0.6) return { bg: darkMode ? 'bg-amber-950/30' : 'bg-amber-50', text: darkMode ? 'text-amber-500' : 'text-amber-700', border: darkMode ? 'border-amber-900' : 'border-amber-200' };
    return { bg: darkMode ? 'bg-yellow-950/30' : 'bg-yellow-50', text: darkMode ? 'text-yellow-500' : 'text-yellow-700', border: darkMode ? 'border-yellow-900' : 'border-yellow-200' };
  };

  const risk = getRiskColor(transaction.risk_score);
  const statusColors = {
    pending: { bg: darkMode ? 'bg-amber-950/30' : 'bg-amber-100', text: darkMode ? 'text-amber-500' : 'text-amber-800' },
    reviewed: { bg: darkMode ? 'bg-green-950/30' : 'bg-green-100', text: darkMode ? 'text-green-500' : 'text-green-800' },
    escalated: { bg: darkMode ? 'bg-red-950/30' : 'bg-red-100', text: darkMode ? 'text-red-500' : 'text-red-800' },
  };

  const status = statusColors[transaction.status] || statusColors.pending;

  return (
    <Link to={`/transaction/${transaction.id}`}>
      <div className={`p-6 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
        darkMode
          ? `${risk.bg} border-l-4 ${risk.border} bg-gray-900`
          : `${risk.bg} border-l-4 ${risk.border}`
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Transaction ID
            </p>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
              {transaction.id}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Risk Score
            </p>
            <p className={`text-3xl font-bold ${risk.text}`}>
              {(transaction.risk_score * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 pb-4" style={{ borderBottom: darkMode ? '1px solid #2a2a2a' : '1px solid #e5e5e5' }}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              From
            </p>
            <p className={`font-medium mt-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>
              {transaction.sender}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              To
            </p>
            <p className={`font-medium mt-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>
              {transaction.receiver}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
              ₹{(transaction.amount / 100000).toFixed(2)}L
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {transaction.createdAt}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
            {transaction.status.toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}
