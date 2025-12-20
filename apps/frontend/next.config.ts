import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // redirects 和 headers 已迁移到 public/_redirects 和 public/_headers
  // 用于 Cloudflare Pages 静态部署
};

export default nextConfig;
