import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { KeywordCards } from '@/components/lesson/KeywordCards';
import { LessonMarkdown } from '@/components/lesson/LessonMarkdown';
import { getComparisons, getLessons } from '@/content';
import { DOMAINS } from '@/content/types';
import type { DomainId } from '@/content/types';
import { Link } from '@/libs/I18nNavigation';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ComparePage' });

  return { title: t('title') };
}

export default async function ComparePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('ComparePage');
  const td = await getTranslations('Domains');
  const comparisons = getComparisons(locale);
  const lessonTitles = new Map(getLessons(locale).map((lesson) => [lesson.slug, lesson.title]));

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted">{t('intro')}</p>
      <nav className="mt-6 space-y-3" aria-label={t('jump_to')}>
        {(Object.keys(DOMAINS) as DomainId[]).map((domain) => {
          const items = comparisons.filter((item) => item.domain === domain);

          return items.length === 0 ? null : (
            <div key={domain} className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-xs text-accent">{DOMAINS[domain].code}</span>
              {items.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent">
                  {item.title}
                </a>
              ))}
            </div>
          );
        })}
      </nav>
      {comparisons.map((item) => (
        <section key={item.id} id={item.id} className="mt-12 scroll-mt-20">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            {DOMAINS[item.domain].code} · {td(item.domain)}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{item.title}</h2>
          <p className="mt-2 text-chalk/85">{item.summary}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
            {item.services.map((service, i) => (
              <li key={service} className="rounded-xl border border-accent/40 bg-accent/5 p-3">
                <p className="font-bold">{service}</p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-accent uppercase">{t('pick_when')}</p>
                <p className="mt-0.5 text-sm text-chalk/85">{item.pick[i]}</p>
              </li>
            ))}
          </ul>
          {item.diagram && <LessonMarkdown>{item.diagram}</LessonMarkdown>}
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="bg-panel-2">
                <tr>
                  <th className="w-36 px-3 py-2 text-left font-semibold text-muted" />
                  {item.services.map((service) => (
                    <th key={service} className="px-3 py-2 text-left font-bold">
                      {service}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.rows.map((row) => (
                  <tr key={row.aspect} className="border-t border-line align-top even:bg-panel/60">
                    <th scope="row" className="px-3 py-2 text-left font-semibold text-muted">
                      {row.aspect}
                    </th>
                    {row.values.map((value, i) => (
                      <td key={`${row.aspect}-${item.services[i]}`} className="px-3 py-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <KeywordCards keywords={item.keywords} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.lessons.map((slug) => (
              <Link key={slug} href={`/lessons/${slug}`} className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent">
                📖 {lessonTitles.get(slug) ?? slug}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
