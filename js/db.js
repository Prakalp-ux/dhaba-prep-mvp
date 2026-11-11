// js/db.js
// Handles all Firestore reads and writes for the Dhaba Prep Assistant MVP
// Modular Firebase SDK loaded via CDN ES modules with resilient local fallback

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

// Default items required by Section 1.7 of the Product Brief
export const DEFAULT_PREP_ITEMS = [
  { name: "Dal", unit: "kg", type: "prep" },
  { name: "Paneer", unit: "kg", type: "prep" },
  { name: "Mixed veg", unit: "kg", type: "prep" },
  { name: "Rice", unit: "kg", type: "prep" }
];

export const DEFAULT_STOCK_ITEMS = [
  { name: "Milk", unit: "L", type: "stock" },
  { name: "Paneer", unit: "kg", type: "stock" },
  { name: "Eggs", unit: "pcs", type: "stock" },
  { name: "Bread", unit: "pcs", type: "stock" }
];

let db = null;
let useLocalFallback = !isFirebaseConfigured();

if (!useLocalFallback) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase Firestore connected successfully.");
  } catch (err) {
    console.warn("Firebase initialization failed, falling back to local storage:", err);
    useLocalFallback = true;
  }
} else {
  console.info("Using local persistent storage. (To use live Firestore, update js/firebase-config.js)");
}

// Local storage helper for resilient offline / pre-config testing
const localStore = {
  get(col) {
    const data = localStorage.getItem(`dhaba_${col}`);
    return data ? JSON.parse(data) : [];
  },
  set(col, items) {
    localStorage.setItem(`dhaba_${col}`, JSON.stringify(items));
  }
};

/**
 * Initialize default prep and stock items if the collection is empty.
 */
export async function initDefaultItems() {
  const currentItems = await getItems();
  if (currentItems.length === 0) {
    const allDefaults = [...DEFAULT_PREP_ITEMS, ...DEFAULT_STOCK_ITEMS];
    for (const item of allDefaults) {
      await addItem(item.name, item.unit, item.type);
    }
    return await getItems();
  }
  return currentItems;
}

/**
 * Fetch all items, optionally filtered by type ('prep' or 'stock').
 */
export async function getItems(type = null) {
  if (useLocalFallback) {
    let items = localStore.get("items");
    if (items.length === 0) {
      // Seed initial defaults locally
      const allDefaults = [...DEFAULT_PREP_ITEMS, ...DEFAULT_STOCK_ITEMS].map((d, idx) => ({
        id: `local_item_${idx + 1}`,
        ...d,
        createdAt: new Date().toISOString()
      }));
      localStore.set("items", allDefaults);
      items = allDefaults;
    }
    return type ? items.filter(it => it.type === type) : items;
  }

  try {
    const itemsCol = collection(db, "items");
    const q = type ? query(itemsCol, where("type", "==", type)) : query(itemsCol);
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
    return list;
  } catch (err) {
    console.error("Error reading items from Firestore:", err);
    return [];
  }
}

/**
 * Add a new item to the items collection.
 */
export async function addItem(name, unit, type = "prep") {
  const itemData = {
    name: name.trim(),
    unit: unit.trim(),
    type,
    createdAt: new Date().toISOString()
  };

  if (useLocalFallback) {
    const items = localStore.get("items");
    const newItem = { id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...itemData };
    items.push(newItem);
    localStore.set("items", items);
    return newItem;
  }

  try {
    const docRef = await addDoc(collection(db, "items"), itemData);
    return { id: docRef.id, ...itemData };
  } catch (err) {
    console.error("Error adding item to Firestore:", err);
    throw err;
  }
}

/**
 * Save day log document for a specific date (YYYY-MM-DD).
 */
export async function saveDayLog(dateStr, entries) {
  const logData = {
    date: dateStr,
    entries,
    savedAt: new Date().toISOString()
  };

  if (useLocalFallback) {
    const dayLogs = localStore.get("dayLogs");
    const idx = dayLogs.findIndex(l => l.date === dateStr);
    if (idx >= 0) {
      dayLogs[idx] = logData;
    } else {
      dayLogs.push(logData);
    }
    localStore.set("dayLogs", dayLogs);
    return logData;
  }

  try {
    const logDocRef = doc(db, "dayLogs", dateStr);
    await setDoc(logDocRef, logData);
    return logData;
  } catch (err) {
    console.error("Error saving dayLog:", err);
    throw err;
  }
}

/**
 * Get day log document for a specific date.
 */
export async function getDayLog(dateStr) {
  if (useLocalFallback) {
    const dayLogs = localStore.get("dayLogs");
    return dayLogs.find(l => l.date === dateStr) || null;
  }

  try {
    const docSnap = await getDoc(doc(db, "dayLogs", dateStr));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    console.error("Error getting dayLog:", err);
    return null;
  }
}

/**
 * Get the most recent day logs up to N days prior to beforeDate (YYYY-MM-DD).
 */
export async function getRecentDayLogs(beforeDateStr, limitCount = 7) {
  if (useLocalFallback) {
    const dayLogs = localStore.get("dayLogs");
    return dayLogs
      .filter(l => l.date < beforeDateStr)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limitCount);
  }

  try {
    const q = query(
      collection(db, "dayLogs"),
      where("date", "<", beforeDateStr),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const logs = [];
    snap.forEach(d => logs.push(d.data()));
    return logs.slice(0, limitCount);
  } catch (err) {
    console.error("Error getting recent dayLogs:", err);
    return [];
  }
}

/**
 * Save a party order.
 */
export async function savePartyOrder(partyOrder) {
  const orderData = {
    date: partyOrder.date,
    headCount: Number(partyOrder.headCount),
    items: partyOrder.items,
    advancePaid: Number(partyOrder.advancePaid) || 0,
    createdAt: new Date().toISOString()
  };

  if (useLocalFallback) {
    const orders = localStore.get("partyOrders");
    const newOrder = { id: `party_${Date.now()}`, ...orderData };
    orders.push(newOrder);
    localStore.set("partyOrders", orders);
    return newOrder;
  }

  try {
    const docRef = await addDoc(collection(db, "partyOrders"), orderData);
    return { id: docRef.id, ...orderData };
  } catch (err) {
    console.error("Error saving partyOrder:", err);
    throw err;
  }
}

/**
 * Get upcoming party orders (on or after todayStr YYYY-MM-DD).
 */
export async function getUpcomingPartyOrders(todayStr) {
  if (useLocalFallback) {
    const orders = localStore.get("partyOrders");
    return orders
      .filter(o => o.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  try {
    const q = query(
      collection(db, "partyOrders"),
      where("date", ">=", todayStr),
      orderBy("date", "asc")
    );
    const snap = await getDocs(q);
    const orders = [];
    snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
    return orders;
  } catch (err) {
    console.error("Error getting upcoming partyOrders:", err);
    return [];
  }
}

/**
 * Delete a party order by id.
 */
export async function deletePartyOrder(orderId) {
  if (useLocalFallback) {
    const orders = localStore.get("partyOrders").filter(o => o.id !== orderId);
    localStore.set("partyOrders", orders);
    return true;
  }

  try {
    await deleteDoc(doc(db, "partyOrders", orderId));
    return true;
  } catch (err) {
    console.error("Error deleting partyOrder:", err);
    throw err;
  }
}

/**
 * Save confirmed prep plan for forDate (YYYY-MM-DD).
 */
export async function savePrepPlan(forDate, lines) {
  const planData = {
    forDate,
    lines,
    confirmedAt: new Date().toISOString()
  };

  if (useLocalFallback) {
    const plans = localStore.get("prepPlans");
    const idx = plans.findIndex(p => p.forDate === forDate);
    if (idx >= 0) plans[idx] = planData;
    else plans.push(planData);
    localStore.set("prepPlans", plans);
    return planData;
  }

  try {
    await setDoc(doc(db, "prepPlans", forDate), planData);
    return planData;
  } catch (err) {
    console.error("Error saving prepPlan:", err);
    throw err;
  }
}

/**
 * Get existing prep plan for a specific date.
 */
export async function getPrepPlan(forDate) {
  if (useLocalFallback) {
    const plans = localStore.get("prepPlans");
    return plans.find(p => p.forDate === forDate) || null;
  }

  try {
    const snap = await getDoc(doc(db, "prepPlans", forDate));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("Error getting prepPlan:", err);
    return null;
  }
}

/**
 * Save shift closing count with handover note.
 */
export async function saveClosingCount(person, dateStr, counts, note) {
  const countData = {
    person: person.trim(),
    date: dateStr,
    savedAt: new Date().toISOString(),
    counts,
    note: (note || "").trim()
  };

  if (useLocalFallback) {
    const list = localStore.get("closingCounts");
    const record = { id: `close_${Date.now()}`, ...countData };
    list.push(record);
    localStore.set("closingCounts", list);
    return record;
  }

  try {
    const docRef = await addDoc(collection(db, "closingCounts"), countData);
    return { id: docRef.id, ...countData };
  } catch (err) {
    console.error("Error saving closingCount:", err);
    throw err;
  }
}

/**
 * Get the most recent closing count.
 */
export async function getLatestClosingCount() {
  if (useLocalFallback) {
    const list = localStore.get("closingCounts");
    if (list.length === 0) return null;
    return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
  }

  try {
    const q = query(
      collection(db, "closingCounts"),
      orderBy("savedAt", "desc")
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const firstDoc = snap.docs[0];
    return { id: firstDoc.id, ...firstDoc.data() };
  } catch (err) {
    console.error("Error getting latest closing count:", err);
    return null;
  }
}

/**
 * Save morning check verification.
 */
export async function saveMorningCheck(checkedBy, againstCountId, differences) {
  const checkData = {
    checkedBy: (checkedBy || "").trim(),
    checkedAt: new Date().toISOString(),
    againstCountId,
    differences,
    seen: true
  };

  if (useLocalFallback) {
    const list = localStore.get("morningChecks");
    const record = { id: `morning_${Date.now()}`, ...checkData };
    list.push(record);
    localStore.set("morningChecks", list);
    return record;
  }

  try {
    const docRef = await addDoc(collection(db, "morningChecks"), checkData);
    return { id: docRef.id, ...checkData };
  } catch (err) {
    console.error("Error saving morning check:", err);
    throw err;
  }
}
