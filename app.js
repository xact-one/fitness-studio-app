// --- Firebase (CDN / Modular SDK) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

// TODO: paste YOUR config here (from Firebase Console → Project settings → Your apps)
const firebaseConfig = {
  apiKey: "AIzaSyBVhaCM-3gN5LfjmFriW4dUr_FY5lCGjc8",
  authDomain: "fitness-studio-app-011426.firebaseapp.com",
  projectId: "fitness-studio-app-011426",
  storageBucket: "fitness-studio-app-011426.firebasestorage.app",
  messagingSenderId: "414578518778",
  appId: "1:414578518778:web:b58aa8ecf06eb063c2f743"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Optional: quick sanity check in console
console.log("Firebase initialized ✅", { projectId: firebaseConfig.projectId });

// --- Elements ---
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

// --- App State (single source of truth) ---
const state = {
  user: null, // null means "logged out"
  // later we'll add: role: "client" | "coach"
};

// --- Render (UI should match state) ---
function render() {
  const isLoggedIn = !!state.user;

  // Header buttons
  loginBtn.hidden = isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;

  // Screens
  homeScreen.hidden = isLoggedIn;
  dashboardScreen.hidden = !isLoggedIn;
}

// --- Fake auth actions (for now) ---
function fakeLogin() {
  state.user = {
    uid: "demo-uid-123",
    displayName: "Demo User",
  };
  render();
}

function fakeLogout() {
  state.user = null;
  render();
}

// --- Events ---
loginBtn.addEventListener("click", fakeLogin);
logoutBtn.addEventListener("click", fakeLogout);

// First paint
render();
