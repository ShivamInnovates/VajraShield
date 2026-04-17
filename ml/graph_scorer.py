"""
graph_scorer.py
===============
Neo4j Graph Engine for Fraud Ring Detection
Production-grade graph database replacing NetworkX.

Architecture:
  - Neo4j database for persistent graph storage
  - Cypher queries for fraud ring detection
  - Parallel execution with River ML (250ms hard timeout)
  - Circuit breaker for Neo4j failures

Graph Schema:
  Nodes:
    - Account {id, is_fraud, created_at}
    - Device {id, fingerprint}
    - IP {address, reputation}
  
  Relationships:
    - (Account)-[:USES_DEVICE]->(Device)
    - (Account)-[:USES_IP]->(IP)
    - (Account)-[:SENDS_TO]->(Account)

Fraud Ring Detection:
  Find accounts sharing devices/IPs with known fraud accounts.
  Score = (fraud_connections / total_connections) * 2.5, capped at 1.0
"""

from neo4j import GraphDatabase
from typing import Optional
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Neo4j connection (production: use environment variables)
NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')

# Circuit breaker settings
MAX_QUERY_TIME_MS = 250  # Hard timeout for Lane 2 parallel execution
CIRCUIT_BREAKER_THRESHOLD = 5  # Failures before opening circuit
circuit_breaker_failures = 0
circuit_breaker_open = False


class Neo4jGraphEngine:
    """Neo4j Graph Database for Fraud Ring Detection."""
    
    def __init__(self, uri: str, user: str, password: str):
        """Initialize Neo4j driver with connection pool."""
        try:
            self.driver = GraphDatabase.driver(uri, auth=(user, password))
            self._create_indexes()
            print("✓ Neo4j connection established")
        except Exception as e:
            print(f"✗ Neo4j connection failed: {e}")
            self.driver = None
    
    def close(self):
        """Close Neo4j driver."""
        if self.driver:
            self.driver.close()
    
    def _create_indexes(self):
        """Create indexes for fast lookups."""
        if not self.driver:
            return
        
        with self.driver.session() as session:
            # Index on Account.id for fast lookups
            session.run("CREATE INDEX account_id IF NOT EXISTS FOR (a:Account) ON (a.id)")
            # Index on Account.is_fraud for fraud queries
            session.run("CREATE INDEX account_fraud IF NOT EXISTS FOR (a:Account) ON (a.is_fraud)")
            # Index on Device.id
            session.run("CREATE INDEX device_id IF NOT EXISTS FOR (d:Device) ON (d.id)")
            # Index on IP.address
            session.run("CREATE INDEX ip_address IF NOT EXISTS FOR (i:IP) ON (i.address)")
    
    def update_graph(self, account_id: str, device_id: str, ip: str, is_fraud: int):
        """
        Add/update account, device, IP nodes and relationships.
        Called after every transaction for graph learning.
        
        Cypher query creates nodes if not exist, updates fraud status.
        """
        global circuit_breaker_failures, circuit_breaker_open
        
        if not self.driver or circuit_breaker_open:
            return
        
        try:
            with self.driver.session() as session:
                session.run("""
                    // Create or update Account node
                    MERGE (a:Account {id: $account_id})
                    ON CREATE SET a.created_at = timestamp(), a.is_fraud = $is_fraud
                    ON MATCH SET a.is_fraud = CASE WHEN a.is_fraud = 1 THEN 1 ELSE $is_fraud END
                    
                    // Create or update Device node
                    MERGE (d:Device {id: $device_id})
                    ON CREATE SET d.created_at = timestamp()
                    
                    // Create or update IP node
                    MERGE (i:IP {address: $ip})
                    ON CREATE SET i.created_at = timestamp()
                    
                    // Create relationships (idempotent)
                    MERGE (a)-[:USES_DEVICE]->(d)
                    MERGE (a)-[:USES_IP]->(i)
                """, account_id=account_id, device_id=device_id, ip=ip, is_fraud=is_fraud)
            
            # Reset circuit breaker on success
            circuit_breaker_failures = 0
            
        except Exception as e:
            circuit_breaker_failures += 1
            if circuit_breaker_failures >= CIRCUIT_BREAKER_THRESHOLD:
                circuit_breaker_open = True
                print(f"⚠ Neo4j circuit breaker OPEN after {circuit_breaker_failures} failures")
    
    def get_fraud_ring_score(self, account_id: str, device_id: str = None, ip: str = None) -> float:
        """
        Calculate fraud ring risk score 0.0 - 1.0.
        
        Algorithm:
          1. Find all devices/IPs this account uses (or will use if new)
          2. Find all other accounts connected through those devices/IPs
          3. Count how many are confirmed fraud (is_fraud = 1)
          4. Score = (fraud_count / total_count) * 2.5, capped at 1.0
        
        Timeout: 250ms hard limit for Lane 2 parallel execution.
        """
        global circuit_breaker_open
        
        if not self.driver or circuit_breaker_open:
            return 0.0  # Fail open if Neo4j down
        
        try:
            start_time = time.time()
            
            with self.driver.session() as session:
                # For new accounts: check fraud connections via device/IP
                if device_id and ip:
                    result = session.run("""
                        // Find accounts sharing this device or IP
                        MATCH (other:Account)
                        WHERE other.id <> $account_id
                        AND (
                            (other)-[:USES_DEVICE]->(:Device {id: $device_id})
                            OR (other)-[:USES_IP]->(:IP {address: $ip})
                        )
                        
                        // Count total and fraud accounts
                        WITH count(other) as total_connections,
                             sum(CASE WHEN other.is_fraud = 1 THEN 1 ELSE 0 END) as fraud_connections
                        
                        RETURN total_connections, fraud_connections
                    """, account_id=account_id, device_id=device_id, ip=ip)
                else:
                    # For existing accounts: check their device/IP connections
                    result = session.run("""
                        // Find this account's devices and IPs
                        MATCH (a:Account {id: $account_id})
                        OPTIONAL MATCH (a)-[:USES_DEVICE]->(d:Device)
                        OPTIONAL MATCH (a)-[:USES_IP]->(i:IP)
                        
                        // Find other accounts sharing those devices/IPs
                        WITH a, collect(DISTINCT d) as devices, collect(DISTINCT i) as ips
                        UNWIND devices + ips as resource
                        MATCH (other:Account)-[r]->(resource)
                        WHERE other.id <> a.id
                        
                        // Count total and fraud accounts
                        WITH count(DISTINCT other) as total_connections,
                             sum(CASE WHEN other.is_fraud = 1 THEN 1 ELSE 0 END) as fraud_connections
                        
                        RETURN total_connections, fraud_connections
                    """, account_id=account_id)
                
                record = result.single()
                
                # Check timeout
                elapsed_ms = (time.time() - start_time) * 1000
                if elapsed_ms > MAX_QUERY_TIME_MS:
                    print(f"⚠ Neo4j query timeout: {elapsed_ms:.0f}ms > {MAX_QUERY_TIME_MS}ms")
                    return 0.0
                
                if not record or record['total_connections'] == 0:
                    return 0.0
                
                total = record['total_connections']
                fraud = record['fraud_connections']
                
                # Calculate score with 2.5x amplifier
                raw_score = fraud / total
                amplified = min(raw_score * 2.5, 1.0)
                
                return round(amplified, 4)
        
        except Exception as e:
            print(f"Neo4j query error: {e}")
            return 0.0
    
    def mark_account_fraud(self, account_id: str):
        """
        Explicitly mark account as fraud.
        Called when fraud is confirmed by human review.
        """
        if not self.driver or circuit_breaker_open:
            return
        
        try:
            with self.driver.session() as session:
                session.run("""
                    MERGE (a:Account {id: $account_id})
                    SET a.is_fraud = 1, a.fraud_confirmed_at = timestamp()
                """, account_id=account_id)
        except:
            pass
    
    def preload_fraud_ring(self, accounts: list, device_id: str, ip: str):
        """
        Preload known fraud ring for demo/testing.
        Creates accounts marked as fraud sharing device/IP.
        """
        if not self.driver:
            return
        
        try:
            with self.driver.session() as session:
                for account_id in accounts:
                    session.run("""
                        MERGE (a:Account {id: $account_id})
                        SET a.is_fraud = 1, a.created_at = timestamp()
                        
                        MERGE (d:Device {id: $device_id})
                        MERGE (i:IP {address: $ip})
                        
                        MERGE (a)-[:USES_DEVICE]->(d)
                        MERGE (a)-[:USES_IP]->(i)
                    """, account_id=account_id, device_id=device_id, ip=ip)
            
            print(f"Preloaded fraud ring: {accounts} sharing {device_id}")
        except Exception as e:
            print(f"Failed to preload fraud ring: {e}")
    
    def get_stats(self) -> dict:
        """Get graph statistics for monitoring."""
        if not self.driver:
            return {}
        
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (a:Account)
                    OPTIONAL MATCH (d:Device)
                    OPTIONAL MATCH (i:IP)
                    RETURN 
                        count(DISTINCT a) as accounts,
                        sum(CASE WHEN a.is_fraud = 1 THEN 1 ELSE 0 END) as fraud_accounts,
                        count(DISTINCT d) as devices,
                        count(DISTINCT i) as ips
                """)
                record = result.single()
                return {
                    'accounts': record['accounts'],
                    'fraud_accounts': record['fraud_accounts'],
                    'devices': record['devices'],
                    'ips': record['ips'],
                }
        except:
            return {}
    
    def health_check(self) -> bool:
        """Check if Neo4j is reachable."""
        if not self.driver:
            return False
        try:
            with self.driver.session() as session:
                session.run("RETURN 1")
            return True
        except:
            return False


# Global Neo4j instance (singleton)
neo4j_engine = None

def get_neo4j_engine() -> Optional[Neo4jGraphEngine]:
    """Get or create Neo4j engine singleton."""
    global neo4j_engine
    if neo4j_engine is None:
        try:
            neo4j_engine = Neo4jGraphEngine(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
        except:
            neo4j_engine = None
    return neo4j_engine


# ── Public API ────────────────────────────────────────────────────────────────

def update_graph(account_id: str, device_id: str, ip: str, is_fraud: int):
    """Update Neo4j graph with transaction data."""
    engine = get_neo4j_engine()
    if engine:
        engine.update_graph(account_id, device_id, ip, is_fraud)


def get_graph_risk_score(account_id: str, device_id: str = None, ip: str = None) -> float:
    """Get fraud ring risk score from Neo4j."""
    engine = get_neo4j_engine()
    if engine:
        return engine.get_fraud_ring_score(account_id, device_id, ip)
    return 0.0


def mark_account_fraud(account_id: str):
    """Mark account as confirmed fraud in Neo4j."""
    engine = get_neo4j_engine()
    if engine:
        engine.mark_account_fraud(account_id)


def preload_fraud_ring(accounts: list, device_id: str, ip: str):
    """Preload fraud ring for testing."""
    engine = get_neo4j_engine()
    if engine:
        engine.preload_fraud_ring(accounts, device_id, ip)


if __name__ == '__main__':
    # Test Neo4j connection
    engine = get_neo4j_engine()
    if engine and engine.health_check():
        print("✓ Neo4j health check passed")
        stats = engine.get_stats()
        print(f"  Graph stats: {stats}")
    else:
        print("✗ Neo4j connection failed")
        print("  Install: https://neo4j.com/download/")
        print("  Start: neo4j start")
        print("  Default credentials: neo4j/password")
