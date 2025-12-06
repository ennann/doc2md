import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { Locale } from '@/types';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Doc2MD - Convert documents to Markdown',
  description: 'Fast, private, secure document to markdown converter. All conversions happen in transient memory.',
  keywords: ['markdown', 'converter', 'docx', 'pdf', 'pptx', 'privacy'],
  icons: {
    icon: '/favorite.png',
    apple: '/favorite.png',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateStaticParams(): Promise<{ locale: Locale }[]> {
  return [
    { locale: 'en' as Locale },
    { locale: 'zh' as Locale },
    { locale: 'ja' as Locale },
    { locale: 'fr' as Locale },
    { locale: 'de' as Locale },
  ];
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale as Locale} className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
