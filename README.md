# VajraShield Complete Project Structure

## Folder Organization

```
VajraShield/
├── frontend/
│   └── dashboard/          # React dashboard for transaction review
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Page components (ReviewQueue, Dashboard, etc)
│       │   ├── services/   # API client & WebSocket handlers
│       │   └── App.jsx     # Main app component
│       ├── package.json
│       └── Dockerfile
│
├── api_gateway/            # FastAPI Gateway with auth & security
│       ├── main.py         # FastAPI app with endpoints
│       ├── middleware/
│       ├── requirements.txt
│       └── Dockerfile
│
├── security/               # Security layer
│       ├── waf/           # Web Application Firewall
│       │   └── middleware.py
│       ├── rate_limiter/  # Rate limiting per IP/user
│       │   └── middleware.py
│       └── auth/          # JWT, mTLS, cryptography
│           └── crypto.py
│
├── infrastructure/         # Infrastructure & event processing
│       ├── load_balancer/
│       │   └── haproxy.cfg
│       └── kafka/         # Kafka consumers
│           ├── txn_consumer.py      # Process txn events
│           └── dashboard_consumer.py # Push to WebSocket
│
├── database/              # Database layer
│       ├── models.py      # SQLAlchemy models (Transaction, User, etc)
│       └── migrations/    # Alembic migrations
│
├── observability/         # Monitoring & logging
│       ├── prometheus/    # Metrics collection
│       │   ├── prometheus.yml
│       │   ├── alerts.yml
│       │   └── alertmanager.yml
│       ├── grafana/       # Dashboards
│       │   └── provisioning/
│       └── jaeger/        # Distributed tracing
│
├── docker-compose.yml     # All services in one file
├── .env.example          # Environment variables template
└── README.md             # Project documentation

```

## Components Breakdown

### 1. **Frontend Dashboard** (`frontend/dashboard/`)
- **ReviewQueue Page**: Display flagged transactions (SLA 30 min)
- **Dashboard Page**: Metrics, trends, risk distribution charts
- **TransactionDetail Page**: Full transaction context + evidence
- **Navbar**: Navigation across all pages
- **API Service**: JWT auth, axios client with interceptors
- **WebSocket Service**: Real-time updates from Kafka

### 2. **API Gateway** (`api_gateway/`)
- JWT authentication & validation
- Request routing to microservices
- Health check endpoint
- Metrics exposure (/metrics)

### 3. **Security Layers** (`security/`)
- **WAF Middleware**: SQL injection, XSS, CSRF protection
- **Rate Limiter**: Per-IP (1000/hr), per-user (100/min) limits
- **Crypto Manager**: JWT signing, mTLS certificate validation

### 4. **Infrastructure** (`infrastructure/`)
- **HAProxy**: Load balancer with health checks & circuit breaker
- **Kafka Consumers**: 
  - Process txn-events → PostgreSQL audit logs
  - Consume dashboard-ws → WebSocket broadcast

### 5. **Database** (`database/`)
- PostgreSQL schemas: Transactions, Users, AuditLogs, FlaggedTransactions
- Neo4j: Transaction graphs & money flows
- Redis: Cache & session store

### 6. **Observability** (`observability/`)
- Prometheus: Metrics from all services
- Grafana: Pre-built dashboards
- Jaeger: Distributed tracing for latency analysis
- AlertManager: Critical alerts → PagerDuty/Slack

## Key Features

✅ **Real-time Dashboard** - WebSocket updates every transaction
✅ **30-min SLA Enforcement** - Alerts on breaches
✅ **Enterprise Security** - mTLS, rate limiting, WAF
✅ **Event-driven** - Kafka pub/sub for async processing
✅ **Observability** - Full distributed tracing & metrics
✅ **CI/CD Ready** - Docker Compose for local dev + prod config

## To Deploy

1. Set environment variables in `.env`
2. Run: `docker-compose up -d`
3. Access dashboard at `http://localhost:3000`
4. Access Grafana at `http://localhost:3001`
5. View Jaeger traces at `http://localhost:16686`
