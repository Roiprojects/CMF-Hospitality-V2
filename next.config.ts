import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    agentUpgrade: 'security',
  },
  async headers() {
    return [
      {
        source: '/frames/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
export default config;
