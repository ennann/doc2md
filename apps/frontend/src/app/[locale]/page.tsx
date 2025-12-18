import FileUploader from '@/components/FileUploader';
import { getTranslation } from '@/lib/i18n';
import type { Locale } from '@/types';
import { Shield, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
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
      <div className="min-h-[calc(100vh-5rem)] flex flex-col">
        {/* Header moved to layout.tsx */}


        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 pb-32">
          <div className="w-full max-w-3xl mx-auto space-y-8">
            <section className="text-center space-y-4 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight [text-wrap:balance]">
                {t.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t.subtitle}
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <FileUploader t={t} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{t.privacy.noStorage}</h3>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{t.privacy.noTracking}</h3>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{t.privacy.secure}</h3>
              </div>
            </section>
          </div>
        </main>

        <footer className="py-6">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex-1 md:text-left text-center">
                {(t.footer.copyright || '© {year} Doc2MD').replace('{year}', new Date().getFullYear().toString())}
              </div>
              
              <div className="flex items-center gap-6">
                <Link href={`/${locale}/privacy`} className="hover:underline hover:text-foreground transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
                <Link href={`/${locale}/support`} className="hover:underline hover:text-foreground transition-colors">
                  {t.footer.support}
                </Link>
              </div>

              <div className="flex-1 flex justify-center md:justify-end items-center gap-3">
                <a
                  href="https://github.com/ennann/doc2md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-foreground transition-colors"
                >
                  {t.footer.viewOnGitHub || 'View on GitHub'}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
