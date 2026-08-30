import admin from 'firebase-admin';

let app = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    app = admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
} catch (error) { console.error('Firebase Admin initialization failed:', error.message); }

export const firebaseAuth = app ? admin.auth() : null;
