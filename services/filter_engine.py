import json
import redis
from datetime import datetime

def process_lane_1(transaction_payload):
    # Connect to the local Redis instance initialized for VajraShield
    try:
        r = redis.Redis(host='localhost', port=6380, db=0, decode_responses=True)
    except Exception as e:
        return {"status": "SEND_TO_LANE_2", "reason": "Redis Connection Error"}
        
    # Extract the user_id from the payload
    user_id = transaction_payload.get("user_id")
    if not user_id:
        return {"status": "SEND_TO_LANE_2", "reason": "New User - No Baseline"}
        
    # Fetch their profile from Redis
    key = f"user:{user_id}"
    try:
        profile_json = r.get(key)
    except Exception as e:
        return {"status": "SEND_TO_LANE_2", "reason": "Redis Fetch Error"}
    
    # If the user doesn't exist
    if not profile_json:
        return {"status": "SEND_TO_LANE_2", "reason": "New User - No Baseline"}
        
    profile = json.loads(profile_json)
    
    # 1. Amount Baseline Check
    payload_amount = transaction_payload.get("amount", float('inf'))
    if payload_amount > profile.get("max_amount", 0):
        return {"status": "SEND_TO_LANE_2", "reason": "Amount exceeds known maximum"}
        
    # 2. Time Pattern Check
    timestamp_str = transaction_payload.get("timestamp")
    if not timestamp_str:
        return {"status": "SEND_TO_LANE_2", "reason": "Missing timestamp"}
    try:
        # Assuming ISO format like "2023-10-27T10:30:00Z"
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        hour = dt.hour
    except ValueError:
        return {"status": "SEND_TO_LANE_2", "reason": "Invalid timestamp format"}
        
    if hour not in profile.get("usual_hours", []):
        return {"status": "SEND_TO_LANE_2", "reason": "Transaction time outside usual hours"}
    
    # 3. Device Fingerprint Check
    payload_device_id = transaction_payload.get("device_id")
    if payload_device_id != profile.get("device_id"):
        return {"status": "SEND_TO_LANE_2", "reason": "New device detected"}
        
    # 4. Geographic Location Check
    payload_location = transaction_payload.get("location")
    if payload_location != profile.get("city"):
        return {"status": "SEND_TO_LANE_2", "reason": "Location mismatch"}
        
    # 5. Recipient Check
    recipient_known = transaction_payload.get("recipient_known")
    if recipient_known != 1:
        return {"status": "SEND_TO_LANE_2", "reason": "Recipient unknown"}
        
    # 6. Transaction Velocity Check
    velocity_score = transaction_payload.get("velocity_score", 1.0)
    if velocity_score >= 0.5:
        return {"status": "SEND_TO_LANE_2", "reason": "High transaction velocity"}
        
    # 7. Merchant Risk Check
    merchant_risk = transaction_payload.get("merchant_risk", 1.0)
    if merchant_risk >= 0.5:
        return {"status": "SEND_TO_LANE_2", "reason": "High merchant risk"}
        
    # 8. Account Age Check
    account_age_days = transaction_payload.get("account_age_days", 0)
    if account_age_days <= 30:
        return {"status": "SEND_TO_LANE_2", "reason": "Account age too low"}
        
    # 9. IP Address Reputation Check
    ip_address = transaction_payload.get("ip_address")
    if ip_address != profile.get("ip_address"):
        return {"status": "SEND_TO_LANE_2", "reason": "IP address mismatch"}
        
    # Passes all checks
    return {"status": "LANE_1_APPROVED", "reason": "Routine transaction", "decision_time": "<5ms"}
