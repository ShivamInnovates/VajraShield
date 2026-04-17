"""
supabase_client.py
==================
Supabase client for VajraShield transaction storage and querying.
Falls back to mock data if Supabase is not configured.
"""

from supabase import create_client, Client
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from mock_data import *

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

USE_MOCK_DATA = not SUPABASE_URL or not SUPABASE_KEY or SUPABASE_URL == 'https://your-project.supabase.co'

if USE_MOCK_DATA:
    print("⚠ Using mock data (Supabase not configured)")
    supabase: Optional[Client] = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✓ Supabase connected")
    except:
        print("⚠ Supabase connection failed, using mock data")
        USE_MOCK_DATA = True
        supabase = None


def save_transaction(decision_result: Dict, txn_id: str, account_id: str, 
                     amount: float, device_id: str = None, ip_address: str = None,
                     recipient_id: str = None, latency_ms: int = None) -> bool:
    """
    Save transaction decision to Supabase audit log.
    Called at end of make_decision() in decision_engine.py
    """
    if not supabase:
        return False
    
    try:
        data = {
            'txn_id': txn_id,
            'timestamp': datetime.utcnow().isoformat(),
            'amount': amount,
            'account_id': account_id,
            'device_id': device_id,
            'ip_address': ip_address,
            'recipient_id': recipient_id,
            'lane': decision_result['lane'],
            'decision': decision_result['decision'],
            'ml_score': decision_result['ml_score'],
            'graph_score': decision_result['graph_score'],
            'unified_score': decision_result['unified_score'],
            'signals': decision_result['signals'],
            'explanation': decision_result.get('explanation', {}),
            'detailed_explanation': decision_result.get('detailed_explanation', {}),
            'model_version': 'v1.0',  # TODO: Make dynamic
            'latency_ms': latency_ms,
        }
        
        result = supabase.table('transactions').insert(data).execute()
        
        # If Lane 3 block, add to review queue
        if decision_result['lane'] == 3 and decision_result['decision'] == 'BLOCK':
            queue_data = {
                'txn_id': txn_id,
                'priority': 10 if decision_result['unified_score'] > 0.9 else 5,
            }
            supabase.table('review_queue').insert(queue_data).execute()
        
        return True
    
    except Exception as e:
        print(f"Failed to save transaction: {e}")
        return False


def get_transaction(txn_id: str) -> Optional[Dict]:
    """Get transaction by ID."""
    if USE_MOCK_DATA:
        return get_mock_transaction(txn_id)
    
    if not supabase:
        return None
    
    try:
        result = supabase.table('transactions').select('*').eq('txn_id', txn_id).execute()
        return result.data[0] if result.data else None
    except:
        return None


def get_daily_summary(date: Optional[str] = None) -> Dict:
    """Get daily transaction summary."""
    if USE_MOCK_DATA:
        return get_mock_daily_summary()
    
    if not supabase:
        return {}
    
    try:
        if date is None:
            date = datetime.utcnow().date().isoformat()
        
        result = supabase.table('daily_summary').select('*').eq('date', date).execute()
        return result.data[0] if result.data else {}
    except:
        return {}


def get_recent_blocks(hours: int = 24, limit: int = 50) -> List[Dict]:
    """Get recent blocked transactions."""
    if USE_MOCK_DATA:
        return get_mock_recent_blocks(hours, limit)
    
    if not supabase:
        return []
    
    try:
        cutoff = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        result = (supabase.table('transactions')
                 .select('*')
                 .eq('decision', 'BLOCK')
                 .gte('timestamp', cutoff)
                 .order('timestamp', desc=True)
                 .limit(limit)
                 .execute())
        return result.data
    except:
        return []


def get_false_positives(days: int = 7) -> List[Dict]:
    """Get false positives (blocked but confirmed not fraud)."""
    if USE_MOCK_DATA:
        return get_mock_false_positives(days)
    
    if not supabase:
        return []
    
    try:
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        result = (supabase.table('transactions')
                 .select('*')
                 .eq('decision', 'BLOCK')
                 .eq('confirmed_fraud', False)
                 .gte('timestamp', cutoff)
                 .execute())
        return result.data
    except:
        return []


def get_active_fraud_rings() -> List[Dict]:
    """Get active fraud rings."""
    if USE_MOCK_DATA:
        return get_mock_fraud_rings()
    
    if not supabase:
        return []
    
    try:
        result = supabase.table('active_fraud_rings').select('*').execute()
        return result.data
    except:
        return []


def get_latest_model_stats() -> Optional[Dict]:
    """Get latest model performance stats."""
    if USE_MOCK_DATA:
        return get_mock_model_stats()
    
    if not supabase:
        return None
    
    try:
        result = (supabase.table('model_stats')
                 .select('*')
                 .order('recorded_at', desc=True)
                 .limit(1)
                 .execute())
        return result.data[0] if result.data else None
    except:
        return None


def get_review_queue(status: str = 'pending') -> List[Dict]:
    """Get human review queue."""
    if USE_MOCK_DATA:
        return get_mock_review_queue(status)
    
    if not supabase:
        return []
    
    try:
        result = (supabase.table('review_queue_summary')
                 .select('*')
                 .eq('status', status)
                 .execute())
        return result.data
    except:
        return []


def search_transactions(
    account_id: Optional[str] = None,
    decision: Optional[str] = None,
    min_score: Optional[float] = None,
    hours: int = 24,
    limit: int = 100
) -> List[Dict]:
    """Search transactions with filters."""
    if USE_MOCK_DATA:
        return search_mock_transactions(account_id, decision, min_score, hours, limit)
    
    if not supabase:
        return []
    
    try:
        cutoff = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        query = supabase.table('transactions').select('*').gte('timestamp', cutoff)
        
        if account_id:
            query = query.eq('account_id', account_id)
        if decision:
            query = query.eq('decision', decision)
        if min_score:
            query = query.gte('unified_score', min_score)
        
        result = query.order('timestamp', desc=True).limit(limit).execute()
        return result.data
    except:
        return []


def save_chat_message(session_id: str, user_id: str, role: str, 
                     content: str, txn_id: Optional[str] = None,
                     query_results: Optional[Dict] = None) -> bool:
    """Save chat message for context."""
    if USE_MOCK_DATA:
        return save_mock_chat_message(session_id, user_id, role, content, txn_id, query_results)
    
    if not supabase:
        return False
    
    try:
        data = {
            'session_id': session_id,
            'user_id': user_id,
            'role': role,
            'content': content,
            'txn_id': txn_id,
            'query_results': query_results,
        }
        supabase.table('chat_history').insert(data).execute()
        return True
    except:
        return False


def get_chat_history(session_id: str, limit: int = 10) -> List[Dict]:
    """Get recent chat history for context."""
    if USE_MOCK_DATA:
        return get_mock_chat_history(session_id, limit)
    
    if not supabase:
        return []
    
    try:
        result = (supabase.table('chat_history')
                 .select('role, content')
                 .eq('session_id', session_id)
                 .order('timestamp', desc=True)
                 .limit(limit)
                 .execute())
        return list(reversed(result.data))  # Oldest first
    except:
        return []


if __name__ == '__main__':
    # Test connection
    if supabase:
        print("✓ Supabase connection successful")
        
        # Test queries
        summary = get_daily_summary()
        print(f"Today's summary: {summary}")
        
        stats = get_latest_model_stats()
        print(f"Latest model stats: {stats}")
    else:
        print("✗ Supabase not configured")
