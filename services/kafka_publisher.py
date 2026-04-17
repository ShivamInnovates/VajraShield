from kafka import KafkaProducer
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KafkaPublisher:
    """Publish events to various Kafka topics for downstream processing"""
    
    def __init__(self):
        bootstrap_servers = os.getenv('KAFKA_BROKERS', 'localhost:9092').split(',')
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks='all', # Ensure data durability as per diagram
                retries=5
            )
            logger.info(f"✓ Kafka publisher connected to {bootstrap_servers}")
        except Exception as e:
            logger.error(f"✗ Failed to connect to Kafka: {e}")
            self.producer = None

    def publish(self, topic: str, message: dict):
        """Publish message to a specific topic"""
        if not self.producer:
            logger.warning(f"Kafka producer not available. Skipping message to {topic}")
            return
            
        try:
            future = self.producer.send(topic, message)
            # We can wait for the result if high durability is required synchronously
            # record = future.get(timeout=10) 
            logger.info(f"Published message to {topic}")
        except Exception as e:
            logger.error(f"Error publishing to {topic}: {e}")

# Global instance
publisher = KafkaPublisher()

def publish_event(topic: str, message: dict):
    publisher.publish(topic, message)
