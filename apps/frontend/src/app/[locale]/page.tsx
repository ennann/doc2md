import FileUploader from '@/components/FileUploader';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { getTranslation } from '@/lib/i18n';
import type { Locale } from '@/types';
import { Shield, Zap, Lock } from 'lucide-react';
import Image from 'next/image';

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslation(locale);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with language switcher */}
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl mx-auto space-y-16">
          {/* Hero section */}
          <section className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </section>

          {/* File uploader */}
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FileUploader t={t} />
          </section>

          {/* Privacy features */}
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

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{t.footer.openSource}</span>
            <span className="hidden md:inline">•</span>
            <a
              href="https://github.com/yourusername/doc2md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              {t.footer.github}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
