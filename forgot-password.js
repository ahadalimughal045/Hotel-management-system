import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const forgotForm = document.getElementById("forgotForm");
const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");

forgotForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = forgotForm.forgotEmail.value.trim();
  const newPassword = forgotForm.newPassword.value;
  const confirmPassword = forgotForm.confirmPassword.value;

  forgotError.style.display = "none";
  forgotSuccess.style.display = "none";

  if (newPassword.length < 6) {
    forgotError.textContent = "Password must be at least 6 characters.";
    forgotError.style.display = "block";
    return;
  }
  if (newPassword !== confirmPassword) {
    forgotError.textContent = "Passwords do not match.";
    forgotError.style.display = "block";
    return;
  }

  // Prompt for old password
  const oldPassword = prompt("Enter your current password to confirm identity:");
  if (!oldPassword) {
    forgotError.textContent = "Password change cancelled.";
    forgotError.style.display = "block";
    return;
  }

  try {
    // Sign in with email and old password
    const userCredential = await signInWithEmailAndPassword(auth, email, oldPassword);
    const user = userCredential.user;
    // Update password
    await updatePassword(user, newPassword);
    forgotSuccess.textContent = "Password changed successfully! You can now log in.";
    forgotSuccess.style.display = "block";
    forgotForm.reset();
  } catch (error) {
    forgotError.textContent = error.message;
    forgotError.style.display = "block";
  }
}); 