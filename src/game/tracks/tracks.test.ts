import { describe, expect, it } from 'vitest';
import { simulate } from '../simulate';
import { ALL_ROUNDS, TRACKS } from '.';

const report = (id: string, board: Parameters<typeof simulate>[0], scenario: Parameters<typeof simulate>[1]) => {
  const result = simulate(board, scenario);
  const top = result.issues.slice(0, 2).map((issue) => `${issue.code}@${issue.nodeId}`);

  return `${id}: answered=${(result.answered * 100).toFixed(2)}% latency=${result.avgLatency}/${scenario.latencyTarget} cost=${result.cost}/${scenario.budget ?? '-'} ${top.join(' ')}`;
};

describe('Design problems', () => {
  it('uses unique round ids across Learn and every problem', () => {
    const ids = ALL_ROUNDS.map((round) => round.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses unique problem ids', () => {
    expect(new Set(TRACKS.map((track) => track.id)).size).toBe(TRACKS.length);
  });

  describe.each(TRACKS.map((track) => [track.id, track]))('%s', (_, track) => {
    it('has four to six rounds with texts in both languages', () => {
      expect(track.rounds.length).toBeGreaterThanOrEqual(4);
      expect(track.rounds.length).toBeLessThanOrEqual(6);

      for (const round of track.rounds) {
        for (const text of [round.text.vi, round.text.en]) {
          expect(text.title && text.story && text.concept && text.nudge).toBeTruthy();
        }
      }
    });

    it.each(track.rounds.map((round) => [round.id, round]))('passes %s with the reference design', (id, round) => {
      const result = simulate(round.solution, round.scenario);

      expect(result.passed, report(id, round.solution, round.scenario)).toBe(true);
      expect(result.issues.filter((issue) => issue.code !== 'overloaded')).toEqual([]);
    });

    it.each(track.rounds.filter((round) => round.naive).map((round) => [round.id, round]))(
      'fails %s with the naive design',
      (id, round) => {
        const naive = round.naive;

        if (!naive) {
          return;
        }

        expect(simulate(naive, round.scenario).passed, report(id, naive, round.scenario)).toBe(false);
      },
    );

    it('fails each round with the previous round reference design, except the first', () => {
      track.rounds.slice(1).forEach((round, i) => {
        const previous = track.rounds[i]?.solution;

        if (previous) {
          expect(simulate(previous, round.scenario).passed, report(`${round.id} with previous design`, previous, round.scenario)).toBe(false);
        }
      });
    });
  });
});
