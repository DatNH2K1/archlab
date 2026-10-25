'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { COMPONENT_TYPES_IN_PALETTE } from '@/game/catalog';
import { ROUNDS, unlockedAt } from '@/game/rounds';
import { TRACKS } from '@/game/tracks';
import { inLocale } from '@/libs/Localize';
import { useProgress, useProgressReady } from '@/libs/Progress';
import { GameScreen } from './GameScreen';

/**
 * Mounts the game once saved boards and progress are read from the browser.
 * @param props Learn rounds, a design problem, or the sandbox.
 */
export const ClientGame = (props: { mode: 'learn' } | { mode: 'sandbox' } | { mode: 'track'; trackId: string }) => {
  const ready = useProgressReady();
  const params = useSearchParams();

  if (!ready) {
    return <div className="dot-grid fixed inset-0" />;
  }

  if (props.mode === 'sandbox') {
    return <GameScreen mode="sandbox" />;
  }

  if (props.mode === 'track') {
    return <TrackGame trackId={props.trackId} requested={params.get('round')} />;
  }

  return <LearnGame requested={params.get('round')} />;
};

/** Picks the round once, so passing a round does not jump to the next one before the result shows. */
const LearnGame = (props: { requested: string | null }) => {
  const progress = useProgress();
  const tc = useTranslations('Chapters');
  const [firstOpen] = useState(() => ROUNDS.find((round) => !progress.stars[round.id]) ?? ROUNDS.at(-1));
  const round = ROUNDS.find((item) => item.id === props.requested) ?? firstOpen ?? ROUNDS[0];

  if (!round) {
    return null;
  }

  return (
    <GameScreen
      key={round.id}
      mode="play"
      round={round}
      sequence={ROUNDS}
      palette={unlockedAt(ROUNDS.indexOf(round))}
      heading={tc(round.chapter)}
      roundHref={(id) => `/?round=${id}`}
    />
  );
};

/** Plays the rounds of one design problem in order. */
const TrackGame = (props: { trackId: string; requested: string | null }) => {
  const progress = useProgress();
  const locale = useLocale();
  const track = TRACKS.find((item) => item.id === props.trackId);
  const [firstOpen] = useState(() => track?.rounds.find((round) => !progress.stars[round.id]) ?? track?.rounds.at(-1));

  if (!track) {
    return null;
  }

  const round = track.rounds.find((item) => item.id === props.requested) ?? firstOpen ?? track.rounds[0];

  if (!round) {
    return null;
  }

  return (
    <GameScreen
      key={round.id}
      mode="play"
      round={round}
      sequence={track.rounds}
      palette={COMPONENT_TYPES_IN_PALETTE}
      heading={inLocale(track.text, locale).title}
      roundHref={(id) => `/scenarios/${track.id}?round=${id}`}
    />
  );
};
