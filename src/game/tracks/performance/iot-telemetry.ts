import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import type { NodeConfig } from '@/game/types';

type Cfg = Partial<NodeConfig>;

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 300, 240],
    ['fn', 'lambda', 520, 240],
    ['table', 'dynamodb', 740, 240],
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
      ['users', 'users', 80, 240],
      ['lb', 'alb', 300, 240],
      ['web', 'ec2', 520, 240, web],
      ['table', 'dynamodb', 740, 240, table],
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
      ['users', 'users', 80, 240],
      ['api', 'apiGateway', 280, 240],
      ['queue', 'sqs', 480, 240],
      ['worker', 'ec2', 680, 240, worker],
      ['table', 'dynamodb', 880, 240, table],
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
      ['users', 'users', 80, 300],
      ['api', 'apiGateway', 280, 300],
      ['queue', 'sqs', 480, 160],
      ['worker', 'ec2', 680, 160, o.worker],
      ['table', 'dynamodb', 880, 300, o.table],
      ['lb', 'alb', 480, 440],
      ['dash', 'ec2', 680, 440, { size: 'large', count: 2 }],
      ...(o.cache ? [['cache', 'elasticache', 880, 440, o.cache] as const] : []),
    ] as Parameters<typeof makeBoard>[0],
    [
      ['users', 'api'],
      ['api', 'queue'],
      ['api', 'lb'],
      ['lb', 'dash'],
      ['dash', 'queue'],
      ['queue', 'worker'],
      ['worker', 'table'],
      ...(o.cache
        ? ([
            ['dash', 'cache'],
            ['cache', 'table'],
          ] as [string, string][])
        : ([['dash', 'table']] as [string, string][])),
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
      lessons: ['serverless-workflows'],
      solution: serverless,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 360, 240],
          ['db', 'rds', 640, 240],
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
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: steady,
      naive: fleet({ size: 'large', count: 2 }, {}),
    },
    {
      id: 'iot-3-storm',
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'flashSale', latencyTarget: 150, budget: 400, requirements: [] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: storm,
      naive: fleet({ size: 'large', count: 2, autoScaling: true, maxCount: 5 }, { provisioned: true, size: 'large' }),
    },
    {
      id: 'iot-4-growth',
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'viral', latencyTarget: 150, budget: 780, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['auto-scaling', 'decoupling-messaging'],
      solution: growth,
      naive: storm,
    },
    {
      id: 'iot-5-dash',
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: dash,
      naive: dashboards({ worker, table: { provisioned: true, size: 'xlarge' } }),
    },
    {
      id: 'iot-6-cache-crash',
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, twist: 'cacheCrash', latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: resilient,
      naive: dash,
    },
  ],
};
