# Dhaba Prep Assistant

A lightweight, mobile-first web application designed for owners and head cooks of small independent dhabas, cafes, and highway eateries to log daily leftovers, predict tomorrow's prep, and catch shift-handover shrinkage in under 3 minutes.

---

## 1. One-Line Scope
My MVP lets owners of small independent food businesses (dhabas, cafes, small hotels) do a 3-minute daily log of what they made, what is left and what was wasted, plan tomorrow's prep from it, and count closing stock at shift change, so that they cook closer to real demand and notice missing stock at handover instead of absorbing the loss.

---

## 2. Links & Deliverables
- **Live MVP Link:** [https://dhaba-prep-mvp.web.app](https://dhaba-prep-mvp.web.app) *(or open locally via simple HTTP server)*
- **GitHub Repository:** [https://github.com/Prakalp-ux/dhaba-prep-mvp.git](https://github.com/Prakalp-ux/dhaba-prep-mvp.git)
- **Documentation Folder (`docs/`):**
  - `docs/product-brief.md`: Product brief, user journey, MoSCoW scoping, and wireframes.
  - `docs/implementation-plan.md`: Step-by-step 5-task build order and database specifications.
  - `docs/build-log.md`: Detailed session-by-session build log with prompts, issues, and fixes.
  - `docs/code-notes.md`: Plain-language explanation of every code file and worked math examples.
  - `docs/feature-checklist.md`: MoSCoW evaluation of all candidate features.
  - `docs/hallway-test.md`: Real-world hallway user testing notes and subsequent UX iteration.

---

## 3. How to Run Locally
Because this application is built with zero dependencies, vanilla HTML5, CSS3, and ES6 JavaScript, you can run it instantly with Python's built-in web server:

```bash
# In the project root directory:
python3 -m http.server 8080
```
Then open your browser to:
`http://localhost:8080/`
*(Tip: In Chrome or Safari DevTools, toggle Device Emulation to an iPhone 14/15 or Android at 360px–390px width for the best mobile experience).*

---

## 4. The 4 Must-Have Features Built

### 1. End-of-Day Stock & Waste Log (Screen B)
- Quick date selector (defaults to current date, with calendar picker for missed days).
- Pre-loaded prep items: **Dal (kg)**, **Paneer (kg)**, **Mixed veg (kg)**, and **Rice (kg)**.
- 3 clear numeric inputs per item: **Made**, **Left**, and **Wasted**.
- Inline **+ Add item** to track custom gravies or dishes.
- Real-time validation preventing negative numbers and warning if $Left + Wasted > Made$.

### 2. Tomorrow's Prep Suggestion Engine (Screen C)
- Automatically calculates tomorrow's prep using the rolling average of the past 7 days of consumption:
  $$\text{Sold} = \text{Made} - \text{Left} - \text{Wasted}$$
  $$\text{Suggested} = \text{Average Sold} \times 1.10\quad (\text{rounded to nearest } 0.5)$$
- Shows contextual confidence badges:
  - *"Based on last 7 days"* (when $\ge 7$ logs exist).
  - *"Based on N day(s) of logs - not enough yet"* (when 1–6 logs exist).
  - *"No logs yet - enter a quantity yourself"* (graceful empty state starting at 0).
- Inline `[-]` and `[+]` steppers (0.5 increments) to fine-tune prep targets.
- Displays upcoming party bookings as separate extra prep lines, automatically summing into **Total to cook tomorrow**.

### 3. Closing Count & "Since Last Night" Discrepancy (Screens D & D2)
- Closing staff records their name, closing physical stock (Milk L, Paneer kg, Eggs pcs, Bread pcs), and a morning note (e.g., *"gas low"*).
- Morning staff opens **"Since last night"** to view previous night's counts and note.
- Real-time difference calculation ($Current - LastNight$):
  - Deficits highlighted in bold red (e.g. `-2 L`).
  - Identical counts displayed as neutral `same`.
  - Surpluses shown in green (`+1 L`).
- 1-tap **"OK, seen"** logs shift acknowledgment to prevent blame games and inventory shrinkage.

### 4. Party / Advance Order Entry (Screen E)
- Allows logging scheduled catering or party bookings (date, head count, item quantities, and advance paid in Rs.).
- Shows upcoming bookings sorted by date with 1-click delete confirmation.
- Home screen dynamically displays upcoming party count: `Party orders (N upcoming)`.

---

## 5. Technology Architecture
- **Frontend:** Pure semantic HTML5, responsive CSS3 variables, and vanilla modular JavaScript (ES Modules).
- **Backend & Database:** Google Firebase Cloud Firestore (SDK v10.12.0 loaded via official Google CDN).
- **Security Rules:** `firestore.rules` strictly limits read/write access to the 6 application collections (`items`, `dayLogs`, `partyOrders`, `prepPlans`, `closingCounts`, `morningChecks`).
- **Resilience:** Built-in offline fallback adapter inside `js/db.js` ensures full interactive functionality even when offline or before cloud credentials are configured.

---

## 6. Known Limits (Deliberately Excluded for MVP)
To guarantee a rock-solid, focused v1 MVP, the following were explicitly excluded:
- **No user login / passwords:** Devices are shared on the kitchen prep counter; login friction causes staff to abandon the app.
- **Single outlet only:** Tailored for independent single-site dhabas and cafes.
- **No currency waste calculations or ingredient pricing:** Focus is 100% on physical kitchen volume (kg, L, portions).
- **English interface for v1:** Uses universal icons, numbers, and plain words; regional language packs reserved for v2.
