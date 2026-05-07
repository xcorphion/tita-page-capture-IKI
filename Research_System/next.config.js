/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@xcorphion/shared", "@xcorphion/platform"],
  basePath: '/research',
  trailingSlash: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
}

module.exports = nextConfig;
