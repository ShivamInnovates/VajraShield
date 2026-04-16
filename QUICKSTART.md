# VajraShield - Quick Start & Troubleshooting Guide

## ✅ What's Been Created

### **Folder Structure** ✓
- `frontend/dashboard/` - React dashboard (ReviewQueue, Dashboard, TransactionDetail pages)
- `api_gateway/` - FastAPI gateway with JWT auth, WAF, rate limiting
- `security/` - WAF middleware, rate limiter, crypto manager
- `infrastructure/` - HAProxy load balancer, Kafka consumers
- `database/` - PostgreSQL/Neo4j models and migrations
- `observability/` - Prometheus, Grafana, Jaeger configs

### **Running Services** ✓
```
✔ Prometheus   (9090)  - Metrics collection
✔ Grafana      (3001)  - Dashboards  
✔ Jaeger       (16686) - Distributed tracing
✔ Kafka        (9092)  - Event streaming
✔ PostgreSQL   (5432)  - Transaction DB
✔ Redis        (6379)  - Cache/session store
✔ Neo4j        (7687)  - Graph DB
✔ Zookeeper    (2181)  - Kafka coordination
```

### **Still Building**
- `api-gateway` (8000) - FastAPI service
- `frontend` (3000) - React dashboard

---

## 🚀 How to Start

### **Option 1: Let Docker Build Automatically**
```bash
cd /home/shivaji/Desktop/VajraShield
docker compose up -d frontend api-gateway
# Wait 2-3 minutes for builds to complete
docker compose ps
```

### **Option 2: Skip App Services (View Infrastructure Only)**
All infrastructure services are running! Access:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin-password-change-this)
- **Jaeger**: http://localhost:16686
- **Neo4j**: http://localhost:7474 (neo4j/neo4j-password-change-this)

---

## 🐛 Troubleshooting

### **Port Already Allocated**
```bash
# Find what's using the port
sudo lsof -i :8000  # or :3000, :5432, etc
# Kill it or modify docker-compose ports

# Or edit docker-compose.yml to use different ports
# api-gateway: change "8000:8000" to "8001:8000"
# frontend: change "3000:3000" to "3001:3000" (already used by Grafana!)
```

### **Build Failing**
```bash
# Clear all Docker build cache
docker system prune -a --volumes

# Rebuild from scratch
docker compose build --no-cache

# Or build just one service
docker compose build --no-cache api-gateway
```

### **Containers Not Starting**
```bash
# Check logs
docker compose logs api-gateway
docker compose logs frontend

# Restart services
docker compose restart api-gateway frontend

# Or full reset
docker compose down -v
docker compose up -d
```

---

## 📁 Project Structure At A Glance

```
VajraShield/
├── frontend/dashboard/              ← React dashboard
│   ├── src/
│   │   ├── pages/                  ← ReviewQueue, Dashboard, TransactionDetail
│   │   ├── components/             ← Navbar, TransactionCard
│   │   └── services/               ← API client with JWT auth
│   ├── package.json
│   └── Dockerfile
│
├── api_gateway/                     ← FastAPI server
│   ├── main.py                     ← All endpoints
│   ├── requirements.txt
│   └── Dockerfile
│
├── security/                        ← Security layers
│   ├── waf/middleware.py           ← SQL injection & XSS protection
│   ├── rate_limiter/middleware.py  ← 1000/hr per IP, 100/min per user
│   └── auth/crypto.py              ← JWT & mTLS
│
├── infrastructure/
│   ├── load_balancer/haproxy.cfg   ← HA load balancer config
│   └── kafka/ ← Event processors
│       ├── txn_consumer.py         ← Process transaction events→ PostgeSQL
│       └── dashboard_consumer.py   ← Push to WebSocket
│
├── database/
│   └── models.py                   ← Transaction, User, AuditLog schemas
│
├── observability/
│   ├── prometheus/                 ← Alerting rules
│   │   ├── prometheus.yml
│   │   ├── alerts.yml
│   │   └── alertmanager.yml
│   └── grafana/                    ← Dashboard provisioning
│
├── docker-compose.yml              ← All 13 services
├── .env.example                    ← Copy to .env and configure
└── README.md                        ← This file!
```

---

## 🔐 Security Features Implemented

✅ **JWT Authentication** - All API calls require bearer token  
✅ **WAF Middleware** - Blocks SQL injection, XSS, CSRF  
✅ **Rate Limiting** - 1000 reqs/hr per IP, 100/min per user (Redis-backed)  
✅ **mTLS Support** - Mutual TLS for service-to-service  
✅ **Crypto Signing** - RSA request signatures  
✅ **CORS Protected** - Whitelist only allowed origins  
✅ **Security Headers** - X-Frame-Options, CSP, HSTS  

---

## 📊 Monitoring & Alerts

Alert Rules Already Configured:
- API latency > 1s
- Error rate > 5%
- Transaction queue backlog
- SLA breaches (30 min flagged transaction deadline)
- Database connection pool exhaustion
- Model accuracy drops
- Redis memory usage > 90%
- Kafka consumer lag
- CPU/Disk usage

All alerts route to → Slack/PagerDuty (via AlertManager)

---

## 🔗 API Endpoints (When Running)

```
POST   /api/v1/auth/login                  - User login
POST   /api/v1/auth/logout                 - User logout
GET    /api/v1/health                      - Health check
POST   /api/v1/transactions                - Create transaction
GET    /api/v1/transactions/{id}           - Get transaction
GET    /api/v1/transactions/flagged        - List flagged transactions
POST   /api/v1/transactions/{id}/review    - Submit human review
GET    /api/v1/dashboard/metrics           - Dashboard metrics
```

All require: `Authorization: Bearer <jwt_token>`

---

## 🎯 Next Steps

1. **Wait for app services to build** (2-3 mins)
2. **Access dashboard** at http://localhost:3000
3. **Login** with credentials from .env
4. **Review queued transactions** with SLA tracking
5. **Monitor health** on Grafana (http://localhost:3001)
6. **Check traces** on Jaeger (http://localhost:16686)

---

## 📝 Notes

- All sensitive values are in `.env` (git-ignored)
- Database migrations run automatically
- Kafka topics auto-created on first message
- HAProxy health checks configured
- Full distributed tracing enabled
- 15+ alert rules configured
