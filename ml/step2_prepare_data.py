import pandas as pd
import numpy as np
import random
from faker import Faker

fake = Faker('en_IN')
random.seed(42)
np.random.seed(42)

print("Loading PaySim dataset...")
df = pd.read_csv('PS_20174392719_1491204439457_log.csv')
print(f"Total rows loaded: {len(df):,}")
print(f"Columns: {df.columns.tolist()}")

# Keep only TRANSFER and CASH_OUT — fraud ONLY happens in these two types
df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].copy()
print(f"Rows after filter (TRANSFER + CASH_OUT only): {len(df):,}")
print(f"Fraud count: {df['isFraud'].sum():,}")


def augment(row):
    f = int(row['isFraud'])
    hour = int(row['step']) % 24

    return {
        # Original PaySim fields — keep all
        'step':             row['step'],
        'type':             row['type'],
        'amount':           row['amount'],
        'nameOrig':         row['nameOrig'],
        'nameDest':         row['nameDest'],
        'oldbalanceOrg':    row['oldbalanceOrg'],
        'newbalanceOrig':   row['newbalanceOrig'],
        'oldbalanceDest':   row['oldbalanceDest'],
        'newbalanceDest':   row['newbalanceDest'],
        'isFraud':          f,            # NEVER CHANGE THIS

        # UPI-specific augmented fields
        # device_id — fraudsters more likely on new/unknown devices
        'device_id': fake.uuid4(),

        # ip_address — fraudsters more likely on flagged/proxy IPs
        'ip_address': (
            f"10.{random.randint(0,5)}.{random.randint(0,5)}.{random.randint(1,30)}"
            if f else fake.ipv4_private()
        ),

        'phone': f"91{fake.msisdn()[:10]}",
        'hour':  hour,

        # is_odd_hour — 1AM to 5AM = suspicious
        'is_odd_hour': int(1 <= hour <= 5),

        # is_new_device — fraud: 60% new device, clean: 10% new device
        'is_new_device': random.choices(
            [0, 1], weights=[40, 60] if f else [90, 10]
        )[0],

        # is_new_recipient — fraud: 80% new, clean: 25% new
        'is_new_recipient': random.choices(
            [0, 1], weights=[20, 80] if f else [75, 25]
        )[0],

        # ip_flagged — fraud: 30% flagged, clean: 2% flagged
        'ip_flagged': random.choices(
            [0, 1], weights=[70, 30] if f else [98, 2]
        )[0],

        # account_age_days — fraud median = 59 days (from our data)
        'account_age_days': (
            random.randint(1, 60) if (f and random.random() < 0.5)
            else random.randint(30, 2000)
        ),

        # txn_count_1h — fraud median = 6, clean median = 1.5 (from our data)
        'txn_count_1h': (
            int(np.random.poisson(6)) if f
            else int(np.random.poisson(1.5))
        ),

        # merchant_risk — fraud targets riskier merchants
        'merchant_risk': (
            round(random.uniform(0.5, 1.0), 2) if f
            else round(random.uniform(0.0, 0.5), 2)
        ),

        # balance_drain_pct — how much of account was emptied
        'balance_drain_pct': round(
            (row['oldbalanceOrg'] - row['newbalanceOrig']) /
            max(row['oldbalanceOrg'], 1), 4
        ),
    }


print("Augmenting dataset with UPI fields... (3-5 minutes)")
augmented = df.apply(augment, axis=1, result_type='expand')

print("Computing per-user amount baselines...")
stats = augmented.groupby('nameOrig')['amount'].agg(
    user_median='median',
    user_std='std'
).reset_index()
stats['user_std'] = stats['user_std'].fillna(1.0)
stats['user_std'] = stats['user_std'].replace(0, 1.0)

augmented = augmented.merge(stats, on='nameOrig', how='left')

# Derived features
augmented['amount_vs_median'] = augmented['amount'] / augmented['user_median'].clip(lower=1)
augmented['amount_zscore']    = (augmented['amount'] - augmented['user_median']) / augmented['user_std'].clip(lower=1)
augmented['full_drain']       = ((augmented['newbalanceOrig'] == 0) & (augmented['oldbalanceOrg'] > 0)).astype(int)
augmented['is_transfer']      = (augmented['type'] == 'TRANSFER').astype(int)
augmented['is_cash_out']      = (augmented['type'] == 'CASH_OUT').astype(int)

# Save
augmented.to_csv('upi_augmented.csv', index=False)

print(f"\nDone. Saved to upi_augmented.csv")
print(f"Total rows: {len(augmented):,}")
print(f"\nFraud distribution:")
print(augmented['isFraud'].value_counts())
print(f"\nFraud rate: {augmented['isFraud'].mean()*100:.3f}%")
