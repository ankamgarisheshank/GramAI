from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.user import UserLogin, UserRegister, TokenSchema, UserResponse, GoogleAuthRequest
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.auth import User

router = APIRouter()


@router.post("/login", response_model=StandardResponse[TokenSchema])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return JWT tokens.
    Supports Swagger OAuth2 Authorize.
    """
    service = AuthService(db)
    creds = UserLogin(
        username=form_data.username,
        password=form_data.password,
    )
    tokens = service.login(creds)
    return StandardResponse(
        success=True,
        message="Login successful",
        data=tokens,
    )

from pydantic import BaseModel
class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=StandardResponse[TokenSchema])
def refresh_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token.
    """
    from app.core.security import decode_token, create_access_token, create_refresh_token
    from app.core.exceptions import AppException
    
    payload = decode_token(data.refresh_token)
    if not payload:
        raise AppException("Invalid refresh token", status_code=401)
        
    user_id = payload.get("sub")
    if not user_id:
        raise AppException("Invalid token payload", status_code=401)
        
    import uuid
    # Check if user exists
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user or not user.is_active:
        raise AppException("User not found or inactive", status_code=401)
        
    tokens = TokenSchema(
        access_token=create_access_token(subject=user.id),
        refresh_token=create_refresh_token(subject=user.id)
    )
    
    return StandardResponse(
        success=True,
        message="Token refreshed successfully",
        data=tokens,
    )



@router.post("/google", response_model=StandardResponse[TokenSchema])
def google_login(
    data: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate or register user using Google OAuth token.
    """
    service = AuthService(db)
    tokens = service.google_login(token=data.token, role_id=data.role_id)
    
    return StandardResponse(
        success=True,
        message="Google Login successful",
        data=tokens,
    )


@router.post("/register", response_model=StandardResponse[UserResponse])
def register(
    data: UserRegister,
    db: Session =Depends(get_db)
):
    """
    Register a new user.
    """

    service = AuthService(db)
    user = service.register(data)

    return StandardResponse(
        success=True,
        message="Registration successful",
        data=user,
    )


@router.get("/me", response_model=StandardResponse[UserResponse])
def get_current_logged_in_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the currently authenticated user's details including verified role and persona.
    """
    from app.models.auth import Role
    persona = None
    if current_user.profile and current_user.profile.occupation:
        occ = current_user.profile.occupation.strip().lower()
        if "farmer" in occ:
            persona = "farmer"
        elif "student" in occ:
            persona = "student"
        elif "senior" in occ or "elder" in occ or "pension" in occ:
            persona = "senior"
        else:
            persona = occ
    elif current_user.email and "farmer" in current_user.email.lower():
        persona = "farmer"
    elif current_user.email and "student" in current_user.email.lower():
        persona = "student"
    elif current_user.email and "senior" in current_user.email.lower():
        persona = "senior"

    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    role_name = role.name if role else ("Super Admin" if current_user.role_id == 1 else "Citizen")

    user_data = UserResponse(
        id=current_user.id,
        email=current_user.email,
        phone_number=current_user.phone_number,
        role_id=current_user.role_id,
        persona=persona,
        role_name=role_name
    )

    return StandardResponse(
        success=True,
        data=user_data,
    )


from pydantic import BaseModel, EmailStr
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password", response_model=StandardResponse)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate forgot password flow.
    """
    from app.core.security import create_reset_token
    import logging
    logger = logging.getLogger("gramai")

    user = db.query(User).filter(User.email == data.email).first()
    if user:
        reset_token = create_reset_token(subject=user.id)
        # In production, send email with reset link and token
        logger.info(f"Generated password reset token for {data.email}: {reset_token}")
        
    return StandardResponse(
        success=True,
        message="If your email is registered, you will receive a reset link shortly."
    )


@router.post("/reset-password", response_model=StandardResponse)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Complete reset password flow.
    """
    from app.core.security import decode_token, get_password_hash
    from app.core.exceptions import AppException
    
    payload = decode_token(data.token)
    if not payload or payload.get("type") != "reset":
        raise AppException("Invalid or expired reset token", status_code=400)
        
    import uuid
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user:
        raise AppException("User not found", status_code=404)
        
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return StandardResponse(
        success=True,
        message="Password has been reset successfully."
    )
