const ACCESS_DAYS = 365;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function getSessionId(event) {
  if (event.httpMethod === 'GET') return event.queryStringParameters?.session_id || '';
  try {
    return JSON.parse(event.body || '{}').session_id || '';
  } catch {
    return '';
  }
}

exports.handler = async (event) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { error: 'Method not allowed.' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return json(501, { error: 'Stripe is not configured yet.' });

  const sessionId = getSessionId(event).trim();
  if (!/^cs_(test|live)_/.test(sessionId)) return json(400, { error: 'Invalid checkout session.' });

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const session = await response.json();
  if (!response.ok) return json(response.status, { error: session.error?.message || 'Could not verify checkout.' });

  const paid = session.payment_status === 'paid' && session.status === 'complete';
  const created = Number(session.created || Math.floor(Date.now() / 1000)) * 1000;
  return json(200, {
    unlocked: paid,
    provider: 'stripe',
    plan: 'pro',
    sessionId: session.id,
    customerEmail: session.customer_details?.email || session.customer_email || '',
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    grantedAt: created,
    accessUntil: created + ACCESS_DAYS * 24 * 60 * 60 * 1000,
  });
};
