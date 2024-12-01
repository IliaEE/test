import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  throw error;
}
export { auth };

// Initialize Analytics conditionally
let analytics = null;
isSupported()
  .then(yes => yes ? getAnalytics(app) : null)
  .then(analyticsInstance => {
    analytics = analyticsInstance;
  })
  .catch(error => {
    console.error('Error initializing Firebase Analytics:', error);
  });

export { analytics };
export default app;
