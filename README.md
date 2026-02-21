# 🏨 THE AURAZ HOTEL - Management System

A cloud-powered Hotel Management System built with **Python (Flask)** and **Firebase**. This system provides a seamless experience for both hotel administrators and guests, featuring real-time notifications and automated billing.

## ✨ Features

### 👨‍💼 Admin Dashboard
- **Room Management:** Monitor and manage Premium, Semi-Premium, and Economy rooms.
- **Real-time Notifications:** Receive instant alerts for guest requests (Food, Medical, Room Service).
- **Booking System:** Book rooms for guests and automatically generate login credentials for them.
- **Live Monitoring:** Track room statuses (Available/Booked) directly from the dashboard.

### 👤 Guest Dashboard
- **Personal Profile:** View active booking details, including room type and check-in time.
- **Smart Services:**
  - **🍽️ Food Order:** Full menu with automated billing.
  - **🩺 Medical Assistance:** Request a doctor, order medicines, or call for emergencies.
  - **🧹 Room Service:** Request cleaning, extra pillows, or towels.
- **Automated Bills:** View a live breakdown of total charges (Room + Food + Medical services).

## 🚀 Tech Stack
- **Backend:** Python (Flask)
- **Database:** Firebase Firestore (Real-time database)
- **Authentication:** Firebase Auth
- **Frontend:** HTML5, CSS3 (Vanilla & Tailwind), JavaScript (Modular Firebase SDK)

## 🛠️ Installation & Setup

1. **Clone the project:**
   ```bash
   git clone https://github.com/ahadalimughal045/Hotel-management-system.git
   cd Hotel-management-system
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Firebase Configuration:**
   - Place your `serviceAccountKey.json` (from Firebase Console) in the root directory.
   - Update `firebaseConfig` in `static/js/firebase-config.js` with your Web App credentials.

4. **Run the Application:**
   ```bash
   python app.py
   ```

5. **Initial Database Setup:**
   - After running the server, visit: `http://127.0.0.1:5000/setup_initial_rooms`
   - This will automatically populate your database with 50 rooms.

## 🔒 Security Note
- The `.gitignore` file ensures that sensitive files like `serviceAccountKey.json` and environmental variables are not pushed to public repositories.

---
Developed by **Ali Mughal** 🚀
