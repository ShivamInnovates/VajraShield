-- VajraShield Supabase Schema
-- Fed by Kafka txn-events consumer from decision_engine

-- Main transactions table (audit log)
CREATE TABLE transactions (
    txn_id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount FLOAT NOT NULL,
    account_id TEXT NOT NULL,
    device_id TEXT,
    ip_address TEXT,
    recipient_id TEXT,
    
    -- Decision metadata
    lane INT NOT NULL CHECK (lane IN (1, 2, 3)),
    decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'STEP_UP', 'BLOCK')),
    
    -- Risk scores
    ml_score FLOAT NOT NULL,
    graph_score FLOAT NOT NULL,
    unified_score FLOAT NOT NULL,
    
    -- Explainability
    signals TEXT[] NOT NULL DEFAULT '{}',
    explanation JSONB,
    detailed_explanation JSONB,
    
    -- Ground truth (updated by human review)
    confirmed_fraud BOOLEAN DEFAULT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    
    -- Model metadata
    model_version TEXT DEFAULT 'v1.0',
    latency_ms INT,
    
    -- Indexes for fast queries
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_account_id (account_id),
    INDEX idx_decision (decision),
    INDEX idx_lane (lane),
    INDEX idx_confirmed_fraud (confirmed_fraud) WHERE confirmed_fraud IS NOT NULL
);

-- Model performance stats (updated by batch job)
CREATE TABLE model_stats (
    id SERIAL PRIMARY KEY,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Learning stats
    transactions_learned INT NOT NULL,
    transactions_total INT NOT NULL,
    
    -- Performance metrics
    recall FLOAT,
    precision_score FLOAT,
    f1_score FLOAT,
    auc_score FLOAT,
    
    -- Drift detection
    drift_detected BOOLEAN DEFAULT FALSE,
    drift_score FLOAT,
    
    -- Lane breakdown
    lane1_count INT DEFAULT 0,
    lane2_count INT DEFAULT 0,
    lane3_count INT DEFAULT 0,
    
    -- Decision breakdown
    approved_count INT DEFAULT 0,
    stepup_count INT DEFAULT 0,
    blocked_count INT DEFAULT 0,
    
    -- False positive/negative rates
    false_positive_rate FLOAT,
    false_negative_rate FLOAT,
    
    INDEX idx_recorded_at (recorded_at DESC)
);

-- Fraud rings detected by graph engine
CREATE TABLE fraud_rings (
    id SERIAL PRIMARY KEY,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ring metadata
    ring_id TEXT UNIQUE NOT NULL,
    accounts TEXT[] NOT NULL,
    shared_devices TEXT[],
    shared_ips TEXT[],
    
    -- Risk assessment
    risk_score FLOAT NOT NULL,
    confirmed_fraud BOOLEAN DEFAULT NULL,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'confirmed', 'false_alarm')),
    notes TEXT,
    
    INDEX idx_status (status),
    INDEX idx_detected_at (detected_at DESC)
);

-- Human review queue (Lane 3 blocks)
CREATE TABLE review_queue (
    id SERIAL PRIMARY KEY,
    txn_id TEXT REFERENCES transactions(txn_id),
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Priority (higher score = higher priority)
    priority INT DEFAULT 5,
    
    -- Review status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    review_notes TEXT,
    
    -- SLA tracking (30 min target)
    sla_breached BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN status = 'pending' AND (NOW() - queued_at) > INTERVAL '30 minutes' THEN TRUE
            ELSE FALSE
        END
    ) STORED,
    
    INDEX idx_status (status),
    INDEX idx_queued_at (queued_at DESC),
    INDEX idx_sla_breached (sla_breached) WHERE sla_breached = TRUE
);

-- Chat history (for context)
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Message
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    
    -- Context
    txn_id TEXT,
    query_results JSONB,
    
    INDEX idx_session_id (session_id),
    INDEX idx_timestamp (timestamp DESC)
);

-- Views for common queries

-- Today's summary
CREATE VIEW daily_summary AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE decision = 'BLOCK') as blocked,
    COUNT(*) FILTER (WHERE decision = 'STEP_UP') as step_up,
    COUNT(*) FILTER (WHERE decision = 'APPROVE') as approved,
    COUNT(*) FILTER (WHERE lane = 1) as lane1,
    COUNT(*) FILTER (WHERE lane = 2) as lane2,
    COUNT(*) FILTER (WHERE lane = 3) as lane3,
    AVG(unified_score) as avg_risk_score,
    COUNT(*) FILTER (WHERE confirmed_fraud = TRUE) as confirmed_fraud,
    COUNT(*) FILTER (WHERE confirmed_fraud = FALSE AND decision = 'BLOCK') as false_positives
FROM transactions
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Active fraud rings
CREATE VIEW active_fraud_rings AS
SELECT 
    ring_id,
    detected_at,
    ARRAY_LENGTH(accounts, 1) as account_count,
    risk_score,
    status
FROM fraud_rings
WHERE status IN ('active', 'investigating')
ORDER BY risk_score DESC, detected_at DESC;

-- Review queue with SLA
CREATE VIEW review_queue_summary AS
SELECT 
    rq.id,
    rq.txn_id,
    t.account_id,
    t.amount,
    t.unified_score,
    rq.queued_at,
    rq.status,
    rq.sla_breached,
    EXTRACT(EPOCH FROM (NOW() - rq.queued_at))/60 as minutes_waiting
FROM review_queue rq
JOIN transactions t ON rq.txn_id = t.txn_id
WHERE rq.status = 'pending'
ORDER BY rq.priority DESC, rq.queued_at ASC;
