import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// If API Key is missing, alert the user explicitly.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_FIREBASE')) {
  throw new Error(
    "🔥 Firebase configuration is missing! 🔥\n" +
    "Please make sure your VITE_FIREBASE_* environment variables are added to Vercel Settings and that you triggered a *Redeploy* without Build Cache."
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);

const storage = getStorage(app);

export { app, auth, db, storage, analyticsPromise };
