// public/sw.js
const CACHE_NAME = 'pwd-system-v2';
const urlsToCache = [
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip caching for API requests to avoid fetch issues
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // For the root path, always fetch from network first (stale-while-revalidate)
  if (event.request.url === self.location.origin + '/' || 
      event.request.url === self.location.origin + '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline data sync when connection is restored
  console.log('Background sync triggered');
}
