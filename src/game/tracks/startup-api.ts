import { makeBoard } from '../board';
import type { Track } from '../rounds';

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 280, 240],
    ['fn', 'lambda', 480, 240],
    ['db', 'dynamodb', 680, 240],
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'db'],
  ],
);

const servers = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large' }],
    ['db', 'dynamodb', 680, 240, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const multiAz = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
    ['db', 'dynamodb', 680, 240, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const reserved = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread', pricing: 'reserved' }],
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const burst = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    [
      'web',
      'ec2',
      480,
      240,
      {
        size: 'large',
        count: 2,
        az: 'spread',
        pricing: 'reserved',
        autoScaling: true,
        maxCount: 4,
      },
    ],
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

export const startupApi: Track = {
  id: 'startup-api',
  difficulty: 'easy',
  rounds: [
    {
      id: 'sapi-launch',
      scenario: {
        traffic: 80,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 15,
        requirements: [],
      },
      unlocks: [],
      lessons: ['serverless-workflows', 'cost-compute-serverless-containers'],
      solution: serverless,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240],
          ['db', 'rds', 560, 240],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'sapi-growth',
      scenario: {
        traffic: 900,
        mix: { read: 0.8, write: 0.2 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 120,
        requirements: [],
      },
      unlocks: [],
      lessons: ['cost-compute-serverless-containers', 'cost-database-storage-choices'],
      solution: servers,
      naive: serverless,
    },
    {
      id: 'sapi-az',
      scenario: {
        traffic: 900,
        mix: { read: 0.8, write: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 300,
        budget: 180,
        requirements: [],
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'elastic-load-balancing'],
      solution: multiAz,
      naive: servers,
    },
    {
      id: 'sapi-cache',
      scenario: {
        traffic: 2000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 200,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: multiAz,
    },
    {
      id: 'sapi-reserved',
      scenario: {
        traffic: 2000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'spotInterruption',
        latencyTarget: 300,
        budget: 145,
        requirements: [],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'cost-management-tools'],
      solution: reserved,
      naive: cached,
    },
    {
      id: 'sapi-peak',
      scenario: {
        traffic: 1000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 195,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'ec2-pricing-models'],
      solution: burst,
      naive: reserved,
    },
  ],
};
