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
  // 画像の最適化設定
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 環境変数の読み込みを明示的に設定
  env: {
    // ここに環境変数を追加
    // DATABASE_URL: process.env.DATABASE_URL,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    // AWS_REGION: process.env.AWS_REGION,
    // AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    // AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    // AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL,
    // GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    // USE_GOOGLE_AI: process.env.USE_GOOGLE_AI,
    // GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // MONTHLY_AI_LIMIT: process.env.MONTHLY_AI_LIMIT,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_FREE_PRICE_ID: process.env.STRIPE_FREE_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
};

module.exports = nextConfig;
