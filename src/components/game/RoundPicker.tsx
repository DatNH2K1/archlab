'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Stars } from '@/components/Stars';
import { ROUNDS } from '@/game/rounds';
import type { Round } from '@/game/rounds';
import { Link } from '@/libs/I18nNavigation';
import { inLocale } from '@/libs/Localize';
import { useProgress } from '@/libs/Progress';

/** Returns the Learn chapter of a round, or nothing for design problem rounds. */
const chapterOf = (round: Round | undefined) => ROUNDS.find((item) => item.id === round?.id)?.chapter;

/**
 * Shows the current round number and opens a list to jump to any round of the sequence.
 * @param props The rounds in order, the current one and how to link to a round.
 */
export const RoundPicker = (props: { sequence: Round[]; current: Round; roundHref: (id: string) => string }) => {
  const t = useTranslations('Game');
  const tc = useTranslations('Chapters');
  const locale = useLocale();
  const progress = useProgress();
  const [open, setOpen] = useState(false);

  // Portaled to <body>: the header uses backdrop-blur, which would trap a fixed child inside it.
  const list = (
    <div className="fixed inset-0 z-[100]">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t('pick_round_close')} onClick={() => setOpen(false)} />
      <nav
        aria-label={t('pick_round')}
        className="absolute top-14 right-3 left-3 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-panel p-2 shadow-2xl sm:right-auto sm:w-96"
      >
        <ol>
          {props.sequence.map((round, index) => {
            const chapter = chapterOf(round);
            const newChapter = chapter && chapter !== chapterOf(props.sequence[index - 1]);

            return (
              <li key={round.id}>
                {newChapter && <p className="px-3 pt-3 pb-1 text-xs font-bold tracking-widest text-muted uppercase">{tc(chapter)}</p>}
                <Link
                  href={props.roundHref(round.id)}
                  onClick={() => setOpen(false)}
                  aria-current={round === props.current ? 'step' : undefined}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                    round === props.current ? 'bg-accent/15 text-accent' : 'hover:bg-panel-2'
                  }`}
                >
                  <span>
                    <span className="mr-2 font-mono text-muted">{index + 1}</span>
                    {inLocale(round.text, locale).title}
                  </span>
                  <Stars count={progress.stars[round.id] ?? 0} />
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="rounded-lg px-1 text-left hover:bg-panel-2"
        onClick={() => setOpen(true)}
        aria-label={t('pick_round')}
        aria-expanded={open}
      >
        <span className="block text-[10px] font-bold tracking-widest text-muted">{t('round')} ▾</span>
        <span className="block text-xl leading-6 font-bold">
          {props.sequence.indexOf(props.current) + 1}
          <span className="text-sm font-normal text-muted">/{props.sequence.length}</span>
        </span>
      </button>
      {open && createPortal(list, document.body)}
    </>
  );
};
