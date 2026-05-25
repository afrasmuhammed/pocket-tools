# PocketKit Product Plan

PocketKit is the next version of the original toolkit: a private, installable PWA organized into focused pockets instead of one giant wall of tools.

The core product decision is simple:

- PocketKit Daily is free.
- Specialized pockets are Pro.
- The app should stay calm, simple, fast, and practical like the original toolkit.
- The homepage should explain the product and guide users into pockets, not show all 90 tools immediately.

## Product Positioning

Primary line:

> Private everyday tools, installed like an app.

Supporting line:

> Use quick tools for PDFs, images, text, QA, SEO, development, and shop work. PocketKit Daily is free. Advanced pockets are available when you need more.

Trust line:

> Works offline whenever possible. No uploads for local tools.

Important framing:

- Do not position PocketKit as "90 free tools".
- Position it as an installable workspace with useful pockets.
- Daily tools create trust and distribution.
- Pro pockets create monetization.

## What To Preserve From The Current Site

The current site already has a good feel. Keep:

- Simple app-like header.
- Soft card language.
- Compact, practical controls.
- Light/dark mode.
- Fast navigation.
- Minimal but useful copy.
- Tool pages that get straight to work.
- Offline/privacy identity.

Avoid:

- Loud SaaS landing page style.
- Oversized marketing sections.
- Heavy gradients or decorative blobs.
- Showing every tool on the first screen.
- Aggressive paywalls before the product value is clear.

## Main Routes

Target route structure:

```text
#/                    Landing page
#/pocket/daily        PocketKit Daily
#/pocket/pdf          PocketKit PDF
#/pocket/image        PocketKit Image
#/pocket/developer    PocketKit Developer
#/pocket/qa           PocketKit QA
#/pocket/seo          PocketKit SEO
#/pocket/shop         PocketKit Shop
#/all                 Full tool library
#/tool/:id            Existing individual tool page
```

## Pockets

### PocketKit Daily

Access: Free

Purpose: Useful common tools for everyone. This is the public default experience and should be immediately usable without an account.

Suggested tools:

- QR Code Generator
- Image Compressor
- Image Format Converter
- Merge PDF
- Compress PDF
- Word & Char Counter
- Character Counter
- Pomodoro Timer
- Days Between Dates
- Password Generator
- Unit Converter
- Discount Calculator
- Bill Splitter
- Random Decision
- Signature to PNG

### PocketKit PDF

Access: Pro

Purpose: Document and PDF workflows.

Tools:

- Compress PDF
- Merge PDF
- Split PDF
- Password Protect PDF
- Unprotect PDF
- Rotate PDF
- PDF Page Numberer
- Extract PDF Text
- ID Masker
- Invoice Generator
- Receipt Enhancer
- Photo to PDF

### PocketKit Image

Access: Pro

Purpose: Image processing and creator utilities.

Tools:

- Image Compressor + Converter
- Image Format Converter
- Bulk Photo Renamer
- Social Media Resizer
- Aspect Ratio Cropper
- Image Color Picker
- Text Watermark
- Black & White
- WhatsApp Sticker Maker

### PocketKit Developer

Access: Pro

Purpose: Private browser tools for formatting, encoding, debugging, hashes, and developer text workflows.

Tools:

- JSON Formatter
- XML Formatter / Minifier
- YAML to JSON Converter
- JSON to YAML Converter
- CSV to JSON Converter
- JSON to CSV Converter
- Base64 Encoder / Decoder
- URL Encoder / Decoder
- HTML Entities Encoder / Decoder
- Hash Generator
- HMAC Generator
- JWT Decoder
- Cron Explainer
- Markdown Previewer
- Lorem Ipsum Generator
- Color Palette Extractor

### PocketKit QA

Access: Pro

Purpose: Daily testing utilities for QA people and teams.

Tools:

- Dummy User Generator
- Random Address Generator
- UUID Generator
- Password Generator
- JSON Formatter
- Regex Tester
- API Response Beautifier
- Timestamp Converter
- Bug Report Formatter
- Test Case Formatter
- Character Counter

### PocketKit SEO

Access: Pro

Purpose: Offline SEO preparation and previews. Later this can gain online Pro checks.

Tools:

- Meta Tag Generator
- OpenGraph Preview
- Slug Generator
- Keyword Density Checker
- Sitemap Formatter
- Robots.txt Generator
- Canonical URL Generator

### PocketKit Shop

Access: Pro

Purpose: Small business and shop owner utilities.

Current tools:

- Invoice Generator
- Receipt Enhancer
- QR Code Generator
- VAT Calculator
- Grocery Calculator

Future tools:

- Margin Calculator
- GST Calculator
- WhatsApp Link Generator
- Invoice Number Generator
- QR Payment Link Generator
- Product Label Generator

## Landing Page Requirements

The landing page replaces the current all-tools homepage.

Sections:

1. Hero
2. Pocket cards
3. Why PocketKit
4. Install/PWA section
5. Free vs Pro preview
6. Small footer

### Hero

Goal: Explain the app quickly and give a direct free path.

Content:

```text
PocketKit

Private everyday tools,
installed like an app.

Use quick tools for PDFs, images, text, QA, SEO, development, and shop work. PocketKit Daily is free. Advanced pockets are available when you need more.

[Open PocketKit Daily] [Browse all pockets]

Works offline whenever possible. No uploads for local tools.
```

Design notes:

- Keep it compact.
- No huge marketing hero.
- No giant graphic needed.
- It should feel like opening an app, not reading a sales page.

### Pocket Cards

Each pocket card should show:

- Pocket name
- Free/Pro badge
- Short description
- 3-5 example tools
- Tool count
- Clear click target

Example:

```text
PocketKit Daily
Free
Everyday tools for quick private work.
QR, image compression, passwords, PDFs, timers
15 tools
```

Pro pocket cards should feel useful, not locked away. The card should sell the workflow, not just say "locked".

### Why PocketKit

Keep this short:

- Private by default
- Installable PWA
- Works offline whenever possible
- Organized into focused pockets

### Install/PWA Section

Explain:

- Install PocketKit to Dock, taskbar, or home screen.
- Open pockets/tools directly.
- Some platforms support app shortcuts.

No technical browser details on the main page. Keep it user-friendly.

### Free vs Pro

Simple framing:

- Daily: free
- Pro pockets: specialized workflows
- Payment/auth not required for initial UI phase

Copy idea:

```text
Start with Daily for free. Unlock focused pockets when you need deeper workflows for PDFs, design, development, QA, SEO, or shop work.
```

## Pocket Page Requirements

Pocket pages should reuse the current grid feel.

Structure:

```text
PocketKit QA
Testing utilities for data, reports, APIs, and validation.

[Pro] [Works offline whenever possible]

[Search within this pocket]

Tool grid
```

Free pocket:

- Open normally.
- No locked feeling.
- Can show "Free" badge.

Pro pocket:

- Show tools clearly.
- Show a soft Pro banner.
- Add "Unlock Pocket" button.
- During development, tools can remain clickable behind a config flag.

Soft lock copy:

```text
PocketKit QA is a Pro pocket. Preview the tools now. Unlocking will be added with accounts and payments.
```

## All Tools Page

The current homepage grid becomes:

```text
#/all
```

This page keeps:

- Search
- Category chips
- Recently used
- Full 90-tool grid

It should be secondary, but still available for power users.

Landing page links:

- Browse all tools
- Search all tools

## Tool Page Requirements

Keep existing tool layouts mostly unchanged.

Add a better tool header area:

```text
PocketKit QA / Bug Report Formatter
[Pro] [Works offline]

[Pin this tool] [Copy link]
```

Pin behavior:

- Copy direct tool URL.
- If browser install prompt is available, show install action.
- If not, show simple guidance.

Important limitation:

- Browsers usually cannot install 90 separate mini-apps from one PWA.
- But every tool can have a direct URL.
- Manifest shortcuts can expose key tools/pockets on supported platforms.

## PWA Shortcut Plan

Update `manifest.json` with curated shortcuts:

- PocketKit Daily
- Compress PDF
- Image Compressor
- QR Generator
- JSON Formatter
- Bug Report Formatter

Do not add all tools as shortcuts. Keep this list curated.

## Registry Model

Current registry is category-based. The next version needs pockets.

Target model:

```js
export const POCKETS = [
  {
    id: 'daily',
    name: 'PocketKit Daily',
    access: 'free',
    desc: 'Everyday tools for quick private work.',
    featuredTools: ['qr-generator', 'image-compressor', 'password-generator'],
  },
];
```

Tools should support multiple pockets:

```js
{
  id: 'json-formatter',
  name: 'JSON Formatter',
  category: 'qa',
  pockets: ['developer', 'qa'],
  access: 'pro',
  desc: 'Validate, format, or minify JSON',
  icon: ICONS.braces,
}
```

Why:

- A tool can belong to multiple pockets.
- Category is still useful for All Tools.
- Pocket membership becomes the main product experience.
- Access is separate from category.

## Access Model

Initial values:

```text
free
pro
```

Later possible values:

```text
free
pro
online
beta
```

For now:

- PocketKit Daily tools are free.
- Tools that also appear in Pro pockets can still be free if they are part of Daily.
- Pro pocket pages can show Pro framing even if some tools overlap with Daily.

## Payment/Auth Plan

Do not buy traditional hosting for this.

Recommended stack when monetization starts:

- Domain: `pocketkit.app`
- DNS: Cloudflare
- Frontend: Cloudflare Pages or Vercel
- Auth: Supabase
- Database/licenses: Supabase
- Payments: Stripe or Lemon Squeezy

Recommended first payment approach:

- Start with "All Pro Pockets" early access.
- Later allow individual pocket unlocks.

Suggested early pricing:

- PocketKit Daily: free
- One Pro pocket: small one-time price or low monthly
- All Pro pockets: early lifetime/annual bundle

Avoid implementing payment before the pocket UX is strong.

## Implementation Phases

### Phase 1: Architecture

- Add `POCKETS` metadata to `js/registry.js`.
- Add `pockets` and `access` to every tool.
- Keep existing categories for All Tools.
- Add helper functions:
  - `getPocket(id)`
  - `getToolsForPocket(id)`
  - `getPrimaryPocketForTool(id)`

### Phase 2: Routing

- Add route `#/all`.
- Add route `#/pocket/:id`.
- Keep `#/tool/:id`.
- Make `#/` render the new landing page.
- Move current home grid behavior to All Tools.

### Phase 3: Landing Page

- Replace first screen with PocketKit landing.
- Add pocket cards.
- Add free/pro badges.
- Add short trust/PWA section.
- Keep visual style close to current app.

### Phase 4: Pocket Pages

- Build reusable pocket page renderer.
- Add pocket-specific search.
- Show only tools in the selected pocket.
- Add soft Pro state for Pro pockets.

### Phase 5: Tool Header

- Add pocket breadcrumb.
- Add access badge.
- Add "Copy tool link".
- Add "Pin this tool" helper.

### Phase 6: PWA

- Keep the app name consistent as PocketKit.
- Update manifest name, short name, shortcuts, theme copy.
- Update metadata and OG tags.
- Connect `pocketkit.app` later after deployment.

### Phase 7: Design Polish

- Apply Claude Design output.
- Keep the current UI DNA.
- Browser test desktop and mobile.
- Check dark mode.
- Check no text overflow.
- Check no card wall appears on first load.

### Phase 8: Monetization

- Add Supabase auth.
- Add payment provider.
- Add license/unlock checks.
- Add account page.
- Add restore purchase flow.

## Claude Design Handoff Prompt

Use this prompt in Claude Design:

```text
Design a simple, premium, app-like homepage and pocket system for PocketKit.

Important: the current PocketKit website already has a calm, simple, practical style. Do not redesign it into a loud SaaS landing page. Keep the same feeling: lightweight, clean, fast, useful, friendly, and installable.

Product:
PocketKit is a private, installable PWA with useful browser-based tools. The app is organized into "pockets" instead of showing every tool at once.

Business model:
- PocketKit Daily is free.
- Specialized pockets are Pro: PDF, Image, Developer, QA, SEO, Shop.

Main idea:
When a user opens the website, they should not see a giant wall of tools. They should see a simple cover page that explains the product and lets them choose a pocket.

Design pages:
1. Landing page
2. Pocket cards section
3. Pocket detail page
4. All Tools page
5. Tool page header with breadcrumb and "Pin this tool"
6. Locked/Pro pocket state
7. Mobile version

Landing page content:
Headline:
"Private everyday tools, installed like an app."

Subcopy:
"Use quick tools for PDFs, images, text, QA, SEO, development, and shop work. PocketKit Daily is free. Advanced pockets are available when you need more."

Primary CTA:
"Open PocketKit Daily"

Secondary CTA:
"Browse all pockets"

Trust line:
"Works offline whenever possible. No uploads for local tools."

Pockets:
- PocketKit Daily: Free, everyday tools
- PocketKit PDF Pro
- PocketKit Image Pro
- PocketKit Developer Pro
- PocketKit QA Pro
- PocketKit SEO Pro
- PocketKit Shop Pro

Visual requirements:
- Match the current PocketKit feel
- Simple and calm
- No oversized marketing hero
- No heavy gradients
- No noisy illustrations
- Mobile-first
- Clear pocket cards
- Subtle Pro badges
- Friendly locked state, not aggressive
- Feels like a useful installed app, not a sales page
```

## Definition Of Done For The Restructure

- First visit shows landing page, not full tool wall.
- PocketKit Daily is clearly free and opens quickly.
- Pro pockets are visible and understandable.
- All Tools page still exists.
- Every existing tool still works.
- PWA manifest uses PocketKit branding.
- Important shortcuts exist.
- Browser smoke test passes on desktop and mobile.
- Offline cache matches route/template/module versions.
- README reflects PocketKit, pockets, and the free/pro direction.
