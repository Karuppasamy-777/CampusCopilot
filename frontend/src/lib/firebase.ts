import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const isConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// developer-friendly guard check for runtime browser context
if (!isConfigured && typeof window !== "undefined") {
  throw new Error(
    "Firebase is not configured.\nPlease create a .env.local file using the values from your Firebase project."
  );
}

// During build-time server-side generation, env variables might not be loaded.
// To avoid Firebase SDK throwing configuration errors during SSR page generation,
// we fall back to mock values ONLY when running on the server.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (typeof window === "undefined" ? "mock-api-key" : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (typeof window === "undefined" ? "mock-auth-domain.firebaseapp.com" : ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (typeof window === "undefined" ? "mock-project-id" : ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (typeof window === "undefined" ? "mock-storage-bucket.appspot.com" : ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (typeof window === "undefined" ? "000000000000" : ""),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (typeof window === "undefined" ? "1:000000000000:web:0000000000000000000000" : ""),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
