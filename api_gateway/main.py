from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from typing import Optional

from security.waf.middleware import WAFMiddleware
from security.rate_limiter.middleware import RateLimitMiddleware

app = FastAPI(title="VajraShield API Gateway")

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom security middleware (order matters!)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(WAFMiddleware)

# ============ Authentication ============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(request: Request):
    """Extract and verify user from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid scheme")
        user = await verify_token(token)
        return user
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")

# ============ Routes ============

@app.post("/api/v1/auth/login")
async def login(email: str, password: str):
    """Login endpoint - validate credentials"""
    # TODO: Validate against user database
    # This is a placeholder
    if not email or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/v1/auth/logout")
async def logout(current_user: str = Depends(get_current_user)):
    """Logout endpoint"""
    # TODO: Invalidate token in blacklist
    return {"message": "Logged out successfully"}

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Forward transaction endpoints
@app.post("/api/v1/transactions")
async def create_transaction(request: Request, current_user: str = Depends(get_current_user)):
    """Create a new transaction - proxy to backend"""
    body = await request.json()
    # TODO: Forward to transaction service
    return {"message": "Transaction received", "user": current_user}

@app.get("/api/v1/transactions/{txn_id}")
async def get_transaction(txn_id: str, current_user: str = Depends(get_current_user)):
    """Get transaction details"""
    # TODO: Forward to transaction service
    return {"txn_id": txn_id, "user": current_user}

@app.get("/api/v1/transactions/flagged")
async def get_flagged_transactions(
    status: str = "pending",
    current_user: str = Depends(get_current_user)
):
    """Get flagged transactions"""
    # TODO: Forward to transaction service
    return {"status": status, "user": current_user, "transactions": []}

@app.post("/api/v1/transactions/{txn_id}/review")
async def submit_review(
    txn_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Submit transaction review"""
    body = await request.json()
    # TODO: Forward to transaction service
    return {"message": "Review submitted", "txn_id": txn_id, "reviewer": current_user}

@app.get("/api/v1/dashboard/metrics")
async def get_metrics(
    time_range: str = "24h",
    current_user: str = Depends(get_current_user)
):
    """Get dashboard metrics"""
    # TODO: Query metrics from database/cache
    return {
        "totalTransactions": 1500,
        "flaggedCount": 45,
        "pendingReview": 12,
        "accuracy": 94.5
    }
