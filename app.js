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
