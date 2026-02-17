/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Needed for wagmi
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
