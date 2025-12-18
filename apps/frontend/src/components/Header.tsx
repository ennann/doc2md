import Link from 'next/link';
import Image from 'next/image';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import type { Locale } from '@/types';

interface HeaderProps {
  locale: Locale;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-4xl">
        <Link 
          href={`/${locale}`} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/favorite.png"
            alt="Doc2MD Logo"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-lg font-semibold">Doc2MD</span>
        </Link>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
