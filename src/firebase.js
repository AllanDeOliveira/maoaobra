import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOXqP8I7__A6PSuwK2CrrbP7Ml2fUr_pA",
  authDomain: "maoaobra-51218.firebaseapp.com",
  projectId: "maoaobra-51218",
  storageBucket: "maoaobra-51218.firebasestorage.app",
  messagingSenderId: "658075256499",
  appId: "1:658075256499:web:f4ed19490baae47f1152c6",
  measurementId: "G-QECTXJCJ6M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper for real-time Firebase Syncing
export const syncWithFirebase = (key, initialValue, onUpdate) => {
  const docRef = doc(db, "appData", key);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data().value);
    } else {
      // Initialize if not exists
      setDoc(docRef, { value: initialValue });
      onUpdate(initialValue);
    }
  });
  return unsubscribe;
};

export const saveToFirebase = (key, value) => {
  setDoc(doc(db, "appData", key), { value });
};
