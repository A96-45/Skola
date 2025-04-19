
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration with real credentials
const firebaseConfig = {
  apiKey: "AIzaSyDoH9rNV4YtbJcpnpJYAn7LhE-H97YfwzA", // This is a public API key, so it's safe to include
  authDomain: "skola-93f33.firebaseapp.com",
  projectId: "skola-93f33",
  storageBucket: "skola-93f33.appspot.com",
  messagingSenderId: "111997586148620126786",
  appId: "1:111997586148620126786:web:2b800bacc66eb5027992113",
  clientEmail: "firebase-adminsdk-fbsvc@skola-93f33.iam.gserviceaccount.com"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
export default firebaseConfig;
