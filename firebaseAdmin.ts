import {
  type App,
  cert,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  // For local development with service_key.json
  if (process.env.NODE_ENV !== 'production') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceKey = require('./service_key.json');
      return serviceKey;
    } catch (error) {
      console.warn('service_key.json not found, using environment variables');
    }
  }

  // For production (Vercel)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      'Firebase Admin configuration is incomplete. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.'
    );
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
}

let app: App;

try {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(getServiceAccount()),
    });
  } else {
    app = getApp();
  }
} catch (error) {
  console.error('Firebase admin initialization error', error);
  throw error;
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
