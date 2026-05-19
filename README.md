# PocketKit

PocketKit is a private, installable PWA for everyday tools. Instead of opening to one giant wall of 76 tools, the app is organized into focused pockets.

Live preview target: [pocketkit.app](https://pocketkit.app/)

## Product Model

| Pocket | Access | Purpose |
|---|---:|---|
| PocketKit Daily | Free | Common tools for quick private work |
| PocketKit PDF | Pro | Document and PDF workflows |
| PocketKit Image | Pro | Image processing and creator utilities |
| PocketKit Developer | Pro | Format, encode, decode, hash, and debug |
| PocketKit QA | Pro | Test data, API, bug report, and validation tools |
| PocketKit SEO | Pro | Offline SEO preparation and previews |
| PocketKit Shop | Pro | Small business utilities |

## Current Tools

The app currently contains 76 browser-based tools across photos, documents, text, money/math, time, utilities, SEO, QA, and developer workflows.

PocketKit Daily is the free default experience. Pro pockets are visible as soft locked previews until auth and payments are added.

## PWA

`manifest.json` uses PocketKit branding and includes shortcuts for:

- PocketKit Daily
- Compress PDF
- Image Compressor
- QR Generator
- JSON Formatter
- Bug Report Formatter

## Offline Support

`sw.js` precaches all 150+ static assets: app shell, CSS, 76 tool JS modules, 76 tool templates, vendored libraries, and icons. Most tools run locally in the browser and work offline whenever possible.

## Planning

See [docs/POCKETKIT_PRODUCT_PLAN.md](docs/POCKETKIT_PRODUCT_PLAN.md) for the detailed product/design plan and Claude Design handoff.
