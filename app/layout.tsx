import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SyncSessionToRedux } from '@/components/SyncSessionToRedux';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MemorAIze - AI-Powered Memorization Assistant',
  description: 'Enhance your learning with AI-generated flashcards and smart study tools',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SyncSessionToRedux>
            {children}
            <Toaster />
          </SyncSessionToRedux>
        </Providers>
      </body>
    </html>
  );
}