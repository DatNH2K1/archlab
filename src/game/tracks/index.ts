import { ROUNDS } from '../rounds';
import type { Round, Track } from '../rounds';
import { GROUP_A } from './group-a';
import { GROUP_B } from './group-b';
import { GROUP_C } from './group-c';
import { GROUP_D } from './group-d';
import { urlShortener } from './url-shortener';

/** Design problems, easiest first. Each file in this folder exports one track. */
const LEVEL = { easy: 0, medium: 1, hard: 2 } as const;

export const TRACKS: Track[] = [urlShortener, ...GROUP_A, ...GROUP_B, ...GROUP_C, ...GROUP_D].sort(
  (a, b) => LEVEL[a.difficulty] - LEVEL[b.difficulty],
);

/**
 * Builds the link that opens a round, in Learn or in its design problem.
 * @param roundId The round id.
 * @returns An app path.
 */
export const roundHref = (roundId: string) => {
  const track = TRACKS.find((item) => item.rounds.some((round) => round.id === roundId));

  return track ? `/scenarios/${track.id}?round=${roundId}` : `/?round=${roundId}`;
};

/** Every playable round, Learn first. */
export const ALL_ROUNDS: Round[] = [...ROUNDS, ...TRACKS.flatMap((track) => track.rounds)];
