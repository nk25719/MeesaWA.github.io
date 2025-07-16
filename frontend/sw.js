self.addEventListener('install', e => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

client = mqtt.connect("wss://241024dacc644661b296a5b1b68f1390.s1.eu.hivemq.cloud:8884/mqtt", {
  username: "Meesa",
  password: "MeesaPassword42"
});
