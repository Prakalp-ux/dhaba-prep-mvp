# Dhaba Prep Assistant - MVP Build Log

## Session 1: Setup, Repository Configuration & Scoping
- **Date & Task:** 12 Nov - Setup, README, and Product Brief Alignment
- **Prompt Used:**
  > Set up this project folder:
  > - Run git init and create a .gitignore with: node_modules, .env, .firebase, .DS_Store
  > - Create README.md with the title 'Dhaba Prep Assistant' and the one-line scope from Section 1.1 of docs/MVP_Build_Pack.pdf
  > - Create an empty docs/build-log.md
  > - Connect the remote https://github.com/Prakalp-ux/dhaba-prep-mvp.git, make the first commit with the message 'Add product brief and README', and push to main
- **What Worked:** Clean repository initialization, creation of `.gitignore` and `README.md` strictly aligned with the Dhaba Prep Assistant one-line scope.
- **What Broke:** A previous AI draft had generated out-of-scope files for a different kitchen app (including WhatsApp sharing and rush status tracking, which are explicitly on the "Do NOT build" list in Section 1.5).
- **How I Fixed It:** Pruned out-of-scope untracked files, reset git tracking, and replaced `product-brief.md` with the authentic 4-Must-Have product brief from the assignment pack.
- **Commit Message:** `Add product brief and README`

---

## Session 2: Implementation Plan & Scope Cutting
- **Date & Task:** 12 Nov - Implementation Plan and Task List
- **Prompt Used:**
  > Produce an implementation plan and task list and save it as docs/implementation-plan.md. It must include:
  > 1. A build order with exactly these tasks: Task 0 skeleton + Firebase + home screen + deploy; Task 1 End-of-day log; Task 2 Party order; Task 3 Tomorrow's prep; Task 4 Closing count + Since last night.
  > 2. Every file you will create, with one plain-language sentence on what it does.
  > 3. The Firestore data model compared with Section 1.7.
  > 4. Verification steps for each task.
  > 5. Deliberately excluded extras.
- **What Worked:** Clear 5-task build order created in `docs/implementation-plan.md` with zero non-essential additions.
- **What Broke:** None. Plan is scoped strictly to the 4 Must-haves.
- **How I Fixed It:** Verified against Section 1.5 of the brief to ensure no pricing, currency calculations, or extra frameworks were introduced.
- **Commit Message:** `Add implementation plan`

---

## Session 3: Task 0 - Project Skeleton, Home Screen & Firestore Setup
- **Date & Task:** 12 Nov - Task 0 Skeleton, Navigation & Database Connection
- **Prompt Used:**
  > Start Task 0 only: the project skeleton. Follow docs/implementation-plan.md and the brief.
  > - Plain HTML, CSS and JavaScript. No build tools and no frameworks. Use the Firebase JS SDK (modular) loaded from the official CDN as ES modules.
  > - Files: index.html, css/styles.css, js/app.js (screen switching), js/firebase-config.js (clear placeholders where I paste my config), js/db.js (all Firestore reads and writes in one place).
  > - Home screen 'Today' with today's date and four large buttons: End-of-day log, Tomorrow's prep, Closing count, Party orders (wireframe A). Each button opens a placeholder screen with a Back arrow. Do not build the features yet.
  > - Mobile-first, works at 360 px wide, tap targets at least 48 px tall, one accent colour, simple English.
  > - On first load, if the 'items' collection is empty, create the default items from Section 1.7 of the brief.
  > - Put a comment at the top of every file saying what it does.
- **What Worked:** Created modular architecture (`index.html`, `css/styles.css`, `js/app.js`, `js/db.js`, `js/firebase-config.js`). Navigation between all 4 sub-screens and back to 'Today' tested cleanly at 390x844 mobile resolution. Default prep items (Dal, Paneer, Mixed veg, Rice) and stock items (Milk, Paneer, Eggs, Bread) initialized.
- **What Broke:** Local browser testing needed fallback resilience when Firebase API keys are still placeholders, to ensure the UI does not crash or throw unhandled exceptions during initial setup.
- **How I Fixed It:** Added a clean automatic fallback adapter inside `js/db.js` that uses localStorage when placeholders are present, and seamlessly transitions to live Firebase Firestore once real credentials are provided.
- **Commit Message:** `Add project skeleton with home screen and Firebase connection`

---

## Session 4: Task 1 - End-of-day Stock & Waste Log (Must-have 1)
- **Date & Task:** 12 Nov - Task 1 End-of-day Log (Screen B)
- **Prompt Used:**
  > Build Task 1 only: the End-of-day log (screen B). Do not touch other screens.
  > - Show a date at the top (default today, device date) with a small date picker so I can log a missed day.
  > - One row per prep item (items with type 'prep'): Dal, Paneer, Mixed veg, Rice. Each row has three number inputs: Made, Left, Wasted, in the item's unit. Decimals allowed, numeric keypad on phones.
  > - '+ Add item' lets me type a new item name and unit. It appears as a new row and is saved to 'items' with type 'prep'.
  > - 'Save' writes ONE document to 'dayLogs' with the date as its id (saving the same date again replaces it). Empty fields are saved as 0. Reject negative numbers with a plain message under the field.
  > - If a log already exists for the chosen date, open the screen with the values filled in.
  > - If Left + Wasted is more than Made, show a warning but still allow saving.
  > - After saving, show a clear 'Saved' message and return to Today.
- **What Worked:** Successfully implemented End-of-day log with dynamic date selection, row per prep item, 3 number inputs (Made, Left, Wasted), dynamic '+ Add item' inline creation, and automatic reloading of saved values for any chosen date.
- **What Broke:** If a user typed a negative value, simple browser alert was too intrusive for a phone screen.
- **How I Fixed It:** Added inline red validation messages under the cards and blocked save until negative values are corrected. Added warning banner if `Left + Wasted > Made` while still allowing save.
- **Commit Message:** `Add end-of-day log with made, left and wasted per item`

---

## Session 5: Task 2 - Party Order Entry & Upcoming List (Must-have 4)
- **Date & Task:** 12 Nov - Task 2 Party Orders (Screen E)
- **Prompt Used:**
  > Build Task 2 only: Party orders (screen E). Do not touch other screens.
  > - Form fields: Date of the party (date picker, default tomorrow), Head count (whole number), Items (each row = choose a prep item + quantity in its unit; '+ Add row'), Advance paid in Rs. (number, may be 0).
  > - 'Save' writes a document to 'partyOrders' using the fields in Section 1.7 of the brief. Show 'Saved'.
  > - Below the form, list upcoming party orders (today and later) sorted by date, each showing date, head count and items. Each has a small Delete button with a confirmation so mistakes can be fixed.
  > - On the home screen, label the button with the count, like 'Party orders (2 upcoming)'.
  > - Show the hint 'Adds to Tomorrow's prep' under Save. The prep screen is built in the next task.
- **What Worked:** Party orders screen with dynamic item selector rows, unit auto-updates, advance payment input, upcoming sorted list, and deletion with user confirmation. The Home screen button dynamically displays the upcoming party order count badge.
- **What Broke:** Initial form allowed submitting zero food item rows, which could create an empty demand record.
- **How I Fixed It:** Added validation requiring at least one valid food item with positive quantity before saving.
- **Commit Message:** `Add party order entry and upcoming list`

---

## Session 6: Task 2.5 - Temporary Test Data Seed Page (seed.html)
- **Date & Task:** 12 Nov - Test Data Seeder (seed.html)
- **Prompt Used:**
  > Create a temporary developer-only page seed.html that is NOT linked from anywhere in the app. It has two buttons:
  > 1. 'Add test data': writes dayLogs for each of the last 7 days (before today) for all four prep items, with realistic made/left/wasted numbers for a small dhaba that vary from day to day (for example paneer made 5 kg, left 0.5 to 1 kg, wasted 0 to 0.5 kg). Also writes one partyOrders document for tomorrow (20 people, 2 kg paneer, 3 kg rice).
  > 2. 'Delete all test data': deletes every document in dayLogs, partyOrders, prepPlans, closingCounts and morningChecks where isTest is true.
  > Every test document must contain isTest: true. Do not change any other file. In the last line of your answer write: 'Delete seed.html before the final deploy.'
- **What Worked:** Created standalone `seed.html` with two clear buttons. Successfully writes 7 previous day logs for all 4 items and 1 party order for tomorrow with `isTest: true`. Also provides 1-click clean deletion of test records.
- **What Broke:** None. Standalone developer utility operating independently without polluting navigation.
- **How I Fixed It:** Verified that `seed.html` is completely unlinked from user-facing screens and tagged every generated record with `isTest: true`.
- **Commit Message:** `Add temporary seed page for test data`

---

## Session 7: Task 3 - Tomorrow's Prep Suggestion Engine (Must-have 2)
- **Date & Task:** 12 Nov - Task 3 Tomorrow's Prep (Screen C)
- **Prompt Used:**
  > Build Task 3 only: Tomorrow's prep (screen C). Use exactly the suggestion rule in Section 1.8 of the brief.
  > - Put the rule in one clearly named function in js/suggestion.js with comments. Keep the buffer as one constant at the top: BUFFER = 0.10.
  > - Before coding, show me the formula worked out on 3 sample numbers so I can check it by hand.
  > - Screen: tomorrow's date as heading. For each prep item show the suggested quantity with a minus and plus button (step 0.5) and the note line from the brief ('Based on last 7 days', 'Based on N day(s) of logs - not enough yet', or 'No logs yet - enter a quantity yourself').
  > - Below, show Party extras separately, one line per party dated tomorrow, like 'Party Sat: +2 kg paneer'. Show a final total per item = my adjusted quantity + party extras.
  > - 'Confirm prep list' saves one document to 'prepPlans' with tomorrow's date as its id (replace if it exists) and shows 'Saved'. If a confirmed plan already exists, load its adjusted values.
  > - No NaN, no negative numbers and no blank screen when there are zero logs.
- **What Worked:** Created `js/suggestion.js` implementing $sold = made - left - wasted$, 7-day average, 10% safety buffer ($BUFFER = 0.10$), and 0.5 unit rounding (`Math.round(val * 2) / 2`). Handled empty state gracefully without `NaN`. Party extras for tomorrow are added on separate highlighted rows and included in the final prep total.
- **What Broke:** Stepper could decrement below 0 if clicked repeatedly on items with zero baseline.
- **How I Fixed It:** Added guard check preventing adjusted quantity from dropping below 0.
- **Commit Message:** `Add tomorrow's prep suggestion with party extras`
