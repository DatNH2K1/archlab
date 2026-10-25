import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { TracksClient } from '@/components/TracksClient';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ScenariosPage' });

  return { title: t('title') };
}

export default async function ScenariosPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('ScenariosPage');

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted">{t('intro')}</p>
      <TracksClient />
    </PageShell>
  );
}
