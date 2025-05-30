import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://memoraize.app'),
  title: {
    default: 'MemorAIze - AIを活用した効率的な暗記学習アプリ',
    template: '%s | MemorAIze',
  },
  description:
    'AIを活用した暗記学習支援アプリ。PDFや画像から自動で暗記カードを生成し、効率的な学習で記憶の定着を最大化します。',
  keywords: [
    '暗記学習',
    'AI学習',
    'フラッシュカード',
    '学習アプリ',
    '記憶定着',
    '効率的学習',
  ],
  authors: [{ name: 'MemorAIze Team' }],
  creator: 'MemorAIze',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://memoraize.app',
    title: 'MemorAIze - AIを活用した効率的な暗記学習アプリ',
    description:
      'AIを活用した暗記学習支援アプリ。PDFや画像から自動で暗記カードを生成し、効率的な学習で記憶の定着を最大化します。',
    siteName: 'MemorAIze',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MemorAIze - AIを活用した効率的な暗記学習アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemorAIze - AIを活用した効率的な暗記学習アプリ',
    description:
      'AIを活用した暗記学習支援アプリ。PDFや画像から自動で暗記カードを生成し、効率的な学習で記憶の定着を最大化します。',
    images: ['/og-image.jpg'],
    creator: '@memoraize',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
