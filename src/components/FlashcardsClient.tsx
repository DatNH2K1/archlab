'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DomainId, Flashcard } from '@/content/types';
import { DOMAINS } from '@/content/types';
import { updateProgress, useProgress } from '@/libs/Progress';

const MAX_BOX = 4;

/**
 * Reviews flashcards with Leitner boxes: known cards move up and come back less often.
 * @param props All flashcards.
 */
export const FlashcardsClient = (props: { cards: Flashcard[] }) => {
  const t = useTranslations('FlashcardsPage');
  const td = useTranslations('Domains');
  const progress = useProgress();
  const [domain, setDomain] = useState<DomainId | 'all'>('all');
  const [flipped, setFlipped] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);

  const box = (card: Flashcard) => progress.cards[card.id] ?? 0;
  const deck = props.cards
    .filter((card) => domain === 'all' || card.domain === domain)
    .filter((card) => box(card) < MAX_BOX && !skipped.includes(card.id))
    .sort((a, b) => box(a) - box(b));
  const card = deck[0];
  const mastered = props.cards.filter((item) => box(item) >= MAX_BOX).length;

  const answer = (known: boolean) => {
    if (!card) {
      return;
    }

    updateProgress((old) => ({
      ...old,
      cards: { ...old.cards, [card.id]: known ? Math.min(MAX_BOX, (old.cards[card.id] ?? 0) + 1) : 0 },
    }));
    setSkipped([...skipped, card.id]);
    setFlipped(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(DOMAINS)] as (DomainId | 'all')[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-full border px-3 py-1 text-sm ${domain === item ? 'border-accent bg-accent text-ink' : 'border-line hover:bg-panel-2'}`}
            onClick={() => {
              setDomain(item);
              setSkipped([]);
              setFlipped(false);
            }}
          >
            {item === 'all' ? t('all') : td(item)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{t('mastered', { count: mastered, total: props.cards.length })}</p>
      {card ? (
        <>
          <button
            type="button"
            className="mt-4 grid min-h-64 w-full place-items-center rounded-2xl border-2 border-line bg-panel p-8 text-center hover:border-accent"
            onClick={() => setFlipped(!flipped)}
          >
            <span>
              <span className="mb-3 block font-mono text-xs text-muted uppercase">
                {flipped ? t('back') : t('front')} · {t('box', { box: box(card) })}
              </span>
              <span className={`block ${flipped ? 'text-lg leading-8' : 'text-2xl font-bold'}`}>
                {flipped ? card.back : card.front}
              </span>
              {!flipped && <span className="mt-4 block text-sm text-muted">{t('tap_to_flip')}</span>}
            </span>
          </button>
          {flipped && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="rounded-xl border border-bad py-3 font-bold text-bad" onClick={() => answer(false)}>
                {t('again')}
              </button>
              <button type="button" className="rounded-xl bg-good py-3 font-bold text-ink" onClick={() => answer(true)}>
                {t('got_it')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-line bg-panel p-6 text-center">
          <p>{t('deck_done')}</p>
          <button type="button" className="mt-3 rounded-lg bg-accent px-4 py-2 font-bold text-ink" onClick={() => setSkipped([])}>
            {t('again_round')}
          </button>
        </div>
      )}
    </div>
  );
};
