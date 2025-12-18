import FileUploader from '@/components/FileUploader';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { getTranslation } from '@/lib/i18n';
import type { Locale } from '@/types';
import { Shield, Zap, Lock } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslation(locale);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Doc2MD',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    url: `https://doc2md.org/${locale}`,
    description: t.seo?.description || 'Free online document to markdown converter',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10000',
    },
    featureList: [
      'Convert DOCX to Markdown',
      'Convert DOC to Markdown',
      'Convert PDF to Markdown',
      'Convert PPTX to Markdown',
      'Privacy-first conversion',
      'No file storage',
      'Browser-based processing',
    ],
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-4xl">
            <div className="flex items-center gap-2">
              <Image
                src="/favorite.png"
                alt="Doc2MD Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-lg font-semibold">Doc2MD</span>
            </div>
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-2xl mx-auto space-y-16">
            <section className="text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight [text-wrap:balance]">
                {t.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t.subtitle}
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <FileUploader t={t} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t.privacy.noStorage}</h3>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t.privacy.noTracking}</h3>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t.privacy.secure}</h3>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div>
                {(t.footer.copyright || '© {year} Doc2MD').replace('{year}', new Date().getFullYear().toString())}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/qingnianxiaozhe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {t.footer.followUs}
                </a>
                <span className="hidden md:inline opacity-40">|</span>
                <a
                  href="https://github.com/ennann/doc2md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {t.footer.github}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
