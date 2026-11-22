import { describe, expect, it } from 'vitest';
import { DOMAINS, LessonSlug } from '@/content/types';
import type { DomainId } from '@/content/types';
import { ComponentType } from '../types';
import { ALL_ROUNDS } from '.';
import { COST_TRACKS } from './cost';
import { PERFORMANCE_TRACKS } from './performance';
import { RESILIENT_TRACKS } from './resilient';
import { SECURE_TRACKS } from './secure';

const BY_DOMAIN: Record<DomainId, typeof SECURE_TRACKS> = {
  secure: SECURE_TRACKS,
  resilient: RESILIENT_TRACKS,
  performance: PERFORMANCE_TRACKS,
  cost: COST_TRACKS,
};

describe('Exam coverage', () => {
  it.each(Object.values(ComponentType).filter((type) => type !== ComponentType.Users))(
    'uses %s in at least five reference designs',
    (type) => {
      const rounds = ALL_ROUNDS.filter((round) => round.solution.nodes.some((node) => node.type === type));

      expect(rounds.length).toBeGreaterThanOrEqual(5);
    },
  );

  it.each(Object.values(LessonSlug))('links %s from at least one round', (slug) => {
    expect(ALL_ROUNDS.some((round) => round.lessons.includes(slug))).toBe(true);
  });

  it.each(Object.entries(DOMAINS))('keeps %s rounds within five points of the exam weight', (domain, info) => {
    const count = (id: DomainId) => BY_DOMAIN[id].reduce((acc, track) => acc + track.rounds.length, 0);
    const total = (Object.keys(BY_DOMAIN) as DomainId[]).reduce((acc, id) => acc + count(id), 0);
    const share = (count(domain as DomainId) / total) * 100;

    expect(Math.abs(share - info.weight)).toBeLessThanOrEqual(5);
  });
});
