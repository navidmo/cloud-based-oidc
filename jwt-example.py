#!/usr/bin/env python3

"""
JSON Web Tokens (JWT) are a compact and secure way to transmit authentication 
information between two parties. They consist of three components:

1. Header: Specifies the token type and signing algorithm.
2. Payload: Contains claims such as user ID, expiration time, and custom attributes.
3. Signature: Ensures the integrity of the token.

JWTs are commonly used for authentication and authorization in web applications, 
enabling secure stateless authentication by encoding user identity and permissions 
within the token itself.

In this example, the JWT is signed using the ES256 algorithm, which stands for 
Elliptic Curve Digital Signature Algorithm (ECDSA) with the SHA-256 hash function. 
Unlike traditional RSA-based signing methods, ES256 is based on elliptic curve 
cryptography (ECC), offering strong security with smaller key sizes compared to RSA. 
This makes ES256 more efficient in terms of performance and bandwidth, making it 
a preferred choice for mobile and web applications where computational overhead 
needs to be minimized.

When generating a JWT using ES256, the script first creates an elliptic curve 
private key, which is used to sign the JWT. The corresponding public key is then 
used to verify the token's authenticity. Since ES256 signatures are deterministic 
and compact, they provide the same level of security as an RSA 2048-bit key 
with only a 256-bit key size, reducing cryptographic overhead while maintaining 
a high level of security.

The verification process ensures that the received JWT has not been tampered with 
and is valid. When verifying a JWT signed with ES256, the script extracts the 
header and payload, then uses the stored public key to validate the signature. 
If the signature is valid and the token has not expired, the decoded payload is 
returned, confirming the token’s authenticity. This mechanism ensures that only 
legitimate tokens, signed with the private key, can be accepted for authentication 
or authorization purposes.
"""

import os
import sys
import subprocess

VENV_DIR = ".venv"

# Step 1: Ensure Virtual Environment is Active
def ensure_venv():
    """Ensure the script runs inside a virtual environment. If not, create and activate it."""
    if sys.prefix == os.path.abspath(VENV_DIR):  
        print("Virtual environment is already active.")
        return  # Stop further execution if already inside venv

    print("Virtual environment not detected. Setting up...")

    # Create a virtual environment if it doesn't exist
    if not os.path.exists(VENV_DIR):
        subprocess.run([sys.executable, "-m", "venv", VENV_DIR], check=True)

    venv_python = os.path.join(VENV_DIR, "bin", "python") if sys.platform != "win32" else os.path.join(VENV_DIR, "Scripts", "python")

    # Install dependencies
    subprocess.run([venv_python, "-m", "pip", "install", "--upgrade", "pip"], check=True)
    subprocess.run([venv_python, "-m", "pip", "install", "cryptography", "pyjwt", "argparse"], check=True)

    # Restart script inside the virtual environment only once
    if "VIRTUAL_ENV" not in os.environ:
        print(f"Restarting inside virtual environment: {venv_python}")
        os.execv(venv_python, [venv_python] + sys.argv)

# Ensure virtual environment is ready **before** importing dependencies
ensure_venv()

# Now it's safe to import libraries
import jwt
import time
import argparse
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives import serialization

# Step 2: Generate RSA or ECC Keys with Configurable Strength
def generate_keys(algorithm, key_strength):
    if algorithm == "RS256":
        print(f"Generating RSA {key_strength}-bit key...")
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_strength
        )
        public_key = private_key.public_key()
    elif algorithm == "ES512":
        ecc_curve = {
            256: ec.SECP256R1(),
            384: ec.SECP384R1(),
            521: ec.SECP521R1()
        }.get(key_strength, ec.SECP521R1())  # Default to secp521r1 if invalid input
        
        print(f"Generating ECC {key_strength}-bit key ({ecc_curve.name})...")
        private_key = ec.generate_private_key(ecc_curve)
        public_key = private_key.public_key()
    else:
        raise ValueError("Unsupported algorithm. Use RS256 (RSA) or ES512 (ECC).")

    # Serialize private key (ASCII-only)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ).decode("ascii", errors="ignore")

    # Serialize public key (ASCII-only)
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("ascii", errors="ignore")

    return private_pem, public_pem

# Step 3: Load RSA or ECC keys from memory
def load_keys(algorithm, key_strength):
    private_pem, public_pem = generate_keys(algorithm, key_strength)

    # Load private key
    private_key = serialization.load_pem_private_key(private_pem.encode("ascii"), password=None)

    # Load public key
    public_key = serialization.load_pem_public_key(public_pem.encode("ascii"))

    return private_key, public_key

# Step 4: Create and sign JWT
def create_jwt(private_key, algorithm):
    payload = {
        "sub": "1234567890",
        "name": "John Doe",
        "iat": int(time.time()),
        "exp": int(time.time()) + 600  # Expires in 10 minutes
    }

    token = jwt.encode(payload, private_key, algorithm=algorithm)
    return token

# Step 5: Verify JWT
def verify_jwt(token, public_key, algorithm):
    try:
        decoded = jwt.decode(token, public_key, algorithms=[algorithm])
        print("JWT Verified Successfully! Decoded payload:", decoded)
    except jwt.ExpiredSignatureError:
        print("Error: Token has expired!")
    except jwt.InvalidTokenError:
        print("Error: Invalid Token!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="JWT Generator and Verifier with RSA or ECC")
    parser.add_argument("--algo", choices=["RS256", "ES512"], required=True, help="Choose between RS256 (RSA) or ES512 (ECC)")
    parser.add_argument("--keysize", type=int, choices=[2048, 4096, 8192, 256, 384, 521], required=True,
                        help="Key size: 2048, 4096, 8192 for RSA; 256, 384, 521 for ECC")

    args = parser.parse_args()

    # Generate and load selected keys
    private_key, public_key = load_keys(args.algo, args.keysize)

    # Generate and sign JWT
    jwt_token = create_jwt(private_key, args.algo)
    print(f"\nGenerated JWT ({args.algo} - {args.keysize}-bit):\n", jwt_token)

    # Verify JWT
    print("\nVerifying JWT...")
    verify_jwt(jwt_token, public_key, args.algo)
