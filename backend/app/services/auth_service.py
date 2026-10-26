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
        email = data.email.strip() if data.email else None
        phone = data.phone_number.strip() if data.phone_number else None
        
        if not email and not phone:
            raise AppException("Must provide either email or phone number", status_code=400)
            
        identifier = email or phone
        if self.repo.get_by_email_or_phone(identifier):
            raise AppException("User with this email/phone already exists", status_code=400)
            
        # SECURITY RULE: Farmers, Students, Seniors, Citizens are ALWAYS Citizens (role_id = 4).
        # Only Gov Officer applicants can be role_id = 3 (Village Admin).
        # Administrative roles (1=Super Admin, 2=Mandal Admin) CANNOT be self-registered.
        persona_val = (data.persona or "citizen").strip().lower()
        assigned_role_id = 4 # Default to Citizen
        if data.role_id == 3 and persona_val == "officer":
            assigned_role_id = 3
            
        user = User(
            email=email,
            phone_number=phone,
            hashed_password=get_password_hash(data.password),
            role_id=assigned_role_id
        )
        created_user = self.repo.create(user)

        # Persist persona in CitizenProfile
        from app.models.profile import CitizenProfile
        full_name = (data.full_name or "").strip() or (email.split('@')[0] if email else "Citizen")
        
        profile = CitizenProfile(
            user_id=created_user.id,
            full_name=full_name,
            occupation=persona_val
        )
        self.repo.db.add(profile)
        self.repo.db.commit()
        self.repo.db.refresh(created_user)

        return UserResponse(
            id=created_user.id,
            email=created_user.email,
            phone_number=created_user.phone_number,
            role_id=created_user.role_id,
            persona=persona_val,
            role_name="Citizen" if assigned_role_id == 4 else "Village Admin"
        )

    def google_login(self, token: str, role_id: int = 4) -> TokenSchema:
        import requests
        
        try:
            resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo", 
                headers={"Authorization": f"Bearer {token}"},
                timeout=5
            )
            if resp.status_code != 200:
                raise AppException("Invalid Google token or API failure", status_code=401)
                
            data = resp.json()
            email = data.get("email")
            
            if not email:
                raise AppException("Google token does not contain an email address", status_code=401)
                
        except requests.RequestException:
            raise AppException("Failed to communicate with Google authentication server", status_code=401)
            
        user = self.repo.get_by_email_or_phone(email)
        if not user:
            # Self-registration via Google always defaults to Citizen (role_id = 4)
            safe_role_id = 4 if role_id not in [3] else 3
            user = User(
                email=email,
                hashed_password="", # No password for google auth users
                role_id=safe_role_id
            )
            user = self.repo.create(user)
            from app.models.profile import CitizenProfile
            profile = CitizenProfile(
                user_id=user.id,
                full_name=data.get("name") or email.split('@')[0],
                occupation="citizen"
            )
            self.repo.db.add(profile)
            self.repo.db.commit()
            
        if not user.is_active:
            raise AppException("Inactive user", status_code=400)

        return TokenSchema(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id)
        )
