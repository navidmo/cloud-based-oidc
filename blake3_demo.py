
"""
Here we use BLAKE3, which is a modern, high-performance cryptographic hash
function. We demonstrate plain hashing, salted password hashing,
keyed MACs, time-limited tokens, and JSON Web Token (JWT)-like signed tokens
in a compact demo. While BLAKE3 is not traditionally used for
token signing (unlike HMAC-SHA256 or RS256 in JWT), here we also show how
its domain-separated keyed mode can be repurposed securely for authentication
use cases.

Plain Hashing: The blake3_plain() function takes a byte string and computes 
its BLAKE3 digest. This is the baseline usage of any hash function:
to deterministically and irreversibly map data to a fixed-length output. It
is fast and secure, but not safe for storing secrets like passwords because
the same input always yields the same output, which makes it vulnerable to
dictionary and rainbow table attacks.

Salted Hashing: To address the limitations of plain hashing for secrets, we 
use blake3_salted(). This function prepends a randomly generated
salt to the input data before hashing. By using a unique salt for each user
or password, it ensures that even identical inputs produce different hashes,
which defeats precomputed attack strategies. The salt must be stored
alongside the hash for future verification.

Keyed Hashing (MAC): The blake3_mac() function shows how to use BLAKE3
in keyed mode, similar to HMAC. This produces a Message Authentication Code
(MAC), where the key acts as a secret that must be known to generate or
verify the output. This construction ensures that the hash cannot be forged
or reversed without knowledge of the key, and it provides strong integrity
and authenticity guarantees. This is ideal for verifying message integrity
over insecure channels.

Time-Based MAC Tokens: The generate_time_mac() function builds on our MAC
concept by signing a payload that includes an expiration timestamp. It
encodes the payload and signature into a compact URL-safe format using
base64url encoding (compatible with JWT standards). This approach enables the
creation of short-lived tokens that do not require server-side state. The
corresponding verify_time_mac() function verifies the token’s integrity and
freshness by checking both the MAC and the expiration time.

JWT-Style BLAKE3 Tokens: The generate_jwt_b3() function simulates the creation
of a JWT using BLAKE3 as the signing algorithm. It creates a JSON header and
payload, base64url encodes them, concatenates them as header.payload, and append
the signiture string using a BLAKE3 keyed hash. Once this signature is appended, we
will have a full JWT-style token. The verifier function, verify_jwt_b3(), 
splits the token, reconstructs the signing input, recomputes the
signature using the shared key, and uses constant-time comparison for validation. 

Base64 URL-Safe Encoding: Since JWTs and web-based tokens often require
transmission over URLs or HTTP headers, our script also should implement 
b64url_encode() and b64url_decode() to handle base64url-safe encoding. 
This variant avoids characters like +, /, and =, which can interfere with URL 
parsing. 

Constant-Time Verification: A critical aspect of cryptographic security is avoiding 
side channels such as timing attacks. For all MAC and token verification steps, we use 
hmac.compare_digest() instead of the == operator. This ensures that even if an attacker 
can measure response times, they gain no information about how many bytes of the signature 
matched. This is especially important for public-facing services where even small leaks can 
be exploited.

Please note that this script is for educational purpose and act as a foundation
for stateless authentication systems. Time-based MAC tokens are especially
useful for things like email verification links, password reset tokens, or
API access tokens. The BLAKE3-based JWT-like tokens can serve as fast,
minimal alternatives to standard JWTs when asymmetric cryptography is
unnecessary.

For production, many other aspects such as slow-rate hashing sould be considered. We
should also integrate asymmetric cryptography for issuer-verifiable tokens
and integration with existing OAuth2/OIDC flows.

Sample Output:
=== BLAKE3 DEMO: Hashing, MAC, and Token Signing ===

Input Data (plaintext): user-password1234
Random Salt (16 bytes): 7c3d7d93aa627f47db78108a009ce539
Secret Key (32 bytes): 7854ee1dfb273d94786c2f5a579e6b2f0e00a6912526075266f1018e474cd92b

1. Plain BLAKE3 Hash (no salt, no key):
   Hash: 08b93b5b45ac1bee512e004d0981ecef9dc59b80bc7dc22a3b052726e29e5e77

2. Salted BLAKE3 Hash:
   Salt + Data Hash: bc14f2286bb56523d1a77fb32aac8ec886b8b05cedf339f4d06ac60a669ccc24

3. Keyed BLAKE3 MAC:
   Key used: 7854ee1dfb273d94786c2f5a579e6b2f0e00a6912526075266f1018e474cd92b
   MAC (BLAKE3 keyed): a649e8eab44fba06c6e2f44906e0f31b84c29232dcd3519ac69f03ba2442a19b

4. Time-Based MAC Token (expiring in 10 seconds):
   Current Time: 1747019292
   Expiry Time:  1747019302
   Time MAC Token: eyJleHAiOiAxNzQ3MDE5MzAyLCAiZGF0YSI6ICJ1c2VyLXBhc3N3b3JkMTIzNCJ9.EOLXaljiWucP3y9wuGYKUug_lQCfEqM86kdRkHy1oBM
   Verification Result (should be True): True

5. JWT-Style Token Signed with BLAKE3:
   Payload: {'sub': 'user123', 'aud': 'client789', 'iat': 1747019292, 'exp': 1747019352}
   JWT Header + Payload + Signature:
   JWT: eyJhbGciOiJCTEFLRTMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJ1c2VyMTIzIiwiYXVkIjoiY2xpZW50Nzg5IiwiaWF0IjoxNzQ3MDE5MjkyLCJleHAiOjE3NDcwMTkzNTJ9.KRler54FHA5FBOflb4-p75W5w3AynfTQYimobKDhkc4
   JWT Verification Result (should be True): True

=== End of BLAKE3 Demonstration ===


"""

from blake3 import blake3
import hmac
import time
import json
import base64
import secrets

# Helper: Encode/Decode base64 URL-safe
def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def b64url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

# Plain BLAKE3 hash
def blake3_plain(data: bytes) -> bytes:
    return blake3(data).digest()

# Salted BLAKE3 hash
def blake3_salted(data: bytes, salt: bytes) -> bytes:
    hasher = blake3()
    hasher.update(salt + data)
    return hasher.digest()

# BLAKE3 keyed MAC
def blake3_mac(data: bytes, key: bytes) -> bytes:
    hasher = blake3(key=key)
    hasher.update(data)
    return hasher.digest()

# Time-based MAC token (e.g. short-lived token)
def generate_time_mac(data: bytes, key: bytes, ttl: int = 60) -> str:
    expiry = int(time.time()) + ttl
    payload = json.dumps({"exp": expiry, "data": data.decode()}).encode()
    sig = blake3_mac(payload, key)
    return f"{b64url_encode(payload)}.{b64url_encode(sig)}"

def verify_time_mac(token: str, key: bytes) -> bool:
    try:
        payload_b64, sig_b64 = token.split(".")
        payload = b64url_decode(payload_b64)
        sig = b64url_decode(sig_b64)
        recomputed = blake3_mac(payload, key)

        # Constant time compare + expiry check
        if not hmac.compare_digest(sig, recomputed):
            return False
        payload_dict = json.loads(payload)
        return int(time.time()) < payload_dict["exp"]
    except Exception:
        return False

# JWT-style BLAKE3 signed token (OIDC style)
def generate_jwt_b3(payload_dict: dict, key: bytes) -> str:
    header = {"alg": "BLAKE3", "typ": "JWT"}
    header_json = json.dumps(header, separators=(",", ":")).encode()
    payload_json = json.dumps(payload_dict, separators=(",", ":")).encode()
    signing_input = b64url_encode(header_json) + "." + b64url_encode(payload_json)
    sig = blake3_mac(signing_input.encode(), key)
    return f"{signing_input}.{b64url_encode(sig)}"

def verify_jwt_b3(token: str, key: bytes) -> bool:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}".encode()
        sig = b64url_decode(sig_b64)
        expected = blake3_mac(signing_input, key)
        return hmac.compare_digest(sig, expected)
    except Exception:
        return False

# Our BLAKE3 DEMO
if __name__ == "__main__":
    print("=== Our BLAKE3 DEMO: Hashing, MAC, and Token Signing etc. ===\n")

    # Input data
    data = b"user-password1234"
    print(f"Input Data (plaintext): {data.decode()}")

    # Generate cryptographic salt and key
    salt = secrets.token_bytes(16)
    key = secrets.token_bytes(32)
    print(f"Random Salt (16 bytes): {salt.hex()}")
    print(f"Secret Key (32 bytes): {key.hex()}")

    # Plain hash
    plain_hash = blake3_plain(data)
    print("\n1. Plain BLAKE3 Hash (no salt, no key):")
    print(f"   Hash: {plain_hash.hex()}")

    # Salted hash
    salted_hash = blake3_salted(data, salt)
    print("\n2. Salted BLAKE3 Hash:")
    print(f"   Salt + Data Hash: {salted_hash.hex()}")

    # Keyed MAC (Message Authentication Code)
    mac = blake3_mac(data, key)
    print("\n3. Keyed BLAKE3 MAC:")
    print(f"   Key used: {key.hex()}")
    print(f"   MAC (BLAKE3 keyed): {mac.hex()}")

    # Time-based MAC token (short-lived)
    print("\n4. Time-Based MAC Token (expiring in 10 seconds):")
    token = generate_time_mac(data, key, ttl=10)
    current_time = int(time.time())
    expiry_time = current_time + 10
    print(f"   Current Time: {current_time}")
    print(f"   Expiry Time:  {expiry_time}")
    print(f"   Time MAC Token: {token}")
    verified = verify_time_mac(token, key)
    print(f"   Verification Result (should be True): {verified}")

    # JWT-style BLAKE3-signed token
    print("\n5. JWT-Style Token Signed with BLAKE3:")
    payload = {
        "sub": "user123",
        "aud": "client789",
        "iat": int(time.time()),
        "exp": int(time.time()) + 60
    }
    jwt = generate_jwt_b3(payload, key)
    print(f"   Payload: {payload}")
    print("   JWT Header + Payload + Signature:")
    print(f"   JWT: {jwt}")
    verified_jwt = verify_jwt_b3(jwt, key)
    print(f"   JWT Verification Result (should be True): {verified_jwt}")

    print("\n=== End of Our BLAKE3 Demonstration ===")

