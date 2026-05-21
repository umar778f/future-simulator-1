// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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