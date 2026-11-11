// js/firebase-config.js
// Firebase Web App Configuration
// Replace the placeholder values below with your Firebase project credentials from console.firebase.google.com

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dhaba-prep-mvp.firebaseapp.com",
  projectId: "dhaba-prep-mvp",
  storageBucket: "dhaba-prep-mvp.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Helper to detect if user has pasted real Firebase credentials
export function isFirebaseConfigured() {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && !firebaseConfig.apiKey.includes("YOUR_");
}
