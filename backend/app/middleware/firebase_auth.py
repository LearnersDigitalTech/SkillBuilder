"""
Firebase Authentication Middleware
Verifies Firebase ID tokens and extracts user information
"""
from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User


# Initialize Firebase Admin SDK (singleton)
_firebase_app = None

def get_firebase_app():
    """Get or initialize Firebase Admin SDK"""
    global _firebase_app
    if _firebase_app is None:
        try:
            # Try to get existing app
            _firebase_app = firebase_admin.get_app()
        except ValueError:
            # Initialize new app
            if settings.firebase_project_id:
                cred = credentials.Certificate(settings.firebase_credentials)
                _firebase_app = firebase_admin.initialize_app(cred)
            else:
                # For development without credentials
                _firebase_app = firebase_admin.initialize_app()
    return _firebase_app


# Security scheme
security = HTTPBearer(auto_error=False)


class FirebaseUser:
    """Represents a verified Firebase user"""
    def __init__(self, uid: str, email: Optional[str], phone: Optional[str], 
                 name: Optional[str], picture: Optional[str], provider: str):
        self.uid = uid
        self.email = email
        self.phone = phone
        self.name = name
        self.picture = picture
        self.provider = provider  # "google.com", "phone", etc.


async def verify_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[FirebaseUser]:
    """
    Verify Firebase ID token from Authorization header.
    Returns FirebaseUser if valid, None if no token provided.
    Raises HTTPException if token is invalid.
    """
    if credentials is None:
        return None
    
    token = credentials.credentials
    
    try:
        # Initialize Firebase if needed
        get_firebase_app()
        
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        
        # Extract user info from token
        uid = decoded_token.get("uid", "")
        email = decoded_token.get("email")
        phone = decoded_token.get("phone_number")
        name = decoded_token.get("name")
        picture = decoded_token.get("picture")
        
        # Determine auth provider
        sign_in_provider = decoded_token.get("firebase", {}).get("sign_in_provider", "unknown")
        
        return FirebaseUser(
            uid=uid,
            email=email,
            phone=phone,
            name=name,
            picture=picture,
            provider=sign_in_provider
        )
    
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_current_user(
    firebase_user: Optional[FirebaseUser] = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current authenticated user from database.
    Creates user if they don't exist (first-time login).
    """
    if firebase_user is None:
        return None
    
    # Look up user in database
    result = await db.execute(
        select(User).where(User.firebase_uid == firebase_user.uid)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        # Create new user on first login
        user = User(
            firebase_uid=firebase_user.uid,
            email=firebase_user.email,
            phone_number=firebase_user.phone,
            name=firebase_user.name,
            profile_picture=firebase_user.picture,
            auth_provider=firebase_user.provider
        )
        db.add(user)
        await db.flush()  # Get the ID without committing
    else:
        # Update last login
        from datetime import datetime
        user.last_login_at = datetime.utcnow()
    
    return user


async def require_auth(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    """
    Dependency that requires authentication.
    Raises 401 if user is not authenticated.
    """
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user


async def require_admin(
    user: User = Depends(require_auth)
) -> User:
    """
    Dependency that requires admin privileges.
    Raises 403 if user is not an admin.
    """
    from app.models.user import UserType
    if user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return user


async def require_teacher(
    user: User = Depends(require_auth)
) -> User:
    """
    Dependency that requires teacher privileges.
    Raises 403 if user is not a teacher or admin.
    """
    from app.models.user import UserType
    if user.user_type not in [UserType.TEACHER, UserType.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Teacher privileges required"
        )
    return user
