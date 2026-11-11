# Product Brief: Dhaba Prep Assistant

## 1.0 Rules for the Agent
- Do not write any code until the user's message tells you to. Do only the one task the message names, then stop.
- Build the four Must-haves in Section 1.4 and nothing else. If you think something extra is needed, list it and wait for approval.
- Keep the code simple and well commented. The student is a beginner and must explain every file at review.
- After every task, report: files changed, how to test it, and a phone-sized screenshot of the result.
- Never put real passwords or private keys in the code. Firebase web config values are allowed.

## 1.1 One-Line Scope
My MVP lets owners of small independent food businesses (dhabas, cafes, small hotels) do a 3-minute daily log of what they made, what is left and what was wasted, plan tomorrow's prep from it, and count closing stock at shift change, so that they cook closer to real demand and notice missing stock at handover instead of absorbing the loss.

## 1.2 User
The owner of a small dhaba or cafe, using a phone, not used to office software. Hands are often busy, so buttons must be large and words simple. The daily log must take under 3 minutes.

## 1.3 User Journey
| # | What the user does |
|---|---|
| 1 | Opens the app on the phone. Sees the Today screen with four big buttons. |
| 2 | After closing, taps End-of-day log. For each item enters Made, Left and Wasted. Saves. |
| 3 | Next evening taps Tomorrow's prep. Sees a suggested quantity per item, adjusts with plus and minus, confirms. |
| 4 | If a party is booked, enters it in Party orders (date, head count, items). It appears as extras in that day's prep. |
| 5 | At shift end the closing person does a Closing count and leaves a note. The next person opens Since last night and sees what changed. |

**Cold start:** suggestions need about a week of logs. Until then the app shows plain averages and says so.

## 1.4 Must-Have Features and When Each is Done
| Must-have | Done when |
|---|---|
| 1. End-of-day stock and waste log | User can pick a date, enter Made, Left and Wasted for each item, add a new item, save, and reopen that date to see the saved values. |
| 2. Tomorrow's prep suggestion | App shows a suggested quantity per item using the rule in 1.8, the user can change it with plus and minus, party extras are shown separately, and Confirm saves the plan. |
| 3. Closing count with handover note | User enters name, count per stock item and a one-line note, and saves. The next person enters the current counts and sees the difference from last night plus the note. |
| 4. Party order entry | User saves date, head count, items with quantities and advance paid. It shows in an upcoming list and adds to that date's prep as extras. |

## 1.5 Not Building (Do Not Add, Even If Asked Nicely)
Waste value in rupees, Hindi or other languages, login or accounts, WhatsApp summary, item-level sales entry, recipe and training cards, shelf-life reminders, staff attendance, supplier ordering, menu costing, festival or weather signals, token or online ordering, UPI or payments, multi-outlet dashboard, theft detection or CCTV. Charts and settings pages are also out.

## 1.6 Wireframes (Low Fidelity Flow)
- **A. Today (home):** Date header, 4 primary buttons: End-of-day log, Tomorrow's prep, Closing count, Party orders (with count badge).
- **B. End-of-day log:** Date picker (default today), table of items with Made, Left, Wasted inputs, + Add item button, Save button.
- **C. Tomorrow's prep:** Tomorrow's date, 7-day suggestion badge, item rows with (-) and (+) adjustments, Party extras listed separately, Total prep line, Confirm prep list button.
- **D. Closing count:** Person name, stock item counts (Milk L, Paneer kg, Eggs pcs, Bread pcs), + Add item, morning note input, "Since last night >" link, Save and hand over button.
- **D2. Since last night:** Details of last count (timestamp, who counted), inputs for current counts, real-time difference calculation (negative for missing stock, "same" if equal), note display, OK seen button.
- **E. Party order:** Date, head count, dynamic item + quantity rows, advance paid in Rs., Save button, and list of upcoming orders with delete confirmation.

## 1.7 Tech Choice and Data Model
- Plain web app: HTML, CSS, and Vanilla JavaScript. No framework and no build step. Mobile-first, works at 360px width.
- Firebase Firestore (modular JS SDK loaded from official CDN) to save data. Firebase Hosting to publish.
- No login. One shared outlet. Dates use device local date stored as `YYYY-MM-DD` text.
- All database reads and writes live in one file: `js/db.js`.

### Collections and Fields
| Collection | Document ID | Fields |
|---|---|---|
| `items` | auto | `name`, `unit`, `type` ('prep' or 'stock'), `createdAt`. Defaults: prep = Dal kg, Paneer kg, Mixed veg kg, Rice kg; stock = Milk L, Paneer kg, Eggs pcs, Bread pcs. |
| `dayLogs` | the date (`YYYY-MM-DD`) | `date`, `entries`: list of `{itemId, name, unit, made, left, wasted}`, `savedAt` |
| `partyOrders` | auto | `date` (party date), `headCount`, `items`: list of `{name, unit, qty}`, `advancePaid`, `createdAt` |
| `prepPlans` | the date prepped for (`YYYY-MM-DD`) | `forDate`, `lines`: list of `{itemId, name, unit, suggested, adjusted, partyExtra, total}`, `confirmedAt` |
| `closingCounts` | auto | `person`, `date`, `savedAt`, `counts`: list of `{itemId, name, unit, qty}`, `note` |
| `morningChecks` | auto | `checkedBy`, `checkedAt`, `againstCountId`, `differences`: list of `{name, unit, diff}`, `seen` |

## 1.8 The Suggestion Rule (Use Exactly This)
- For each prep item and each day log: $\text{sold} = \text{made} - \text{left} - \text{wasted}$. If it is below 0, use 0.
- Take the most recent day logs (up to 7, by date, not including tomorrow) that contain that item and average their sold values.
- $\text{suggested} = \text{average} \times (1 + \text{BUFFER})$, with $\text{BUFFER} = 0.10$ as one constant, rounded to the nearest 0.5.
- **Notes:**
  - 7 logs or more: note *"Based on last 7 days"*
  - 1 to 6 logs: note *"Based on N day(s) of logs - not enough yet"*
  - 0 logs: start at 0 and say *"No logs yet - enter a quantity yourself"*
- **Party extras:** sum up quantities of all `partyOrders` dated tomorrow per item. Shown on their own line. $\text{total} = \text{adjusted} + \text{extras}$.
- Worked example: Paneer sold over 3 days = 4.0, 4.5, 3.5 kg. Average = 4.0. With 10% buffer = 4.4, rounded to nearest 0.5 = 4.5 kg. Note: *"Based on 3 day(s) of logs - not enough yet"*.

## 1.9 Design Rules
- Large tap targets (at least 48px tall). One screen at a time. One accent colour. Simple English labels.
- Number inputs open the numeric keypad (`inputmode="decimal"` or `"numeric"`). Show a clear 'Saved' message after saving.
- Never show NaN, undefined, or a blank screen. Show a plain empty-state sentence instead.
