'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Track } from '@/game/rounds';
import { TRACKS } from '@/game/tracks';
import { Link } from '@/libs/I18nNavigation';
import { inLocale } from '@/libs/Localize';
import { useProgress } from '@/libs/Progress';

const LEVELS: Track['difficulty'][] = ['easy', 'medium', 'hard'];

/** Lists the design problems by difficulty, with how many rounds were passed. */
export const TracksClient = () => {
  const t = useTranslations('ScenariosPage');
  const locale = useLocale();
  const progress = useProgress();

  return (
    <div>
      {LEVELS.map((level) => {
        const tracks = TRACKS.filter((track) => track.difficulty === level);

        if (tracks.length === 0) {
          return null;
        }

        return (
          <section key={level} className="mt-10">
            <h2 className="flex items-baseline gap-3 text-xl font-bold">
              {t(level)}
              <span className="text-sm font-normal text-muted">{t('count', { count: tracks.length })}</span>
            </h2>
            <ul className="mt-4 space-y-3">
              {tracks.map((track) => {
                const text = inLocale(track.text, locale);
                const done = track.rounds.filter((round) => progress.stars[round.id]).length;

                return (
                  <li key={track.id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel p-4">
                    <div>
                      <h3 className="text-lg font-bold">{text.title}</h3>
                      <p className="text-sm text-chalk/85">{text.pitch}</p>
                      <p className="mt-1 text-xs text-muted">
                        {t('rounds', { count: track.rounds.length })} · {text.tags.join(', ')}
                        {done > 0 && <span className="text-good"> · {t('done', { done, total: track.rounds.length })}</span>}
                      </p>
                    </div>
                    <Link href={`/scenarios/${track.id}`} className="shrink-0 rounded-lg border border-chalk/70 px-4 py-1.5 font-semibold hover:border-accent hover:text-accent">
                      {t('play')}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
