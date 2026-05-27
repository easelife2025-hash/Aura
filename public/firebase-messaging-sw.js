// This is the background worker that listens for notifications!
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 🎈 STEP 4: Replace this with your actual firebaseConfig from firebase-applet-config.json
const firebaseConfig = {
  projectId: "red-aura-ncf5x",
  appId: "1:213623640947:web:c9dc64e739ceb4831b6b06",
  apiKey: "AIzaSyAVyx4OX3AZMNnPnqrPl07fnqSwLbN3q_M",
  authDomain: "red-aura-ncf5x.firebaseapp.com",
  storageBucket: "red-aura-ncf5x.firebasestorage.app",
  messagingSenderId: "213623640947"
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
