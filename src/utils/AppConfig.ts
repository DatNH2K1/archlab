import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

/** Centralized application configuration */
export const AppConfig = {
  name: 'ArchLab',
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    localePrefix,
  },
};
