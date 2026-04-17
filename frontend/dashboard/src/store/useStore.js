import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Initial metric shape ─────────────────────────────────────────────────────
const initialMetrics = {
  totalTransactions: 0,
  flaggedCount:      0,
  pendingReview:     0,
  approvedToday:     0,
  rejectedToday:     0,
  reviewedToday:     0,
  totalFraudVolume:  0,
  accuracy:          94.5,
  modelAccuracy:     '94.5%',
  activeModules:     8,
  slaCompliance:     100.0,
  avgProcessingTime: '0ms',
  laneStats: {
    lane1: { count: 0, pct: 0 },
    lane2: { count: 0, pct: 0 },
    lane3: { count: 0, pct: 0 },
  },
  riskDistribution: [
    { risk: 'Low',      count: 0, percentage: 0 },
    { risk: 'High',     count: 0, percentage: 0 },
    { risk: 'Critical', count: 0, percentage: 0 },
  ],
  resolution: { approved: 0, stepUp: 0, blocked: 0 },
  performanceMetrics: {
    'Avg Latency':    '0ms',
    'Throughput':     '0 tps',
    'Model Accuracy': '94.5%',
    'False Positives':'0.0%',
  },
};

// ─── Rolling throughput tracker (in-memory, never persisted) ─────────────────
let txnTimestamps = [];
function calculateThroughput() {
  const now = Date.now();
  txnTimestamps = txnTimestamps.filter(t => now - t < 60000); // keep last 60s
  txnTimestamps.push(now);
  return (txnTimestamps.length / 60).toFixed(2);
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      liveEvents:  [],
      reviewQueue: [],
      metrics:     initialMetrics,
      isConnected: false,
      ws:          null, // NOT in partialize — serialized WebSocket is a dead object

      // ── WebSocket ───────────────────────────────────────────────────────────
      connectWebSocket: (token) => {
        const existing = get().ws;

        // Only guard against a genuinely live socket
        if (existing && existing.readyState === WebSocket.OPEN)       return;
        if (existing && existing.readyState === WebSocket.CONNECTING)  return;

        // Tear down any stale socket (readyState CLOSED or plain persisted object)
        if (existing) {
          try { existing.close(); } catch (_) {}
          set({ ws: null, isConnected: false });
        }

        const hostname = window.location.hostname || 'localhost';
        const wsUrl    = `ws://${hostname}:8001/ws/dashboard?token=${token}`;
        console.log('[WS] Connecting to', wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log('[WS] ✓ Connected');
          set({ isConnected: true, ws: socket });
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'transaction') {
              get().processTransaction(msg.data);
            }
          } catch (err) {
            console.error('[WS] parse error:', err);
          }
        };

        socket.onerror = (e) => console.error('[WS] error:', e);

        socket.onclose = (e) => {
          console.log(`[WS] ✗ Disconnected (code=${e.code})`);
          set({ isConnected: false, ws: null });
          setTimeout(() => {
            const t = localStorage.getItem('token') || 'dev-token';
            get().connectWebSocket(t);
          }, 3000);
        };

        // Store immediately so CONNECTING guard fires on rapid double-calls
        set({ ws: socket });
      },

      disconnectWebSocket: () => {
        const { ws } = get();
        if (ws) { ws.close(); set({ ws: null, isConnected: false }); }
      },

      resetMetrics: () => {
        txnTimestamps = [];
        set({ metrics: initialMetrics, liveEvents: [], reviewQueue: [] });
      },

      resolveReview: (txnId, decision) => {
        set((state) => {
          // Find and update the event in live events history if present
          const updatedEvents = state.liveEvents.map(evt => 
            (evt.id === txnId || evt.txn_id === txnId) 
              ? { ...evt, status: decision === 'reject' ? 'rejected' : decision === 'approve' ? 'approved' : 'escalated', decision: decision.toUpperCase() } 
              : evt
          );
          
          // Remove from review queue and mark it processed if we want to keep it locally without deleting,
          // but removing from review queue is the standard way to clear the queue once handled.
          // Wait, 'reviewQueue' should maybe KEEP the item but update its status so the filter can show it under 'Reviewed'?
          // Yes! ReviewQueue.jsx has a 'reviewed' filter tab looking for 'approved' or 'rejected'.
          const updatedQueue = state.reviewQueue.map(evt => 
            (evt.id === txnId || evt.txn_id === txnId) 
              ? { ...evt, status: decision === 'reject' ? 'rejected' : decision === 'approve' ? 'approved' : 'escalated', decision: decision.toUpperCase() } 
              : evt
          );

          // Update metrics (just decrement pending)
          const newMetrics = { ...state.metrics };
          newMetrics.pendingReview = Math.max(0, newMetrics.pendingReview - 1);
          if (decision === 'approve') {
            newMetrics.resolution.approved += 1;
            newMetrics.approvedToday += 1;
          }
          if (decision === 'reject') {
            newMetrics.resolution.blocked += 1;
            newMetrics.rejectedToday += 1;
          }
          newMetrics.reviewedToday += 1;

          return { liveEvents: updatedEvents, reviewQueue: updatedQueue, metrics: newMetrics };
        });
      },

      // ── Process one transaction from the WebSocket ──────────────────────────
      processTransaction: (txn) => {
        set((state) => {
          const decision  = (txn.decision || 'PENDING').toUpperCase();
          const isFlagged = decision === 'BLOCK' || decision === 'REJECTED_COORDINATED_FRAUD';
          const riskLevel = txn.unified_score > 0.65 ? 'Critical'
                          : txn.unified_score > 0.30 ? 'High' : 'Low';

          // Lane stats
          const laneKey = txn.lane === 1 ? 'lane1' : txn.lane === 2 ? 'lane2' : 'lane3';
          const newLaneStats = {
            ...state.metrics.laneStats,
            [laneKey]: {
              ...state.metrics.laneStats[laneKey],
              count: (state.metrics.laneStats[laneKey].count || 0) + 1,
            },
          };

          // Risk distribution
          const newRiskDist = state.metrics.riskDistribution.map(item =>
            item.risk === riskLevel ? { ...item, count: (item.count || 0) + 1 } : item
          );

          // Resolution
          const newResolution = {
            ...state.metrics.resolution,
            approved: decision === 'APPROVE'
              ? (state.metrics.resolution.approved || 0) + 1
              : state.metrics.resolution.approved,
            blocked: isFlagged
              ? (state.metrics.resolution.blocked || 0) + 1
              : state.metrics.resolution.blocked,
          };

          const newMetrics = {
            ...state.metrics,
            totalTransactions: (state.metrics.totalTransactions || 0) + 1,
            flaggedCount:      isFlagged ? (state.metrics.flaggedCount  || 0) + 1 : state.metrics.flaggedCount,
            pendingReview:     isFlagged ? (state.metrics.pendingReview || 0) + 1 : state.metrics.pendingReview,
            avgProcessingTime: `${Math.round(txn.actual_latency_ms || 100)}ms`,
            totalFraudVolume:  isFlagged
              ? (state.metrics.totalFraudVolume || 0) + (txn.amount || 0)
              : state.metrics.totalFraudVolume,
            laneStats:         newLaneStats,
            riskDistribution:  newRiskDist,
            resolution:        newResolution,
            performanceMetrics: {
              ...state.metrics.performanceMetrics,
              'Avg Latency': `${Math.round(txn.actual_latency_ms || 100)}ms`,
              'Throughput':  `${calculateThroughput()} tps`,
            },
          };

          const mappedTxn = {
            id:         txn.txn_id       || `TXN${Date.now()}`,
            sender:     txn.user_id      || 'Unknown',
            receiver:   (txn.recipient_id && txn.recipient_id !== 'UNKNOWN') ? txn.recipient_id : (txn.merchant || 'Merchant'),
            amount:     txn.amount       || 0,
            risk_score: txn.unified_score || 0,
            status:    isFlagged ? 'pending' : (decision === 'APPROVE' ? 'approved' : 'pending'),
            createdAt: new Date().toLocaleString(),
            _hour:     new Date().getHours(), // Dashboard uses this for chart bucketing
            evidence:  txn.signals || [],
            signals:   txn.signals || [],
            ...txn,
          };

          return {
            liveEvents:  [mappedTxn, ...state.liveEvents.slice(0, 199)],
            reviewQueue: isFlagged
              ? [mappedTxn, ...state.reviewQueue.slice(0, 49)]
              : state.reviewQueue,
            metrics: newMetrics,
          };
        });
      },
    }),
    {
      name:    'vajrashield-storage-v7',
      version: 7, // Incremented to force store reset and pick up new initialMetrics
      // NEVER persist 'ws' or 'isConnected' — a serialized WebSocket is a dead plain
      // object whose readyState is undefined, which bypasses the OPEN/CONNECTING guard
      // and permanently blocks new real connections from being created.
      partialize: (state) => ({
        liveEvents:  state.liveEvents,
        reviewQueue: state.reviewQueue,
        metrics:     state.metrics,
      }),
    }
  )
);

export default useStore;
