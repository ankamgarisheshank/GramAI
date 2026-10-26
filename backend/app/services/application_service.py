import uuid
import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.profile import CitizenProfile
from app.models.document import Document
from app.models.auth import User
from app.models.location import District, Mandal, Village
from app.models.communication import Notification
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.schemas.officer import OfficerApplicationListItem, OfficerApplicationDetail
from app.core.exceptions import AppException
from app.core.jurisdiction import check_officer_jurisdiction


class ApplicationService:
    def __init__(self, db: Session):
        self.db = db

    def _create_notification(self, user_id: uuid.UUID, title: str, message: str) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            is_read=False
        )
        self.db.add(notif)
        return notif

    def generate_application_id(self) -> str:
        now = datetime.datetime.utcnow()
        year_month = now.strftime("%Y%m")
        unique_suffix = uuid.uuid4().hex[:6].upper()
        return f"GRM-{year_month}-{unique_suffix}"

    def calculate_eligibility_snapshot(self, user_id: uuid.UUID, scheme: Scheme, form_data: dict) -> dict:
        profile = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()
        
        eligible = True
        reasons = []

        # If we have a profile, check against it. Alternatively check form_data.
        # Here we just implement safe minimum evaluation as requested.
        age = None
        income = None
        occupation = None

        if profile:
            age = profile.age
            income = profile.income
            occupation = profile.occupation
            
        # Fallback to form_data if they provided it there
        if form_data:
            if age is None and "age" in form_data:
                try: age = int(form_data["age"])
                except: pass
            if income is None and "annual_income" in form_data:
                try: income = float(form_data["annual_income"])
                except: pass
            if occupation is None and "occupation" in form_data:
                occupation = form_data["occupation"]

        if age is not None:
            if scheme.age_limit_min is not None and age < scheme.age_limit_min:
                eligible = False
                reasons.append(f"Age {age} is below minimum {scheme.age_limit_min}")
            elif scheme.age_limit_max is not None and age > scheme.age_limit_max:
                eligible = False
                reasons.append(f"Age {age} is above maximum {scheme.age_limit_max}")
            else:
                reasons.append("Age requirement satisfied")
        else:
            if scheme.age_limit_min is not None or scheme.age_limit_max is not None:
                reasons.append("Age not provided; cannot evaluate age requirement")

        if income is not None:
            if scheme.income_limit is not None and income > scheme.income_limit:
                eligible = False
                reasons.append(f"Income {income} exceeds limit {scheme.income_limit}")
            else:
                reasons.append("Income requirement satisfied")
        else:
            if scheme.income_limit is not None:
                reasons.append("Income not provided; cannot evaluate income requirement")

        if occupation and scheme.beneficiary_type:
            if scheme.beneficiary_type.lower() not in occupation.lower() and occupation.lower() not in scheme.beneficiary_type.lower():
                reasons.append(f"Occupation {occupation} might not match target {scheme.beneficiary_type}")
            else:
                reasons.append("Occupation requirement satisfied")

        return {
            "eligible": eligible,
            "reasons": reasons,
            "evaluated_at": datetime.datetime.utcnow().isoformat()
        }

    def create_application(self, user_id: uuid.UUID, app_in: ApplicationCreate) -> Application:
        scheme = self.db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
        if not scheme:
            raise AppException("Scheme not found", status_code=404)
        if scheme.status != "Active":
            raise AppException("Cannot apply for an inactive scheme", status_code=400)

        # Prevent duplicate active application
        existing = self.db.query(Application).filter(
            Application.user_id == user_id,
            Application.scheme_id == app_in.scheme_id,
            Application.status.in_(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"])
        ).first()

        if existing:
            raise AppException("You already have an active application for this scheme", status_code=409)

        eligibility_snapshot = self.calculate_eligibility_snapshot(user_id, scheme, app_in.form_data)
        
        application = Application(
            id=uuid.uuid4(),
            user_id=user_id,
            scheme_id=app_in.scheme_id,
            application_id=self.generate_application_id(),
            status="DRAFT",
            form_data=app_in.form_data or {},
            eligibility_result=eligibility_snapshot,
            created_at=datetime.datetime.utcnow()
        )

        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def update_application_draft(self, user_id: uuid.UUID, application_id: uuid.UUID, app_update: ApplicationUpdate) -> Application:
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)

        if app.user_id != user_id:
            raise AppException("Access denied: You do not own this application", status_code=403)

        if app.status != "DRAFT":
            raise AppException(f"Cannot update application with status: {app.status}. Only DRAFT applications can be edited.", status_code=400)

        clean_form_data = app_update.form_data or {}
        app.form_data = clean_form_data

        if app.scheme:
            app.eligibility_result = self.calculate_eligibility_snapshot(user_id, app.scheme, clean_form_data)

        app.updated_at = datetime.datetime.now(datetime.UTC)
        self.db.commit()
        self.db.refresh(app)
        return app

    def get_user_applications(self, user_id: uuid.UUID) -> list[Application]:
        return self.db.query(Application).filter(Application.user_id == user_id).order_by(Application.created_at.desc()).all()

    def get_application_detail(self, user_id: uuid.UUID, application_id: uuid.UUID) -> Application:
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        if not app:
            raise AppException("Application not found", status_code=404)
        return app

    def submit_application(self, user_id: uuid.UUID, application_id: uuid.UUID) -> Application:
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if app.status != "DRAFT":
            raise AppException(f"Application cannot be submitted from status: {app.status}", status_code=400)

        # Validate required documents
        scheme = self.db.query(Scheme).filter(Scheme.id == app.scheme_id).first()
        if scheme.required_documents:
            # required_documents is expected to be a string, like "Aadhaar Card, Income Certificate"
            required_docs = [d.strip().rstrip('.') for d in scheme.required_documents.split(",") if d.strip().rstrip('.')]
            
            uploaded_docs = self.db.query(Document).filter(Document.application_id == app.id).all()
            uploaded_types = {d.document_type.strip().rstrip('.').lower() for d in uploaded_docs}
            
            missing = []
            for req in required_docs:
                req_norm = req.strip().rstrip('.').lower()
                matched = any(req_norm in ut or ut in req_norm for ut in uploaded_types)
                if not matched:
                    missing.append(req)
                    
            if missing:
                # Custom error structure required by test / prompt
                raise AppException(

                    "Required documents are missing", 
                    status_code=400,
                    payload={"missing_documents": missing}
                )

        app.status = "SUBMITTED"
        app.submitted_at = datetime.datetime.utcnow()
        
        # Trigger In-App Notification: Application Submitted
        app_id_display = app.application_id or str(app.id)
        self._create_notification(
            user_id=app.user_id,
            title="Application Submitted",
            message=f"Your application {app_id_display} has been submitted successfully."
        )
        
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def get_officer_applications(
        self,
        officer: User,
        status: Optional[str] = None,
        scheme_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        district_id: Optional[int] = None,
        mandal_id: Optional[int] = None,
        village_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[OfficerApplicationListItem]:
        query = self.db.query(Application)
        
        # By default exclude DRAFT unless status explicitly asks for DRAFT
        if status:
            query = query.filter(Application.status == status.upper())
        else:
            query = query.filter(Application.status != "DRAFT")
            
        if scheme_id:
            query = query.filter(Application.scheme_id == scheme_id)
            
        all_apps = query.order_by(Application.created_at.desc()).all()
        
        results: List[OfficerApplicationListItem] = []
        for app in all_apps:
            # Enforce jurisdiction
            if not check_officer_jurisdiction(officer, app, self.db):
                continue
                
            # Filter location if provided
            applicant_profile = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == app.user_id).first()
            app_district_id = applicant_profile.district_id if applicant_profile else None
            app_mandal_id = applicant_profile.mandal_id if applicant_profile else None
            app_village_id = applicant_profile.village_id if applicant_profile else None
            
            form_data = app.form_data or {}
            if not app_district_id and "district_id" in form_data:
                try: app_district_id = int(form_data["district_id"])
                except: pass
            if not app_mandal_id and "mandal_id" in form_data:
                try: app_mandal_id = int(form_data["mandal_id"])
                except: pass
            if not app_village_id and "village_id" in form_data:
                try: app_village_id = int(form_data["village_id"])
                except: pass
                
            if district_id and app_district_id != district_id:
                continue
            if mandal_id and app_mandal_id != mandal_id:
                continue
            if village_id and app_village_id != village_id:
                continue
                
            # Resolve display names
            district_name = None
            mandal_name = None
            village_name = None
            if applicant_profile:
                if applicant_profile.district: district_name = applicant_profile.district.name
                if applicant_profile.mandal: mandal_name = applicant_profile.mandal.name
                if applicant_profile.village: village_name = applicant_profile.village.name
            if not district_name and "district" in form_data:
                district_name = str(form_data["district"])
            if not mandal_name and "mandal" in form_data:
                mandal_name = str(form_data["mandal"])
            if not village_name and "village" in form_data:
                village_name = str(form_data["village"])
                
            applicant_user = self.db.query(User).filter(User.id == app.user_id).first()
            applicant_name = (
                (applicant_profile.full_name if applicant_profile and applicant_profile.full_name else None)
                or form_data.get("full_name")
                or (applicant_user.email if applicant_user and applicant_user.email else None)
                or (applicant_user.phone_number if applicant_user and applicant_user.phone_number else "Applicant")
            )
            applicant_phone = applicant_user.phone_number if applicant_user else None
            applicant_email = applicant_user.email if applicant_user else None
            
            # Apply search filter
            if search:
                term = search.strip().lower()
                matches_id = term in (app.application_id or "").lower()
                matches_name = term in (applicant_name or "").lower()
                matches_phone = applicant_phone and term in applicant_phone.lower()
                matches_email = applicant_email and term in applicant_email.lower()
                matches_scheme = app.scheme and term in app.scheme.name.lower()
                if not (matches_id or matches_name or matches_phone or matches_email or matches_scheme):
                    continue
                    
            docs = self.db.query(Document).filter(Document.application_id == app.id).all()
            total_docs = len(docs)
            pending_docs = sum(1 for d in docs if d.verification_status == "PENDING")
            verified_docs = sum(1 for d in docs if d.verification_status == "VERIFIED")
            rejected_docs = sum(1 for d in docs if d.verification_status == "REJECTED")
            
            item = OfficerApplicationListItem(
                id=app.id,
                application_id=app.application_id,
                scheme_id=app.scheme_id,
                scheme_name=app.scheme.name if app.scheme else "Unknown Scheme",
                applicant_id=app.user_id,
                applicant_name=applicant_name,
                applicant_phone=applicant_phone,
                applicant_email=applicant_email,
                submitted_at=app.submitted_at,
                reviewed_at=app.reviewed_at,
                decision_at=app.decision_at,
                status=app.status,
                district_name=district_name,
                mandal_name=mandal_name,
                village_name=village_name,
                total_documents=total_docs,
                pending_documents=pending_docs,
                verified_documents=verified_docs,
                rejected_documents=rejected_docs,
                created_at=app.created_at
            )
            results.append(item)
            
        return results[skip : skip + limit]

    def get_officer_application_detail(self, officer: User, application_id: uuid.UUID) -> OfficerApplicationDetail:
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Application outside officer jurisdiction", status_code=403)
            
        applicant_profile = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == app.user_id).first()
        applicant_user = self.db.query(User).filter(User.id == app.user_id).first()
        form_data = app.form_data or {}
        
        district_name = None
        mandal_name = None
        village_name = None
        if applicant_profile:
            if applicant_profile.district: district_name = applicant_profile.district.name
            if applicant_profile.mandal: mandal_name = applicant_profile.mandal.name
            if applicant_profile.village: village_name = applicant_profile.village.name
        if not district_name and "district" in form_data: district_name = str(form_data["district"])
        if not mandal_name and "mandal" in form_data: mandal_name = str(form_data["mandal"])
        if not village_name and "village" in form_data: village_name = str(form_data["village"])
        
        applicant_name = (
            (applicant_profile.full_name if applicant_profile and applicant_profile.full_name else None)
            or form_data.get("full_name")
            or (applicant_user.email if applicant_user and applicant_user.email else None)
            or (applicant_user.phone_number if applicant_user and applicant_user.phone_number else "Applicant")
        )
        
        # Required documents
        req_types = []
        if app.scheme and app.scheme.required_documents:
            req_types = [d.strip().rstrip('.') for d in app.scheme.required_documents.split(",") if d.strip().rstrip('.')]
            
        return OfficerApplicationDetail(
            id=app.id,
            application_id=app.application_id,
            scheme_id=app.scheme_id,
            scheme=app.scheme,
            user_id=app.user_id,
            applicant_name=applicant_name,
            applicant_phone=applicant_user.phone_number if applicant_user else None,
            applicant_email=applicant_user.email if applicant_user else None,
            status=app.status,
            assigned_officer_id=app.assigned_officer_id,
            officer_remarks=app.officer_remarks,
            form_data=app.form_data,
            eligibility_result=app.eligibility_result,
            submitted_at=app.submitted_at,
            reviewed_at=app.reviewed_at,
            decision_at=app.decision_at,
            created_at=app.created_at,
            district_name=district_name,
            mandal_name=mandal_name,
            village_name=village_name,
            documents=app.documents or [],
            required_document_types=req_types
        )

    def start_review(self, officer: User, application_id: uuid.UUID) -> Application:
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Application outside officer jurisdiction", status_code=403)
            
        if app.status == "UNDER_REVIEW":
            return app
            
        if app.status != "SUBMITTED":
            raise AppException(f"Cannot start review on application with status: {app.status}", status_code=400)
            
        app.status = "UNDER_REVIEW"
        if not app.reviewed_at:
            app.reviewed_at = datetime.datetime.utcnow()
        app.assigned_officer_id = officer.id
        
        # Trigger In-App Notification: Application Under Review
        app_id_display = app.application_id or str(app.id)
        self._create_notification(
            user_id=app.user_id,
            title="Application Under Review",
            message=f"Your application {app_id_display} is now being reviewed."
        )
        
        self.db.commit()
        self.db.refresh(app)
        return app

    def verify_document(
        self,
        officer: User,
        document_id: uuid.UUID,
        verification_status: str,
        officer_remarks: Optional[str] = None
    ) -> Document:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise AppException("Document not found", status_code=404)
            
        app = self.db.query(Application).filter(Application.id == doc.application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Document belongs to application outside officer jurisdiction", status_code=403)
            
        if app.status in ["APPROVED", "REJECTED"]:
            raise AppException("Cannot modify document verification for decided application", status_code=400)
            
        if app.status == "DRAFT":
            raise AppException("Cannot verify document for draft application", status_code=400)
            
        norm_status = verification_status.strip().upper()
        if norm_status not in ["VERIFIED", "REJECTED", "PENDING"]:
            raise AppException(f"Invalid verification status: '{verification_status}'. Must be VERIFIED, REJECTED, or PENDING.", status_code=400)
            
        doc.verification_status = norm_status
        doc.officer_remarks = officer_remarks
        doc.verified_at = datetime.datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def approve_application(
        self,
        officer: User,
        application_id: uuid.UUID,
        remarks: Optional[str] = None
    ) -> Application:
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Application outside officer jurisdiction", status_code=403)
            
        if app.status == "APPROVED":
            raise AppException("Application has already been approved", status_code=400)
        if app.status == "REJECTED":
            raise AppException("Application has already been rejected; cannot approve", status_code=400)
        if app.status not in ["SUBMITTED", "UNDER_REVIEW"]:
            raise AppException(f"Cannot approve application from status: {app.status}", status_code=400)
            
        scheme = self.db.query(Scheme).filter(Scheme.id == app.scheme_id).first()
        docs = self.db.query(Document).filter(Document.application_id == app.id).all()
        
        # Check scheme required documents
        if scheme and scheme.required_documents:
            req_docs = [d.strip().rstrip('.') for d in scheme.required_documents.split(",") if d.strip().rstrip('.')]
            doc_map = {d.document_type.strip().lower(): d for d in docs}
            
            missing = []
            unverified = []
            for req in req_docs:
                req_lower = req.lower()
                matched = doc_map.get(req_lower)
                if not matched:
                    # Partial match
                    for dt, d in doc_map.items():
                        if req_lower in dt or dt in req_lower:
                            matched = d
                            break
                            
                if not matched:
                    missing.append(req)
                elif matched.verification_status != "VERIFIED":
                    unverified.append(f"{req} (status: {matched.verification_status})")
                    
            if missing:
                raise AppException(
                    f"Cannot approve application: Required documents are missing: {', '.join(missing)}",
                    status_code=400,
                    payload={"missing_documents": missing}
                )
            if unverified:
                raise AppException(
                    f"Cannot approve application: Required documents must be verified first: {', '.join(unverified)}",
                    status_code=400,
                    payload={"unverified_documents": unverified}
                )
                
        # Also ensure no uploaded documents are marked REJECTED or PENDING
        for d in docs:
            if d.verification_status == "REJECTED":
                raise AppException(
                    f"Cannot approve application: Document '{d.document_type}' is marked REJECTED",
                    status_code=400
                )
            if d.verification_status == "PENDING":
                raise AppException(
                    f"Cannot approve application: Document '{d.document_type}' is still PENDING verification",
                    status_code=400
                )
                
        app.status = "APPROVED"
        app.decision_at = datetime.datetime.utcnow()
        app.assigned_officer_id = officer.id
        if remarks:
            app.officer_remarks = remarks.strip()
            
        # Trigger In-App Notification: Application Approved
        app_id_display = app.application_id or str(app.id)
        self._create_notification(
            user_id=app.user_id,
            title="Application Approved",
            message=f"Your application {app_id_display} has been approved."
        )
            
        self.db.commit()
        self.db.refresh(app)
        return app

    def reject_application(
        self,
        officer: User,
        application_id: uuid.UUID,
        remarks: str
    ) -> Application:
        if not remarks or not remarks.strip():
            raise AppException("Rejection remarks are required and cannot be empty", status_code=400)
            
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
            
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Application outside officer jurisdiction", status_code=403)
            
        if app.status == "REJECTED":
            raise AppException("Application has already been rejected", status_code=400)
        if app.status == "APPROVED":
            raise AppException("Application has already been approved; cannot reject", status_code=400)
        if app.status not in ["SUBMITTED", "UNDER_REVIEW"]:
            raise AppException(f"Cannot reject application from status: {app.status}", status_code=400)
            
        app.status = "REJECTED"
        app.decision_at = datetime.datetime.utcnow()
        app.assigned_officer_id = officer.id
        app.officer_remarks = remarks.strip()
        
        # Trigger In-App Notification: Application Rejected
        app_id_display = app.application_id or str(app.id)
        self._create_notification(
            user_id=app.user_id,
            title="Application Update",
            message=f"Your application {app_id_display} has been rejected. Review the remarks in your application details."
        )
        
        self.db.commit()
        self.db.refresh(app)
        return app

