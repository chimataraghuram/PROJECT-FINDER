import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚙️ Firebase Configuration with Environment Variables
const firebaseConfig = {
  // These are Firebase's public web-app settings, not private credentials.
  // The fallbacks keep the GitHub Pages build working when local .env files
  // are unavailable in CI. Production/server credentials stay server-only.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAHB9PS8Bdkvf6iIRxPCi6RQlJjZCTkwCY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'techboy-project-finder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'techboy-project-finder',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'techboy-project-finder.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '938915797490',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:938915797490:web:65504bd4acd9413c14f36b'
};

// Initialize Firebase
const requiredFirebaseKeys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'];
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Services
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();


