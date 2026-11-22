import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;
type NodeSpec = Parameters<typeof makeBoard>[0][number];
type EdgeSpec = [string, string];

const api = (table: Cfg = {}): NodeSpec[] => [
  ['users', 'users', 80, 240],
  ['api', 'apiGateway', 280, 240],
  ['fn', 'lambda', 480, 240],
  ['table', 'dynamodb', 700, 100, table],
];

const apiEdges: EdgeSpec[] = [
  ['users', 'api'],
  ['api', 'fn'],
  ['fn', 'table'],
];

const inline = makeBoard(api(), apiEdges);

const queued = makeBoard(
  [...api(), ['queue', 'sqs', 700, 380], ['sender', 'ec2', 920, 380, { size: 'medium' }]],
  [...apiEdges, ['fn', 'queue'], ['queue', 'sender']],
);

const CHANNELS: [name: string, y: number][] = [
  ['Push', 380],
  ['Email', 540],
  ['Sms', 700],
];

const fanOut = (worker: 'ec2' | 'lambda', workerConfig: Cfg = {}, encrypted = false) =>
  makeBoard(
    [
      ...api({ encrypted }),
      ['topic', 'sns', 700, 380],
      ...CHANNELS.flatMap(([name, y]): NodeSpec[] => [
        [`q${name}`, 'sqs', 920, y, { encrypted }],
        [`w${name}`, worker, 1140, y, workerConfig],
      ]),
    ],
    [
      ...apiEdges,
      ['fn', 'topic'],
      ...CHANNELS.flatMap(([name]): EdgeSpec[] => [
        ['topic', `q${name}`],
        [`q${name}`, `w${name}`],
      ]),
    ],
  );

const MIX = { read: 0.5, write: 0.2, job: 0.3 };

export const notifications: Track = {
  id: 'notifications',
  difficulty: 'easy',
  rounds: [
    {
      id: 'notif-1-mvp',
      scenario: { traffic: 40, mix: MIX, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 7, requirements: [] },
      unlocks: [],
      lessons: ['serverless-workflows'],
      solution: inline,
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
      id: 'notif-2-queue',
      scenario: { traffic: 250, mix: MIX, audience: { 'us-east-1': 1 }, latencyTarget: 100, budget: 85, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: queued,
      naive: inline,
    },
    {
      id: 'notif-3-fanout',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 100,
        budget: 160,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'application-integration'],
      solution: fanOut('ec2', { size: 'medium' }),
      naive: makeBoard(
        [...api(), ['queue', 'sqs', 700, 380], ['sender', 'ec2', 920, 380, { size: 'xlarge' }]],
        [...apiEdges, ['fn', 'queue'], ['queue', 'sender']],
      ),
    },
    {
      id: 'notif-4-sale',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 120,
        budget: 260,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'decoupling-messaging'],
      solution: fanOut('ec2', { size: 'medium', autoScaling: true }),
      naive: fanOut('ec2', { size: 'medium' }),
    },
    {
      id: 'notif-5-lambda',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 120,
        budget: 95,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['cost-compute-serverless-containers', 'serverless-workflows'],
      solution: fanOut('lambda'),
      naive: fanOut('ec2', { size: 'small', autoScaling: true }),
    },
    {
      id: 'notif-6-encrypt',
      scenario: {
        traffic: 450,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 100,
        budget: 95,
        requirements: ['fanOut', 'drainQueue', 'encryptData'],
      },
      unlocks: [],
      lessons: ['data-encryption-kms'],
      solution: fanOut('lambda', {}, true),
      naive: fanOut('lambda'),
    },
  ],
};
