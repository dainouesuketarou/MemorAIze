// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
// import EmailProvider from "next-auth/providers/email";

const prisma = new PrismaClient();

/** ★ ここが肝心 ── Node ランタイムを強制 */
export const runtime = "nodejs";
/** ★ ついでに SSG 判定も避ける */
export const dynamic = "force-dynamic";

/** 設定は変数に切り出して、getServerSession でも再利用できるよう export しておく */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // ユーザーが存在するか確認
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // 新規ユーザーの場合、データベースに保存
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              provider: account?.provider || "google",
              providerAccountId: account?.providerAccountId || "",
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    /** ここで token 情報を session に載せる場合は user も受け取る */
    async session({ session, token, user }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 認証後は常に /dashboard へ
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);

/** App Router 用の re‑export */
export { handler as GET, handler as POST };
