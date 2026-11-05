const CACHE_VERSION = 'ti-pro-v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './src/css/main.css',
  './src/css/variables.css',
  './src/css/reset.css',
  './src/css/layout.css',
  './src/css/components.css',
  './src/css/animations.css',
  './src/css/responsive.css',
  './src/js/app.js',
  './src/js/core/config.js',
  './src/js/core/router.js',
  './src/js/core/navigation.js',
  './src/js/core/state.js',
  './src/js/core/event-bus.js',
  './src/js/core/error-handler.js',
  './src/js/core/app-lifecycle.js',
  './src/js/utils/dom.js',
  './src/js/utils/format.js',
  './src/js/utils/storage.js'
  './src/js/services/database/schema.js',
'./src/js/services/database/db.js',
'./src/js/services/database/index.js',
'./src/js/services/database/seed.js',
'./src/js/services/database/repositories/outlet-repository.js',
'./src/js/services/database/repositories/salesman-repository.js',
'./src/js/services/database/repositories/territory-repository.js',
'./src/js/services/gis/leaflet-loader.js',
'./src/js/services/gis/map-instance.js',
'./src/js/modules/data-import/parser.js',
'./src/js/modules/data-import/index.js',
'./src/js/views/data-import/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // don't cache cross-origin (Leaflet tiles, APIs)

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});