// static/js/forgot-password.js

document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById("forgotForm");
    const forgotError = document.getElementById("forgotError");
    const forgotSuccess = document.getElementById("forgotSuccess");

    if (forgotForm) {
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

            // Use custom modal for old password prompt
            // Ensure modal.js is loaded before this script for showCustomPrompt to be available
            if (typeof showCustomPrompt === 'function') {
                showCustomPrompt('Enter your current password to confirm identity:', async (oldPassword) => {
                    if (oldPassword === null || oldPassword === "") { // User cancelled or entered nothing
                        forgotError.textContent = "Password change cancelled.";
                        forgotError.style.display = "block";
                        return;
                    }

                    try {
                        // Send data to Flask backend for password reset
                        const response = await fetch('/reset-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                email: email,
                                newPassword: newPassword,
                                oldPassword: oldPassword // Sent for server-side verification (if implemented)
                            })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            forgotSuccess.textContent = data.message;
                            forgotSuccess.style.display = "block";
                            forgotForm.reset();
                        } else {
                            forgotError.textContent = data.message || 'Password reset failed.';
                            forgotError.style.display = "block";
                        }
                    } catch (error) {
                        console.error('Error during password reset:', error);
                        forgotError.textContent = 'An unexpected error occurred. Please try again.';
                        forgotError.style.display = "block";
                    }
                });
            } else {
                console.error("showCustomPrompt function not found. Ensure modal.js is loaded.");
                forgotError.textContent = "An internal error occurred. Please try again later.";
                forgotError.style.display = "block";
            }
        });
    }
});