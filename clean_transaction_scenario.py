import json
import time
import urllib.request
import urllib.error

API_URL = "http://localhost:8001/api/v1/transactions"

def send_transaction(payload, description):
    print(f"\n--- [CLEAN SCENARIO]: {description} ---")
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer dev-token'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"System Decision: {result.get('decision')}")
            print(f"Unified Risk Score: {result.get('unified_score')}")
            if result.get('signals'):
                print(f"Triggered Signals: {', '.join(result.get('signals'))}")
            else:
                print("Triggered Signals: None (Perfectly Clean)")
            return result
    except urllib.error.URLError as e:
        print(f"Error: {e}")
        try:
            print(e.read().decode('utf-8'))
        except:
            pass
        return None

def main():
    print("Initiating pristine transaction simulation to verify baseline ML behavior...\n")
    base_time = int(time.time())

    # Scenario 1: Small everyday purchase (Groceries)
    t1 = {
        "txn_id": f"TXN_{base_time}_C1",
        "user_id": "U_VERIFIED_USER_99",
        "amount": 145.50,
        "merchant": "Local_Grocery_Store",
        "recipient_id": "M_GROCERY_9912",
        "device_id": "DEV_TRUSTED_IPHONE",
        "location": "Pune, India",
        "timestamp": str(base_time),
        "velocity_score": 0.01,
        "recipient_known": 1,
        "merchant_risk": 0.05,
        "account_age_days": 365,
        "ip_address": "192.168.0.50"
    }
    send_transaction(t1, "Everyday Grocery Purchase")
    time.sleep(2)

    # Scenario 2: Routine bill payment
    t2 = {
        "txn_id": f"TXN_{base_time+2}_C2",
        "user_id": "U_VERIFIED_USER_99",
        "amount": 1250.00,
        "merchant": "Electric_Utility_Board",
        "recipient_id": "M_UTILITY_MAHA",
        "device_id": "DEV_TRUSTED_IPHONE",
        "location": "Pune, India",
        "timestamp": str(base_time + 86400),
        "velocity_score": 0.05,
        "recipient_known": 1,
        "merchant_risk": 0.10,
        "account_age_days": 365,
        "ip_address": "192.168.0.50"
    }
    send_transaction(t2, "Monthly Utility Bill")
    time.sleep(2)

    # Scenario 3: Trusted peer transfer
    t3 = {
        "txn_id": f"TXN_{base_time+4}_C3",
        "user_id": "U_VERIFIED_USER_99",
        "amount": 500.00,
        "merchant": "Peer_Transfer",
        "recipient_id": "U_TRUSTED_SIBLING",
        "device_id": "DEV_TRUSTED_IPHONE",
        "location": "Pune, India",
        "timestamp": str(base_time + 172800),
        "velocity_score": 0.03,
        "recipient_known": 1,
        "merchant_risk": 0.02,
        "account_age_days": 365,
        "ip_address": "192.168.0.50"
    }
    send_transaction(t3, "Transfer to Trusted Contact")

    print("\nClean transaction simulation complete. You should see 0% risk scores and APPROVE on the dashboard.")

if __name__ == "__main__":
    main()
