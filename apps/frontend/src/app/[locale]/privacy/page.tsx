import { getTranslation } from '@/lib/i18n';
import type { Locale } from '@/types';
import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export const metadata: Metadata = {
  title: 'Privacy Policy - Doc2MD',
  description: 'Privacy Policy for Doc2MD. We respect your privacy and process files securely without storage.',
};

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslation(locale);
  const lastUpdated = 'December 18, 2025'; // Date can remain hardcoded or moved to config

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">{t.privacyPage?.title || 'Privacy Policy'}</h1>
        <p className="text-muted-foreground">{t.privacyPage?.lastUpdated || `Last updated: ${lastUpdated}`}</p>
      </div>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <p className="lead text-xl text-gray-600 dark:text-gray-300">
            {t.privacyPage?.intro}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{t.privacyPage?.collection?.title}</h2>
          <p>
            {t.privacyPage?.collection?.content}
          </p>
          <p className="mt-2">
            {t.privacyPage?.collection?.data}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{t.privacyPage?.processing?.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t.privacyPage?.processing?.point1}</li>
            <li>{t.privacyPage?.processing?.point2}</li>
            <li>{t.privacyPage?.processing?.point3}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{t.privacyPage?.thirdParty?.title}</h2>
          <p>
            {t.privacyPage?.thirdParty?.content}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{t.privacyPage?.cookies?.title}</h2>
          <p>
            {t.privacyPage?.cookies?.content}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{t.privacyPage?.contact?.title}</h2>
          <p>
            {(t.privacyPage?.contact?.content || '').split('{email}')[0]}
            <a href="mailto:support@doc2md.org" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4">
              support@doc2md.org
            </a>
            {(t.privacyPage?.contact?.content || '').split('{email}')[1]}
          </p>
        </section>
        
      <div className="mt-16 pt-8 border-t text-center">
            <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                &larr; {t.privacyPage?.backHome || 'Back to Home'}
            </Link>
      </div>
      </div>
    </div>
  );
}
