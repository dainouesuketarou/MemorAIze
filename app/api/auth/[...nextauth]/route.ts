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
import { Adapter, AdapterUser } from 'next-auth/adapters';

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

// カスタムアダプターの作成
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  getUserByAccount: async (account: {
    provider: string;
    providerAccountId: string;
  }): Promise<AdapterUser | null> => {
    const user = await prisma.user.findFirst({
      where: {
        Account: {
          some: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name || null,
      email: user.email || '',
      image: user.image || null,
      emailVerified: user.emailVerified,
    };
  },
} as Adapter;

/** 設定は変数に切り出して、getServerSession でも再利用できるよう export しておく */
export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
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
          create: {
            email,
            name: null,
            image: null,
            emailVerified: null,
            isOnboarded: false,
            stripeCustomerId: null,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            isOnboarded: true,
          },
        });
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/auth/email-sent',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // 既存のユーザーを検索（メールアドレスで検索）
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              Account: true,
            },
          });

          // 既存のユーザーが存在する場合
          if (existingUser) {
            // Googleアカウントが既にリンクされているか確認
            const hasGoogleAccount = existingUser.Account.some(
              (acc) => acc.provider === 'google',
            );

            // Googleアカウントがリンクされていない場合、リンクを作成
            if (!hasGoogleAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }

            // ユーザー情報を更新
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            });

            return true;
          }

          // 新規ユーザーの場合
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              isOnboarded: false,
              stripeCustomerId: null,
              Account: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              },
            },
          });

          // 新規ユーザー用の初期データを作成
          await Promise.all([
            // Freeプランを設定
            prisma.subscription.create({
              data: {
                userId: newUser.id,
                plan: 'FREE',
                status: 'ACTIVE',
                stripeSubscriptionId: null,
                stripePriceId: null,
                stripeCurrentPeriodEnd: null,
              },
            }),
            // AI使用制限を設定
            prisma.aiGenerationLimit.create({
              data: {
                userId: newUser.id,
                month: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                ),
                count: 0,
              },
            }),
          ]);

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
        try {
          // セッションにユーザー情報を追加
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub! },
            select: {
              name: true,
              email: true,
              image: true,
              isOnboarded: true,
            },
          });

          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image;
            session.user.isOnboarded = dbUser.isOnboarded;
          } else {
            console.error('User not found in database:', token.sub);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

/** App Router 用の re‑export */
export { handler as GET, handler as POST };
