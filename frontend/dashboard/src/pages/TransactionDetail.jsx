import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { submitReview } from '../services/api';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiArrowUp, FiArrowLeft, FiArrowDown } from 'react-icons/fi';
import useStore from '../store/useStore';

export default function TransactionDetail({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const allEvents = useStore(state => [...state.liveEvents, ...state.reviewQueue]);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [decision, setDecision] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const signalMap = {
    'velocity_burst': 'Critical Transaction Velocity Detected (>10/hr)',
    'velocity': 'Elevated Transaction Velocity',
    'high_amount': 'Transaction Amount Significantly Above User Median',
    'amount_10x_baseline': 'Extreme Deviation from User Spending Baseline (10x)',
    'geo_extreme': 'Extreme Geographic Mismatch with Device / History',
    'new_location': 'First Transaction from this Geographic Region',
    'full_drain': 'Potential Account Emptying Pattern Detected',
    'new_account': 'Account is less than 30 days old',
    'risky_merchant': 'Merchant carries a high historical risk score',
    'blacklisted_ip': 'IP Address is known for fraudulent activity',
    'blacklisted_device': 'Device ID is linked to coordinated fraud',
    'blacklisted_recipient': 'Recipient account is on global fraud watchlist',
    'vpn_detected': 'Suspected VPN/Proxy usage for location masking',
  };

  useEffect(() => {
    setLoading(true);
    const found = allEvents.find(t => t.id === id || t.txn_id === id);
    if (found) {
        // Map signals to human readable evidence if not already done
        const evidence = found.signals ? found.signals.map(s => signalMap[s] || s) : (found.evidence || []);
        setTransaction({ ...found, evidence });
    }
    setLoading(false);
  }, [id, allEvents]);

  const resolveReview = useStore(state => state.resolveReview);

  const handleSubmit = async () => {
    if (!decision) return;
    setReviewing(true);
    try {
      await submitReview(id, { decision, notes: '' });
      resolveReview(id, decision);
      
      const pastTense = decision === 'reject' ? 'rejected' : decision === 'approve' ? 'approved' : 'escalated';
      setToast({ show: true, message: `Transaction successfully ${pastTense}`, type: 'success' });
      
      setTimeout(() => {
        navigate('/queue');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setToast({ show: true, message: 'Failed to process review', type: 'error' });
      setReviewing(false);
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const title = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-600';
  const label = darkMode ? 'text-gray-500' : 'text-gray-500';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!transaction) return (
    <div className={`text-center py-20 ${sub}`}>Transaction not found</div>
  );

  const riskColor = transaction.risk_score > 0.7
    ? darkMode ? 'text-red-400' : 'text-red-600'
    : darkMode ? 'text-amber-400' : 'text-amber-600';

  const riskBg = transaction.risk_score > 0.7
    ? darkMode ? 'bg-red-950 border-red-800' : 'bg-red-50 border-red-200'
    : darkMode ? 'bg-amber-950 border-amber-800' : 'bg-amber-50 border-amber-200';

  return (
    <div className="space-y-5 max-w-4xl relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-4 flex items-center space-x-3 ${
          toast.type === 'success' 
            ? (darkMode ? 'bg-green-900/90 text-green-100 border-green-700' : 'bg-green-100 text-green-800 border-green-300') 
            : (darkMode ? 'bg-red-900/90 text-red-100 border-red-700' : 'bg-red-100 text-red-800 border-red-300')
        }`}>
          {toast.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : <FiXCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Back */}
      <Link to="/queue" className={`inline-flex items-center space-x-2 text-sm font-medium transition-colors ${
        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
      }`}>
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Queue</span>
      </Link>

      {/* Header Card */}
      <div className={`p-5 rounded-xl border-l-4 border-l-indigo-500 ${card}`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {[
            { label: 'Transaction ID', value: transaction.id, color: title },
            { label: 'Amount', value: `₹${(transaction.amount / 100000).toFixed(2)}L`, color: title },
            { label: 'Risk Score', value: `${(transaction.risk_score * 100).toFixed(1)}%`, color: riskColor },
            { label: 'Status', value: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1), color: title },
            { label: 'Created', value: transaction.createdAt, color: sub, small: true },
          ].map((item, i) => (
            <div key={i}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${label}`}>{item.label}</p>
              <p className={`font-bold mt-1 ${item.small ? 'text-sm' : 'text-lg'} ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parties */}
        <div className={`p-5 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-4 ${title}`}>Transaction Parties</h3>
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${label}`}>From</p>
              <p className={`mt-1 font-medium text-sm ${title}`}>{transaction.sender}</p>
            </div>
            <div className="flex justify-center">
              <div className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FiArrowDown className={`w-4 h-4 ${sub}`} />
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${label}`}>To</p>
              <p className={`mt-1 font-medium text-sm ${title}`}>{transaction.receiver}</p>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className={`p-5 rounded-xl border ${riskBg}`}>
          <h3 className={`text-sm font-bold mb-4 ${riskColor}`}>Risk Factors Detected</h3>
          <ul className="space-y-2.5">
            {transaction.evidence?.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <FiAlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${riskColor}`} />
                <span className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Review Section */}
      {transaction.status === 'pending' && (
        <div className={`p-5 rounded-xl border ${card}`}>
          <h3 className={`text-sm font-bold mb-4 ${title}`}>Submit Your Review</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'approve', label: 'Approve', icon: FiCheckCircle, active: 'bg-green-600 text-white border-green-600', inactive: darkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:border-green-600 hover:text-green-400' : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-600' },
                { id: 'reject', label: 'Reject', icon: FiXCircle, active: 'bg-red-600 text-white border-red-600', inactive: darkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:border-red-600 hover:text-red-400' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600' },
                { id: 'escalate', label: 'Escalate', icon: FiArrowUp, active: 'bg-purple-600 text-white border-purple-600', inactive: darkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:border-purple-600 hover:text-purple-400' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:text-purple-600' },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setDecision(btn.id)}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                      decision === btn.id ? btn.active : btn.inactive
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!decision || reviewing}
              className={`w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                decision && !reviewing
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {reviewing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </span>
              ) : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
