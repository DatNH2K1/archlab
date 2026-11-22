import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { NodeSpec } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';

const onSale = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', autoScaling: true, maxCount: 4 } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const writeBehind = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 100 },
    { id: 'orders', type: ComponentType.Sqs, x: 480, y: 420 },
    { id: 'worker', type: ComponentType.Ec2, x: 700, y: 420, config: { size: 'medium', count: 3, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 920, y: 260, config: { size: 'xlarge' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'db'],
    ['orders', 'worker'],
    ['worker', 'db'],
  ],
);

const scalingWorkers: NodeSpec['config'] = { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 4 };

/** The ticketing board from round 3 on: DynamoDB behind the order queue, with a few knobs. */
const stadium = (options: { waf?: boolean; scalingWorkers?: boolean; onDemand?: boolean }) => {
  const shield = options.waf ?? false;
  const x = shield ? 160 : 0;
  const nodes: NodeSpec[] = [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280 + x, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480 + x, y: 240, config: { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700 + x, y: 100 },
    { id: 'orders', type: ComponentType.Sqs, x: 480 + x, y: 420 },
    { id: 'worker', type: ComponentType.Ec2, x: 700 + x, y: 420, config: options.scalingWorkers ? scalingWorkers : { size: 'xlarge' } },
    { id: 'tickets', type: ComponentType.DynamoDb, x: 920 + x, y: 260, config: options.onDemand ? {} : { provisioned: true, size: 'large' } },
  ];
  const edges: [string, string][] = [
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'tickets'],
    ['orders', 'worker'],
    ['worker', 'tickets'],
  ];

  if (shield) {
    nodes.push({ id: 'shield', type: ComponentType.Waf, x: 240, y: 240 });
    edges.push(['users', 'shield'], ['shield', 'lb']);
  } else {
    edges.push(['users', 'lb']);
  }

  return makeBoard(nodes, edges);
};

const worldTour = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
    { id: 'cdn', type: ComponentType.CloudFront, x: 400, y: 240 },
    { id: 'seatmaps', type: ComponentType.S3, x: 600, y: 80 },
    { id: 'lb', type: ComponentType.Alb, x: 600, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 800, y: 240, config: { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 1020, y: 100 },
    { id: 'orders', type: ComponentType.Sqs, x: 800, y: 420 },
    { id: 'worker', type: ComponentType.Ec2, x: 1020, y: 420, config: scalingWorkers },
    { id: 'tickets', type: ComponentType.DynamoDb, x: 1240, y: 260, config: { provisioned: true, size: 'large' } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'seatmaps'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'tickets'],
    ['orders', 'worker'],
    ['worker', 'tickets'],
  ],
);

export const ticketing: Track = {
  id: 'ticketing',
  difficulty: 'medium',
  rounds: [
    {
      id: 'tix-1-on-sale',
      scenario: {
        traffic: 200,
        mix: { read: 0.6, write: 0.4 },
        audience: { 'us-east-1': 1 },
        twist: Twist.FlashSale,
        latencyTarget: 300,
        budget: 140,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling],
      solution: onSale,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large' } },
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'tix-2-write-behind',
      scenario: {
        traffic: 900,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: Twist.FlashSale,
        latencyTarget: 300,
        budget: 460,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.NoSqlCaching],
      solution: writeBehind,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'xlarge' } },
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'tix-3-dynamodb',
      scenario: {
        traffic: 2000,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: Twist.FlashSale,
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.CostDatabaseStorageChoices, LessonSlug.NoSqlCaching],
      solution: stadium({}),
      naive: stadium({ onDemand: true }),
    },
    {
      id: 'tix-4-bots',
      scenario: {
        traffic: 2000,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: Twist.Ddos,
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield],
      solution: stadium({ waf: true }),
      naive: stadium({}),
    },
    {
      id: 'tix-5-e-tickets',
      scenario: {
        traffic: 2000,
        mix: { read: 0.2, write: 0.4, job: 0.4 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 720,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.AutoScaling],
      solution: stadium({ waf: true, scalingWorkers: true }),
      naive: stadium({ waf: true }),
    },
    {
      id: 'tix-6-world-tour',
      scenario: {
        traffic: 2000,
        mix: { read: 0.2, write: 0.3, job: 0.25, static: 0.25 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: Twist.FlashSale,
        latencyTarget: 100,
        budget: 760,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.DecouplingMessaging],
      solution: worldTour,
      naive: stadium({ waf: true, scalingWorkers: true }),
    },
  ],
};
