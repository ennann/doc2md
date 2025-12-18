import { getTranslation } from '@/lib/i18n';
import type { Locale } from '@/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, FileQuestion, ShieldCheck, Mail, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support & FAQ - Doc2MD',
  description: 'Frequently asked questions and support contact for Doc2MD.',
};

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslation(locale);

  const faqs = [
    {
      question: t.supportPage?.faqs?.free?.q,
      answer: t.supportPage?.faqs?.free?.a
    },
    {
      question: t.supportPage?.faqs?.formats?.q,
      answer: t.supportPage?.faqs?.formats?.a
    },
    {
      question: t.supportPage?.faqs?.security?.q,
      answer: t.supportPage?.faqs?.security?.a
    },
    {
      question: t.supportPage?.faqs?.speed?.q,
      answer: t.supportPage?.faqs?.speed?.a
    },
    {
      question: t.supportPage?.faqs?.batch?.q,
      answer: t.supportPage?.faqs?.batch?.a
    },
    {
      question: t.supportPage?.faqs?.offline?.q,
      answer: (
          <>
            {(t.supportPage?.faqs?.offline?.a || '').split('{link}')[0]}
            <a href="https://github.com/ennann/doc2md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              GitHub
            </a>
            {(t.supportPage?.faqs?.offline?.a || '').split('{link}')[1]}
          </>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            {t.supportPage?.title || 'Support & FAQ'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.supportPage?.subtitle}
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FileQuestion className="w-6 h-6 text-gray-500" />
                    {t.supportPage?.faqTitle}
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                    <details key={index} className="group border rounded-lg bg-card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <h3 className="font-medium">{faq.question}</h3>
                            <ChevronDown className="w-5 h-5 transition group-open:-rotate-180" />
                        </summary>
                        <div className="px-4 py-4 text-gray-600 dark:text-gray-300 leading-relaxed border-t bg-white dark:bg-gray-950">
                            {faq.answer}
                        </div>
                    </details>
                    ))}
                </div>
            </section>
        </div>

        <div className="space-y-8 md:mt-14">
            <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    {t.supportPage?.privacyTitle}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    {t.supportPage?.privacyText}
                </p>
                 <Link href={`/${locale}/privacy`} className="text-sm font-medium text-blue-600 hover:underline">
                    {t.supportPage?.readPrivacy} &rarr;
                </Link>
            </section>

            <section className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <Mail className="w-5 h-5" />
                    {t.supportPage?.contactTitle}
                </h2>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-6">
                    {t.supportPage?.contactText}
                </p>
                <a 
                    href="mailto:support@doc2md.org" 
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200"
                >
                    <Mail className="w-4 h-4" />
                    support@doc2md.org
                </a>
            </section>
        </div>
      </div>
    
      <div className="mt-16 pt-8 border-t text-center">
            <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                &larr; {t.privacyPage?.backHome || 'Back to Home'}
            </Link>
      </div>
    </div>
  );
}
