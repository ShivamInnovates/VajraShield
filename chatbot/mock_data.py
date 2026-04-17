"""
mock_data.py
============
Mock data for VajraShield chatbot when Supabase is not configured.
This allows the system to work immediately with realistic data.
Includes in-memory session storage for chat history.
"""

from datetime import datetime, timedelta
import random
from typing import Dict, List

# In-memory chat history storage
CHAT_SESSIONS: Dict[str, List[Dict]] = {}


def save_mock_chat_message(session_id: str, user_id: str, role: str, 
                           content: str, txn_id: str = None,
                           query_results: Dict = None) -> bool:
    """Save chat message to in-memory storage."""
    if session_id not in CHAT_SESSIONS:
        CHAT_SESSIONS[session_id] = []
    
    message = {
        'session_id': session_id,
        'user_id': user_id,
        'timestamp': datetime.now().isoformat(),
        'role': role,
        'content': content,
        'txn_id': txn_id,
        'query_results': query_results,
    }
    
    CHAT_SESSIONS[session_id].append(message)
    
    # Keep only last 50 messages per session
    if len(CHAT_SESSIONS[session_id]) > 50:
        CHAT_SESSIONS[session_id] = CHAT_SESSIONS[session_id][-50:]
    
    return True


def get_mock_chat_history(session_id: str, limit: int = 10) -> List[Dict]:
    """Get recent chat history for context."""
    if session_id not in CHAT_SESSIONS:
        return []
    
    messages = CHAT_SESSIONS[session_id]
    # Return last N messages, oldest first
    return messages[-limit:] if len(messages) > limit else messages

# Mock transactions
MOCK_TRANSACTIONS = [
    {
        'txn_id': 'TXN_ABC123',
        'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
        'amount': 45000.0,
        'account_id': 'ACC_001',
        'device_id': 'DEV_NEW_888',
        'ip_address': '192.168.1.100',
        'recipient_id': 'RECIP_XYZ',
        'lane': 3,
        'decision': 'BLOCK',
        'ml_score': 0.89,
        'graph_score': 0.76,
        'unified_score': 0.85,
        'signals': ['high_amount', 'new_device', 'new_recipient', 'velocity'],
        'explanation': {
            'message': 'Payment blocked: Amount is 8.5x your usual spending.',
            'ask_for': 'Block',
            'all_signals': ['high_amount', 'new_device', 'new_recipient', 'velocity']
        },
        'confirmed_fraud': None,
        'model_version': 'v1.0',
        'latency_ms': 8
    },
    {
        'txn_id': 'TXN_DEF456',
        'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
        'amount': 2500.0,
        'account_id': 'ACC_002',
        'device_id': 'DEV_KNOWN_A',
        'ip_address': '192.168.1.101',
        'recipient_id': 'RECIP_ABC',
        'lane': 2,
        'decision': 'STEP_UP',
        'ml_score': 0.42,
        'graph_score': 0.35,
        'unified_score': 0.39,
        'signals': ['new_recipient', 'odd_hours'],
        'explanation': {
            'message': 'Additional verification required: First payment to this account.',
            'ask_for': 'OTP',
            'all_signals': ['new_recipient', 'odd_hours']
        },
        'confirmed_fraud': False,
        'model_version': 'v1.0',
        'latency_ms': 245
    },
    {
        'txn_id': 'TXN_GHI789',
        'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
        'amount': 1200.0,
        'account_id': 'ACC_003',
        'device_id': 'DEV_KNOWN_B',
        'ip_address': '192.168.1.102',
        'recipient_id': 'RECIP_DEF',
        'lane': 1,
        'decision': 'APPROVE',
        'ml_score': 0.08,
        'graph_score': 0.02,
        'unified_score': 0.06,
        'signals': [],
        'explanation': {},
        'confirmed_fraud': None,
        'model_version': 'v1.0',
        'latency_ms': 12
    }
]

# Mock daily summary
MOCK_DAILY_SUMMARY = {
    'date': datetime.now().date().isoformat(),
    'total_transactions': 1523,
    'blocked': 45,
    'step_up': 128,
    'approved': 1350,
    'lane1': 1350,
    'lane2': 128,
    'lane3': 45,
    'avg_risk_score': 0.15,
    'confirmed_fraud': 12,
    'false_positives': 3
}

# Mock model stats
MOCK_MODEL_STATS = {
    'recorded_at': datetime.now().isoformat(),
    'transactions_learned': 15234,
    'transactions_total': 15234,
    'recall': 0.94,
    'precision_score': 0.89,
    'f1_score': 0.91,
    'auc_score': 0.96,
    'drift_detected': False,
    'drift_score': 0.02,
    'lane1_count': 12450,
    'lane2_count': 2234,
    'lane3_count': 550,
    'approved_count': 12450,
    'stepup_count': 2234,
    'blocked_count': 550,
    'false_positive_rate': 0.02,
    'false_negative_rate': 0.01
}

# Mock fraud rings
MOCK_FRAUD_RINGS = [
    {
        'ring_id': 'RING_001',
        'detected_at': (datetime.now() - timedelta(days=2)).isoformat(),
        'account_count': 5,
        'risk_score': 0.87,
        'status': 'active'
    },
    {
        'ring_id': 'RING_002',
        'detected_at': (datetime.now() - timedelta(days=1)).isoformat(),
        'account_count': 3,
        'risk_score': 0.72,
        'status': 'investigating'
    }
]

# Mock review queue
MOCK_REVIEW_QUEUE = [
    {
        'id': 1,
        'txn_id': 'TXN_ABC123',
        'account_id': 'ACC_001',
        'amount': 45000.0,
        'unified_score': 0.85,
        'queued_at': (datetime.now() - timedelta(minutes=15)).isoformat(),
        'status': 'pending',
        'sla_breached': False,
        'minutes_waiting': 15
    },
    {
        'id': 2,
        'txn_id': 'TXN_JKL012',
        'account_id': 'ACC_004',
        'amount': 78000.0,
        'unified_score': 0.92,
        'queued_at': (datetime.now() - timedelta(minutes=45)).isoformat(),
        'status': 'pending',
        'sla_breached': True,
        'minutes_waiting': 45
    }
]


def get_mock_transaction(txn_id: str):
    """Get mock transaction by ID."""
    for txn in MOCK_TRANSACTIONS:
        if txn['txn_id'] == txn_id:
            return txn
    return None


def get_mock_daily_summary():
    """Get mock daily summary."""
    return MOCK_DAILY_SUMMARY


def get_mock_recent_blocks(hours: int = 24, limit: int = 50):
    """Get mock recent blocks."""
    return [txn for txn in MOCK_TRANSACTIONS if txn['decision'] == 'BLOCK'][:limit]


def get_mock_false_positives(days: int = 7):
    """Get mock false positives."""
    return [txn for txn in MOCK_TRANSACTIONS if txn['decision'] == 'BLOCK' and txn.get('confirmed_fraud') == False]


def get_mock_fraud_rings():
    """Get mock fraud rings."""
    return MOCK_FRAUD_RINGS


def get_mock_model_stats():
    """Get mock model stats."""
    return MOCK_MODEL_STATS


def get_mock_review_queue(status: str = 'pending'):
    """Get mock review queue."""
    return [item for item in MOCK_REVIEW_QUEUE if item['status'] == status]


def search_mock_transactions(account_id=None, decision=None, min_score=None, hours=24, limit=100):
    """Search mock transactions."""
    results = MOCK_TRANSACTIONS.copy()
    
    if account_id:
        results = [t for t in results if t['account_id'] == account_id]
    if decision:
        results = [t for t in results if t['decision'] == decision]
    if min_score:
        results = [t for t in results if t['unified_score'] >= min_score]
    
    return results[:limit]
