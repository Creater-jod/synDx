import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App with credentials from firebase-applet-config.json
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase Authentication instance
export const auth = getAuth(app);

// Export Firestore instance
export const db = getFirestore(app);

export default app;
