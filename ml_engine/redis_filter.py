"""
redis_filter.py
===============
Layer 3.5 Filter Engine with Redis Cluster (3-node sentinel)
Handles 9-signal checks with <5ms latency using Redis lookups.

Architecture:
  - Redis Cluster: 3-node sentinel for HA
  - Blacklists: IP, device, recipient (Redis Sets)
  - Velocity: txn_count_1h (Redis sorted sets with TTL)
  - User baselines: 90d median amounts (Redis Hash)
  - Device tracking: 30d usage counts (Redis Hash)

Production setup:
  - Redis Sentinel for failover
  - Read replicas for load distribution
  - Circuit breaker for Redis failures
"""

import redis
from typing import Dict, Tuple, Optional
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Redis connection pool (production: use Sentinel)
# For now: single Redis instance, upgrade to Sentinel in production
redis_pool = redis.ConnectionPool(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True,
    max_connections=50
)

def get_redis_client():
    """Get Redis client from pool with circuit breaker."""
    try:
        return redis.Redis(connection_pool=redis_pool)
    except redis.ConnectionError:
        # Circuit breaker: if Redis down, fail open (allow transaction)
        return None


# ── Blacklist Management ──────────────────────────────────────────────────────

def is_ip_blacklisted(ip: str) -> bool:
    """Check if IP is on blacklist (Redis Set)."""
    r = get_redis_client()
    if r is None:
        return False  # Fail open if Redis down
    try:
        return r.sismember('blacklist:ip', ip)
    except:
        return False


def is_device_blacklisted(device_id: str) -> bool:
    """Check if device is on blacklist (Redis Set)."""
    r = get_redis_client()
    if r is None:
        return False
    try:
        return r.sismember('blacklist:device', device_id)
    except:
        return False


def is_recipient_watchlisted(recipient_id: str) -> bool:
    """Check if recipient is on fraud watchlist (Redis Set)."""
    r = get_redis_client()
    if r is None:
        return False
    try:
        return r.sismember('watchlist:recipient', recipient_id)
    except:
        return False


def add_to_blacklist(list_type: str, value: str, ttl: int = None):
    """
    Add entry to blacklist.
    list_type: 'ip', 'device', 'recipient'
    ttl: optional expiry in seconds (None = permanent)
    """
    r = get_redis_client()
    if r is None:
        return
    try:
        r.sadd(f'blacklist:{list_type}', value)
        if ttl:
            r.expire(f'blacklist:{list_type}', ttl)
    except:
        pass


# ── Velocity Tracking ─────────────────────────────────────────────────────────

def get_txn_count_1h(account_id: str) -> int:
    """
    Get transaction count in last 1 hour using Redis Sorted Set.
    Key: velocity:{account_id}
    Score: unix timestamp
    """
    r = get_redis_client()
    if r is None:
        return 0
    try:
        now = time.time()
        one_hour_ago = now - 3600
        key = f'velocity:{account_id}'
        
        # Remove old entries (older than 1 hour)
        r.zremrangebyscore(key, 0, one_hour_ago)
        
        # Count remaining entries
        count = r.zcard(key)
        return count
    except:
        return 0


def record_transaction(account_id: str):
    """Record transaction timestamp for velocity tracking and increment total count."""
    r = get_redis_client()
    if r is None:
        return
    try:
        now = time.time()
        key = f'velocity:{account_id}'
        
        # Add current transaction with timestamp as score for velocity
        r.zadd(key, {str(now): now})
        r.expire(key, 7200)

        # Increment total transaction count for Cold Start detection
        r.hincrby('user:stats', f'{account_id}:total_txns', 1)
    except:
        pass


def get_user_total_txn_count(account_id: str) -> int:
    """Get total transaction count for a user (Cold Start detection)."""
    r = get_redis_client()
    if r is None:
        return 0
    try:
        count = r.hget('user:stats', f'{account_id}:total_txns')
        return int(count) if count else 0
    except:
        return 0


def is_cold_start(account_id: str) -> bool:
    """Check if user is in cold start phase (< 10 transactions)."""
    return get_user_total_txn_count(account_id) < 10


# ── User Baseline Tracking ────────────────────────────────────────────────────

def get_user_median(account_id: str) -> float:
    """
    Get user's 90-day rolling median transaction amount.
    In production: computed daily by batch job, stored in Redis Hash.
    """
    r = get_redis_client()
    if r is None:
        return 0.0
    try:
        median = r.hget('user:median', account_id)
        return float(median) if median else 0.0
    except:
        return 0.0


def set_user_median(account_id: str, median: float):
    """Update user's 90-day median (called by daily batch job)."""
    r = get_redis_client()
    if r is None:
        return
    try:
        r.hset('user:median', account_id, median)
    except:
        pass


# ── Device Tracking ───────────────────────────────────────────────────────────

def get_device_uses_30d(device_id: str) -> int:
    """
    Get how many times device was seen in last 30 days.
    Stored in Redis Hash with daily batch updates.
    """
    r = get_redis_client()
    if r is None:
        return 99  # Assume known device if Redis down
    try:
        uses = r.hget('device:uses_30d', device_id)
        return int(uses) if uses else 0
    except:
        return 99


def increment_device_use(device_id: str):
    """Increment device usage counter."""
    r = get_redis_client()
    if r is None:
        return
    try:
        r.hincrby('device:uses_30d', device_id, 1)
    except:
        pass


# ── IP Reputation ─────────────────────────────────────────────────────────────

def is_ip_flagged(ip: str) -> bool:
    """
    Check if IP is flagged as VPN/proxy/suspicious.
    In production: integrate with IP reputation service (MaxMind, IPQualityScore).
    """
    r = get_redis_client()
    if r is None:
        return False
    try:
        return r.sismember('flagged:ip', ip)
    except:
        return False


def flag_ip(ip: str, ttl: int = 86400):
    """Flag IP as suspicious (default 24h TTL)."""
    r = get_redis_client()
    if r is None:
        return
    try:
        r.sadd('flagged:ip', ip)
        r.expire('flagged:ip', ttl)
    except:
        pass


# ── Layer 3.5 Filter Function ─────────────────────────────────────────────────

def check_redis_signals(
    account_id: str,
    device_id: str,
    ip: str,
    recipient_id: str,
    amount: float
) -> Dict:
    """
    Layer 3.5 Filter: Check all Redis-backed signals in <5ms.
    
    Returns dict with:
      - ip_blacklisted: bool
      - device_blacklisted: bool
      - recipient_watchlisted: bool
      - ip_flagged: bool
      - txn_count_1h: int
      - user_median: float
      - device_uses_30d: int
    """
    return {
        'ip_blacklisted': is_ip_blacklisted(ip),
        'device_blacklisted': is_device_blacklisted(device_id),
        'recipient_watchlisted': is_recipient_watchlisted(recipient_id),
        'ip_flagged': is_ip_flagged(ip),
        'txn_count_1h': get_txn_count_1h(account_id),
        'user_median': get_user_median(account_id),
        'device_uses_30d': get_device_uses_30d(device_id),
    }


# ── Health Check ──────────────────────────────────────────────────────────────

def redis_health_check() -> bool:
    """Check if Redis is reachable."""
    r = get_redis_client()
    if r is None:
        return False
    try:
        r.ping()
        return True
    except:
        return False


# ── Demo Data Loader ──────────────────────────────────────────────────────────

def load_demo_data():
    """Load demo blacklists and user baselines for testing."""
    r = get_redis_client()
    if r is None:
        print("Redis not available - skipping demo data load")
        return
    
    print("Loading demo data into Redis...")
    
    # Demo blacklists
    r.sadd('blacklist:ip', '10.0.0.1', '192.168.99.99')
    r.sadd('blacklist:device', 'DEV_FRAUD_001', 'DEV_FRAUD_002')
    r.sadd('watchlist:recipient', 'RECIP_FRAUD_A', 'RECIP_FRAUD_B')
    
    # Demo flagged IPs (VPN/proxy)
    r.sadd('flagged:ip', '10.20.30.40', '172.16.0.1')
    
    # Demo user medians
    r.hset('user:median', 'C_CLEAN_001', 480)
    r.hset('user:median', 'C_RAHUL_001', 4000)
    r.hset('user:median', 'C_GEO_001', 2800)
    
    # Demo device usage
    r.hset('device:uses_30d', 'DEV_KNOWN_A', 15)
    r.hset('device:uses_30d', 'DEV_KNOWN_B', 20)
    r.hset('device:uses_30d', 'DEV_NEW_888', 1)
    
    print("Demo data loaded successfully")


if __name__ == '__main__':
    # Test Redis connection and load demo data
    if redis_health_check():
        print("✓ Redis connection successful")
        load_demo_data()
    else:
        print("✗ Redis connection failed - install Redis and start server")
        print("  Install: https://redis.io/download")
        print("  Start: redis-server")
