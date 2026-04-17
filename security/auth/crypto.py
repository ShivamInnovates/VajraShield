import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
import base64

class CryptoManager:
    """Manage JWT, mTLS, and request signing"""
    
    def __init__(self):
        self.private_key_path = os.getenv("PRIVATE_KEY_PATH", "/etc/vajrashield/keys/private.pem")
        self.public_key_path = os.getenv("PUBLIC_KEY_PATH", "/etc/vajrashield/keys/public.pem")
        self.load_keys()
    
    def load_keys(self):
        """Load RSA keys from disk"""
        try:
            with open(self.private_key_path, 'rb') as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(),
                    password=None
                )
            with open(self.public_key_path, 'rb') as f:
                self.public_key = serialization.load_pem_public_key(f.read())
        except FileNotFoundError:
            print("Warning: Keys not found. Generate with: openssl genrsa -out private.pem 2048")
    
    def sign_payload(self, payload: bytes) -> str:
        """Sign payload with private key"""
        signature = self.private_key.sign(
            payload,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')
    
    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """Verify payload signature"""
        try:
            sig_bytes = base64.b64decode(signature)
            self.public_key.verify(
                sig_bytes,
                payload,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except:
            return False
