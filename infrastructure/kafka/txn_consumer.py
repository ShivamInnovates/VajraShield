from kafka import KafkaConsumer
import json
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionEventConsumer:
    """Consume transaction events and store in PostgreSQL audit logs"""
    
    def __init__(self):
        self.consumer = KafkaConsumer(
            'txn-events',
            bootstrap_servers=os.getenv('KAFKA_BROKERS', 'localhost:9092').split(','),
            group_id='transaction-audit-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest'
        )
    
    def process_message(self, message):
        """Process transaction event"""
        try:
            data = message.value
            logger.info(f"Processing transaction: {data.get('txn_id')}")
            
            # TODO: Insert into PostgreSQL audit_logs table
            # audit_log = AuditLog(
            #     txn_id=data['txn_id'],
            #     event_type=data['event_type'],
            #     payload=data,
            #     timestamp=datetime.utcnow()
            # )
            # db.session.add(audit_log)
            # db.session.commit()
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    def run(self):
        """Start consuming messages"""
        logger.info("Starting transaction event consumer...")
        for message in self.consumer:
            self.process_message(message)

if __name__ == "__main__":
    consumer = TransactionEventConsumer()
    consumer.run()
