import { describe, expect, it } from 'vitest';
import { makeBoard } from './board';
import { CATALOG, defaultConfig } from './catalog';
import { fieldsUnlockedAt, ROUNDS } from './rounds';
import { simulate } from './simulate';
import { ComponentType } from './types';
import type { Board, NodeConfig } from './types';

const round = (id: string) => {
  const found = ROUNDS.find((item) => item.id === id);

  if (!found) {
    throw new Error(`Unknown round ${id}`);
  }

  return found;
};

const tweak = (board: Board, nodeId: string, config: Partial<NodeConfig>): Board => ({
  ...board,
  nodes: board.nodes.map((node) => (node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node)),
});

const without = (board: Board, nodeIds: string[], edges: [string, string][] = []): Board => ({
  nodes: board.nodes.filter((node) => !nodeIds.includes(node.id)),
  edges: [
    ...board.edges.filter((edge) => !nodeIds.includes(edge.from) && !nodeIds.includes(edge.to)),
    ...edges.map(([from, to]) => ({ id: `${from}->${to}`, from, to })),
  ],
});

describe('Rounds', () => {
  it.each(ROUNDS.map((item) => [item.id, item]))('passes %s with the reference design', (_, item) => {
    const result = simulate(item.solution, item.scenario);

    expect(result.issues.filter((issue) => issue.code !== 'overloaded')).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it.each(ROUNDS.map((item, index) => [item.id, item, index] as const))(
    'solves %s with unlocked settings only',
    (_, item, index) => {
      const unlocked = fieldsUnlockedAt(index);

      for (const node of item.solution.nodes) {
        const changed = CATALOG[node.type].fields.filter(
          (field) => node.config[field] !== defaultConfig(node.type)[field],
        );

        expect(changed.filter((field) => !unlocked.includes(field))).toEqual([]);
      }
    },
  );

  it('starts every round with users on the board', () => {
    for (const item of ROUNDS) {
      expect((item.starter ?? item.solution).nodes.some((node) => node.type === ComponentType.Users)).toBe(true);
    }
  });

  describe('naive designs', () => {
    const fails: [string, () => Board][] = [
      [
        'scale-out',
        () =>
          makeBoard(
            [
              { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
              { id: 'web', type: ComponentType.Ec2, x: 0, y: 0, config: { size: 'xlarge' } },
              { id: 'db', type: ComponentType.Rds, x: 0, y: 0, config: { size: 'large' } },
            ],
            [
              ['users', 'web'],
              ['web', 'db'],
            ],
          ),
      ],
      ['az-outage', () => tweak(tweak(round('az-outage').solution, 'web', { az: 'a' }), 'db', { multiAz: false })],
      ['flash-sale', () => tweak(round('flash-sale').solution, 'web', { autoScaling: false, count: 2 })],
      ['region-down', () => tweak(round('region-down').solution, 'db', { globalDb: false })],
      ['cache-it', () => tweak(without(round('cache-it').solution, ['cache']), 'db', { size: 'xlarge' })],
      ['cache-crash', () => tweak(round('cache-crash').solution, 'cache', { multiAz: false })],
      ['static-files', () => without(round('static-files').solution, ['cdn', 'files'], [['users', 'lb']])],
      ['global-users', () => without(round('global-users').solution, ['cdn', 'files'], [['users', 'lb']])],
      ['background-jobs', () => without(round('background-jobs').solution, ['queue', 'worker'])],
      ['fan-out', () => without(round('fan-out').solution, ['q2', 'stats'])],
      ['lock-it-down', () => round('lock-it-down').starter as Board],
      ['bot-attack', () => without(round('bot-attack').solution, ['shield'], [['users', 'lb']])],
      [
        'serverless',
        () =>
          makeBoard(
            [
              { id: 'users', type: ComponentType.Users, x: 0, y: 0 },
              { id: 'web', type: ComponentType.Ec2, x: 0, y: 0 },
              { id: 'db', type: ComponentType.Rds, x: 0, y: 0 },
            ],
            [
              ['users', 'web'],
              ['web', 'db'],
            ],
          ),
      ],
      ['spot-workers', () => tweak(round('spot-workers').solution, 'worker', { pricing: 'onDemand' })],
      ['steady-table', () => tweak(round('steady-table').solution, 'table', { provisioned: false })],
      ['reserved', () => tweak(round('reserved').solution, 'web', { pricing: 'onDemand' })],
      ...[
        'udp-match',
        'packet-inspection',
        'long-renders',
        'replay-stream',
        'sign-in',
        'db-connections',
        'private-path',
        'ransomware',
        'eu-only',
      ].map((id): [string, () => Board] => [id, () => round(id).starter as Board]),
    ];

    it.each(fails)('fails %s', (id, build) => {
      expect(simulate(build(), round(id).scenario).passed).toBe(false);
    });
  });
});
