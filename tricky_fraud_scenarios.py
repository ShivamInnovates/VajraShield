import requests
import json
import time

BASE_URL = "http://localhost:8001/api/v1"

def login():
    resp = requests.post(f"{BASE_URL}/auth/login", params={
        "email": "shivaji@vajrashield.in",
        "password": "vajra@analyst2026"
    })
    return resp.json().get("access_token")

def send_txn(token, scenario_name, payload):
    print(f"--- [SCENARIO]: {scenario_name} ---")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/transactions", json=payload, headers=headers)
    
    if resp.status_code != 200:
        print(f"[ERROR] {resp.status_code}: {resp.text}\n")
        return
        
    res = resp.json()
    print(f"System Decision: {res['decision']}")
    print(f"Triggered Signals: {', '.join(res.get('signals', []))}")
    print(f"Analyst Message: {res.get('explanation', {}).get('message')}")
    print(f"--------------------------------------------\n")
    time.sleep(1) # Delay for visual effect on dashboard
    return res

if __name__ == "__main__":
    token = login()
    print("VajraShield Red-Team Simulation Initialized.\n")

    # 1. SCENARIO: THE "SMURFING" ATTACK (Structure/Velocity)
    # Goal: Break the velocity threshold by sending many small txns.
    print("Simulating Velocity Burst...")
    for i in range(12):
        send_txn(token, f"Smurfing Attempt #{i+1}", {
            "user_id": "C_VEL_001",
            "amount": 5.0,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "device_id": "DEV_VEL_1",
            "location": "MUMBAI_HOME",
            "recipient_id": f"RECIP_VAR_{i}",
            "ip_address": "122.1.2.3",
            "merchant_risk": 0.1,
            "account_age_days": 500,
            "recipient_known": 0,
            "velocity_score": 0.8 # High internal velocity
        })

    # 2. SCENARIO: THE "GEO-JUMP" (Account Takeover)
    # Goal: 3 AM transaction from a new device 1000km away.
    send_txn(token, "Geo-Jump (Account Takeover)", {
        "user_id": "C_RAHUL_001",
        "amount": 1500.0,
        "timestamp": time.strftime("%Y-%m-%dT03:15:00Z"),
        "device_id": "DEV_NEW_999",
        "location": "LOCATION_CHANDIGARH",
        "recipient_id": "UNKNOWN_RECI",
        "ip_address": "157.1.1.9",
        "merchant_risk": 0.2,
        "account_age_days": 400,
        "recipient_known": 0,
        "velocity_score": 0.0,  # required field — was missing, causing 422
        "location_km": 1200
    })

    # 3. SCENARIO: THE "FULL DRAIN" EXIT
    # Goal: New account trying to empty balance immediately.
    send_txn(token, "Full Drain (New Account)", {
        "user_id": "NEW_USER_888",
        "amount": 9999.0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": "DEV_PHONE_8",
        "location": "MUMBAI_POS_1",
        "recipient_id": "FOREIGN_ACCOUNT_X",
        "ip_address": "103.11.1.1",
        "merchant_risk": 0.6,
        "account_age_days": 2, 
        "velocity_score": 0.1,
        "recipient_known": 0
    })

    # 4. SCENARIO: THE "STEALTH VPN" MASKING
    # Goal: Use a flagged/VPN IP to hide location.
    send_txn(token, "Stealth VPN Masking", {
        "user_id": "C_CLEAN_001",
        "amount": 500.0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": "DEV_KNOWN_A",
        "location": "MUMBAI_HOME",
        "recipient_id": "RECI_99",
        "ip_address": "10.20.30.40", # Flagged VPN IP in Demo Data
        "merchant_risk": 0.1,
        "account_age_days": 300,
        "velocity_score": 0.0,
        "recipient_known": 1
    })

    # 5. SCENARIO: THE "MERCHANT HONEYPOT"
    # Goal: Multiple conflicting signals targeting a Risky Merchant.
    send_txn(token, "Merchant Honeypot Attack", {
        "user_id": "C_RAHUL_001",
        "amount": 8000.0,
        "timestamp": time.strftime("%Y-%m-%dT22:45:00Z"),
        "device_id": "DEV_KNOWN_A",
        "location": "MUMBAI_HOME",
        "recipient_id": "RECIP_FRAUD_A", # On Watchlist
        "ip_address": "122.1.1.1",
        "merchant": "Unverified_Crypto_Exch",
        "merchant_risk": 0.9, # High Risk
        "account_age_days": 400,
        "velocity_score": 0.4,
        "recipient_known": 0
    })

    print("\nRed-Team Simulation Complete. Check Dashboard for live updates.")
