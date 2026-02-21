// static/js/modal.js

// Global variables for modal state
let currentActionCallback = null;
let currentActionArgs = null;

/**
 * Displays a custom alert modal.
 * @param {string} message The message to display.
 */
function showCustomAlert(message) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalButtons = document.getElementById('modalButtons');

    modalMessage.innerHTML = message;
    modalButtons.innerHTML = ''; // Clear previous buttons

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.onclick = closeCustomModal;
    modalButtons.appendChild(okButton);

    modal.style.display = 'flex'; // Use flex to center the modal
}

/**
 * Displays a custom confirmation modal.
 * @param {string} actionName The name of the function to call if confirmed.
 * @param {string} message The confirmation message.
 * @param {any} args Optional arguments to pass to the action function.
 */
function showCustomConfirm(actionName, message, args = null) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalButtons = document.getElementById('modalButtons');

    modalMessage.textContent = message;
    modalButtons.innerHTML = ''; // Clear previous buttons

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
        closeCustomModal();
        // Call the specified action function
        if (typeof window[actionName] === 'function') {
            window[actionName](args);
        } else {
            console.error(`Function '${actionName}' not found.`);
        }
    };
    modalButtons.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeCustomModal;
    modalButtons.appendChild(cancelButton);

    modal.style.display = 'flex';
}

/**
 * Displays a custom prompt modal.
 * @param {string} message The prompt message.
 * @param {function} callback The callback function to execute with the input value.
 */
function showCustomPrompt(message, callback) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalButtons = document.getElementById('modalButtons');

    modalMessage.innerHTML = `<p>${message}</p><input type="password" id="promptInput" placeholder="Enter value">`;
    modalButtons.innerHTML = '';

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.onclick = () => {
        const inputValue = document.getElementById('promptInput').value;
        closeCustomModal();
        if (callback) {
            callback(inputValue);
        }
    };
    modalButtons.appendChild(okButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        closeCustomModal();
        if (callback) {
            callback(null); // Indicate cancellation
        }
    };
    modalButtons.appendChild(cancelButton);

    modal.style.display = 'flex';
}

/**
 * Closes the custom modal.
 */
function closeCustomModal() {
    document.getElementById('customModal').style.display = 'none';

    // Clear any room-specific inputs if they were part of the modal content
    const userNameInput = document.getElementById('userName');
    const userContactInput = document.getElementById('userContact');
    const userCnicInput = document.getElementById('userCnic');

    if (userNameInput) userNameInput.value = '';
    if (userContactInput) userContactInput.value = '';
    if (userCnicInput) userCnicInput.value = '';
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('customModal');
    if (event.target === modal) {
        closeCustomModal();
    }
};
