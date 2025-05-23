// app/api/auth/[...nextauth]/route.ts
import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash } from 'crypto';

// AWS SESクライアントの設定
const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/** ★ ここが肝心 ── Node ランタイムを強制 */
export const runtime = 'nodejs';
/** ★ ついでに SSG 判定も避ける */
export const dynamic = 'force-dynamic';

/** 設定は変数に切り出して、getServerSession でも再利用できるよう export しておく */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    EmailProvider({
      from: process.env.AWS_SES_FROM_EMAIL,
      maxAge: 10 * 60, // 10分
      generateVerificationToken: () => {
        // 6桁の数字を生成
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
      sendVerificationRequest: async ({ identifier, url, token }) => {
        try {
          console.log('→ AWS_REGION:', process.env.AWS_REGION);
          console.log(
            '→ AWS_ACCESS_KEY_ID:',
            process.env.AWS_ACCESS_KEY_ID?.slice(0, 4),
            '…',
          );
          console.log(
            '→ AWS_SECRET_ACCESS_KEY:',
            process.env.AWS_SECRET_ACCESS_KEY ? 'set' : '＜empty＞',
          );
          console.log('→ AWS_SES_FROM_EMAIL:', process.env.AWS_SES_FROM_EMAIL);

          const command = new SendEmailCommand({
            Source: process.env.AWS_SES_FROM_EMAIL,
            Destination: {
              ToAddresses: [identifier],
            },
            Message: {
              Subject: {
                Data: 'MemorAIzeへのワンタイムパスワード',
                Charset: 'UTF-8',
              },
              Body: {
                Html: {
                  Data: `
                    <h1>MemorAIzeへのログイン</h1>
                    <p>以下のワンタイムパスワードを入力してログインしてください：</p>
                    <h2 style="font-size: 24px; font-weight: bold; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">${token}</h2>
                    <p>このワンタイムパスワードは10分間有効です。</p>
                    <p>このメールに心当たりがない場合は、無視してください。</p>
                  `,
                  Charset: 'UTF-8',
                },
              },
            },
          });

          const response = await sesClient.send(command);
          console.log('Email sent successfully:', response);
        } catch (error) {
          console.error('Error sending verification email:', error);
          if (error instanceof Error) {
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack,
            });
          }
          throw new Error(
            'メールの送信に失敗しました。管理者にお問い合わせください。',
          );
        }
      },
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase();
        const otp = creds?.otp;
        if (!email || !otp) return null;
        console.log('→ email:', email);
        console.log('→ otp:', otp);

        const secret = process.env.NEXTAUTH_SECRET!;
        const hashed = createHash('sha256')
          .update(`${otp}${secret}`)
          .digest('hex');

        const record = await prisma.verificationToken.findFirst({
          where: { identifier: email, token: hashed },
        });
        console.log('→ record:', record);
        if (!record || record.expires < new Date()) return null;

        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              // @@unique([identifier, token]) が必須
              identifier: email,
              token: hashed,
            },
          },
        });

        return prisma.user.upsert({
          where: { email },
          update: {},
          create: { email },
        });
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/auth/email-sent',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Google認証時のユーザー情報を確実に保存
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
          });
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // セッションにユーザー情報を追加
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
        });
        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

/** App Router 用の re‑export */
export { handler as GET, handler as POST };
