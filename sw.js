// PocketKit — service worker (offline-first).
// Strategy:
//   install  → cache shell assets (atomic); cache tools/libs best-effort
//   activate → delete stale app caches, keep fonts cache
//   fetch    → cache-first for same-origin; runtime cache for Google Fonts
//
// Bump CACHE_VERSION on every deploy so existing users pick up fresh assets.
// All URL versions MUST match the query strings used in index.html and router.js:
//   css/styles.css?v=39  |  js/app.js?v=62  |  templates/*.html?v=18  |  js/tools/*.js?v=23

const CACHE_VERSION = 'v72';
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
  'css/styles.css?v=39',   // matches <link> in index.html
  'js/app.js?v=62',        // matches <script> in index.html
  'js/registry.js?v=29',
  'js/router.js?v=46',
  'js/core/file.js',
  'js/core/lazy.js',
  'js/core/ui.js',
  'js/core/validate.js',
  'js/core/handoff.js',
  'opensearch.xml',
  'robots.txt',
  'sitemap.xml',
  'tools.json',
  'assets/apple-touch-icon.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
];

// ---------------------------------------------------------------------------
// Tool assets — cached best-effort so a single failure doesn't abort install.
// Versions MUST match what router.js requests:
//   templates/*.html?v=18  and  js/tools/*.js?v=23
// Anything missed here will be runtime-cached on first use while online.
// ---------------------------------------------------------------------------
const TOOL_URLS = [
  // Tool modules (95) — router does: import(`./tools/${id}.js?v=23`)
  'js/tools/image-compressor.js?v=23',
  'js/tools/format-converter.js?v=23',
  'js/tools/bulk-renamer.js?v=23',
  'js/tools/social-resizer.js?v=23',
  'js/tools/ratio-cropper.js?v=23',
  'js/tools/photo-pdf.js?v=23',
  'js/tools/color-picker.js?v=23',
  'js/tools/watermark.js?v=23',
  'js/tools/exif-cleaner.js?v=23',
  'js/tools/screenshot-privacy-blur.js?v=23',
  'js/tools/black-and-white.js?v=23',
  'js/tools/whatsapp-sticker.js?v=23',
  'js/tools/compress-pdf.js?v=23',
  'js/tools/invoice-generator.js?v=23',
  'js/tools/quote-estimate-builder.js?v=23',
  'js/tools/merge-pdf.js?v=23',
  'js/tools/split-pdf.js?v=23',
  'js/tools/protect-pdf.js?v=23',
  'js/tools/page-numbers.js?v=23',
  'js/tools/extract-pdf.js?v=23',
  'js/tools/pdf-table-extractor.js?v=23',
  'js/tools/pdf-metadata.js?v=23',
  'js/tools/rotate-pdf.js?v=23',
  'js/tools/unprotect-pdf.js?v=23',
  'js/tools/id-masker.js?v=23',
  'js/tools/receipt-enhancer.js?v=23',
  'js/tools/word-counter.js?v=23',
  'js/tools/case-converter.js?v=23',
  'js/tools/whitespace-remover.js?v=23',
  'js/tools/alphabetical-sorter.js?v=23',
  'js/tools/duplicate-remover.js?v=23',
  'js/tools/reading-time.js?v=23',
  'js/tools/bill-splitter.js?v=23',
  'js/tools/discount-calculator.js?v=23',
  'js/tools/emi-calculator.js?v=23',
  'js/tools/percentage-change.js?v=23',
  'js/tools/unit-converter.js?v=23',
  'js/tools/grocery-calculator.js?v=23',
  'js/tools/vat-calculator.js?v=23',
  'js/tools/subscription-audit.js?v=23',
  'js/tools/receipt-expense-extractor.js?v=23',
  'js/tools/expense-report-builder.js?v=23',
  'js/tools/text-diff.js?v=23',
  'js/tools/text-redactor.js?v=23',
  'js/tools/meeting-actions.js?v=23',
  'js/tools/client-email-polisher.js?v=23',
  'js/tools/scope-cleaner.js?v=23',
  'js/tools/contract-clause-highlighter.js?v=23',
  'js/tools/table-cleaner.js?v=23',
  'js/tools/pomodoro.js?v=23',
  'js/tools/days-between.js?v=23',
  'js/tools/timezone.js?v=23',
  'js/tools/stopwatch.js?v=23',
  'js/tools/countdown.js?v=23',
  'js/tools/qr-generator.js?v=23',
  'js/tools/random-decision.js?v=23',
  'js/tools/signature-png.js?v=23',
  'js/tools/safe-share-link.js?v=23',
  'js/tools/meta-tags.js?v=23',
  'js/tools/og-preview.js?v=23',
  'js/tools/slug-generator.js?v=23',
  'js/tools/keyword-density.js?v=23',
  'js/tools/sitemap-formatter.js?v=23',
  'js/tools/robots-txt.js?v=23',
  'js/tools/canonical-url.js?v=23',
  'js/tools/utm-builder.js?v=23',
  'js/tools/dummy-user.js?v=23',
  'js/tools/random-address.js?v=23',
  'js/tools/uuid-generator.js?v=23',
  'js/tools/password-generator.js?v=23',
  'js/tools/json-formatter.js?v=23',
  'js/tools/json-schema-validator.js?v=23',
  'js/tools/regex-tester.js?v=23',
  'js/tools/api-beautifier.js?v=23',
  'js/tools/timestamp-converter.js?v=23',
  'js/tools/bug-report.js?v=23',
  'js/tools/test-case.js?v=23',
  'js/tools/character-counter.js?v=23',
  'js/tools/lorem-ipsum.js?v=23',
  'js/tools/markdown-previewer.js?v=23',
  'js/tools/html-entities.js?v=23',
  'js/tools/url-encoder.js?v=23',
  'js/tools/base64-encoder.js?v=23',
  'js/tools/xml-formatter.js?v=23',
  'js/tools/csv-json.js?v=23',
  'js/tools/json-csv.js?v=23',
  'js/tools/csv-cleaner.js?v=23',
  'js/tools/yaml-json.js?v=23',
  'js/tools/json-yaml.js?v=23',
  'js/tools/hash-generator.js?v=23',
  'js/tools/hmac-generator.js?v=23',
  'js/tools/jwt-decoder.js?v=23',
  'js/tools/cron-explainer.js?v=23',
  'js/tools/color-palette.js?v=23',
  'js/tools/color-contrast.js?v=23',

  // Tool templates (95) — router does: fetch(`templates/${id}.html?v=18`)
  'templates/image-compressor.html?v=18',
  'templates/format-converter.html?v=18',
  'templates/bulk-renamer.html?v=18',
  'templates/social-resizer.html?v=18',
  'templates/ratio-cropper.html?v=18',
  'templates/photo-pdf.html?v=18',
  'templates/color-picker.html?v=18',
  'templates/watermark.html?v=18',
  'templates/exif-cleaner.html?v=18',
  'templates/screenshot-privacy-blur.html?v=18',
  'templates/black-and-white.html?v=18',
  'templates/whatsapp-sticker.html?v=18',
  'templates/compress-pdf.html?v=18',
  'templates/invoice-generator.html?v=18',
  'templates/quote-estimate-builder.html?v=18',
  'templates/merge-pdf.html?v=18',
  'templates/split-pdf.html?v=18',
  'templates/protect-pdf.html?v=18',
  'templates/page-numbers.html?v=18',
  'templates/extract-pdf.html?v=18',
  'templates/pdf-table-extractor.html?v=18',
  'templates/pdf-metadata.html?v=18',
  'templates/rotate-pdf.html?v=18',
  'templates/unprotect-pdf.html?v=18',
  'templates/id-masker.html?v=18',
  'templates/receipt-enhancer.html?v=18',
  'templates/word-counter.html?v=18',
  'templates/case-converter.html?v=18',
  'templates/whitespace-remover.html?v=18',
  'templates/alphabetical-sorter.html?v=18',
  'templates/duplicate-remover.html?v=18',
  'templates/reading-time.html?v=18',
  'templates/bill-splitter.html?v=18',
  'templates/discount-calculator.html?v=18',
  'templates/emi-calculator.html?v=18',
  'templates/percentage-change.html?v=18',
  'templates/unit-converter.html?v=18',
  'templates/grocery-calculator.html?v=18',
  'templates/vat-calculator.html?v=18',
  'templates/subscription-audit.html?v=18',
  'templates/receipt-expense-extractor.html?v=18',
  'templates/expense-report-builder.html?v=18',
  'templates/text-diff.html?v=18',
  'templates/text-redactor.html?v=18',
  'templates/meeting-actions.html?v=18',
  'templates/client-email-polisher.html?v=18',
  'templates/scope-cleaner.html?v=18',
  'templates/contract-clause-highlighter.html?v=18',
  'templates/table-cleaner.html?v=18',
  'templates/pomodoro.html?v=18',
  'templates/days-between.html?v=18',
  'templates/timezone.html?v=18',
  'templates/stopwatch.html?v=18',
  'templates/countdown.html?v=18',
  'templates/qr-generator.html?v=18',
  'templates/random-decision.html?v=18',
  'templates/signature-png.html?v=18',
  'templates/safe-share-link.html?v=18',
  'templates/meta-tags.html?v=18',
  'templates/og-preview.html?v=18',
  'templates/slug-generator.html?v=18',
  'templates/keyword-density.html?v=18',
  'templates/sitemap-formatter.html?v=18',
  'templates/robots-txt.html?v=18',
  'templates/canonical-url.html?v=18',
  'templates/utm-builder.html?v=18',
  'templates/dummy-user.html?v=18',
  'templates/random-address.html?v=18',
  'templates/uuid-generator.html?v=18',
  'templates/password-generator.html?v=18',
  'templates/json-formatter.html?v=18',
  'templates/json-schema-validator.html?v=18',
  'templates/regex-tester.html?v=18',
  'templates/api-beautifier.html?v=18',
  'templates/timestamp-converter.html?v=18',
  'templates/bug-report.html?v=18',
  'templates/test-case.html?v=18',
  'templates/character-counter.html?v=18',
  'templates/lorem-ipsum.html?v=18',
  'templates/markdown-previewer.html?v=18',
  'templates/html-entities.html?v=18',
  'templates/url-encoder.html?v=18',
  'templates/base64-encoder.html?v=18',
  'templates/xml-formatter.html?v=18',
  'templates/csv-json.html?v=18',
  'templates/json-csv.html?v=18',
  'templates/csv-cleaner.html?v=18',
  'templates/yaml-json.html?v=18',
  'templates/json-yaml.html?v=18',
  'templates/hash-generator.html?v=18',
  'templates/hmac-generator.html?v=18',
  'templates/jwt-decoder.html?v=18',
  'templates/cron-explainer.html?v=18',
  'templates/color-palette.html?v=18',
  'templates/color-contrast.html?v=18',

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

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isFreshShellRequest(url) {
  const path = url.pathname.replace(/^\//, '');
  return (
    path === '' ||
    path === 'index.html' ||
    path === 'sw.js' ||
    path === 'manifest.json' ||
    path === 'css/styles.css' ||
    path === 'js/app.js' ||
    path === 'js/router.js' ||
    path === 'js/registry.js'
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      const shell = await cache.match('./') || await cache.match('index.html');
      if (shell) return shell;
    }
    throw _;
  }
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Fetch — fresh shell/navigation, cache-first for tool assets, runtime-cache for Google Fonts.
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

  if (isNavigationRequest(request) || isFreshShellRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

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
