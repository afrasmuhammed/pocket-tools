const crypto = require('crypto');
const SIGNATURE_TOLERANCE_SECONDS = 300;

function text(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body,
  };
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyStripeSignature(payload, header, secret) {
  const parts = Object.fromEntries(String(header || '').split(',').map(part => part.split('=')));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return timingSafeEqual(expected, signature);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return text(405, 'Method not allowed');

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return text(501, 'Stripe webhook secret is not configured');

  const payload = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!verifyStripeSignature(payload, signature, secret)) return text(400, 'Invalid signature');

  const eventBody = JSON.parse(payload);
  if (eventBody.type === 'checkout.session.completed') {
    console.log('PocketKit Pro checkout completed', eventBody.data?.object?.id);
  }

  return text(200, 'ok');
};
