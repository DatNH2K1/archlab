import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
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
      <div className="mt-8 grid items-start gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-20 rounded-xl border border-line bg-panel p-4">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              {group.domain ? `${DOMAINS[group.domain].code} · ${td(group.domain)}` : t('general')}
            </p>
            <h2 className="mt-1 text-xl font-bold">{group.title}</h2>
            <p className="mt-1 text-sm text-muted">{group.intro}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm marker:text-accent">
              {group.tips.map((tip) => (
                <li key={tip.when}>
                  <span className="font-semibold">{tip.when}</span> <span className="text-muted">→</span>{' '}
                  <span className="font-semibold text-accent">{tip.pick}</span>
                </li>
              ))}
            </ul>
            {group.lessons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.lessons.map((slug) => (
                  <Link key={slug} href={`/lessons/${slug}`} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-chalk">
                    📖 {lessonTitles.get(slug) ?? slug}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
