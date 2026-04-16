"""
step7_test_pipeline.py
======================
End-to-end tests for all 3 lanes and all 9 signals.
Run after step4_train_river.py.
All 8 tests must pass before handing files to backend teammate.
"""

from decision_engine import make_decision
from graph_scorer    import preload_fraud_ring

print("=" * 60)
print("VajraShield — End-to-End Pipeline Tests")
print("=" * 60)

passed = 0
failed = 0

def check(name, result, expected_decision, extra_check=None):
    global passed, failed
    print(f"\n--- {name} ---")
    print(f"  Decision:      {result['decision']}")
    print(f"  Lane:          {result['lane']}")
    print(f"  Score:         {result['unified_score']}")
    print(f"  Signals:       {result['signals']}")
    print(f"  Explanation:   {result['explanation'].get('message','')}")
    print(f"  Latency:       {result.get('latency_budget','')}")

    ok = True
    expected = [expected_decision] if isinstance(expected_decision, str) else expected_decision
    if result['decision'] not in expected:
        print(f"  FAIL: expected {expected}, got {result['decision']}")
        ok = False
    if extra_check and not extra_check(result):
        print(f"  FAIL: extra check failed")
        ok = False
    if ok:
        print(f"  PASS")
        passed += 1
    else:
        failed += 1


# ── Test 1: Lane 1 — all 9 signals clean ─────────────────────────────────────
check(
    "Test 1: All signals clean → Lane 1 APPROVE",
    make_decision(
        features={
            'amount': 500, 'oldbalanceOrg': 10000, 'newbalanceOrig': 9500,
            'balance_drain_pct': 0.05, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 14, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 600, 'txn_count_1h': 1,
            'merchant_risk': 0.1, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_CLEAN_001', device_id='DEV_KNOWN_A',
        ip='192.168.1.10', recipient_id='RECIP_CLEAN_001',
        location_km=5, device_uses=15,
        kyc_full=1, user_median=480,
    ),
    expected_decision='APPROVE',
    extra_check=lambda r: r['lane'] == 1
)

# ── Test 2: Lane 3 — velocity burst ≥ 10 ─────────────────────────────────────
check(
    "Test 2: Velocity ≥ 10 txns/hr → Lane 3 BLOCK",
    make_decision(
        features={
            'amount': 1000, 'oldbalanceOrg': 5000, 'newbalanceOrig': 4000,
            'balance_drain_pct': 0.2, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 15, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 400,
            # txn_count_1h removed - will be fetched from Redis
            'merchant_risk': 0.2, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_VEL_001', device_id='DEV_KNOWN_B',
        ip='192.168.1.11', recipient_id='RECIP_CLEAN_002',
        location_km=10, device_uses=20,
        kyc_full=1, user_median=900,
    ),
    expected_decision='BLOCK',
    extra_check=lambda r: r['lane'] == 3
)

# ── Test 3: Lane 3 — amount > 10x baseline ────────────────────────────────────
check(
    "Test 3: Amount > 10x user median → Lane 3 BLOCK",
    make_decision(
        features={
            'amount': 55000, 'oldbalanceOrg': 60000, 'newbalanceOrig': 5000,
            'balance_drain_pct': 0.92, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 10, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 500, 'txn_count_1h': 1,
            'merchant_risk': 0.1, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_AMT_001', device_id='DEV_KNOWN_C',
        ip='192.168.1.12', recipient_id='RECIP_CLEAN_003',
        location_km=8, device_uses=10,
        kyc_full=1, user_median=500,   # 55000 / 500 = 110x
    ),
    expected_decision='BLOCK',
    extra_check=lambda r: r['lane'] == 3
)

# ── Test 4: Lane 3 — geo_anomaly > 500km + new device ────────────────────────
check(
    "Test 4: Location > 500km + new device → Lane 3 BLOCK (geo_anomaly)",
    make_decision(
        features={
            'amount': 3000, 'oldbalanceOrg': 15000, 'newbalanceOrig': 12000,
            'balance_drain_pct': 0.2, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 14, 'is_odd_hour': 0,
            'is_new_device': 1, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 800, 'txn_count_1h': 1,
            'merchant_risk': 0.2, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_GEO_001', device_id='DEV_NEW_999',
        ip='1.2.3.4', recipient_id='RECIP_CLEAN_004',
        location_km=650, device_uses=1,   # 650km away + new device
        kyc_full=1, user_median=2800,
    ),
    expected_decision='BLOCK',
    extra_check=lambda r: r['lane'] == 3 and 'geo_extreme' in r['signals']
)

# ── Test 5: Lane 2 — suspicious but not hard block ───────────────────────────
check(
    "Test 5: Multiple suspicious signals → Lane 2 STEP_UP or BLOCK",
    make_decision(
        features={
            'amount': 35000, 'oldbalanceOrg': 50000, 'newbalanceOrig': 15000,
            'balance_drain_pct': 0.70, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 3, 'is_odd_hour': 1,
            'is_new_device': 1, 'is_new_recipient': 1,
            'ip_flagged': 1, 'ip_blacklisted': 0,
            'account_age_days': 35, 'txn_count_1h': 7,
            'merchant_risk': 0.8, 'kyc_full': 0,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_RAHUL_001', device_id='DEV_NEW_888',
        ip='10.0.0.5', recipient_id='RECIP_NEW_005',
        location_km=300, device_uses=1,
        kyc_full=0, user_median=4000,  # 35000/4000 = 8.75x (under 10x threshold)
    ),
    expected_decision=['STEP_UP', 'BLOCK'],
    extra_check=lambda r: r['lane'] == 2 and r['unified_score'] > 0.25
)

# ── Test 6: Lane 2 — geo suspicious (50-500km) not hard block ────────────────
check(
    "Test 6: Location 50-500km → Lane 2 (not Lane 3)",
    make_decision(
        features={
            'amount': 2000, 'oldbalanceOrg': 20000, 'newbalanceOrig': 18000,
            'balance_drain_pct': 0.1, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 12, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 700, 'txn_count_1h': 2,
            'merchant_risk': 0.2, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_GEO_002', device_id='DEV_KNOWN_D',
        ip='192.168.5.5', recipient_id='RECIP_CLEAN_006',
        location_km=200, device_uses=8,   # 200km = suspicious only
        kyc_full=1, user_median=1800,
    ),
    expected_decision=['APPROVE', 'STEP_UP'],
    extra_check=lambda r: r['lane'] in [1, 2]
)

# ── Test 7: Fraud ring via shared device ─────────────────────────────────────
print("\n--- Test 7 Setup: Preloading fraud ring ---")
preload_fraud_ring(
    accounts=['RING_FRAUD_A', 'RING_FRAUD_B'],
    device_id='DEV_RING_SHARED_777',
    ip='10.20.20.20'
)
print("Fraud ring loaded.")

check(
    "Test 7: New account using fraud ring device → elevated graph score",
    make_decision(
        features={
            'amount': 3000, 'oldbalanceOrg': 8000, 'newbalanceOrig': 5000,
            'balance_drain_pct': 0.37, 'full_drain': 0,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 10, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 0,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 300, 'txn_count_1h': 2,
            'merchant_risk': 0.2, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='RING_NEW_C', device_id='DEV_RING_SHARED_777',
        ip='10.20.20.20', recipient_id='RECIP_CLEAN_007',
        location_km=15, device_uses=3,
        kyc_full=1, user_median=2800,
    ),
    expected_decision=['APPROVE', 'STEP_UP', 'BLOCK'],
    extra_check=lambda r: r['graph_score'] > 0.0
)

# ── Test 8: Full drain + new recipient → Lane 3 ───────────────────────────────
check(
    "Test 8: Full account drain to new recipient → Lane 3 BLOCK",
    make_decision(
        features={
            'amount': 15000, 'oldbalanceOrg': 15000, 'newbalanceOrig': 0,
            'balance_drain_pct': 1.0, 'full_drain': 1,
            'is_transfer': 1, 'is_cash_out': 0,
            'hour': 14, 'is_odd_hour': 0,
            'is_new_device': 0, 'is_new_recipient': 1,
            'ip_flagged': 0, 'ip_blacklisted': 0,
            'account_age_days': 400, 'txn_count_1h': 2,
            'merchant_risk': 0.3, 'kyc_full': 1,
            'device_blacklisted': 0, 'recipient_watchlisted': 0,
        },
        account_id='C_DRAIN_001', device_id='DEV_KNOWN_E',
        ip='192.168.2.2', recipient_id='RECIP_NEW_UNKNOWN',
        location_km=10, device_uses=12,
        kyc_full=1, user_median=14000,
    ),
    expected_decision='BLOCK',
    extra_check=lambda r: r['lane'] == 3
)

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print(f"Results: {passed} passed, {failed} failed out of {passed+failed} tests")
if failed == 0:
    print("ALL TESTS PASSED — pipeline ready for backend handoff.")
    print("\nFiles for backend teammate:")
    print("  decision_engine.py  ← import make_decision from here")
    print("  ml_scorer.py")
    print("  graph_scorer.py     ← networkx, no Neo4j needed")
    print("  vajrashield_model_warmed.pkl")
    print("\nFastAPI one-liner:")
    print("  from decision_engine import make_decision")
else:
    print(f"FIX {failed} FAILING TEST(S) BEFORE HANDOFF.")
print("=" * 60)
