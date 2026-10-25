import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LessonReadBadge } from '@/components/LessonReadBadge';
import { PageShell } from '@/components/PageShell';
import { getLessons } from '@/content';
import { DOMAINS } from '@/content/types';
import type { DomainId } from '@/content/types';
import { Link } from '@/libs/I18nNavigation';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'LessonsPage' });

  return { title: t('title') };
}

export default async function LessonsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('LessonsPage');
  const td = await getTranslations('Domains');
  const lessons = getLessons(locale);

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted">{t('intro')}</p>
      {(Object.keys(DOMAINS) as DomainId[]).map((domain) => (
        <section key={domain} className="mt-10">
          <h2 className="flex items-baseline gap-3 text-xl font-bold">
            <span className="font-mono text-accent">{DOMAINS[domain].code}</span>
            {td(domain)}
            <span className="text-sm font-normal text-muted">{t('weight', { weight: DOMAINS[domain].weight })}</span>
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {lessons
              .filter((lesson) => lesson.domain === domain)
              .map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="flex h-full flex-col rounded-xl border border-line bg-panel p-4 hover:border-accent"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{lesson.title}</span>
                      <LessonReadBadge slug={lesson.slug} />
                    </span>
                    <span className="mt-1 line-clamp-2 text-sm text-muted">{lesson.summary}</span>
                    <span className="mt-auto pt-2 font-mono text-xs text-muted">
                      {t('minutes', { minutes: lesson.minutes })}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
