import React, { useState, useEffect } from 'react';
import { FiBell, FiTrendingUp, FiAlertCircle, FiClock, FiCheckCircle, FiArrowRight, FiZap, FiShield, FiBook, FiPhone, FiTarget, FiActivity, FiLock, FiRadio, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { MdTrendingUp, MdAnalytics } from 'react-icons/md';

export default function Home({ darkMode }) {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock recent transactions
    const txns = [
      {
        id: 'TXN001',
        sender: 'ACC_0001_JOHN_SMITH',
        receiver: 'ACC_0002_MERCHANT_STORE',
        amount: 450000,
        risk_score: 0.78,
        status: 'pending',
        time: '2 min ago',
      },
      {
        id: 'TXN002',
        sender: 'ACC_0003_CORP_FINANCE',
        receiver: 'ACC_0004_VENDOR_CORP',
        amount: 2500000,
        risk_score: 0.65,
        status: 'pending',
        time: '15 min ago',
      },
      {
        id: 'TXN003',
        sender: 'ACC_0005_RETAIL_SHOP',
        receiver: 'ACC_0006_SUPPLIER',
        amount: 125000,
        risk_score: 0.35,
        status: 'approved',
        time: '45 min ago',
      },
      {
        id: 'TXN004',
        sender: 'ACC_0007_UNKNOWN',
        receiver: 'ACC_0008_OFFSHORE',
        amount: 5000000,
        risk_score: 0.92,
        status: 'escalated',
        time: '1 hour ago',
      },
    ];
    setRecentTransactions(txns);

    const data = {
      totalTransactions: 1524,
      flaggedCount: 47,
      pendingReview: 12,
      approvedToday: 156,
      rejectedToday: 8,
      avgProcessingTime: '4.2 min',
      modelAccuracy: '94.2%',
      slaCompliance: '98.5%',
      activeModules: 7,
      systemStatus: 'Online',
    };
    setMetrics(data);
    setIsLoading(false);
  };

  const getRiskBadgeColor = (score) => {
    if (score > 0.8) return { bg: darkMode ? 'bg-red-950/40' : 'bg-red-50', text: darkMode ? 'text-red-500' : 'text-red-700' };
    if (score > 0.6) return { bg: darkMode ? 'bg-amber-950/40' : 'bg-amber-50', text: darkMode ? 'text-amber-500' : 'text-amber-700' };
    if (score > 0.4) return { bg: darkMode ? 'bg-yellow-950/40' : 'bg-yellow-50', text: darkMode ? 'text-yellow-500' : 'text-yellow-700' };
    return { bg: darkMode ? 'bg-green-950/40' : 'bg-green-50', text: darkMode ? 'text-green-500' : 'text-green-700' };
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <FiClock className="w-4 h-4 text-amber-500" />;
    if (status === 'approved') return <FiCheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'escalated') return <FiAlertCircle className="w-4 h-4 text-red-500" />;
    return <FiCheckCircle className="w-4 h-4 text-gray-400" />;
  };

  if (!metrics) return <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`p-8 rounded-lg border-l-4 border-black ${
        darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-r border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-700'}`}>
              Welcome Back
            </p>
            <h1 className={`text-4xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Shivaji <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Analyst</span>
            </h1>
            <p className={`mt-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Manage and review transaction risk in real-time
            </p>
          </div>
          <div className={`px-6 py-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Status</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer transform ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-amber-600' : 'bg-white border border-gray-200 shadow hover:shadow-xl'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PENDING REVIEW</p>
              <div className="flex items-baseline space-x-2 mt-3">
                <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.pendingReview}</p>
                <span className="text-sm text-amber-600 font-semibold">Active</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <FiClock className={`w-7 h-7 ${darkMode ? 'text-amber-400 animate-pulse' : 'text-amber-600 animate-pulse'}`} />
            </div>
          </div>
          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>⚠️ Requires immediate attention</p>
          <div className={`mt-3 h-1 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className="h-full w-1/3 rounded-full bg-amber-500"></div>
          </div>
        </div>

        <div className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer transform ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-green-600' : 'bg-white border border-gray-200 shadow hover:shadow-xl'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>APPROVED TODAY</p>
              <div className="flex items-baseline space-x-2 mt-3">
                <p className={`text-4xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{metrics.approvedToday}</p>
                <span className="text-sm text-green-600 font-semibold">Clean</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <FiCheckCircle className={`w-7 h-7 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>✓ Low risk transactions</p>
          <div className={`mt-3 h-1 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className="h-full w-2/3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer transform ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-blue-600' : 'bg-white border border-gray-200 shadow hover:shadow-xl'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AVG PROCESSING</p>
              <div className="flex items-baseline space-x-2 mt-3">
                <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.avgProcessingTime}</p>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <MdTrendingUp className={`w-7 h-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>⚡ Per transaction</p>
          <div className={`mt-3 h-1 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className="h-full w-3/4 rounded-full bg-blue-500"></div>
          </div>
        </div>
      </div>

      {/* System Status & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-purple-600' : 'bg-blue-50 border border-blue-200 hover:border-blue-400'
        }`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <HiSparkles className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Active Modules</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.activeModules}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-blue-600' : 'bg-blue-50 border border-blue-200 hover:border-blue-400'
        }`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <MdAnalytics className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Accuracy</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.modelAccuracy}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-green-600' : 'bg-green-50 border border-green-200 hover:border-green-400'
        }`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
            <FiTarget className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>SLA Compliance</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.slaCompliance}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
          darkMode ? 'bg-gray-900 border border-gray-800 hover:border-green-600' : 'bg-green-50 border border-green-200 hover:border-green-400'
        }`}>
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
            <FiRadio className={`w-5 h-5 ${darkMode ? 'text-green-400 animate-pulse' : 'text-green-600 animate-pulse'}`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>System Status</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Online</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            <FiBell className="w-5 h-5 animate-bounce" />
            <span>Recent Activity</span>
          </h2>
          <a href="/queue" className={`flex items-center space-x-1 text-sm font-medium transition-all hover:gap-2 ${
            darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
          }`}>
            View All <FiArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((txn) => {
            const riskColor = getRiskBadgeColor(txn.risk_score);
            return (
              <div
                key={txn.id}
                className={`p-5 rounded-lg border flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:scale-102 cursor-pointer group ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-700'
                    : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <FiActivity className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold group-hover:text-blue-500 transition-colors ${darkMode ? 'text-white' : 'text-black'}`}>
                        {txn.id}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        💰 ₹{(txn.amount / 100000).toFixed(2)}L
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {txn.sender.split('_')[1]}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      ⏰ {txn.time}
                    </p>
                  </div>

                  <div className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${riskColor.bg} ${riskColor.text}`}>
                    {(txn.risk_score * 100).toFixed(0)}%
                  </div>

                  <div className="p-2 rounded-lg bg-gray-700/50">
                    {getStatusIcon(txn.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            <FiActivity className="w-5 h-5 text-blue-500" />
            <span>Today's Summary</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Processed</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>{metrics.totalTransactions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer">
              <span className={`text-sm font-medium flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiAlertCircle className="w-4 h-4 text-red-500" />
                <span>Flagged</span>
              </span>
              <span className={`font-bold text-red-600 text-lg`}>{metrics.flaggedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer">
              <span className={`text-sm font-medium flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                <span>Approved Today</span>
              </span>
              <span className={`font-bold text-green-600 text-lg`}>{metrics.approvedToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer">
              <span className={`text-sm font-medium flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiX className="w-4 h-4 text-orange-500" />
                <span>Rejected Today</span>
              </span>
              <span className={`font-bold text-orange-600 text-lg`}>{metrics.rejectedToday}</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow'}`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            <FiArrowRight className="w-5 h-5 text-green-500" />
            <span>Quick Actions</span>
          </h3>
          <div className="space-y-3">
            <a href="/queue" className={`block p-4 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-102 ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700 hover:border-blue-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200'
            }`}>
              <p className={`font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                <FiActivity className="w-4 h-4" />
                <span>Review Queue</span>
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-blue-700'}`}>📋 {metrics.pendingReview} pending transactions</p>
            </a>
            <a href="/dashboard" className={`block p-4 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-102 ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200'
            }`}>
              <p className={`font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                <MdAnalytics className="w-4 h-4" />
                <span>View Analytics</span>
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-purple-700'}`}>📊 Detailed trends and reports</p>
            </a>
          </div>
        </div>
      </div>

      {/* Why VajraShield Section */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
          WHY VAJRASHIELD?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-blue-50 border border-blue-100'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <FiZap className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Real-Time Processing
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              ML-powered risk scoring with 94.2% accuracy in milliseconds
            </p>
          </div>

          <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-green-50 border border-green-100'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              darkMode ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <FiShield className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Compliance Ready
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              RBI, NEFT, RTGS guidelines enforced with SLA management
            </p>
          </div>

          <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-amber-50 border border-amber-100'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              darkMode ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <FiAlertCircle className={`w-6 h-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Anomaly Detection
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Advanced pattern recognition & behavioral analysis
            </p>
          </div>

          <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-purple-50 border border-purple-100'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <FiTrendingUp className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Risk Analytics
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Comprehensive dashboards & trend analysis
            </p>
          </div>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className={`p-8 rounded-lg ${
        darkMode ? 'bg-gradient-to-br from-purple-950 to-purple-900 border border-purple-800' : 'bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <HiSparkles className={`w-6 h-6 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              <p className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                AI ASSISTANT
              </p>
            </div>
            <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
              MEET <span className={darkMode ? 'text-purple-300' : 'text-purple-600'}>JARSH</span>
            </h2>
            <p className={`text-lg ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              Jarvis Advanced Risk Security Helper — Your AI-powered transaction risk companion.
            </p>
          </div>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 ${
            darkMode ? 'bg-purple-800/50' : 'bg-white/50'
          }`}>
            <HiSparkles className={`w-12 h-12 ${darkMode ? 'text-purple-300' : 'text-purple-600'} animate-pulse`} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-purple-700/50' : 'bg-white/30'
                }`}>
                  <FiZap className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    Real-Time Analysis
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    Instant insights on transaction risk scores and fraud patterns
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-purple-700/50' : 'bg-white/30'
                }`}>
                  <FiShield className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    Risk Guidance
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    Recommended actions & remediation strategies for flagged transactions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-purple-700/50' : 'bg-white/30'
                }`}>
                  <FiBook className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    Compliance Reports
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    Auto-generated regulatory compliance documentation & audit trails
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-purple-700/50' : 'bg-white/30'
                }`}>
                  <FiPhone className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                    24/7 Support
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    Always available to answer risk management & compliance questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800/30' : 'bg-white/30'} border ${darkMode ? 'border-purple-700/50' : 'border-white/50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                ⚡ Quick Risk Assessment
              </h4>
              <p className={`text-sm ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                Ask JARSH to analyze suspicious transactions and provide risk scores
              </p>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800/30' : 'bg-white/30'} border ${darkMode ? 'border-purple-700/50' : 'border-white/50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                📊 Pattern Recognition
              </h4>
              <p className={`text-sm ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                Identify anomalies & suspicious behavior patterns automatically
              </p>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800/30' : 'bg-white/30'} border ${darkMode ? 'border-purple-700/50' : 'border-white/50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                ✓ Compliance Assurance
              </h4>
              <p className={`text-sm ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                Ensure all transactions meet RBI, NEFT & RTGS compliance standards
              </p>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border ${
          darkMode ? 'bg-purple-800/20 border-purple-700/50' : 'bg-white/20 border-white/50'
        }`}>
          <div>
            <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              Ready to enhance your transaction risk management?
            </p>
          </div>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            darkMode
              ? 'bg-purple-600 hover:bg-purple-500 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}>
            <span>Start Chat</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
