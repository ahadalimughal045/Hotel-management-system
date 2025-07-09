import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, updatePassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyA7Uyd0k4rVgqRx6jdeSTvXJlNuowSbZx4",
  authDomain: "hotel-admin-807a3.firebaseapp.com",
  projectId: "hotel-admin-807a3",
  storageBucket: "hotel-admin-807a3.firebasestorage.app",
  messagingSenderId: "569594137457",
  appId: "1:569594137457:web:1cdb773e369fccb94784d0",
  measurementId: "G-457WQG4RQK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);