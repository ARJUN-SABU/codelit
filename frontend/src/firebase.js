// Functions needed from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSgWNNJhL-EaR4OiifdBViyhKacDScuKY",
  authDomain: "code-lit.firebaseapp.com",
  projectId: "code-lit",
  storageBucket: "code-lit.appspot.com",
  messagingSenderId: "1064454702813",
  appId: "1:1064454702813:web:4e2e7f80e8340cf5c97d34",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
export { auth, db };
