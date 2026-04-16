from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import re
import html
from typing import Callable

class WAFMiddleware(BaseHTTPMiddleware):
    """
    Web Application Firewall Middleware
    Protects against:
    - SQL Injection
    - XSS attacks
    - CSRF tokens
    - Malicious payloads
    """
    
    # SQL Injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\bunion\b.*\bselect\b)",
        r"(\bselect\b.*\bfrom\b)",
        r"(\bdrop\b.*\btable\b)",
        r"(\binsert\b.*\binto\b)",
        r"(\bupdate\b.*\bset\b)",
        r"(\bdelete\b.*\bfrom\b)",
        r"(--|;)",
        r"(\*/)",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
    ]
    
    # Compiled patterns for performance
    SQL_REGEX = [re.compile(pattern, re.IGNORECASE) for pattern in SQL_INJECTION_PATTERNS]
    XSS_REGEX = [re.compile(pattern, re.IGNORECASE) for pattern in XSS_PATTERNS]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Check method
        if request.method not in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
            return {"error": "Method not allowed"}, 405
        
        # Check query parameters
        for param, value in request.query_params.items():
            if self._is_malicious(value):
                return {"error": "Malicious payload detected"}, 400
        
        # Check request body if present
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body and self._is_malicious(body.decode('utf-8')):
                    return {"error": "Malicious payload detected"}, 400
            except:
                pass
        
        # Check path
        if self._is_malicious(request.url.path):
            return {"error": "Malicious path detected"}, 400
        
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response
    
    def _is_malicious(self, payload: str) -> bool:
        """Check if payload contains malicious patterns"""
        # SQL Injection check
        for pattern in self.SQL_REGEX:
            if pattern.search(payload):
                return True
        
        # XSS check
        for pattern in self.XSS_REGEX:
            if pattern.search(payload):
                return True
        
        return False
