const ACCESS_KEY = 'pk-pro-access';
const ACCESS_DAYS = 365;

export const PRO_PRICE_LABEL = '$24/year';
export const CHECKOUT_ENDPOINT = '/.netlify/functions/create-checkout-session';
export const VERIFY_ENDPOINT = '/.netlify/functions/verify-checkout-session';

function fallbackAccessUntil(grantedAt = Date.now()) {
  return grantedAt + ACCESS_DAYS * 24 * 60 * 60 * 1000;
}

export function getProAccess() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.plan !== 'pro') return null;
    return data;
  } catch {
    return null;
  }
}

export function hasProAccess(now = Date.now()) {
  const access = getProAccess();
  if (!access) return false;
  if (!access.accessUntil) return true;
  return Number(access.accessUntil) > now;
}

export function saveProAccess(details = {}) {
  const grantedAt = Number(details.grantedAt) || Date.now();
  const accessUntil = Number(details.accessUntil) || fallbackAccessUntil(grantedAt);
  const access = {
    plan: 'pro',
    provider: details.provider || 'stripe',
    sessionId: details.sessionId || '',
    customerEmail: details.customerEmail || '',
    amountTotal: Number(details.amountTotal) || 0,
    currency: details.currency || 'usd',
    grantedAt,
    accessUntil,
  };
  localStorage.setItem(ACCESS_KEY, JSON.stringify(access));
  window.dispatchEvent(new CustomEvent('pk-access-changed', { detail: access }));
  return access;
}

export function clearProAccess() {
  localStorage.removeItem(ACCESS_KEY);
  window.dispatchEvent(new CustomEvent('pk-access-changed'));
}

export function formatAccessDate(timestamp) {
  if (!timestamp) return 'Active';
  try {
    return new Date(Number(timestamp)).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Active';
  }
}
