import json
import sys
import copy
from services.filter_engine import process_lane_1

def run_tests():
    # Base Clean Payload for USER_0000
    base_payload = {
        "user_id": "USER_0000",
        "amount": 50.00,
        "timestamp": "2026-04-14T09:30:00",
        "device_id": "bab8c968",
        "location": "Delhi",
        "recipient_known": 1,
        "velocity_score": 0.1,
        "merchant_risk": 0.05,
        "account_age_days": 95,
        "ip_address": "136.168.124.16",
        "merchant": "Uber"
    }

    print("="*60)
    print("VajraShield Lane 1 Filter Engine - Test Suite")
    print("="*60)

    # Test 1: The Routine Bill
    print("\n--- Test 1: The Routine Bill ---")
    payload_1 = copy.deepcopy(base_payload)
    result_1 = process_lane_1(payload_1)
    print("Result:", json.dumps(result_1, indent=2))

    # Test 2: The Midnight Velocity Attack
    print("\n--- Test 2: The Midnight Velocity Attack ---")
    payload_2 = copy.deepcopy(base_payload)
    payload_2["timestamp"] = "2026-04-14T03:30:00"
    payload_2["velocity_score"] = 0.9
    result_2 = process_lane_1(payload_2)
    print("Result:", json.dumps(result_2, indent=2))

    # Test 3: The Account Takeover
    print("\n--- Test 3: The Account Takeover ---")
    payload_3 = copy.deepcopy(base_payload)
    payload_3["location"] = "Jaipur"
    payload_3["device_id"] = "HACKER_DEV_99"
    payload_3["ip_address"] = "192.168.1.1"
    result_3 = process_lane_1(payload_3)
    print("Result:", json.dumps(result_3, indent=2))

if __name__ == "__main__":
    run_tests()
