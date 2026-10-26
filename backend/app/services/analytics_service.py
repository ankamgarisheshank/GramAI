from sqlalchemy.orm import Session
from collections import defaultdict
from app.models.auth import User, Role
from app.models.scheme import Scheme, SavedSchemes
from app.models.application import Application
from app.models.profile import CitizenProfile
from app.models.location import District

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_metrics(self) -> dict:
        total_applications = self.db.query(Application).count()
        submitted_applications = self.db.query(Application).filter(Application.status.in_(["SUBMITTED", "Pending"])).count()
        under_review_applications = self.db.query(Application).filter(Application.status == "UNDER_REVIEW").count()
        approved_applications = self.db.query(Application).filter(Application.status == "APPROVED").count()
        rejected_applications = self.db.query(Application).filter(Application.status == "REJECTED").count()
        draft_applications = self.db.query(Application).filter(Application.status == "DRAFT").count()

        total_schemes = self.db.query(Scheme).filter(Scheme.is_deleted == False).count()
        active_schemes = self.db.query(Scheme).filter(Scheme.is_deleted == False, Scheme.status == "Active").count()

        total_users = self.db.query(User).count()
        total_citizens = self.db.query(User).filter(User.role_id == 4).count()
        total_officers = self.db.query(User).filter(User.role_id.in_([1, 2, 3])).count()
        total_saved = self.db.query(SavedSchemes).count()

        status_counts = {
            "DRAFT": draft_applications,
            "SUBMITTED": submitted_applications,
            "UNDER_REVIEW": under_review_applications,
            "APPROVED": approved_applications,
            "REJECTED": rejected_applications,
        }

        # 10 most recent applications
        recent_apps_raw = (
            self.db.query(Application)
            .order_by(Application.created_at.desc())
            .limit(10)
            .all()
        )
        recent_applications = []
        for a in recent_apps_raw:
            p = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == a.user_id).first()
            u = self.db.query(User).filter(User.id == a.user_id).first()
            applicant_name = (
                (p.full_name if p and p.full_name else None)
                or (a.form_data.get("full_name") if a.form_data else None)
                or (u.email if u and u.email else None)
                or (u.phone_number if u and u.phone_number else "Citizen")
            )
            recent_applications.append({
                "id": a.id,
                "application_id": a.application_id,
                "scheme_name": a.scheme.name if a.scheme else "Unknown Scheme",
                "applicant_name": applicant_name,
                "status": a.status,
                "created_at": a.created_at,
                "submitted_at": a.submitted_at,
                "reviewed_at": a.reviewed_at,
                "decision_at": a.decision_at,
            })

        # Monthly trends from real application records
        monthly_map = defaultdict(lambda: {"applications": 0, "approved": 0})
        all_apps = self.db.query(Application).all()
        for a in all_apps:
            if a.created_at:
                m = a.created_at.strftime("%b %Y")
                monthly_map[m]["applications"] += 1
                if a.status == "APPROVED":
                    monthly_map[m]["approved"] += 1

        application_trends = [
            {"month": m, "applications": data["applications"], "approved": data["approved"]}
            for m, data in sorted(monthly_map.items())
        ]

        # District distribution from profile or form_data
        dist_map = defaultdict(lambda: {"total": 0, "pending": 0})
        for a in all_apps:
            p = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == a.user_id).first()
            d_name = None
            if p and p.district:
                d_name = p.district.name
            elif a.form_data and "district_id" in a.form_data:
                try:
                    d_id = int(a.form_data["district_id"])
                    d = self.db.query(District).filter(District.id == d_id).first()
                    if d:
                        d_name = d.name
                except (ValueError, TypeError):
                    pass
            if not d_name:
                d_name = "Hyderabad"

            dist_map[d_name]["total"] += 1
            if a.status in ["SUBMITTED", "UNDER_REVIEW", "Pending"]:
                dist_map[d_name]["pending"] += 1

        district_distribution = [
            {"district_name": d, "total_applications": data["total"], "pending": data["pending"]}
            for d, data in sorted(dist_map.items(), key=lambda x: -x[1]["total"])
        ]

        return {
            "total_applications": total_applications,
            "submitted_applications": submitted_applications,
            "under_review_applications": under_review_applications,
            "approved_applications": approved_applications,
            "rejected_applications": rejected_applications,
            "draft_applications": draft_applications,
            "total_schemes": total_schemes,
            "active_schemes": active_schemes,
            "total_users": total_users,
            "total_citizens": total_citizens,
            "total_officers": total_officers,
            "total_saved_schemes": total_saved,
            "status_counts": status_counts,
            "recent_applications": recent_applications,
            "application_trends": application_trends,
            "district_distribution": district_distribution,
        }
