// PocketKit — service worker (offline-first).
// Strategy:
//   install  → cache shell assets (atomic); cache tools/libs best-effort
//   activate → delete stale app caches, keep fonts cache
//   fetch    → cache-first for same-origin; runtime cache for Google Fonts
//
// Bump CACHE_VERSION on every deploy so existing users pick up fresh assets.
// All URL versions MUST match the query strings used in index.html and router.js:
//   css/styles.css?v=24  |  js/app.js?v=35  |  templates/*.html?v=5  |  js/tools/*.js?v=4

const CACHE_VERSION = 'v43';
const CACHE_NAME    = `pocketkit-${CACHE_VERSION}`;
const FONTS_CACHE   = 'pocketkit-fonts-v1';

// ---------------------------------------------------------------------------
// App shell — MUST be cached for the app to work offline at all.
// cache.addAll() is atomic; a single failure aborts the install, so keep
// this list small and reliable (no large binaries).
// ---------------------------------------------------------------------------
const SHELL_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css?v=24',   // matches <link> in index.html
  'js/app.js?v=35',        // matches <script> in index.html
  'js/registry.js?v=21',
  'js/router.js?v=22',
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
// Versions MUST match what router.js requests:
//   templates/*.html?v=5  and  js/tools/*.js?v=4
// Anything missed here will be runtime-cached on first use while online.
// ---------------------------------------------------------------------------
const TOOL_URLS = [
  // Tool modules (76) — router does: import(`./tools/${id}.js?v=4`)
  'js/tools/alphabetical-sorter.js?v=4',
  'js/tools/api-beautifier.js?v=4',
  'js/tools/base64-encoder.js?v=4',
  'js/tools/bill-splitter.js?v=4',
  'js/tools/black-and-white.js?v=4',
  'js/tools/bulk-renamer.js?v=4',
  'js/tools/case-converter.js?v=4',
  'js/tools/canonical-url.js?v=4',
  'js/tools/character-counter.js?v=4',
  'js/tools/color-palette.js?v=4',
  'js/tools/color-picker.js?v=4',
  'js/tools/compress-pdf.js?v=4',
  'js/tools/countdown.js?v=4',
  'js/tools/cron-explainer.js?v=4',
  'js/tools/csv-json.js?v=4',
  'js/tools/bug-report.js?v=4',
  'js/tools/days-between.js?v=4',
  'js/tools/discount-calculator.js?v=4',
  'js/tools/duplicate-remover.js?v=4',
  'js/tools/dummy-user.js?v=4',
  'js/tools/emi-calculator.js?v=4',
  'js/tools/extract-pdf.js?v=4',
  'js/tools/format-converter.js?v=4',
  'js/tools/grocery-calculator.js?v=4',
  'js/tools/hash-generator.js?v=4',
  'js/tools/hmac-generator.js?v=4',
  'js/tools/html-entities.js?v=4',
  'js/tools/id-masker.js?v=4',
  'js/tools/image-compressor.js?v=4',
  'js/tools/invoice-generator.js?v=4',
  'js/tools/json-formatter.js?v=4',
  'js/tools/json-csv.js?v=4',
  'js/tools/json-yaml.js?v=4',
  'js/tools/jwt-decoder.js?v=4',
  'js/tools/keyword-density.js?v=4',
  'js/tools/lorem-ipsum.js?v=4',
  'js/tools/markdown-previewer.js?v=4',
  'js/tools/meta-tags.js?v=4',
  'js/tools/merge-pdf.js?v=4',
  'js/tools/og-preview.js?v=4',
  'js/tools/page-numbers.js?v=4',
  'js/tools/password-generator.js?v=4',
  'js/tools/percentage-change.js?v=4',
  'js/tools/photo-pdf.js?v=4',
  'js/tools/pomodoro.js?v=4',
  'js/tools/protect-pdf.js?v=4',
  'js/tools/qr-generator.js?v=4',
  'js/tools/random-address.js?v=4',
  'js/tools/random-decision.js?v=4',
  'js/tools/ratio-cropper.js?v=4',
  'js/tools/reading-time.js?v=4',
  'js/tools/receipt-enhancer.js?v=4',
  'js/tools/regex-tester.js?v=4',
  'js/tools/rotate-pdf.js?v=4',
  'js/tools/robots-txt.js?v=4',
  'js/tools/signature-png.js?v=4',
  'js/tools/slug-generator.js?v=4',
  'js/tools/social-resizer.js?v=4',
  'js/tools/split-pdf.js?v=4',
  'js/tools/sitemap-formatter.js?v=4',
  'js/tools/stopwatch.js?v=4',
  'js/tools/text-diff.js?v=4',
  'js/tools/test-case.js?v=4',
  'js/tools/timestamp-converter.js?v=4',
  'js/tools/timezone.js?v=4',
  'js/tools/unit-converter.js?v=4',
  'js/tools/unprotect-pdf.js?v=4',
  'js/tools/url-encoder.js?v=4',
  'js/tools/uuid-generator.js?v=4',
  'js/tools/vat-calculator.js?v=4',
  'js/tools/watermark.js?v=4',
  'js/tools/whitespace-remover.js?v=4',
  'js/tools/whatsapp-sticker.js?v=4',
  'js/tools/word-counter.js?v=4',
  'js/tools/xml-formatter.js?v=4',
  'js/tools/yaml-json.js?v=4',

  // Tool templates (76) — router does: fetch(`templates/${id}.html?v=5`)
  'templates/alphabetical-sorter.html?v=5',
  'templates/api-beautifier.html?v=5',
  'templates/base64-encoder.html?v=5',
  'templates/bill-splitter.html?v=5',
  'templates/black-and-white.html?v=5',
  'templates/bulk-renamer.html?v=5',
  'templates/case-converter.html?v=5',
  'templates/canonical-url.html?v=5',
  'templates/character-counter.html?v=5',
  'templates/color-palette.html?v=5',
  'templates/color-picker.html?v=5',
  'templates/compress-pdf.html?v=5',
  'templates/countdown.html?v=5',
  'templates/cron-explainer.html?v=5',
  'templates/csv-json.html?v=5',
  'templates/bug-report.html?v=5',
  'templates/days-between.html?v=5',
  'templates/discount-calculator.html?v=5',
  'templates/duplicate-remover.html?v=5',
  'templates/dummy-user.html?v=5',
  'templates/emi-calculator.html?v=5',
  'templates/extract-pdf.html?v=5',
  'templates/format-converter.html?v=5',
  'templates/grocery-calculator.html?v=5',
  'templates/hash-generator.html?v=5',
  'templates/hmac-generator.html?v=5',
  'templates/html-entities.html?v=5',
  'templates/id-masker.html?v=5',
  'templates/image-compressor.html?v=5',
  'templates/invoice-generator.html?v=5',
  'templates/json-formatter.html?v=5',
  'templates/json-csv.html?v=5',
  'templates/json-yaml.html?v=5',
  'templates/jwt-decoder.html?v=5',
  'templates/keyword-density.html?v=5',
  'templates/lorem-ipsum.html?v=5',
  'templates/markdown-previewer.html?v=5',
  'templates/meta-tags.html?v=5',
  'templates/merge-pdf.html?v=5',
  'templates/og-preview.html?v=5',
  'templates/page-numbers.html?v=5',
  'templates/password-generator.html?v=5',
  'templates/percentage-change.html?v=5',
  'templates/photo-pdf.html?v=5',
  'templates/pomodoro.html?v=5',
  'templates/protect-pdf.html?v=5',
  'templates/qr-generator.html?v=5',
  'templates/random-address.html?v=5',
  'templates/random-decision.html?v=5',
  'templates/ratio-cropper.html?v=5',
  'templates/reading-time.html?v=5',
  'templates/receipt-enhancer.html?v=5',
  'templates/regex-tester.html?v=5',
  'templates/rotate-pdf.html?v=5',
  'templates/robots-txt.html?v=5',
  'templates/signature-png.html?v=5',
  'templates/slug-generator.html?v=5',
  'templates/social-resizer.html?v=5',
  'templates/split-pdf.html?v=5',
  'templates/sitemap-formatter.html?v=5',
  'templates/stopwatch.html?v=5',
  'templates/text-diff.html?v=5',
  'templates/test-case.html?v=5',
  'templates/timestamp-converter.html?v=5',
  'templates/timezone.html?v=5',
  'templates/unit-converter.html?v=5',
  'templates/unprotect-pdf.html?v=5',
  'templates/url-encoder.html?v=5',
  'templates/uuid-generator.html?v=5',
  'templates/vat-calculator.html?v=5',
  'templates/watermark.html?v=5',
  'templates/whitespace-remover.html?v=5',
  'templates/whatsapp-sticker.html?v=5',
  'templates/word-counter.html?v=5',
  'templates/xml-formatter.html?v=5',
  'templates/yaml-json.html?v=5',

  // Libraries (large files — best-effort so slow networks don't abort install)
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
      // Activate NOW — don't wait for 3 MB+ of tool/lib downloads.
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
