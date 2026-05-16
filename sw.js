// Pocket Tools — service worker (offline-first).
// Strategy:
//   install  → cache shell assets (atomic); cache tools/libs best-effort
//   activate → delete stale app caches, keep fonts cache
//   fetch    → cache-first for same-origin; runtime cache for Google Fonts
//
// Bump CACHE_VERSION on every deploy so existing users pick up fresh assets.

const CACHE_VERSION = 'v4';
const CACHE_NAME    = `pocket-tools-${CACHE_VERSION}`;
const FONTS_CACHE   = 'pocket-tools-fonts-v1';

// ---------------------------------------------------------------------------
// App shell — MUST be cached for the app to work offline at all.
// cache.addAll() is atomic; a single failure aborts the install, so keep
// this list small and reliable (no large binaries, no query-string URLs).
// ---------------------------------------------------------------------------
const SHELL_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css?v=15',
  'js/app.js',
  'js/registry.js',
  'js/router.js',
  'js/core/file.js',
  'js/core/lazy.js',
  'js/core/ui.js',
  'js/core/validate.js',
  'assets/apple-touch-icon.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
];

// ---------------------------------------------------------------------------
// Tool assets — cached best-effort so a single failure doesn't abort install.
// Anything missed here will be runtime-cached on first use.
// ---------------------------------------------------------------------------
const TOOL_URLS = [
  // Tool modules (48)
  'js/tools/alphabetical-sorter.js',
  'js/tools/base64-encoder.js',
  'js/tools/bill-splitter.js',
  'js/tools/black-and-white.js',
  'js/tools/bulk-renamer.js',
  'js/tools/case-converter.js',
  'js/tools/color-palette.js',
  'js/tools/color-picker.js',
  'js/tools/countdown.js',
  'js/tools/cron-explainer.js',
  'js/tools/days-between.js',
  'js/tools/discount-calculator.js',
  'js/tools/duplicate-remover.js',
  'js/tools/emi-calculator.js',
  'js/tools/extract-pdf.js',
  'js/tools/format-converter.js',
  'js/tools/grocery-calculator.js',
  'js/tools/id-masker.js',
  'js/tools/image-compressor.js',
  'js/tools/json-formatter.js',
  'js/tools/jwt-decoder.js',
  'js/tools/merge-pdf.js',
  'js/tools/page-numbers.js',
  'js/tools/password-generator.js',
  'js/tools/percentage-change.js',
  'js/tools/photo-pdf.js',
  'js/tools/pomodoro.js',
  'js/tools/protect-pdf.js',
  'js/tools/qr-generator.js',
  'js/tools/random-decision.js',
  'js/tools/ratio-cropper.js',
  'js/tools/reading-time.js',
  'js/tools/receipt-enhancer.js',
  'js/tools/regex-tester.js',
  'js/tools/rotate-pdf.js',
  'js/tools/signature-png.js',
  'js/tools/social-resizer.js',
  'js/tools/split-pdf.js',
  'js/tools/stopwatch.js',
  'js/tools/text-diff.js',
  'js/tools/timezone.js',
  'js/tools/unit-converter.js',
  'js/tools/unprotect-pdf.js',
  'js/tools/uuid-generator.js',
  'js/tools/vat-calculator.js',
  'js/tools/watermark.js',
  'js/tools/whitespace-remover.js',
  'js/tools/word-counter.js',

  // Tool templates (48)
  'templates/alphabetical-sorter.html',
  'templates/base64-encoder.html',
  'templates/bill-splitter.html',
  'templates/black-and-white.html',
  'templates/bulk-renamer.html',
  'templates/case-converter.html',
  'templates/color-palette.html',
  'templates/color-picker.html',
  'templates/countdown.html',
  'templates/cron-explainer.html',
  'templates/days-between.html',
  'templates/discount-calculator.html',
  'templates/duplicate-remover.html',
  'templates/emi-calculator.html',
  'templates/extract-pdf.html',
  'templates/format-converter.html',
  'templates/grocery-calculator.html',
  'templates/id-masker.html',
  'templates/image-compressor.html',
  'templates/json-formatter.html',
  'templates/jwt-decoder.html',
  'templates/merge-pdf.html',
  'templates/page-numbers.html',
  'templates/password-generator.html',
  'templates/percentage-change.html',
  'templates/photo-pdf.html',
  'templates/pomodoro.html',
  'templates/protect-pdf.html',
  'templates/qr-generator.html',
  'templates/random-decision.html',
  'templates/ratio-cropper.html',
  'templates/reading-time.html',
  'templates/receipt-enhancer.html',
  'templates/regex-tester.html',
  'templates/rotate-pdf.html',
  'templates/signature-png.html',
  'templates/social-resizer.html',
  'templates/split-pdf.html',
  'templates/stopwatch.html',
  'templates/text-diff.html',
  'templates/timezone.html',
  'templates/unit-converter.html',
  'templates/unprotect-pdf.html',
  'templates/uuid-generator.html',
  'templates/vat-calculator.html',
  'templates/watermark.html',
  'templates/whitespace-remover.html',
  'templates/word-counter.html',

  // Libraries (large files — best-effort so a slow network doesn't abort install)
  'lib/cronstrue-esm.js',
  'lib/cronstrue.min.js',
  'lib/pdf-lib.min.js',
  'lib/pdf.min.js',
  'lib/pdf.worker.min.js',
  'lib/qpdf.js',
  'lib/qpdf.wasm',
  'lib/qrcode.min.js',

  // Remaining assets
  'assets/og-image.png',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch a URL and store it in `cache`. Silently ignore any error. */
async function cacheOne(cache, url) {
  try {
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res);
  } catch (_) { /* network error — will be runtime-cached on next online visit */ }
}

// ---------------------------------------------------------------------------
// Install — cache shell synchronously, then activate immediately.
// Tool assets are fetched in the background so they don't delay activation.
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache the 15 shell files — small, fast (<1 s), required for offline.
      await cache.addAll(SHELL_URLS);
      // Activate NOW — don't make users wait for 3 MB+ of tool/lib downloads.
      self.skipWaiting();
      // Kick off tool + lib caching in the background.
      // Not awaited: the SW stays alive while these fetches are in-flight,
      // and anything missed here gets runtime-cached on first use.
      TOOL_URLS.forEach(url => cacheOne(cache, url));
    }),
  );
});

// ---------------------------------------------------------------------------
// Activate — delete stale app caches; preserve the fonts cache.
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONTS_CACHE)
          .map(k => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

// ---------------------------------------------------------------------------
// Fetch — cache-first for same-origin; runtime-cache for Google Fonts.
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts — cache-first, populate on first online fetch.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => new Response('', { status: 408 }));
        }),
      ),
    );
    return;
  }

  // Same-origin only — let the browser handle cross-origin normally.
  if (url.origin !== self.location.origin) return;

  // Cache-first: serve from cache, fall back to network and cache the result.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, res.clone()));
        }
        return res;
      });
    }),
  );
});
