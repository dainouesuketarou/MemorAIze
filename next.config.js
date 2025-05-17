/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      "next-auth",
      "@auth/core",
      "nodemailer",
    ],
  },
  // Reset webpack config to Next.js defaults
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;