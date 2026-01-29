// FlameMatch Service Worker v1.0
const CACHE_NAME = 'flamematch-v22';
const STATIC_CACHE = 'flamematch-static-v22';
const DYNAMIC_CACHE = 'flamematch-dynamic-v22';

// Risorse da cachare subito
const STATIC_ASSETS = [
  '/flamematch/',
  '/flamematch/app.html',
  '/flamematch/index.html',
  '/flamematch/js/app-real.js',
  '/flamematch/js/firebase-config.js',
  '/flamematch/js/cloudinary-config.js',
  '/flamematch/logo.png',
  '/flamematch/manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installazione - Cache risorse statiche
self.addEventListener('install', event => {
  console.log('🔥 FlameMatch SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('🔥 FlameMatch SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.log('Cache error:', err))
  );
});

// Attivazione - Pulizia vecchie cache
self.addEventListener('activate', event => {
  console.log('🔥 FlameMatch SW: Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('🔥 FlameMatch SW: Removing old cache', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Firebase/Cloudinary/external API calls
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('cloudinary') ||
      url.hostname.includes('paypal') ||
      url.hostname.includes('googleapis.com/identitytoolkit')) {
    return;
  }
  
  // Per risorse statiche: Cache first
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            return caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, response.clone());
              return response;
            });
          });
        })
    );
    return;
  }
  
  // Per tutto il resto: Network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cached => {
          if (cached) return cached;
          
          // Fallback per pagine HTML
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/flamematch/app.html');
          }
        });
      })
  );
});

// Push notifications (per future implementazioni)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Hai un nuovo messaggio!',
    icon: '/flamematch/icons/icon-192x192.png',
    badge: '/flamematch/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/flamematch/app.html'
    },
    actions: [
      { action: 'open', title: 'Apri' },
      { action: 'close', title: 'Chiudi' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '🔥 FlameMatch', options)
  );
});

// Gestione click su notifica
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

console.log('🔥 FlameMatch Service Worker loaded');
