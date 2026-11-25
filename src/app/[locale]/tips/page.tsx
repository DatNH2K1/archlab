import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { TipCard } from '@/components/TipCard';
import { getLessons, getTipGroups, getTrapGroups } from '@/content';
import { DOMAINS } from '@/content/types';
import type { DomainId, LessonSlug } from '@/content/types';

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
  const trapGroups = await getTrapGroups(locale);
  const lessonTitles = new Map((await getLessons(locale)).map((lesson) => [lesson.slug, lesson.title]));
  const label = (domain?: DomainId) => (domain ? `${DOMAINS[domain].code} · ${td(domain)}` : t('general'));
  const lessons = (slugs: LessonSlug[]) => slugs.map((slug) => ({ slug, title: lessonTitles.get(slug) ?? slug }));

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
        <a href="#traps" className="rounded-full border border-bad/50 px-3 py-1 text-xs text-bad hover:border-bad">
          ⚠ {t('traps_title')}
        </a>
      </nav>
      <div className="mt-8 grid items-start gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <TipCard key={group.id} id={group.id} label={label(group.domain)} title={group.title} intro={group.intro} lessons={lessons(group.lessons)}>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm marker:text-accent">
              {group.tips.map((tip) => (
                <li key={tip.when}>
                  <span className="font-semibold">{tip.when}</span> <span className="text-muted">→</span>{' '}
                  <span className="font-semibold text-accent">{tip.pick}</span>
                </li>
              ))}
            </ul>
          </TipCard>
        ))}
      </div>
      <h2 id="traps" className="mt-14 scroll-mt-20 text-2xl font-bold">
        ⚠ {t('traps_title')}
      </h2>
      <p className="mt-2 text-muted">{t('traps_intro')}</p>
      <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
        {trapGroups.map((group) => (
          <TipCard key={group.id} id={`traps-${group.id}`} label={label(group.domain)} title={group.title} lessons={lessons(group.lessons)}>
            <ul className="mt-3 space-y-2.5 text-sm">
              {group.traps.map((item) => (
                <li key={item.trap}>
                  <p className="text-chalk/80">
                    <span className="mr-1.5 font-bold text-bad">✗</span>
                    {item.trap}
                  </p>
                  <p className="mt-0.5">
                    <span className="mr-1.5 font-bold text-good">✓</span>
                    <span className="font-semibold">{item.fact}</span>
                  </p>
                </li>
              ))}
            </ul>
          </TipCard>
        ))}
      </div>
    </PageShell>
  );
}
