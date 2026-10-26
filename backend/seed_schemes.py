from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.scheme import Scheme, SchemeCategory

db: Session = SessionLocal()

# Delete existing schemes
db.query(Scheme).delete()
db.query(SchemeCategory).delete()

# Create Categories
farmer_cat = SchemeCategory(name="Farmer Welfare", description="Schemes for farmers")
student_cat = SchemeCategory(name="Education", description="Schemes for students")
senior_cat = SchemeCategory(name="Senior Citizens", description="Schemes for senior citizens")
db.add_all([farmer_cat, student_cat, senior_cat])
db.commit()

# Farmer Schemes
schemes = [
    Scheme(
        name="Rythu Bandhu",
        department="Agriculture and Co-operation",
        description="Investment Support Scheme providing ₹5,000 per acre per season to farmers.",
        benefits="₹5,000 per acre per season for two seasons (Kharif and Rabi).",
        required_documents="Pattadar Passbook, Aadhaar Card, Bank Account Details.",
        application_process="1. Visit the official portal.\n2. Enter your Aadhaar number and Pattadar Passbook details.\n3. Submit bank details for Direct Benefit Transfer.",
        official_link="http://rythubandhu.telangana.gov.in/",
        category_id=farmer_cat.id,
        beneficiary_type="farmer"
    ),
    Scheme(
        name="Rythu Bima",
        department="Agriculture and Co-operation",
        description="Farmers Group Life Insurance Scheme providing financial relief to family members.",
        benefits="₹5.00 Lakhs insured amount transferred directly to the nominee account in case of farmer's demise.",
        required_documents="Pattadar Passbook, Aadhaar Card of Farmer, Aadhaar Card of Nominee, Bank Account.",
        application_process="1. Contact your local Agriculture Extension Officer (AEO).\n2. Provide necessary documents to the AEO for enrollment.\n3. Verify your details on the official portal.",
        official_link="http://rythubima.telangana.gov.in/",
        category_id=farmer_cat.id,
        beneficiary_type="farmer",
        age_limit_min=18,
        age_limit_max=59
    ),
    Scheme(
        name="Crop Loan Waiver Scheme",
        department="Agriculture",
        description="Waiving of crop loans for eligible farmers in Telangana.",
        benefits="Waiver of outstanding crop loans up to ₹2 Lakhs.",
        required_documents="Aadhaar Card, Bank Loan Passbook, Pattadar Passbook.",
        application_process="1. Check your name in the eligible list at your Gram Panchayat.\n2. Submit grievances (if any) with your bank passbook and Aadhaar to the AEO.",
        official_link="https://clw.telangana.gov.in/",
        category_id=farmer_cat.id,
        beneficiary_type="farmer"
    ),
    Scheme(
        name="PM Kisan Samman Nidhi",
        department="Central Govt - Agriculture",
        description="Income support scheme for landholding farmer families.",
        benefits="₹6,000 per year in three equal installments.",
        required_documents="Aadhaar Card, Bank Account, Land Ownership Records.",
        application_process="1. Register on the PM Kisan official portal.\n2. Complete e-KYC using Aadhaar OTP.\n3. Track application status online.",
        official_link="https://pmkisan.gov.in/",
        category_id=farmer_cat.id,
        beneficiary_type="farmer"
    )
]

db.add_all(schemes)
db.commit()
print("Successfully seeded schemes!")
