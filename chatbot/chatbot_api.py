"""
chatbot_api.py
==============
FastAPI endpoint for VajraShield Fraud Analyst Chatbot.
POST /chat → query Supabase → phi3-mini via Ollama → plain English answer
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

from supabase_client import (
    get_transaction, get_daily_summary, get_recent_blocks,
    get_false_positives, get_active_fraud_rings, get_latest_model_stats,
    get_review_queue, search_transactions, save_chat_message, get_chat_history
)
from ollama_client import query_ollama, test_ollama_connection
from auth import verify_jwt_token

app = FastAPI(title="VajraShield Fraud Analyst Chatbot")

# CORS for React dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    txn_id: Optional[str] = None  # If analyst clicked on specific transaction


class ChatResponse(BaseModel):
    response: str
    session_id: str
    context_used: dict
    timestamp: str


# Intent detection keywords
INTENT_KEYWORDS = {
    'greeting': ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    'transaction': ['txn', 'transaction', 'blocked', 'why was', 'explain', 'decision'],
    'daily_summary': ['today', 'summary', 'how many', 'total', 'stats', 'count'],
    'false_positives': ['false positive', 'fp', 'wrongly blocked', 'mistake', 'error'],
    'fraud_rings': ['fraud ring', 'ring', 'network', 'connected', 'group'],
    'model_stats': ['model', 'performance', 'recall', 'precision', 'drift', 'accuracy'],
    'review_queue': ['review', 'queue', 'pending', 'sla', 'waiting'],
}


def detect_intent(message: str) -> List[str]:
    """Detect user intent from message to query relevant data."""
    message_lower = message.lower().strip()
    intents = []
    
    # Check for greetings first
    if any(keyword in message_lower for keyword in INTENT_KEYWORDS['greeting']):
        intents.append('greeting')
        return intents  # Return early for greetings
    
    for intent, keywords in INTENT_KEYWORDS.items():
        if intent == 'greeting':
            continue
        if any(keyword in message_lower for keyword in keywords):
            intents.append(intent)
    
    # Only default to daily summary if message seems like a question
    if not intents and any(word in message_lower for word in ['?', 'what', 'how', 'show', 'tell']):
        intents.append('daily_summary')
    
    return intents


def gather_context(message: str, txn_id: Optional[str] = None) -> dict:
    """
    Query Supabase for relevant context based on user message.
    This is the key function that connects chatbot to VajraShield data.
    """
    context = {}
    intents = detect_intent(message)
    
    # Skip data gathering for greetings
    if 'greeting' in intents:
        return {'greeting': True}
    
    # Specific transaction query
    if txn_id or 'transaction' in intents:
        if txn_id:
            context['transaction'] = get_transaction(txn_id)
        else:
            # Try to extract txn_id from message
            words = message.split()
            for word in words:
                if word.startswith('TXN_') or word.startswith('txn_'):
                    context['transaction'] = get_transaction(word)
                    break
    
    # Daily summary
    if 'daily_summary' in intents:
        context['daily_summary'] = get_daily_summary()
    
    # Recent blocks
    if 'transaction' in intents or 'daily_summary' in intents:
        context['recent_blocks'] = get_recent_blocks(hours=24, limit=10)
    
    # False positives
    if 'false_positives' in intents:
        context['false_positives'] = get_false_positives(days=7)
    
    # Fraud rings
    if 'fraud_rings' in intents:
        context['fraud_rings'] = get_active_fraud_rings()
    
    # Model stats
    if 'model_stats' in intents:
        context['model_stats'] = get_latest_model_stats()
    
    # Review queue
    if 'review_queue' in intents:
        context['review_queue'] = get_review_queue(status='pending')
    
    return context


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    ollama_ok = test_ollama_connection()
    return {
        "status": "healthy" if ollama_ok else "degraded",
        "ollama": "connected" if ollama_ok else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Main chat endpoint.
    
    Flow:
    1. Verify JWT token (analyst authentication)
    2. Detect intent from message
    3. Query Supabase for relevant context
    4. Get chat history for continuity
    5. Query Ollama phi3-mini with context
    6. Save message to chat history
    7. Return response
    """
    # Verify JWT token (optional for now - allow anonymous for testing)
    user_id = "anonymous"
    if authorization:
        token = authorization.replace("Bearer ", "")
        verified_user = verify_jwt_token(token)
        if verified_user:
            user_id = verified_user
    
    # Generate or use existing session ID
    session_id = request.session_id or str(uuid.uuid4())
    
    # Gather context from Supabase
    context = gather_context(request.message, request.txn_id)
    
    # Get chat history for context
    chat_history = get_chat_history(session_id, limit=10)
    
    # Query Ollama
    response_text = query_ollama(
        user_message=request.message,
        context=context,
        chat_history=chat_history
    )
    
    # Save to chat history
    save_chat_message(session_id, user_id, 'user', request.message, 
                     txn_id=request.txn_id, query_results=context)
    save_chat_message(session_id, user_id, 'assistant', response_text)
    
    return ChatResponse(
        response=response_text,
        session_id=session_id,
        context_used=context,
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/transaction/{txn_id}")
async def get_transaction_details(txn_id: str):
    """Get full transaction details for dashboard."""
    txn = get_transaction(txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@app.get("/summary")
async def get_summary():
    """Get today's summary for dashboard."""
    return {
        'daily': get_daily_summary(),
        'recent_blocks': get_recent_blocks(hours=24, limit=20),
        'fraud_rings': get_active_fraud_rings(),
        'model_stats': get_latest_model_stats(),
        'review_queue': get_review_queue()
    }


@app.get("/search")
async def search(
    account_id: Optional[str] = None,
    decision: Optional[str] = None,
    min_score: Optional[float] = None,
    hours: int = 24
):
    """Search transactions with filters."""
    results = search_transactions(
        account_id=account_id,
        decision=decision,
        min_score=min_score,
        hours=hours
    )
    return {'results': results, 'count': len(results)}


if __name__ == '__main__':
    import uvicorn
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', 8001))
    
    print(f"Starting VajraShield Chatbot API on {host}:{port}")
    print("Endpoints:")
    print(f"  POST http://{host}:{port}/chat")
    print(f"  GET  http://{host}:{port}/health")
    print(f"  GET  http://{host}:{port}/summary")
    
    uvicorn.run(app, host=host, port=port)
