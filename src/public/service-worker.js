/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
/**
 * Progressive Web App service worker for Notinow.
 *
 * Responsibilities:
 * - Pre-cache the app shell and critical static assets.
 * - Runtime caching for navigation requests, Supabase API calls, fonts, and icons.
 * - Offline fallback for navigation when the network is unavailable.
 * - Conservative cache cleanup tied to semantic versioning to avoid stale assets.
 */

const CACHE_VERSION = 'notinow-pwa-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const SUPABASE_CACHE = `${CACHE_VERSION}-supabase`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

/**
 * Wrapper for stale-while-revalidate strategy.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);
  return cachedResponse || networkFetch;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    if (url.hostname.endsWith('supabase.co')) {
      event.respondWith(handleSupabaseMutation(request));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  if (url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (url.hostname.endsWith('supabase.co')) {
    // Avoid caching authenticated Supabase responses to prevent cross-session data leaks
    event.respondWith(fetch(request));
    return;
  }

  if (isIconOrManifest(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.origin === self.location.origin && isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

async function handleNavigationRequest(event) {
  const { request } = event;
  try {
    if (event.preloadResponse) {
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) return preloadResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      runtimeCache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function handleSupabaseMutation(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Request queued until online', retry: true }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Retry-After-Online': 'true'
        }
      }
    );
  }
}

function isIconOrManifest(url) {
  return (
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.includes('favicon') ||
    url.pathname.includes('android-chrome') ||
    url.pathname.includes('apple-touch-icon')
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.svg')
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cachedResponse || Response.error();
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
