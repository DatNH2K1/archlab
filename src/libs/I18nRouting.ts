import { defineRouting } from 'next-intl/routing';
import { AppConfig } from '@/utils/AppConfig';

export const routing = defineRouting({
  locales: AppConfig.i18n.locales,
  localePrefix: AppConfig.i18n.localePrefix,
  defaultLocale: AppConfig.i18n.defaultLocale,
  // Vietnamese by default; the language button switches and remembers the choice.
  localeDetection: false,
});
