// Service Worker for caching static assets
const CACHE_NAME = 'social-media-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/notification.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests and handle specific resources
  if (event.request.method !== 'GET') return;
  
  // CRITICAL: Skip service worker for API requests
  // This prevents mobile browsers from interfering with backend connections
  if (event.request.url.includes('/api/')) {
    return; // Let the request pass through normally
  }
  
  // Skip service worker for socket.io connections
  if (event.request.url.includes('socket.io')) {
    return; // Let socket connections pass through normally
  }
  
  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Cache images from Cloudinary
  if (event.request.url.includes('cloudinary.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
