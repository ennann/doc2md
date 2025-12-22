import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Redirects and headers moved to public/_redirects and public/_headers for Cloudflare Pages
};

export default nextConfig;
