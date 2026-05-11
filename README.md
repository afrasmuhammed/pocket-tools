# Pocket Tools

48 tools — free, designed offline-first. Full service-worker offline support is in progress.  
Live at [afrasmuhammed.github.io/pocket-tools](https://afrasmuhammed.github.io/pocket-tools/)

## Categories

| Category | Tools |
|---|---|
| Photos | Image Compressor, Format Converter, Bulk Renamer, Social Resizer, Ratio Cropper, Photo→PDF, Color Picker, Watermark, Black & White |
| Documents | Merge PDF, Split PDF, Protect PDF, Page Numberer, Extract Text, Rotate PDF, Unprotect PDF, ID Masker, Receipt Enhancer |
| Text | Word Counter, Case Converter, Whitespace Remover, Alphabetical Sorter, Duplicate Remover, Reading Time, Text Diff |
| Money & Math | Bill Splitter, Discount Calculator, Loan Calculator, Percentage Change, Unit Converter, Grocery Calculator, VAT Calculator |
| Time | Pomodoro Timer, Days Between Dates, Timezone Matcher, Stopwatch, Countdown Timer |
| Utilities | Password Generator, QR Code Generator, Random Decision, Signature to PNG |
| Developer | Base64 Encoder/Decoder, UUID Generator, JSON Formatter, JWT Decoder, Cron Explainer, Regex Tester, Color Palette Extractor |

## Libraries added (branch: developer-tools-category)

| Library | Version | Vendored to | Used by |
|---|---|---|---|
| cronstrue | 3.14.0 | `lib/cronstrue.min.js` | Cron Explainer |

ESM shim at `lib/cronstrue-esm.js` wraps the UMD bundle for use with `import`.  
All other tools (Base64, UUID, JSON Formatter, JWT Decoder, Regex Tester, Color Palette Extractor) use only built-in browser APIs — no additional dependencies.

## Known issues / follow-up work

- **Service worker does not provide true offline caching.** The current `sw.js` wipes all caches on activation and has no fetch handler — every request goes to the network. Implement proper `install` + `fetch` handlers with a precache manifest in a dedicated follow-up branch.
