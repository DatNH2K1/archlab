import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';

const single = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 340, y: 240, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 600, y: 240, config: { size: 'medium' } },
  ],
  [
    ['users', 'web'],
    ['web', 'db'],
  ],
);

const balanced = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 3 } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const multiAz = makeBoard(
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
);

const cached = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 120 },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 340, config: { size: 'medium', multiAz: true } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 120, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 340, config: { size: 'large', multiAz: true } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 100, config: { size: 'medium' } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 260, config: { size: 'large', multiAz: true } },
    { id: 'orders', type: ComponentType.Sqs, x: 480, y: 420 },
    { id: 'worker', type: ComponentType.Ec2, x: 700, y: 420, config: { size: 'xlarge' } },
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
      lessons: [LessonSlug.Ec2Compute, LessonSlug.RelationalDatabases],
      solution: single,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 340, y: 240 },
          { id: 'db', type: ComponentType.Rds, x: 600, y: 240 },
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
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.Ec2Compute],
      solution: balanced,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 340, y: 240, config: { size: 'large' } },
          { id: 'db', type: ComponentType.Rds, x: 600, y: 240, config: { size: 'large' } },
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
      lessons: [LessonSlug.HighAvailabilityMultiAz, LessonSlug.AutoScaling],
      solution: multiAz,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 4, az: 'spread' } },
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
      id: 'shop-4-catalog-cache',
      scenario: { traffic: 2000, mix: { read: 0.95, write: 0.05 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 230, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching],
      solution: cached,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'xlarge', multiAz: true } },
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
      lessons: [LessonSlug.AutoScaling],
      solution: scaling,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 6, az: 'spread' } },
          { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 120, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 340, config: { size: 'large', multiAz: true } },
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
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.AutoScaling],
      solution: launch,
      naive: scaling,
    },
  ],
};
