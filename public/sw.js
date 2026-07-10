const CACHE_NAME = 'ready-apologia-cache-v2';

// Pre-cache home, styling, and basic navigator structure on install
const PRE_CACHE_ASSETS = [
  '/',
  '/offline',
  '/bible/jn/1',
  '/bible/jn/1/1',
  '/bible/jn/1/1/manuscripts',
  '/bible/gn/1',
  '/bible/gn/1/1',
  '/bible/gn/1/1/manuscripts',
  '/bible/mk/16',
  '/bible/mk/16/9',
  '/bible/mk/16/9/manuscripts',
  '/assets/logo.png',
  '/assets/logo_with_text.png',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pre-caching core assets...');
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Skip pre-cache for ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if version changes
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old PWA Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-First with Network-Fallback Strategy (ideal for fast, offline static sites)
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache instantly, but fetch in background to update cache if online (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Ignore background fetch errors if completely offline
        });
        return cachedResponse;
      }

      // Fallback to network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache the new visited page dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Completely offline and asset not in cache: fallback to offline page if HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline'); // Branded offline fallback page
        }
      });
    })
  );
});
