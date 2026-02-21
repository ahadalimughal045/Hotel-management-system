// Hotel Admin/script.js
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const forgotBtn = document.getElementById("forgotPasswordBtn");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    loginError.textContent = error.message;
    loginError.style.display = "block";
  }
});

forgotBtn.addEventListener("click", function () {
  window.location.href = "forgot-password.html";
});