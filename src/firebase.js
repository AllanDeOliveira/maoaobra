// src/firebase.js — Configuração inicial do Firebase e instâncias de Auth, Firestore e Storage
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCOXqP8I7__A6PSuwK2CrrbP7Ml2fUr_pA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maoaobra-51218.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maoaobra-51218",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maoaobra-51218.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "658075256499",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:658075256499:web:f4ed19490baae47f1152c6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QECTXJCJ6M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
