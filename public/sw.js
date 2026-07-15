const CACHE_VERSION = 'v3';
const CACHE_NAME = `ready-apologia-cache-${CACHE_VERSION}`;
const NAV_TIMEOUT_MS = 3000;

const PRE_CACHE_ASSETS = [
  '/',
  '/offline',
  '/topics',
  '/assets/logo.png',
  '/assets/logo_with_text.png',
  '/favicon.svg',
  '/manifest.json'
];

// Install Event: Pre-cache core structural assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[SW] Pre-caching core assets (${CACHE_NAME})...`);
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache failed for ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: Delete obsolete cache buckets
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Purging obsolete cache: ${key}`);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/**
 * Network-First strategy with a strict timeout race.
 * Guarantees fresh HTML for online users while falling back instantly
 * if the network hangs on weak cellular signal.
 */
async function networkFirstWithTimeout(request) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), NAV_TIMEOUT_MS)
  );

  try {
    const networkResponse = await Promise.race([fetch(request), timeoutPromise]);
    if (networkResponse && networkResponse.status === 200) {
      const cacheCopy = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
    }
    return networkResponse;
  } catch (err) {
    console.warn(`[SW] Network-first failed/timed out for ${request.url}, falling back to cache.`, err);
    const cachedResponse = await caches.match(request);
    return cachedResponse || (await caches.match('/offline'));
  }
}

/**
 * Cache-First with background revalidation strategy for static assets (/_astro/*, images, manifest, fonts).
 */
async function cacheFirstWithRevalidate(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
        }
      })
      .catch(() => {});
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cacheCopy = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
    }
    return networkResponse;
  } catch (err) {
    return null;
  }
}

// Fetch Event Gateway
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isNavigation =
    event.request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isNavigation) {
    event.respondWith(networkFirstWithTimeout(event.request));
  } else {
    event.respondWith(cacheFirstWithRevalidate(event.request));
  }
});


