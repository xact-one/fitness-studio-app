// --- Firebase (CDN / Modular SDK) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

// ✅ NEW: Firestore imports
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

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

// ✅ NEW: Firestore instance
const db = getFirestore(firebaseApp);

// Optional: quick sanity check in console
console.log("Firebase initialized ✅", { projectId: firebaseConfig.projectId });

// --- Elements ---
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loadingScreen = document.getElementById("loadingScreen");
const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const userLine = document.getElementById("userLine");
const toastEl = document.getElementById("toast");

// ✅ NEW: profile line (we’ll add this element in Lesson 16 step 3)
const profileLine = document.getElementById("profileLine");

// --- App State (single source of truth) ---
const state = {
  user: null, // null means "logged out"
  profile: null, // ✅ NEW: Firestore user profile
  toast: "", // one-line status message
  authReady: false, // becomes true after Firebase finishes initial session check
};

// -----------------------------
// Lesson 16 config (simple + explicit)
// -----------------------------

// Put YOUR coach email(s) here (must match Google sign-in email exactly)
const COACH_EMAILS = [
  "marksafer5@gmail.com",
];

// If a non-coach logs in for the first time, we’ll attach them to this coach UID.
// Use the coach UID you created in Lesson 15 (seed data).
const DEFAULT_COACH_UID = "U0s4YV9S4Egxpqprf5AwDw3m4Jf2";

// -----------------------------
// Firestore helpers
// -----------------------------

function usersDocRef(uid) {
  return doc(db, "users", uid);
}

function getRoleForEmail(email) {
  if (!email) return "client";
  const normalized = email.toLowerCase();
  const isCoach = COACH_EMAILS.map((e) => e.toLowerCase()).includes(normalized);
  return isCoach ? "coach" : "client";
}

// Ensures /users/{uid} exists. Creates it if missing.
// Returns the profile data object.
async function ensureUserProfile(authUser) {
  const uid = authUser.uid;
  const ref = usersDocRef(uid);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data();
  }

  // Create profile if missing
  const role = getRoleForEmail(authUser.email);

  const newProfile = {
    uid,
    role, // "coach" | "client"
    displayName: authUser.displayName || "User",
    email: authUser.email || "",
    createdAt: serverTimestamp(),
  };

  // Only clients get assignedCoachId
  if (role === "client") {
    // If you didn’t set DEFAULT_COACH_UID yet, we store empty string.
    // You’ll fix it once, then future users are automatic forever.
    newProfile.assignedCoachId = DEFAULT_COACH_UID || "";
  }

  await setDoc(ref, newProfile, { merge: true });
  return newProfile;
}

// Firebase tells us initial auth state + future changes here.
// IMPORTANT: this removes first-load flicker.
onAuthStateChanged(auth, async (user) => {
  state.user = user
    ? {
        uid: user.uid,
        displayName: user.displayName || "User",
        email: user.email || "",
      }
    : null;

  // ✅ NEW: Firestore profile sync
  state.profile = null;

  try {
    if (user) {
      const profile = await ensureUserProfile(user);
      state.profile = profile;
    }
  } catch (err) {
    console.error("Profile sync failed:", err);
    state.toast = "Could not load profile (Firestore). Check console.";
    setTimeout(() => {
      state.toast = "";
      render();
    }, 3000);
  }

  state.authReady = true;
  render();
});

// --- Render (UI should match state) ---
function render() {
  // Loading phase: we don't yet know if user is signed in
  if (!state.authReady) {
    // Hide nav actions while checking
    loginBtn.hidden = true;
    logoutBtn.hidden = true;

    // Screens
    loadingScreen.hidden = false;
    homeScreen.hidden = true;
    dashboardScreen.hidden = true;

    // Toast
    toastEl.hidden = true;
    toastEl.textContent = "";

    // Clear lines
    userLine.textContent = "";
    if (profileLine) profileLine.textContent = "";
    return;
  }

  const isLoggedIn = !!state.user;

  // Header buttons
  loginBtn.hidden = isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;

  // Screens
  loadingScreen.hidden = true;
  homeScreen.hidden = isLoggedIn;
  dashboardScreen.hidden = !isLoggedIn;

  // Dashboard user line
  if (isLoggedIn) {
    userLine.textContent = `Signed in as ${state.user.displayName} (${state.user.email})`;
  } else {
    userLine.textContent = "";
  }

  // ✅ NEW: Profile line
  if (profileLine) {
    if (!isLoggedIn) {
      profileLine.textContent = "";
    } else if (!state.profile) {
      profileLine.textContent = "Loading profile…";
    } else {
      const role = state.profile.role || "unknown";
      if (role === "client") {
        const coachId = state.profile.assignedCoachId || "(none set)";
        profileLine.textContent = `Role: client • assignedCoachId: ${coachId}`;
      } else {
        profileLine.textContent = `Role: coach`;
      }
    }
  }

  // Toast
  toastEl.hidden = !state.toast;
  toastEl.textContent = state.toast;

  // Nice polish: disable buttons if hidden (avoids focus weirdness)
  loginBtn.disabled = loginBtn.hidden;
  logoutBtn.disabled = logoutBtn.hidden;
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

// First paint: shows the loading screen immediately,
// then onAuthStateChanged will flip authReady to true.
render();


