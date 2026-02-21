import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtkwPjBxYz3ncg1u1K4uBoTURyfgf7mCk",
  authDomain: "hotel-ms-web.firebaseapp.com",
  projectId: "hotel-ms-web",
  storageBucket: "hotel-ms-web.firebasestorage.app",
  messagingSenderId: "745082112057",
  appId: "1:745082112057:web:cf940d18c0dd3ef84fa5e8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

