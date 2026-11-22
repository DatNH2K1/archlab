import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';

const single = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['web', 'ec2', 340, 240, { size: 'medium' }],
    ['db', 'rds', 600, 240, { size: 'medium' }],
  ],
  [
    ['users', 'web'],
    ['web', 'db'],
  ],
);

const balanced = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 3 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
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
    ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 700, 240, { size: 'large', multiAz: true }],
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
    ['cache', 'elasticache', 700, 120],
    ['db', 'rds', 700, 340, { size: 'medium', multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const scaling = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 }],
    ['cache', 'elasticache', 700, 120, { size: 'medium' }],
    ['db', 'rds', 700, 340, { size: 'large', multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const launch = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 }],
    ['cache', 'elasticache', 700, 100, { size: 'medium' }],
    ['db', 'rds', 700, 260, { size: 'large', multiAz: true }],
    ['orders', 'sqs', 480, 420],
    ['worker', 'ec2', 700, 420, { size: 'xlarge' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'orders'],
    ['orders', 'worker'],
  ],
);

export const ecommerce: Track = {
  id: 'ecommerce',
  difficulty: 'medium',
  rounds: [
    {
      id: 'shop-1-mvp',
      scenario: { traffic: 250, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 70, requirements: [] },
      unlocks: [],
      lessons: ['ec2-compute', 'relational-databases'],
      solution: single,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 340, 240],
          ['db', 'rds', 600, 240],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-2-scale-out',
      scenario: { traffic: 1200, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 178, requirements: [] },
      unlocks: [],
      lessons: ['elastic-load-balancing', 'ec2-compute'],
      solution: balanced,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 340, 240, { size: 'large' }],
          ['db', 'rds', 600, 240, { size: 'large' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-3-az-outage',
      scenario: {
        traffic: 1200,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 250,
        budget: 320,
        requirements: [],
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'auto-scaling'],
      solution: multiAz,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread' }],
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
      id: 'shop-4-catalog-cache',
      scenario: { traffic: 2000, mix: { read: 0.95, write: 0.05 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 230, requirements: [] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
          ['db', 'rds', 700, 240, { size: 'xlarge', multiAz: true }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-5-flash-sale',
      scenario: {
        traffic: 2000,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 250,
        budget: 480,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: scaling,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'large', count: 6, az: 'spread' }],
          ['cache', 'elasticache', 700, 120, { size: 'medium' }],
          ['db', 'rds', 700, 340, { size: 'large', multiAz: true }],
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
      id: 'shop-6-launch-day',
      scenario: {
        traffic: 2000,
        mix: { read: 0.75, write: 0.05, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 150,
        budget: 620,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'auto-scaling'],
      solution: launch,
      naive: scaling,
    },
  ],
};
