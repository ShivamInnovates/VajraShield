"""
Database Migrations for VajraShield

Run with: alembic upgrade head
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Enum, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String(36), primary_key=True)
    sender = Column(String(255), nullable=False, index=True)
    receiver = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING, index=True)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(Enum(RiskLevel))
    decision = Column(String(50))  # approve, reject, escalate
    reviewer_id = Column(String(255))
    review_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime)
    metadata = Column(JSON)
    
    __table_args__ = (
        Index('idx_txn_status_created', 'status', 'created_at'),
        Index('idx_txn_sender_receiver', 'sender', 'receiver'),
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    txn_id = Column(String(36), index=True)
    event_type = Column(String(50))
    user_id = Column(String(255))
    action = Column(String(100))
    payload = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_audit_txn_timestamp', 'txn_id', 'timestamp'),
        Index('idx_audit_user_timestamp', 'user_id', 'timestamp'),
    )

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255))
    role = Column(String(50))  # admin, reviewer, analyst
    is_active = Column(String, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    __table_args__ = (
        Index('idx_user_email', 'email'),
    )

class RiskScoringHistory(Base):
    __tablename__ = "risk_scoring_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    txn_id = Column(String(36), index=True)
    score = Column(Float)
    factors = Column(JSON)  # Risk factors contributing to score
    model_version = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

class FlaggedTransaction(Base):
    __tablename__ = "flagged_transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    txn_id = Column(String(36), unique=True, index=True)
    flag_reason = Column(String(500))
    flag_date = Column(DateTime, default=datetime.utcnow)
    sla_deadline = Column(DateTime)  # 30 min SLA
    resolved_at = Column(DateTime)
    resolved_by = Column(String(255))
    evidence = Column(JSON)  # Risk factors
