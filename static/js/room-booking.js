// static/js/room-booking.js

document.addEventListener('DOMContentLoaded', async () => {
    const roomType = document.getElementById('roomType').value;
    const roomContainer = document.getElementById('room-container');
    const summaryElement = document.getElementById('summary');

    let allRoomsData = []; // To store the fetched room data

    // Function to fetch rooms from the backend
    async function fetchRooms() {
        try {
            const response = await fetch(`/api/rooms/${roomType}`);
            const data = await response.json();
            if (data.success) {
                allRoomsData = data.rooms;
                renderRooms();
                updateSummary();
            } else {
                showCustomAlert('Error fetching rooms: ' + data.message);
                console.error('Error fetching rooms:', data.message);
            }
        } catch (error) {
            showCustomAlert('An error occurred while fetching rooms.');
            console.error('Fetch rooms error:', error);
        }
    }

    // Function to create a single room element
    function createRoomElement(room) {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'door-container'; // Use the new container class

        const door = document.createElement('div');
        door.className = 'door';
        door.style.backgroundImage = room.status === 'Booked' ? "url('/static/img/Door_Closed.jpg')" : "url('/static/img/Door_open.jpg')";
        door.dataset.roomId = room.id; // Use Firestore document ID as room ID
        door.dataset.roomNumber = room.room_number;
        door.dataset.status = room.status;

        door.onclick = () => showPopup(room);

        const label = document.createElement('div');
        label.className = 'door-label';
        label.textContent = `Room ${room.room_number} - ${room.status}`;

        roomDiv.appendChild(door);
        roomDiv.appendChild(label);
        return roomDiv;
    }

    // Function to render rooms based on current filter and data
    function renderRooms() {
        roomContainer.innerHTML = ''; // Clear existing rooms
        const filteredRooms = allRoomsData.filter(room => {
            const currentFilter = summaryElement.dataset.filter || 'All';
            return currentFilter === 'All' || room.status === currentFilter;
        });

        // Group rooms into rows (assuming 5 rooms per row for display)
        const roomsPerRow = 5;
        for (let i = 0; i < filteredRooms.length; i += roomsPerRow) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'room-row';
            const rowRooms = filteredRooms.slice(i, i + roomsPerRow);
            rowRooms.forEach(room => {
                rowDiv.appendChild(createRoomElement(room));
            });
            roomContainer.appendChild(rowDiv);
        }
    }

    // Function to update summary (total, booked, available)
    function updateSummary() {
        const totalRooms = allRoomsData.length;
        const bookedRooms = allRoomsData.filter(room => room.status === 'Booked').length;
        const availableRooms = totalRooms - bookedRooms;
        summaryElement.textContent = `Total Rooms: ${totalRooms} | Booked: ${bookedRooms} | Available: ${availableRooms}`;
    }

    // Function to filter rooms (updates dataset for renderRooms to use)
    window.filterRooms = function(type) {
        summaryElement.dataset.filter = type;
        renderRooms();
    };

    // --- Popup Logic ---
    const popup = document.getElementById('customModal'); // Using the general custom modal
    let currentRoomData = null; // Store the full room object

    window.showPopup = async function(room) {
        currentRoomData = room;
        // If the room is booked, show details and credentials
        if (room.status === 'Booked') {
            // Prepare details
            const customer = {
                name: room.customer_name || '',
                contact: room.customer_contact || '',
                cnic: room.customer_cnic || '',
                roomType: room.type,
                roomNumber: room.room_number
            };
            const credentials = (room.customer_email && room.customer_uid) ? {
                email: room.customer_email,
                password: room.customer_password || '(Password not available)'
            } : null;

            // --- Fetch total medical and food bill for this user ---
let totalMedicalBill = 0;
let totalFoodBill = 0;
if (room.customer_uid) {
    try {
        // Use Firebase modular SDK for Firestore
        const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        const db = getFirestore();

        // Medical
        const medRef = collection(db, 'medicalRequests');
        const medQ = query(medRef, where('userId', '==', room.customer_uid));
        const medSnap = await getDocs(medQ);
        medSnap.forEach(doc => {
            const data = doc.data();
            if (data.price) totalMedicalBill += Number(data.price);
        });

        // Food
        const foodRef = collection(db, 'foodRequests');
        const foodQ = query(foodRef, where('userId', '==', room.customer_uid));
        const foodSnap = await getDocs(foodQ);
        foodSnap.forEach(doc => {
            const data = doc.data();
            if (data.totalAmount) {
                totalFoodBill += Number(data.totalAmount);
            } else if (data.price) {
                totalFoodBill += Number(data.price);
            }
        });

    } catch (err) {
        console.error('Error fetching medical/food bill for room:', err);
    }
}
const totalBill = Number(room.price || 0) + totalMedicalBill + totalFoodBill;
// ---
let text = `Room is already booked.\n`;
text += `Customer Name: ${customer.name}\n`;
text += `Contact: ${customer.contact}\n`;
text += `CNIC: ${customer.cnic}\n`;
text += `Room Type: ${customer.roomType}\n`;
text += `Room Number: ${customer.roomNumber}\n`;
text += `Room Price: Rs. ${room.price || 0}\n`;
text += `Medical Services Bill: Rs. ${totalMedicalBill}\n`;
text += `Food Services Bill: Rs. ${totalFoodBill}\n`;
text += `Total Bill (Room + Medical + Food): Rs. ${totalBill}\n`;
            if (credentials) {
                text += `\nLogin Email: ${credentials.email}\n`;
                text += `Password: ${credentials.password}\n`;
            }
            // Show modal with Cancel Booking and Close buttons
            document.getElementById('modalMessage').innerHTML = text.replace(/\n/g, '<br>');
            const modalButtons = document.getElementById('modalButtons');
            modalButtons.innerHTML = '';
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel Booking';
            cancelBtn.onclick = () => showCustomConfirm('cancelBooking', `Cancel booking for Room ${room.room_number}?`);
            modalButtons.appendChild(cancelBtn);
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.onclick = closeCustomModal;
            modalButtons.appendChild(closeBtn);
            popup.style.display = 'flex';
            return;
        }
        document.getElementById('modalMessage').innerHTML = `
            <h3>Room ${room.room_number} Details</h3>
            <p>Status: ${room.status}</p>
            <p>Type: ${room.type.charAt(0).toUpperCase() + room.type.slice(1)} (Rs. ${room.price})</p>
            ${room.booking_time ? `<p>Booked At: ${new Date(room.booking_time._seconds * 1000).toLocaleString()}</p>` : ''}
            <input type="text" id="userName" placeholder="Enter customer name" value="${room.customer_name || ''}">
            <input type="text" id="userContact" placeholder="Enter contact number" value="${room.customer_contact || ''}">
            <input type="text" id="userCnic" placeholder="Enter CNIC number" value="${room.customer_cnic || ''}">
        `;

        const modalButtons = document.getElementById('modalButtons');
        modalButtons.innerHTML = '';

        const bookBtn = document.createElement('button');
        bookBtn.textContent = 'Book Room';
        bookBtn.onclick = bookRoom;
        modalButtons.appendChild(bookBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Booking';
        cancelBtn.onclick = () => showCustomConfirm('cancelBooking', `Cancel booking for Room ${currentRoomData.room_number}?`);
        modalButtons.appendChild(cancelBtn);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.onclick = closeCustomModal;
        modalButtons.appendChild(closeBtn);

        popup.style.display = 'flex'; // Use flex to center
    };

    // Helper to show a summary modal with customer details and credentials (if provided)
    function showBookingSummary({
        title = '',
        customer = {},
        credentials = null,
        message = ''
    }) {
        let text = `${title}\n`;
        if (customer && Object.keys(customer).length > 0) {
            text += `Customer Name: ${customer.name || ''}\n`;
            text += `Contact: ${customer.contact || ''}\n`;
            text += `CNIC: ${customer.cnic || ''}\n`;
            text += `Room Type: ${customer.roomType || ''}\n`;
            text += `Room Number: ${customer.roomNumber || ''}\n`;
        }
        if (credentials) {
            text += `\nLogin Email: ${credentials.email}\n`;
            text += `Password: ${credentials.password}\n`;
            text += `\nShare these credentials with the customer.\n`;
        }
        if (message) {
            text += `\n${message}`;
        }
        // Show both modal and fallback alert
        showCustomAlert(text.replace(/\n/g, '<br>'));
        window.alert(text);
    }

    window.bookRoom = async function() {
        const name = document.getElementById('userName').value.trim();
        const contact = document.getElementById('userContact').value.trim();
        const cnic = document.getElementById('userCnic').value.trim();

        if (!name || !contact || !cnic) {
            showCustomAlert('Please fill all customer details fields.');
            return;
        }

        if (currentRoomData.status === 'Booked') {
            showCustomAlert('This room is already booked.');
            return;
        }

        try {
            const response = await fetch('/api/book_room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: currentRoomData.id,
                    roomType: currentRoomData.type,
                    userName: name,
                    userContact: contact,
                    userCnic: cnic
                })
            });
            const data = await response.json();
            if (data.success) {
                showBookingSummary({
                    title: 'Room Booked Successfully!',
                    customer: {
                        name,
                        contact,
                        cnic,
                        roomType: currentRoomData.type,
                        roomNumber: currentRoomData.room_number
                    },
                    credentials: { email: data.email, password: data.password }
                });
                closeCustomModal();
                fetchRooms(); // Re-fetch to update UI
            } else {
                showCustomAlert('Error booking room: ' + data.message);
                console.error('Booking error:', data.message);
            }
        } catch (error) {
            showCustomAlert('An error occurred while booking the room.');
            console.error('Book room API error:', error);
        }
    };

    window.cancelBooking = async function() {
        try {
            const response = await fetch('/api/cancel_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: currentRoomData.id })
            });
            const data = await response.json();
            if (data.success) {
                showBookingSummary({
                    title: 'Booking Cancelled',
                    customer: {
                        name: currentRoomData.customer_name,
                        contact: currentRoomData.customer_contact,
                        cnic: currentRoomData.customer_cnic,
                        roomType: currentRoomData.type,
                        roomNumber: currentRoomData.room_number
                    },
                    message: 'The booking for this room has been cancelled.'
                });
                closeCustomModal();
                fetchRooms(); // Re-fetch to update UI
            } else {
                showCustomAlert('Error cancelling booking: ' + data.message);
                console.error('Cancel booking error:', data.message);
            }
        } catch (error) {
            showCustomAlert('An error occurred while cancelling the booking.');
            console.error('Cancel booking API error:', error);
        }
    };

    window.resetAllBookings = async function(type) {
        try {
            const response = await fetch(`/api/reset_all_bookings/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                showCustomAlert(data.message);
                fetchRooms(); // Re-fetch to update UI
            } else {
                showCustomAlert('Error resetting bookings: ' + data.message);
                console.error('Reset bookings error:', data.message);
            }
        } catch (error) {
            showCustomAlert('An error occurred while resetting all bookings.');
            console.error('Reset all bookings API error:', error);
        }
    };

    // Initial fetch of rooms when the page loads
    fetchRooms();
});