// ✅ Session check
const teacherName = sessionStorage.getItem("username");
if (!teacherName) {
  window.location.href = "login.html"; // redirect to login if not logged in
}
  const welcomeEl = document.getElementById("welcome");
  const greetingEl = document.getElementById("greeting");
  if (welcomeEl) welcomeEl.textContent = teacherName;
  if (greetingEl) greetingEl.textContent = `Welcome, ${teacherName} 👋`;

// Logout
function logout() {
  if (!confirm('Do you want to logout?')) return;
    sessionStorage.clear();
    window.location.href = "../login.html";
}