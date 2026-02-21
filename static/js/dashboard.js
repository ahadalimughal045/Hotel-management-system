// static/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const roomCards = document.querySelectorAll(".room-card");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function () {
            try {
                const response = await fetch('/logout', {
                    method: 'GET', // Or POST, depending on your Flask route
                });
                if (response.ok) {
                    window.location.href = "/"; // Redirect to login page
                } else {
                    console.error('Logout failed.');
                    // Optionally show an error message on the dashboard
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }

    // Add click listeners to room cards
    roomCards.forEach(card => {
        card.addEventListener('click', function() {
            const roomType = this.dataset.roomType;
            if (roomType) {
                window.location.href = `/${roomType}.html`; // Redirect to the specific room page
            }
        });
    });
});