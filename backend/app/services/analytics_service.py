import uuid
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from typing import Optional, List, Dict
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.models.auth import User, Role
from app.models.scheme import Scheme, SavedSchemes
from app.models.application import Application
from app.models.profile import CitizenProfile
from app.models.location import District
from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreate

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def record_event(self, data: AnalyticsEventCreate, user_id: Optional[uuid.UUID] = None) -> AnalyticsEvent:
        """
        Record a privacy-preserving first-party analytics event.
        Never stores passwords, tokens, full form data, or PII.
        """
        event = AnalyticsEvent(
            event_type=data.event_type,
            route=data.route,
            scheme_id=data.scheme_id,
            campaign_id=data.campaign_id,
            session_id=data.session_id,
            user_id=user_id,
            label=data.label
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_dashboard_metrics(self) -> dict:
        now = datetime.now(timezone.utc)
        one_day_ago = now - timedelta(days=1)
        one_week_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

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

        # Persona Demographics
        farmer_count = (
            self.db.query(CitizenProfile)
            .join(User, CitizenProfile.user_id == User.id)
            .filter(User.role_id == 4, CitizenProfile.occupation.ilike("%farmer%"))
            .count()
        )
        student_count = (
            self.db.query(CitizenProfile)
            .join(User, CitizenProfile.user_id == User.id)
            .filter(User.role_id == 4, CitizenProfile.occupation.ilike("%student%"))
            .count()
        )
        senior_count = (
            self.db.query(CitizenProfile)
            .join(User, CitizenProfile.user_id == User.id)
            .filter(User.role_id == 4, CitizenProfile.occupation.ilike("%senior%"))
            .count()
        )
        general_citizen_count = max(0, total_citizens - (farmer_count + student_count + senior_count))

        # User Registrations by time
        registrations_today = (
            self.db.query(User)
            .filter(User.created_at >= one_day_ago)
            .count()
        )
        registrations_this_week = (
            self.db.query(User)
            .filter(User.created_at >= one_week_ago)
            .count()
        )
        registrations_this_month = (
            self.db.query(User)
            .filter(User.created_at >= thirty_days_ago)
            .count()
        )

        # Distinct active authenticated users in last 24h (from analytics events or recent submissions)
        active_event_users = {
            row[0] for row in (
                self.db.query(AnalyticsEvent.user_id)
                .filter(AnalyticsEvent.user_id.isnot(None), AnalyticsEvent.created_at >= one_day_ago)
                .distinct()
                .all()
            )
        }
        active_app_users = {
            row[0] for row in (
                self.db.query(Application.user_id)
                .filter(Application.created_at >= one_day_ago)
                .distinct()
                .all()
            )
        }
        active_reg_users = {
            row[0] for row in (
                self.db.query(User.id)
                .filter(User.created_at >= one_day_ago)
                .distinct()
                .all()
            )
        }
        active_users_24h = len(active_event_users | active_app_users | active_reg_users)

        # Analytics Events Metrics
        total_page_views = 0
        unique_sessions_count = 0
        scheme_detail_views = 0
        apply_clicks = 0
        external_link_clicks = 0
        engagement_by_event = {}
        top_viewed_schemes = []
        tracking_started_at = now.isoformat()

        try:
            total_page_views = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "page_view").count()
            unique_sessions_count = (
                self.db.query(func.count(distinct(AnalyticsEvent.session_id)))
                .filter(AnalyticsEvent.session_id.isnot(None))
                .scalar() or 0
            )
            scheme_detail_views = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "scheme_detail_view").count()
            apply_clicks = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "apply_button_click").count()
            external_link_clicks = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "external_link_click").count()

            # Event counts breakdown
            event_counts_raw = (
                self.db.query(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id))
                .group_by(AnalyticsEvent.event_type)
                .all()
            )
            engagement_by_event = {row[0]: row[1] for row in event_counts_raw}

            # Top viewed schemes from real event records
            top_schemes_raw = (
                self.db.query(AnalyticsEvent.scheme_id, func.count(AnalyticsEvent.id))
                .filter(AnalyticsEvent.event_type.in_(["scheme_detail_view", "apply_button_click"]), AnalyticsEvent.scheme_id.isnot(None))
                .group_by(AnalyticsEvent.scheme_id)
                .order_by(func.count(AnalyticsEvent.id).desc())
                .limit(5)
                .all()
            )
            for s_id, total_interactions in top_schemes_raw:
                scheme_name = f"Scheme #{s_id}"
                if s_id:
                    try:
                        parsed_uuid = uuid.UUID(str(s_id))
                        scheme_obj = self.db.query(Scheme).filter(Scheme.id == parsed_uuid).first()
                        if scheme_obj and scheme_obj.name:
                            scheme_name = scheme_obj.name
                    except (ValueError, TypeError, Exception):
                        pass

                views = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.scheme_id == str(s_id), AnalyticsEvent.event_type == "scheme_detail_view").count()
                clicks = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.scheme_id == str(s_id), AnalyticsEvent.event_type == "apply_button_click").count()
                top_viewed_schemes.append({
                    "scheme_id": str(s_id),
                    "scheme_name": scheme_name,
                    "views": views,
                    "apply_clicks": clicks
                })

            earliest_event = self.db.query(AnalyticsEvent.created_at).order_by(AnalyticsEvent.created_at.asc()).first()
            if earliest_event and earliest_event[0]:
                tracking_started_at = earliest_event[0].isoformat()
        except Exception:
            pass

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
                "user_id": a.user_id,
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

            # Persona Demographics
            "farmer_accounts": farmer_count,
            "student_accounts": student_count,
            "senior_accounts": senior_count,
            "general_citizen_accounts": general_citizen_count,

            # User Activity
            "registrations_today": registrations_today,
            "registrations_this_week": registrations_this_week,
            "registrations_this_month": registrations_this_month,
            "active_users_24h": active_users_24h,

            # Scheme Engagement
            "total_page_views": total_page_views,
            "unique_sessions": unique_sessions_count,
            "scheme_detail_views": scheme_detail_views,
            "apply_clicks": apply_clicks,
            "external_link_clicks": external_link_clicks,
            "top_viewed_schemes": top_viewed_schemes,
            "engagement_by_event": engagement_by_event,
            "last_updated": now.isoformat(),
            "tracking_started_at": tracking_started_at,
        }
