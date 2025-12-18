import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/i18n';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = 'https://doc2md.org';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslation(locale);

  const title = t.seo?.title || 'Doc2MD - Convert Documents to Markdown Online Free';
  const description = t.seo?.description || 'Free online document to markdown converter. Convert DOCX, DOC, PDF, PPTX to Markdown instantly. Privacy-first, no file storage, works in your browser.';

  return {
    title: {
      default: title,
      template: `%s | Doc2MD`,
    },
    description,
    keywords: [
      'markdown converter',
      'docx to markdown',
      'doc to markdown',
      'word to markdown',
      'pdf to markdown',
      'pptx to markdown',
      'ppt to markdown',
      'excel to markdown',
      'xls to markdown',
      'xlsx to markdown',
      'docs to markdown',
      'pdf',
      'ppt',
      'excel',
      'docs',
      'document converter',
      'convert to md',
      'online markdown converter',
      'free markdown tool',
      'privacy markdown converter',
    ],
    authors: [{ name: 'Doc2MD' }],
    creator: 'Doc2MD',
    publisher: 'Doc2MD',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
        'ja': '/ja',
        'fr': '/fr',
        'de': '/de',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${siteUrl}/${locale}`,
      title,
      description,
      siteName: 'Doc2MD',
      images: [
        {
          url: `${siteUrl}/favorite.png`,
          width: 512,
          height: 512,
          alt: 'Doc2MD Logo',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [`${siteUrl}/favorite.png`],
    },
    icons: {
      icon: '/favorite.png',
      apple: '/favorite.png',
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
      // Add your verification codes here when you have them
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };
}

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

import Header from '@/components/Header';



export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale as Locale} className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <GoogleAnalytics />
        <Header locale={locale as Locale} />
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
