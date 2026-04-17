"""
ollama_client.py
================
Ollama phi3-mini client for VajraShield fraud analyst chatbot.
Same pattern as Trinetra PNB implementation.
"""

import ollama
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'phi3:mini')

# System prompt for fraud analyst chatbot
SYSTEM_PROMPT = """You are VajraShield AI, a friendly and helpful fraud analyst assistant. You help analysts understand transaction decisions and investigate fraud patterns.

Your personality:
- Conversational and friendly (not overly formal)
- Concise and to the point
- Use simple language, not corporate jargon
- For greetings, respond naturally and briefly

Your capabilities:
- Explain why transactions were blocked/approved
- Analyze fraud patterns and trends
- Report on model performance
- Identify fraud rings
- Track false positives

Guidelines:
- For greetings like "hi", "hello", respond warmly and ask how you can help
- Be concise - no long explanations unless asked
- Use numbers and data when available
- If no data is available, say so briefly and suggest what you can help with
- Never make up transaction IDs or statistics

Response style:
- Greetings: Keep it short and friendly
- Questions: Direct answer first, then context if needed
- No data: "I don't have that data yet. I can help you with [list capabilities]"
"""


def query_ollama(
    user_message: str,
    context: Dict,
    chat_history: List[Dict] = None
) -> str:
    """
    Query Ollama phi3-mini with context from Supabase.
    
    Args:
        user_message: User's question
        context: Relevant data from Supabase queries
        chat_history: Previous messages for context
    
    Returns:
        AI assistant response
    """
    try:
        # Build context string from Supabase data
        context_str = _build_context_string(context)
        
        # Build messages array
        messages = [
            {'role': 'system', 'content': SYSTEM_PROMPT}
        ]
        
        # Add chat history for context (last 5 exchanges = 10 messages)
        if chat_history:
            for msg in chat_history[-10:]:
                messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        # Add current query with context
        if context.get('greeting'):
            # For greetings, don't add database context
            user_content = user_message
        else:
            user_content = f"{user_message}\n\n[Database Context]\n{context_str}"
        
        messages.append({'role': 'user', 'content': user_content})
        
        # Query Ollama
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            options={
                'temperature': 0.7,  # Slightly higher for more natural conversation
                'top_p': 0.9,
                'num_predict': 256,  # Shorter responses
            }
        )
        
        return response['message']['content']
    
    except Exception as e:
        return f"Error querying AI model: {str(e)}"


def _build_context_string(context: Dict) -> str:
    """Build context string from Supabase query results."""
    # Handle greetings
    if context.get('greeting'):
        return "User is greeting. Respond warmly and briefly."
    
    parts = []
    
    # Transaction details
    if 'transaction' in context and context['transaction']:
        txn = context['transaction']
        parts.append(f"Transaction {txn['txn_id']}:")
        parts.append(f"  Amount: ${txn['amount']:.2f}")
        parts.append(f"  Account: {txn['account_id']}")
        parts.append(f"  Decision: {txn['decision']} (Lane {txn['lane']})")
        parts.append(f"  Risk Scores: ML={txn['ml_score']:.2f}, Graph={txn['graph_score']:.2f}, Unified={txn['unified_score']:.2f}")
        if txn.get('signals'):
            parts.append(f"  Triggered Signals: {', '.join(txn['signals'])}")
        if txn.get('explanation'):
            exp = txn['explanation']
            if isinstance(exp, dict) and 'message' in exp:
                parts.append(f"  Reason: {exp['message']}")
    
    # Daily summary
    if 'daily_summary' in context and context['daily_summary']:
        summary = context['daily_summary']
        parts.append("\nToday's Summary:")
        parts.append(f"  Total: {summary.get('total_transactions', 0)} transactions")
        parts.append(f"  Blocked: {summary.get('blocked', 0)}")
        parts.append(f"  Step-up: {summary.get('step_up', 0)}")
        parts.append(f"  Approved: {summary.get('approved', 0)}")
        if summary.get('false_positives'):
            parts.append(f"  False Positives: {summary['false_positives']}")
    
    # Recent blocks
    if 'recent_blocks' in context and context['recent_blocks']:
        blocks = context['recent_blocks']
        parts.append(f"\nRecent Blocks ({len(blocks)} transactions):")
        for block in blocks[:5]:  # Top 5
            parts.append(f"  - {block['txn_id']}: ${block['amount']:.2f}, score={block['unified_score']:.2f}")
    
    # False positives
    if 'false_positives' in context and context['false_positives']:
        fps = context['false_positives']
        parts.append(f"\nFalse Positives This Week: {len(fps)} transactions")
        if fps:
            parts.append(f"  Latest: {fps[0]['txn_id']} (${fps[0]['amount']:.2f})")
    
    # Active fraud rings
    if 'fraud_rings' in context and context['fraud_rings']:
        rings = context['fraud_rings']
        parts.append(f"\nActive Fraud Rings: {len(rings)}")
        for ring in rings[:3]:  # Top 3
            parts.append(f"  - {ring['ring_id']}: {ring['account_count']} accounts, risk={ring['risk_score']:.2f}")
    
    # Model stats
    if 'model_stats' in context and context['model_stats']:
        stats = context['model_stats']
        parts.append("\nModel Performance:")
        if stats.get('recall'):
            parts.append(f"  Recall: {stats['recall']:.2%}")
        if stats.get('precision_score'):
            parts.append(f"  Precision: {stats['precision_score']:.2%}")
        if stats.get('f1_score'):
            parts.append(f"  F1 Score: {stats['f1_score']:.2%}")
        if stats.get('drift_detected'):
            parts.append(f"  ⚠ Drift Detected: {stats['drift_detected']}")
    
    # Review queue
    if 'review_queue' in context and context['review_queue']:
        queue = context['review_queue']
        parts.append(f"\nReview Queue: {len(queue)} pending")
        sla_breached = sum(1 for item in queue if item.get('sla_breached'))
        if sla_breached:
            parts.append(f"  ⚠ SLA Breached: {sla_breached} items")
    
    # Search results
    if 'search_results' in context and context['search_results']:
        results = context['search_results']
        parts.append(f"\nSearch Results: {len(results)} transactions found")
    
    if not parts:
        return "No data available in the system yet. The chatbot can help with transaction analysis, fraud detection, and system monitoring once data is available."
    
    return '\n'.join(parts)


def test_ollama_connection() -> bool:
    """Test if Ollama is running and model is available."""
    try:
        response = ollama.list()
        models = response.get('models', [])
        model_names = [m.get('name', '') for m in models]
        
        if OLLAMA_MODEL in model_names or any(OLLAMA_MODEL in name for name in model_names):
            print(f"✓ Ollama connected, {OLLAMA_MODEL} available")
            return True
        else:
            print(f"✗ Model {OLLAMA_MODEL} not found")
            print(f"  Available models: {', '.join(model_names)}")
            print(f"  Pull model: ollama pull {OLLAMA_MODEL}")
            return False
    
    except Exception as e:
        print(f"✗ Ollama connection failed: {e}")
        print("  Make sure Ollama is running: ollama serve")
        return False


if __name__ == '__main__':
    # Test Ollama connection
    if test_ollama_connection():
        # Test query
        test_context = {
            'daily_summary': {
                'total_transactions': 1523,
                'blocked': 45,
                'step_up': 128,
                'approved': 1350,
                'false_positives': 3
            }
        }
        
        response = query_ollama(
            "How many transactions were blocked today?",
            test_context
        )
        
        print("\n--- Test Query ---")
        print("Q: How many transactions were blocked today?")
        print(f"A: {response}")
