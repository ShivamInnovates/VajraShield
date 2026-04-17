import requests
import json
import time

BASE_URL = "http://localhost:8001/api/v1"

def login():
    print("--- Step 1: Authentication ---")
    resp = requests.post(f"{BASE_URL}/auth/login", params={
        "email": "shivaji@vajrashield.in",
        "password": "vajra@analyst2026"
    })
    token = resp.json().get("access_token")
    print(f"[OK] Analyst 'Shivaji' Authenticated.\n")
    return token

def send_txn(token, scenario_name, payload):
    print(f"--- Testing Scenario: {scenario_name} ---")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/transactions", json=payload, headers=headers)
    
    if resp.status_code != 200:
        print(f"[ERROR] {resp.status_code}: {resp.text}\n")
        return
        
    res = resp.json()
    print(f"Decision:  {res['decision']}")
    print(f"Lane:      {res['lane']} ({res.get('latency_budget')})")
    print(f"ML Score:  {res.get('ml_score', 'N/A')}")
    print(f"Graph Score: {res.get('graph_score', 'N/A')}")
    print(f"Signals:   {', '.join(res.get('signals', []))}")
    print(f"Latency:   {res.get('actual_latency_ms')} ms")
    print(f"--------------------------------------------\n")
    return res

if __name__ == "__main__":
    token = login()
    
    # SCENARIO A: The Safe Path (Should trigger Lane 1)
    # Rules: Amount <= 2x median, known device, usual location, not odd hour.
    send_txn(token, "A: SAFE (Low Risk)", {
        "user_id": "USER_999",
        "amount": 500.0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": "DEVICE_KNOWN_45",
        "location": "MUMBAI_POS_1",
        "recipient_known": 1,
        "velocity_score": 0.1,
        "merchant_risk": 0.05,
        "account_age_days": 180,
        "ip_address": "192.168.1.45",
        "merchant": "Starbucks_MUM",
        "recipient_id": "STB_123"
    })

    # SCENARIO B: The Uncertain Path (Should trigger Lane 2)
    # Rules: New recipient, higher amount (but not 10x), uncertain signals.
    # This triggers the Deep Analysis (ML + Graph)
    send_txn(token, "B: SUSPICIOUS (Deep Analysis)", {
        "user_id": "USER_777",
        "amount": 25000.0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": "DEVICE_NEW_789",
        "location": "DELHI_POS_9",
        "recipient_known": 0,
        "velocity_score": 0.4,
        "merchant_risk": 0.45,
        "account_age_days": 45,
        "ip_address": "45.12.99.1",
        "merchant": "Electronics_Store_DL",
        "recipient_id": "UNKN_99"
    })

    # SCENARIO C: The Threat Path (Should trigger Lane 3)
    # Rules: Blacklisted IP / velocity burst / 10x amount.
    send_txn(token, "C: ATTACK (Hard Block)", {
        "user_id": "USER_111",
        "amount": 500000.0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": "DEVICE_FRAUD_666",
        "location": "LAGOS_NG_1",
        "recipient_known": 0,
        "velocity_score": 0.9,
        "merchant_risk": 0.95,
        "account_age_days": 5,
        "ip_address": "1.1.1.1", # Example "blacklisted" IP check
        "merchant": "Global_Jewelry",
        "recipient_id": "FRAUD_ACC_99"
    })
