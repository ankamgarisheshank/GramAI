import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.auth import User, Role
from app.models.application import Application
from app.models.profile import CitizenProfile
from app.models.location import District, Mandal, Village
from app.models.scheme import Scheme

def is_super_admin(officer: User, db: Session) -> bool:
    if officer.role_id == 1:
        return True
    role = db.query(Role).filter(Role.id == officer.role_id).first()
    if role and role.name in ["Super Admin", "Admin"]:
        return True
    return False

def check_officer_jurisdiction(officer: User, application: Application, db: Session) -> bool:
    """
    Validates whether an officer has jurisdiction over an application.
    - Super Admin: global access (all applications)
    - Directly assigned officer: allowed
    - Village Admin: matches applicant's village
    - Mandal Admin: matches applicant's mandal (or village in that mandal)
    - District Admin: matches applicant's district (or mandal/village in that district, or scheme district)
    - If officer has no jurisdiction profile and not assigned: access denied.
    """
    # 1. Super Admin check
    if is_super_admin(officer, db):
        return True

    # 2. Directly assigned officer
    if application.assigned_officer_id and application.assigned_officer_id == officer.id:
        return True

    # 3. Check officer profile
    officer_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == officer.id).first()
    if not officer_profile:
        return False

    has_jurisdiction = (
        officer_profile.village_id is not None or
        officer_profile.mandal_id is not None or
        officer_profile.district_id is not None
    )
    if not has_jurisdiction:
        return False

    # 4. Resolve applicant location
    applicant_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == application.user_id).first()
    
    app_village_id = applicant_profile.village_id if applicant_profile and applicant_profile.village_id else None
    app_mandal_id = applicant_profile.mandal_id if applicant_profile and applicant_profile.mandal_id else None
    app_district_id = applicant_profile.district_id if applicant_profile and applicant_profile.district_id else None

    # Fallback to form_data if profile lacks location IDs
    form_data = application.form_data or {}
    if not app_village_id and "village_id" in form_data:
        try: app_village_id = int(form_data["village_id"])
        except: pass
    if not app_mandal_id and "mandal_id" in form_data:
        try: app_mandal_id = int(form_data["mandal_id"])
        except: pass
    if not app_district_id and "district_id" in form_data:
        try: app_district_id = int(form_data["district_id"])
        except: pass

    # Also resolve textual names in form_data / profile to IDs if needed
    if not app_village_id and form_data.get("village"):
        v = db.query(Village).filter(Village.name.ilike(form_data["village"].strip())).first()
        if v:
            app_village_id = v.id
            if not app_mandal_id:
                app_mandal_id = v.mandal_id
    if not app_mandal_id and form_data.get("mandal"):
        m = db.query(Mandal).filter(Mandal.name.ilike(form_data["mandal"].strip())).first()
        if m:
            app_mandal_id = m.id
            if not app_district_id:
                app_district_id = m.district_id
    if not app_district_id and form_data.get("district"):
        d = db.query(District).filter(District.name.ilike(form_data["district"].strip())).first()
        if d:
            app_district_id = d.id

    # 5. Evaluate scope matching
    # Village level scope
    if officer_profile.village_id:
        if app_village_id and int(app_village_id) == officer_profile.village_id:
            return True
        return False

    # Mandal level scope
    if officer_profile.mandal_id:
        if app_mandal_id and int(app_mandal_id) == officer_profile.mandal_id:
            return True
        if app_village_id:
            village = db.query(Village).filter(Village.id == int(app_village_id)).first()
            if village and village.mandal_id == officer_profile.mandal_id:
                return True
        return False

    # District level scope
    if officer_profile.district_id:
        if app_district_id and int(app_district_id) == officer_profile.district_id:
            return True
        # Scheme district applicability
        scheme = db.query(Scheme).filter(Scheme.id == application.scheme_id).first()
        if scheme and scheme.district_applicability_id == officer_profile.district_id:
            return True
        if app_mandal_id:
            mandal = db.query(Mandal).filter(Mandal.id == int(app_mandal_id)).first()
            if mandal and mandal.district_id == officer_profile.district_id:
                return True
        return False

    return False
