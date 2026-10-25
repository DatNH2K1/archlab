import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/libs/I18nNavigation';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'HowToPlayPage' });

  return { title: t('title') };
}

const SECTIONS = ['draw', 'run', 'aws', 'fail', 'study'] as const;
const SHORTCUTS = ['run', 'undo', 'redo', 'delete'] as const;

export default async function HowToPlayPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('HowToPlayPage');

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-2xl text-accent">{t('tagline')}</p>
      <p className="mt-2 text-muted">{t('intro')}</p>
      <Link href="/" className="mt-4 inline-block rounded-xl bg-accent px-5 py-2 font-bold text-ink">
        {t('play')} ▷
      </Link>
      {SECTIONS.map((section) => (
        <section key={section} className="mt-8">
          <h2 className="text-xl font-bold">{t(`${section}.title`)}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-6 text-chalk/90">
            {t(`${section}.items`)
              .split('\n')
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </section>
      ))}
      <section className="mt-8">
        <h2 className="text-xl font-bold">{t('shortcuts.title')}</h2>
        <ul className="mt-3 space-y-1.5 text-chalk/90">
          {SHORTCUTS.map((key) => (
            <li key={key}>{t(`shortcuts.${key}`)}</li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
