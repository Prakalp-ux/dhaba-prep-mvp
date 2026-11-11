// js/suggestion.js
// Tomorrow's Prep Suggestion Engine for Dhaba Prep Assistant
// Implements the exact formula from Section 1.8 of the Product Brief

export const BUFFER = 0.10; // 10% safety buffer constant

/**
 * Round a number to the nearest 0.5 (e.g., 4.2 -> 4.0, 4.4 -> 4.5, 4.8 -> 5.0)
 */
export function roundToHalf(num) {
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 2) / 2;
}

/**
 * Calculate prep suggestion for a specific item based on up to 7 most recent day logs.
 * 
 * @param {string} itemName - Name of prep item (e.g. "Dal", "Paneer")
 * @param {Array} recentDayLogs - List of dayLog objects sorted by date descending (up to 7 days)
 * @returns {Object} { suggested: number, logCount: number, note: string }
 */
export function calculatePrepSuggestion(itemName, recentDayLogs = []) {
  if (!recentDayLogs || recentDayLogs.length === 0) {
    return {
      suggested: 0,
      logCount: 0,
      note: "No logs yet - enter a quantity yourself"
    };
  }

  const targetName = itemName.trim().toLowerCase();
  const soldValues = [];

  for (const log of recentDayLogs) {
    if (!log.entries || !Array.isArray(log.entries)) continue;
    const entry = log.entries.find(e => e.name.trim().toLowerCase() === targetName);
    if (entry) {
      const made = parseFloat(entry.made) || 0;
      const left = parseFloat(entry.left) || 0;
      const wasted = parseFloat(entry.wasted) || 0;
      // Formula: sold = made - left - wasted; if below 0, use 0
      let sold = made - left - wasted;
      if (sold < 0) sold = 0;
      soldValues.push(sold);
    }
  }

  const N = soldValues.length;

  if (N === 0) {
    return {
      suggested: 0,
      logCount: 0,
      note: "No logs yet - enter a quantity yourself"
    };
  }

  // Calculate average sold
  const sumSold = soldValues.reduce((acc, val) => acc + val, 0);
  const average = sumSold / N;

  // Apply 10% safety buffer and round to nearest 0.5
  const withBuffer = average * (1 + BUFFER);
  const suggested = roundToHalf(withBuffer);

  let note = "";
  if (N >= 7) {
    note = "Based on last 7 days";
  } else {
    note = `Based on ${N} day(s) of logs - not enough yet`;
  }

  return {
    suggested,
    logCount: N,
    note
  };
}
