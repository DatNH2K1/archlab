import { makeBoard } from '../board';
import type { Track } from '../rounds';

type NodeSpecs = Parameters<typeof makeBoard>[0];

const onSale = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const writeBehind = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 700, 100],
    ['orders', 'sqs', 480, 420],
    ['worker', 'ec2', 700, 420, { size: 'medium', count: 3, az: 'spread' }],
    ['db', 'rds', 920, 260, { size: 'xlarge' }],
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

const scalingWorkers: NodeSpecs[number][4] = { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 4 };

/** The ticketing board from round 3 on: DynamoDB behind the order queue, with a few knobs. */
const stadium = (options: { waf?: boolean; scalingWorkers?: boolean; onDemand?: boolean }) => {
  const shield = options.waf ?? false;
  const x = shield ? 160 : 0;
  const nodes: NodeSpecs = [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280 + x, 240],
    ['web', 'ec2', 480 + x, 240, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 700 + x, 100],
    ['orders', 'sqs', 480 + x, 420],
    ['worker', 'ec2', 700 + x, 420, options.scalingWorkers ? scalingWorkers : { size: 'xlarge' }],
    ['tickets', 'dynamodb', 920 + x, 260, options.onDemand ? {} : { provisioned: true, size: 'large' }],
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
    nodes.push(['shield', 'waf', 240, 240]);
    edges.push(['users', 'shield'], ['shield', 'lb']);
  } else {
    edges.push(['users', 'lb']);
  }

  return makeBoard(nodes, edges);
};

const worldTour = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240],
    ['seatmaps', 's3', 600, 80],
    ['lb', 'alb', 600, 240],
    ['web', 'ec2', 800, 240, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 1020, 100],
    ['orders', 'sqs', 800, 420],
    ['worker', 'ec2', 1020, 420, scalingWorkers],
    ['tickets', 'dynamodb', 1240, 260, { provisioned: true, size: 'large' }],
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
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 140,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: onSale,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium' }],
          ['db', 'rds', 700, 240, { size: 'large' }],
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
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 460,
        requirements: [],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'nosql-caching'],
      solution: writeBehind,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
          ['db', 'rds', 700, 240, { size: 'xlarge' }],
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
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: stadium({}),
      naive: stadium({ onDemand: true }),
    },
    {
      id: 'tix-4-bots',
      scenario: {
        traffic: 2000,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
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
      lessons: ['decoupling-messaging', 'auto-scaling'],
      solution: stadium({ waf: true, scalingWorkers: true }),
      naive: stadium({ waf: true }),
    },
    {
      id: 'tix-6-world-tour',
      scenario: {
        traffic: 2000,
        mix: { read: 0.2, write: 0.3, job: 0.25, static: 0.25 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'flashSale',
        latencyTarget: 100,
        budget: 760,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: ['edge-networking', 'decoupling-messaging'],
      solution: worldTour,
      naive: stadium({ waf: true, scalingWorkers: true }),
    },
  ],
};
