from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
import redis

# VajraShield Engines
from services.filter_engine import process_lane_1
from services.graph_engine import FraudGraph

# Global Instances
graph_engine = None
redis_client = None

# Custom Lifespan for Startup/Shutdown procedures in modern FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    global graph_engine
    global redis_client
    
    # 1. Initialize Neo4j Graph Connection
    print("VajraShield Initialization: Starting Neo4j Connect...")
    try:
        graph_engine = FraudGraph()
    except Exception as e:
        print(f"[CRITICAL ERROR] Failed to connect to Neo4j instance: {e}")
        
    # 2. Check Redis Connectivity locally for health verification mappings
    print("VajraShield Initialization: Starting Redis Connect...")
    try:
        redis_client = redis.Redis(host='localhost', port=6380, db=0, decode_responses=True)
        redis_client.ping() # Health check
    except Exception as e:
        print(f"[CRITICAL ERROR] Failed to initialize Redis instance: {e}")
        
    yield # App continues mapping here while running
    
    # Shutdown sequence
    if graph_engine is not None:
        graph_engine.close()

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

@app.post("/predict")
async def predict(transaction: TransactionPayload):
    # Convert validated schema directly to dictionary for underlying module processing
    payload = transaction.dict()

    # ==========================================
    # LANE 1: REDIS FILTER ENGINE (<5ms tier)
    # ==========================================
    try:
        lane_1_analysis = process_lane_1(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lane 1 Redis processing crashed: {str(e)}")

    # Clear transaction instantly if authorized by Lane 1
    if lane_1_analysis.get("status") == "LANE_1_APPROVED":
        return {
            "status": "APPROVED",
            "reason": lane_1_analysis.get("reason"),
            "clearance_tier": "Lane 1 (Redis Base)",
            "decision_time": lane_1_analysis.get("decision_time", "<5ms"),
            "risk_score": 0.01
        }
    
    # ==========================================
    # LANE 2: NEO4J GRAPH ENGINE (Ring Detection)
    # ==========================================
    # Execute if Lane 1 returned 'SEND_TO_LANE_2' map block
    if not graph_engine:
         raise HTTPException(status_code=503, detail="Lane 2 service offline. Neo4j connection not instantiated.")

    try:
        lane_2_analysis = graph_engine.check_for_fraud_ring(
            device_id=transaction.device_id,
            ip_address=transaction.ip_address
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lane 2 Neo4j processing crashed: {str(e)}")

    if lane_2_analysis.get("status") == "RING_DETECTED":
        return {
            "status": "REJECTED_COORDINATED_FRAUD",
            "reason": lane_2_analysis.get("reason"),
            "escalated_from_lane_1_reason": lane_1_analysis.get("reason"),
            "clearance_tier": "Lane 2 (Neo4j Graph)",
            "graph_risk_score": lane_2_analysis.get("graph_risk_score")
        }

    # ==========================================
    # LANE 3: RIVER ONLINE ML MODEL (Stubbed)
    # ==========================================
    # TODO: This will eventually call the River adaptive learning engine instance.
    # Example logic placeholder:
    # 
    # ml_score = river_model.predict(payload)
    # if ml_score > 0.8:
    #     return { "status": "REJECTED_ML_MODEL", "risk_score": ml_score, "reason": "Adaptive learning flagged anomaly" }
    
    # Assumes fallback to Approved if Lane 1 escalated securely but Lane 2 found no ring links mapping
    return {
        "status": "APPROVED",
        "reason": "Transaction routine cleared post graph screening",
        "escalated_from_lane_1_reason": lane_1_analysis.get("reason"),
        "clearance_tier": "Lane 3 Fallback",
        "graph_risk_score": lane_2_analysis.get("graph_risk_score", 0.1)
    }
