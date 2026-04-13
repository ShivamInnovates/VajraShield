import json
from services.graph_engine import FraudGraph

def run_tests():
    print("============================================================")
    print("VajraShield Lane 2 Graph Engine - Test Suite")
    print("============================================================\n")

    # Instantiate the connection
    print("Instantiating FraudGraph connection to local Neo4j (port 8687)...")
    graph = FraudGraph()

    # NOTE: Uncomment the line below the very first time you set up the environment 
    # to ingest the CSV data into the neo4j graph database. Once the graph is populated,
    # comment it out again to prevent redundant runs.
    #graph.build_graph_from_csv("chakravyuh_transactions.csv")

    # Test 1: Normal User Checking
    print("\n--- Test 1: Testing Normal User Routing ---")
    print("Input: device_id='bab8c968', ip_address='136.168.124.16'")
    result_1 = graph.check_for_fraud_ring(device_id="bab8c968", ip_address="136.168.124.16")
    print("Result:", json.dumps(result_1, indent=2))

    # Test 2: Injected Fraud Ring Attack
    print("\n--- Test 2: Testing Injected Fraud Ring Attack ---")
    print("Input: device_id='SHARED_DEMO_DEV', ip_address='192.168.1.1'")
    result_2 = graph.check_for_fraud_ring(device_id="SHARED_DEMO_DEV", ip_address="192.168.1.1")
    print("Result:", json.dumps(result_2, indent=2))

    # Close connection gracefully
    graph.close()

if __name__ == "__main__":
    run_tests()
