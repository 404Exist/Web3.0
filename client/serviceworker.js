const CASH_NAME = 'version-1';
const urlsToCashe = [ 
  './index.html', 
  './images/icon.png',
  './images/logo.png',
  './pwa/icon-192x192.png', 
  './pwa/icon-256x256.png', 
  './pwa/icon-384x384.png',
  './pwa/icon-512x512.png'
];

const self = this;
// install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CASH_NAME)
    .then((cache) => {
        console.log('Opend');
        return cache.addAll(urlsToCashe);
    })
  )
})

// Listen for requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
    .then(() => {
      return fetch(event.request)
      .catch(() => caches.match('index.html'))
    })
  )
})

// Activate the service worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CASH_NAME);
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
    )
})