# GramAI User Flows

This document details the distinct journeys that different personas take within the GramAI ecosystem.

## 1. Citizen Workflows

### A. The Farmer Persona Flow
Farmers use GramAI primarily for agriculture schemes, crop loans, market prices, and weather data.

`Landing` 
→ `Register (Phone Number)` 
→ `Complete Profile (Occupation: Farmer, Land Holding: X acres, Village: Y)` 
→ `Dashboard` 
→ `Voice Assistant (Tap Microphone)` 
→ *Speaks in Telugu: "Rythu Bandhu status"* 
→ `AI Recommendation Engine` 
→ `Eligible Schemes (Rythu Bandhu Details)` 
→ `View Details` 
→ `Save Scheme`

### B. The Student Persona Flow
Students seek scholarships and educational loans.

`Landing` 
→ `Login` 
→ `Dashboard` 
→ `AI Chat` 
→ *Types: "Post matric scholarship for BC category"* 
→ `AI Recommendation Engine` 
→ `View Details (Post Matric Scholarship)` 
→ `Check Documents Required` 
→ `Save Scheme`

### C. The Senior Citizen Persona Flow
Senior Citizens rely on pensions and healthcare, requiring simple, highly accessible UI.

`Landing` 
→ `Login` 
→ `Dashboard` 
→ `Voice Assistant` 
→ *Speaks: "Aasara pension details"* 
→ `AI Recommendation` 
→ `Eligible Schemes` 
→ `View Details`

---

## 2. Admin Workflows

### A. Village Admin Flow
Manages local verifications and grassroots assistance.

`Admin Login` 
→ `Dashboard (Village Level Metrics)` 
→ `Users Management` 
→ `Filter by: Unverified Profiles` 
→ `View Citizen Profile` 
→ `Approve/Verify` 
→ `Notifications (Send alert to Citizen)`

### B. Mandal Admin Flow
Oversees multiple villages within a mandal.

`Admin Login` 
→ `Dashboard (Mandal Level Metrics)` 
→ `Reports` 
→ `Generate Scheme Adoption Report by Village` 
→ `Download PDF` 
→ `Analytics (View top schemes in Mandal)`

### C. Super Admin Flow
Complete system control over architecture, datasets, and global analytics.

`Admin Login` 
→ `Super Dashboard` 
→ `Schemes Management` 
→ `Add New Scheme (Name, Dept, Eligibility Rules)` 
→ `Save Scheme` 
→ `Trigger Embedding Generation (AI Pipeline)` 
→ `Analytics (System-wide AI usage)`
