// Scripts for firebase messaging service worker
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAKrNbKir1-okoAskDqETuiMtWUll14r4s",
  authDomain: "library-notification-429f4.firebaseapp.com",
  projectId: "library-notification-429f4",
  storageBucket: "library-notification-429f4.firebasestorage.app",
  messagingSenderId: "770386098852",
  appId: "1:770386098852:web:6682075d6a5a11ce80c431",
  measurementId: "G-NF1YXGTZH2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message: ", payload);

  const notificationTitle = payload?.notification?.title || "Library Notification";
  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
