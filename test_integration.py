import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

print("Step 1: Logging in as Shivaji...")
login_res = requests.post(f"{BASE_URL}/auth/login", params={
    "email": "shivaji@vajrashield.in",
    "password": "vajra@analyst2026"
})
token = login_res.json().get("access_token")
print(f"[OK] Token Received: {token[:20]}...")

print("\nStep 2: Sending transaction to ML Engine...")
txn_data = {
    "user_id": "user_789",
    "amount": 9500.0,
    "timestamp": "2026-04-17T00:05:00Z",
    "device_id": "dev_999",
    "location": "Mumbai, IN",
    "recipient_known": 0,
    "velocity_score": 0.8,
    "merchant_risk": 0.4,
    "account_age_days": 2,
    "ip_address": "192.168.1.10",
    "recipient_id": "rec_unknown"
}

res = requests.post(
    f"{BASE_URL}/transactions",
    headers={"Authorization": f"Bearer {token}"},
    json=txn_data
)

print("\nStep 3: Prediction Result:")
print(json.dumps(res.json(), indent=2))
