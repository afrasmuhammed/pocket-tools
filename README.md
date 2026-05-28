# PocketKit

PocketKit is a private, installable PWA for everyday tools. Instead of opening to one giant wall of 100 tools, the app is organized into focused pockets.

Live preview target: [pocketkit.app](https://pocketkit.app/)

## Product Model

| Pocket | Access | Purpose |
|---|---:|---|
| PocketKit Daily | Free | Common tools for quick private work |
| PocketKit PDF | Pro | Document and PDF workflows |
| PocketKit Designer | Pro | Image, layout, crop, color, and creator utilities |
| PocketKit Developer | Pro | Format, encode, decode, hash, and debug |
| PocketKit Office | Pro | Client, admin, contracts, tables, and expense workflows |
| PocketKit QA | Pro | Test data, API, bug report, and validation tools |
| PocketKit SEO | Pro | Offline SEO preparation and previews |
| PocketKit Student | Pro | Writing, reading, notes, PDFs, and study helpers |
| PocketKit Shop | Pro | Small business utilities |

## Current Tools

The app currently contains 100 browser-based tools across photos, documents, text, money/math, time, utilities, SEO, QA, office, and developer workflows.

PocketKit Daily is the free default experience. Pro pockets are visible as soft locked previews until auth and payments are added.

## PWA

`manifest.json` uses PocketKit branding and includes shortcuts for:

- All PocketKit Tools
- PocketKit Daily
- Compress PDF
- Image Compressor
- QR Generator
- JSON Formatter
- Password Generator
- Bug Report Formatter

## Search Discovery

PocketKit exposes `opensearch.xml`, `sitemap.xml`, and `tools.json`, so supported browsers and crawlers can understand the tool library. Search URLs land on `#/all?q=...`, prefilled with matching tool results.

Run `node scripts/sync-metadata.mjs` after registry changes to regenerate `sitemap.xml` and `tools.json`.

## QA

Run `node scripts/check-pocketkit.mjs` before shipping larger changes. It checks registry IDs, pocket references, template/module files, service-worker cache entries, sitemap entries, and `tools.json` counts.

With a local static server running, run `node scripts/smoke-static.mjs` to verify that the app shell, discovery files, and all 100 tool templates/modules return successfully.

## Offline Support

`sw.js` precaches all 200+ static assets: app shell, CSS, 100 tool JS modules, 100 tool templates, vendored libraries, icons, and discovery files. Most tools run locally in the browser and work offline whenever possible.

## Planning

See [docs/POCKETKIT_PRODUCT_PLAN.md](docs/POCKETKIT_PRODUCT_PLAN.md) for the detailed product/design plan and Claude Design handoff.
