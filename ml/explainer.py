"""
explainer.py
============
SHAP-based Model Explainability for VajraShield
Provides detailed feature importance for Lane 2/3 decisions.

Used for:
  - Human review queue (show why transaction was blocked)
  - Audit logs (regulatory compliance - RBI PCI-DSS)
  - Model debugging (detect bias, drift)
  - Customer support (explain decisions to users)

Note: SHAP with River models requires TreeExplainer approximation.
For production, consider LIME as fallback for online learning models.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
import joblib
import os

# Try to import SHAP (optional dependency)
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠ SHAP not installed. Using rule-based explainer only.")
    print("  Install: pip install shap")

# Feature names matching ml_scorer.py
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

# Load model for SHAP
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'vajrashield_model_warmed.pkl')
try:
    _model = joblib.load(MODEL_PATH)
    MODEL_LOADED = True
except:
    _model = None
    MODEL_LOADED = False

# SHAP explainer (lazy initialization)
_shap_explainer = None
_shap_background_data = None

# Human-readable feature names
FEATURE_NAMES = {
    'amount': 'Transaction Amount',
    'amount_vs_median': 'Amount vs User Baseline',
    'amount_zscore': 'Amount Deviation',
    'oldbalanceOrg': 'Balance Before',
    'newbalanceOrig': 'Balance After',
    'balance_drain_pct': 'Account Drain %',
    'full_drain': 'Full Account Drain',
    'is_transfer': 'Transfer Type',
    'is_cash_out': 'Cash Out',
    'hour': 'Transaction Hour',
    'is_odd_hour': 'Odd Hours (1-5 AM)',
    'is_new_device': 'New Device',
    'is_new_recipient': 'New Recipient',
    'ip_flagged': 'VPN/Proxy Detected',
    'account_age_days': 'Account Age',
    'txn_count_1h': 'Transactions/Hour',
    'merchant_risk': 'Merchant Risk Score',
}


def _init_shap_explainer(background_samples: int = 100):
    """
    Initialize SHAP explainer with background data.
    Called lazily on first SHAP request.
    
    For River models, we use KernelExplainer with synthetic background data.
    TreeExplainer doesn't work with River's online learning models.
    """
    global _shap_explainer, _shap_background_data
    
    if not SHAP_AVAILABLE or not MODEL_LOADED:
        return False
    
    if _shap_explainer is not None:
        return True
    
    try:
        # Generate synthetic background data (typical transaction ranges)
        # In production, use real historical data sample
        np.random.seed(42)
        _shap_background_data = np.array([
            [
                np.random.uniform(100, 10000),      # amount
                np.random.uniform(0.5, 3.0),        # amount_vs_median
                np.random.uniform(-1, 2),           # amount_zscore
                np.random.uniform(1000, 50000),     # oldbalanceOrg
                np.random.uniform(500, 45000),      # newbalanceOrig
                np.random.uniform(0, 0.8),          # balance_drain_pct
                np.random.choice([0, 1], p=[0.95, 0.05]),  # full_drain
                np.random.choice([0, 1], p=[0.7, 0.3]),    # is_transfer
                np.random.choice([0, 1], p=[0.8, 0.2]),    # is_cash_out
                np.random.randint(0, 24),           # hour
                np.random.choice([0, 1], p=[0.85, 0.15]),  # is_odd_hour
                np.random.choice([0, 1], p=[0.8, 0.2]),    # is_new_device
                np.random.choice([0, 1], p=[0.7, 0.3]),    # is_new_recipient
                np.random.choice([0, 1], p=[0.9, 0.1]),    # ip_flagged
                np.random.uniform(30, 1000),        # account_age_days
                np.random.randint(0, 8),            # txn_count_1h
                np.random.uniform(0, 0.5),          # merchant_risk
            ]
            for _ in range(background_samples)
        ])
        
        # Create prediction function for SHAP
        def model_predict(X):
            """Wrapper for River model prediction."""
            predictions = []
            for row in X:
                features_dict = {FEATURES[i]: float(row[i]) for i in range(len(FEATURES))}
                prob = _model.predict_proba_one(features_dict).get(1, 0.0)
                predictions.append(prob)
            return np.array(predictions)
        
        # Initialize KernelExplainer
        _shap_explainer = shap.KernelExplainer(model_predict, _shap_background_data)
        print("✓ SHAP explainer initialized")
        return True
    
    except Exception as e:
        print(f"✗ SHAP initialization failed: {e}")
        return False


def get_shap_values(features: dict) -> Optional[np.ndarray]:
    """
    Get SHAP values for a transaction.
    Returns None if SHAP unavailable or fails.
    
    SHAP values show how much each feature contributed to the prediction:
    - Positive SHAP = increases fraud probability
    - Negative SHAP = decreases fraud probability
    """
    if not _init_shap_explainer():
        return None
    
    try:
        # Convert features dict to array
        feature_array = np.array([[
            float(features.get(f, 0)) for f in FEATURES
        ]])
        
        # Compute SHAP values (this is slow ~1-2 seconds)
        shap_values = _shap_explainer.shap_values(feature_array)
        
        return shap_values[0]  # Return values for single instance
    
    except Exception as e:
        print(f"SHAP computation failed: {e}")
        return None


def get_feature_importance_shap(features: dict, ml_score: float) -> List[Tuple[str, float, str, str]]:
    """
    Get feature importance using SHAP values.
    Falls back to rule-based if SHAP unavailable.
    
    Returns:
        List of (feature_name, importance, direction, detail)
    """
    shap_values = get_shap_values(features)
    
    if shap_values is None:
        # Fallback to rule-based
        return get_feature_importance_simple(features, ml_score)
    
    # Convert SHAP values to importance scores
    contributions = []
    
    for i, feature in enumerate(FEATURES):
        shap_val = shap_values[i]
        
        if abs(shap_val) < 0.01:  # Skip negligible contributions
            continue
        
        importance = abs(shap_val)
        direction = 'increases' if shap_val > 0 else 'decreases'
        
        # Generate human-readable detail
        feature_value = features.get(feature, 0)
        if feature in ['is_odd_hour', 'is_new_device', 'is_new_recipient', 'ip_flagged', 'full_drain']:
            detail = 'Yes' if feature_value else 'No'
        elif feature == 'hour':
            detail = f'{int(feature_value)}:00'
        elif feature == 'amount_vs_median':
            detail = f'{feature_value:.1f}x usual amount'
        elif feature == 'balance_drain_pct':
            detail = f'{feature_value*100:.0f}% of balance'
        elif feature == 'txn_count_1h':
            detail = f'{int(feature_value)} transactions/hour'
        elif feature == 'account_age_days':
            detail = f'{int(feature_value)} days old'
        else:
            detail = f'{feature_value:.2f}'
        
        contributions.append((
            FEATURE_NAMES.get(feature, feature),
            importance,
            direction,
            detail
        ))
    
    # Sort by absolute importance
    contributions.sort(key=lambda x: x[1], reverse=True)
    
    return contributions[:5]  # Top 5


def get_feature_importance_simple(features: dict, ml_score: float) -> List[Tuple[str, float, str, str]]:
    """
    Simple rule-based feature importance for River models.
    Returns top contributing features without SHAP overhead.
    
    Returns:
        List of (feature_name, importance, direction, detail)
        - feature_name: human-readable name
        - importance: 0.0-1.0 contribution to fraud score
        - direction: 'increases' or 'decreases' risk
        - detail: human-readable value
    
    Used when SHAP is unavailable or too slow (<50ms requirement).
    """
    contributions = []
    
    # Rule-based importance scoring
    amount_vs_median = features.get('amount_vs_median', 1.0)
    if amount_vs_median > 2.0:
        importance = min((amount_vs_median - 2.0) / 8.0, 1.0)  # Scale 2-10x to 0-1
        contributions.append((
            FEATURE_NAMES['amount_vs_median'],
            importance,
            'increases',
            f'{amount_vs_median:.1f}x usual amount'
        ))
    
    txn_count = features.get('txn_count_1h', 0)
    if txn_count >= 4:
        importance = min((txn_count - 3) / 7.0, 1.0)  # Scale 4-10 to 0-1
        contributions.append((
            FEATURE_NAMES['txn_count_1h'],
            importance,
            'increases',
            f'{txn_count} transactions in last hour'
        ))
    
    balance_drain = features.get('balance_drain_pct', 0)
    if balance_drain > 0.5:
        importance = (balance_drain - 0.5) / 0.5  # Scale 50-100% to 0-1
        contributions.append((
            FEATURE_NAMES['balance_drain_pct'],
            importance,
            'increases',
            f'{balance_drain*100:.0f}% of balance'
        ))
    
    if features.get('is_new_device', 0):
        contributions.append((
            FEATURE_NAMES['is_new_device'],
            0.3,
            'increases',
            'First time using this device'
        ))
    
    if features.get('is_new_recipient', 0):
        contributions.append((
            FEATURE_NAMES['is_new_recipient'],
            0.25,
            'increases',
            'First payment to this account'
        ))
    
    if features.get('is_odd_hour', 0):
        contributions.append((
            FEATURE_NAMES['is_odd_hour'],
            0.2,
            'increases',
            f'Transaction at {features.get("hour", 0)}:00'
        ))
    
    if features.get('ip_flagged', 0):
        contributions.append((
            FEATURE_NAMES['ip_flagged'],
            0.35,
            'increases',
            'VPN or proxy detected'
        ))
    
    location_km = features.get('location_km', 0)
    if location_km > 50:
        importance = min(location_km / 500, 1.0)
        contributions.append((
            'Geographic Location',
            importance,
            'increases',
            f'{location_km:.0f}km from usual location'
        ))
    
    acc_age = features.get('account_age_days', 999)
    if acc_age < 90:
        importance = (90 - acc_age) / 90
        contributions.append((
            FEATURE_NAMES['account_age_days'],
            importance,
            'increases',
            f'Account only {acc_age} days old'
        ))
    
    merchant_risk = features.get('merchant_risk', 0)
    if merchant_risk > 0.3:
        contributions.append((
            FEATURE_NAMES['merchant_risk'],
            merchant_risk,
            'increases',
            f'Merchant risk: {merchant_risk:.2f}'
        ))
    
    # Sort by importance descending
    contributions.sort(key=lambda x: x[1], reverse=True)
    
    return contributions[:5]  # Top 5 contributors


def get_detailed_explanation(
    features: dict,
    ml_score: float,
    graph_score: float,
    unified_score: float,
    signals: List[str],
    use_shap: bool = False
) -> Dict:
    """
    Generate detailed explanation for audit logs and human review.
    
    Args:
        use_shap: If True, use SHAP for feature importance (slower but more accurate)
    
    Returns:
        {
            'decision_summary': str,
            'risk_breakdown': {
                'ml_contribution': float,
                'graph_contribution': float,
                'unified_score': float
            },
            'top_features': List[Dict],
            'triggered_signals': List[str],
            'recommendation': str,
            'explainability_method': str
        }
    """
    # Get feature importance (SHAP or rule-based)
    if use_shap:
        top_features = get_feature_importance_shap(features, ml_score)
        method = 'shap' if SHAP_AVAILABLE else 'rule_based'
    else:
        top_features = get_feature_importance_simple(features, ml_score)
        method = 'rule_based'
    
    # Risk breakdown (65% ML + 35% graph)
    ml_contribution = ml_score * 0.65
    graph_contribution = graph_score * 0.35
    
    # Decision summary
    if unified_score >= 0.65:
        decision = 'BLOCK'
        recommendation = 'Transaction blocked due to high fraud risk. Requires human review.'
    elif unified_score >= 0.30:
        decision = 'STEP_UP'
        recommendation = 'Additional verification required (OTP/selfie) before approval.'
    else:
        decision = 'APPROVE'
        recommendation = 'Transaction approved with low fraud risk.'
    
    return {
        'decision_summary': decision,
        'risk_breakdown': {
            'ml_contribution': round(ml_contribution, 4),
            'graph_contribution': round(graph_contribution, 4),
            'unified_score': round(unified_score, 4),
            'ml_score': round(ml_score, 4),
            'graph_score': round(graph_score, 4),
        },
        'top_features': [
            {
                'feature': name,
                'importance': round(imp, 3),
                'direction': direction,
                'detail': detail
            }
            for name, imp, direction, detail in top_features
        ],
        'triggered_signals': signals,
        'recommendation': recommendation,
        'explainability_method': method,
    }


def format_for_human_review(explanation: Dict) -> str:
    """
    Format explanation for human review queue dashboard.
    Returns plain text summary for reviewers.
    """
    lines = []
    lines.append(f"Decision: {explanation['decision_summary']}")
    lines.append(f"Risk Score: {explanation['risk_breakdown']['unified_score']:.2%}")
    lines.append(f"Explainability: {explanation.get('explainability_method', 'rule_based')}")
    lines.append("")
    lines.append("Risk Breakdown:")
    lines.append(f"  ML Model:      {explanation['risk_breakdown']['ml_score']:.2%} (65% weight)")
    lines.append(f"  Graph Network: {explanation['risk_breakdown']['graph_score']:.2%} (35% weight)")
    lines.append("")
    lines.append("Top Risk Factors:")
    for i, feat in enumerate(explanation['top_features'], 1):
        arrow = '↑' if feat['direction'] == 'increases' else '↓'
        lines.append(f"  {i}. {arrow} {feat['feature']}: {feat['detail']} (impact: {feat['importance']:.2f})")
    lines.append("")
    lines.append(f"Recommendation: {explanation['recommendation']}")
    
    return '\n'.join(lines)


def format_for_audit_log(
    transaction_id: str,
    account_id: str,
    explanation: Dict,
    features: dict
) -> Dict:
    """
    Format explanation for immutable audit log (Supabase).
    Includes all details for regulatory compliance.
    """
    return {
        'transaction_id': transaction_id,
        'account_id': account_id,
        'timestamp': features.get('timestamp', ''),
        'decision': explanation['decision_summary'],
        'risk_scores': explanation['risk_breakdown'],
        'feature_importance': explanation['top_features'],
        'triggered_signals': explanation['triggered_signals'],
        'model_version': 'v1.0',  # TODO: Add versioning
        'explainability_method': explanation.get('explainability_method', 'rule_based'),
    }


if __name__ == '__main__':
    # Test explainer with sample transaction
    test_features = {
        'amount': 50000,
        'amount_vs_median': 8.5,
        'amount_zscore': 3.2,
        'oldbalanceOrg': 60000,
        'newbalanceOrig': 10000,
        'balance_drain_pct': 0.83,
        'full_drain': 0,
        'is_transfer': 1,
        'is_cash_out': 0,
        'hour': 2,
        'is_odd_hour': 1,
        'is_new_device': 1,
        'is_new_recipient': 1,
        'ip_flagged': 0,
        'account_age_days': 45,
        'txn_count_1h': 1,
        'merchant_risk': 0.2,
        'location_km': 120,
        'user_90d_median': 5900,
    }
    
    print("=== Testing Rule-Based Explainer ===")
    explanation_simple = get_detailed_explanation(
        features=test_features,
        ml_score=0.78,
        graph_score=0.45,
        unified_score=0.66,
        signals=['high_amount', 'new_device', 'new_recipient', 'odd_hours', 'new_location'],
        use_shap=False
    )
    print(format_for_human_review(explanation_simple))
    
    if SHAP_AVAILABLE and MODEL_LOADED:
        print("\n=== Testing SHAP Explainer ===")
        explanation_shap = get_detailed_explanation(
            features=test_features,
            ml_score=0.78,
            graph_score=0.45,
            unified_score=0.66,
            signals=['high_amount', 'new_device', 'new_recipient', 'odd_hours', 'new_location'],
            use_shap=True
        )
        print(format_for_human_review(explanation_shap))
    else:
        print("\n⚠ SHAP not available. Install with: pip install shap")
