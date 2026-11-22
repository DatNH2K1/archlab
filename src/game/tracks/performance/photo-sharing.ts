import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { NodeSpec } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig } from '@/game/types';

type Cfg = Partial<NodeConfig>;
type EdgeSpec = [string, string];

const front = (cdn: Cfg = {}, app: Cfg = { size: 'medium' }, db: Cfg = {}): NodeSpec[] => [
  { id: 'users', type: ComponentType.Users, x: 80, y: 260 },
  { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 260, config: cdn },
  { id: 'photos', type: ComponentType.S3, x: 460, y: 100 },
  { id: 'lb', type: ComponentType.Alb, x: 460, y: 260 },
  { id: 'app', type: ComponentType.Ec2, x: 660, y: 260, config: app },
  { id: 'db', type: ComponentType.Rds, x: 880, y: 260, config: db },
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
  [
    ...front(),
    { id: 'queue', type: ComponentType.Sqs, x: 660, y: 440 },
    { id: 'thumbs', type: ComponentType.Ec2, x: 880, y: 440, config: { size: 'medium' } },
  ],
  [...frontEdges, ['app', 'queue'], ['queue', 'thumbs']],
);

const fanOut = (worker: Cfg, options: { cdn?: Cfg; app?: Cfg; db?: Cfg; cache?: boolean } = {}) =>
  makeBoard(
    [
      ...front(options.cdn, options.app, options.db ?? { size: 'medium' }),
      ...(options.cache
        ? ([{ id: 'cache', type: ComponentType.ElastiCache, x: 880, y: 120 }] satisfies NodeSpec[])
        : []),
      { id: 'topic', type: ComponentType.Sns, x: 660, y: 440 },
      { id: 'qThumbs', type: ComponentType.Sqs, x: 880, y: 440 },
      { id: 'qFeed', type: ComponentType.Sqs, x: 880, y: 600 },
      { id: 'thumbs', type: ComponentType.Ec2, x: 1080, y: 440, config: worker },
      { id: 'feed', type: ComponentType.Ec2, x: 1080, y: 600, config: worker },
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
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.S3Performance],
      solution: launch,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 260 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 260 },
          { id: 'app', type: ComponentType.Ec2, x: 480, y: 260, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 260 },
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
      scenario: {
        traffic: 800,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 75,
        budget: 125,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging],
      solution: queued,
      naive: makeBoard(
        [...front(), { id: 'thumbs', type: ComponentType.Ec2, x: 880, y: 440, config: { size: 'medium' } }],
        [...frontEdges, ['app', 'thumbs']],
      ),
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
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ApplicationIntegration],
      solution: fanOut({ size: 'medium' }),
      naive: makeBoard(
        [
          ...front(),
          { id: 'queue', type: ComponentType.Sqs, x: 660, y: 440 },
          { id: 'thumbs', type: ComponentType.Ec2, x: 880, y: 440, config: { size: 'large' } },
        ],
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
      lessons: [LessonSlug.Ec2PricingModels],
      solution: fanOut({ size: 'medium', pricing: 'spot' }),
      naive: fanOut({ size: 'small' }),
    },
    {
      id: 'photo-5-interrupt',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: Twist.SpotInterruption,
        latencyTarget: 75,
        budget: 150,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.Ec2PricingModels, LessonSlug.DecouplingMessaging],
      solution: fanOut({ size: 'large', pricing: 'spot' }),
      naive: fanOut({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'photo-6-viral',
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: Twist.Viral,
        latencyTarget: 80,
        budget: 270,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.NoSqlCaching],
      solution: fanOut(
        { size: 'large', pricing: 'spot', autoScaling: true },
        { cdn: { cacheApi: true }, app: { size: 'medium', autoScaling: true }, cache: true },
      ),
      naive: fanOut({ size: 'large', pricing: 'spot' }),
    },
  ],
};
