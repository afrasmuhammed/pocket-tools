# Pocket Tools

59 tools — free, works offline. Install as a PWA and use all 59 tools without a network connection.
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
| Developer | Base64 Encoder/Decoder, URL Encoder/Decoder, HTML Entities Encoder/Decoder, Markdown Previewer, Lorem Ipsum Generator, Slug Generator, Meta Tag Generator, Robots.txt Generator, UUID Generator, JSON Formatter, XML Formatter/Minifier, CSV to JSON Converter, JWT Decoder, Cron Explainer, Regex Tester, Color Palette Extractor, Timestamp Converter |

## Libraries added (branch: developer-tools-category)

| Library | Version | Vendored to | Used by |
|---|---|---|---|
| cronstrue | 3.14.0 | `lib/cronstrue.min.js` | Cron Explainer |

ESM shim at `lib/cronstrue-esm.js` wraps the UMD bundle for use with `import`.  
All other tools (Base64, URL Encoder / Decoder, HTML Entities Encoder / Decoder, Markdown Previewer, Lorem Ipsum Generator, Slug Generator, Meta Tag Generator, Robots.txt Generator, UUID, JSON Formatter, XML Formatter / Minifier, CSV to JSON Converter, JWT Decoder, Regex Tester, Color Palette Extractor, Timestamp Converter) use only built-in browser APIs — no additional dependencies.

## Offline support

`sw.js` precaches all 120+ static assets (HTML shell, CSS, 59 tool JS modules, 59 tool templates, all library files, all icons) at install time. Every subsequent load is served cache-first — no network required. Google Fonts are cached at runtime on first visit and reused offline thereafter (system fallback fonts are used if the fonts were never fetched).
