# GramAI UI/UX Strategy & Wireframes

This document outlines the overarching UI/UX strategy for GramAI, focusing heavily on Rural-First design principles, WCAG Accessibility, and low-fidelity wireframe definitions.

## 1. Rural-First Design Principles

GramAI's primary users (Farmers, Senior Citizens in Telangana) may have low digital literacy. The design must accommodate this:
- **Mobile-First Responsiveness:** Over 90% of traffic will be mobile. All layouts stack vertically.
- **Voice-First Interaction:** A prominent, always-accessible Microphone button overrides the need for complex typing.
- **Telugu-Friendly:** Typography (`Noto Sans Telugu`) is sized 10-15% larger than standard English to preserve legibility of complex conjuncts.
- **Minimal Text / High Iconography:** Use universally understood icons (Lucide React) alongside text labels.
- **Large Click Targets:** Buttons and interactive elements are minimum `48px` tall (Apple HIG standard).

## 2. Accessibility (WCAG 2.1 AA)
- **High Contrast:** Text against backgrounds meets the 4.5:1 ratio.
- **Screen Reader Support:** All actionable items have `aria-labels`. Images have `alt` tags.
- **Keyboard Navigation:** Forms and tables are fully navigable via `Tab`. Focus rings are highly visible.

## 3. Voice Assistant UX
The Voice Assistant is the USP of GramAI. The UI state must clearly reflect the AI's processing status.

### States:
1. **Idle:** A floating action button (FAB) with a mic icon in the primary color.
2. **Listening:** FAB expands, turns `Accent` (Amber), and displays a pulsating radar animation. Text: "Listening... (వింటున్నాను)"
3. **Processing:** Mic icon changes to a loading spinner. Text: "Thinking... (ఆలోచిస్తున్నాను)"
4. **Speaking:** Returns to `Primary` color but displays audio wave animation as Piper TTS plays.
5. **Error/Retry:** Turns `Danger` (Red) with a retry icon. "Could not hear you. Tap to retry."

---

## 4. Animation Guidelines (Framer Motion)
Animations should feel smooth and premium, but never distracting.
- **Page Transitions:** Fade in (`opacity: 0 -> 1`) with a slight upward slide (`y: 10 -> 0`) over `0.3s`.
- **Card Hover:** Desktop only. Slight lift (`y: -4px`) and shadow increase over `0.2s`.
- **Notification Toast:** Slide in from right/bottom (`x/y: 50 -> 0`) with spring physics.
- **Modal:** Scale in (`scale: 0.95 -> 1`, `opacity: 0 -> 1`) over `0.2s`.

---

## 5. Wireframes (Low-Fidelity structural maps)

### A. Landing Page
- **Header:** Logo (Left), Language Switcher (Right), Login Button.
- **Hero Section:** Large headline ("Your Government Benefits, Simplified"). Subheadline. Primary CTA ("Get Started with Voice").
- **Features Grid:** 3 columns. Icon + Title + Short description (Voice AI, Fast Recommendations, Secure).
- **Footer:** Links, Copyright.

### B. Auth (Login/Register)
- **Container:** Centered card, max-width `400px`.
- **Header:** "Welcome to GramAI".
- **Form:** 
  - Input: Phone Number / Email
  - Input: Password
  - Button: "Login" (Solid full width)
- **Footer:** "Don't have an account? Register."

### C. Citizen Dashboard
- **Header:** Profile Avatar, Notifications Bell (Top Right).
- **Hero Panel:** "Hello, [Name]". Large Voice Assistant FAB in the center of a prompt card: "Tap to ask about schemes."
- **Quick Links (Horizontal Scroll):** Agriculture, Pensions, Scholarships.
- **My Saved Schemes:** 2-column grid of cards showing previously saved schemes.

### D. Scheme Details
- **Header:** Back button, Scheme Name.
- **Status Badge:** "Eligible" (Green) or "Ineligible" (Red).
- **Content Blocks:**
  - Description
  - Benefits
  - Required Documents (List format with check icons)
- **Sticky Footer Action:** "Apply Now" (External Link) or "Save for Later".

### E. Admin Dashboard
- **Sidebar (Left):** Logo, Navigation (Dashboard, Users, Schemes, Analytics).
- **Top Bar:** Search, Admin Profile.
- **Content Area:** 
  - KPI Cards (Total Citizens, Schemes Matched, Voice Queries).
  - Data Table (Recent User Registrations) with Action dots (Approve/Reject).

### F. Analytics
- **Top:** Date Range Picker.
- **Charts:** 
  - Line Chart: Daily Active Users.
  - Bar Chart: Most Queried Schemes.
  - Pie Chart: Voice vs Text Queries.
