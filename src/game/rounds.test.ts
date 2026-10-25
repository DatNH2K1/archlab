import { describe, expect, it } from 'vitest';
import { makeBoard } from './board';
import { ROUNDS } from './rounds';
import { simulate } from './simulate';
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

  it('starts every round with users on the board', () => {
    for (const item of ROUNDS) {
      expect((item.starter ?? item.solution).nodes.some((node) => node.type === 'users')).toBe(true);
    }
  });

  describe('naive designs', () => {
    const fails: [string, () => Board][] = [
      [
        'scale-out',
        () =>
          makeBoard(
            [
              ['users', 'users', 0, 0],
              ['web', 'ec2', 0, 0, { size: 'xlarge' }],
              ['db', 'rds', 0, 0, { size: 'large' }],
            ],
            [
              ['users', 'web'],
              ['web', 'db'],
            ],
          ),
      ],
      ['az-outage', () => tweak(tweak(round('az-outage').solution, 'web', { az: 'a' }), 'db', { multiAz: false })],
      ['flash-sale', () => tweak(round('flash-sale').solution, 'web', { autoScaling: false, count: 2 })],
      ['region-down', () => without(round('region-down').solution, ['lb2', 'web2', 'db2'])],
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
              ['users', 'users', 0, 0],
              ['web', 'ec2', 0, 0],
              ['db', 'rds', 0, 0],
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
    ];

    it.each(fails)('fails %s', (id, build) => {
      expect(simulate(build(), round(id).scenario).passed).toBe(false);
    });
  });
});
