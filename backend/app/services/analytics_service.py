from sqlalchemy.orm import Session
from app.models.auth import User
from app.models.scheme import Scheme, SavedSchemes

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_metrics(self) -> dict:
        total_users = self.db.query(User).count()
        total_schemes = self.db.query(Scheme).filter(Scheme.is_deleted == False).count()
        total_saved = self.db.query(SavedSchemes).count()
        
        return {
            "total_users": total_users,
            "total_schemes": total_schemes,
            "total_saved_schemes": total_saved
        }
