import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { ProgressClient } from '@/components/ProgressClient';
import { getFlashcards, getLessons, getQuestions } from '@/content';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ProgressPage' });

  return { title: t('title') };
}

export default async function ProgressPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('ProgressPage');

  return (
    <PageShell title={t('title')}>
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>
      <ProgressClient
        lessonCount={getLessons(locale).length}
        questionCount={getQuestions(locale).length}
        cardCount={getFlashcards(locale).length}
      />
    </PageShell>
  );
}
