import pandas as pd
import joblib
from river.forest import ARFClassifier
from river.drift import ADWIN

# Features the model will learn from
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

print("Loading augmented dataset...")
df = pd.read_csv('upi_augmented.csv')
print(f"Total rows: {len(df):,}")

# CRITICAL: Sort by time (step = hour). Never use random split on fraud data.
# Random split leaks future data into training and inflates accuracy.
df = df.sort_values('step').reset_index(drop=True)

split_idx = int(len(df) * 0.80)
train_df  = df.iloc[:split_idx]
test_df   = df.iloc[split_idx:]

print(f"Train: {len(train_df):,} rows | Fraud in train: {train_df['isFraud'].sum():,}")
print(f"Test:  {len(test_df):,}  rows | Fraud in test:  {test_df['isFraud'].sum():,}")

# Sample training set: keep ALL fraud rows + 10% of clean rows
# This keeps training fast while preserving all fraud signal
fraud_rows   = train_df[train_df['isFraud'] == 1]
clean_sample = train_df[train_df['isFraud'] == 0].sample(frac=0.10, random_state=42)
train_sample = pd.concat([fraud_rows, clean_sample]).sample(frac=1, random_state=42).reset_index(drop=True)

print(f"\nSampled training set: {len(train_sample):,} rows")
print(f"Fraud rows:           {train_sample['isFraud'].sum():,}")
print(f"Clean rows:           {(train_sample['isFraud']==0).sum():,}")

# Save test set for evaluation later
test_df.to_csv('test_df.csv', index=False)
print(f"\nTest set saved to data/test_df.csv")

# Initialize River ARFClassifier with ADWIN drift detector
# n_models=10 means 10 trees — good balance of speed vs accuracy
model = ARFClassifier(
    n_models=10,
    drift_detector=ADWIN(),
    seed=42
)

print("\nStarting warm-up training...")
print("Progress shown every 50,000 rows")
print("Estimated time: 20-40 minutes\n")

for i, (_, row) in enumerate(train_sample.iterrows()):
    x = {f: float(row[f]) for f in FEATURES}
    y = int(row['isFraud'])
    model.learn_one(x, y)

    if i % 50_000 == 0:
        pct = round(i / len(train_sample) * 100, 1)
        print(f"  {i:,} / {len(train_sample):,}  ({pct}%)")

print(f"\nTraining complete. {len(train_sample):,} transactions learned.")

# Save the trained model
joblib.dump(model, 'vajrashield_model_warmed.pkl')
print("Model saved: ml/vajrashield_model_warmed.pkl")
print("\nNext step: run python step5_evaluate.py")
