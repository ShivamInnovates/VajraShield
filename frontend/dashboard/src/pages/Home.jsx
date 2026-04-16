import React, { useState } from 'react';
import {
  FiBell, FiAlertCircle, FiClock, FiCheckCircle,
  FiArrowRight, FiZap, FiShield, FiBook, FiPhone, FiTarget,
  FiActivity, FiRadio, FiDollarSign
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { MdAnalytics, MdSpeed } from 'react-icons/md';

export default function Home({ darkMode }) {
  const [recentTransactions] = useState([
    { id: 'TXN001', sender: 'John Smith', receiver: 'Merchant Store', amount: 450000, risk_score: 0.78, status: 'pending', time: '2 min ago' },
    { id: 'TXN002', sender: 'Corporate Finance', receiver: 'Vendor Corp', amount: 2500000, risk_score: 0.65, status: 'pending', time: '15 min ago' },
    { id: 'TXN003', sender: 'Retail Shop', receiver: 'Supplier', amount: 125000, risk_score: 0.35, status: 'approved', time: '45 min ago' },
    { id: 'TXN004', sender: 'Unknown Account', receiver: 'Offshore Account', amount: 5000000, risk_score: 0.92, status: 'escalated', time: '1 hour ago' },
  ]);

  const metrics = {
    totalTransactions: 1524, flaggedCount: 47, pendingReview: 12,
    approvedToday: 156, rejectedToday: 8, avgProcessingTime: '4.2 min',
    modelAccuracy: '94.2%', slaCompliance: '98.5%', activeModules: 7,
  };

  const getRiskBadge = (score) => {
    if (score > 0.8) return { bg: darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-300', text: darkMode ? 'text-red-300' : 'text-red-700', dot: 'bg-red-500' };
    if (score > 0.6) return { bg: darkMode ? 'bg-amber-900 border-amber-700' : 'bg-amber-100 border-amber-300', text: darkMode ? 'text-amber-300' : 'text-amber-700', dot: 'bg-amber-500' };
    if (score > 0.4) return { bg: darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-100 border-yellow-300', text: darkMode ? 'text-yellow-300' : 'text-yellow-700', dot: 'bg-yellow-500' };
    return { bg: darkMode ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300', text: darkMode ? 'text-green-300' : 'text-green-700', dot: 'bg-green-500' };
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: darkMode ? 'bg-amber-900 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-300',
      approved: darkMode ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-100 text-green-700 border border-green-300',
      escalated: darkMode ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300',
    };
    return map[status] || map.pending;
  };

  const card = darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200';
  const cardHover = darkMode ? 'hover:bg-zinc-950 hover:border-zinc-700' : 'hover:shadow-md hover:border-gray-300';
  const title = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-300' : 'text-gray-600';
  const label = darkMode ? 'text-gray-500' : 'text-gray-500';
  const divider = darkMode ? 'border-zinc-800' : 'border-gray-100';

  return (
    <div className="space-y-4 w-full">
      {/* Welcome Banner */}
      <div className={`p-5 rounded-xl border ${
        darkMode
          ? 'bg-gradient-to-r from-zinc-900 to-black border-zinc-700'
          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              Welcome Back
            </p>
            <h1 className={`text-3xl sm:text-4xl font-bold mt-2 ${title}`}>Shivaji</h1>
            <p className={`mt-1 text-sm font-medium ${sub}`}>Transaction Risk Management System</p>
          </div>
          <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-xl border flex-shrink-0 ${
            darkMode ? 'bg-black border-zinc-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${label}`}>System Status</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`font-semibold text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Pending Review', value: metrics.pendingReview, sub: 'Transactions awaiting action', icon: FiClock, iconBg: darkMode ? 'bg-amber-900' : 'bg-amber-100', iconColor: darkMode ? 'text-amber-400' : 'text-amber-600', bar: 'bg-amber-500', barW: 'w-1/3', valColor: darkMode ? 'text-white' : 'text-gray-900' },
          { label: 'Approved Today', value: metrics.approvedToday, sub: 'Low-risk transactions', icon: FiCheckCircle, iconBg: darkMode ? 'bg-green-900' : 'bg-green-100', iconColor: darkMode ? 'text-green-400' : 'text-green-600', bar: 'bg-green-500', barW: 'w-2/3', valColor: darkMode ? 'text-green-400' : 'text-green-600' },
          { label: 'Avg Processing', value: metrics.avgProcessingTime, sub: 'Per transaction', icon: MdSpeed, iconBg: darkMode ? 'bg-orange-900' : 'bg-orange-100', iconColor: darkMode ? 'text-orange-400' : 'text-orange-600', bar: 'bg-orange-500', barW: 'w-3/4', valColor: darkMode ? 'text-white' : 'text-gray-900' },
        ].map((m, i) => (
          <div key={i} className={`p-5 rounded-xl border ${card} ${cardHover} transition-all`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-bold uppercase tracking-wider ${label}`}>{m.label}</p>
                <p className={`text-3xl font-bold mt-2 ${m.valColor}`}>{m.value}</p>
                <p className={`text-xs mt-2 ${sub}`}>{m.sub}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${m.iconBg}`}>
                <m.icon className={`w-5 h-5 ${m.iconColor}`} />
              </div>
            </div>
            <div className={`mt-4 h-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
              <div className={`h-full rounded-full ${m.bar} ${m.barW}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Active Modules', value: metrics.activeModules, icon: HiSparkles, iconBg: darkMode ? 'bg-amber-900' : 'bg-amber-100', iconColor: darkMode ? 'text-amber-400' : 'text-amber-600' },
          { label: 'Model Accuracy', value: metrics.modelAccuracy, icon: MdAnalytics, iconBg: darkMode ? 'bg-zinc-900' : 'bg-gray-100', iconColor: darkMode ? 'text-gray-300' : 'text-gray-700' },
          { label: 'SLA Compliance', value: metrics.slaCompliance, icon: FiTarget, iconBg: darkMode ? 'bg-green-900' : 'bg-green-100', iconColor: darkMode ? 'text-green-400' : 'text-green-600' },
          { label: 'System Status', value: 'Online', icon: FiRadio, iconBg: darkMode ? 'bg-green-900' : 'bg-green-100', iconColor: darkMode ? 'text-green-400 animate-pulse' : 'text-green-600 animate-pulse', valColor: darkMode ? 'text-green-400' : 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${card} ${cardHover} transition-all`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${s.iconBg}`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold ${label}`}>{s.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.valColor || title}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className={`rounded-xl border ${card}`}>
        <div className={`px-5 py-3 border-b ${divider} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FiBell className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
            <h2 className={`text-base font-bold ${title}`}>Recent Transactions</h2>
          </div>
          <a href="/queue" className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
            darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
          }`}>
            <span>View All</span>
            <FiArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="p-4 space-y-2">
          {recentTransactions.map((txn) => {
            const risk = getRiskBadge(txn.risk_score);
            return (
              <div key={txn.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer gap-3 ${
                darkMode ? 'border-zinc-800 hover:bg-zinc-950' : 'border-gray-100 hover:bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <FiDollarSign className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-xs truncate ${title}`}>{txn.id}</p>
                    <p className={`text-xs truncate ${sub}`}>{txn.sender} → {txn.receiver}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className={`font-semibold text-xs ${title}`}>₹{(txn.amount / 100000).toFixed(2)}L</p>
                    <p className={`text-xs ${label}`}>{txn.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center space-x-1 flex-shrink-0 ${risk.bg} ${risk.text}`}>
                    <div className={`w-1 h-1 rounded-full ${risk.dot}`}></div>
                    <span>{(txn.risk_score * 100).toFixed(0)}%</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${getStatusBadge(txn.status)}`}>
                    {txn.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Summary */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`px-5 py-3 border-b ${divider} flex items-center space-x-3`}>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
              <FiActivity className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </div>
            <h3 className={`font-bold text-sm ${title}`}>Summary</h3>
          </div>
          <div className="p-3 space-y-1">
            {[
              { label: 'Total Processed', value: metrics.totalTransactions, color: title },
              { label: 'Flagged', value: metrics.flaggedCount, color: darkMode ? 'text-red-400' : 'text-red-600', icon: FiAlertCircle },
              { label: 'Rejected Today', value: metrics.rejectedToday, color: darkMode ? 'text-orange-400' : 'text-orange-600' },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${darkMode ? 'hover:bg-zinc-950' : 'hover:bg-gray-50'} transition-colors`}>
                <span className={`text-sm font-medium flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {row.icon && <row.icon className="w-3.5 h-3.5" />}
                  <span>{row.label}</span>
                </span>
                <span className={`font-bold text-base ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`px-5 py-3 border-b ${divider} flex items-center space-x-3`}>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
              <FiArrowRight className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`font-bold text-sm ${title}`}>Quick Actions</h3>
          </div>
          <div className="p-3 space-y-2">
            <a href="/queue" className={`block p-3 rounded-lg border transition-all ${
              darkMode ? 'bg-emerald-950 border-emerald-800 hover:bg-emerald-900' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}>
              <p className={`font-semibold text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>Review Queue</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{metrics.pendingReview} transactions pending</p>
            </a>
            <a href="/dashboard" className={`block p-3 rounded-lg border transition-all ${
              darkMode ? 'bg-orange-950 border-orange-800 hover:bg-orange-900' : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
            }`}>
              <p className={`font-semibold text-sm ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>View Analytics</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Detailed metrics and trends</p>
            </a>
          </div>
        </div>
      </div>

      {/* JARSH Banner */}
      <div className={`p-4 rounded-xl border ${
        darkMode
          ? 'bg-gradient-to-br from-zinc-900 to-black border-zinc-700'
          : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <HiSparkles className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`} />
              <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>AI Assistant</p>
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Meet JARSH</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your intelligent risk management companion</p>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <HiSparkles className={`w-7 h-7 ${darkMode ? 'text-amber-300' : 'text-amber-600'} animate-pulse`} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { icon: FiZap, label: 'Real-Time Analysis', desc: 'Instant risk scoring' },
            { icon: FiShield, label: 'Risk Guidance', desc: 'Mitigation strategies' },
            { icon: FiBook, label: 'Compliance Support', desc: 'Regulatory docs' },
            { icon: FiPhone, label: '24/7 Support', desc: 'Always available' },
          ].map((f, i) => (
            <div key={i} className={`p-2.5 rounded-lg border ${
              darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}>
              <f.icon className={`w-4 h-4 mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`} />
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{f.label}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            Ready to enhance your transaction review process?
          </p>
          <button className={`flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black hover:bg-gray-900'
          }`}>
            <span>Start Chat</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
