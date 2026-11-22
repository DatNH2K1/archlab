import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { NodeSpec } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType } from '@/game/types';
import type { NodeConfig } from '@/game/types';

type Cfg = Partial<NodeConfig>;
type EdgeSpec = [string, string];

const api = (table: Cfg = {}): NodeSpec[] => [
  { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
  { id: 'api', type: ComponentType.ApiGateway, x: 280, y: 240 },
  { id: 'fn', type: ComponentType.Lambda, x: 480, y: 240 },
  { id: 'table', type: ComponentType.DynamoDb, x: 700, y: 100, config: table },
];

const apiEdges: EdgeSpec[] = [
  ['users', 'api'],
  ['api', 'fn'],
  ['fn', 'table'],
];

const inline = makeBoard(api(), apiEdges);

const queued = makeBoard(
  [
    ...api(),
    { id: 'queue', type: ComponentType.Sqs, x: 700, y: 380 },
    { id: 'sender', type: ComponentType.Ec2, x: 920, y: 380, config: { size: 'medium' } },
  ],
  [...apiEdges, ['fn', 'queue'], ['queue', 'sender']],
);

const CHANNELS: [name: string, y: number][] = [
  ['Push', 380],
  ['Email', 540],
  ['Sms', 700],
];

const fanOut = (worker: (typeof ComponentType)['Ec2' | 'Lambda'], workerConfig: Cfg = {}, encrypted = false) =>
  makeBoard(
    [
      ...api({ encrypted }),
      { id: 'topic', type: ComponentType.Sns, x: 700, y: 380 },
      ...CHANNELS.flatMap(([name, y]): NodeSpec[] => [
        { id: `q${name}`, type: ComponentType.Sqs, x: 920, y, config: { encrypted } },
        { id: `w${name}`, type: worker, x: 1140, y, config: workerConfig },
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
      scenario: {
        traffic: 40,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 250,
        budget: 7,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ServerlessWorkflows],
      solution: inline,
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
      id: 'notif-2-queue',
      scenario: {
        traffic: 250,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 100,
        budget: 85,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging],
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
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ApplicationIntegration],
      solution: fanOut(ComponentType.Ec2, { size: 'medium' }),
      naive: makeBoard(
        [
          ...api(),
          { id: 'queue', type: ComponentType.Sqs, x: 700, y: 380 },
          { id: 'sender', type: ComponentType.Ec2, x: 920, y: 380, config: { size: 'xlarge' } },
        ],
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
      lessons: [LessonSlug.AutoScaling, LessonSlug.DecouplingMessaging],
      solution: fanOut(ComponentType.Ec2, { size: 'medium', autoScaling: true }),
      naive: fanOut(ComponentType.Ec2, { size: 'medium' }),
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
      lessons: [LessonSlug.CostComputeServerlessContainers, LessonSlug.ServerlessWorkflows],
      solution: fanOut(ComponentType.Lambda),
      naive: fanOut(ComponentType.Ec2, { size: 'small', autoScaling: true }),
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
      lessons: [LessonSlug.DataEncryptionKms],
      solution: fanOut(ComponentType.Lambda, {}, true),
      naive: fanOut(ComponentType.Lambda),
    },
  ],
};
