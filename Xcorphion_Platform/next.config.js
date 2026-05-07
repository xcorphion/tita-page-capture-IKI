/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@xcorphion/shared"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  }
}

module.exports = nextConfig;
