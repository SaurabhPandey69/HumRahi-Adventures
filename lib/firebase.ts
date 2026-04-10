import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ✅ Correct Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD4GTZi4uMWpTbJiCIjqWjXV1pz8deESZk",
  authDomain: "paragliding-613d2.firebaseapp.com",
  projectId: "paragliding-613d2",
  storageBucket: "paragliding-613d2.appspot.com", // ✅ FIXED
  messagingSenderId: "679836675651",
  appId: "1:679836675651:web:e7c587782fd7a54a14aef6",
};

// ✅ Prevent multiple app initialization (Next.js fix)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export auth properly
export const auth = getAuth(app);

// Optional
auth.useDeviceLanguage();


