import type { routing } from '@/libs/I18nRouting';
import type comparisons from '@/locales/vi/comparisons.json';
import type flashcards from '@/locales/vi/flashcards.json';
import type game from '@/locales/vi/game.json';
import type lessons from '@/locales/vi/lessons.json';
import type questions from '@/locales/vi/questions.json';
import type tips from '@/locales/vi/tips.json';
import type ui from '@/locales/vi/ui.json';

declare module 'next-intl' {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof ui & typeof game & typeof lessons & typeof questions & typeof flashcards & typeof comparisons & typeof tips;
  }
}
