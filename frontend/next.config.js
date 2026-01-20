/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/v1/:path*',
            destination: 'http://localhost:8080/api/v1/:path*',
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
