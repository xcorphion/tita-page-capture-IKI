/** @type {import('next').NextConfig} */
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
}

module.exports = nextConfig;
