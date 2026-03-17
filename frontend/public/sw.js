const CACHE_NAME = 'mood-mapper-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // If the request is for a static asset, cache it
          if (urlsToCache.some(url => fetchRequest.url.includes(url))) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New places found near you!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Places',
        icon: '/icons/search-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mood Mapper', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app to the search page
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    event.notification.close();
  } else {
    // Open the app to the main page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

async function doBackgroundSync() {
  // Handle background sync tasks
  try {
    // Example: Sync recently viewed places
    const recentlyViewed = await getRecentlyViewed();
    if (recentlyViewed.length > 0) {
      // Sync with server
      await syncWithServer(recentlyViewed);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getRecentlyViewed() {
  // Get recently viewed places from IndexedDB or localStorage
  return [];
}

async function syncWithServer(data) {
  // Sync data with server
  console.log('Syncing data with server:', data);
}
