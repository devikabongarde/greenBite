// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Removed duplicate getAuth import
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSy...Vwc_aA",
  authDomain: "greenbite-1adf6.firebaseapp.com",
  projectId: "greenbite-1adf6",
  storageBucket: "greenbite-1adf6.appspot.com",
  messagingSenderId: "735907114125",
  appId: "1:735907114125:web:593e7e0274f7d44023c6c4",
  measurementId: "G-2NVWEL1LPF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app); // For authentication
export const db = getFirestore(app); // For Firestore (Database)
export { GoogleAuthProvider, signInWithPopup };
