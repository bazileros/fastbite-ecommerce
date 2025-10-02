/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  images: {
    unoptimized: true, // Using ImageKit for optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'files.convex.cloud',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '**',
      },
    ],
  },
  
  // Disable telemetry in production
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      optimizeCss: true,
    },
  }),
};

module.exports = nextConfig;
