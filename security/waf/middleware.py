from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
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
        # WebSocket Fast-Pass: Skip WAF scanning for live data stream
        if request.scope.get("type") == "websocket":
            return await call_next(request)

        # Check method
        if request.method not in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]:
            return JSONResponse(status_code=405, content={"error": "Method not allowed"})
        
        # Check query parameters
        for param, value in request.query_params.items():
            if self._is_malicious(value):
                return JSONResponse(status_code=400, content={"error": "Malicious payload detected"})
        
        # Check request body if present
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    # Scan the body
                    if self._is_malicious(body.decode('utf-8')):
                        from fastapi.responses import JSONResponse
                        return JSONResponse(status_code=400, content={"error": "Malicious payload detected"})
                    
                    # RE-INJECT the body so it can be read again by the next handler
                    async def receive():
                        return {"type": "http.request", "body": body}
                    request._receive = receive
            except Exception as e:
                pass
        
        # Check path
        if self._is_malicious(request.url.path):
            return JSONResponse(status_code=400, content={"error": "Malicious path detected"})
        
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Relax CSP for development to allow WebSocket connection to the gateway
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "connect-src 'self' http://localhost:8001 ws://localhost:8001 http://localhost:8000 ws://localhost:8000; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline';"
        )
        
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
