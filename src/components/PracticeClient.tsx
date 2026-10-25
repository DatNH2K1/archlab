'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Checkbox } from '@/components/Checkbox';
import type { DomainId, Question } from '@/content/types';
import { DOMAINS } from '@/content/types';
import { Link } from '@/libs/I18nNavigation';
import { updateProgress, useProgress } from '@/libs/Progress';

const EXAM_SIZE = 65;
const EXAM_MINUTES = 130;

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }

  return copy;
};

/** Picks exam questions in proportion to the official domain weights. */
const buildExam = (questions: Question[]) =>
  shuffle(
    (Object.keys(DOMAINS) as DomainId[]).flatMap((domain) =>
      shuffle(questions.filter((question) => question.domain === domain)).slice(
        0,
        Math.round((EXAM_SIZE * DOMAINS[domain].weight) / 100),
      ),
    ),
  );

const sameAnswer = (a: number[], b: number[]) => a.length === b.length && a.every((value) => b.includes(value));

type Session = { mode: 'practice' | 'exam'; items: Question[]; index: number; picks: Record<string, number[]>; revealed: boolean; startedAt: number; finished: boolean };

/**
 * Reads the lesson filter from the URL and restarts practice when it changes.
 * @param props All questions and lesson titles.
 */
export const PracticeClient = (props: { questions: Question[]; lessonTitles: Record<string, string> }) => {
  const lesson = useSearchParams().get('lesson') ?? undefined;

  return <Practice key={lesson ?? 'all'} questions={props.questions} lessonTitles={props.lessonTitles} lesson={lesson} />;
};

/**
 * Runs practice sets with instant feedback, or a timed mock exam.
 * @param props All questions, lesson titles and an optional lesson filter.
 */
const Practice = (props: { questions: Question[]; lessonTitles: Record<string, string>; lesson?: string }) => {
  const t = useTranslations('PracticePage');
  const td = useTranslations('Domains');
  const progress = useProgress();
  const [domain, setDomain] = useState<DomainId | 'all'>('all');
  const [onlyMissed, setOnlyMissed] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const pool = props.questions.filter(
    (question) =>
      (!props.lesson || question.lesson === props.lesson) &&
      (domain === 'all' || question.domain === domain) &&
      (!onlyMissed || progress.answers[question.id] === false),
  );

  const answered = Object.keys(progress.answers).length;
  const correct = Object.values(progress.answers).filter(Boolean).length;

  if (!session) {
    return (
      <div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="text-xs text-muted uppercase">{t('answered')}</div>
            <div className="font-mono text-2xl">
              {answered}/{props.questions.length}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="text-xs text-muted uppercase">{t('accuracy')}</div>
            <div className="font-mono text-2xl">{answered ? Math.round((correct / answered) * 100) : 0}%</div>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="text-xs text-muted uppercase">{t('pass_mark')}</div>
            <div className="font-mono text-2xl">720/1000</div>
          </div>
        </div>
        {props.lesson && (
          <p className="mt-6 rounded-lg bg-panel-2 p-3 text-sm">
            {t('filtered_by_lesson', { lesson: props.lessonTitles[props.lesson] ?? props.lesson })}{' '}
            <Link href="/practice" className="text-accent underline">
              {t('clear_filter')}
            </Link>
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {(['all', ...Object.keys(DOMAINS)] as (DomainId | 'all')[]).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-full border px-3 py-1 text-sm ${domain === item ? 'border-accent bg-accent text-ink' : 'border-line hover:bg-panel-2'}`}
              onClick={() => setDomain(item)}
            >
              {item === 'all' ? t('all_domains') : `${DOMAINS[item].code} ${td(item)}`}
            </button>
          ))}
        </div>
        <Checkbox className="mt-3 text-sm" label={t('only_missed')} checked={onlyMissed} onChange={setOnlyMissed} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={pool.length === 0}
            className="rounded-xl border border-accent bg-accent/10 p-5 text-left hover:bg-accent/20 disabled:opacity-40"
            onClick={() => setSession({ mode: 'practice', items: shuffle(pool), index: 0, picks: {}, revealed: false, startedAt: Date.now(), finished: false })}
          >
            <div className="text-lg font-bold">{t('practice_mode')}</div>
            <div className="text-sm text-muted">{t('practice_mode_desc', { count: pool.length })}</div>
          </button>
          <button
            type="button"
            className="rounded-xl border border-line bg-panel p-5 text-left hover:border-accent"
            onClick={() => {
              const startedAt = Date.now();

              setNow(startedAt);
              setSession({ mode: 'exam', items: buildExam(props.questions), index: 0, picks: {}, revealed: false, startedAt, finished: false });
              const tick = window.setInterval(() => setNow(Date.now()), 1000);

              window.setTimeout(() => window.clearInterval(tick), EXAM_MINUTES * 60 * 1000);
            }}
          >
            <div className="text-lg font-bold">{t('exam_mode')}</div>
            <div className="text-sm text-muted">{t('exam_mode_desc', { count: EXAM_SIZE, minutes: EXAM_MINUTES })}</div>
          </button>
        </div>
      </div>
    );
  }

  const record = (question: Question, pick: number[]) =>
    updateProgress((old) => ({ ...old, answers: { ...old.answers, [question.id]: sameAnswer(pick, question.answer) } }));

  if (session.finished) {
    const results = session.items.map((question) => sameAnswer(session.picks[question.id] ?? [], question.answer));
    const score = results.filter(Boolean).length;
    const scaled = Math.round(100 + (score / session.items.length) * 900);

    return (
      <div>
        <h2 className="text-2xl font-bold">{t('result_title')}</h2>
        <p className={`mt-2 text-4xl font-bold ${scaled >= 720 ? 'text-good' : 'text-bad'}`}>
          {scaled}/1000 <span className="text-base text-muted">({score}/{session.items.length})</span>
        </p>
        <p className="mt-1 text-sm text-muted">{t('scaled_note')}</p>
        <ul className="mt-6 space-y-2">
          {(Object.keys(DOMAINS) as DomainId[]).map((item) => {
            const inDomain = session.items.map((question, i) => ({ question, ok: results[i] })).filter((entry) => entry.question.domain === item);
            const ok = inDomain.filter((entry) => entry.ok).length;

            return (
              <li key={item} className="flex justify-between rounded-lg bg-panel p-3 text-sm">
                <span>{td(item)}</span>
                <span className="font-mono">
                  {ok}/{inDomain.length}
                </span>
              </li>
            );
          })}
        </ul>
        <h3 className="mt-8 font-bold">{t('review')}</h3>
        <ol className="mt-3 space-y-4">
          {session.items.map((question, i) =>
            results[i] ? null : (
              <li key={question.id} className="rounded-xl border border-line bg-panel p-4 text-sm">
                <p className="font-semibold">{question.stem}</p>
                <p className="mt-2 text-good">✓ {question.answer.map((a) => question.options[a]).join(' / ')}</p>
                <p className="mt-2 text-chalk/80">{question.explanation}</p>
              </li>
            ),
          )}
        </ol>
        <button type="button" className="mt-6 rounded-lg bg-accent px-4 py-2 font-bold text-ink" onClick={() => setSession(null)}>
          {t('back')}
        </button>
      </div>
    );
  }

  const question = session.items[session.index];

  if (!question) {
    return null;
  }

  const pick = session.picks[question.id] ?? [];
  const multi = question.answer.length > 1;
  const isExam = session.mode === 'exam';
  const remaining = Math.max(0, EXAM_MINUTES * 60 - Math.floor((now - session.startedAt) / 1000));
  const last = session.index === session.items.length - 1;

  const toggle = (option: number) => {
    if (session.revealed) {
      return;
    }

    const next = multi
      ? pick.includes(option)
        ? pick.filter((value) => value !== option)
        : [...pick, option].slice(-question.answer.length)
      : [option];

    setSession({ ...session, picks: { ...session.picks, [question.id]: next } });
  };

  const finishExam = () => {
    for (const item of session.items) {
      record(item, session.picks[item.id] ?? []);
    }

    setSession({ ...session, finished: true });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          {t('question_of', { index: session.index + 1, total: session.items.length })} · {DOMAINS[question.domain].code}
        </span>
        {isExam && (
          <span className={`font-mono ${remaining < 600 ? 'text-bad' : ''}`}>
            ⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        )}
        <button type="button" className="hover:text-chalk" onClick={() => (isExam ? finishExam() : setSession(null))}>
          {isExam ? t('submit_exam') : t('quit')}
        </button>
      </div>
      <p className="text-lg leading-8">{question.stem}</p>
      <ul className="mt-4 space-y-2">
        {question.options.map((option, i) => {
          const chosen = pick.includes(i);
          const right = question.answer.includes(i);
          const tone = session.revealed
            ? right
              ? 'border-good bg-good/10'
              : chosen
                ? 'border-bad bg-bad/10'
                : 'border-line'
            : chosen
              ? 'border-accent bg-accent/10'
              : 'border-line hover:border-chalk/50';

          return (
            <li key={option}>
              <button type="button" className={`flex w-full gap-3 rounded-xl border p-3 text-left ${tone}`} onClick={() => toggle(i)}>
                <span className="font-mono font-bold">{String.fromCharCode(65 + i)}.</span>
                <span>{option}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {session.revealed && (
        <div className={`mt-4 rounded-xl p-4 text-sm ${sameAnswer(pick, question.answer) ? 'bg-good/10' : 'bg-bad/10'}`}>
          <p className="font-bold">{sameAnswer(pick, question.answer) ? t('correct') : t('incorrect')}</p>
          <p className="mt-2 leading-6">{question.explanation}</p>
          <Link href={`/lessons/${question.lesson}`} className="mt-2 inline-block text-accent underline">
            📖 {props.lessonTitles[question.lesson] ?? question.lesson}
          </Link>
        </div>
      )}
      <div className="mt-6 flex justify-between gap-2">
        <button
          type="button"
          disabled={session.index === 0 || !isExam}
          className="rounded-lg border border-line px-4 py-2 disabled:opacity-0"
          onClick={() => setSession({ ...session, index: session.index - 1 })}
        >
          ← {t('previous')}
        </button>
        {!isExam && !session.revealed ? (
          <button
            type="button"
            disabled={pick.length !== question.answer.length}
            className="rounded-lg bg-accent px-5 py-2 font-bold text-ink disabled:opacity-40"
            onClick={() => {
              record(question, pick);
              setSession({ ...session, revealed: true });
            }}
          >
            {t('check')}
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg bg-accent px-5 py-2 font-bold text-ink"
            onClick={() => {
              if (last) {
                if (isExam) {
                  finishExam();
                } else {
                  setSession(null);
                }
              } else {
                setSession({ ...session, index: session.index + 1, revealed: false });
              }
            }}
          >
            {last ? (isExam ? t('submit_exam') : t('done')) : `${t('next')} →`}
          </button>
        )}
      </div>
    </div>
  );
};
