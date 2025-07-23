// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCg6xi0_Kx7uX6Nc4t6B-4nwukCgo5LT4k",
  authDomain: "meesa-6cc00.firebaseapp.com",
  projectId: "meesa-6cc00",
  storageBucket: "meesa-6cc00.appspot.com",
  messagingSenderId: "648709826389",
  appId: "1:648709826389:web:3ff56515d746cabcccb1dc"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
