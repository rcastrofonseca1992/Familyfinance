/**
 * Registers the service worker for offline-first PWA behavior.
 *
 * The registration is intentionally guarded for production builds and modern browsers.
 */
export function registerServiceWorker() {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return;
  }

  const scope = '/';
  const swUrl = '/service-worker.js';

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swUrl, { scope })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              registration.waiting?.postMessage('SKIP_WAITING');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });
}
