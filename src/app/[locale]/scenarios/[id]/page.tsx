import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ClientGame } from '@/components/game/ClientGame';
import { TRACKS } from '@/game/tracks';
import { routing } from '@/libs/I18nRouting';
import { inLocale } from '@/libs/Localize';

type TrackPageProps = { params: Promise<{ locale: string; id: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => TRACKS.map((track) => ({ locale, id: track.id })));
}

export async function generateMetadata(props: TrackPageProps): Promise<Metadata> {
  const { locale, id } = await props.params;
  const track = TRACKS.find((item) => item.id === id);

  return { title: track ? inLocale(track.text, locale).title : undefined };
}

export default async function TrackPage(props: TrackPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  if (!TRACKS.some((track) => track.id === id)) {
    notFound();
  }

  return (
    <Suspense>
      <ClientGame mode="track" trackId={id} />
    </Suspense>
  );
}
