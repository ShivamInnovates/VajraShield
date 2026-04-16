import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTransactionDetail, submitReview } from '../services/api';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function TransactionDetail({ darkMode }) {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const data = {
        id: id,
        sender: 'ACC_0001_JOHN_SMITH',
        receiver: 'ACC_0002_MERCHANT_STORE',
        amount: 450000,
        risk_score: 0.78,
        status: 'pending',
        evidence: [
          'Transaction amount exceeds user average by 300%',
          'New recipient account (created 2 days ago)',
          'High transaction velocity from this account',
          'Recipient account shows suspicious patterns',
          'Geographic mismatch with user location',
        ],
        createdAt: '2026-04-16 14:23:00',
      };
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!decision) return;
    setReviewing(true);
    try {
      await submitReview(id, { decision, notes: '' });
      alert('Review submitted successfully');
      loadTransaction();
      setDecision(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
    setReviewing(false);
  };

  if (loading) return <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>;
  if (!transaction) return <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transaction not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className={`p-6 rounded-lg border-l-4 border-black ${
        darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-700'}`}>
              Transaction ID
            </p>
            <p className={`text-lg font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transaction.id}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
              Amount
            </p>
            <p className={`text-lg font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{(transaction.amount / 100000).toFixed(2)}L
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
              Risk Score
            </p>
            <p className={`text-lg font-bold mt-2 ${transaction.risk_score > 0.7 ? 'text-red-600' : 'text-orange-600'}`}>
              {(transaction.risk_score * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
              Status
            </p>
            <p className={`text-lg font-bold mt-2 capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transaction.status}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
              Created
            </p>
            <p className={`text-sm font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transaction.createdAt}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From/To */}
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Transaction Parties
          </h3>
          <div className="space-y-4">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                From
              </p>
              <p className={`mt-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {transaction.sender}
              </p>
            </div>
            <div className="flex justify-center py-2">
              <FiArrowDown className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                To
              </p>
              <p className={`mt-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {transaction.receiver}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Evidence */}
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Risk Factors
          </h3>
          <ul className="space-y-3">
            {transaction.evidence?.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <div className={`mt-1 ${transaction.risk_score > 0.7 ? 'text-red-600' : 'text-amber-600'}`}>
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Review Section */}
      {transaction.status === 'pending' && (
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
            Your Review
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'approve', label: 'Approve', icon: FiCheckCircle, color: 'green' },
                { id: 'reject', label: 'Reject', icon: FiXCircle, color: 'red' },
                { id: 'escalate', label: 'Escalate', icon: FiArrowUp, color: 'purple' },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setDecision(btn.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                      decision === btn.id
                        ? `bg-${btn.color}-600 text-white shadow-lg`
                        : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{btn.label}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!decision || reviewing}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                decision && !reviewing
                  ? 'bg-black hover:bg-gray-900 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {reviewing ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
