import React, { useState, useEffect } from 'react';
import TransactionCard from '../components/TransactionCard';
import { fetchFlaggedTransactions } from '../services/api';
import { FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function ReviewQueue({ darkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockData = [
        {
          id: 'TXN001',
          sender: 'ACC_0001_JOHN_SMITH',
          receiver: 'ACC_0002_MERCHANT_STORE',
          amount: 450000,
          risk_score: 0.78,
          status: 'pending',
          createdAt: '2026-04-16 14:23:00',
        },
        {
          id: 'TXN002',
          sender: 'ACC_0003_CORP_FINANCE',
          receiver: 'ACC_0004_VENDOR_CORP',
          amount: 2500000,
          risk_score: 0.65,
          status: 'pending',
          createdAt: '2026-04-16 15:45:00',
        },
      ];
      setTransactions(mockData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  const filterButtons = [
    { label: 'Pending Review', value: 'pending', icon: FiClock },
    { label: 'Reviewed', value: 'reviewed', icon: FiCheckCircle },
    { label: 'Escalated', value: 'escalated', icon: FiTrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Transaction Review Queue
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          30-minute SLA for each flagged transaction
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3 border-b" style={{ borderColor: darkMode ? '#2a2a2a' : '#e5e5e5' }}>
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                filter === btn.value
                  ? darkMode ? 'border-gray-400 text-gray-300' : 'border-black text-black'
                  : darkMode
                    ? 'border-transparent text-gray-500 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{btn.label}</span>
            </button>
          )
        })}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-lg">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'} rounded-lg`}>
          <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No transactions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {transactions.map((txn) => (
            <TransactionCard key={txn.id} transaction={txn} onReload={loadTransactions} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}
