import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CareInventory AI production Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJJtoq-ANlb_dpp5q4OA-ECky2g050aKs",
  authDomain: "careinventory-app.firebaseapp.com",
  projectId: "careinventory-app",
  storageBucket: "careinventory-app.firebasestorage.app",
  messagingSenderId: "576373930438",
  appId: "1:576373930438:web:b52b116a1a6f791e319ac7",
  measurementId: "G-X99GKWRJZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
