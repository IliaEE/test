import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPzfdNpVIHkqXjZJ9gAberrXzLiL-EwZ8",
  authDomain: "hrly-ea15c.firebaseapp.com",
  projectId: "hrly-ea15c",
  storageBucket: "hrly-ea15c.firebasestorage.app",
  messagingSenderId: "422496852476",
  appId: "1:422496852476:web:8d64f0254bb68ce3523a79",
  measurementId: "G-CBM681MPGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db };
export default app;
