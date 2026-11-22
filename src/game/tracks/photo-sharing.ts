import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;
type NodeSpec = Parameters<typeof makeBoard>[0][number];
type EdgeSpec = [string, string];

const front = (cdn: Cfg = {}, app: Cfg = { size: 'medium' }, db: Cfg = {}): NodeSpec[] => [
  ['users', 'users', 80, 260],
  ['cdn', 'cloudfront', 260, 260, cdn],
  ['photos', 's3', 460, 100],
  ['lb', 'alb', 460, 260],
  ['app', 'ec2', 660, 260, app],
  ['db', 'rds', 880, 260, db],
];

const frontEdges: EdgeSpec[] = [
  ['users', 'cdn'],
  ['cdn', 'photos'],
  ['cdn', 'lb'],
  ['lb', 'app'],
  ['app', 'db'],
];

const launch = makeBoard(front(), frontEdges);

const queued = makeBoard(
  [...front(), ['queue', 'sqs', 660, 440], ['thumbs', 'ec2', 880, 440, { size: 'medium' }]],
  [...frontEdges, ['app', 'queue'], ['queue', 'thumbs']],
);

const fanOut = (worker: Cfg, options: { cdn?: Cfg; app?: Cfg; db?: Cfg; cache?: boolean } = {}) =>
  makeBoard(
    [
      ...front(options.cdn, options.app, options.db ?? { size: 'medium' }),
      ...(options.cache ? ([['cache', 'elasticache', 880, 120]] satisfies NodeSpec[]) : []),
      ['topic', 'sns', 660, 440],
      ['qThumbs', 'sqs', 880, 440],
      ['qFeed', 'sqs', 880, 600],
      ['thumbs', 'ec2', 1080, 440, worker],
      ['feed', 'ec2', 1080, 600, worker],
    ],
    [
      ...frontEdges,
      ...(options.cache ? ([['app', 'cache']] satisfies EdgeSpec[]) : []),
      ['app', 'topic'],
      ['topic', 'qThumbs'],
      ['topic', 'qFeed'],
      ['qThumbs', 'thumbs'],
      ['qFeed', 'feed'],
    ],
  );

const mixWithJobs = { static: 0.7, read: 0.15, write: 0.05, job: 0.1 };

export const photoSharing: Track = {
  id: 'photo-sharing',
  difficulty: 'medium',
  rounds: [
    {
      id: 'photo-1-launch',
      scenario: {
        traffic: 600,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 80,
        budget: 85,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: launch,
      naive: makeBoard(
        [
          ['users', 'users', 80, 260],
          ['lb', 'alb', 280, 260],
          ['app', 'ec2', 480, 260, { size: 'medium' }],
          ['db', 'rds', 700, 260],
        ],
        [
          ['users', 'lb'],
          ['lb', 'app'],
          ['app', 'db'],
        ],
      ),
    },
    {
      id: 'photo-2-thumbs',
      scenario: { traffic: 800, mix: mixWithJobs, audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 }, latencyTarget: 75, budget: 125, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: queued,
      naive: makeBoard([...front(), ['thumbs', 'ec2', 880, 440, { size: 'medium' }]], [...frontEdges, ['app', 'thumbs']]),
    },
    {
      id: 'photo-3-fanout',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 75,
        budget: 175,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'application-integration'],
      solution: fanOut({ size: 'medium' }),
      naive: makeBoard(
        [...front(), ['queue', 'sqs', 660, 440], ['thumbs', 'ec2', 880, 440, { size: 'large' }]],
        [...frontEdges, ['app', 'queue'], ['queue', 'thumbs']],
      ),
    },
    {
      id: 'photo-4-spot',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 75,
        budget: 130,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models'],
      solution: fanOut({ size: 'medium', pricing: 'spot' }),
      naive: fanOut({ size: 'small' }),
    },
    {
      id: 'photo-5-interrupt',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: 'spotInterruption',
        latencyTarget: 75,
        budget: 150,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'decoupling-messaging'],
      solution: fanOut({ size: 'large', pricing: 'spot' }),
      naive: fanOut({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'photo-6-viral',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: 'viral',
        latencyTarget: 80,
        budget: 270,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'nosql-caching'],
      solution: fanOut(
        { size: 'large', pricing: 'spot', autoScaling: true },
        { cdn: { cacheApi: true }, app: { size: 'medium', autoScaling: true }, cache: true },
      ),
      naive: fanOut({ size: 'large', pricing: 'spot' }),
    },
  ],
};
