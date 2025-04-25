/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  typescript: {
    // !! ATTENTION !!
    // Dangereux en production, à utiliser uniquement pour le développement
    ignoreBuildErrors: true
  },
  eslint: {
    // !! ATTENTION !!
    // Dangereux en production, à utiliser uniquement pour le développement
    ignoreDuringBuilds: true
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
    ],
    // Make ENV
    unoptimized: true,
  },
};

module.exports = nextConfig;
