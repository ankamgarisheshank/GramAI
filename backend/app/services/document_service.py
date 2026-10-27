import os
import uuid
import shutil
import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.application import Application
from app.core.exceptions import AppException

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "uploads", "applications")
os.makedirs(STORAGE_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf", "application/x-pdf", "application/acrobat",
    "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/x-png",
    "application/octet-stream"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    def validate_file(self, file: UploadFile) -> None:
        if not file.filename:
            raise AppException("Filename cannot be empty", status_code=400)
            
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise AppException(f"Unsupported file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}", status_code=400)
            
        content_type = (file.content_type or "").lower()
        if content_type and content_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS:
            raise AppException(f"Unsupported MIME type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}", status_code=400)

        # Check file size
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        if size == 0:
            raise AppException("File cannot be empty", status_code=400)
            
        if size > MAX_FILE_SIZE:
            raise AppException("File exceeds maximum allowed size of 10MB", status_code=400)

    def generate_storage_filename(self, application_id: str, original_filename: str) -> str:
        ext = os.path.splitext(original_filename)[1].lower()
        safe_uuid = uuid.uuid4().hex
        return f"{application_id}_{safe_uuid}{ext}"

    def save_file(self, file: UploadFile, storage_filename: str) -> str:
        filepath = os.path.join(STORAGE_DIR, storage_filename)
        
        # Prevent path traversal
        if not os.path.abspath(filepath).startswith(os.path.abspath(STORAGE_DIR)):
            raise AppException("Invalid filename path", status_code=400)
            
        try:
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return filepath
        except Exception as e:
            raise AppException(f"Failed to save file: {str(e)}", status_code=500)

    def upload_document(self, user_id: uuid.UUID, application_id: uuid.UUID, file: UploadFile, document_type: str) -> Document:
        # Check application exists and belongs to user
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        
        if not app:
            raise AppException("Application not found or access denied", status_code=404)
            
        self.validate_file(file)
        
        # Replace any existing document of the same type
        norm_type = document_type.strip().rstrip('.').lower()
        existing_docs = self.db.query(Document).filter(Document.application_id == app.id).all()
        for ed in existing_docs:
            if ed.document_type.strip().rstrip('.').lower() == norm_type:
                old_filepath = os.path.join(STORAGE_DIR, ed.stored_filename)
                if os.path.exists(old_filepath):
                    try:
                        os.remove(old_filepath)
                    except Exception:
                        pass
                self.db.delete(ed)
        self.db.flush()

        storage_filename = self.generate_storage_filename(app.application_id or str(app.id)[:8], file.filename)
        
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        filepath = self.save_file(file, storage_filename)
        
        try:
            document = Document(
                id=uuid.uuid4(),
                application_id=app.id,
                document_type=document_type,
                original_filename=os.path.basename(file.filename),
                stored_filename=storage_filename,
                content_type=file.content_type,
                file_size=file_size,
                verification_status="PENDING",
                uploaded_at=datetime.datetime.utcnow()
            )
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)
            return document
        except Exception as e:
            self.db.rollback()
            if os.path.exists(filepath):
                os.remove(filepath)
            raise AppException(f"Database error during document upload: {str(e)}", status_code=500)

    def get_application_documents(self, user_id: uuid.UUID, application_id: uuid.UUID) -> list[Document]:
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        
        if not app:
            raise AppException("Application not found or access denied", status_code=404)
            
        return self.db.query(Document).filter(Document.application_id == application_id).all()

    def get_document(self, user_id: uuid.UUID, application_id: uuid.UUID, document_id: uuid.UUID) -> Document:
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        
        if not app:
            raise AppException("Application not found or access denied", status_code=404)
            
        doc = self.db.query(Document).filter(
            Document.id == document_id, 
            Document.application_id == application_id
        ).first()
        
        if not doc:
            raise AppException("Document not found", status_code=404)
            
        return doc

    def delete_document(self, user_id: uuid.UUID, application_id: uuid.UUID, document_id: uuid.UUID) -> None:
        app = self.db.query(Application).filter(
            Application.id == application_id, 
            Application.user_id == user_id
        ).first()
        
        if not app:
            raise AppException("Application not found or access denied", status_code=404)
            
        if app.status not in ["DRAFT", "SUBMITTED"]:
            raise AppException("Cannot delete documents when application is under review or decided", status_code=403)
            
        doc = self.db.query(Document).filter(
            Document.id == document_id, 
            Document.application_id == application_id
        ).first()
        
        if not doc:
            raise AppException("Document not found", status_code=404)
            
        filepath = os.path.join(STORAGE_DIR, doc.stored_filename)
        
        self.db.delete(doc)
        self.db.commit()
        
        if os.path.exists(filepath):
            os.remove(filepath)

    def get_document_for_officer(self, officer: "User", document_id: uuid.UUID) -> Document:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise AppException("Document not found", status_code=404)
        app = self.db.query(Application).filter(Application.id == doc.application_id).first()
        if not app:
            raise AppException("Application not found", status_code=404)
        from app.core.jurisdiction import check_officer_jurisdiction
        if not check_officer_jurisdiction(officer, app, self.db):
            raise AppException("Access denied: Document belongs to application outside officer jurisdiction", status_code=403)
        return doc

