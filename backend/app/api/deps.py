from typing import Generator, List
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from app.db.database import get_db
from app.core.config import settings
from app.core.security import decode_token
from app.core.exceptions import AppException
from app.models.auth import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise AppException("Could not validate credentials or token expired", status_code=401)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise AppException("Could not validate credentials", status_code=401)
        
    import uuid
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user:
        raise AppException("User not found", status_code=404)
    if not user.is_active:
        raise AppException("Inactive user", status_code=400)
    
    return user

class RequireRole:
    """Dependency injection class to enforce RBAC permissions."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        role = db.query(Role).filter(Role.id == current_user.role_id).first()
        if not role or role.name not in self.allowed_roles:
            raise AppException("Not enough permissions to access this resource", status_code=403)
        return current_user

class RequireOfficerOrAdmin:
    """Dependency injection to ensure user is an Officer or Admin."""
    def __init__(self, allowed_roles: List[str] = None):
        self.allowed_roles = allowed_roles or ["Super Admin", "Mandal Admin", "Village Admin", "Officer", "Admin"]

    def __call__(self, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        role = db.query(Role).filter(Role.id == current_user.role_id).first()
        if role and role.name in self.allowed_roles:
            return current_user
        if current_user.role_id in [1, 2, 3]:
            return current_user
        raise AppException("Not enough permissions to access this resource", status_code=403)

