// js/app.js
// Main controller for Dhaba Prep Assistant MVP
// Handles screen navigation, date formatting, and End-of-day logging (Must-have 1)

import { 
  initDefaultItems, 
  getItems, 
  addItem, 
  saveDayLog, 
  getDayLog, 
  getUpcomingPartyOrders 
} from "./db.js";

// Screen state management
const screens = {
  today: document.getElementById("screen-today"),
  endOfDay: document.getElementById("screen-end-of-day"),
  prep: document.getElementById("screen-prep"),
  closing: document.getElementById("screen-closing"),
  sinceLastNight: document.getElementById("screen-since-last-night"),
  party: document.getElementById("screen-party")
};

const headerTitle = document.getElementById("header-title");
const headerBackBtn = document.getElementById("header-back-btn");
const todayDateDisplay = document.getElementById("today-date-display");
const navPartyBadge = document.getElementById("nav-party-badge");

// End-of-day screen elements
const eodDateInput = document.getElementById("eod-date");
const eodItemsList = document.getElementById("eod-items-list");
const eodWarning = document.getElementById("eod-warning");
const eodError = document.getElementById("eod-error");
const eodShowAddBtn = document.getElementById("eod-show-add-btn");
const eodAddForm = document.getElementById("eod-add-form");
const newPrepName = document.getElementById("new-prep-name");
const newPrepUnit = document.getElementById("new-prep-unit");
const newPrepSaveBtn = document.getElementById("new-prep-save-btn");
const newPrepCancelBtn = document.getElementById("new-prep-cancel-btn");
const eodSaveBtn = document.getElementById("eod-save-btn");

let cachedPrepItems = [];

/**
 * Format a Date object into human-readable label: "Today - Sat 7 Nov"
 */
export function formatTodayHeader(d = new Date()) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const dateNum = d.getDate();
  return `Today - ${dayName} ${dateNum} ${monthName}`;
}

/**
 * Format a Date object into standard YYYY-MM-DD string
 */
export function toDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Navigate to a specific screen
 */
export function showScreen(screenKey, title = "Today") {
  Object.values(screens).forEach(s => {
    if (s) s.classList.add("hidden");
  });

  if (screens[screenKey]) {
    screens[screenKey].classList.remove("hidden");
  }

  headerTitle.textContent = title;

  if (screenKey === "today") {
    headerBackBtn.classList.add("hidden");
  } else {
    headerBackBtn.classList.remove("hidden");
  }

  window.scrollTo(0, 0);
}

/**
 * Display a short toast notification to the user
 */
export function showToast(message, durationMs = 2500) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, durationMs);
}

/**
 * Update the party order badge count on the Today home screen
 */
export async function refreshPartyCountBadge() {
  try {
    const todayStr = toDateStr(new Date());
    const upcoming = await getUpcomingPartyOrders(todayStr);
    const count = upcoming.length;
    if (navPartyBadge) {
      navPartyBadge.textContent = `${count} upcoming`;
    }
  } catch (err) {
    console.warn("Could not load party orders badge count:", err);
  }
}

// -----------------------------------------------------------------------------
// Task 1: End-of-day Log (Screen B)
// -----------------------------------------------------------------------------

async function loadEodScreen(chosenDateStr = null) {
  const selectedDate = chosenDateStr || eodDateInput.value || toDateStr(new Date());
  eodDateInput.value = selectedDate;

  // Clear previous warnings/errors
  eodWarning.classList.add("hidden");
  eodWarning.textContent = "";
  eodError.classList.add("hidden");
  eodError.textContent = "";

  // 1. Fetch current prep items
  cachedPrepItems = await getItems("prep");

  // 2. Fetch existing day log if one was saved for this date
  const existingLog = await getDayLog(selectedDate);
  const existingEntriesMap = {};
  if (existingLog && existingLog.entries) {
    existingLog.entries.forEach(ent => {
      existingEntriesMap[ent.name.toLowerCase()] = ent;
    });
  }

  // 3. Render each item card
  eodItemsList.innerHTML = "";

  if (cachedPrepItems.length === 0) {
    eodItemsList.innerHTML = `<div class="empty-notice">No prep items found. Tap '+ Add item' below to create one.</div>`;
    return;
  }

  cachedPrepItems.forEach(item => {
    const entry = existingEntriesMap[item.name.toLowerCase()];
    const madeVal = entry !== undefined ? entry.made : "";
    const leftVal = entry !== undefined ? entry.left : "";
    const wastedVal = entry !== undefined ? entry.wasted : "";

    const card = document.createElement("div");
    card.className = "eod-item-card";
    card.dataset.itemId = item.id;
    card.dataset.itemName = item.name;
    card.dataset.itemUnit = item.unit;

    card.innerHTML = `
      <div class="eod-item-header">
        <span class="eod-item-name">${item.name}</span>
        <span class="eod-item-unit">${item.unit}</span>
      </div>
      <div class="eod-inputs-grid">
        <div class="eod-input-col">
          <span>Made</span>
          <input type="number" 
                 step="any" 
                 min="0" 
                 inputmode="decimal" 
                 class="input-made" 
                 placeholder="0" 
                 value="${madeVal}">
        </div>
        <div class="eod-input-col">
          <span>Left</span>
          <input type="number" 
                 step="any" 
                 min="0" 
                 inputmode="decimal" 
                 class="input-left" 
                 placeholder="0" 
                 value="${leftVal}">
        </div>
        <div class="eod-input-col">
          <span>Wasted</span>
          <input type="number" 
                 step="any" 
                 min="0" 
                 inputmode="decimal" 
                 class="input-wasted" 
                 placeholder="0" 
                 value="${wastedVal}">
        </div>
      </div>
      <div class="item-inline-error field-error hidden"></div>
    `;

    // Live validation for left+wasted > made
    const madeInput = card.querySelector(".input-made");
    const leftInput = card.querySelector(".input-left");
    const wastedInput = card.querySelector(".input-wasted");

    const checkItemBalance = () => {
      validateEodInputs(false);
    };

    madeInput.addEventListener("input", checkItemBalance);
    leftInput.addEventListener("input", checkItemBalance);
    wastedInput.addEventListener("input", checkItemBalance);

    eodItemsList.appendChild(card);
  });
}

function validateEodInputs(strictForSave = false) {
  let hasNegative = false;
  let overBalanceWarnings = [];

  const cards = eodItemsList.querySelectorAll(".eod-item-card");
  cards.forEach(card => {
    const name = card.dataset.itemName;
    const inlineErr = card.querySelector(".item-inline-error");
    inlineErr.classList.add("hidden");
    inlineErr.textContent = "";

    const madeVal = parseFloat(card.querySelector(".input-made").value) || 0;
    const leftVal = parseFloat(card.querySelector(".input-left").value) || 0;
    const wastedVal = parseFloat(card.querySelector(".input-wasted").value) || 0;

    const rawMade = card.querySelector(".input-made").value;
    const rawLeft = card.querySelector(".input-left").value;
    const rawWasted = card.querySelector(".input-wasted").value;

    if (parseFloat(rawMade) < 0 || parseFloat(rawLeft) < 0 || parseFloat(rawWasted) < 0) {
      hasNegative = true;
      inlineErr.textContent = "Negative numbers are not allowed.";
      inlineErr.classList.remove("hidden");
    }

    if (leftVal + wastedVal > madeVal && madeVal > 0) {
      overBalanceWarnings.push(`${name} (Left + Wasted exceeds Made)`);
    }
  });

  if (hasNegative) {
    eodError.textContent = "Please correct negative numbers before saving.";
    eodError.classList.remove("hidden");
  } else {
    eodError.classList.add("hidden");
    eodError.textContent = "";
  }

  if (overBalanceWarnings.length > 0) {
    eodWarning.textContent = `Note: Left + Wasted is more than Made for ${overBalanceWarnings.join(", ")}. You can still save if correct.`;
    eodWarning.classList.remove("hidden");
  } else {
    eodWarning.classList.add("hidden");
    eodWarning.textContent = "";
  }

  return !hasNegative;
}

async function handleEodSave() {
  const isValid = validateEodInputs(true);
  if (!isValid) {
    showToast("Fix errors before saving");
    return;
  }

  const dateStr = eodDateInput.value;
  if (!dateStr) {
    showToast("Please pick a valid date");
    return;
  }

  const entries = [];
  const cards = eodItemsList.querySelectorAll(".eod-item-card");

  cards.forEach(card => {
    const itemId = card.dataset.itemId;
    const name = card.dataset.itemName;
    const unit = card.dataset.itemUnit;

    const made = parseFloat(card.querySelector(".input-made").value) || 0;
    const left = parseFloat(card.querySelector(".input-left").value) || 0;
    const wasted = parseFloat(card.querySelector(".input-wasted").value) || 0;

    entries.push({
      itemId,
      name,
      unit,
      made,
      left,
      wasted
    });
  });

  try {
    eodSaveBtn.disabled = true;
    eodSaveBtn.textContent = "Saving...";
    await saveDayLog(dateStr, entries);
    showToast("Saved");
    // Return to Today screen after saving
    setTimeout(() => {
      showScreen("today", "Today");
      refreshPartyCountBadge();
    }, 400);
  } catch (err) {
    console.error("Save log error:", err);
    showToast("Could not save log. Try again.");
  } finally {
    eodSaveBtn.disabled = false;
    eodSaveBtn.textContent = "Save Log";
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation buttons from Home
  document.getElementById("nav-eod")?.addEventListener("click", () => {
    showScreen("endOfDay", "End-of-day log");
    loadEodScreen();
  });

  document.getElementById("nav-prep")?.addEventListener("click", () => {
    showScreen("prep", "Tomorrow's prep");
  });

  document.getElementById("nav-closing")?.addEventListener("click", () => {
    showScreen("closing", "Closing stock count");
  });

  document.getElementById("nav-party")?.addEventListener("click", () => {
    showScreen("party", "Party orders");
  });

  // Global Back button returns to Today
  headerBackBtn?.addEventListener("click", () => {
    showScreen("today", "Today");
    refreshPartyCountBadge();
  });

  // End-of-day screen listeners
  eodDateInput?.addEventListener("change", () => {
    loadEodScreen(eodDateInput.value);
  });

  eodShowAddBtn?.addEventListener("click", () => {
    eodAddForm.classList.remove("hidden");
    eodShowAddBtn.classList.add("hidden");
    newPrepName.focus();
  });

  newPrepCancelBtn?.addEventListener("click", () => {
    eodAddForm.classList.add("hidden");
    eodShowAddBtn.classList.remove("hidden");
    newPrepName.value = "";
  });

  newPrepSaveBtn?.addEventListener("click", async () => {
    const name = newPrepName.value.trim();
    const unit = newPrepUnit.value.trim() || "kg";
    if (!name) {
      alert("Please enter an item name.");
      return;
    }
    try {
      await addItem(name, unit, "prep");
      newPrepName.value = "";
      eodAddForm.classList.add("hidden");
      eodShowAddBtn.classList.remove("hidden");
      await loadEodScreen(eodDateInput.value);
      showToast(`Added ${name}`);
    } catch (err) {
      alert("Error adding item: " + err.message);
    }
  });

  eodSaveBtn?.addEventListener("click", handleEodSave);
}

// App Initialization
async function initApp() {
  // 1. Set Today's date header
  todayDateDisplay.textContent = formatTodayHeader(new Date());

  // 2. Setup navigation and screen listeners
  setupEventListeners();

  // 3. Initialize default items in database if empty
  try {
    await initDefaultItems();
  } catch (err) {
    console.error("Initialization error:", err);
  }

  // 4. Update party badge count
  await refreshPartyCountBadge();
}

// Boot application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
