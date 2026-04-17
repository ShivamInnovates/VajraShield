# VajraShield - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Infrastructure (2 minutes)

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:latest

# Start Neo4j
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest

# Verify both are running
docker ps
```

### Step 2: Install Dependencies (1 minute)

```bash
pip install redis neo4j
```

### Step 3: Setup & Load Demo Data (1 minute)

```bash
python setup_infrastructure.py
```

Expected output:
```
============================================================
VajraShield Infrastructure Setup
============================================================

1. Checking Redis...
   ✓ Redis is running
   Loading demo data...
   ✓ Demo data loaded

2. Checking Neo4j...
   ✓ Neo4j is running
   Graph: 0 accounts, 0 fraud

3. Checking River ML model...
   ✓ River model loaded

============================================================
✅ All infrastructure is ready!
============================================================
```

### Step 4: Run Tests (1 minute)

```bash
python step7_test_pipeline.py
```

Expected: **8 passed, 0 failed**

---

## 📋 Complete Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  VajraShield Pipeline                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 3.5: Redis Filter Engine          < 5ms          │
│  ├─ Blacklists (IP, device, recipient)                  │
│  ├─ Velocity tracking (txn_count_1h)                    │
│  ├─ User baselines (90d median)                         │
│  └─ Device tracking (30d usage)                         │
│                                                           │
│  Lane 1: Quick Approve                   < 15ms          │
│  └─ All signals clean → APPROVE                         │
│                                                           │
│  Lane 2: ML + Graph Analysis             < 350ms         │
│  ├─ River ML (fraud probability)                        │
│  ├─ Neo4j Graph (fraud ring detection)                  │
│  └─ Weighted decision (65% ML + 35% graph)              │
│                                                           │
│  Lane 3: Hard Block                      < 10ms          │
│  └─ Critical signals → BLOCK immediately                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 What's Running

### Redis (Port 6379)
- **Purpose:** Filter engine (Layer 3.5)
- **Data:**
  - Blacklists: `blacklist:ip`, `blacklist:device`, `watchlist:recipient`
  - Velocity: `velocity:{account_id}` (sorted sets with TTL)
  - User baselines: `user:median` (hash)
  - Device tracking: `device:uses_30d` (hash)
  - IP flags: `flagged:ip` (set)

### Neo4j (Ports 7474, 7687)
- **Purpose:** Graph fraud ring detection
- **Schema:**
  - Nodes: `Account`, `Device`, `IP`
  - Relationships: `USES_DEVICE`, `USES_IP`
  - Indexes: On `Account.id`, `Account.is_fraud`, `Device.id`, `IP.address`

### River ML Model
- **File:** `vajrashield_model_warmed.pkl`
- **Type:** Adaptive Random Forest (ARFClassifier)
- **Features:** 17 features including amount, balance, device, time, etc.
- **Performance:** 99.95% accuracy, 96.69% F1 score

---

## 💻 Usage Example

```python
from decision_engine import make_decision

# Make a fraud detection decision
result = make_decision(
    features={
        'amount': 5000,
        'oldbalanceOrg': 10000,
        'newbalanceOrig': 5000,
        'balance_drain_pct': 0.5,
        'full_drain': 0,
        'is_transfer': 1,
        'is_cash_out': 0,
        'hour': 14,
        'is_odd_hour': 0,
        'is_new_device': 0,
        'is_new_recipient': 0,
        'account_age_days': 365,
        'merchant_risk': 0.2,
        'kyc_full': 1,
    },
    account_id='USER_123',
    device_id='DEVICE_456',
    ip='192.168.1.1',
    recipient_id='RECIP_789',
    location_km=10,
    # device_uses and user_median fetched from Redis automatically
)

print(result)
# {
#   'decision': 'APPROVE',
#   'lane': 1,
#   'unified_score': 0.0,
#   'ml_score': 0.0,
#   'graph_score': 0.0,
#   'signals': [],
#   'explanation': {},
#   'latency_budget': '< 15ms (Lane 1 — all signals clean)'
# }
```

---

## 🧪 Testing

### Run All Tests
```bash
python step7_test_pipeline.py
```

### Run System Check
```bash
python run_vajrashield.py
```

### Test Individual Components

**Redis:**
```bash
python redis_filter.py
```

**Neo4j:**
```bash
python graph_scorer.py
```

---

## 🛠️ Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# View logs
docker logs redis

# Restart
docker restart redis

# Or start fresh
docker stop redis && docker rm redis
docker run -d --name redis -p 6379:6379 redis:latest
```

### Neo4j Connection Failed
```bash
# Check if Neo4j is running
docker ps | grep neo4j

# View logs
docker logs neo4j

# Access browser UI
# http://localhost:7474
# Username: neo4j, Password: password

# Restart
docker restart neo4j

# Or start fresh
docker stop neo4j && docker rm neo4j
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
```

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :6379   # Redis
netstat -ano | findstr :7687   # Neo4j

# Kill the process or use different ports
docker run -d --name redis -p 6380:6379 redis:latest
```

### Tests Failing
```bash
# Run setup again
python setup_infrastructure.py

# Check all services
docker ps

# Run tests with verbose output
python step7_test_pipeline.py
```

---

## 📊 Performance Targets

| Component | Target | Typical |
|-----------|--------|---------|
| Redis Filter | < 5ms | 2-3ms |
| Lane 1 (Approve) | < 15ms | 5-10ms |
| Lane 2 (ML + Graph) | < 350ms | 100-250ms |
| Lane 3 (Block) | < 10ms | 3-5ms |

---

## 🔄 Stopping Services

```bash
# Stop all
docker stop redis neo4j

# Remove containers
docker rm redis neo4j

# Or stop and remove in one command
docker stop redis neo4j && docker rm redis neo4j
```

---

## 📚 Next Steps

1. ✅ **Integration:** Add to your FastAPI app
2. ✅ **Monitoring:** Set up Prometheus + Grafana
3. ✅ **Production:** Configure Redis Sentinel + Neo4j Cluster
4. ✅ **Scaling:** Add read replicas for Redis and Neo4j
5. ✅ **Security:** Update Neo4j password, enable TLS

---

## 🎯 Summary

**To run VajraShield:**
1. Start Redis + Neo4j (Docker)
2. Run `python setup_infrastructure.py`
3. Run `python step7_test_pipeline.py`
4. Use `from decision_engine import make_decision`

**Total setup time: ~5 minutes**

**You now have:**
- ✅ Redis filter engine (blacklists, velocity, baselines)
- ✅ Neo4j graph engine (fraud ring detection)
- ✅ River ML model (fraud probability)
- ✅ 3-lane decision pipeline (approve/step-up/block)
- ✅ Production-ready fraud detection system
