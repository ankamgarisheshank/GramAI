from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.models.auth import User
from app.schemas.user import UserLogin, UserRegister, TokenSchema, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import AppException

class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def login(self, creds: UserLogin) -> TokenSchema:
        user = self.repo.get_by_email_or_phone(creds.username)
        if not user or not verify_password(creds.password, user.hashed_password):
            raise AppException("Incorrect email/phone or password", status_code=401)
        
        if not user.is_active:
            raise AppException("Inactive user", status_code=400)

        return TokenSchema(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id)
        )
        
    def register(self, data: UserRegister) -> UserResponse:
        if not data.email and not data.phone_number:
            raise AppException("Must provide either email or phone number", status_code=400)
            
        identifier = data.email or data.phone_number
        if self.repo.get_by_email_or_phone(identifier):
            raise AppException("User with this email/phone already exists", status_code=400)
            
        user = User(
            email=data.email,
            phone_number=data.phone_number,
            hashed_password=get_password_hash(data.password),
            role_id=data.role_id
        )
        created_user = self.repo.create(user)
        return UserResponse.model_validate(created_user)
