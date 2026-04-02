/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web.safehunt.app/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig;