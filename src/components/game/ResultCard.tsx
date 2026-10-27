'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CATALOG } from '@/game/catalog';
import type { Board, Scenario, SimResult } from '@/game/types';
import { RunChart } from './RunChart';

const Check = (props: { ok: boolean; label: string; value: string }) => (
  <li className="flex items-center justify-between gap-3 py-1">
    <span className="flex items-center gap-2">
      <span className={`grid size-5 place-items-center rounded-full text-xs font-bold text-ink ${props.ok ? 'bg-good' : 'bg-bad'}`}>
        {props.ok ? '✓' : '✕'}
      </span>
      {props.label}
    </span>
    <span className="font-mono text-sm">{props.value}</span>
  </li>
);

/**
 * Shows the score of a finished run, the stars and what to do next.
 * @param props The result, round goals and actions.
 */
export const ResultCard = (props: {
  result: SimResult;
  scenario: Scenario;
  board: Board;
  stars: number;
  describeIssue: (index: number) => string;
  onRetry: () => void;
  onNext?: () => void;
  hint?: React.ReactNode;
}) => {
  const t = useTranslations('Result');
  const tr = useTranslations('Requirements');
  const [details, setDetails] = useState(false);
  const { result, scenario } = props;
  const nodeName = (id: string) => {
    const node = props.board.nodes.find((item) => item.id === id);

    return node ? CATALOG[node.type].label : id;
  };

  return (
    <section className="w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-line bg-panel/95 p-4 shadow-2xl backdrop-blur">
      <header className="mb-2 flex items-center justify-between">
        <h2 className={`text-lg font-bold ${result.passed ? 'text-good' : 'text-bad'}`}>
          {result.passed ? t('passed') : t('failed')}
        </h2>
        {result.passed && (
          <span className="text-xl tracking-widest text-accent" aria-label={t('stars', { count: props.stars })}>
            {'★'.repeat(props.stars)}
            <span className="text-line">{'★'.repeat(3 - props.stars)}</span>
          </span>
        )}
      </header>
      <ul className="text-sm">
        <Check ok={result.checks.answered} label={t('answered')} value={`${(result.answered * 100).toFixed(1)}% / ≥99%`} />
        <Check ok={result.checks.latency} label={t('latency')} value={`${result.avgLatency} ms / ≤${scenario.latencyTarget} ms`} />
        {scenario.budget !== undefined && (
          <Check ok={result.checks.cost} label={t('cost')} value={`$${result.cost.toFixed(0)} / $${scenario.budget}`} />
        )}
        <Check ok={result.checks.integrity} label={t('integrity')} value="" />
        {result.checks.requirements.map((check) => (
          <Check key={check.id} ok={check.ok} label={tr(`${check.id}.title`)} value="" />
        ))}
      </ul>
      {!result.passed && result.issues[0] && (
        <p className="mt-2 rounded-lg bg-bad/10 p-2 text-sm text-chalk">{props.describeIssue(0)}</p>
      )}
      {result.passed && props.stars < 3 && <p className="mt-2 text-sm text-muted">{t('cheaper')}</p>}
      {props.hint}
      {details && (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <RunChart
            ticks={result.ticks}
            latencyTarget={scenario.latencyTarget}
            labels={{ answered: t('chart_answered'), latency: t('chart_latency'), twist: t('chart_twist') }}
          />
          {result.issues.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">{t('all_issues')}</h3>
              <ul className="space-y-1 text-sm">
                {result.issues.slice(0, 6).map((issue, i) => (
                  <li key={`${issue.code}-${issue.nodeId}`}>• {props.describeIssue(i)}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">{t('cost_breakdown')}</h3>
            <ul className="grid grid-cols-2 gap-x-4 font-mono text-xs">
              {Object.entries(result.costByNode)
                .filter(([, cost]) => cost > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([id, cost]) => (
                  <li key={id} className="flex justify-between">
                    <span className="truncate">{nodeName(id)}</span>
                    <span>${cost.toFixed(1)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
      <footer className="mt-3 flex flex-wrap gap-2">
        {props.onNext && (
          <button type="button" className="rounded-lg bg-accent px-4 py-1.5 font-bold text-ink" onClick={props.onNext}>
            {t('next')} →
          </button>
        )}
        <button type="button" className="rounded-lg border border-line px-4 py-1.5 font-semibold hover:bg-panel-2" onClick={props.onRetry}>
          {t('edit')}
        </button>
        <button type="button" className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-chalk" onClick={() => setDetails(!details)}>
          {details ? t('hide_details') : t('see_what_happened')}
        </button>
      </footer>
    </section>
  );
};
