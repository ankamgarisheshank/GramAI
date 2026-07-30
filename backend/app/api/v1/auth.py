from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.user import UserLogin, UserRegister, TokenSchema, UserResponse
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
    current_user: User = Depends(get_current_user)
):
    """
    Get the currently authenticated user's details.
    """

    return StandardResponse(
        success=True,
        data=UserResponse.model_validate(current_user),
    )
