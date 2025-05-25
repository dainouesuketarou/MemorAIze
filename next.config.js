/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['next-auth', '@auth/core', 'nodemailer'],
  },
  // Reset webpack config to Next.js defaults
  webpack: (config) => {
    return config;
  },
  // 環境変数の読み込みを明示的に設定
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_FREE_PRICE_ID: process.env.STRIPE_FREE_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
};

module.exports = nextConfig;
