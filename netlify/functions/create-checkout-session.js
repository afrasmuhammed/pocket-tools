const STRIPE_API = 'https://api.stripe.com/v1/checkout/sessions';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function siteUrl(event) {
  const configured = process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (configured) return configured.replace(/\/$/, '');
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const host = event.headers.host || 'pocketkit.app';
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!secret || !priceId) {
    return json(501, {
      error: 'Stripe is not configured yet.',
      setup: 'Set STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID in Netlify environment variables.',
    });
  }

  const origin = siteUrl(event);
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const source = String(body.source || 'app').slice(0, 80);
  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/#/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#/payment/cancel`,
    allow_promotion_codes: 'true',
    customer_creation: 'always',
    'metadata[product]': 'pocketkit_pro',
    'metadata[source]': source,
  });

  const response = await fetch(STRIPE_API, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const data = await response.json();
  if (!response.ok) {
    return json(response.status, { error: data.error?.message || 'Stripe checkout could not start.' });
  }

  return json(200, { url: data.url, sessionId: data.id });
};
