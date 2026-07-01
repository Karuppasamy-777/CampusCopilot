import logging
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_uid_from_jwt(token: str) -> Optional[str]:
    """
    Decodes the JWT token payload offline without verifying the signature
    to extract the actual Firebase user UID (user_id/sub).
    """
    try:
        import base64
        import json
        parts = token.split('.')
        if len(parts) == 3:
            payload_b64 = parts[1]
            payload_b64 += '=' * (4 - len(payload_b64) % 4)
            payload_bytes = base64.urlsafe_b64decode(payload_b64)
            payload = json.loads(payload_bytes.decode('utf-8'))
            return payload.get("user_id") or payload.get("sub") or payload.get("uid")
    except Exception as e:
        logger.error(f"Error decoding JWT token payload: {e}")
    return None

# Reusable security scheme
security_scheme = HTTPBearer(auto_error=False)

# Initialize Firebase Admin SDK
firebase_initialized = False
try:
    if settings.FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        logger.info("Firebase Admin SDK successfully initialized via credentials file.")
    elif settings.FIREBASE_PROJECT_ID:
        firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        firebase_initialized = True
        logger.info("Firebase Admin SDK successfully initialized via Project ID.")
    else:
        # Attempt to initialize using default credentials (e.g., GCloud, environment defaults)
        try:
            firebase_admin.initialize_app()
            firebase_initialized = True
            logger.info("Firebase Admin SDK initialized using default credentials.")
        except Exception:
            logger.warning(
                "Firebase Credentials not configured. Token validation will run in development mock mode."
            )
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {e}")


async def get_current_user(
    authorization: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> Dict[str, Any]:
    """
    Dependency that extracts the Bearer token from the Authorization header,
    verifies it against Firebase Auth, and returns the user claims.
    """
    if not authorization or not authorization.credentials:
        logger.warning("No Authorization header sent or token is empty.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not authenticated. Please log in first.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.credentials
    logger.info("Authorization header detected. Verifying token...")

    # Development Mock mode: If Firebase is not initialized, mock validation for easy setup
    if not firebase_initialized:
        if settings.APP_ENV == "development" or settings.DEBUG:
            logger.warning("Mock Authentication active (Firebase credentials missing)")
            actual_uid = _get_uid_from_jwt(token)
            fallback_uid = actual_uid or (f"mock-user-id-{token[:8]}" if token else "mock-user-id-default")
            # Allow mock validation for local backend development
            return {
                "uid": fallback_uid,
                "email": "mock.user@example.com",
                "name": "Mock User",
                "email_verified": True,
                "firebase": {"sign_in_provider": "password"}
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication provider is unconfigured"
            )

    try:
        # Verify the Firebase token asynchronously
        decoded_token = auth.verify_id_token(token)
        logger.info("Firebase token verification succeeded.")
        return decoded_token
    except auth.ExpiredIdTokenError as e:
        logger.error(f"Firebase token has expired: {e}")
        if settings.APP_ENV == "development" or settings.DEBUG:
            logger.warning(f"Development fallback active for expired token: {e}")
            actual_uid = _get_uid_from_jwt(token)
            fallback_uid = actual_uid or (f"mock-user-id-{token[:8]}" if token else "mock-user-id-default")
            return {
                "uid": fallback_uid,
                "email": "mock.user@example.com",
                "name": "Mock User",
                "email_verified": True,
                "firebase": {"sign_in_provider": "password"}
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"The token has expired\""},
        )
    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase ID token: {e}")
        if settings.APP_ENV == "development" or settings.DEBUG:
            logger.warning(f"Development fallback active for invalid token: {e}")
            actual_uid = _get_uid_from_jwt(token)
            fallback_uid = actual_uid or (f"mock-user-id-{token[:8]}" if token else "mock-user-id-default")
            return {
                "uid": fallback_uid,
                "email": "mock.user@example.com",
                "name": "Mock User",
                "email_verified": True,
                "firebase": {"sign_in_provider": "password"}
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"The token is invalid\""},
        )
    except Exception as e:
        logger.error(f"Firebase token verification failed with error: {e}")
        # If in development or debug mode, fall back to mock user instead of failing
        if settings.APP_ENV == "development" or settings.DEBUG:
            logger.warning(f"Development fallback active. Using Mock User due to verification failure: {e}")
            actual_uid = _get_uid_from_jwt(token)
            fallback_uid = actual_uid or (f"mock-user-id-{token[:8]}" if token else "mock-user-id-default")
            return {
                "uid": fallback_uid,
                "email": "mock.user@example.com",
                "name": "Mock User",
                "email_verified": True,
                "firebase": {"sign_in_provider": "password"}
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
