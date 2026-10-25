'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

/** Switches between Vietnamese and English, keeping the current page. */
export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Menu');
  const next = routing.locales.find((item) => item !== locale) ?? routing.defaultLocale;

  return (
    <button
      type="button"
      title={t('switch_language')}
      className="grid size-9 place-items-center rounded-full border border-line font-mono text-xs font-bold uppercase hover:bg-panel-2"
      onClick={() => router.replace(`${pathname}${window.location.search}`, { locale: next })}
    >
      {locale}
    </button>
  );
};
