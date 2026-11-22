import { ROUNDS } from '../rounds';
import type { Round, Track } from '../rounds';
import { COST_TRACKS } from './cost';
import { PERFORMANCE_TRACKS } from './performance';
import { RESILIENT_TRACKS } from './resilient';
import { SECURE_TRACKS } from './secure';

/** Design problems, easiest first. Each subfolder groups tracks by the SAA-C03 domain they focus on. */
const LEVEL = { easy: 0, medium: 1, hard: 2 } as const;

export const TRACKS: Track[] = [...COST_TRACKS, ...RESILIENT_TRACKS, ...PERFORMANCE_TRACKS, ...SECURE_TRACKS].sort(
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
