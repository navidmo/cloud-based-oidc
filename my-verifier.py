'''
This Python script demonstrates how to validate a JSON Web Token (JWT) obtained 
from an OpenID Connect (OIDC)-compliant Identity Provider by programmatically 
retrieving and applying the corresponding public key from the provider’s 
JSON Web Key Set (JWKS). It first accepts two command-line arguments: the 
OIDC .well-known discovery URL and the JWT to validate. It decodes the 
JWT header to extract the key identifier (kid), uses the OIDC discovery URL to 
locate the JWKS URI, fetches the key set, and extracts the public RSA key 
corresponding to the kid. This key is then reconstructed into a PEM-encoded 
format suitable for cryptographic operations using the cryptography library.

After obtaining the correct public key, the script attempts to cryptographically
verify the JWT's signature using the jwt library, ensuring that the token has not 
been tampered with. If the signature is valid, it proceeds to decode and display 
the payload, allowing for inspection of standard claims such as sub, iat, and exp. 
The script also performs a simple time-based validation check on the exp (expiration) 
claim to determine whether the token is still temporally valid. This is simple example 
that aims to show how production applications start validating tokens in federated 
identity scenarios using OAuth2/OIDC, such as with IBM App ID.
'''

import sys
import json
import base64
import requests
import jwt
import time
from jwt import InvalidSignatureError
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

def base64url_decode(input_str):
    padded = input_str + '=' * ((4 - len(input_str) % 4) % 4)
    return base64.urlsafe_b64decode(padded)

def get_public_key_from_jwk(jwk):
    n = int.from_bytes(base64url_decode(jwk['n']), 'big')
    e = int.from_bytes(base64url_decode(jwk['e']), 'big')

    pub_numbers = rsa.RSAPublicNumbers(e, n)
    pub_key = pub_numbers.public_key(default_backend())

    pem = pub_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pub_key, pem.decode()

def get_jwk_for_kid(jwks, kid):
    for key in jwks['keys']:
        if key['kid'] == kid:
            return key
    raise ValueError(f"No matching key with kid={kid}")

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <OIDC_WELL_KNOWN_URL> <JWT>")
        sys.exit(1)

    oidc_url = sys.argv[1]
    jwt_token = sys.argv[2]

    # Decode header to get kid
    header_b64 = jwt_token.split('.')[0]
    header = json.loads(base64url_decode(header_b64))
    kid = header['kid']

    print("Decoded JWT Header:")
    print(json.dumps(header, indent=2))

    # Get the OIDC config
    r = requests.get(oidc_url)
    r.raise_for_status()
    oidc_conf = r.json()
    jwks_uri = oidc_conf['jwks_uri']

    # Get JWKS
    r = requests.get(jwks_uri)
    r.raise_for_status()
    jwks = r.json()

    # Extract key and build public key
    jwk = get_jwk_for_kid(jwks, kid)
    public_key, public_key_pem = get_public_key_from_jwk(jwk)

    print("\nExtracted Public Key PEM:")
    print(public_key_pem)

    # Verify Signature (cryptographic check only)
    try:
        decoded = jwt.decode(jwt_token, public_key, algorithms=[header['alg']], options={"verify_exp": False, "verify_aud": False})
        print("\nSignature is cryptographically VALID.")
    except InvalidSignatureError:
        print("\nSignature is INVALID!!")
        sys.exit(1)

    # Decode payload
    print("\nDecoded JWT Payload:")
    print(json.dumps(decoded, indent=2))

    # Check expiration
    now = int(time.time())
    if 'exp' in decoded:
        exp = decoded['exp']
        if now > exp:
            print(f"\nToken is EXPIRED! (exp = {exp}, now = {now})")
            print("    --> Cryptographically valid, but temporally INVALID.")
        else:
            print(f"\nToken is still valid and good. (exp = {exp}, now = {now})")
    else:
        print("\n'exp' claim not present in JWT!! Be careful!")

if __name__ == '__main__':
    main()
