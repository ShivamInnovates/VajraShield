"""
auth.py
=======
JWT authentication for VajraShield dashboard.
Matches dashboard-ws JWT-gated pattern from architecture diagram.
"""

from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-here')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = 24


def create_jwt_token(user_id: str, role: str = 'analyst') -> str:
    """
    Create JWT token for dashboard authentication.
    
    Args:
        user_id: Analyst user ID
        role: User role (analyst, admin, viewer)
    
    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token: str) -> Optional[str]:
    """
    Verify JWT token and return user_id if valid.
    
    Args:
        token: JWT token string
    
    Returns:
        user_id if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        return user_id
    except JWTError:
        return None


if __name__ == '__main__':
    # Test JWT
    test_user = 'analyst_001'
    token = create_jwt_token(test_user, role='analyst')
    print(f"Generated token: {token[:50]}...")
    
    verified = verify_jwt_token(token)
    print(f"Verified user: {verified}")
    
    # Test invalid token
    invalid = verify_jwt_token("invalid.token.here")
    print(f"Invalid token result: {invalid}")
