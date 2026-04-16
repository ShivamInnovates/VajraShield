import React from 'react';
import { Link } from 'react-router-dom';

const getRiskColors = (score, darkMode) => {
  if (score > 0.8) return {
    border: 'border-l-red-500',
    badge: darkMode ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300',
    score: darkMode ? 'text-red-400' : 'text-red-600',
  };
  if (score > 0.6) return {
    border: 'border-l-amber-500',
    badge: darkMode ? 'bg-amber-900 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-300',
    score: darkMode ? 'text-amber-400' : 'text-amber-600',
  };
  return {
    border: 'border-l-yellow-500',
    badge: darkMode ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    score: darkMode ? 'text-yellow-400' : 'text-yellow-600',
  };
};

const statusMap = {
  pending: {
    dark: 'bg-amber-900 text-amber-300 border border-amber-700',
    light: 'bg-amber-100 text-amber-700 border border-amber-300',
  },
  reviewed: {
    dark: 'bg-green-900 text-green-300 border border-green-700',
    light: 'bg-green-100 text-green-700 border border-green-300',
  },
  escalated: {
    dark: 'bg-red-900 text-red-300 border border-red-700',
    light: 'bg-red-100 text-red-700 border border-red-300',
  },
  approved: {
    dark: 'bg-green-900 text-green-300 border border-green-700',
    light: 'bg-green-100 text-green-700 border border-green-300',
  },
};

export default function TransactionCard({ transaction, onReload, darkMode }) {
  const risk = getRiskColors(transaction.risk_score, darkMode);
  const mode = darkMode ? 'dark' : 'light';
  const statusStyle = (statusMap[transaction.status] || statusMap.pending)[mode];

  const cardBg = darkMode
    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md';

  const dividerColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  const labelColor = darkMode ? 'text-gray-500' : 'text-gray-500';
  const valueColor = darkMode ? 'text-white' : 'text-gray-900';
  const subColor = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <Link to={`/transaction/${transaction.id}`}>
      <div className={`rounded-xl border border-l-4 ${risk.border} ${cardBg} transition-all cursor-pointer overflow-hidden h-full`}>
        <div className="p-4 flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>ID</p>
              <p className={`text-sm font-bold mt-0.5 ${valueColor} truncate`}>{transaction.id}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>Risk</p>
              <p className={`text-lg font-bold mt-0.5 ${risk.score}`}>
                {(transaction.risk_score * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* From / To */}
          <div className={`grid grid-cols-2 gap-2 py-3 border-t border-b ${dividerColor} mb-3 flex-1`}>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>From</p>
              <p className={`text-xs font-medium mt-0.5 truncate ${subColor}`}>{transaction.sender}</p>
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>To</p>
              <p className={`text-xs font-medium mt-0.5 truncate ${subColor}`}>{transaction.receiver}</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-lg font-bold ${valueColor}`}>
                ₹{(transaction.amount / 100000).toFixed(2)}L
              </p>
              <p className={`text-xs mt-0.5 ${labelColor} truncate`}>{transaction.createdAt}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle} whitespace-nowrap`}>
              {transaction.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
