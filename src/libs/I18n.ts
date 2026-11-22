import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './I18nRouting';

// NextJS Boilerplate uses Crowdin as the localization software.
// As a developer, you only need to take care of the English (or another default language) version.
// Other languages are automatically generated and handled by Crowdin.

// The localisation files are synced with Crowdin using GitHub Actions.
// By default, there are 3 ways to sync the message files:
// 1. Automatically sync on push to the `main` branch
// 2. Run manually the workflow on GitHub Actions
// 3. Every 24 hours at 5am, the workflow will run automatically

/** Message files of each locale folder, merged into one set of namespaces. */
const MESSAGE_FILES = ['ui', 'game', 'lessons', 'questions', 'flashcards', 'comparisons'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const files = await Promise.all(
    MESSAGE_FILES.map(async (file) => (await import(`../locales/${locale}/${file}.json`)).default),
  );

  return { locale, messages: Object.assign({}, ...files) };
});
