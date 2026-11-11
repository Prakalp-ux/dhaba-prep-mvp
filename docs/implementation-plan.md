# Implementation Plan: Dhaba Prep Assistant MVP

## 1. Build Order
The MVP is built in 5 strictly scoped tasks, one feature at a time:
- **Task 0: Skeleton + Firebase + Home Screen + Deploy**
  - Set up HTML/CSS/JS shell, Firebase Firestore configuration, single-screen routing, and Home screen (wireframe A) with 4 primary action buttons.
- **Task 1: End-of-day Log (Must-have 1, Screen B)**
  - Date selector, input rows for prep items (Made, Left, Wasted), + Add Item row, Save button saving to `dayLogs`, and existing log loading.
- **Task 2: Party Orders (Must-have 4, Screen E)**
  - Party booking form (date, head count, items, advance paid), save to `partyOrders`, upcoming orders list with delete confirmation, and Home screen badge count.
- **Task 3: Tomorrow's Prep Suggestion (Must-have 2, Screen C)**
  - Implement rolling 7-day average calculation with 10% buffer in `js/suggestion.js`, item adjustment steppers (+ / -), separate Party Extras line, Total calculation, and Save to `prepPlans`.
- **Task 4: Closing Count + Since Last Night (Must-have 3, Screens D & D2)**
  - Closing stock input with handover note saved to `closingCounts`, and "Since last night" view showing previous shift numbers, current count inputs, and live differences (missing stock indicated with minus).

---

## 2. File Structure & Responsibilities
Every file has one clear purpose:
- `index.html`: Holds the single-page HTML skeleton containing all 5 screens (Today, End-of-day Log, Tomorrow's Prep, Closing Count / Since Last Night, Party Orders) and navigation containers.
- `css/styles.css`: Mobile-first styling ensuring large 48px+ touch targets, simple high-contrast dhaba styling, and clean responsive layout at 360px width.
- `js/firebase-config.js`: Exports the Firebase project configuration object with clear placeholder fields where project keys are defined.
- `js/db.js`: Contains all Firestore database read and write functions in one place (`getItems`, `saveDayLog`, `getDayLog`, `savePartyOrder`, `getUpcomingPartyOrders`, `savePrepPlan`, `saveClosingCount`, `getLastClosingCount`, `saveMorningCheck`).
- `js/suggestion.js`: Contains the isolated math function for the 7-day rolling average suggestion with 10% safety buffer and 0.5 rounding.
- `js/app.js`: Coordinates screen switching, form events, input validation, UI state updates, and user messaging.
- `seed.html`: (Temporary development helper) Allows 1-click seeding of 7 days of realistic dhaba test logs and 1 party order for verifying prep suggestions, and 1-click wipe. Deleted before final submission.
- `firestore.rules`: Security rules restricting read/write access strictly to the 6 application collections.

---

## 3. Firestore Data Model Comparison
The data model matches Section 1.7 of the Product Brief with zero discrepancies:
- `items`: `{ name, unit, type ('prep' | 'stock'), createdAt }`
- `dayLogs`: Keyed by date string (`YYYY-MM-DD`). Fields: `{ date, entries: [{ itemId, name, unit, made, left, wasted }], savedAt }`
- `partyOrders`: Auto-generated IDs. Fields: `{ date, headCount, items: [{ name, unit, qty }], advancePaid, createdAt }`
- `prepPlans`: Keyed by `forDate` (`YYYY-MM-DD`). Fields: `{ forDate, lines: [{ itemId, name, unit, suggested, adjusted, partyExtra, total }], confirmedAt }`
- `closingCounts`: Auto-generated IDs. Fields: `{ person, date, savedAt, counts: [{ itemId, name, unit, qty }], note }`
- `morningChecks`: Auto-generated IDs. Fields: `{ checkedBy, checkedAt, againstCountId, differences: [{ name, unit, diff }], seen }`

---

## 4. Verification & Testing Guide per Task
- **Task 0 (Skeleton):**
  - *What you see:* Clean mobile screen with Today's date and 4 large buttons. Tapping any button opens its screen with a Back arrow returning to Today.
  - *How to test:* Tap each button, verify transition and Back button. Verify default items populate in Firestore.
- **Task 1 (End-of-day Log):**
  - *What you see:* Date picker, 4 prep items (Dal, Paneer, Mixed veg, Rice) with Made, Left, Wasted numeric fields.
  - *How to test:* Enter values, click Save. Reopen the date; values persist. Test validation by entering negative numbers.
- **Task 2 (Party Orders):**
  - *What you see:* Form for date, head count, item selector, advance paid. Below is an upcoming orders list with delete buttons.
  - *How to test:* Add an order for tomorrow. Verify it shows in the list and home button shows "Party orders (1 upcoming)". Delete and confirm removal.
- **Task 3 (Tomorrow's Prep):**
  - *What you see:* Tomorrow's date, prep items with suggested quantities, plus/minus adjustment buttons, party extras listed separately, and calculated total.
  - *How to test:* Check math against 7-day average + 10% buffer. Click + and - to adjust. Confirm prep list and verify saved in Firestore.
- **Task 4 (Closing Count & Handover):**
  - *What you see:* Closing stock inputs (Milk, Paneer, Eggs, Bread) and note input. "Since last night" view showing last count and difference calculation.
  - *How to test:* Save closing count as "Ravi". Open "Since last night", type in lower count, verify negative difference ("-2 L") is displayed.

---

## 5. Things NOT Added (Strictly Excluded Extras)
The following were deliberately excluded to prevent scope creep:
- No rupee waste calculations or pricing inputs.
- No user login, passwords, or multi-tenant accounts.
- No WhatsApp automated export or bot messaging.
- No Hindi / multi-language switcher.
- No supplier ordering or automated purchase orders.
- No analytics charts or graphs.

---

## 6. Answers to Brief Clarifications
- **Default Dates:** "Today" screen uses the device's current date. Party order defaults to tomorrow.
- **Negative Sales Handling:** If Made - Left - Wasted < 0 (e.g. data entry mistake), sold is clamped to 0 so suggestions are never negative.
- **Unrounded Numbers:** All prep suggestions are rounded to the nearest 0.5 kg/L for ease of kitchen cooking.
