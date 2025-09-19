// ThinkBit Edge Corp - Service Worker
// Progressive Web App capabilities for offline functionality

const CACHE_NAME = 'thinkbit-edge-v1.0.0';
const STATIC_CACHE = 'thinkbit-static-v1';
const DYNAMIC_CACHE = 'thinkbit-dynamic-v1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// Dynamic routes to cache
const DYNAMIC_ROUTES = [
  '/api/',
  '/contact',
  '/research',
  '/team'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event triggered');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
  
  // Force the new service worker to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event triggered');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.includes('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    // Static assets - cache first strategy
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPICall(request.url)) {
    // API calls - network first strategy
    event.respondWith(networkFirstStrategy(request));
  } else if (isImageRequest(request)) {
    // Images - cache with fallback strategy
    event.respondWith(cacheWithFallbackStrategy(request));
  } else if (isNavigationRequest(request)) {
    // Navigation requests - network with fallback strategy
    event.respondWith(navigationStrategy(request));
  } else {
    // Other requests - stale while revalidate strategy
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Cache first strategy - good for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache the response if it's successful
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy - good for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache with fallback strategy - good for images
async function cacheWithFallbackStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    
    // Return a fallback image or placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

// Navigation strategy - good for page navigation
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page:', error);
    
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      createOfflinePage(),
      {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

// Stale while revalidate strategy - good for regular content
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Network request failed:', error);
    return null;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  if (cachedResponse) {
    networkPromise; // Don't await, let it update cache in background
    return cachedResponse;
  }
  
  return networkPromise || new Response('Content not available offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Helper functions
function isStaticAsset(url) {
  return url.includes('.css') || 
         url.includes('.js') || 
         url.includes('fonts.googleapis.com') ||
         url.includes('unpkg.com');
}

function isAPICall(url) {
  return url.includes('/api/') || 
         url.includes('/contact') ||
         url.includes('submit');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.png') ||
         request.url.includes('.gif') ||
         request.url.includes('.webp') ||
         request.url.includes('.svg');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ThinkBit Edge - Offline</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 2rem;
            }
            .offline-container {
                max-width: 500px;
                animation: fadeIn 1s ease-out;
            }
            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 2rem;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 800; }
            p { font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.9; }
            .retry-btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 1rem 2rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .retry-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .features {
                margin-top: 3rem;
                text-align: left;
                background: rgba(255,255,255,0.1);
                padding: 2rem;
                border-radius: 1rem;
                backdrop-filter: blur(10px);
            }
            .features h3 { margin-bottom: 1rem; }
            .features ul { list-style: none; }
            .features li {
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .features li::before {
                content: '✓';
                color: #00d4ff;
                font-weight: bold;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="logo">🧠</div>
            <h1>You're Offline</h1>
            <p>No internet connection detected. Some cached content may still be available.</p>
            
            <button class="retry-btn" onclick="window.location.reload()">
                Try Again
            </button>
            
            <div class="features">
                <h3>ThinkBit Edge Features</h3>
                <ul>
                    <li>AI Research & Development</li>
                    <li>Data Engineering Excellence</li>
                    <li>Machine Learning Innovation</li>
                    <li>University Partnerships</li>
                    <li>Industry Collaboration</li>
                </ul>
            </div>
        </div>
        
        <script>
            // Check for connectivity and reload if back online
            window.addEventListener('online', () => {
                window.location.reload();
            });
            
            // Show connection status
            if (navigator.onLine) {
                document.querySelector('p').textContent = 'Connection restored! Click "Try Again" to reload.';
            }
        </script>
    </body>
    </html>
  `;
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

// Sync contact form submissions when online
async function syncContactForm() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    const formSubmissions = requests.filter(request => 
      request.url.includes('contact-submit') && request.method === 'POST'
    );
    
    for (const request of formSubmissions) {
      try {
        await fetch(request);
        await cache.delete(request);
        console.log('[SW] Form submission synced successfully');
      } catch (error) {
        console.error('[SW] Failed to sync form submission:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
  const options = {
    body: 'New updates available from ThinkBit Edge!',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ThinkBit Edge Corp', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent());
  }
});

// Update content in background
async function updateContent() {
  try {
    // Fetch latest content and update cache
    const response = await fetch('/');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/', response);
      console.log('[SW] Content updated successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to update content:', error);
  }
}

console.log('[SW] Service Worker loaded successfully');
console.log('[SW] Cache version:', CACHE_NAME);