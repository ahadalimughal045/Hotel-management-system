import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, updatePassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoL_nqVErjMKpI_VY4vwpW-aP7L0OZ-D0",
  authDomain: "hotel-project-ace4f.firebaseapp.com",
  projectId: "hotel-project-ace4f",
  storageBucket: "hotel-project-ace4f.firebasestorage.app",
  messagingSenderId: "312993280496",
  appId: "1:312993280496:web:2ca5ae247de7ffbec0ed35",
  measurementId: "G-ZEHNEJ4ZRY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);