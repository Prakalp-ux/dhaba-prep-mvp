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
