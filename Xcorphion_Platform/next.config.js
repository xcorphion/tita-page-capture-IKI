/** @type {import('next').NextConfig} */

// CSP permissivo para os iframes estáticos que carregam React/Tailwind de CDN
// unsafe-inline necessário porque os .html têm scripts inline de render
const HTML_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const htmlIframeHeaders = [
  { key: 'Content-Security-Policy', value: HTML_CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
];

// Three.js / react-three-fiber may spawn blob: workers for offscreen rendering
// unsafe-eval required by Next.js react-refresh in development only
const isDev = process.env.NODE_ENV !== 'production';
const CSP = [
  "default-src 'self'",
  `script-src 'self'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "worker-src blob:",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  i18n: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
  },
  reactStrictMode: false,
  trailingSlash: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async headers() {
    return [
      { source: '/:path*',              headers: securityHeaders },
      { source: '/sidebar.html',        headers: htmlIframeHeaders },
      { source: '/headline-full.html',  headers: htmlIframeHeaders },
      { source: '/manifesto-full.html', headers: htmlIframeHeaders },
    ];
  },
}

module.exports = nextConfig;
