// This service worker self-destructs to clear any stale Vite service worker
// that may be cached in the browser from a previous version of the app.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});
