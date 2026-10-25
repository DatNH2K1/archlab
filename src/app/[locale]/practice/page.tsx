import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { PracticeClient } from '@/components/PracticeClient';
import { getLessons, getQuestions } from '@/content';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PracticePage' });

  return { title: t('title') };
}

export default async function PracticePage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { locale } = await props.params;
  const { lesson } = await props.searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('PracticePage');
  const lessonTitles = Object.fromEntries(getLessons(locale).map((item) => [item.slug, item.title]));

  return (
    <PageShell title={t('title')}>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 mb-6 text-muted">{t('intro')}</p>
      <PracticeClient key={lesson ?? 'all'} questions={getQuestions(locale)} lessonTitles={lessonTitles} lesson={lesson} />
    </PageShell>
  );
}
