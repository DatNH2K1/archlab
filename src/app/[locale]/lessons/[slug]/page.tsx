import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkReadButton } from '@/components/LessonReadBadge';
import { PageShell } from '@/components/PageShell';
import { getLessons, getQuestions } from '@/content';
import { DOMAINS } from '@/content/types';
import { ALL_ROUNDS, roundHref } from '@/game/tracks';
import { inLocale } from '@/libs/Localize';
import { Link } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

type LessonPageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getLessons(locale).map((lesson) => ({ locale, slug: lesson.slug })));
}

export async function generateMetadata(props: LessonPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const lesson = getLessons(locale).find((item) => item.slug === slug);

  return { title: lesson?.title, description: lesson?.summary };
}

export default async function LessonPage(props: LessonPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('LessonsPage');
  const td = await getTranslations('Domains');
  const lessons = getLessons(locale);
  const index = lessons.findIndex((item) => item.slug === slug);
  const lesson = lessons[index];

  if (!lesson) {
    notFound();
  }

  const questionCount = getQuestions(locale).filter((question) => question.lesson === slug).length;
  const rounds = ALL_ROUNDS.filter((round) => round.lessons.some((item) => item === slug));
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <PageShell title={t('title')}>
      <Link href="/lessons" className="text-sm text-muted hover:text-chalk">
        ← {t('all_lessons')}
      </Link>
      <p className="mt-4 font-mono text-xs tracking-widest text-accent uppercase">
        {DOMAINS[lesson.domain].code} · {td(lesson.domain)} · {t('minutes', { minutes: lesson.minutes })}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-lg text-muted">{lesson.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {lesson.services.map((service) => (
          <span key={service} className="rounded-full border border-line px-2 py-0.5 text-xs">
            {service}
          </span>
        ))}
      </div>
      {rounds.length > 0 && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <p className="text-sm font-semibold">🎮 {t('practice_on_board')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {rounds.map((round) => (
              <Link key={round.id} href={roundHref(round.id)} className="rounded-lg bg-accent px-3 py-1 text-sm font-bold text-ink">
                {inLocale(round.text, locale).title}
              </Link>
            ))}
          </div>
        </div>
      )}
      <article className="prose-lesson mt-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.body}</ReactMarkdown>
      </article>
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t('keywords')}</h2>
        <p className="text-sm text-muted">{t('keywords_intro')}</p>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {lesson.keywords.map((keyword) => (
              <tr key={keyword.trigger} className="border-b border-line">
                <td className="py-2 pr-4 text-chalk/80 italic">“{keyword.trigger}”</td>
                <td className="py-2 font-semibold text-accent">→ {keyword.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold">{t('traps')}</h2>
        <ul className="mt-3 space-y-2">
          {lesson.traps.map((trap) => (
            <li key={trap} className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm">
              ⚠️ {trap}
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <MarkReadButton slug={lesson.slug} />
        {questionCount > 0 && (
          <Link href={`/practice?lesson=${lesson.slug}`} className="rounded-lg border border-line px-4 py-2 font-semibold hover:bg-panel-2">
            {t('practice_questions', { count: questionCount })}
          </Link>
        )}
      </div>
      <nav className="mt-10 flex justify-between gap-4 border-t border-line pt-4 text-sm">
        {previous ? (
          <Link href={`/lessons/${previous.slug}`} className="hover:text-accent">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/lessons/${next.slug}`} className="text-right hover:text-accent">
            {next.title} →
          </Link>
        )}
      </nav>
    </PageShell>
  );
}
