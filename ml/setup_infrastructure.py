"""
setup_infrastructure.py
=======================
Quick setup script for VajraShield infrastructure (Redis + Neo4j).

This script:
1. Checks if Redis and Neo4j are running
2. Loads demo data into Redis
3. Verifies connections
4. Provides setup instructions if needed
"""

import sys

def check_and_setup():
    """Check infrastructure and load demo data."""
    
    print("="*60)
    print("VajraShield Infrastructure Setup")
    print("="*60)
    
    # Check Redis
    print("\n1. Checking Redis...")
    try:
        from redis_filter import redis_health_check, load_demo_data
        if redis_health_check():
            print("   ✓ Redis is running")
            print("   Loading demo data...")
            load_demo_data()
            
            # Load test data for velocity tests
            print("   Loading test velocity data...")
            from redis_filter import get_redis_client
            import time
            r = get_redis_client()
            if r:
                # Test 2: C_VEL_001 needs 12 transactions in last hour
                now = time.time()
                for i in range(12):
                    r.zadd('velocity:C_VEL_001', {f'txn_{i}': now - (i * 60)})
                r.expire('velocity:C_VEL_001', 7200)
                print("   ✓ Test velocity data loaded")
            
            print("   ✓ Demo data loaded")
        else:
            print("   ✗ Redis is not running")
            print("\n   Start Redis:")
            print("   docker run -d --name redis -p 6379:6379 redis:latest")
            return False
    except ImportError:
        print("   ✗ Redis library not installed")
        print("   Install: pip install redis")
        return False
    except Exception as e:
        print(f"   ✗ Redis error: {e}")
        return False
    
    # Check Neo4j
    print("\n2. Checking Neo4j...")
    try:
        from graph_scorer import get_neo4j_engine
        engine = get_neo4j_engine()
        if engine and engine.health_check():
            print("   ✓ Neo4j is running")
            stats = engine.get_stats()
            print(f"   Graph: {stats.get('accounts', 0)} accounts, {stats.get('fraud_accounts', 0)} fraud")
        else:
            print("   ✗ Neo4j is not running")
            print("\n   Start Neo4j:")
            print("   docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest")
            return False
    except ImportError:
        print("   ✗ Neo4j library not installed")
        print("   Install: pip install neo4j")
        return False
    except Exception as e:
        print(f"   ✗ Neo4j error: {e}")
        return False
    
    # Check River model
    print("\n3. Checking River ML model...")
    try:
        import joblib
        model = joblib.load('vajrashield_model_warmed.pkl')
        print("   ✓ River model loaded")
    except FileNotFoundError:
        print("   ✗ Model not found")
        print("   Train model: python step4_train_river.py")
        return False
    except Exception as e:
        print(f"   ✗ Model error: {e}")
        return False
    
    print("\n" + "="*60)
    print("✅ All infrastructure is ready!")
    print("="*60)
    print("\nYou can now run:")
    print("  python step7_test_pipeline.py    # Run tests")
    print("  python run_vajrashield.py        # Full system check")
    print("\nOr use directly:")
    print("  from decision_engine import make_decision")
    
    return True


if __name__ == '__main__':
    if not check_and_setup():
        print("\n" + "="*60)
        print("❌ Setup incomplete. Fix issues above and try again.")
        print("="*60)
        sys.exit(1)
