const CACHE_NAME = 'graduacion-v1.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './photos.js',
    './img/logo.png',
    './img/logo.ico',
    './img/graduacion.png',
    './img/graduacion-2.png',
    './img/graduacion-3.png',
    './a-star-shines-for-you.mp3',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalar SW
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cachear uno por uno para evitar que uno falle y rompa todo
                return Promise.allSettled(
                    urlsToCache.map(url =>
                        cache.add(url).catch(err => console.log('Failed to cache:', url, err))
                    )
                );
            })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }
                // Si no, ir a la red
                return fetch(event.request);
            })
    );
});

// Actualizar cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});