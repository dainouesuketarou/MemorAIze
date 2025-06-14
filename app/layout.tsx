import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MemorAIze - AI暗記カード作成アプリ',
  description:
    'AIを活用した暗記カード作成と学習管理アプリ。効率的な学習をサポートします。',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'MemorAIze - AI暗記カード作成アプリ',
    description:
      'AIを活用した暗記カード作成と学習管理アプリ。効率的な学習をサポートします。',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemorAIze - AI暗記カード作成アプリ',
    description:
      'AIを活用した暗記カード作成と学習管理アプリ。効率的な学習をサポートします。',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link
          rel="preload"
          href="/_next/static/css/3864b451a61e4546.css"
          as="style"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
