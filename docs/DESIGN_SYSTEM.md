# GramAI Design System

This document outlines the core visual language, design tokens, and component architecture for the GramAI frontend. It is intended to be implemented using Tailwind CSS in Phase 6.

## 1. Design Tokens

### A. Color Palette
To ensure high contrast and a premium yet accessible look, the color palette is anchored in trust-inspiring government blues, energetic agriculture greens, and clear alert colors.

| Token | Hex / Value | Purpose |
|---|---|---|
| `Primary` | `#1D4ED8` (Blue 700) | Main brand color, Primary buttons, Active states |
| `Primary Hover` | `#1E3A8A` (Blue 900) | Interactive hover states |
| `Secondary` | `#10B981` (Emerald 500) | Secondary actions, Agriculture highlights |
| `Secondary Hover`| `#059669` (Emerald 600) | Secondary hover states |
| `Accent` | `#F59E0B` (Amber 500) | Voice Assistant pulse, highlights |
| `Success` | `#22C55E` (Green 500) | Scheme eligibility, success toasts |
| `Warning` | `#EAB308` (Yellow 500) | Missing documents, warnings |
| `Danger` | `#EF4444` (Red 500) | Errors, destructive actions |
| `Info` | `#3B82F6` (Blue 500) | Informational badges |
| `Background` | `#F8FAFC` (Slate 50) | Main application background |
| `Surface` | `#FFFFFF` (White) | Cards, Modals, Dropdowns |
| `Border` | `#E2E8F0` (Slate 200) | Dividers, input borders |
| `Text Base` | `#1E293B` (Slate 800) | Standard body text |
| `Text Muted` | `#64748B` (Slate 500) | Secondary text, placeholders |

### B. Typography
**Primary Font:** `Inter` (Sans-serif) for English interfaces.
**Secondary Font:** `Noto Sans Telugu` for seamless Telugu rendering.
- `h1`: 2.25rem (36px), Bold
- `h2`: 1.875rem (30px), Semibold
- `h3`: 1.5rem (24px), Medium
- `body`: 1rem (16px), Regular (Large base size for readability)
- `small`: 0.875rem (14px), Regular

### C. Spacing System
Based on the 4px grid.
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px

### D. Border Radius & Elevation
- **Border Radius:** `8px` (rounded-lg) for inputs and buttons; `12px` (rounded-xl) for cards to give a soft, premium feel.
- **Elevation (Shadows):** 
  - `sm`: Header navigation separation.
  - `md`: Standard cards.
  - `lg`: Hover states on cards.
  - `xl`: Modals and dropdowns.

---

## 2. Component Library Architecture

### A. Core Elements
- **Buttons:** Large click targets (min-height 48px). Variants: `Solid`, `Outline`, `Ghost`. Includes loading state spinner.
- **Inputs:** High contrast borders (`border-slate-300`), clear focus rings (`ring-2 ring-primary`).
- **Cards:** White surface, `md` shadow, `12px` radius. Used for wrapping scheme details.

### B. Form Controls
- **Dropdowns / Select:** Custom styled native selects or Radix-based dropdowns.
- **Checkbox / Radio:** Scaled up by 1.25x for easier tapping on mobile.
- **Textarea:** For contact forms and manual chat fallback.

### C. Feedback & Overlay
- **Modal / Dialog:** Centered overlay with backdrop blur. Used for Scheme Application previews.
- **Toast:** Bottom-center for mobile, top-right for desktop. Non-intrusive feedback.
- **Loader:** Custom animated spinner or skeleton screens for data fetching.
- **Badge:** Small pill-shaped text wrappers for "Eligible", "Pending", etc.
- **Tooltip:** Only on desktop. Mobile uses inline helper text.

### D. Layout & Navigation
- **Navbar:** Sticky top. Contains logo, language switcher, and profile avatar.
- **Sidebar:** Used primarily in the Admin portal. Hidden behind a hamburger menu on mobile.
- **Footer:** Public pages only. Contains links, copyright, contact info.

### E. Data Display
- **Data Table:** Admin portal only. Includes horizontal scroll, pagination, sorting.
- **Charts:** (Recharts) Used in Admin Analytics. Colors map directly to Design Tokens.
- **Pagination:** Simple `Prev` | `1, 2, 3` | `Next` buttons.
- **Search:** Prominent search bar with magnifying glass icon (Lucide React).
