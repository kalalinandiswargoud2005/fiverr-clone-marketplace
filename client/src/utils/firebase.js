// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF-FoYOHfqAJehizDSc3MjorsUGC7SsD8",
  authDomain: "fiverr-2ad28.firebaseapp.com",
  projectId: "fiverr-2ad28",
  storageBucket: "fiverr-2ad28.appspot.com",
  messagingSenderId: "408451010232",
  appId: "1:408451010232:android:2ea042d2b0ec964bb42e4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
window.auth = auth;