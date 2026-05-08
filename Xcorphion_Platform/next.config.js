const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  i18n: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
  },
  reactStrictMode: false,
  transpilePackages: ["@xcorphion/shared"],
  trailingSlash: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async rewrites() {
    return [
      {
        source: '/study/:path*',
        destination: 'http://localhost:3001/study/:path*',
      },
    ];
  },
}

module.exports = nextConfig;
