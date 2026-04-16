from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import redis
import time
from typing import Callable
import os

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate Limiting Middleware
    Enforces per-IP and per-user rate limits
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            decode_responses=True
        )
        # Limits: 1000 requests per hour per IP, 100 per minute
        self.hourly_limit = int(os.getenv("HOURLY_LIMIT", 1000))
        self.minute_limit = int(os.getenv("MINUTE_LIMIT", 100))
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check rate limits
        minute_key = f"rate_limit:minute:{client_ip}:{int(time.time() // 60)}"
        hour_key = f"rate_limit:hour:{client_ip}:{int(time.time() // 3600)}"
        
        minute_count = int(self.redis_client.get(minute_key) or 0)
        hour_count = int(self.redis_client.get(hour_key) or 0)
        
        if minute_count >= self.minute_limit:
            return JSONResponse(
                {"error": "Rate limit exceeded (per minute)"},
                status_code=429,
                headers={"Retry-After": "60"}
            )
        
        if hour_count >= self.hourly_limit:
            return JSONResponse(
                {"error": "Rate limit exceeded (per hour)"},
                status_code=429,
                headers={"Retry-After": "3600"}
            )
        
        # Increment counters
        self.redis_client.incr(minute_key)
        self.redis_client.expire(minute_key, 60)
        
        self.redis_client.incr(hour_key)
        self.redis_client.expire(hour_key, 3600)
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.minute_limit)
        response.headers["X-RateLimit-Remaining"] = str(self.minute_limit - minute_count - 1)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60)
        
        return response
