import React, { useState, useEffect } from 'react';
import { FiZap, FiCheckCircle, FiAlertTriangle, FiXCircle, FiArrowRight, FiActivity, FiClock, FiDatabase } from 'react-icons/fi';

const laneData = {
  filter: { processed: 12847, avgTime: '3.2ms', signals: 9, redisNodes: 3, redisStatus: 'Healthy' },
  coldStart: { detected: 34, routedToLane2: 34, threshold: 10 },
  lane1: { count: 11243, label: 'Obviously Clean', pct: 87.5, avgTime: '<5ms' },
  lane2: { count: 1287, label: 'Deep Analysis', pct: 10.0, avgTime: '180ms', riverStatus: 'Active', neo4jStatus: 'Connected' },
  lane3: { count: 317, label: 'Obviously Suspicious', pct: 2.5, autoFlagged: 289, humanReview: 28, blocked: 12 },
  resolution: { approved: 11456, stepUp: 187, blocked: 12, slaCompliance: 98.5 },
};

function LaneCard({ lane, color, bgGradient, icon: Icon, children, darkMode }) {
  return (
    <div className={`p-5 rounded-xl border-2 transition-all hover:shadow-xl ${bgGradient}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lane.label}</h3>
      </div>
      <p className={`text-3xl font-bold ${color} mb-1`}>{lane.count.toLocaleString()}</p>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{lane.pct}% of traffic</p>
      {children}
    </div>
  );
}

export default function LanePipelineView({ darkMode }) {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulseIndex(p => (p + 1) % 5), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900 to-indigo-950/30 border-gray-800' : 'bg-gradient-to-r from-white to-indigo-50 border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <FiActivity className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lane Pipeline</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filter → Lane Selection → Resolution — Real-time transaction flow</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Processed</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{laneData.filter.processed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Pipeline Flow Visual */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Transaction Flow</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
          {[
            { label: 'Incoming', sub: 'Payment App', color: 'bg-blue-500' },
            { label: 'Layer 3.5 Filter', sub: `${laneData.filter.signals} signals, ${laneData.filter.avgTime}`, color: 'bg-cyan-500' },
            { label: 'Cold Start Check', sub: `<${laneData.coldStart.threshold} txns → Lane 2`, color: 'bg-amber-500' },
            { label: 'Lane Decision', sub: 'Threshold routing', color: 'bg-indigo-500' },
            { label: 'Resolution', sub: '400ms deadline', color: 'bg-green-500' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all duration-500 ${
                pulseIndex === i ? `${darkMode ? 'border-white/30 bg-gray-800' : 'border-gray-400 bg-gray-50'} shadow-lg scale-105` : darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${step.color} mb-2 ${pulseIndex === i ? 'animate-pulse' : ''}`} />
                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{step.label}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{step.sub}</p>
              </div>
              {i < 4 && <FiArrowRight className={`flex-shrink-0 w-4 h-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'} ${pulseIndex === i ? 'text-white animate-pulse' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filter & Cold Start */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-2 mb-3">
            <FiZap className="w-5 h-5 text-cyan-400" />
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Layer 3.5 Filter</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Signals</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{laneData.filter.signals}</p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg Time</p>
              <p className="text-xl font-bold text-cyan-400">{laneData.filter.avgTime}</p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Redis Nodes</p>
              <p className="text-xl font-bold text-green-400">{laneData.filter.redisNodes}/3</p>
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-2 mb-3">
            <FiDatabase className="w-5 h-5 text-amber-400" />
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cold Start Handler</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Detected</p>
              <p className="text-xl font-bold text-amber-400">{laneData.coldStart.detected}</p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Routed to Lane 2</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{laneData.coldStart.routedToLane2}</p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Accounts with &lt;{laneData.coldStart.threshold} transactions → automatic deep analysis</p>
        </div>
      </div>

      {/* Three Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LaneCard
          lane={laneData.lane1} color="text-green-400"
          bgGradient={darkMode ? 'bg-green-950/20 border-green-800/50' : 'bg-green-50 border-green-200'}
          icon={FiCheckCircle} darkMode={darkMode}
        >
          <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'}`}>
            <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>✓ Bypass ML • Sync response • {laneData.lane1.avgTime}</p>
          </div>
        </LaneCard>

        <LaneCard
          lane={laneData.lane2} color="text-amber-400"
          bgGradient={darkMode ? 'bg-amber-950/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'}
          icon={FiAlertTriangle} darkMode={darkMode}
        >
          <div className={`mt-3 space-y-1`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>River ML</span>
              <span className="text-xs font-bold text-green-400">{laneData.lane2.riverStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Neo4j Graph</span>
              <span className="text-xs font-bold text-green-400">{laneData.lane2.neo4jStatus}</span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Parallel execution • 250ms timeout</p>
          </div>
        </LaneCard>

        <LaneCard
          lane={laneData.lane3} color="text-red-400"
          bgGradient={darkMode ? 'bg-red-950/20 border-red-800/50' : 'bg-red-50 border-red-200'}
          icon={FiXCircle} darkMode={darkMode}
        >
          <div className={`mt-3 space-y-1`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Auto-Flagged</span>
              <span className="text-xs font-bold text-red-400">{laneData.lane3.autoFlagged}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Human Review</span>
              <span className="text-xs font-bold text-amber-400">{laneData.lane3.humanReview}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blocked</span>
              <span className="text-xs font-bold text-red-500">{laneData.lane3.blocked}</span>
            </div>
          </div>
        </LaneCard>
      </div>

      {/* Resolution Outputs */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Resolution Outputs • 400ms Deadline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-green-950/20 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
            <FiCheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
            <p className="text-2xl font-bold text-green-400">{laneData.resolution.approved.toLocaleString()}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sync &lt;400ms</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-cyan-950/20 border-cyan-800/30' : 'bg-cyan-50 border-cyan-200'}`}>
            <FiArrowRight className="w-6 h-6 text-cyan-400 mb-2" />
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Step-Up Verification</p>
            <p className="text-2xl font-bold text-cyan-400">{laneData.resolution.stepUp}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Loop back to engine</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-red-950/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
            <FiXCircle className="w-6 h-6 text-red-400 mb-2" />
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blocked</p>
            <p className="text-2xl font-bold text-red-400">{laneData.resolution.blocked}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Post human review</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-indigo-950/20 border-indigo-800/30' : 'bg-indigo-50 border-indigo-200'}`}>
            <FiClock className="w-6 h-6 text-indigo-400 mb-2" />
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SLA Compliance</p>
            <p className="text-2xl font-bold text-indigo-400">{laneData.resolution.slaCompliance}%</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>400ms target</p>
          </div>
        </div>
      </div>
    </div>
  );
}
