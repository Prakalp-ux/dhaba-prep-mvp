# Feature Checklist: Dhaba Prep Assistant MVP

This checklist documents the implementation status of all candidate features according to the MoSCoW prioritization defined in Assignment 2 and the MVP Build Pack.

| # | Feature | Priority | Status | Reason & Evidence |
|---|---|---|---|---|
| 1 | **End-of-day stock and waste log** | **Must-have** | **DONE** | Core problem solver for food spoilage. Implemented with date selector, row per item with Made, Left, Wasted inputs, '+ Add item', and persistent saving to Firestore. |
| 2 | **Tomorrow's prep suggestion** | **Must-have** | **DONE** | Directly solves daily over/under-cooking. Implemented with rolling 7-day sales calculation, 10% safety buffer, 0.5 rounding, plus/minus fine-tuning, and separate party extra integration. |
| 3 | **Closing stock count with handover note** | **Must-have** | **DONE** | Prevents night-shift inventory shrinkage and miscommunication. Implemented with stock counts, handover note, and next-shift "Since last night" discrepancy detection. |
| 4 | **Party / advance order entry** | **Must-have** | **DONE** | Eliminates blind cooking for large bulk orders. Implemented with date, head count, dynamic item picker, advance paid, upcoming order list with delete, and automatic addition to tomorrow's prep plan. |
| 5 | Waste value in rupees (daily/weekly) | Should | **CUT** | Non-essential for v1. Requires item-level pricing models and menu costing. Cut to ensure zero math friction for line cooks. |
| 6 | Recipe and training cards for staff | Should | **CUT** | Cooks already know standard dhaba recipes; problem is batch volume, not cooking method. |
| 7 | Shelf-life reminders (> 1 day cooked) | Should | **CUT** | Daily log already tracks leftover spoilage; active timer push notifications are complex and out of scope. |
| 8 | Hindi / regional language interface | Should | **CUT** | Minimal English labels with intuitive icons and large touch targets suffice for initial testing. Regional localization reserved for v2. |
| 9 | Item-level sales POS entry | Should | **CUT** | Daily calculation of $Made - Left - Wasted$ provides an accurate proxy for daily consumption without needing POS hardware. |
| 10 | Weekly summary sent to WhatsApp | Should | **CUT** | Explicitly cut in Section 1.5 of the MVP Build Pack to maintain standalone offline-first web operation. |
| 11 | Staff attendance tracking | Could | **CUT** | Adjacent HR concern; does not solve kitchen batch planning. |
| 12 | Leftover-to-staff meal record | Could | **CUT** | Informal dhaba workaround; logged under leftovers in v1. |
| 13 | Supplier auto-reorder list | Could | **CUT** | Unsolicited feature; inventory counting must be mastered first. |
| 14 | Festival & weather demand signals | Could | **CUT** | Complex statistical model with high error rate; human judgment with $+/-$ steppers is faster and more reliable. |
| 15 | Menu costing and pricing help | Could | **CUT** | Accounting feature; dhaba owners do not need spreadsheet software during prep. |
| 16 | Customer wait-time display | Could | **CUT** | Not a primary concern for target owners. |
| 17 | Token / online ordering | Won't (now) | **CUT** | Completely separate product category requiring payment gateways and customer apps. |
| 18 | UPI / payment integration | Won't (now) | **CUT** | Not required to solve morning prep or shift handovers. |
| 19 | Multi-outlet dashboard | Won't (now) | **CUT** | Target users run independent single-outlet highway dhabas or cafes. |
| 20 | Staff-theft detection / CCTV AI | Won't (now) | **CUT** | Intrusive, costly, and sensitive; shift closing count provides sufficient accountability. |
