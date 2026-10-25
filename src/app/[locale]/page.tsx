import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { ClientGame } from '@/components/game/ClientGame';

export default async function LearnPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ClientGame mode="learn" />
    </Suspense>
  );
}
