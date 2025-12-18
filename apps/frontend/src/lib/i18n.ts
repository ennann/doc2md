import type { Locale } from '@/types';
import en from '@/locales/en.json';
import zhCn from '@/locales/zh-cn.json';
import zhHk from '@/locales/zh-hk.json';
import zhTw from '@/locales/zh-tw.json';
import ja from '@/locales/ja.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import ptBr from '@/locales/pt-br.json';
import ko from '@/locales/ko.json';
import it from '@/locales/it.json';

const translations = {
  en,
  'zh-cn': zhCn,
  'zh-hk': zhHk,
  'zh-tw': zhTw,
  ja,
  fr,
  de,
  es,
  'pt-br': ptBr,
  ko,
  it,
} as const;

export function getTranslation(locale: Locale) {
  return translations[locale] || translations.en;
}
