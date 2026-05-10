// Central security utilities — input coercion, IP extraction, HTML escape, sanitizer.
// All API handlers must use these helpers instead of trusting req.body / req.headers directly.

import sanitizeHtmlLib from 'sanitize-html';

// ───────────────────────────────────────────────────────────────────────────
// String coercion — defeats NoSQL injection by rejecting non-string payloads.
// Returns trimmed string, or null when input is not a usable string.
export function asString(v, maxLen = 1024) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t || t.length > maxLen) return null;
  return t;
}

// ───────────────────────────────────────────────────────────────────────────
// IP extraction — in Vercel/proxied envs, the *last* hop in x-forwarded-for
// is the one the platform itself injected; spoofed values are at the front.
// We prefer x-real-ip (Vercel sets it), then last entry of XFF.
const PRIVATE_RE = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|::1|fc|fd|fe80)/i;

export function extractIp(req) {
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real.trim();

  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    const parts = xff.split(',').map(s => s.trim()).filter(Boolean);
    // Last hop = injected by the closest trusted proxy. Skip private addrs.
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!PRIVATE_RE.test(parts[i])) return parts[i];
    }
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return req.socket?.remoteAddress || 'unknown';
}

// ───────────────────────────────────────────────────────────────────────────
// HTML escape — for safe interpolation inside email templates.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ESC[c]);
}

// ───────────────────────────────────────────────────────────────────────────
// Article HTML sanitizer — uses sanitize-html with strict allowlist.
// Replaces the previous regex-based sanitizer that had multiple bypasses
// (<svg/onload>, <style>, javascript: with encoded chars, etc.).
const SANITIZE_OPTS = {
  allowedTags: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
      'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
      'text-align': [/^(left|right|center|justify)$/],
      'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/],
      'font-weight': [/^(bold|normal|\d{3})$/],
      'font-style': [/^(italic|normal)$/],
    },
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        target: attribs.target === '_blank' ? '_blank' : '_self',
      },
    }),
  },
};

export function sanitizeArticleHtml(html) {
  if (typeof html !== 'string') return '';
  return sanitizeHtmlLib(html, SANITIZE_OPTS);
}

// ───────────────────────────────────────────────────────────────────────────
// Generic strict text sanitizer — strips ALL HTML. Use for participant names,
// subject lines, etc. that should never contain markup.
export function stripHtml(s) {
  if (typeof s !== 'string') return '';
  return sanitizeHtmlLib(s, { allowedTags: [], allowedAttributes: {} });
}
