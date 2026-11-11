// js/app.js
// Main controller for Dhaba Prep Assistant MVP
// Complete Implementation: Task 0 (Skeleton), Task 1 (EOD Log), Task 2 (Party Orders), Task 3 (Prep Suggestions), Task 4 (Closing Count & Handover)

import { 
  initDefaultItems, 
  getItems, 
  addItem, 
  saveDayLog, 
  getDayLog, 
  getRecentDayLogs,
  savePartyOrder,
  getUpcomingPartyOrders,
  deletePartyOrder,
  savePrepPlan,
  getPrepPlan,
  saveClosingCount,
  getLatestClosingCount,
  saveMorningCheck
} from "./db.js";

import { calculatePrepSuggestion, roundToHalf } from "./suggestion.js";

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

// Party order screen elements
const partyDateInput = document.getElementById("party-date");
const partyHeadcountInput = document.getElementById("party-headcount");
const partyItemsContainer = document.getElementById("party-items-container");
const partyAddRowBtn = document.getElementById("party-add-row-btn");
const partyAdvanceInput = document.getElementById("party-advance");
const partySaveBtn = document.getElementById("party-save-btn");
const partyUpcomingList = document.getElementById("party-upcoming-list");

// Tomorrow's prep screen elements
const prepDateHeading = document.getElementById("prep-date-heading");
const prepConfirmedBadge = document.getElementById("prep-confirmed-badge");
const prepItemsList = document.getElementById("prep-items-list");
const prepConfirmBtn = document.getElementById("prep-confirm-btn");

// Closing count screen elements
const closingNameInput = document.getElementById("closing-name");
const closingStockItems = document.getElementById("closing-stock-items");
const closingNoteInput = document.getElementById("closing-note");
const closingSaveBtn = document.getElementById("closing-save-btn");
const openSinceLastNightBtn = document.getElementById("open-since-last-night-btn");
const closingShowAddBtn = document.getElementById("closing-show-add-btn");
const closingAddForm = document.getElementById("closing-add-form");
const newStockName = document.getElementById("new-stock-name");
const newStockUnit = document.getElementById("new-stock-unit");
const newStockSaveBtn = document.getElementById("new-stock-save-btn");
const newStockCancelBtn = document.getElementById("new-stock-cancel-btn");

// Since last night screen elements
const sinceLastNightContent = document.getElementById("since-last-night-content");

let cachedPrepItems = [];
let cachedStockItems = [];
let currentPrepState = [];

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
 * Format timestamp into readable string (e.g., "Mon 10:30 pm")
 */
export function formatTimestamp(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[d.getDay()];
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${dayName} ${hours}:${mins} ${ampm}`;
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
    const homePartyLabel = document.getElementById("nav-party-label");
    if (homePartyLabel) {
      homePartyLabel.textContent = `Party orders (${count} upcoming)`;
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

  eodWarning.classList.add("hidden");
  eodWarning.textContent = "";
  eodError.classList.add("hidden");
  eodError.textContent = "";

  cachedPrepItems = await getItems("prep");

  const existingLog = await getDayLog(selectedDate);
  const existingEntriesMap = {};
  if (existingLog && existingLog.entries) {
    existingLog.entries.forEach(ent => {
      existingEntriesMap[ent.name.toLowerCase()] = ent;
    });
  }

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

// -----------------------------------------------------------------------------
// Task 2: Party Orders (Screen E)
// -----------------------------------------------------------------------------

function createPartyItemRow(defaultItem = null) {
  const row = document.createElement("div");
  row.className = "party-item-row";

  let optionsHtml = cachedPrepItems.map(item => {
    const isSelected = defaultItem && defaultItem.name === item.name ? "selected" : "";
    return `<option value="${item.name}" data-unit="${item.unit}" ${isSelected}>${item.name}</option>`;
  }).join("");

  const initialUnit = cachedPrepItems[0] ? cachedPrepItems[0].unit : "kg";

  row.innerHTML = `
    <select class="party-item-select" aria-label="Select Food Item">
      ${optionsHtml}
    </select>
    <input type="number" 
           step="any" 
           min="0.1" 
           inputmode="decimal" 
           class="party-item-qty" 
           placeholder="Qty" 
           value="${defaultItem ? defaultItem.qty : ''}" 
           required>
    <span class="unit-tag">${defaultItem ? defaultItem.unit : initialUnit}</span>
    <button type="button" class="remove-row-btn" title="Remove item">&times;</button>
  `;

  const selectEl = row.querySelector(".party-item-select");
  const unitTag = row.querySelector(".unit-tag");
  selectEl.addEventListener("change", () => {
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    unitTag.textContent = selectedOpt.dataset.unit || "kg";
  });

  const removeBtn = row.querySelector(".remove-row-btn");
  removeBtn.addEventListener("click", () => {
    const totalRows = partyItemsContainer.querySelectorAll(".party-item-row").length;
    if (totalRows > 1) {
      row.remove();
    } else {
      showToast("Order must have at least one item");
    }
  });

  return row;
}

async function loadPartyScreen() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  partyDateInput.value = toDateStr(tomorrow);

  partyHeadcountInput.value = "";
  partyAdvanceInput.value = "";

  cachedPrepItems = await getItems("prep");

  partyItemsContainer.innerHTML = "";
  partyItemsContainer.appendChild(createPartyItemRow());

  await renderUpcomingParties();
}

async function renderUpcomingParties() {
  const todayStr = toDateStr(new Date());
  const orders = await getUpcomingPartyOrders(todayStr);

  partyUpcomingList.innerHTML = "";

  if (orders.length === 0) {
    partyUpcomingList.innerHTML = `<div class="empty-notice">No upcoming party orders recorded.</div>`;
    return;
  }

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "party-card";

    const itemsSummary = (order.items || [])
      .map(it => `<strong>${it.name}:</strong> ${it.qty} ${it.unit}`)
      .join(", ");

    card.innerHTML = `
      <div class="party-card-top">
        <span class="party-card-date">${order.date}</span>
        <span class="party-card-head">${order.headCount} guests</span>
      </div>
      <div class="party-card-items">
        ${itemsSummary || "No items listed"}
      </div>
      <div class="party-card-bottom">
        <span class="party-advance-tag">Advance: Rs. ${Number(order.advancePaid || 0).toLocaleString()}</span>
        <button class="btn-delete-small" data-order-id="${order.id}">Delete</button>
      </div>
    `;

    const delBtn = card.querySelector(".btn-delete-small");
    delBtn.addEventListener("click", async () => {
      if (confirm(`Delete party order for ${order.date} (${order.headCount} guests)?`)) {
        await deletePartyOrder(order.id);
        showToast("Order deleted");
        await renderUpcomingParties();
        await refreshPartyCountBadge();
      }
    });

    partyUpcomingList.appendChild(card);
  });
}

async function handlePartySave() {
  const date = partyDateInput.value;
  const headCount = parseInt(partyHeadcountInput.value, 10);
  const advancePaid = parseFloat(partyAdvanceInput.value) || 0;

  if (!date) {
    alert("Please select a date for the party.");
    return;
  }

  if (!headCount || headCount <= 0) {
    alert("Please enter a valid head count (number of people).");
    return;
  }

  const items = [];
  const rows = partyItemsContainer.querySelectorAll(".party-item-row");
  for (const r of rows) {
    const select = r.querySelector(".party-item-select");
    const qtyInput = r.querySelector(".party-item-qty");
    const name = select.value;
    const unit = select.options[select.selectedIndex]?.dataset.unit || "kg";
    const qty = parseFloat(qtyInput.value);

    if (qty && qty > 0) {
      items.push({ name, unit, qty });
    }
  }

  if (items.length === 0) {
    alert("Please enter a quantity for at least one food item.");
    return;
  }

  try {
    partySaveBtn.disabled = true;
    partySaveBtn.textContent = "Saving...";

    await savePartyOrder({
      date,
      headCount,
      items,
      advancePaid
    });

    showToast("Saved");

    partyHeadcountInput.value = "";
    partyAdvanceInput.value = "";
    partyItemsContainer.innerHTML = "";
    partyItemsContainer.appendChild(createPartyItemRow());

    await renderUpcomingParties();
    await refreshPartyCountBadge();
  } catch (err) {
    console.error("Error saving party order:", err);
    showToast("Error saving order. Try again.");
  } finally {
    partySaveBtn.disabled = false;
    partySaveBtn.textContent = "Save Party Order";
  }
}

// -----------------------------------------------------------------------------
// Task 3: Tomorrow's Prep Suggestion (Screen C)
// -----------------------------------------------------------------------------

async function loadPrepScreen() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateStr(tomorrow);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const headingText = `Prep for ${days[tomorrow.getDay()]} ${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`;
  prepDateHeading.textContent = headingText;

  cachedPrepItems = await getItems("prep");
  const recentLogs = await getRecentDayLogs(tomorrowStr, 7);
  const tomorrowPartyOrders = (await getUpcomingPartyOrders(tomorrowStr)).filter(o => o.date === tomorrowStr);

  const existingPlan = await getPrepPlan(tomorrowStr);
  const existingLinesMap = {};
  if (existingPlan && existingPlan.lines) {
    prepConfirmedBadge.classList.remove("hidden");
    existingPlan.lines.forEach(l => {
      existingLinesMap[l.name.toLowerCase()] = l;
    });
  } else {
    prepConfirmedBadge.classList.add("hidden");
  }

  currentPrepState = [];
  prepItemsList.innerHTML = "";

  if (cachedPrepItems.length === 0) {
    prepItemsList.innerHTML = `<div class="empty-notice">No prep items found. Log items first in End-of-day log.</div>`;
    return;
  }

  cachedPrepItems.forEach(item => {
    const { suggested, logCount, note } = calculatePrepSuggestion(item.name, recentLogs);

    let partyExtra = 0;
    const partyDescriptions = [];
    tomorrowPartyOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(pItem => {
          if (pItem.name.trim().toLowerCase() === item.name.trim().toLowerCase()) {
            const q = parseFloat(pItem.qty) || 0;
            partyExtra += q;
            partyDescriptions.push(`Party (${order.headCount} guests): +${q} ${item.unit}`);
          }
        });
      }
    });

    const existing = existingLinesMap[item.name.toLowerCase()];
    let adjusted = existing !== undefined ? existing.adjusted : suggested;
    adjusted = roundToHalf(adjusted);

    const total = roundToHalf(adjusted + partyExtra);

    const itemState = {
      itemId: item.id,
      name: item.name,
      unit: item.unit,
      suggested,
      adjusted,
      partyExtra,
      total,
      partyDescriptions
    };
    currentPrepState.push(itemState);

    const card = document.createElement("div");
    card.className = "prep-item-card";
    card.dataset.itemName = item.name;

    const partyExtraHtml = partyDescriptions.length > 0 
      ? partyDescriptions.map(desc => `<div class="party-extra-line">${desc}</div>`).join("")
      : "";

    card.innerHTML = `
      <div class="prep-item-top">
        <span class="prep-item-title">${item.name}</span>
        <span class="prep-note-badge">${note}</span>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Base Prep Target</div>
      <div class="prep-stepper-row">
        <button type="button" class="stepper-btn btn-minus" aria-label="Decrease quantity">&minus;</button>
        <div class="prep-qty-display">
          <span class="prep-qty-val adjusted-val">${adjusted}</span>
          <span class="prep-qty-unit">${item.unit}</span>
        </div>
        <button type="button" class="stepper-btn btn-plus" aria-label="Increase quantity">&plus;</button>
      </div>

      ${partyExtraHtml}

      <div class="prep-total-line">
        <span>Total to cook tomorrow:</span>
        <span class="total-val">${total} ${item.unit}</span>
      </div>
    `;

    const minusBtn = card.querySelector(".btn-minus");
    const plusBtn = card.querySelector(".btn-plus");
    const adjustedValEl = card.querySelector(".adjusted-val");
    const totalValEl = card.querySelector(".total-val");

    minusBtn.addEventListener("click", () => {
      if (itemState.adjusted >= 0.5) {
        itemState.adjusted = roundToHalf(itemState.adjusted - 0.5);
        itemState.total = roundToHalf(itemState.adjusted + itemState.partyExtra);
        adjustedValEl.textContent = itemState.adjusted;
        totalValEl.textContent = `${itemState.total} ${item.unit}`;
      }
    });

    plusBtn.addEventListener("click", () => {
      itemState.adjusted = roundToHalf(itemState.adjusted + 0.5);
      itemState.total = roundToHalf(itemState.adjusted + itemState.partyExtra);
      adjustedValEl.textContent = itemState.adjusted;
      totalValEl.textContent = `${itemState.total} ${item.unit}`;
    });

    prepItemsList.appendChild(card);
  });
}

async function handleConfirmPrepList() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateStr(tomorrow);

  if (!currentPrepState || currentPrepState.length === 0) {
    showToast("No items to confirm");
    return;
  }

  const lines = currentPrepState.map(it => ({
    itemId: it.itemId,
    name: it.name,
    unit: it.unit,
    suggested: it.suggested,
    adjusted: it.adjusted,
    partyExtra: it.partyExtra,
    total: it.total
  }));

  try {
    prepConfirmBtn.disabled = true;
    prepConfirmBtn.textContent = "Saving...";
    await savePrepPlan(tomorrowStr, lines);
    showToast("Saved");
    prepConfirmedBadge.classList.remove("hidden");
    setTimeout(() => {
      showScreen("today", "Today");
    }, 400);
  } catch (err) {
    console.error("Error confirming prep plan:", err);
    showToast("Could not confirm plan. Try again.");
  } finally {
    prepConfirmBtn.disabled = false;
    prepConfirmBtn.textContent = "Confirm prep list";
  }
}

// -----------------------------------------------------------------------------
// Task 4: Closing Count & Handover (Screen D) & Since Last Night (Screen D2)
// -----------------------------------------------------------------------------

async function loadClosingScreen() {
  closingNameInput.value = "";
  closingNoteInput.value = "";

  cachedStockItems = await getItems("stock");
  closingStockItems.innerHTML = "";

  if (cachedStockItems.length === 0) {
    closingStockItems.innerHTML = `<div class="empty-notice">No stock items found. Tap '+ Add item' below.</div>`;
    return;
  }

  cachedStockItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "stock-item-row";
    row.dataset.itemId = item.id;
    row.dataset.itemName = item.name;
    row.dataset.itemUnit = item.unit;

    row.innerHTML = `
      <span class="stock-item-name">${item.name}</span>
      <div class="stock-input-wrapper">
        <input type="number" 
               step="any" 
               min="0" 
               inputmode="decimal" 
               class="stock-input-qty" 
               placeholder="0">
        <span class="stock-unit-label">${item.unit}</span>
      </div>
    `;

    closingStockItems.appendChild(row);
  });
}

async function handleSaveClosingCount() {
  const person = closingNameInput.value.trim();
  const note = closingNoteInput.value.trim();
  const todayStr = toDateStr(new Date());

  if (!person) {
    alert("Please enter your name for handover.");
    closingNameInput.focus();
    return;
  }

  const counts = [];
  const rows = closingStockItems.querySelectorAll(".stock-item-row");
  rows.forEach(r => {
    const itemId = r.dataset.itemId;
    const name = r.dataset.itemName;
    const unit = r.dataset.itemUnit;
    const qty = parseFloat(r.querySelector(".stock-input-qty").value) || 0;

    counts.push({ itemId, name, unit, qty });
  });

  try {
    closingSaveBtn.disabled = true;
    closingSaveBtn.textContent = "Saving...";

    await saveClosingCount(person, todayStr, counts, note);
    showToast("Saved");
    setTimeout(() => {
      showScreen("today", "Today");
    }, 400);
  } catch (err) {
    console.error("Error saving closing count:", err);
    showToast("Error saving closing count");
  } finally {
    closingSaveBtn.disabled = false;
    closingSaveBtn.textContent = "Save and hand over";
  }
}

async function loadSinceLastNightScreen() {
  const latestCount = await getLatestClosingCount();

  if (!latestCount) {
    sinceLastNightContent.innerHTML = `
      <div class="empty-notice" style="font-size: 18px; padding-top: 48px;">
        No closing count yet
      </div>
    `;
    return;
  }

  const formattedTime = formatTimestamp(latestCount.savedAt);
  const countPerson = latestCount.person;
  const countNote = latestCount.note ? latestCount.note : "All standard";

  let itemsRowsHtml = (latestCount.counts || []).map((it, idx) => {
    return `
      <div class="diff-row" data-name="${it.name}" data-unit="${it.unit}" data-last-qty="${it.qty}">
        <span class="diff-label">${it.name} (${it.unit})</span>
        <div class="diff-inputs">
          <input type="number" 
                 step="any" 
                 min="0" 
                 inputmode="decimal" 
                 class="current-stock-input" 
                 placeholder="${it.qty}">
          <span class="diff-badge diff-same" id="diff-badge-${idx}">same</span>
        </div>
      </div>
    `;
  }).join("");

  sinceLastNightContent.innerHTML = `
    <div class="handover-card">
      <div class="handover-meta">Last count: ${formattedTime}, ${countPerson}</div>
      <div class="handover-note">Note: ${countPerson} - ${countNote}</div>
    </div>

    <p style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Enter today's count, then:</p>

    <div style="background: white; border-radius: 8px; border: 1.5px solid var(--border-color); margin-bottom: 16px;">
      ${itemsRowsHtml}
    </div>

    <div class="form-group">
      <label for="checker-name">Checked By:</label>
      <input type="text" id="checker-name" placeholder="Your name">
    </div>

    <button type="button" id="morning-seen-btn" class="btn-primary" style="margin-top: 8px;">
      OK, seen
    </button>
  `;

  // Attach live diff listeners
  const diffRows = sinceLastNightContent.querySelectorAll(".diff-row");
  diffRows.forEach((row, idx) => {
    const lastQty = parseFloat(row.dataset.lastQty) || 0;
    const input = row.querySelector(".current-stock-input");
    const badge = row.querySelector(".diff-badge");
    const unit = row.dataset.unit;

    input.addEventListener("input", () => {
      const rawVal = input.value;
      if (rawVal === "") {
        badge.textContent = "same";
        badge.className = "diff-badge diff-same";
        return;
      }
      const curVal = parseFloat(rawVal) || 0;
      const diff = roundToHalf(curVal - lastQty);

      if (diff < 0) {
        badge.textContent = `${diff} ${unit}`;
        badge.className = "diff-badge diff-negative";
      } else if (diff === 0) {
        badge.textContent = "same";
        badge.className = "diff-badge diff-same";
      } else {
        badge.textContent = `+${diff} ${unit}`;
        badge.className = "diff-badge diff-positive";
      }
    });
  });

  // Morning seen button listener
  document.getElementById("morning-seen-btn")?.addEventListener("click", async () => {
    const checker = document.getElementById("checker-name")?.value.trim() || "Staff";
    const differences = [];

    diffRows.forEach(row => {
      const name = row.dataset.name;
      const unit = row.dataset.unit;
      const lastQty = parseFloat(row.dataset.lastQty) || 0;
      const input = row.querySelector(".current-stock-input");
      const curVal = input.value !== "" ? parseFloat(input.value) || 0 : lastQty;
      const diff = roundToHalf(curVal - lastQty);
      differences.push({ name, unit, diff });
    });

    try {
      await saveMorningCheck(checker, latestCount.id, differences);
      showToast("Handover verified");
      setTimeout(() => {
        showScreen("today", "Today");
      }, 400);
    } catch (err) {
      console.error("Error saving morning check:", err);
      showToast("Error saving verification");
    }
  });
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
    loadPrepScreen();
  });

  document.getElementById("nav-closing")?.addEventListener("click", () => {
    showScreen("closing", "Closing stock count");
    loadClosingScreen();
  });

  document.getElementById("nav-party")?.addEventListener("click", () => {
    showScreen("party", "Party orders");
    loadPartyScreen();
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

  // Party order screen listeners
  partyAddRowBtn?.addEventListener("click", () => {
    partyItemsContainer.appendChild(createPartyItemRow());
  });

  partySaveBtn?.addEventListener("click", handlePartySave);

  // Tomorrow's prep confirm listener
  prepConfirmBtn?.addEventListener("click", handleConfirmPrepList);

  // Closing count listeners
  openSinceLastNightBtn?.addEventListener("click", () => {
    showScreen("sinceLastNight", "Since last night");
    loadSinceLastNightScreen();
  });

  closingShowAddBtn?.addEventListener("click", () => {
    closingAddForm.classList.remove("hidden");
    closingShowAddBtn.classList.add("hidden");
    newStockName.focus();
  });

  newStockCancelBtn?.addEventListener("click", () => {
    closingAddForm.classList.add("hidden");
    closingShowAddBtn.classList.remove("hidden");
    newStockName.value = "";
  });

  newStockSaveBtn?.addEventListener("click", async () => {
    const name = newStockName.value.trim();
    const unit = newStockUnit.value.trim() || "kg";
    if (!name) {
      alert("Please enter a stock item name.");
      return;
    }
    try {
      await addItem(name, unit, "stock");
      newStockName.value = "";
      closingAddForm.classList.add("hidden");
      closingShowAddBtn.classList.remove("hidden");
      await loadClosingScreen();
      showToast(`Added ${name}`);
    } catch (err) {
      alert("Error adding item: " + err.message);
    }
  });

  closingSaveBtn?.addEventListener("click", handleSaveClosingCount);
}

// App Initialization
async function initApp() {
  todayDateDisplay.textContent = formatTodayHeader(new Date());
  setupEventListeners();

  try {
    await initDefaultItems();
  } catch (err) {
    console.error("Initialization error:", err);
  }

  await refreshPartyCountBadge();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
