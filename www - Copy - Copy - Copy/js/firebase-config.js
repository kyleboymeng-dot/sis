import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgqpd-qdJ-F0GU_8y3HzP8mNjBTU3569k",
  authDomain: "sis-with-mobile-integration.firebaseapp.com",
  projectId: "sis-with-mobile-integration",
  storageBucket: "sis-with-mobile-integration.firebasestorage.app",
  messagingSenderId: "630418090401",
  appId: "1:630418090401:web:a9b420005fad80b98143e0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };