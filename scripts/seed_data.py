"""Seed script for GramAI Phase 2."""
import uuid
import sys
import os

# Ensure app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.db.session import SessionLocal
from app.models.auth import Role, User
from app.models.location import District, Mandal, Village
from app.models.scheme import SchemeCategory
from sqlalchemy.exc import IntegrityError

def seed():
    db = SessionLocal()
    print("Starting seed process...")
    
    # Seed Roles
    roles = [
        {"id": 1, "name": "Super Admin", "description": "System wide control"},
        {"id": 2, "name": "Mandal Admin", "description": "Mandal level control"},
        {"id": 3, "name": "Village Admin", "description": "Village level control"},
        {"id": 4, "name": "Citizen", "description": "General citizen user"},
    ]
    for r in roles:
        if not db.query(Role).filter_by(id=r["id"]).first():
            db.add(Role(**r))
            print(f"Added role: {r['name']}")
    
    # Seed Scheme Categories
    categories = [
        "Agriculture", "Education", "Health", "Pensions", "Housing", "Social Welfare"
    ]
    for i, cat in enumerate(categories, 1):
        if not db.query(SchemeCategory).filter_by(name=cat).first():
            db.add(SchemeCategory(id=i, name=cat))
            print(f"Added category: {cat}")

    # Seed Geography (Sample Telangana Data)
    if not db.query(District).filter_by(name="Hyderabad").first():
        d1 = District(name="Hyderabad")
        db.add(d1)
        db.commit()
        db.refresh(d1)
        
        m1 = Mandal(name="Khairatabad", district_id=d1.id)
        db.add(m1)
        db.commit()
        db.refresh(m1)
        
        v1 = Village(name="Somajiguda", mandal_id=m1.id)
        db.add(v1)
        print("Added sample locations (Hyderabad -> Khairatabad -> Somajiguda)")

    db.commit()
    print("Seed complete!")
    db.close()

if __name__ == "__main__":
    seed()
