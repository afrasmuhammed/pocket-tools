# PocketKit Launch Checklist

Use this before announcing PocketKit publicly.

## Product

- [ ] Open the homepage on desktop and mobile Safari.
- [ ] Open `#/all` and confirm search, pockets, saved tools, and recent tools feel right.
- [ ] Open one tool from every pocket.
- [ ] Confirm Pro tools open during launch preview.
- [ ] Confirm `#/account` explains launch-preview access.
- [ ] Confirm Quick Open finds tools, pockets, Pro, privacy, and contact.
- [ ] Install the PWA and open it from the installed app.
- [ ] Test offline after one full online load.

## Trust Pages

- [ ] Review `#/privacy`.
- [ ] Review `#/terms`.
- [ ] Review `#/refunds`.
- [ ] Review `#/contact`.
- [ ] Review `#/local-first`.
- [ ] Review `#/changelog`.
- [ ] Create or forward `support@pocketkit.app`.

## Payments

- [ ] Create a Stripe product for PocketKit Pro.
- [ ] Create the yearly launch price.
- [ ] Add Netlify environment variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRO_PRICE_ID`
  - `STRIPE_WEBHOOK_SECRET`
  - `SITE_URL=https://pocketkit.app`
- [ ] Add the Stripe webhook endpoint:
  - `https://pocketkit.app/.netlify/functions/stripe-webhook`
- [ ] Test checkout with Stripe test mode.
- [ ] Test success and cancel return routes.
- [ ] Turn `PRO_GATE_ENABLED` on in `js/core/access.js`.
- [ ] Run the full QA checks again before pushing paid access.

## Technical QA

- [ ] Run `node scripts/check-pocketkit.mjs`.
- [ ] Run `node scripts/smoke-static.mjs` against a local preview server.
- [ ] Hard refresh live Safari after deploy.
- [ ] Confirm service worker update notice appears when expected.
- [ ] Confirm no old Pocket Tools copy remains in visible launch pages.

## Launch Copy

- [ ] One-line pitch: `PocketKit is 100 private browser tools in one installable app.`
- [ ] Short pitch: `Format, convert, clean, calculate, redact, compress, and generate without sending your work to random websites.`
- [ ] Launch proof points:
  - 100 tools
  - 9 organized pockets
  - local-first workflows
  - installable PWA
  - Daily free, Pro open during launch preview
