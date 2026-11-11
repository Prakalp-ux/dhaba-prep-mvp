# Product Brief: Dhaba Prep MVP

**Product Name:** Dhaba Prep  
**Target User:** Head Cooks (Ustaads), Line Chefs, and Kitchen Managers at Indian Dhabas, Cloud Kitchens, and Highway Restaurants.  
**Platform:** Mobile-first Responsive Web App (No app-store install required, works in mobile Chrome/Safari).

---

## 1. One-Line Scope
A high-contrast, lightning-fast mobile prep checklist that lets dhaba line cooks track batch prep (gravies, chopped bases, marinades, tandoor items) and status in 3 taps, preventing stockouts during peak lunch and dinner rushes.

---

## 2. The Kitchen Problem & User Journey
* **The Problem:** In high-volume Indian dhabas and cloud kitchens, cooks use paper slips or memory to track bulk prep (e.g. 20L Makhani Gravy, 15kg Paneer cubes). Slips get drenched in oil, water, and turmeric. Crucial items run out mid-rush ("Paneer Butter Masala 86'd!"), causing customer delays and lost revenue.
* **The User Journey:**
  1. **Morning Setup (10:00 AM):** The head cook opens `Dhaba Prep` on an inexpensive Android phone or kitchen tablet mounted on the prep counter.
  2. **Reviewing the Shift List:** The cook selects the shift ("Lunch Rush") and views pre-loaded core batch targets grouped by station (Gravies, Veggies, Marinades, Tandoor).
  3. **Updating Status On-the-Go:** As bulk onions are chopped or gravy simmered, the cook taps the item to cycle status: `Pending` 🔴 &rarr; `In Progress` 🟡 &rarr; `Ready` 🟢. An audible kitchen chime confirms completion.
  4. **Urgent Catch-up:** If a private catering or sudden party arrives, the cook taps "+ Quick Item" to log "10L Dal Tadka Base (Urgent)".
  5. **1-Tap Manager Handover:** Before rush starts at 1:00 PM, the cook taps "Share WhatsApp Summary" to dispatch the prep readiness report directly to the dhaba owner with zero typing.

---

## 3. Must-Have Features (Core Scope)
1. **Station-Grouped Daily Prep Checklist:** Pre-populated items across 4 critical stations (Base Gravies, Veggie Prep, Marinades & Dairy, Tandoor & Doughs).
2. **3-State Touch Lifecycle:** Fast single-tap status progression (`Pending` &rarr; `In Progress` &rarr; `Ready`) with instant visual feedback (strike-through, color badge, counter decrement).
3. **Kitchen Rush Progress Banner:** Real-time visibility bar showing `% Prep Completed` and count of remaining pending items.
4. **Quick-Add Urgent Prep Item:** Simple modal to add an ad-hoc prep item with quantity, category, and priority tag.
5. **Direct Quantity Stepper:** Increment / decrement batch quantities (+ / -) directly from the list card.
6. **1-Tap WhatsApp Shift Report:** Generates a structured summary with emoji breakdown for instant sharing to the owner/manager.
7. **Local Persistence (LocalStorage):** Automatic, zero-latency state saving so page reloads or closed browser tabs never wipe data.
8. **Audio Completion Chime:** Web Audio API sound cue to confirm items marked ready without squinting at the screen in a smoky kitchen.

---

## 4. Cut Features (Deliberately Excluded for MVP)
To guarantee a live, working MVP adhering to strict assignment constraints, the following features were explicitly cut:
* ❌ *User Login / Authentication:* Removed to eliminate login friction on shared kitchen devices.
* ❌ *Cloud Database Backend:* LocalStorage was chosen over remote DB to enable instant zero-latency offline performance during spotty highway kitchen Wi-Fi.
* ❌ *Inventory Costing & Recipe Calculator:* Excluded because kitchen staff during prep only need batch units (kg/L/portions), not accounting matrices.
* ❌ *POS Integration:* Cut to keep the tool standalone and universally adoptable in any restaurant setup.

---

## 5. Wireframe Layout & Visual Flow

```text
+-------------------------------------------------------+
|  🍛 DHABA PREP           [ Lunch Rush v ]  [ Reset ] |
|  Highway Express Kitchen                             |
+-------------------------------------------------------+
|  RUSH READINESS: 68% Complete                         |
|  [==========================              ]           |
|  8 Ready  |  3 In-Progress  |  1 Pending              |
+-------------------------------------------------------+
|  Filters: [ All (12) ]  [ Pending (4) ]  [ Ready (8) ]|
|  Categories: [ All ] [Gravies] [Veg] [Dairy] [Tandoor]|
+-------------------------------------------------------+
|  BASE GRAVIES                                         |
|  +-------------------------------------------------+  |
|  | Makhani Gravy Base            [ IN PROGRESS 🟡] |  |
|  | Target: [ - ] 15 L [ + ]      Station: Kadai 1   |  |
|  +-------------------------------------------------+  |
|  | Yellow Dal Tadka Base         [ READY 🟢       ] |  |
|  | Target: [ - ] 20 L [ + ]      Station: Kadai 2   |  |
|  +-------------------------------------------------+  |
|                                                       |
|  VEGGIES & PANEER                                     |
|  +-------------------------------------------------+  |
|  | Paneer Cubes (25mm)           [ PENDING 🔴     ] |  |
|  | Target: [ - ] 10 kg [ + ]     Station: Prep 1    |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
|  [ + Quick Prep Item ]     [ 📤 Send WhatsApp Summary ]|
+-------------------------------------------------------+
```

---

## 6. Tech Choice & Rationale
* **Frontend:** Modern Vanilla HTML5, Vanilla JavaScript (ES6+), and Tailwind CSS (CDN-loaded).
* **Storage:** Browser `localStorage` (Instant load, 100% offline-ready, no API keys or server configuration required).
* **Audio:** Web Audio API (Synthesized tone generator with zero external mp3/wav asset dependencies).
* **Deployment Target:** GitHub Pages / Vercel (Free, instant global CDN hosting, accessible on any smartphone).
