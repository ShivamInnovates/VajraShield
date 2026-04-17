"""
ml_scorer.py
============
Doc Section 4.1 — River AdaptiveRandomForest warm-started model.

get_ml_score()  — predict fraud probability (0.0 to 1.0)
update_model()  — online learning via learn_one()

Features match exactly what step4_train_river.py trained on.
"""

import os
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'vajrashield_model_warmed.pkl')

FEATURES = [
    'amount',
    'amount_vs_median',
    'amount_zscore',
    'oldbalanceOrg',
    'newbalanceOrig',
    'balance_drain_pct',
    'full_drain',
    'is_transfer',
    'is_cash_out',
    'hour',
    'is_odd_hour',
    'is_new_device',
    'is_new_recipient',
    'ip_flagged',
    'account_age_days',
    'txn_count_1h',
    'merchant_risk',
]

print(f"Loading River model from {MODEL_PATH}...")
try:
    model = joblib.load(MODEL_PATH)
    print(f"River model loaded. Type: {type(model).__name__}")
except FileNotFoundError:
    print(f"WARNING: {MODEL_PATH} not found.")
    print("Run step4_train_river.py first to generate the model.")
    model = None


def get_ml_score(features: dict) -> float:
    """
    Returns fraud probability 0.0 (clean) to 1.0 (fraud).
    Called only for Lane 2 transactions.
    """
    if model is None:
        return 0.5   # neutral score if model not loaded
    
    # Calculate derived features if not provided
    amount = features.get('amount', 0)
    user_median = features.get('user_90d_median', 0)
    
    # Calculate amount_vs_median if not already in features
    if 'amount_vs_median' not in features and user_median > 0:
        features['amount_vs_median'] = amount / user_median
    elif 'amount_vs_median' not in features:
        features['amount_vs_median'] = 1.0
    
    # Calculate amount_zscore if not already in features
    # For now, use a simple approximation: (amount - median) / median
    # In production, this would use actual std dev from user history
    if 'amount_zscore' not in features and user_median > 0:
        features['amount_zscore'] = (amount - user_median) / max(user_median, 1)
    elif 'amount_zscore' not in features:
        features['amount_zscore'] = 0.0
    
    x = {f: float(features.get(f, 0)) for f in FEATURES}
    return round(model.predict_proba_one(x).get(1, 0.0), 4)


def update_model(features: dict, is_fraud: int):
    """
    Online learning — updates River model with transaction outcome.

    Doc Section 4.1 Step 3:
      Lane 2: call synchronously BEFORE sending response
      Lane 1: call async in background (low fraud signal)
      Lane 3: call synchronously (confirmed fraud, high value)
    """
    if model is None:
        return
    x = {f: float(features.get(f, 0)) for f in FEATURES}
    model.learn_one(x, int(is_fraud))
