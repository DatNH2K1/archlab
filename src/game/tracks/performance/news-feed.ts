import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';

type NodeSpecs = Parameters<typeof makeBoard>[0];
type NodeConfig = NonNullable<NodeSpecs[number][4]>;

const firstFeed = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const replicated = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 720, 160, { size: 'medium', multiAz: true }],
    ['replica', 'readReplica', 720, 340, { size: 'medium', az: 'b' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'replica'],
  ],
);

/** The feed with a timeline cache in front of the database and its replica. */
const cachedFeed = (options: {
  web: NodeConfig;
  cache?: NodeConfig;
  db?: NodeConfig;
  edge?: boolean;
}) => {
  const x = options.edge ? 180 : 0;
  const nodes: NodeSpecs = [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280 + x, 240],
    ['web', 'ec2', 480 + x, 240, options.web],
    ['cache', 'elasticache', 720 + x, 80, options.cache ?? {}],
    ['db', 'rds', 720 + x, 240, options.db ?? { size: 'medium', multiAz: true }],
    ['replica', 'readReplica', 720 + x, 400, { size: 'medium', az: 'b' }],
  ];
  const edges: [string, string][] = [
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'replica'],
  ];

  if (options.edge) {
    nodes.push(['cdn', 'cloudfront', 280, 240, { cacheApi: true }]);
    edges.push(['users', 'cdn'], ['cdn', 'lb']);
  } else {
    edges.push(['users', 'lb']);
  }

  return makeBoard(nodes, edges);
};

const bigWeb: NodeConfig = { size: 'large', count: 3, az: 'spread' };
const elasticWeb: NodeConfig = { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 };

const cached = cachedFeed({ web: bigWeb });
const crashProof = cachedFeed({ web: bigWeb, cache: { multiAz: true } });
const grown = { web: elasticWeb, cache: { size: 'medium', multiAz: true }, db: { size: 'large', multiAz: true } } as const;
const viral = cachedFeed(grown);
const edgeCached = cachedFeed({ ...grown, edge: true });

export const newsFeed: Track = {
  id: 'news-feed',
  difficulty: 'medium',
  rounds: [
    {
      id: 'feed-1-launch',
      scenario: { traffic: 800, mix: { read: 0.9, write: 0.1 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 150, requirements: [] },
      unlocks: [],
      lessons: ['elastic-load-balancing', 'relational-databases'],
      solution: firstFeed,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 2 }],
          ['db', 'rds', 700, 240, { size: 'medium' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'feed-2-read-replica',
      scenario: {
        traffic: 800,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 250,
        budget: 275,
        requirements: [],
      },
      unlocks: [],
      lessons: ['relational-databases', 'high-availability-multi-az'],
      solution: replicated,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
          ['db', 'rds', 700, 240, { size: 'large', multiAz: true }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'feed-3-cache',
      scenario: { traffic: 2500, mix: { read: 0.95, write: 0.05 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 330, requirements: [] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, bigWeb],
          ['db', 'rds', 720, 160, { size: 'large', multiAz: true }],
          ['replica', 'readReplica', 720, 340, { size: 'large', az: 'b' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
          ['web', 'replica'],
        ],
      ),
    },
    {
      id: 'feed-4-cache-crash',
      scenario: {
        traffic: 2500,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'cacheCrash',
        latencyTarget: 250,
        budget: 340,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: crashProof,
      naive: cached,
    },
    {
      id: 'feed-5-viral',
      scenario: {
        traffic: 1500,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'viral',
        latencyTarget: 250,
        budget: 680,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: viral,
      naive: crashProof,
    },
    {
      id: 'feed-6-global',
      scenario: {
        traffic: 3000,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        latencyTarget: 120,
        budget: 550,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking', 'cost-network-transfer'],
      solution: edgeCached,
      naive: viral,
    },
  ],
};
