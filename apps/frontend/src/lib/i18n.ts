import type { Locale } from '@/types';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';

const translations = {
  en,
  zh,
  ja,
  fr,
  de,
} as const;

export function getTranslation(locale: Locale) {
  return translations[locale] || translations.en;
}
