// js/app.js
// Main controller for Dhaba Prep Assistant MVP
// Handles screen navigation, date formatting, and initialization of data models

import { initDefaultItems, getUpcomingPartyOrders } from "./db.js";

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

// Setup Event Listeners
function setupNavigation() {
  // Navigation buttons from Home
  document.getElementById("nav-eod")?.addEventListener("click", () => {
    showScreen("endOfDay", "End-of-day log");
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
}

// App Initialization
async function initApp() {
  // 1. Set Today's date header
  todayDateDisplay.textContent = formatTodayHeader(new Date());

  // 2. Setup navigation click handlers
  setupNavigation();

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
