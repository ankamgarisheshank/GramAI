from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import os

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.auth import User
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService, STORAGE_DIR

from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationDetailResponse
from app.services.application_service import ApplicationService
from app.schemas.response import StandardResponse

router = APIRouter()

@router.post("", response_model=StandardResponse[ApplicationResponse])
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ApplicationService(db)
    application = service.create_application(current_user.id, app_in)
    return StandardResponse(data=ApplicationResponse.model_validate(application))

@router.get("/me", response_model=StandardResponse[List[ApplicationResponse]])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ApplicationService(db)
    applications = service.get_user_applications(current_user.id)
    return StandardResponse(data=[ApplicationResponse.model_validate(app) for app in applications])

@router.get("/{application_id}", response_model=StandardResponse[ApplicationDetailResponse])
def get_application_details(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ApplicationService(db)
    application = service.get_application_detail(current_user.id, application_id)
    return StandardResponse(data=ApplicationDetailResponse.model_validate(application))

@router.put("/{application_id}", response_model=StandardResponse[ApplicationDetailResponse])
def update_application_draft(
    application_id: uuid.UUID,
    app_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ApplicationService(db)
    application = service.update_application_draft(current_user.id, application_id, app_update)
    return StandardResponse(
        success=True,
        message="Application draft updated successfully",
        data=ApplicationDetailResponse.model_validate(application)
    )

@router.put("/{application_id}/submit", response_model=StandardResponse[ApplicationResponse])
def submit_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ApplicationService(db)
    application = service.submit_application(current_user.id, application_id)
    return StandardResponse(message="Application submitted successfully", data=ApplicationResponse.model_validate(application))


@router.post("/{application_id}/documents", response_model=DocumentResponse)
def upload_document(
    application_id: uuid.UUID,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DocumentService(db)
    document = service.upload_document(current_user.id, application_id, file, document_type)
    return document

@router.get("/{application_id}/documents", response_model=List[DocumentResponse])
def get_documents(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DocumentService(db)
    documents = service.get_application_documents(current_user.id, application_id)
    return documents

@router.get("/{application_id}/documents/{document_id}/file")
def get_document_file(
    application_id: uuid.UUID,
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DocumentService(db)
    doc = service.get_document(current_user.id, application_id, document_id)
    
    filepath = os.path.join(STORAGE_DIR, doc.stored_filename)
    if not os.path.exists(filepath):
        from app.core.exceptions import AppException
        raise AppException("File not found on server", status_code=404)
        
    return FileResponse(
        path=filepath, 
        filename=doc.original_filename,
        media_type=doc.content_type
    )

@router.delete("/{application_id}/documents/{document_id}")
def delete_document(
    application_id: uuid.UUID,
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DocumentService(db)
    service.delete_document(current_user.id, application_id, document_id)
    return {"success": True, "message": "Document deleted successfully"}
