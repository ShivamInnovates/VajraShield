"""
run_vajrashield.py
==================
Main runner for VajraShield fraud detection system.

Usage:
    python run_vajrashield.py              # Run system checks and tests
    python run_vajrashield.py --skip-checks  # Skip dependency checks
"""

import sys
import argparse

def check_dependencies():
    """Check if required services are available."""
    print("\n" + "="*60)
    print("VajraShield System Check")
    print("="*60)
    
    # Check River model
    try:
        import joblib
        model = joblib.load('vajrashield_model_warmed.pkl')
        print("✓ River ML model loaded")
    except FileNotFoundError:
        print("✗ River model not found - run step4_train_river.py first")
        return False
    except Exception as e:
        print(f"✗ River model error: {e}")
        return False
    
    # Check Neo4j
    try:
        from graph_scorer import get_neo4j_engine
        engine = get_neo4j_engine()
        if engine and engine.health_check():
            print("✓ Neo4j connection successful")
            stats = engine.get_stats()
            print(f"  Graph: {stats.get('accounts', 0)} accounts, {stats.get('fraud_accounts', 0)} fraud")
        else:
            print("✗ Neo4j connection failed")
            print("  Start Neo4j: neo4j start")
            print("  Or use Docker: docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j")
            return False
    except ImportError:
        print("✗ Neo4j library not installed")
        print("  Install: pip install neo4j")
        return False
    
    # Check Redis
    try:
        from redis_filter import redis_health_check
        if redis_health_check():
            print("✓ Redis connection successful")
        else:
            print("✗ Redis connection failed")
            print("  Start Redis: redis-server")
            print("  Or use Docker: docker run -d -p 6379:6379 redis")
            return False
    except ImportError:
        print("✗ Redis library not installed")
        print("  Install: pip install redis")
        return False
    
    return True


def run_tests():
    """Run the test pipeline."""
    print("\n" + "="*60)
    print("Running VajraShield Test Pipeline")
    print("="*60 + "\n")
    
    import subprocess
    result = subprocess.run([sys.executable, 'step7_test_pipeline.py'])
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description='VajraShield Fraud Detection System')
    parser.add_argument('--skip-checks', action='store_true', help='Skip dependency checks')
    args = parser.parse_args()
    
    # Check dependencies
    if not args.skip_checks:
        if not check_dependencies():
            print("\n❌ System check failed. Fix issues above and try again.")
            sys.exit(1)
    
    # Run tests
    print("\n" + "="*60)
    print("All checks passed! Running tests...")
    print("="*60)
    
    if run_tests():
        print("\n" + "="*60)
        print("✅ VajraShield is ready for production!")
        print("="*60)
        print("\nNext steps:")
        print("  1. Integrate with FastAPI: from decision_engine import make_decision")
        print("  2. Set up monitoring: Prometheus + Grafana")
        print("  3. Configure Neo4j cluster for HA")
        print("  4. Optional: Set up Redis for filter engine")
    else:
        print("\n❌ Tests failed. Check output above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
