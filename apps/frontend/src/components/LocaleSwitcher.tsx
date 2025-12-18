'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import type { Locale } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const locales: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'us' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'zh', label: '中文', flag: 'cn' },
  { code: 'ja', label: '日本語', flag: 'jp' },
];

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export default function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] === currentLocale) {
      segments[0] = newLocale;
    }
    const newPath = `/${segments.join('/')}`;
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocaleData = locales.find((l) => l.code === currentLocale);

  return (
    <div className="relative" ref={switcherRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border rounded-md"
        aria-label="Change language"
      >
        {currentLocaleData && (
             <Image 
                src={`/flagpedia/${currentLocaleData.flag}.png`}
                alt={currentLocaleData.label}
                width={20}
                height={15}
                className="rounded-sm object-cover"
             />
        )}
        <span className="hidden sm:inline">
          {currentLocaleData?.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] overflow-hidden rounded-md border bg-background shadow-md animate-fade-in">
            <div className="p-1">
              {locales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                    currentLocale === locale.code && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Image 
                    src={`/flagpedia/${locale.flag}.png`}
                    alt={locale.label}
                    width={20}
                    height={15}
                    className="rounded-sm object-cover"
                   />
                  {locale.label}
                </button>
              ))}
            </div>
          </div>
      )}
    </div>
  );
}
