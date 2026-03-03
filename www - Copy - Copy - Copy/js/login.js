import { auth, db } from "./firebase-config.js";

import { signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import { doc, getDoc }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


window.login = async function () {

  const email = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!email || !pass) {
    alert("Please enter your email and password.");
    return;
  }

  try {

    // 🔐 Sign in user
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // 📄 Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      alert("No role assigned to this account.");
      return;
    }

    const data = userDoc.data();
    const role = data.role;
    const name = data.name || "User";

    // Store username for dashboard display
    sessionStorage.setItem("username", name);

    // 🚀 Redirect based on role
    if (role === "admin") {
      window.location.href = "admin.html";
    } 
    else if (role === "teacher") {
      window.location.href = "teacher.html";
    } 
    else if (role === "student") {
      window.location.href = "student.html";
    } 
    else {
      alert("Invalid user role.");
    }

  } 
  catch (err) {

    // 🔎 Handle specific Firebase errors
    if (err.code === "auth/invalid-credential") {
      alert("Incorrect email or password.");
    } 
    else if (err.code === "auth/user-disabled") {
      alert("This account has been disabled.");
    }
    else if (err.code === "auth/too-many-requests") {
      alert("Too many failed attempts. Please try again later.");
    }
    else {
      alert("Login failed. Please try again.");
    }

  }
};


// 👁 Toggle Password Visibility
window.togglePassword = function() {

  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.src = "../assets/icons/openEye.png";
  } 
  else {
    passwordInput.type = "password";
    toggleIcon.src = "../assets/icons/closeEye.png";
  }

};