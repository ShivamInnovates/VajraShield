import json
import redis
import os

def load_redis():
    # Connect to local Redis instance on port 6380 it was started on
    r = redis.Redis(host='localhost', port=6380, db=0, decode_responses=True)
    
    filepath = 'user_profiles.json'
    if not os.path.exists(filepath):
        print(f"Error: Could not find {filepath}")
        return
        
    with open(filepath, 'r') as f:
        profiles = json.load(f)
        
    count = 0
    # Iterate through the dictionary and save each user's profile
    for user_id, profile in profiles.items():
        key = f"user:{user_id}"
        # Save as JSON string
        r.set(key, json.dumps(profile))
        count += 1
        
    print(f"Successfully loaded {count} user profiles into Redis.")

if __name__ == "__main__":
    load_redis()
