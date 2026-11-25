import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { KeywordCards } from '@/components/lesson/KeywordCards';
import { getLessons, getTipGroups } from '@/content';
import { DOMAINS } from '@/content/types';
import { Link } from '@/libs/I18nNavigation';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'TipsPage' });

  return { title: t('title') };
}

export default async function TipsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('TipsPage');
  const td = await getTranslations('Domains');
  const groups = await getTipGroups(locale);
  const lessonTitles = new Map((await getLessons(locale)).map((lesson) => [lesson.slug, lesson.title]));

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted">{t('intro')}</p>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label={t('jump_to')}>
        {groups.map((group) => (
          <a key={group.id} href={`#${group.id}`} className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent">
            {group.domain && <span className="mr-1.5 font-mono text-accent">{DOMAINS[group.domain].code}</span>}
            {group.title}
          </a>
        ))}
      </nav>
      {groups.map((group) => (
        <section key={group.id} id={group.id} className="mt-12 scroll-mt-20">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            {group.domain ? `${DOMAINS[group.domain].code} · ${td(group.domain)}` : t('general')} · {t('tip_count', { count: group.tips.length })}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{group.title}</h2>
          <p className="mt-2 text-chalk/85">{group.intro}</p>
          <div className="mt-4">
            <KeywordCards keywords={group.tips} />
          </div>
          {group.lessons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {group.lessons.map((slug) => (
                <Link key={slug} href={`/lessons/${slug}`} className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent">
                  📖 {lessonTitles.get(slug) ?? slug}
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </PageShell>
  );
}
