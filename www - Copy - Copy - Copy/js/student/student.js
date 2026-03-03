import { db } from "../firebase-config.js";

import { 
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

