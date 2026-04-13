import pandas as pd
from neo4j import GraphDatabase

class FraudGraph:
    def __init__(self):
        # 1. Connection: Connect to the local Neo4j instance
        self.uri = "neo4j://localhost:8687"
        self.user = "neo4j"
        self.password = "password"
        
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        except Exception as e:
            print(f"Failed to create the driver: {e}")

    def close(self):
        if hasattr(self, 'driver') and self.driver:
            self.driver.close()

    def build_graph_from_csv(self, csv_path):
        """
        2. Data Ingestion (The Builder)
        Reads the CSV file using pandas and merges Accounts, Devices, and IPs into the graph.
        """
        try:
            # Read only the necessary columns to optimize memory usage
            df = pd.read_csv(csv_path, usecols=['user_id', 'device_id', 'ip_address'])
        except Exception as e:
            print(f"Error reading CSV {csv_path}: {e}")
            return
            
        # Drop duplicates to minimize processing overhead before sending to Neo4j
        df = df.dropna(subset=['user_id', 'device_id', 'ip_address']).drop_duplicates()
        records = df.to_dict('records')
        
        # Cypher query leveraging UNWIND for efficient bulk insertion
        query = """
        UNWIND $records AS row
        MERGE (a:Account {id: row.user_id})
        MERGE (d:Device {id: row.device_id})
        MERGE (i:IP {id: row.ip_address})
        MERGE (a)-[:USES_DEVICE]->(d)
        MERGE (a)-[:CONNECTED_FROM]->(i)
        """
        
        try:
            with self.driver.session() as session:
                session.run(query, records=records)
            print(f"Successfully processed {len(records)} unique graph relationships from {csv_path}.")
        except Exception as e:
            print(f"Error running graph ingestion query: {e}")

    def check_for_fraud_ring(self, device_id, ip_address):
        """
        3. Ring Detection (The Live Checker)
        Queries Neo4j to find how many distinct Account nodes connect to the given device and IP.
        """
        # Query for distinct accounts linked to the given device_id
        device_query = """
        MATCH (a:Account)-[:USES_DEVICE]->(d:Device {id: $device_id})
        RETURN count(DISTINCT a) AS account_count
        """
        
        # Query for distinct accounts linked to the given ip_address
        ip_query = """
        MATCH (a:Account)-[:CONNECTED_FROM]->(i:IP {id: $ip_address})
        RETURN count(DISTINCT a) AS account_count
        """

        device_accounts = 0
        ip_accounts = 0

        try:
            with self.driver.session() as session:
                # Execute device check
                result_device = session.run(device_query, device_id=device_id)
                record_device = result_device.single()
                if record_device:
                    device_accounts = record_device["account_count"]
                    
                # Execute IP check
                result_ip = session.run(ip_query, ip_address=ip_address)
                record_ip = result_ip.single()
                if record_ip:
                    ip_accounts = record_ip["account_count"]
        except Exception as e:
            print(f"Error executing Cypher check queries: {e}")
            return {"status": "ERROR", "reason": str(e)}

        # Evaluate risk conditions
        if device_accounts > 2 or ip_accounts > 3:
            return {
                "status": "RING_DETECTED", 
                "graph_risk_score": 0.9, 
                "reason": "Shared device/IP across multiple accounts"
            }
        else:
            return {
                "status": "CLEAN", 
                "graph_risk_score": 0.1
            }

if __name__ == "__main__":
    # Standard testing syntax to trigger pipeline parts. Avoid running build if not needed.
    pass
