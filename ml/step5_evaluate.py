import pandas as pd
import joblib
from river.metrics import ClassificationReport, ROCAUC, ConfusionMatrix

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

print("Loading test set...")
test_df = pd.read_csv('test_df.csv')
print(f"Test rows: {len(test_df):,} | Fraud: {test_df['isFraud'].sum():,}")

print("Loading trained model...")
model = joblib.load('vajrashield_model_warmed.pkl')
print("Model loaded. Starting evaluation...\n")

report = ClassificationReport()
roc    = ROCAUC()
cm     = ConfusionMatrix()

for i, (_, row) in enumerate(test_df.iterrows()):
    x    = {f: float(row[f]) for f in FEATURES}
    y    = int(row['isFraud'])
    pred = model.predict_one(x)
    prob = model.predict_proba_one(x).get(1, 0.0)

    report.update(y, pred)
    roc.update(y, prob)
    cm.update(y, pred)

    if i % 100_000 == 0:
        print(f"  Evaluated {i:,} / {len(test_df):,}")

print("\n" + "="*55)
print("RESULTS — write these down for your presentation")
print("="*55)
print(report)

# Handle scipy compatibility issue with trapz -> trapezoid
try:
    roc_auc_score = roc.get()
except AttributeError:
    # Fallback: scipy.integrate.trapz was renamed to trapezoid
    # Calculate manually from confusion matrix
    print("Note: ROC-AUC calculation skipped due to scipy compatibility issue")
    roc_auc_score = None

if roc_auc_score is not None:
    print(f"ROC-AUC: {roc_auc_score:.4f}")
    
print(f"\nConfusion Matrix:")
print(cm)

# Extract key numbers cleanly from confusion matrix
# In River 0.21.0, use direct methods
try:
    # Get values from confusion matrix using built-in methods
    tp = cm.total_true_positives
    fp = cm.total_false_positives
    fn = cm.total_false_negatives
    tn = cm.total_true_negatives
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    print("\n" + "="*55)
    print("KEY NUMBERS FOR YOUR DOC AND SLIDES:")
    print("="*55)
    print(f"  Fraud Precision:  {precision:.3f}  ({round(precision*100,1)}%)")
    print(f"  Fraud Recall:     {recall:.3f}  ({round(recall*100,1)}%)")
    print(f"  Fraud F1 Score:   {f1:.3f}  ({round(f1*100,1)}%)")
    if roc_auc_score is not None:
        print(f"  ROC-AUC:          {roc_auc_score:.4f}")
    print(f"\n  True Positives  (fraud caught):    {tp:,}")
    print(f"  False Positives (clean blocked):   {fp:,}")
    print(f"  False Negatives (fraud missed):    {fn:,}")
    print(f"\n  False Positive Rate: {round(fp/(fp+tn)*100,2)}% of clean transactions wrongly blocked")
    print("="*55)
    print("\nIMPORTANT: Use these exact numbers in your presentation.")
    print("Do NOT use made-up numbers after running this.")
except Exception as e:
    print(f"\nNote: Could not extract detailed stats: {e}")
    print("Main metrics are shown above in the classification report.")
