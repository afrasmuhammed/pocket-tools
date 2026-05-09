// Pocket Tools — service worker (cache-busting mode).
// Wipes all old caches and passes every request straight to the network.

const VERSION = 'pocket-tools-v32';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  await self.clients.claim();
});

// No fetch handler → every request goes directly to the network.
