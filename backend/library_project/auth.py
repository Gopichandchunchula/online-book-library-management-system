import base64
import hmac
import hashlib
import json
import time
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model

SECRET = b"libramanage-secure-jwt-secret-key-987654321-active"

def generate_jwt(payload):
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    # Add expiry to payload (default 24h)
    if "exp" not in payload:
        payload["exp"] = int(time.time()) + 86400
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET, signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt(token):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(SECRET, signing_input, hashlib.sha256).digest()
        reconstructed_sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        
        # safely padd base64 string
        def b64_decode(s):
            padded = s + "=" * (4 - len(s) % 4)
            return json.loads(base64.urlsafe_b64decode(padded).decode())
            
        if reconstructed_sig_b64 == sig_b64:
            payload = b64_decode(payload_b64)
            if payload.get('exp', 0) > time.time():
                return payload
        return None
    except Exception:
        return None

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = None
        
        # 1. Look in standard headers
        if hasattr(request, 'headers'):
            auth_header = (
                request.headers.get('Authorization') or 
                request.headers.get('authorization') or 
                request.headers.get('X-Authorization') or 
                request.headers.get('x-authorization') or 
                request.headers.get('X-Library-Token') or 
                request.headers.get('x-library-token')
            )
            
        # 2. Look in WSGI request META
        if not auth_header:
            auth_header = (
                request.META.get('HTTP_AUTHORIZATION') or 
                request.META.get('HTTP_X_AUTHORIZATION') or 
                request.META.get('HTTP_X_LIBRARY_TOKEN')
            )
            
        # 3. Look in HTTP GET query arguments / request parameters
        token = None
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]
        else:
            token = request.query_params.get('token') or request.GET.get('token')
            
        if not token:
            return None
        
        payload = verify_jwt(token)
        if not payload:
            return None
            
        username = payload.get('username')
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return None
            
        return (user, None)
