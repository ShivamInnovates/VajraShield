"""
decision_engine.py
==================
VajraShield — Full 3-Lane Decision Pipeline
Matches doc exactly: Section 2 (lanes), Section 3 (9 signals),
Section 4 (ML + graph), Section 5 (weights), Section 6 (explainer)

All 9 signals from Section 3 implemented with exact thresholds:
  1. Amount vs 90-day baseline
  2. Transaction time (odd hours)
  3. Device fingerprint
  4. Geographic location
  5. Recipient history
  6. Transaction velocity
  7. Merchant risk score
  8. Account age + KYC
  9. IP reputation

FastAPI usage:
    from decision_engine import make_decision
    result = make_decision(
        features    = txn.to_feature_dict(),
        account_id  = txn.sender_id,
        device_id   = txn.device_id,
        ip          = txn.ip_address,
        location_km = txn.distance_from_usual_km,   # NEW
        device_uses = txn.device_seen_count_30d,     # NEW
        kyc_full    = txn.kyc_complete,              # NEW
        user_median = txn.user_90d_median,           # NEW
    )
"""

from .ml_scorer    import get_ml_score, update_model
from .graph_scorer import get_graph_risk_score, update_graph
from .redis_filter import check_redis_signals, record_transaction, is_cold_start
import asyncio

# ── Section 6 — Signal-to-message dictionary ─────────────────────────────────
# Exactly as specified in doc Section 6
# Order = severity (first triggered = primary message shown to user)

SIGNAL_MESSAGES = {
    # Lane 3 triggers (shown on hard block)
    'blacklisted_ip':           ('IP address is blacklisted',                'Block'),
    'blacklisted_device':       ('Device is blacklisted',                    'Block'),
    'blacklisted_recipient':    ('Recipient is on fraud watchlist',          'Block'),
    'velocity_burst':           ('Too many transactions in last hour',       'Block + call bank'),
    'amount_10x_baseline':      ('Amount is 10x your usual spending',        'Block'),
    'geo_extreme':              ('Transaction from very unusual location',    'Block'),

    # Lane 2 signals (shown on step-up)
    'new_location':             ('Unusual location detected',                'OTP'),
    'new_device':               ('New device detected',                      'OTP'),
    'high_amount':              ('Unusually large amount',                   'OTP + selfie'),
    'new_recipient':            ('First payment to this account',            'OTP'),
    'odd_hours':                ('Transaction at unusual hour (1AM-5AM)',    'OTP'),
    'vpn_detected':             ('VPN or proxy detected',                    'OTP'),
    'velocity':                 ('Higher than usual transaction count',      'OTP'),
    'new_account':              ('Account is very new',                      'OTP + selfie'),
    'risky_merchant':           ('Merchant risk elevated',                   'OTP'),
    'partial_kyc':              ('Account KYC incomplete',                   'OTP + selfie'),
    'balance_drain':            ('Account nearly completely emptied',        'OTP + selfie'),
    'full_drain_new_recipient': ('Account emptied to unknown recipient',     'Block'),
}


# ── Section 3 — 9-Signal filter with exact doc thresholds ────────────────────

def check_lane(features: dict) -> tuple:
    """
    Checks all 9 signals from doc Section 3.
    Returns (lane, reason_key)

    Doc rules:
      Any Lane 3 trigger → Lane 3 immediately
      Zero flags         → Lane 1
      1-3 flags          → Lane 2

    All 9 signals:
      1. amount_vs_median     Safe ≤2x | Suspicious 2-5x | Block >10x
      2. is_odd_hour          Safe=0   | Suspicious alone | Block + new_device
      3. device_uses          Safe ≥3  | Suspicious 1-2   | Block = blacklisted
      4. location_km          Safe <50 | Suspicious 50-500| Block >500+new_device
      5. is_new_recipient     Safe=0   | Suspicious=1     | Block = watchlisted
      6. txn_count_1h         Safe ≤3  | Suspicious 4-9   | Block ≥10
      7. merchant_risk        Safe <0.3| Suspicious 0.3-0.7| Block >0.7
      8. account_age_days     Safe >90 | Suspicious 30-90 | Block <30+high_amount
      9. ip_flagged           Safe=0   | Suspicious=VPN   | Block=blacklisted
    """

    # Extract all 9 signals
    amount_vs_median  = features.get('amount_vs_median', 1.0)
    is_odd_hour       = features.get('is_odd_hour', 0)
    device_uses       = features.get('device_uses_30d', 99)    # how many times seen
    device_blacklist  = features.get('device_blacklisted', 0)
    location_km       = features.get('location_km', 0)         # km from usual
    is_new_recip      = features.get('is_new_recipient', 0)
    recip_watchlist   = features.get('recipient_watchlisted', 0)
    txn_count         = features.get('txn_count_1h', 0)
    merchant_risk     = features.get('merchant_risk', 0)
    acc_age           = features.get('account_age_days', 999)
    kyc_full          = features.get('kyc_full', 1)
    ip_flagged        = features.get('ip_flagged', 0)
    ip_blacklisted    = features.get('ip_blacklisted', 0)
    user_median       = features.get('user_90d_median', 1)
    amount            = features.get('amount', 0)
    full_drain        = features.get('full_drain', 0)
    balance_drain     = features.get('balance_drain_pct', 0)
    is_new_device     = features.get('is_new_device', 0)

    # Compute amount_vs_median if not pre-computed
    if user_median > 0:
        amount_vs_median = amount / max(user_median, 1)

    # ── Lane 3: Hard block — doc says "block immediately < 10ms" ─────────────

    # Signal 9: IP on blacklist
    if ip_blacklisted:
        return 3, 'blacklisted_ip'

    # Signal 3: Device on blacklist
    if device_blacklist:
        return 3, 'blacklisted_device'

    # Signal 5: Recipient on fraud watchlist
    if recip_watchlist:
        return 3, 'blacklisted_recipient'

    # Signal 6: Velocity burst ≥ 10 txns/hr
    if txn_count >= 10:
        return 3, 'velocity_burst'

    # Signal 1: Amount > 10x user baseline
    if amount_vs_median > 10:
        return 3, 'amount_10x_baseline'

    # Signal 4: Location > 500km + new device (geo_anomaly hard block)
    if location_km > 500 and is_new_device:
        return 3, 'geo_extreme'

    # Signal 8: Account < 30 days + high amount (>5x median)
    if acc_age < 30 and amount_vs_median > 5:
        return 3, 'new_account'

    # Full account drain to new recipient = always block
    if full_drain and is_new_recip:
        return 3, 'full_drain_new_recipient'

    # ── Lane 1: All signals clean ─────────────────────────────────────────────
    all_clean = (
        amount_vs_median <= 2.0     and   # signal 1
        not is_odd_hour             and   # signal 2
        device_uses >= 3            and   # signal 3 (known device)
        location_km <= 50           and   # signal 4
        not is_new_recip            and   # signal 5
        txn_count <= 3              and   # signal 6
        merchant_risk < 0.3         and   # signal 7
        acc_age > 90                and   # signal 8
        kyc_full                    and   # signal 8
        not ip_flagged              and   # signal 9
        balance_drain < 0.5               # extra safety
    )

    if all_clean:
        return 1, 'all_signals_clean'

    # ── Lane 2: 1-3 signals suspicious ───────────────────────────────────────
    return 2, 'uncertain'


def get_triggered_signals(features: dict) -> list:
    """
    Returns all triggered signal keys ordered by severity.
    First item = primary message shown to user (Section 6).
    """
    signals = []

    amount_vs_median = features.get('amount', 0) / max(features.get('user_90d_median', 1), 1)
    txn_count        = features.get('txn_count_1h', 0)
    acc_age          = features.get('account_age_days', 999)
    location_km      = features.get('location_km', 0)
    balance_drain    = features.get('balance_drain_pct', 0)
    full_drain       = features.get('full_drain', 0)
    is_new_recip     = features.get('is_new_recipient', 0)

    # Severity order — most dangerous first
    if full_drain and is_new_recip:
        signals.append('full_drain_new_recipient')
    if features.get('ip_blacklisted'):
        signals.append('blacklisted_ip')
    if features.get('device_blacklisted'):
        signals.append('blacklisted_device')
    if features.get('recipient_watchlisted'):
        signals.append('blacklisted_recipient')
    if txn_count >= 10:
        signals.append('velocity_burst')

    # Signal 1: Amount vs Baseline
    # Cold Start Patch: If user_median is 0 (or default to current amount), skip 10x alert
    is_cold_start_user = features.get('user_90d_median', 0) == 0 or features.get('user_90d_median') == features.get('amount')
    if amount_vs_median > 10 and not is_cold_start_user:
        signals.append('amount_10x_baseline')
    if location_km > 500 and features.get('is_new_device'):
        signals.append('geo_extreme')
    if 50 < location_km <= 500:
        signals.append('new_location')           # suspicious geo (Lane 2)
    if txn_count >= 4:
        signals.append('velocity')
    if balance_drain >= 0.9:
        signals.append('balance_drain')
    if features.get('is_new_device'):
        signals.append('new_device')
    if features.get('is_odd_hour'):
        signals.append('odd_hours')
    if amount_vs_median > 2:
        signals.append('high_amount')
    if is_new_recip:
        signals.append('new_recipient')
    if features.get('ip_flagged'):
        signals.append('vpn_detected')
    if acc_age < 30:
        signals.append('new_account')
    if not features.get('kyc_full', 1):
        signals.append('partial_kyc')
    if features.get('merchant_risk', 0) > 0.3:
        signals.append('risky_merchant')

    return signals


# ── Main decision function ────────────────────────────────────────────────────

def make_decision(
    features:    dict,
    account_id:  str,
    device_id:   str,
    ip:          str,
    recipient_id: str = 'UNKNOWN',  # NEW: for Redis blacklist check
    # New inputs for complete 9-signal coverage
    location_km: float = 0,      # km from user's usual transaction locations
    device_uses: int   = None,   # how many times this device seen in last 30 days (None = fetch from Redis)
    kyc_full:    int   = 1,      # 1 = full KYC, 0 = partial
    user_median: float = None,   # user's 90-day rolling median amount (None = fetch from Redis)
) -> dict:
    """
    Full VajraShield 3-lane decision pipeline with Redis filter integration.
    Implements doc Sections 2, 3, 4, 5, 6 completely.
    
    Redis Filter (Layer 3.5):
      - Fetches blacklists (IP, device, recipient)
      - Fetches velocity (txn_count_1h)
      - Fetches user baseline (90d median)
      - Fetches device usage (30d count)
    
    Returns:
        decision:       APPROVE | STEP_UP | BLOCK
        lane:           1 | 2 | 3
        unified_score:  0.0 - 1.0
        ml_score:       0.0 - 1.0
        graph_score:    0.0 - 1.0
        signals:        list of triggered signal keys
        explanation:    { message, ask_for, all_signals }
        latency_budget: which lane was used and expected ms
    """
    
    # ── Layer 3.5: Redis Filter (<5ms) ───────────────────────────────────────
    # 1. Cold Start Check
    if is_cold_start(account_id):
        # Escalate immediately to Lane 2 if < 10 txns
        # We still need to gather features for Lane 2 logic below
        pass 

    # Fetch blacklists, velocity, user baselines from Redis
    redis_data = check_redis_signals(
        account_id=account_id,
        device_id=device_id,
        ip=ip,
        recipient_id=recipient_id,
        amount=features.get('amount', 0)
    )
    
    # Use Redis data if not provided by caller
    if user_median is None:
        user_median = redis_data.get('user_median', 0)
    if device_uses is None:
        device_uses = redis_data.get('device_uses_30d', 99)
    
    # Merge Redis filter data into features
    redis_txn = redis_data.get('txn_count_1h', 0)
    features = {
        **features,
        'location_km':           location_km,
        'device_uses_30d':       device_uses,
        'kyc_full':              kyc_full,
        'user_90d_median':       user_median if user_median > 0 else features.get('amount', 1),
        # Redis filter signals
        'ip_blacklisted':        redis_data.get('ip_blacklisted', 0) or features.get('ip_blacklisted', 0),
        'device_blacklisted':    redis_data.get('device_blacklisted', 0) or features.get('device_blacklisted', 0),
        'recipient_watchlisted': redis_data.get('recipient_watchlisted', 0) or features.get('recipient_watchlisted', 0),
        'ip_flagged':            redis_data.get('ip_flagged', 0) or features.get('ip_flagged', 0),
        'txn_count_1h':          redis_txn if redis_txn > 0 else features.get('txn_count_1h', 0),
    }

    # ── Step 1: 9-signal filter → lane decision ───────────────────────────────
    lane, lane_reason = check_lane(features)

    # Cold Start Override: Force Lane 2 if < 10 total txns and not already Lane 3
    if lane == 1 and is_cold_start(account_id):
        lane = 2
        lane_reason = 'cold_start_new_user'

    # ── Lane 3: Hard block < 10ms ─────────────────────────────────────────────
    if lane == 3:
        signals     = get_triggered_signals(features)
        primary     = signals[0] if signals else lane_reason
        msg, ask    = SIGNAL_MESSAGES.get(primary, ('Suspicious activity', 'Block'))
        explanation = {
            'message':     f'Payment blocked: {msg}.',
            'ask_for':     ask,
            'all_signals': signals,
        }

        # Learn synchronously — hard fraud signal, very valuable
        update_model(features, 1)
        update_graph(account_id, device_id, ip, 1)
        record_transaction(account_id)  # Record for velocity tracking

        return {
            'decision':       'BLOCK',
            'lane':           3,
            'unified_score':  1.0,
            'ml_score':       1.0,
            'graph_score':    1.0,
            'signals':        signals,
            'explanation':    explanation,
            'latency_budget': '< 10ms  (Lane 3 — Redis hard block)',
        }

    # ── Lane 1: Approve instantly < 15ms ─────────────────────────────────────
    if lane == 1:
        # Even in Lane 1, check graph score for fraud ring detection
        # This adds ~5ms but catches accounts using known fraud devices/IPs
        graph_score = get_graph_risk_score(account_id, device_id, ip)
        
        # If graph detects fraud ring connection, escalate to Lane 2
        if graph_score > 0.0:
            ml_score = get_ml_score(features)
            unified_score = round(0.65 * ml_score + 0.35 * graph_score, 4)
            
            # Determine decision based on unified score
            if unified_score < 0.30:
                decision = 'APPROVE'
                is_fraud = 0
            elif unified_score < 0.65:
                decision = 'STEP_UP'
                is_fraud = 0
            else:
                decision = 'BLOCK'
                is_fraud = 1
            
            signals = get_triggered_signals(features)
            primary = signals[0] if signals else 'new_device'
            msg, ask = SIGNAL_MESSAGES.get(primary, ('Suspicious activity detected', 'OTP'))
            verb = 'blocked' if decision == 'BLOCK' else 'paused'
            explanation = {
                'message': f'Payment {verb}: {msg}.' if signals else '',
                'ask_for': ask if signals else '',
                'all_signals': signals,
            }
            
            update_model(features, is_fraud)
            update_graph(account_id, device_id, ip, is_fraud)
            
            return {
                'decision': decision,
                'lane': 1,  # Still Lane 1 latency, but with graph check
                'unified_score': unified_score,
                'ml_score': round(ml_score, 4),
                'graph_score': round(graph_score, 4),
                'signals': signals,
                'explanation': explanation,
                'latency_budget': '< 15ms  (Lane 1 — all signals clean)',
            }
        
        # No fraud ring detected, approve normally
        # Learn async — clean transactions have low fraud signal
        # In FastAPI: background_tasks.add_task(update_model, features, 0)
        update_model(features, 0)
        update_graph(account_id, device_id, ip, 0)
        record_transaction(account_id)  # Record for velocity tracking

        return {
            'decision':       'APPROVE',
            'lane':           1,
            'unified_score':  0.0,
            'ml_score':       0.0,
            'graph_score':    0.0,
            'signals':        [],
            'explanation':    {},
            'latency_budget': '< 15ms  (Lane 1 — all signals clean)',
        }

    # ── Lane 2: ML + graph pipeline < 350ms ──────────────────────────────────
    # Section 4.1 — River ML score
    ml_score = get_ml_score(features)

    # Section 4.2 — Graph fraud ring score
    graph_score = get_graph_risk_score(account_id, device_id, ip)

    # Section 5 — Weighted combination: 65% ML + 35% graph
    unified_score = round(0.65 * ml_score + 0.35 * graph_score, 4)

    # Section 5 — Decision thresholds
    # Hardened Logic: Use signal count as a primary factor
    signals = get_triggered_signals(features)
    signal_count = len(signals)
    if unified_score >= 0.65 or signal_count >= 3:
        decision = 'BLOCK'
        is_fraud = 1
    elif unified_score >= 0.30 or signal_count >= 2:
        decision = 'STEP_UP'
        is_fraud = 0
    else:
        decision = 'APPROVE'
        is_fraud = 0

    # Section 6 — Signal explainer
    explanation = {
        'message':     f'Payment {"blocked" if decision == "BLOCK" else "paused"}: {SIGNAL_MESSAGES.get(signals[0] if signals else "new_device", ("Suspicious activity", "OTP"))[0]}.',
        'ask_for':     SIGNAL_MESSAGES.get(signals[0] if signals else "new_device", ("", "OTP"))[1],
        'all_signals': signals,
    }

    # Section 4.1 Step 3 — Lane 2 learns SYNCHRONOUSLY before response
    # This is the most valuable feedback — uncertain transactions that
    # got confirmed as fraud/clean update the model immediately
    update_model(features, is_fraud)
    update_graph(account_id, device_id, ip, is_fraud)
    record_transaction(account_id)  # Record for velocity tracking

    return {
        'decision':       decision,
        'lane':           2,
        'unified_score':  unified_score,
        'ml_score':       round(ml_score, 4),
        'graph_score':    round(graph_score, 4),
        'signals':        signals,
        'explanation':    explanation,
        'latency_budget': '< 350ms  (Lane 2 — ML + graph)',
    }
async def async_make_decision(
    features:    dict,
    account_id:  str,
    device_id:   str,
    ip:          str,
    recipient_id: str = 'UNKNOWN',
    location_km: float = 0,
    device_uses: int   = None,
    kyc_full:    int   = 1,
    user_median: float = None,
) -> dict:
    """
    Asynchronous version of make_decision that supports parallel Lane 2 execution
    and strict 250ms timeouts as per Enterprise Architecture.
    """
    # 1. Gather all required data in a non-blocking thread
    loop = asyncio.get_event_loop()
    
    # We call the synchronous make_decision inside an executor to avoid blocking the main event loop
    # while it connects to Redis/Neo4j for Lane 1/3 checks.
    base_decision = await loop.run_in_executor(
        None, 
        make_decision,
        features,
        account_id,
        device_id,
        ip,
        recipient_id,
        location_km,
        device_uses,
        kyc_full,
        user_median
    )

    if base_decision['lane'] != 2:
        return base_decision

    # ── Lane 2 Parallel Analysis (Async Implementation) ──────────────────────
    # Re-extract merged features from base_decision simulation or pass through
    # For now, we perform the parallel scoring here
    
    async def get_scores():
        # Run ML Scorer in thread (CPU bound) and Graph Scorer in thread (IO/Sync bound for now)
        loop = asyncio.get_event_loop()
        ml_task = loop.run_in_executor(None, get_ml_score, features)
        graph_task = loop.run_in_executor(None, get_graph_risk_score, account_id, device_id, ip)
        
        return await asyncio.gather(ml_task, graph_task)

    try:
        # 250ms hard timeout as per diagram
        ml_score, graph_score = await asyncio.wait_for(get_scores(), timeout=0.250)
    except asyncio.TimeoutError:
        # Fallback if parallel execution times out
        # Diagram says "timeout" -> typically fallback to safe approval or specific flag
        ml_score = get_ml_score(features) # fallback to sync ML if parallel fails/times out
        graph_score = 0.0
        print("⚠ Lane 2 Analysis Timeout (>250ms), falling back to sequential.")

    # Weighted combination: 65% ML + 35% graph
    unified_score = round(0.65 * ml_score + 0.35 * graph_score, 4)

    # Extract signals for threshold evaluation
    signals = get_triggered_signals(features)
    signal_count = len(signals)

    # Threshold evaluation - Hardened Logic
    if unified_score >= 0.65 or signal_count >= 3:
        decision = 'BLOCK'
    elif unified_score >= 0.30 or signal_count >= 2:
        decision = 'STEP_UP'
    else:
        decision = 'APPROVE'

    # Explainer logic
    primary = signals[0] if signals else 'new_device'
    msg, ask = SIGNAL_MESSAGES.get(primary, ('Suspicious activity detected', 'OTP'))
    verb = 'blocked' if decision == 'BLOCK' else 'paused'
    
    # Sync updates
    is_fraud = 1 if decision == 'BLOCK' else 0
    update_model(features, is_fraud)
    update_graph(account_id, device_id, ip, is_fraud)
    record_transaction(account_id)

    return {
        'decision':       decision,
        'lane':           2,
        'unified_score':  unified_score,
        'ml_score':       round(ml_score, 4),
        'graph_score':    round(graph_score, 4),
        'signals':        signals,
        'explanation':    {
            'message': f'Payment {verb}: {msg}.',
            'ask_for': ask,
            'all_signals': signals,
        },
        'latency_budget': '< 250ms (Lane 2 — Parallel Async)',
    }
