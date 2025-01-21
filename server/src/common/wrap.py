from functools import wraps
import os
from flask import request, jsonify
import jwt
from jwt import PyJWKClient

def verify_token(token):
    keys_url = f"https://cognito-idp.{os.getenv('AWS_REGION')}.amazonaws.com/{os.getenv('COGNITO_USER_POOL_ID')}/.well-known/jwks.json"
    jwks_client = PyJWKClient(keys_url)
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(jwt=token, key=signing_key, algorithms=['RS256'], audience=os.getenv('COGNITO_CLIENT_ID'), options={"verify_exp": True})
    
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            claims = verify_token(token)
            request.claims = claims
        except jwt.ExpiredSignatureError:
            return jsonify({'message':'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            print("error: ", e)
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated
