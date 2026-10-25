import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { ClientGame } from '@/components/game/ClientGame';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Menu' });

  return { title: t('sandbox') };
}

export default async function SandboxPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ClientGame mode="sandbox" />
    </Suspense>
  );
}
