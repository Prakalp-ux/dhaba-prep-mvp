# Dhaba Prep Assistant

## One-Line Scope
My MVP lets owners of small independent food businesses (dhabas, cafes, small hotels) do a 3-minute daily log of what they made, what is left and what was wasted, plan tomorrow's prep from it, and count closing stock at shift change, so that they cook closer to real demand and notice missing stock at handover instead of absorbing the loss.

## Target User
The owner or head cook of a small independent dhaba, cafe, or food stall. Operated on mobile phone, with simple language, large tap targets (minimum 48px), and fast daily workflows that take under 3 minutes.

## Core Must-Have Features
1. **End-of-day stock and waste log:** Pick date, enter Made, Left, and Wasted per prep item, add custom items, and view previously saved logs.
2. **Tomorrow's prep suggestion:** Automated prep suggestion calculated using the rolling 7-day average sales plus a 10% safety buffer, with manual plus/minus fine-tuning and party order extras displayed separately.
3. **Closing stock count with handover note:** Shift-end closing count of critical stock items with handover notes, followed by next-shift "Since last night" discrepancy detection.
4. **Party / advance order entry:** Log upcoming catering/party bookings (date, head count, items, advance paid), which automatically feed extra demand into tomorrow's prep plan.

## Tech Stack
- Mobile-first Web App: Plain HTML5, CSS3, Vanilla ES6 JavaScript (No build step, no heavyweight frameworks).
- Database & Storage: Google Firebase Cloud Firestore (Modular JS SDK loaded via CDN).
- Hosting: Firebase Hosting / Vercel.

## Known Limits (Deliberately Excluded for MVP)
- No user accounts or login (one shared device / single outlet).
- No currency waste calculations or item pricing (v1 focuses strictly on physical quantities).
- No recipe ingredient breakdowns, WhatsApp bot integrations, or POS integrations.
- English only for MVP.
