/**
 * next.config.js – Server Components から外部パッケージを除外
 * 既存設定がある場合は experimental ブロックだけマージしてください。
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    /**
     * Server Component バンドルに含めると
     * Edge Runtime で誤って実行される恐れのあるパッケージを外出し
     */
    serverComponentsExternalPackages: [
      "next-auth",
      "@auth/core",
      "nodemailer",
    ],
  },
};

module.exports = nextConfig;
