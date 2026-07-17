// A "kill switch" Service Worker to unregister obsolete caches and itself.
// This ensures that previous visitors who already downloaded the PWA immediately get unenrolled 
// from offline caching so they see the fresh live data on their next visit.

self.addEventListener('install', (e) => {
  // Take control immediately
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Delete all existing service worker caches
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW-Kill] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Unregister this service worker
        console.log('[SW-Kill] Unregistering service worker.');
        return self.registration.unregister();
      })
      .then(() => {
        // Claim clients immediately so the old SW is completely evicted
        return self.clients.claim();
      })
  );
});

// Since the fetch listener is removed, it doesn't intercept network requests anymore.
