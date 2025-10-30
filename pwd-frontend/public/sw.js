// public/sw.js
const CACHE_NAME = 'pwd-system-v3'; // Updated cache version
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
        // Use cache.addAll with error handling - it will skip failed items
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Some resources failed to cache during install:', error);
          // Return empty promise to allow install to complete
          return Promise.resolve();
        });
      })
      .catch((error) => {
        console.error('Failed to open cache during install:', error);
        // Allow install to complete even if cache fails
        return Promise.resolve();
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
  
  // For JavaScript and CSS files, always fetch from network first in development
  if (event.request.url.includes('/static/js/') || event.request.url.includes('/static/css/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses (status 200) that are cacheable
          if (response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Handle cache.put errors gracefully
                cache.put(event.request, responseClone).catch((error) => {
                  console.warn('Failed to cache resource:', event.request.url, error);
                });
              })
              .catch((error) => {
                console.warn('Failed to open cache:', error);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For the root path, always fetch from network first (stale-while-revalidate)
  if (event.request.url === self.location.origin + '/' || 
      event.request.url === self.location.origin + '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses (status 200) that are cacheable
          if (response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Handle cache.put errors gracefully
                cache.put(event.request, responseClone).catch((error) => {
                  console.warn('Failed to cache resource:', event.request.url, error);
                });
              })
              .catch((error) => {
                console.warn('Failed to open cache:', error);
              });
          }
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
