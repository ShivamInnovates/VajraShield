import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
import redis
import time

# VajraShield Engines
from ml_engine.decision_engine import async_make_decision
from ml_engine.redis_filter import record_transaction, load_demo_data
from ml_engine.ml_scorer import warm_up, update_model
from services.kafka_publisher import publish_event

# Global Instances
redis_client = None

# Custom Lifespan for Startup/Shutdown procedures in modern FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    
    # Pre-warm ML models
    warm_up()

    # Check Redis Connectivity for health verification
    print("VajraShield Initialization: Starting Redis Connect...")
    try:
        # Use host='redis' for Docker network communication
        redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
        redis_client.ping() # Health check
        
        # Load demo blacklists and baselines
        load_demo_data()
    except Exception as e:
        print(f"[CRITICAL ERROR] Failed to initialize Redis instance: {e}")
        
    yield # App continues mapping here while running
    
app = FastAPI(title="VajraShield API", lifespan=lifespan)

# Pydantic schema enforcing structure of an incoming payload
class TransactionPayload(BaseModel):
    user_id: str
    amount: float
    timestamp: str
    device_id: str
    location: str
    recipient_known: int
    velocity_score: float
    merchant_risk: float
    account_age_days: int
    ip_address: str
    merchant: Optional[str] = None
    recipient_id: Optional[str] = "UNKNOWN"

@app.post("/predict")
async def predict(transaction: TransactionPayload, background_tasks: BackgroundTasks):
    # Convert validated schema directly to dictionary
    payload = transaction.dict()
    start_time = time.time()

    try:
        # Full 3-Lane Decision Engine (Async)
        # Implements Parallel Analysis (Lane 2) and Cold Start (Lane 3.5)
        decision_result = await async_make_decision(
            features=payload,
            account_id=transaction.user_id,
            device_id=transaction.device_id,
            ip=transaction.ip_address,
            recipient_id=transaction.recipient_id
        )
    except Exception as e:
        print(f"Decision Engine Error: {e}")
        raise HTTPException(status_code=500, detail=f"VajraShield Decision Engine crashed: {str(e)}")

    # Calculate final latency
    total_latency_ms = (time.time() - start_time) * 1000
    decision_result["actual_latency_ms"] = round(total_latency_ms, 2)

    # ── Online Learning Feedback Loop ──────────────────────────────────────
    # Every decision (even auto-approvals) trains the River model
    is_fraud_label = 1 if decision_result["decision"] == "BLOCK" else 0
    background_tasks.add_task(update_model, payload, is_fraud_label)

    # ── Kafka Event Pipeline (Enterprise Bus) ───────────────────────────────
    # 1. Always publish to dashboard-ws for live visualization
    background_tasks.add_task(
        publish_event, 
        "dashboard-ws", 
        {**payload, **decision_result, "txn_id": f"TXN_{int(time.time()*1000)}"}
    )

    # 2. Publish to audit-log
    background_tasks.add_task(
        publish_event, 
        "audit-log", 
        {"txn_id": f"TXN_{int(time.time()*1000)}", "event_type": "PREDICTION", "decision": decision_result["decision"]}
    )

    # 3. Handle Lane 3: Auto-Flag to Human Review Queue
    if decision_result["lane"] == 3:
        background_tasks.add_task(
            publish_event, 
            "model-updates", # Shared with review queue or specific review topic
            {"txn_id": f"TXN_{int(time.time()*1000)}", "needs_review": True, "evidence": decision_result["signals"]}
        )

    return {
        **decision_result,
        "service_status": "ONLINE",
        "threat_protection": "ACTIVE"
    }
