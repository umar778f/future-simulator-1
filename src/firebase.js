// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// 1. ADD THIS: Import Firestore
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFfXc4GM1FxCZ76ymVPPpBYyCGlS2Zc-o",
  authDomain: "future-simulator-1.firebaseapp.com",
  projectId: "future-simulator-1",
  storageBucket: "future-simulator-1.firebasestorage.app",
  messagingSenderId: "53649947906",
  appId: "1:53649947906:web:61ea4163fbe54cf0e1161b",
  measurementId: "G-XZHS73LQBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. ADD THIS: Initialize and export the database so your dashboard can use it!
export const db = getFirestore(app);