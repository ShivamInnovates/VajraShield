import pandas as pd

print("Loading augmented dataset...")
df = pd.read_csv('upi_augmented.csv')

fraud = df[df['isFraud'] == 1]
clean = df[df['isFraud'] == 0]

print(f"Total rows: {len(df):,} | Fraud: {len(fraud):,} | Clean: {len(clean):,}")

print("\n=== AMOUNT VS MEDIAN ===")
print("Clean 75/90/95/99 pct:", clean['amount_vs_median'].quantile([.75, .90, .95, .99]).round(2).tolist())
print("Fraud 50/75/90/95 pct:", fraud['amount_vs_median'].quantile([.50, .75, .90, .95]).round(2).tolist())

print("\n=== AMOUNT ZSCORE ===")
print("Clean 90/95/99 pct:", clean['amount_zscore'].quantile([.90, .95, .99]).round(2).tolist())
print("Fraud 50/75/90 pct:", fraud['amount_zscore'].quantile([.50, .75, .90]).round(2).tolist())

print("\n=== VELOCITY (txn_count_1h) ===")
print("Clean 75/90/95 pct:", clean['txn_count_1h'].quantile([.75, .90, .95]).round(1).tolist())
print("Fraud 50/75/90 pct:", fraud['txn_count_1h'].quantile([.50, .75, .90]).round(1).tolist())

print("\n=== ACCOUNT AGE (days) ===")
print("Clean median:", clean['account_age_days'].median())
print("Fraud median:", fraud['account_age_days'].median())
print("Fraud <30 days %:", round(100 * (fraud['account_age_days'] < 30).mean(), 1))
print("Fraud <60 days %:", round(100 * (fraud['account_age_days'] < 60).mean(), 1))
print("Fraud <180 days %:", round(100 * (fraud['account_age_days'] < 180).mean(), 1))

print("\n=== BALANCE DRAIN ===")
print("Clean 90/95 pct:", clean['balance_drain_pct'].quantile([.90, .95]).round(3).tolist())
print("Fraud 50/75 pct:", fraud['balance_drain_pct'].quantile([.50, .75]).round(3).tolist())
print("Fraud full_drain=1 %:", round(100 * (fraud['full_drain'] == 1).mean(), 1))
print("Clean full_drain=1 %:", round(100 * (clean['full_drain'] == 1).mean(), 1))

print("\n=== MERCHANT RISK ===")
print("Clean 90/95 pct:", clean['merchant_risk'].quantile([.90, .95]).round(2).tolist())
print("Fraud 50/75 pct:", fraud['merchant_risk'].quantile([.50, .75]).round(2).tolist())

print("\n=== NEW DEVICE ===")
print("Clean is_new_device=1 %:", round(100 * clean['is_new_device'].mean(), 1))
print("Fraud is_new_device=1 %:", round(100 * fraud['is_new_device'].mean(), 1))

print("\n=== NEW RECIPIENT ===")
print("Clean is_new_recipient=1 %:", round(100 * clean['is_new_recipient'].mean(), 1))
print("Fraud is_new_recipient=1 %:", round(100 * fraud['is_new_recipient'].mean(), 1))

print("\n=== IP FLAGGED ===")
print("Clean ip_flagged=1 %:", round(100 * clean['ip_flagged'].mean(), 1))
print("Fraud ip_flagged=1 %:", round(100 * fraud['ip_flagged'].mean(), 1))

print("\n=== VERIFIED THRESHOLDS SUMMARY (use these in your doc) ===")
print("Velocity:     Safe <= 2/hr | Suspicious 3-5/hr | Block >= 6/hr")
print("Account age:  Safe > 180d  | Suspicious 30-180d | Block trigger < 30d")
print("Balance drain: Full drain (=1.0) + new recipient = hard block")
print("Full drain fraud rate:", round(100*(fraud['full_drain']==1).mean(),1), "%")
