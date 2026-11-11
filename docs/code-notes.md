# Code Notes: Understanding the Dhaba Prep Assistant

This document explains every file and core mechanism in the project in plain language, prepared for the product development assignment review.

---

## 1. File-by-File Plain Language Breakdown

### `index.html`
- **What it does in one sentence:** It provides the visual skeleton and structure of the single-page web app, holding all 5 screens (Today, End-of-day Log, Tomorrow's Prep, Closing Count / Since Last Night, and Party Orders).
- **2 to 3 Most Important Elements:**
  1. `<section id="screen-today">`: The home dashboard featuring the four primary touch buttons and the upcoming party order counter badge.
  2. `<section id="screen-end-of-day">` & `<section id="screen-prep">`: Form containers where cooks enter stock numbers and view recommendations.
  3. `<div id="toast">`: Floating feedback element that confirms successful saves without distracting popups.
- **What breaks if you delete it:** The entire application loses its visual user interface and screen layout; the browser has nothing to display.

---

### `css/styles.css`
- **What it does in one sentence:** It formats the app to look like a high-contrast, clean mobile application designed for kitchen phones, ensuring all buttons are at least 48px tall for busy fingers.
- **2 to 3 Most Important Rules:**
  1. `:root` variables: Sets standard minimum touch targets (`--min-tap: 48px`) and the single warm terracotta accent color (`#c2410c`).
  2. `.big-btn`: Styles the primary 56px-tall navigation tiles with clear borders, active touch states, and badge counters.
  3. `.diff-negative` / `.diff-same` / `.diff-positive`: Highlights inventory deficits clearly in red, identical stock in neutral gray, and surpluses in green.
- **What breaks if you delete it:** The application appears as unstyled raw text and unformatted HTML boxes; touch targets become small, hard to tap, and unreadable in a busy kitchen.

---

### `js/firebase-config.js`
- **What it does in one sentence:** It stores the connection credentials to Google Firebase so the application can communicate with the remote Firestore cloud database.
- **2 to 3 Most Important Exports:**
  1. `firebaseConfig`: The JavaScript configuration object holding the `apiKey`, `projectId`, and related endpoints.
  2. `isFirebaseConfigured()`: A helper function that detects if real project keys have been supplied or if placeholders are still present.
- **What breaks if you delete it:** `js/db.js` fails to import configuration settings, preventing Firestore initialization.

---

### `js/db.js`
- **What it does in one sentence:** It serves as the single centralized database adapter for all reading and writing operations (supporting both Google Cloud Firestore and local persistent storage).
- **2 to 3 Most Important Functions:**
  1. `saveDayLog(dateStr, entries)`: Writes the daily inventory numbers to the `dayLogs` collection keyed by the date.
  2. `getRecentDayLogs(beforeDateStr, limitCount)`: Queries the past 7 daily logs before a given date to feed the suggestion engine.
  3. `saveClosingCount(...)` & `getLatestClosingCount()`: Persists shift handover numbers and retrieves the most recent shift's data for morning comparison.
- **What breaks if you delete it:** The app cannot save or retrieve any information; every button that attempts to persist data or show history fails.

---

### `js/suggestion.js`
- **What it does in one sentence:** It contains the mathematical intelligence of the app, calculating how much food to prepare tomorrow based on recent daily sales and safety buffers.
- **2 to 3 Most Important Functions:**
  1. `calculatePrepSuggestion(itemName, recentDayLogs)`: Extracts past consumption, averages it, multiplies by $(1 + \text{BUFFER})$, and generates the appropriate confidence note.
  2. `roundToHalf(num)`: Rounds quantities to the nearest 0.5 (e.g., 4.2 kg becomes 4.0 kg; 4.4 kg becomes 4.5 kg) to make cooking instructions practical.
- **What breaks if you delete it:** Tomorrow's prep screen cannot suggest cooking quantities; cooks would have to guess blind.

---

### `js/app.js`
- **What it does in one sentence:** It is the conductor that connects user interactions (taps, inputs, button clicks) with the database, math rules, and screen switching.
- **2 to 3 Most Important Functions:**
  1. `showScreen(screenKey, title)`: Hides all inactive screens and displays the requested screen, toggling the Back button.
  2. `loadEodScreen()` & `handleEodSave()`: Renders the daily log form, validates inputs against negative numbers, and saves to the database.
  3. `loadPrepScreen()` & `handleConfirmPrepList()`: Combines suggestions with upcoming party orders, handles `+` and `-` steppers, and confirms the prep plan.
- **What breaks if you delete it:** The app becomes completely static; buttons do not respond when tapped and no dynamic data renders.

---

### `firestore.rules`
- **What it does in one sentence:** It defines access control rules on Google Cloud, ensuring visitors can only read and write to the 6 legitimate application collections.
- **What breaks if you delete it:** The Firebase database remains exposed to insecure or default test-mode rules that expire after 30 days.

---

## 2. Core Concepts Explained with Real Numbers

### 1. How Tomorrow's Prep Suggestion is Calculated (Step-by-Step)
Suppose we are calculating tomorrow's prep for **Paneer (kg)**:
1. **Find daily sales:** For each historical day log:
   $$\text{Sold} = \text{Made} - \text{Left} - \text{Wasted}$$
   *(If negative due to a counting mistake, it clamps to 0).*
   - Monday: Made 5.0 kg, Left 0.8 kg, Wasted 0.2 kg $\implies$ Sold = $5.0 - 0.8 - 0.2 = 4.0\text{ kg}$.
   - Tuesday: Made 5.5 kg, Left 0.7 kg, Wasted 0.3 kg $\implies$ Sold = $5.5 - 0.7 - 0.3 = 4.5\text{ kg}$.
   - Wednesday: Made 4.5 kg, Left 0.8 kg, Wasted 0.2 kg $\implies$ Sold = $4.5 - 0.8 - 0.2 = 3.5\text{ kg}$.
2. **Calculate the Average:**
   $$\text{Average} = \frac{4.0 + 4.5 + 3.5}{3} = \frac{12.0}{3} = 4.0\text{ kg}$$
3. **Apply 10% Safety Buffer ($\text{BUFFER} = 0.10$):**
   $$\text{With Buffer} = 4.0 \times (1 + 0.10) = 4.0 \times 1.10 = 4.4\text{ kg}$$
4. **Round to the nearest 0.5 kg:**
   $$4.4\text{ kg} \implies 4.5\text{ kg}$$
5. **Add Party Order Extras:**
   If a party order is booked for tomorrow requesting 2.0 kg Paneer:
   $$\text{Total Prep} = \text{Adjusted (4.5 kg)} + \text{Party Extra (2.0 kg)} = 6.5\text{ kg}$$

---

### 2. Where the Data is Stored and How it Reads/Writes
- **Storage Layer:** Data is stored in **Google Cloud Firestore**, a NoSQL document database.
- **Collections:** There are 6 collections:
  - `items`: Master ingredients list (type: 'prep' or 'stock').
  - `dayLogs`: Daily logs, document ID is the date (`YYYY-MM-DD`).
  - `partyOrders`: Upcoming advance bookings.
  - `prepPlans`: Confirmed daily prep targets, document ID is the date.
  - `closingCounts`: Shift-end inventory counts with notes.
  - `morningChecks`: Shift-start discrepancy acknowledgments.
- **How Reads & Writes Occur:** When a cook taps "Save Log", `js/app.js` bundles the form values into a clean JavaScript object and calls `saveDayLog()` in `js/db.js`. That function uses Firestore's `setDoc(doc(db, "dayLogs", dateStr), data)` to write directly to Google Cloud over secure HTTPS.

---

### 3. What Happens When There Are Fewer than 7 Days of Logs?
The system adapts gracefully according to the number of available days ($N$):
- **7 or more days ($N \ge 7$):** Takes the 7 most recent days, computes the average, and displays the badge:
  `"Based on last 7 days"`
- **1 to 6 days ($1 \le N \le 6$):** Takes whatever days exist, computes the average over $N$ days, applies the buffer, and displays an honest transparency warning:
  `"Based on N day(s) of logs - not enough yet"`
- **0 days ($N = 0$):** If the restaurant just started using the app today:
  - Suggested value starts at **0.0 kg** (no `NaN`, no crash).
  - Displays the note:
    `"No logs yet - enter a quantity yourself"`
  - The cook uses the `+` stepper button to set their desired starting number.

---

### 4. How the "Since Last Night" Difference is Calculated
When closing staff leaves at 10:30 PM, they record:
- Ravi logged: Milk = 10 L, Paneer = 5 kg, Bread = 8 pcs. Note: *"gas low"*.

When morning staff arrives at 6:00 AM, they open **"Since last night"**:
1. The app loads Ravi's closing count record.
2. The morning person counts the physical stock currently on shelves and enters:
   - Milk: 8 L
   - Paneer: 5 kg
   - Bread: 5 pcs
3. The app calculates:
   $$\text{Difference} = \text{Current Count} - \text{Last Night's Count}$$
   - Milk: $8 - 10 = -2\text{ L} \implies$ **-2 L (Red badge: stock missing or used overnight)**.
   - Paneer: $5 - 5 = 0\text{ kg} \implies$ **same (Neutral gray badge)**.
   - Bread: $5 - 8 = -3\text{ pcs} \implies$ **-3 pcs (Red badge: missing)**.
4. Morning staff sees the note *"Ravi - gas low"*, types their name, and taps **"OK, seen"** to record accountability without finger-pointing.
