// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbWYoHPbnCpGtSIqbxjuzxVo4b389-Lm0",
  authDomain: "memi-ec5b4.firebaseapp.com",
  projectId: "memi-ec5b4",
  storageBucket: "memi-ec5b4.firebasestorage.app",
  messagingSenderId: "787206862578",
  appId: "1:787206862578:web:f427f00cd4cd875b34c26b",
  measurementId: "G-BWM8P12NHC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);