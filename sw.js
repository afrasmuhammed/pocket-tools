// Pocket Tools — service worker (offline-first).
// Precaches all static assets at install time and serves them cache-first.
// Google Fonts are cached at runtime (separate long-lived cache).
// Bump CACHE_VERSION whenever deploying to invalidate old caches.

const CACHE_VERSION = 'v2';
const CACHE_NAME    = `pocket-tools-${CACHE_VERSION}`;
const FONTS_CACHE   = 'pocket-tools-fonts-v1';

// ---------------------------------------------------------------------------
// Precache manifest — every local asset the app needs to work offline.
// ---------------------------------------------------------------------------
const PRECACHE_URLS = [
  // App shell
  './',
  'index.html',
  'manifest.json',
  'css/styles.css?v=15',

  // Core JS
  'js/app.js',
  'js/registry.js',
  'js/router.js',
  'js/core/file.js',
  'js/core/lazy.js',
  'js/core/ui.js',
  'js/core/validate.js',

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

  // Libraries
  'lib/cronstrue-esm.js',
  'lib/cronstrue.min.js',
  'lib/pdf-lib.min.js',
  'lib/pdf.min.js',
  'lib/pdf.worker.min.js',
  'lib/qpdf.js',
  'lib/qpdf.wasm',
  'lib/qrcode.min.js',

  // Assets / icons
  'assets/apple-touch-icon.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
  'assets/og-image.png',
];

// ---------------------------------------------------------------------------
// Install — cache everything in PRECACHE_URLS before going live.
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ---------------------------------------------------------------------------
// Activate — delete stale app caches; keep the fonts cache across deploys.
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
// Fetch — cache-first for everything we own; runtime-cache for Google Fonts.
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts — cache-first, populate on first fetch (separate long-lived cache).
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached); // offline and not yet cached → no font (graceful)
        }),
      ),
    );
    return;
  }

  // Only intercept same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Cache-first: serve from cache, fall back to network and cache the result.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      });
    }),
  );
});
