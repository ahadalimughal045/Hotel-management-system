// static/js/login.js

// Firebase SDK version 10.12.2 par update karein
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from './firebase-config.js'; // firebase-config.js se app import karein

const auth = getAuth(app); // app instance ka use karke auth initialize karein

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const forgotBtn = document.getElementById("forgotPasswordBtn");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            loginError.style.display = "none"; // Hide previous errors

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const idToken = await user.getIdToken();

                // Send token to backend for verification and redirection
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken })
                });

                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    document.getElementById('loginError').textContent = data.message || "Unauthorized access.";
                    loginError.style.display = "block";
                }
            } catch (error) {
                console.error("Login error:", error);
                document.getElementById('loginError').textContent = "Invalid email or password.";
                loginError.style.display = "block";
            }
        });
    }

    if (forgotBtn) {
        forgotBtn.addEventListener("click", function () {
            window.location.href = "/forgot-password";
        });
    }
});
