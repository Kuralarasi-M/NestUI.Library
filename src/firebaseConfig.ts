// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKrNbKir1-okoAskDqETuiMtWUll14r4s",
  authDomain: "library-notification-429f4.firebaseapp.com",
  projectId: "library-notification-429f4",
  storageBucket: "library-notification-429f4.firebasestorage.app",
  messagingSenderId: "770386098852",
  appId: "1:770386098852:web:6682075d6a5a11ce80c431",
  measurementId: "G-NF1YXGTZH2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    if (!messaging) {
      try {
        messaging = getMessaging(app);
      } catch (err) {
        console.warn("[Firebase] Failed to initialize Firebase Messaging:", err);
      }
    }
  }
  return messaging;
}

export { getToken, onMessage };
