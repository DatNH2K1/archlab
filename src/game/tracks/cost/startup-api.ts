import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';

const serverless = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'api', type: ComponentType.ApiGateway, x: 280, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 480, y: 240 },
    { id: 'db', type: ComponentType.DynamoDb, x: 680, y: 240 },
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'db'],
  ],
);

const servers = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large' } },
    { id: 'db', type: ComponentType.DynamoDb, x: 680, y: 240, config: { provisioned: true, size: 'medium' } },
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
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.DynamoDb, x: 680, y: 240, config: { provisioned: true, size: 'medium' } },
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
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 140 },
    { id: 'db', type: ComponentType.DynamoDb, x: 700, y: 320, config: { provisioned: true, size: 'medium' } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'large', count: 2, az: 'spread', pricing: 'reserved' } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 140 },
    { id: 'db', type: ComponentType.DynamoDb, x: 700, y: 320, config: { provisioned: true, size: 'medium' } },
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
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: {
        size: 'large',
        count: 2,
        az: 'spread',
        pricing: 'reserved',
        autoScaling: true,
        maxCount: 4,
      } },
    { id: 'cache', type: ComponentType.ElastiCache, x: 700, y: 140 },
    { id: 'db', type: ComponentType.DynamoDb, x: 700, y: 320, config: { provisioned: true, size: 'medium' } },
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
      lessons: [LessonSlug.ServerlessWorkflows, LessonSlug.CostComputeServerlessContainers],
      solution: serverless,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 320, y: 240 },
          { id: 'db', type: ComponentType.Rds, x: 560, y: 240 },
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
      lessons: [LessonSlug.CostComputeServerlessContainers, LessonSlug.CostDatabaseStorageChoices],
      solution: servers,
      naive: serverless,
    },
    {
      id: 'sapi-az',
      scenario: {
        traffic: 900,
        mix: { read: 0.8, write: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: Twist.AzOutage,
        latencyTarget: 300,
        budget: 180,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.HighAvailabilityMultiAz, LessonSlug.ElasticLoadBalancing],
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
      lessons: [LessonSlug.NoSqlCaching],
      solution: cached,
      naive: multiAz,
    },
    {
      id: 'sapi-reserved',
      scenario: {
        traffic: 2000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: Twist.SpotInterruption,
        latencyTarget: 300,
        budget: 145,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.Ec2PricingModels, LessonSlug.CostManagementTools],
      solution: reserved,
      naive: cached,
    },
    {
      id: 'sapi-peak',
      scenario: {
        traffic: 1000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: Twist.FlashSale,
        latencyTarget: 300,
        budget: 195,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.Ec2PricingModels],
      solution: burst,
      naive: reserved,
    },
  ],
};
