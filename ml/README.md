# VajraShield ML Module v2

## What changed from v1
- `neo4j_scorer.py` → replaced with `graph_scorer.py` (Neo4j production-grade graph database)
- `decision_engine.py` → all 9 signals from doc Section 3 fully implemented
- `decision_engine.py` → geo_anomaly Lane 3 (>500km + new device) added
- `decision_engine.py` → account age + KYC signal added  
- `decision_engine.py` → blacklist checks for IP/device/recipient added
- `decision_engine.py` → location_km, device_uses, kyc_full inputs added
- `step7_test_pipeline.py` → 8 tests covering all lanes and signal types

## Run order

```
python step2_prepare_data.py     # ~5 mins  — augments PaySim
python step3_thresholds.py       # ~1 min   — prints data-backed thresholds
python step4_train_river.py      # ~30 mins — trains River, saves .pkl
python step5_evaluate.py         # ~10 mins — prints F1/AUC metrics
python step7_test_pipeline.py    # ~2 mins  — 8 end-to-end tests
```

## Files backend teammate needs

```
decision_engine.py          ← only import needed: make_decision()
ml_scorer.py                ← River model scoring + online learning
graph_scorer.py             ← Neo4j fraud ring detection (production-grade)
redis_filter.py             ← Redis filter engine (blacklists, velocity, baselines)
vajrashield_model_warmed.pkl← trained River model
.env                        ← configuration (Redis & Neo4j ports)
```

## FastAPI usage

```python
from decision_engine import make_decision

result = make_decision(
    features={
        'amount':            txn.amount,
        'oldbalanceOrg':     txn.old_balance,
        'newbalanceOrig':    txn.new_balance,
        'balance_drain_pct': txn.balance_drain,
        'full_drain':        txn.full_drain,
        'is_transfer':       int(txn.type == 'UPI'),
        'is_cash_out':       int(txn.type == 'ATM'),
        'hour':              txn.hour,
        'is_odd_hour':       int(1 <= txn.hour <= 5),
        'is_new_device':     int(txn.device_seen_count < 3),
        'is_new_recipient':  int(txn.recipient_txn_count == 0),
        'ip_flagged':        txn.ip_is_vpn,
        'ip_blacklisted':    txn.ip_on_blacklist,
        'device_blacklisted':txn.device_on_blacklist,
        'recipient_watchlisted': txn.recipient_on_watchlist,
        'account_age_days':  txn.account_age,
        'txn_count_1h':      txn.velocity_last_hour,
        'merchant_risk':     txn.merchant_risk_score,
        'kyc_full':          int(txn.kyc_complete),
    },
    account_id  = txn.sender_id,
    device_id   = txn.device_id,
    ip          = txn.ip_address,
    location_km = txn.distance_from_usual_km,   # compute from GPS or IP geolocation
    device_uses = txn.device_seen_count_30d,     # lookup from Redis
    kyc_full    = txn.kyc_complete,
    user_median = txn.user_90d_median_amount,    # stored in Redis, updated daily
)

# result keys:
# decision       → 'APPROVE' | 'STEP_UP' | 'BLOCK'
# lane           → 1 | 2 | 3
# unified_score  → 0.0 to 1.0
# ml_score       → 0.0 to 1.0
# graph_score    → 0.0 to 1.0
# signals        → ['new_device', 'odd_hours', ...]
# explanation    → {'message': '...', 'ask_for': 'OTP', 'all_signals': [...]}
# latency_budget → '< 15ms (Lane 1)' etc
```

## 9-Signal thresholds (doc Section 3)

| Signal | Safe → Lane 1 | Suspicious → Lane 2 | Block → Lane 3 |
|--------|--------------|--------------------|--------------:|
| Amount vs baseline | ≤ 2x median | 2x–5x median | > 10x median |
| Transaction time | Normal hours | Outside ±2h | 2AM–5AM + new device |
| Device fingerprint | ≥ 3 uses/30d | 1–2 uses | On blacklist |
| Geographic location | < 50km | 50–500km | > 500km + new device |
| Recipient | ≥ 2 prior payments | First payment | On watchlist |
| Velocity | ≤ 3/hr | 4–9/hr | ≥ 10/hr |
| Merchant risk | < 0.3 | 0.3–0.7 | > 0.7 |
| Account age + KYC | > 90d + full KYC | 30–90d or partial | < 30d + high amount |
| IP reputation | Clean | VPN/proxy | On blacklist |

## Demo fraud ring setup

```python
from graph_scorer import preload_fraud_ring

# Call at FastAPI startup for demo scenarios
preload_fraud_ring(
    accounts=['DEMO_RING_A', 'DEMO_RING_B', 'DEMO_RING_C'],
    device_id='DEV_RING_DEMO_001',
    ip='10.20.20.20'
)
```
