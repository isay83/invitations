const CACHE_VERSION = 'v1.4'; // Incrementa este número para forzar actualizaciones
const CACHE_NAME = `graduacion-cache-${CACHE_VERSION}`;
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './photos.js',
    './manifest.json',
    './mickey.html',  // Nuevo archivo del juego
    './mickey.css',   // Nuevo archivo CSS del juego
    './mickey.js',    // Nuevo archivo JS del juego
    './records.json', // Nuevo archivo JSON para records
    './img/logo.png',
    './img/logo.ico',
    './img/graduacion.png',
    './img/graduacion-2.png',
    './img/graduacion-3.png',
    './img/icon-10.png',  // Icono de Mickey
    './a-star-shines-for-you.mp3',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// URLs que NUNCA deben ser cacheadas
const NEVER_CACHE = [
    'cloudinary.com',
    'upload-widget.cloudinary.com',
    'api',
    'upload'
];

// Instalar SW
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.allSettled(
                    urlsToCache.map(url =>
                        cache.add(url).catch(err => console.log('Failed to cache:', url, err))
                    )
                );
            })
            .then(() => {
                // Forzar activación inmediata del nuevo SW
                return self.skipWaiting();
            })
    );
});

// Interceptar peticiones con estrategia inteligente
self.addEventListener('fetch', event => {
    const requestUrl = event.request.url;

    // No cachear URLs dinámicas o externas críticas
    if (NEVER_CACHE.some(pattern => requestUrl.includes(pattern))) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Para archivos estáticos: Cache First
    if (requestUrl.includes('.css') || requestUrl.includes('.js') ||
        requestUrl.includes('.png') || requestUrl.includes('.jpg') ||
        requestUrl.includes('.ico') || requestUrl.includes('.mp3')) {

        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(fetchResponse => {
                        // Cachear dinámicamente nuevos recursos
                        if (fetchResponse.ok && fetchResponse.status === 200 && !fetchResponse.headers.has('Content-Range')) {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                        }
                        return fetchResponse;
                    });
                })
        );
        return;
    }

    // Para HTML: Network First (siempre contenido fresco)
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Fallback al cache si no hay red
                return caches.match(event.request);
            })
    );
});

// Limpiar caches viejos y tomar control inmediato
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            // Limpiar caches obsoletos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Tomar control de todas las pestañas inmediatamente
            self.clients.claim()
        ])
    );
});

// Comunicación con la página para notificar actualizaciones
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});