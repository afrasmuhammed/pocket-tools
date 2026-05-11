// Pocket Tools — service worker (cache-busting mode).
// Wipes all old caches and passes every request straight to the network.
// NOTE: There is no precache list here — all assets are served from the
// network. Bump VERSION whenever deploying to force existing users to
// re-activate this worker and pick up fresh assets via HTTP cache.

const VERSION = 'pocket-tools-v37';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  await self.clients.claim();
});

// No fetch handler → every request goes directly to the network.
