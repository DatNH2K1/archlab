import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { NodeSpec } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';

type NodeConfig = NonNullable<NodeSpec['config']>;

const firstFeed = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2 } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const replicated = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 } },
    { id: 'db', type: ComponentType.Rds, x: 720, y: 160, config: { size: 'medium', multiAz: true } },
    { id: 'replica', type: ComponentType.ReadReplica, x: 720, y: 340, config: { size: 'medium', az: 'b' } },
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
  const nodes: NodeSpec[] = [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280 + x, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480 + x, y: 240, config: options.web },
    { id: 'cache', type: ComponentType.ElastiCache, x: 720 + x, y: 80, config: options.cache ?? {} },
    { id: 'db', type: ComponentType.Rds, x: 720 + x, y: 240, config: options.db ?? { size: 'medium', multiAz: true } },
    { id: 'replica', type: ComponentType.ReadReplica, x: 720 + x, y: 400, config: { size: 'medium', az: 'b' } },
  ];
  const edges: [string, string][] = [
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'replica'],
  ];

  if (options.edge) {
    nodes.push({ id: 'cdn', type: ComponentType.CloudFront, x: 280, y: 240, config: { cacheApi: true } });
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
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.RelationalDatabases],
      solution: firstFeed,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2 } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'medium' } },
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
      lessons: [LessonSlug.RelationalDatabases, LessonSlug.HighAvailabilityMultiAz],
      solution: replicated,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large', multiAz: true } },
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
      lessons: [LessonSlug.NoSqlCaching],
      solution: cached,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: bigWeb },
          { id: 'db', type: ComponentType.Rds, x: 720, y: 160, config: { size: 'large', multiAz: true } },
          { id: 'replica', type: ComponentType.ReadReplica, x: 720, y: 340, config: { size: 'large', az: 'b' } },
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
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.HighAvailabilityMultiAz],
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
      lessons: [LessonSlug.AutoScaling],
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
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.CostNetworkTransfer],
      solution: edgeCached,
      naive: viral,
    },
  ],
};
