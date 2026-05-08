/** @type {import('next').NextConfig} */

// IKI page loads @phosphor-icons dynamically from unpkg — must be in script-src
// unsafe-eval required by Next.js react-refresh in development only
const isDev = process.env.NODE_ENV !== 'production';
const CSP = [
  "default-src 'self'",
  `script-src 'self'${isDev ? " 'unsafe-eval'" : ''} https://unpkg.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
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
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  basePath: '/study',
  assetPrefix: '/study',
  reactStrictMode: false,
  transpilePackages: ["@xcorphion/shared", "@xcorphion/platform"],
  trailingSlash: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
}

module.exports = nextConfig;
