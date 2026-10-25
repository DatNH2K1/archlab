import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FlashcardsClient } from '@/components/FlashcardsClient';
import { PageShell } from '@/components/PageShell';
import { getFlashcards } from '@/content';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'FlashcardsPage' });

  return { title: t('title') };
}

export default async function FlashcardsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('FlashcardsPage');

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 mb-6 text-muted">{t('intro')}</p>
      <FlashcardsClient cards={getFlashcards(locale)} />
    </PageShell>
  );
}
