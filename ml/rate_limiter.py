"""
rate_limiter.py
===============
Per-IP and Per-VPA Rate Limiting with Redis
Prevents DDoS and brute force attacks at API Gateway level.

Architecture:
  - Redis sliding window counters
  - Per-IP: 100 req/min, 1000 req/hour
  - Per-VPA (account): 50 req/min, 500 req/hour
  - Burst allowance: 20 req/sec for legitimate spikes
  
Production:
  - Deploy at API Gateway (Kong/Nginx)
  - Use Redis Cluster for HA
  - Circuit breaker for Redis failures (fail open)
"""

import redis
import time
from typing import Tuple, Optional
import os
from dotenv import load_dotenv

load_dotenv()

redis_pool = redis.ConnectionPool(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True,
    max_connections=50
)

def get_redis_client():
    """Get Redis client with circuit breaker."""
    try:
        return redis.Redis(connection_pool=redis_pool)
    except:
        return None


# Rate limit thresholds
LIMITS = {
    'ip_per_minute': 100,
    'ip_per_hour': 1000,
    'vpa_per_minute': 50,
    'vpa_per_hour': 500,
    'burst_per_second': 20,
}


def check_rate_limit(
    ip: str,
    vpa: Optional[str] = None
) -> Tuple[bool, str, int]:
    """
    Check if request should be rate limited.
    
    Returns:
        (allowed, reason, retry_after_seconds)
        - allowed: True if request allowed, False if rate limited
        - reason: Human-readable reason for rate limit
        - retry_after_seconds: How long to wait before retry
    """
    r = get_redis_client()
    if r is None:
        return True, '', 0  # Fail open if Redis down
    
    now = int(time.time())
    
    try:
        # Check burst limit (per second)
        burst_key = f'ratelimit:burst:{ip}:{now}'
        burst_count = r.incr(burst_key)
        r.expire(burst_key, 2)  # 2 second TTL
        
        if burst_count > LIMITS['burst_per_second']:
            return False, 'Too many requests per second', 1
        
        # Check IP per minute
        minute_key = f'ratelimit:ip:minute:{ip}:{now // 60}'
        minute_count = r.incr(minute_key)
        r.expire(minute_key, 120)  # 2 minute TTL
        
        if minute_count > LIMITS['ip_per_minute']:
            return False, f'IP rate limit: {LIMITS["ip_per_minute"]} req/min', 60
        
        # Check IP per hour
        hour_key = f'ratelimit:ip:hour:{ip}:{now // 3600}'
        hour_count = r.incr(hour_key)
        r.expire(hour_key, 7200)  # 2 hour TTL
        
        if hour_count > LIMITS['ip_per_hour']:
            return False, f'IP rate limit: {LIMITS["ip_per_hour"]} req/hour', 3600
        
        # Check VPA (account) limits if provided
        if vpa:
            vpa_minute_key = f'ratelimit:vpa:minute:{vpa}:{now // 60}'
            vpa_minute_count = r.incr(vpa_minute_key)
            r.expire(vpa_minute_key, 120)
            
            if vpa_minute_count > LIMITS['vpa_per_minute']:
                return False, f'Account rate limit: {LIMITS["vpa_per_minute"]} req/min', 60
            
            vpa_hour_key = f'ratelimit:vpa:hour:{vpa}:{now // 3600}'
            vpa_hour_count = r.incr(vpa_hour_key)
            r.expire(vpa_hour_key, 7200)
            
            if vpa_hour_count > LIMITS['vpa_per_hour']:
                return False, f'Account rate limit: {LIMITS["vpa_per_hour"]} req/hour', 3600
        
        return True, '', 0
    
    except Exception as e:
        print(f"Rate limiter error: {e}")
        return True, '', 0  # Fail open


def get_rate_limit_status(ip: str, vpa: Optional[str] = None) -> dict:
    """
    Get current rate limit status for monitoring.
    
    Returns:
        {
            'ip_minute': (current, limit),
            'ip_hour': (current, limit),
            'vpa_minute': (current, limit),
            'vpa_hour': (current, limit),
        }
    """
    r = get_redis_client()
    if r is None:
        return {}
    
    now = int(time.time())
    status = {}
    
    try:
        # IP limits
        minute_key = f'ratelimit:ip:minute:{ip}:{now // 60}'
        hour_key = f'ratelimit:ip:hour:{ip}:{now // 3600}'
        
        status['ip_minute'] = (
            int(r.get(minute_key) or 0),
            LIMITS['ip_per_minute']
        )
        status['ip_hour'] = (
            int(r.get(hour_key) or 0),
            LIMITS['ip_per_hour']
        )
        
        # VPA limits
        if vpa:
            vpa_minute_key = f'ratelimit:vpa:minute:{vpa}:{now // 60}'
            vpa_hour_key = f'ratelimit:vpa:hour:{vpa}:{now // 3600}'
            
            status['vpa_minute'] = (
                int(r.get(vpa_minute_key) or 0),
                LIMITS['vpa_per_minute']
            )
            status['vpa_hour'] = (
                int(r.get(vpa_hour_key) or 0),
                LIMITS['vpa_per_hour']
            )
        
        return status
    
    except:
        return {}


if __name__ == '__main__':
    # Test rate limiter
    test_ip = '192.168.1.100'
    test_vpa = 'user@bank'
    
    print("Testing rate limiter...")
    for i in range(5):
        allowed, reason, retry = check_rate_limit(test_ip, test_vpa)
        print(f"Request {i+1}: {'✓ Allowed' if allowed else f'✗ Blocked - {reason}'}")
        time.sleep(0.1)
    
    status = get_rate_limit_status(test_ip, test_vpa)
    print(f"\nRate limit status: {status}")
