'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, usePathname } from '@/libs/I18nNavigation';
import { resetProgress } from '@/libs/Progress';
import { Logo } from './Logo';

const ICONS = {
  learn: <path d="M8 5v14l11-7z" />,
  sandbox: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
      <path d="M11 7.5h3.5a2 2 0 0 1 2 2V13" />
    </>
  ),
  lessons: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />,
  practice: (
    <>
      <path d="M9 4h6M9 4a1 1 0 0 0-1 1v1h8V5a1 1 0 0 0-1-1M8 5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  flashcards: (
    <>
      <rect x="3" y="7" width="14" height="12" rx="2" />
      <path d="M7 4h12a2 2 0 0 1 2 2v10" />
    </>
  ),
  scenarios: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </>
  ),
  compare: <path d="M9 4v16M15 4v16M4 8h5M4 12h5M4 16h5M15 8h5M15 12h5M15 16h5" />,
  progress: <path d="M4 19h16M7 16v-4M12 16V8M17 16V5" />,
  how_to_play: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  reset: <path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" />,
} as const;

const ITEMS = [
  { href: '/', key: 'learn' },
  { href: '/scenarios', key: 'scenarios' },
  { href: '/sandbox', key: 'sandbox' },
  { href: '/lessons', key: 'lessons' },
  { href: '/compare', key: 'compare' },
  { href: '/practice', key: 'practice' },
  { href: '/flashcards', key: 'flashcards' },
  { href: '/progress', key: 'progress' },
  { href: '/how-to-play', key: 'how_to_play' },
] as const;

const MenuIcon = (props: { name: keyof typeof ICONS }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0" aria-hidden="true">
    {ICONS[props.name]}
  </svg>
);

/**
 * Opens the side drawer with every page of the app.
 * @param props The title shown next to the menu button.
 */
export const AppMenu = (props: { title: string }) => {
  const t = useTranslations('Menu');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The drawer is portaled to <body>: headers use backdrop-blur, which would trap a fixed child inside them.
  const drawer = (
    <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal="true" aria-label={t('open')}>
      <nav className="flex h-full w-72 max-w-[85vw] flex-col gap-1 border-r border-line bg-panel p-3 shadow-2xl">
        <div className="mb-4 flex items-center justify-between px-2 pt-1">
          <Logo />
          <button type="button" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-panel-2 hover:text-chalk" onClick={() => setOpen(false)} aria-label={t('close')}>
            ✕
          </button>
        </div>
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${
              pathname === item.href ? 'bg-accent/15 text-accent' : 'text-chalk/90 hover:bg-panel-2'
            }`}
          >
            <MenuIcon name={item.key} />
            {t(item.key)}
          </Link>
        ))}
        <div className="mt-auto border-t border-line pt-2">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-bad hover:bg-bad/10"
            onClick={() => {
              if (window.confirm(t('start_over_confirm'))) {
                resetProgress();
                window.location.reload();
              }
            }}
          >
            <MenuIcon name="reset" />
            {t('start_over')}
          </button>
          <p className="px-3 pt-2 text-xs text-muted">{t('credit')}</p>
        </div>
      </nav>
      <button type="button" className="flex-1 bg-black/60 backdrop-blur-[1px]" aria-label={t('close')} onClick={() => setOpen(false)} />
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-semibold hover:bg-panel-2"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="max-w-[40vw] truncate">{props.title}</span>
      </button>
      {open && createPortal(drawer, document.body)}
    </>
  );
};
