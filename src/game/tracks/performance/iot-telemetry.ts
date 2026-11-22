import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';
import type { NodeConfig } from '@/game/types';

type Cfg = Partial<NodeConfig>;

const serverless = makeBoard(
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
);

const fleet = (web: Cfg, table: Cfg) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: web },
      { id: 'table', type: ComponentType.DynamoDb, x: 740, y: 240, config: table },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'table'],
    ],
  );

const steady = fleet({ size: 'large', count: 2 }, { provisioned: true, size: 'large' });

const buffered = (worker: Cfg, table: Cfg) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'api', type: ComponentType.ApiGateway, x: 280, y: 240 },
      { id: 'queue', type: ComponentType.Sqs, x: 480, y: 240 },
      { id: 'worker', type: ComponentType.Ec2, x: 680, y: 240, config: worker },
      { id: 'table', type: ComponentType.DynamoDb, x: 880, y: 240, config: table },
    ],
    [
      ['users', 'api'],
      ['api', 'queue'],
      ['queue', 'worker'],
      ['worker', 'table'],
    ],
  );

const storm = buffered({ size: 'large', count: 3 }, { provisioned: true, size: 'large' });
const growth = buffered({ size: 'large', count: 2, autoScaling: true, maxCount: 5 }, { provisioned: true, size: 'xlarge' });

const dashboards = (o: { cache?: Cfg; worker: Cfg; table: Cfg }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 300 },
      { id: 'api', type: ComponentType.ApiGateway, x: 280, y: 300 },
      { id: 'queue', type: ComponentType.Sqs, x: 480, y: 160 },
      { id: 'worker', type: ComponentType.Ec2, x: 680, y: 160, config: o.worker },
      { id: 'table', type: ComponentType.DynamoDb, x: 880, y: 300, config: o.table },
      { id: 'lb', type: ComponentType.Alb, x: 480, y: 440 },
      { id: 'dash', type: ComponentType.Ec2, x: 680, y: 440, config: { size: 'large', count: 2 } },
      ...(o.cache ? [{ id: 'cache', type: ComponentType.ElastiCache, x: 880, y: 440, config: o.cache } as const] : []),
    ],
    [
      ['users', 'api'],
      ['api', 'queue'],
      ['api', 'lb'],
      ['lb', 'dash'],
      ['dash', 'queue'],
      ['queue', 'worker'],
      ['worker', 'table'],
      ...(o.cache
        ? [
            ['dash', 'cache'],
            ['cache', 'table'],
          ] as const
        : [['dash', 'table']] as const),
    ],
  );

const worker: Cfg = { size: 'large', count: 4 };
const table: Cfg = { provisioned: true, size: 'large' };
const dash = dashboards({ cache: {}, worker, table });
const resilient = dashboards({ cache: { multiAz: true }, worker, table });

export const iotTelemetry: Track = {
  id: 'iot-telemetry',
  difficulty: 'hard',
  rounds: [
    {
      id: 'iot-1-pilot',
      scenario: { traffic: 200, mix: { write: 1 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 45, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.ServerlessWorkflows],
      solution: serverless,
      naive: makeBoard(
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
      id: 'iot-2-steady',
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, latencyTarget: 150, budget: 250, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.CostDatabaseStorageChoices, LessonSlug.NoSqlCaching],
      solution: steady,
      naive: fleet({ size: 'large', count: 2 }, {}),
    },
    {
      id: 'iot-3-storm',
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'flashSale', latencyTarget: 150, budget: 400, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging],
      solution: storm,
      naive: fleet({ size: 'large', count: 2, autoScaling: true, maxCount: 5 }, { provisioned: true, size: 'large' }),
    },
    {
      id: 'iot-4-growth',
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'viral', latencyTarget: 150, budget: 780, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.DecouplingMessaging],
      solution: growth,
      naive: storm,
    },
    {
      id: 'iot-5-dash',
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching],
      solution: dash,
      naive: dashboards({ worker, table: { provisioned: true, size: 'xlarge' } }),
    },
    {
      id: 'iot-6-cache-crash',
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, twist: 'cacheCrash', latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.HighAvailabilityMultiAz],
      solution: resilient,
      naive: dash,
    },
  ],
};
