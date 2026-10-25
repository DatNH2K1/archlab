'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Round } from '@/game/rounds';
import { Link } from '@/libs/I18nNavigation';
import { inLocale } from '@/libs/Localize';

/**
 * Briefs the player on a round: the story, the goals and the twist.
 * @param props The round, its number and the start handler.
 */
export const RoundIntro = (props: { round: Round; number: number; heading: string; onStart: () => void }) => {
  const t = useTranslations('Intro');
  const locale = useLocale();
  const text = inLocale(props.round.text, locale);
  const tt = useTranslations('Twists');
  const tq = useTranslations('Requirements');
  const tl = useTranslations('LessonTitles');
  const tg = useTranslations('Game');
  const { round } = props;
  const s = round.scenario;
  const split = Object.entries(s.audience)
    .filter(([, share]) => share > 0)
    .map(([region, share]) => `${region} ${Math.round(share * 100)}%`);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4">
      <section className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          {props.heading} · {t('round', { number: props.number })}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{text.title}</h2>
        <p className="mt-3 text-chalk/90">{text.story}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-panel-2 p-2">
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">{t('traffic')}</dt>
            <dd className="font-mono">{s.traffic} req/s</dd>
          </div>
          <div className="rounded-lg bg-panel-2 p-2">
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">{t('latency')}</dt>
            <dd className="font-mono">≤{s.latencyTarget} ms</dd>
          </div>
          <div className="rounded-lg bg-panel-2 p-2">
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">{t('budget')}</dt>
            <dd className="font-mono">
              ${s.budget ?? '∞'}
              {tg('per_month')}
            </dd>
          </div>
        </dl>
        {split.length > 1 && <p className="mt-3 text-sm text-info">🌏 {t('audience', { split: split.join(' · ') })}</p>}
        {s.twist && (
          <p className="mt-3 rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm">
            <span className="font-bold text-warn">{t('heads_up')} </span>
            {tt(`${s.twist}.heads_up`, { region: s.outageRegion ?? '' })}
          </p>
        )}
        {s.requirements.length > 0 && (
          <div className="mt-3">
            <h3 className="text-xs font-bold tracking-wider text-muted uppercase">{t('rules')}</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {s.requirements.map((id) => (
                <li key={id}>
                  🔒 <strong>{tq(`${id}.title`)}</strong> — {tq(`${id}.desc`)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-sm">
          <span className="font-bold text-accent">{t('concept')} </span>
          {text.concept}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {round.lessons.map((slug) => (
            <Link key={slug} href={`/lessons/${slug}`} className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent">
              📖 {tl(slug)}
            </Link>
          ))}
        </div>
        <button type="button" className="mt-6 w-full rounded-xl bg-accent py-2.5 font-bold text-ink" onClick={props.onStart}>
          {t('start')}
        </button>
      </section>
    </div>
  );
};
