// --- Firebase (CDN / Modular SDK) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVhaCM-3gN5LfjmFriW4dUr_FY5lCGjc8",
  authDomain: "fitness-studio-app-011426.firebaseapp.com",
  projectId: "fitness-studio-app-011426",
  storageBucket: "fitness-studio-app-011426.firebasestorage.app",
  messagingSenderId: "414578518778",
  appId: "1:414578518778:web:b58aa8ecf06eb063c2f743",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// Optional: quick sanity check in console
console.log("Firebase initialized ✅", { projectId: firebaseConfig.projectId });

// --- Elements ---
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const userLine = document.getElementById("userLine");
const toastEl = document.getElementById("toast");

// --- App State (single source of truth) ---
const state = {
  user: null, // null means "logged out"
  toast: "", // one-line status message
  // later we'll add: role: "client" | "coach"
};

onAuthStateChanged(auth, (user) => {
  state.user = user
    ? {
        uid: user.uid,
        displayName: user.displayName || "User",
        email: user.email || "",
      }
    : null;

  render();
});

// --- Render (UI should match state) ---
function render() {
  const isLoggedIn = !!state.user;

  // Header buttons
  loginBtn.hidden = isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;

  // Screens
  homeScreen.hidden = isLoggedIn;
  dashboardScreen.hidden = !isLoggedIn;

  // Dashboard user line
  if (isLoggedIn) {
    userLine.textContent = `Signed in as ${state.user.displayName} (${state.user.email})`;
  } else {
    userLine.textContent = "";
  }

  // Toast
  toastEl.hidden = !state.toast;
  toastEl.textContent = state.toast;
}

// --- Auth actions ---
async function login() {
  try {
    await signInWithPopup(auth, provider);
    // state will be set via onAuthStateChanged
  } catch (err) {
    console.error("Login failed:", err);
    alert(err?.message || "Login failed");
  }
}

async function logout() {
  try {
    await signOut(auth);

    // Nice UX: show a quick message
    state.toast = "Signed out.";
    render();

    setTimeout(() => {
      state.toast = "";
      render();
    }, 2000);
  } catch (err) {
    console.error("Logout failed:", err);
    alert(err?.message || "Logout failed");
  }
}

// --- Events ---
loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);

// First paint
render();
