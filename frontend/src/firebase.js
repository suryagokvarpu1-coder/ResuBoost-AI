// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ1AFmK0Go4bBZpV284WXbOb3LDTPtZFw",
  authDomain: "resuboost-ai.firebaseapp.com",
  databaseURL: "https://resuboost-ai-default-rtdb.firebaseio.com",
  projectId: "resuboost-ai",
  storageBucket: "resuboost-ai.firebasestorage.app",
  messagingSenderId: "873701766495",
  appId: "1:873701766495:web:2caaa5ecf6c04849cc32ea",
  measurementId: "G-80KN12SHCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
