from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os

from app.db.database import get_db
from app.api.deps import RequireOfficerOrAdmin
from app.models.auth import User
from app.schemas.response import StandardResponse
from app.schemas.document import DocumentResponse
from app.schemas.officer import (
    OfficerApplicationListItem,
    OfficerApplicationDetail,
    DocumentVerifyRequest,
    ApplicationApproveRequest,
    ApplicationRejectRequest,
)
from app.services.application_service import ApplicationService
from app.services.document_service import DocumentService, STORAGE_DIR
from app.core.exceptions import AppException

router = APIRouter()
officer_only = RequireOfficerOrAdmin()

@router.get("/applications", response_model=StandardResponse[List[OfficerApplicationListItem]])
def get_officer_applications(
    status: Optional[str] = None,
    scheme_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    district_id: Optional[int] = None,
    mandal_id: Optional[int] = None,
    village_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    applications = service.get_officer_applications(
        officer=current_user,
        status=status,
        scheme_id=scheme_id,
        search=search,
        district_id=district_id,
        mandal_id=mandal_id,
        village_id=village_id,
        skip=skip,
        limit=limit,
    )
    return StandardResponse(
        success=True,
        message="Applications retrieved successfully",
        data=applications,
    )

@router.get("/applications/{application_id}", response_model=StandardResponse[OfficerApplicationDetail])
def get_officer_application_detail(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    detail = service.get_officer_application_detail(current_user, application_id)
    return StandardResponse(
        success=True,
        message="Application details retrieved successfully",
        data=detail,
    )

@router.put("/applications/{application_id}/review", response_model=StandardResponse[OfficerApplicationDetail])
def start_review(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    app = service.start_review(current_user, application_id)
    detail = service.get_officer_application_detail(current_user, app.id)
    return StandardResponse(
        success=True,
        message="Application is now under review",
        data=detail,
    )

@router.put("/documents/{document_id}/verify", response_model=StandardResponse[DocumentResponse])
def verify_document(
    document_id: uuid.UUID,
    req: DocumentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    doc = service.verify_document(
        officer=current_user,
        document_id=document_id,
        verification_status=req.verification_status,
        officer_remarks=req.officer_remarks,
    )
    return StandardResponse(
        success=True,
        message=f"Document verification status updated to {doc.verification_status}",
        data=DocumentResponse.model_validate(doc),
    )

@router.put("/applications/{application_id}/approve", response_model=StandardResponse[OfficerApplicationDetail])
def approve_application(
    application_id: uuid.UUID,
    req: ApplicationApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    app = service.approve_application(
        officer=current_user,
        application_id=application_id,
        remarks=req.officer_remarks,
    )
    detail = service.get_officer_application_detail(current_user, app.id)
    return StandardResponse(
        success=True,
        message="Application approved successfully",
        data=detail,
    )

@router.put("/applications/{application_id}/reject", response_model=StandardResponse[OfficerApplicationDetail])
def reject_application(
    application_id: uuid.UUID,
    req: ApplicationRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    service = ApplicationService(db)
    app = service.reject_application(
        officer=current_user,
        application_id=application_id,
        remarks=req.officer_remarks,
    )
    detail = service.get_officer_application_detail(current_user, app.id)
    return StandardResponse(
        success=True,
        message="Application rejected successfully",
        data=detail,
    )

@router.get("/documents/{document_id}/file")
def get_officer_document_file(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    doc_service = DocumentService(db)
    doc = doc_service.get_document_for_officer(current_user, document_id)
    
    filepath = os.path.join(STORAGE_DIR, doc.stored_filename)
    if not os.path.exists(filepath):
        raise AppException("File not found on server", status_code=404)
        
    return FileResponse(
        path=filepath,
        filename=doc.original_filename,
        media_type=doc.content_type,
    )

@router.get("/applications/{application_id}/documents/{document_id}/file")
def get_officer_app_document_file(
    application_id: uuid.UUID,
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(officer_only),
):
    return get_officer_document_file(document_id, db, current_user)
