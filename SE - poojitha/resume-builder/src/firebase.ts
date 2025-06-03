// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQZ0ckBhbgNZGk83md0-ElntPWZVLKRZQ",
  authDomain: "resume-gene.firebaseapp.com",
  projectId: "resume-gene",
  storageBucket: "resume-gene.firebasestorage.app",
  messagingSenderId: "961246074864",
  appId: "1:961246074864:web:999bf28208aed6b6bc6f35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
