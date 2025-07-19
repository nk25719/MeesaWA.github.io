const CACHE_NAME = 'meesa-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/splash.png',
  '/firebase-messaging-sw.js',
  'https://unpkg.com/mqtt/dist/mqtt.min.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
  console.log('✅ Service Worker Installed & Cached');
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
  console.log('✅ Service Worker Activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      return cachedRes || fetch(event.request);
    })
  );
});
