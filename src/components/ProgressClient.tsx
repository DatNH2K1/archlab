'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CHAPTERS, ROUNDS } from '@/game/rounds';
import type { Round } from '@/game/rounds';
import { ALL_ROUNDS, roundHref, TRACKS } from '@/game/tracks';
import { Link } from '@/libs/I18nNavigation';
import { inLocale } from '@/libs/Localize';
import { useProgress } from '@/libs/Progress';
import { Stars } from './Stars';

const RoundRow = (props: { round: Round; number: number; stars: number; playLabel: string }) => {
  const locale = useLocale();

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
      <span>
        <span className="mr-2 font-mono text-muted">{props.number}</span>
        {inLocale(props.round.text, locale).title}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <Stars count={props.stars} />
        <Link href={roundHref(props.round.id)} className="rounded-lg border border-line px-3 py-1 text-sm font-semibold hover:border-accent">
          {props.playLabel}
        </Link>
      </span>
    </li>
  );
};

/**
 * Shows stars per round, lessons read and quiz accuracy.
 * @param props Totals of the study content.
 */
export const ProgressClient = (props: { lessonCount: number; questionCount: number; cardCount: number }) => {
  const t = useTranslations('ProgressPage');
  const tc = useTranslations('Chapters');
  const locale = useLocale();
  const progress = useProgress();
  const stars = ALL_ROUNDS.reduce((acc, round) => acc + (progress.stars[round.id] ?? 0), 0);
  const passed = ALL_ROUNDS.filter((round) => progress.stars[round.id]).length;
  const answered = Object.values(progress.answers);
  const accuracy = answered.length ? Math.round((answered.filter(Boolean).length / answered.length) * 100) : 0;
  const mastered = Object.values(progress.cards).filter((box) => box >= 4).length;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          [t('rounds_passed'), `${passed}/${ALL_ROUNDS.length}`],
          [t('stars'), `${stars}/${ALL_ROUNDS.length * 3}`],
          [t('lessons'), `${progress.lessonsRead.length}/${props.lessonCount}`],
          [t('quiz'), `${answered.length}/${props.questionCount} · ${accuracy}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-4">
            <div className="text-xs text-muted uppercase">{label}</div>
            <div className="font-mono text-xl">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{t('cards_line', { count: mastered, total: props.cardCount })}</p>

      <h2 className="mt-10 text-2xl font-bold">{t('learn_title')}</h2>
      {CHAPTERS.map((chapter, chapterIndex) => (
        <section key={chapter} className="mt-6">
          <h3 className="font-bold">
            {t('chapter', { number: chapterIndex + 1 })} · {tc(chapter)}
          </h3>
          <ul className="mt-3 space-y-2">
            {ROUNDS.filter((round) => round.chapter === chapter).map((round) => (
              <RoundRow key={round.id} round={round} number={ROUNDS.indexOf(round) + 1} stars={progress.stars[round.id] ?? 0} playLabel={t('play')} />
            ))}
          </ul>
        </section>
      ))}

      {TRACKS.length > 0 && <h2 className="mt-12 text-2xl font-bold">{t('tracks_title')}</h2>}
      {TRACKS.map((track) => (
        <section key={track.id} className="mt-6">
          <h3 className="font-bold">{inLocale(track.text, locale).title}</h3>
          <ul className="mt-3 space-y-2">
            {track.rounds.map((round, i) => (
              <RoundRow key={round.id} round={round} number={i + 1} stars={progress.stars[round.id] ?? 0} playLabel={t('play')} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
