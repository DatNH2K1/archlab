import type { Messages } from 'next-intl';
import { LessonSlug } from '@/content/types';
import { makeBoard } from './board';
import type { ConfigField } from './catalog';
import { ComponentType, Twist } from './types';
import type { Board, Region, Scenario } from './types';

export const CHAPTERS = [
  'basics',
  'resilience',
  'performance',
  'decoupling',
  'security',
  'cost',
  'advanced',
  'final',
] as const;

type ChapterId = (typeof CHAPTERS)[number];

/** Round ids, taken from the locale files. */
type RoundId = keyof Messages['Rounds'];

export type Round = {
  /** Unique across Learn and every design problem; also the key of saved progress and of its texts in `Rounds`. */
  id: RoundId;
  scenario: Scenario;
  /** Components added to the palette by this round (Learn only). */
  unlocks: ComponentType[];
  /** Lesson slugs that explain the idea of the round. */
  lessons: LessonSlug[];
  /** Board the round starts from, when it is not the previous round's board. */
  starter?: Board;
  /** A design that passes, shown as the last hint. */
  solution: Board;
  /** A plausible design that must fail; used by tests to keep the round meaningful. */
  naive?: Board;
};

export type LearnRound = Round & {
  chapter: ChapterId;
  /** Inspector settings shown from this round on; earlier rounds keep them hidden at their defaults. */
  fieldUnlocks?: ConfigField[];
};

/** A design problem: several rounds on one product, like a system design interview. */
export type Track = {
  /** Also the key of its texts in `Tracks`. */
  id: keyof Messages['Tracks'];
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: Round[];
};

const USERS = { id: 'users', type: ComponentType.Users, x: 80, y: 240 } as const;

/** API Gateway → Lambda → DynamoDB, optionally checking users with Cognito, in one Region. */
const serverlessApi = (o: { auth: boolean; region?: Region }) => {
  const config = { region: o.region ?? 'us-east-1' } as const;

  return makeBoard(
    [
      USERS,
      { id: 'api', type: ComponentType.ApiGateway, x: 300, y: 240, config },
      ...(o.auth ? [{ id: 'auth', type: ComponentType.Cognito, x: 300, y: 420 } as const] : []),
      { id: 'fn', type: ComponentType.Lambda, x: 520, y: 240, config },
      { id: 'db', type: ComponentType.DynamoDb, x: 740, y: 240, config },
    ],
    [['users', 'api'], ...(o.auth ? [['api', 'auth'] as const] : []), ['api', 'fn'], ['fn', 'db']],
  );
};

/** A serverless API that queues long renders for a worker. */
const serverlessJobs = (worker: ComponentType) =>
  makeBoard(
    [
      USERS,
      { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 460, y: 240 },
      { id: 'db', type: ComponentType.DynamoDb, x: 680, y: 240 },
      { id: 'queue', type: ComponentType.Sqs, x: 460, y: 420 },
      { id: 'worker', type: worker, x: 680, y: 420, config: { size: 'medium' } },
    ],
    [
      ['users', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'worker'],
    ],
  );

/** ALB → EC2 in two AZs → DynamoDB, optionally through a VPC endpoint. */
const tierToTable = (o: { endpoint: boolean }) =>
  makeBoard(
    [
      USERS,
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
      ...(o.endpoint ? [{ id: 'vpce', type: ComponentType.VpcEndpoint, x: 680, y: 240 } as const] : []),
      { id: 'db', type: ComponentType.DynamoDb, x: 880, y: 240 },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ...(o.endpoint ? ([['web', 'vpce'], ['vpce', 'db']] as const) : ([['web', 'db']] as const)),
    ],
  );

/** ALB → EC2 in two AZs → RDS, with or without backups. */
const threeTier = (o: { backup: boolean }) =>
  makeBoard(
    [
      USERS,
      { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
      { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: { size: 'medium', backup: o.backup } },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

export const ROUNDS: LearnRound[] = [
  {
    id: 'first-users',
    chapter: 'basics',
    scenario: {
      traffic: 50,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 35,
      requirements: [],
    },
    unlocks: [ComponentType.Ec2, ComponentType.Rds],
    lessons: [LessonSlug.Ec2Compute, LessonSlug.RelationalDatabases],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 360, y: 240 },
        { id: 'db', type: ComponentType.Rds, x: 640, y: 240 },
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'scale-up',
    fieldUnlocks: ['size'],
    chapter: 'basics',
    scenario: {
      traffic: 350,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 70,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.Ec2Compute],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 360, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 640, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'scale-out',
    fieldUnlocks: ['count'],
    chapter: 'basics',
    scenario: {
      traffic: 1300,
      mix: { read: 0.85, write: 0.15 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 170,
      requirements: [],
    },
    unlocks: [ComponentType.Alb],
    lessons: [LessonSlug.ElasticLoadBalancing],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 3 } },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: { size: 'large' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'az-outage',
    fieldUnlocks: ['az', 'multiAz'],
    chapter: 'resilience',
    scenario: {
      traffic: 400,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: Twist.AzOutage,
      latencyTarget: 300,
      budget: 150,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.HighAvailabilityMultiAz],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: { size: 'medium', multiAz: true } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'flash-sale',
    fieldUnlocks: ['autoScaling'],
    chapter: 'resilience',
    scenario: {
      traffic: 220,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: Twist.FlashSale,
      latencyTarget: 300,
      budget: 130,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.AutoScaling],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 1, autoScaling: true, maxCount: 3 } },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: { size: 'large' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'region-down',
    fieldUnlocks: ['region', 'globalDb'],
    chapter: 'resilience',
    scenario: {
      traffic: 300,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: Twist.RegionOutage,
      latencyTarget: 300,
      budget: 220,
      requirements: [],
    },
    unlocks: [ComponentType.Route53, ComponentType.Aurora],
    lessons: [LessonSlug.DisasterRecovery, LessonSlug.Route53Routing, LessonSlug.BackupReplication],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 280 },
        { id: 'dns', type: ComponentType.Route53, x: 260, y: 280 },
        { id: 'lb1', type: ComponentType.Alb, x: 440, y: 140 },
        { id: 'web1', type: ComponentType.Ec2, x: 640, y: 140, config: { size: 'medium', count: 2, az: 'spread' } },
        // Aurora Global Database: one cluster with a managed copy in eu-west-1.
        { id: 'db', type: ComponentType.Aurora, x: 860, y: 280, config: { globalDb: true } },
        { id: 'lb2', type: ComponentType.Alb, x: 440, y: 420, config: { region: 'eu-west-1' } },
        { id: 'web2', type: ComponentType.Ec2, x: 640, y: 420, config: { size: 'medium', region: 'eu-west-1' } },
      ],
      [
        ['users', 'dns'],
        ['dns', 'lb1'],
        ['dns', 'lb2'],
        ['lb1', 'web1'],
        ['web1', 'db'],
        ['lb2', 'web2'],
        ['web2', 'db'],
      ],
    ),
  },
  {
    id: 'cache-it',
    chapter: 'performance',
    scenario: {
      traffic: 2000,
      mix: { read: 0.95, write: 0.05 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 200,
      requirements: [],
    },
    unlocks: [ComponentType.ElastiCache],
    lessons: [LessonSlug.NoSqlCaching],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'large', count: 2 } },
        { id: 'cache', type: ComponentType.ElastiCache, x: 760, y: 120 },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 340, config: { size: 'medium' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'cache-crash',
    chapter: 'performance',
    scenario: {
      traffic: 2000,
      mix: { read: 0.95, write: 0.05 },
      audience: { 'us-east-1': 1 },
      twist: Twist.CacheCrash,
      latencyTarget: 300,
      budget: 215,
      requirements: [],
    },
    unlocks: [ComponentType.ReadReplica],
    lessons: [LessonSlug.NoSqlCaching, LessonSlug.RelationalDatabases],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'large', count: 2 } },
        { id: 'cache', type: ComponentType.ElastiCache, x: 760, y: 120, config: { multiAz: true } },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 340, config: { size: 'medium' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'static-files',
    chapter: 'performance',
    scenario: {
      traffic: 4000,
      mix: { static: 0.85, read: 0.12, write: 0.03 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 200,
      requirements: [],
    },
    unlocks: [ComponentType.S3, ComponentType.CloudFront],
    lessons: [LessonSlug.S3Performance, LessonSlug.EdgeNetworking],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240 },
        { id: 'files', type: ComponentType.S3, x: 480, y: 100 },
        { id: 'lb', type: ComponentType.Alb, x: 480, y: 300 },
        { id: 'web', type: ComponentType.Ec2, x: 680, y: 300, config: { size: 'large' } },
        { id: 'db', type: ComponentType.Rds, x: 880, y: 300, config: { size: 'large' } },
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'global-users',
    fieldUnlocks: ['cacheApi'],
    chapter: 'performance',
    scenario: {
      traffic: 800,
      mix: { static: 0.4, read: 0.5, write: 0.1 },
      audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
      latencyTarget: 140,
      budget: 120,
      requirements: [],
    },
    unlocks: [ComponentType.GlobalAccelerator],
    lessons: [LessonSlug.EdgeNetworking],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'cdn', type: ComponentType.CloudFront, x: 260, y: 240, config: { cacheApi: true } },
        { id: 'files', type: ComponentType.S3, x: 480, y: 100 },
        { id: 'lb', type: ComponentType.Alb, x: 480, y: 300 },
        { id: 'web', type: ComponentType.Ec2, x: 680, y: 300, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 880, y: 300, config: { size: 'medium' } },
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'background-jobs',
    chapter: 'decoupling',
    scenario: {
      traffic: 400,
      mix: { read: 0.5, write: 0.2, job: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 150,
      budget: 130,
      requirements: ['drainQueue'],
    },
    unlocks: [ComponentType.Sqs],
    lessons: [LessonSlug.DecouplingMessaging],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 720, y: 240, config: { size: 'medium' } },
        { id: 'queue', type: ComponentType.Sqs, x: 480, y: 420 },
        { id: 'worker', type: ComponentType.Ec2, x: 720, y: 420, config: { size: 'medium' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
  {
    id: 'fan-out',
    chapter: 'decoupling',
    scenario: {
      traffic: 300,
      mix: { read: 0.6, write: 0.1, job: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 150,
      budget: 145,
      requirements: ['fanOut', 'drainQueue'],
    },
    unlocks: [ComponentType.Sns],
    lessons: [LessonSlug.DecouplingMessaging],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 260, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 440, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 680, y: 120, config: { size: 'small' } },
        { id: 'topic', type: ComponentType.Sns, x: 440, y: 420 },
        { id: 'q1', type: ComponentType.Sqs, x: 640, y: 340 },
        { id: 'q2', type: ComponentType.Sqs, x: 640, y: 500 },
        { id: 'mail', type: ComponentType.Ec2, x: 860, y: 340, config: { size: 'medium' } },
        { id: 'stats', type: ComponentType.Ec2, x: 860, y: 500, config: { size: 'medium' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'topic'],
        ['topic', 'q1'],
        ['topic', 'q2'],
        ['q1', 'mail'],
        ['q2', 'stats'],
      ],
    ),
  },
  {
    id: 'lock-it-down',
    fieldUnlocks: ['encrypted'],
    chapter: 'security',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 100,
      requirements: ['encryptData', 'privateData', 'noPublicServers'],
    },
    unlocks: [],
    lessons: [LessonSlug.VpcNetworkingSecurity, LessonSlug.DataEncryptionKms],
    starter: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 360, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 640, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'web'],
        ['users', 'db'],
        ['web', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 720, y: 240, config: { size: 'medium', encrypted: true } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'bot-attack',
    chapter: 'security',
    scenario: {
      traffic: 300,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: Twist.Ddos,
      latencyTarget: 300,
      budget: 110,
      requirements: [],
    },
    unlocks: [ComponentType.Waf],
    lessons: [LessonSlug.ThreatDetectionWafShield],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'shield', type: ComponentType.Waf, x: 260, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 440, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 620, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 820, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'shield'],
        ['shield', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'serverless',
    chapter: 'cost',
    scenario: {
      traffic: 20,
      mix: { read: 0.6, write: 0.4 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 12,
      requirements: [],
    },
    unlocks: [ComponentType.ApiGateway, ComponentType.Lambda, ComponentType.DynamoDb],
    lessons: [LessonSlug.ServerlessWorkflows, LessonSlug.CostOptimizedArchitectures],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'api', type: ComponentType.ApiGateway, x: 300, y: 240 },
        { id: 'fn', type: ComponentType.Lambda, x: 520, y: 240 },
        { id: 'table', type: ComponentType.DynamoDb, x: 740, y: 240 },
      ],
      [
        ['users', 'api'],
        ['api', 'fn'],
        ['fn', 'table'],
      ],
    ),
  },
  {
    id: 'spot-workers',
    fieldUnlocks: ['pricing'],
    chapter: 'cost',
    scenario: {
      traffic: 300,
      mix: { read: 0.3, write: 0.1, job: 0.6 },
      audience: { 'us-east-1': 1 },
      twist: Twist.SpotInterruption,
      latencyTarget: 150,
      budget: 120,
      requirements: ['drainQueue'],
    },
    unlocks: [],
    lessons: [LessonSlug.Ec2PricingModels],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
        { id: 'db', type: ComponentType.Rds, x: 720, y: 240, config: { size: 'small' } },
        { id: 'queue', type: ComponentType.Sqs, x: 480, y: 420 },
        { id: 'worker', type: ComponentType.Ec2, x: 720, y: 420, config: { size: 'large', count: 2, pricing: 'spot' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
  {
    id: 'steady-table',
    fieldUnlocks: ['provisioned'],
    chapter: 'cost',
    scenario: {
      traffic: 2000,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 230,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.NoSqlCaching, LessonSlug.CostDatabaseStorageChoices],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
        { id: 'table', type: ComponentType.DynamoDb, x: 760, y: 240, config: { provisioned: true, size: 'large' } },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'table'],
      ],
    ),
  },
  {
    id: 'reserved',
    chapter: 'cost',
    scenario: {
      traffic: 1000,
      mix: { read: 0.85, write: 0.15 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 120,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.Ec2PricingModels, LessonSlug.CostManagementTools],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 3, pricing: 'reserved' } },
        { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: { size: 'medium' } },
        { id: 'cache', type: ComponentType.ElastiCache, x: 760, y: 80 },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'udp-match',
    chapter: 'advanced',
    scenario: {
      traffic: 400,
      mix: { tcp: 0.9, read: 0.1 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 95,
      requirements: [],
    },
    unlocks: [ComponentType.Nlb],
    lessons: [LessonSlug.ElasticLoadBalancing],
    starter: makeBoard(
      [
        USERS,
        { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
        { id: 'db', type: ComponentType.DynamoDb, x: 760, y: 240 },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        USERS,
        { id: 'lb', type: ComponentType.Nlb, x: 300, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
        { id: 'db', type: ComponentType.DynamoDb, x: 760, y: 240 },
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'packet-inspection',
    chapter: 'advanced',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 150,
      requirements: ['inspectTraffic', 'noPublicServers'],
    },
    unlocks: [ComponentType.Gwlb],
    lessons: [LessonSlug.SecurityLayersOverview, LessonSlug.ElasticLoadBalancing],
    starter: makeBoard(
      [
        USERS,
        { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 400, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 600, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
        { id: 'db', type: ComponentType.Rds, x: 820, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'shield'],
        ['shield', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        USERS,
        { id: 'fw', type: ComponentType.Gwlb, x: 240, y: 240 },
        { id: 'lb', type: ComponentType.Alb, x: 400, y: 240 },
        { id: 'web', type: ComponentType.Ec2, x: 600, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
        { id: 'db', type: ComponentType.Rds, x: 820, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'fw'],
        ['fw', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'long-renders',
    chapter: 'advanced',
    scenario: {
      traffic: 200,
      mix: { read: 0.6, write: 0.2, batch: 0.2 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 110,
      requirements: ['drainQueue'],
    },
    unlocks: [ComponentType.Fargate],
    lessons: [LessonSlug.ContainersCompute, LessonSlug.CostComputeServerlessContainers],
    starter: serverlessJobs(ComponentType.Lambda),
    solution: serverlessJobs(ComponentType.Fargate),
  },
  {
    id: 'replay-stream',
    chapter: 'advanced',
    scenario: {
      traffic: 300,
      mix: { write: 0.9, job: 0.1 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 140,
      requirements: ['replayStream', 'drainQueue'],
    },
    unlocks: [ComponentType.Kinesis],
    lessons: [LessonSlug.DataAnalytics, LessonSlug.DecouplingMessaging],
    starter: makeBoard(
      [
        USERS,
        { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240 },
        { id: 'queue', type: ComponentType.Sqs, x: 440, y: 240 },
        { id: 'stats', type: ComponentType.Lambda, x: 640, y: 160 },
        { id: 'db', type: ComponentType.DynamoDb, x: 860, y: 240 },
      ],
      [
        ['users', 'api'],
        ['api', 'queue'],
        ['queue', 'stats'],
        ['stats', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        USERS,
        { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240 },
        { id: 'stream', type: ComponentType.Kinesis, x: 440, y: 240 },
        { id: 'stats', type: ComponentType.Lambda, x: 640, y: 160 },
        { id: 'fraud', type: ComponentType.Lambda, x: 640, y: 320 },
        { id: 'db', type: ComponentType.DynamoDb, x: 860, y: 240 },
      ],
      [
        ['users', 'api'],
        ['api', 'stream'],
        ['stream', 'stats'],
        ['stream', 'fraud'],
        ['stats', 'db'],
        ['fraud', 'db'],
      ],
    ),
  },
  {
    id: 'sign-in',
    chapter: 'advanced',
    scenario: {
      traffic: 200,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 60,
      requirements: ['userAuth'],
    },
    unlocks: [ComponentType.Cognito],
    lessons: [LessonSlug.IdentityFederationCognito],
    starter: serverlessApi({ auth: false }),
    solution: serverlessApi({ auth: true }),
  },
  {
    id: 'db-connections',
    chapter: 'advanced',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 120,
      requirements: ['rotateSecrets'],
    },
    unlocks: [ComponentType.RdsProxy, ComponentType.SecretsManager],
    lessons: [LessonSlug.RelationalDatabases, LessonSlug.SecretsCertificates],
    starter: makeBoard(
      [
        USERS,
        { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240 },
        { id: 'fn', type: ComponentType.Lambda, x: 460, y: 240 },
        { id: 'db', type: ComponentType.Rds, x: 860, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'api'],
        ['api', 'fn'],
        ['fn', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        USERS,
        { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240 },
        { id: 'fn', type: ComponentType.Lambda, x: 460, y: 240 },
        { id: 'proxy', type: ComponentType.RdsProxy, x: 660, y: 240 },
        { id: 'secret', type: ComponentType.SecretsManager, x: 660, y: 420 },
        { id: 'db', type: ComponentType.Rds, x: 860, y: 240, config: { size: 'medium' } },
      ],
      [
        ['users', 'api'],
        ['api', 'fn'],
        ['fn', 'proxy'],
        ['proxy', 'db'],
        ['proxy', 'secret'],
      ],
    ),
  },
  {
    id: 'private-path',
    chapter: 'advanced',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 200,
      budget: 100,
      requirements: ['noPublicServers', 'privateEgress'],
    },
    unlocks: [ComponentType.VpcEndpoint],
    lessons: [LessonSlug.VpcConnectivity, LessonSlug.CostNetworkTransfer],
    starter: tierToTable({ endpoint: false }),
    solution: tierToTable({ endpoint: true }),
  },
  {
    id: 'ransomware',
    fieldUnlocks: ['backup'],
    chapter: 'advanced',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      twist: Twist.DataLoss,
      latencyTarget: 200,
      budget: 125,
      requirements: [],
    },
    unlocks: [],
    lessons: [LessonSlug.BackupReplication],
    starter: threeTier({ backup: false }),
    solution: threeTier({ backup: true }),
  },
  {
    id: 'eu-only',
    chapter: 'advanced',
    scenario: {
      traffic: 200,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 0.1, 'eu-west-1': 0.9 },
      latencyTarget: 200,
      budget: 60,
      requirements: ['dataResidency'],
    },
    unlocks: [],
    lessons: [LessonSlug.IamOrganizationsScp],
    starter: serverlessApi({ auth: false }),
    solution: serverlessApi({ auth: false, region: 'eu-west-1' }),
  },
  {
    id: 'final-boss',
    chapter: 'final',
    scenario: {
      traffic: 1500,
      mix: { static: 0.5, read: 0.35, write: 0.05, job: 0.1 },
      audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
      twist: Twist.AzOutage,
      latencyTarget: 150,
      budget: 330,
      requirements: ['encryptData', 'privateData', 'noPublicServers', 'drainQueue'],
    },
    unlocks: [],
    lessons: [
      LessonSlug.HighAvailabilityMultiAz,
      LessonSlug.EdgeNetworking,
      LessonSlug.DecouplingMessaging,
      LessonSlug.DataEncryptionKms,
    ],
    solution: makeBoard(
      [
        { id: 'users', type: ComponentType.Users, x: 80, y: 280 },
        { id: 'cdn', type: ComponentType.CloudFront, x: 240, y: 280, config: { cacheApi: true } },
        { id: 'files', type: ComponentType.S3, x: 420, y: 100 },
        { id: 'lb', type: ComponentType.Alb, x: 420, y: 280 },
        { id: 'web', type: ComponentType.Ec2, x: 600, y: 280, config: { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 4 } },
        { id: 'cache', type: ComponentType.ElastiCache, x: 820, y: 140, config: { multiAz: true, encrypted: true } },
        { id: 'db', type: ComponentType.Rds, x: 820, y: 300, config: { size: 'medium', multiAz: true, encrypted: true } },
        { id: 'queue', type: ComponentType.Sqs, x: 600, y: 460, config: { encrypted: true } },
        { id: 'worker', type: ComponentType.Ec2, x: 820, y: 460, config: { size: 'medium', count: 2, az: 'spread' } },
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
];


/**
 * Lists the components a player can use in a Learn round.
 * @param index Position of the round in the campaign.
 * @returns Unlocked component types, oldest first.
 */
export const unlockedAt = (index: number) =>
  ROUNDS.slice(0, index + 1).flatMap((round) => round.unlocks);

/**
 * Lists the Inspector settings a player can change in a Learn round.
 * @param index Position of the round in the campaign.
 * @returns Unlocked settings, oldest first.
 */
export const fieldsUnlockedAt = (index: number) =>
  ROUNDS.slice(0, index + 1).flatMap((round) => round.fieldUnlocks ?? []);
