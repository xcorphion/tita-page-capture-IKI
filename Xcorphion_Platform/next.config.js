/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@xcorphion/shared"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async rewrites() {
    return [
      {
        source: '/research/:path*',
        destination: `${process.env.RESEARCH_URL || 'http://localhost:3001'}/research/:path*`,
      },
    ]
  },
}

module.exports = nextConfig;
