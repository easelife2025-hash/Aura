// This is the background worker that listens for notifications!
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 🎈 STEP 4: Replace this with your actual firebaseConfig from firebase-applet-config.json
const firebaseConfig = {
  projectId: "aura-84170",
  appId: "1:441749708484:web:0e5c1999e1747b90acf391",
  apiKey: "AIzaSyBgrCccmCYUXyXvbFhaF5NocfnuWC_LCa4",
  authDomain: "aura-84170.firebaseapp.com",
  storageBucket: "aura-84170.firebasestorage.app",
  messagingSenderId: "441749708484"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon.png'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch(e) {
  console.log("Waiting for firebase config...", e);
}
