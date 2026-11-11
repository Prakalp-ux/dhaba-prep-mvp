# Implementation Plan & Task List: Dhaba Prep MVP

**Status:** Approved for Implementation  
**Strict Focus:** Must-Have Features Only (Non-essential features cut)  
**Target Completion:** 5 Iterative Development Sessions

---

## 1. Scope Validation & Cut List
Before initiating code, all non-essential requirements were reviewed and pruned to prevent scope creep:

| Candidate Feature | Decision | Rationale |
|---|---|---|
| Mobile Kitchen Shell & High Contrast Theme | **KEEP (Must-Have)** | Essential for readable display in warm, brightly lit kitchens. |
| 3-State Lifecycle (`Pending` -> `In-Prep` -> `Ready`) | **KEEP (Must-Have)** | Core functionality: tracking item readiness. |
| LocalStorage Auto-Sync | **KEEP (Must-Have)** | Essential so kitchen cooks don't lose data on page refresh. |
| Quick-Add Urgent Prep Item | **KEEP (Must-Have)** | Dhabas face unexpected party orders and need ad-hoc tracking. |
| Quantity Stepper (+ / -) | **KEEP (Must-Have)** | Allows quick volume adjustments without tedious form typing. |
| WhatsApp Kitchen Summary Generator | **KEEP (Must-Have)** | Immediate communication channel between cooks and owners. |
| Audio Completion Feedback | **KEEP (Must-Have)** | Allows audio verification in noisy kitchen environments. |
| User Login / Phone OTP Auth | **CUT** | Adds friction; kitchen devices are shared. |
| Multi-restaurant backend (Firebase/SQL) | **CUT** | Unnecessary complexity for single-outlet MVP. |
| Recipe Ingredient Breakdown Math | **CUT** | Cooks already know recipes; they only need batch tracking. |
| Supplier Auto-Reordering | **CUT** | Out of scope for kitchen prep checklist. |

---

## 2. Iterative Build Plan

### Session 1: Shell Architecture & Kitchen Dashboard Layout
- **Goal:** Set up responsive HTML5 mobile-first layout with Tailwind CSS.
- **Tasks:**
  - Create `index.html` and `styles.css`.
  - Build top navigation with Dhaba Prep branding, active shift indicator (Lunch/Dinner), and Reset button.
  - Implement real-time Rush Readiness Banner with progress bar and count badges (`Ready`, `In-Prep`, `Pending`).
  - Add responsive sticky bottom quick-action bar for mobile devices.
- **Verification:** View page in mobile view (390px - 768px), verify high-contrast readability and layout spacing.

### Session 2: Core Data Model, Category Grouping & 3-State Lifecycle
- **Goal:** Implement persistent state management and 3-stage status cycling.
- **Tasks:**
  - Create `app.js` with structured seed data for 4 core Dhaba categories:
    1. Base Gravies (Makhani Gravy, Onion-Tomato Masala, Dal Tadka Base).
    2. Veg & Paneer (Paneer Cubes, Diced Capsicum/Onion, Ginger-Garlic Paste).
    3. Marinades & Dairy (Tandoori Red Marinade, Malai Chaap Marinade, Hung Curd).
    4. Tandoor & Doughs (Atta Dough, Roomali Dough, Stuffed Naan Stuffing).
  - Implement `toggleItemStatus(id)`: cycles `pending` -> `in-progress` -> `ready` -> `pending`.
  - Connect LocalStorage serialization (`saveToStorage()` and `loadFromStorage()`).
  - Render station groups with visually distinct colored badges.
- **Verification:** Tap items in browser, verify status cycles and persists after hard page refresh.

### Session 3: Direct Quantity Adjusters & Quick Urgent Item Creation
- **Goal:** Enable quick inline adjustments and fast item additions during peak rushes.
- **Tasks:**
  - Implement inline quantity steppers (`+` and `-`) with min bounds.
  - Build "Add Urgent Prep Item" modal with fields: Item Name, Quantity, Unit (L, kg, portions), Station Category, Priority checkbox.
  - Validate input fields (prevent empty submissions).
  - Dynamically prepend new item to active category and re-render.
- **Verification:** Add an ad-hoc item (e.g. "Special Dal Makhani 12 L"), verify it appears in Gravies section with urgency styling.

### Session 4: Category Filtering & 1-Tap WhatsApp Shift Summary
- **Goal:** Facilitate fast station focus and immediate owner communication.
- **Tasks:**
  - Add filter tabs: `All`, `Pending`, `In Progress`, `Ready`.
  - Add station pills: `All Stations`, `Gravies`, `Veggies`, `Marinades`, `Tandoor`.
  - Build `exportWhatsAppSummary()` function that formats the current shift status into clean WhatsApp markdown text with emojis.
  - Open WhatsApp Web / App directly via `https://api.whatsapp.com/send?text=...`.
- **Verification:** Tap WhatsApp button, verify generated text matches actual inventory counts and URL encodes properly.

### Session 5: Kitchen Sound Alert, Shift Reset & Hallway Test Polish
- **Goal:** Add sensory feedback, shift turnover safety, and finalize UX for non-technical users.
- **Tasks:**
  - Integrate Web Audio API chime tone (synthesized dual-beep sine wave) triggered upon marking an item `Ready`.
  - Add shift reset confirmation modal to prevent accidental data loss.
  - Hallway test with one outside user, record findings, and refine touch target sizes.
- **Verification:** Mark item ready on mobile, verify audio triggers smoothly without asset download latency.
