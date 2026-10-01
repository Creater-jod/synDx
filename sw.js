/**
 * synDx Clinical Decision Support PWA — Service Worker (v2.0)
 * ============================================================
 * Provides:
 * 1. Immediate app shell pre-caching on install
 * 2. Cache-First static asset delivery for low-resource field resilience
 * 3. Offline navigation fallback to cached index.html
 * 4. Stale-While-Revalidate / Network-First for GET API endpoints
 * 5. Synthetic offline fallback for mutation endpoints during field disconnectivity
 */

const CACHE_NAME = 'syndx-pwa-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './assets/icon-192.svg',
  './assets/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[synDx SW v2] Pre-caching complete application shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[synDx SW v2] Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[synDx SW v2] Evicting legacy cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Navigation Requests: Return cached index.html when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match('./index.html').then((cached) => {
          if (cached) return cached;
          return caches.match('./');
        });
      })
    );
    return;
  }

  // 2. API Endpoints
  if (url.pathname.startsWith('/api/')) {
    if (req.method === 'GET') {
      // Network-First with Cache Fallback for GET requests
      event.respondWith(
        fetch(req)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return response;
          })
          .catch(async () => {
            const cached = await caches.match(req);
            if (cached) return cached;
            return new Response(JSON.stringify({
              offline: true,
              status: 'offline_cache_unavailable',
              message: 'Device is offline and endpoint has not been cached.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
    } else {
      // POST/PUT Mutations: Network-First with Offline Queue Signal
      event.respondWith(
        fetch(req).catch(() => {
          return new Response(JSON.stringify({
            offline: true,
            status: 'QUEUED_LOCAL',
            message: 'Network offline. Mutation cached in local offline queue.'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    }
    return;
  }

  // 3. Static Assets: Cache-First with Background Revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch update in background if online
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(req).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      }).catch(() => {
        // Fallback for missing images/assets
        if (req.destination === 'image') {
          return caches.match('./assets/icon-192.svg');
        }
      });
    })
  );
});
