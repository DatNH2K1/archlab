import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig } from '@/game/types';

const FIXED_FLEET = { size: 'medium', count: 3, az: 'spread' } satisfies Partial<NodeConfig>;

const ELASTIC_FLEET = { size: 'medium', count: 1, az: 'spread', autoScaling: true, maxCount: 4 } satisfies Partial<NodeConfig>;

/** A bigger elastic fleet for month-end traffic. */
const MONTH_END_FLEET = { ...ELASTIC_FLEET, count: 2, maxCount: 8 } satisfies Partial<NodeConfig>;

const app = (web: Partial<NodeConfig>) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: web },
      { id: 'db', type: ComponentType.Aurora, x: 700, y: 240, config: { size: 'medium' } },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

const exports = (o: { endpoint: boolean; replica: boolean; backup: boolean; web?: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: o.web ?? ELASTIC_FLEET },
      { id: 'db', type: ComponentType.Aurora, x: 720, y: 240, config: { size: 'medium', backup: o.backup } },
      ...(o.endpoint ? [{ id: 'endpoint', type: ComponentType.VpcEndpoint, x: 600, y: 420 } as const] : []),
      { id: 'pdfs', type: ComponentType.S3, x: 820, y: 420, config: { backup: o.backup } },
      ...(o.replica ? [{ id: 'replica', type: ComponentType.ReadReplica, x: 920, y: 120, config: { size: 'medium' } } as const] : []),
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
      ...(o.endpoint
        ? [
            ['web', 'endpoint'],
            ['endpoint', 'pdfs'],
          ] as const
        : [['web', 'pdfs'] as const]),
      ...(o.replica
        ? [
            ['db', 'replica'],
            ['web', 'replica'],
          ] as const
        : []),
    ],
  );

export const saasBilling: Track = {
  id: 'saas-billing',
  difficulty: 'medium',
  rounds: [
    {
      id: 'bill-api',
      scenario: {
        traffic: 900,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 200,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.RelationalDatabases, LessonSlug.CostManagementTools],
      solution: app(FIXED_FLEET),
      naive: app({ size: 'medium', count: 1 }),
    },
    {
      id: 'bill-office',
      scenario: {
        traffic: 900,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 168,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.ManagementIac],
      solution: app(ELASTIC_FLEET),
      naive: app(FIXED_FLEET),
    },
    {
      id: 'bill-exports',
      scenario: {
        traffic: 900,
        mix: { read: 0.4, write: 0.1, static: 0.5 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 165,
        requirements: ['privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.VpcConnectivity, LessonSlug.CostNetworkTransfer],
      solution: exports({ endpoint: true, replica: false, backup: false }),
      naive: exports({ endpoint: false, replica: false, backup: false }),
    },
    {
      id: 'bill-reports',
      scenario: {
        traffic: 2300,
        mix: { read: 0.85, write: 0.05, static: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 320,
        requirements: ['privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.RelationalDatabases, LessonSlug.CostManagementTools],
      solution: exports({ endpoint: true, replica: true, backup: false, web: MONTH_END_FLEET }),
      naive: exports({ endpoint: true, replica: false, backup: false, web: MONTH_END_FLEET }),
    },
    {
      id: 'bill-ransom',
      scenario: {
        traffic: 900,
        mix: { read: 0.85, write: 0.05, static: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DataLoss,
        latencyTarget: 300,
        budget: 310,
        requirements: ['privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication],
      solution: exports({ endpoint: true, replica: true, backup: true, web: MONTH_END_FLEET }),
      naive: exports({ endpoint: true, replica: true, backup: false, web: MONTH_END_FLEET }),
    },
  ],
};
