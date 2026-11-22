import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, RequirementId } from '@/game/types';

/** The ops team is gone in every round after the lift-and-shift. */
const SERVERLESS: RequirementId[] = ['noServers'];

const lifted = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium', count: 2, az: 'spread' } },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'medium' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

/** Lambda straight to RDS: every environment opens its own connection. */
const direct = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
    { id: 'fn', type: ComponentType.Lambda, x: 480, y: 240 },
    { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'large' } },
  ],
  [
    ['users', 'lb'],
    ['lb', 'fn'],
    ['fn', 'db'],
  ],
);

const pooled = (o: { secrets: boolean; cache: boolean; db?: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'fn', type: ComponentType.Lambda, x: 480, y: 240 },
      { id: 'proxy', type: ComponentType.RdsProxy, x: 680, y: 240 },
      { id: 'db', type: ComponentType.Rds, x: 880, y: 240, config: { size: 'medium', ...o.db } },
      ...(o.secrets ? [{ id: 'secret', type: ComponentType.SecretsManager, x: 680, y: 420 } as const] : []),
      ...(o.cache ? [{ id: 'cache', type: ComponentType.ElastiCache, x: 680, y: 80 } as const] : []),
    ],
    [
      ['users', 'lb'],
      ['lb', 'fn'],
      ['fn', 'proxy'],
      ['proxy', 'db'],
      ...(o.secrets ? [['proxy', 'secret'] as const] : []),
      ...(o.cache ? [['fn', 'cache'] as const] : []),
    ],
  );

export const legacyCrm: Track = {
  id: 'legacy-crm',
  difficulty: 'medium',
  rounds: [
    {
      id: 'crm-lift',
      scenario: {
        traffic: 400,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 125,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.DataMigration, LessonSlug.RelationalDatabases],
      solution: lifted,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 700, y: 240 },
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'crm-nights',
      scenario: {
        traffic: 500,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 100,
        requirements: SERVERLESS,
      },
      unlocks: [],
      lessons: [LessonSlug.CostComputeServerlessContainers, LessonSlug.RelationalDatabases],
      solution: pooled({ secrets: false, cache: false }),
      naive: direct,
    },
    {
      id: 'crm-rotate',
      scenario: {
        traffic: 500,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 100,
        requirements: [...SERVERLESS, 'rotateSecrets'],
      },
      unlocks: [],
      lessons: [LessonSlug.SecretsCertificates],
      solution: pooled({ secrets: true, cache: false }),
      naive: pooled({ secrets: false, cache: false }),
    },
    {
      id: 'crm-reports',
      scenario: {
        traffic: 850,
        mix: { read: 0.975, write: 0.025 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 300,
        budget: 118,
        requirements: [...SERVERLESS, 'rotateSecrets'],
      },
      unlocks: [],
      lessons: [LessonSlug.NoSqlCaching, LessonSlug.CostDatabaseStorageChoices],
      solution: pooled({ secrets: true, cache: true }),
      naive: pooled({ secrets: true, cache: false, db: { size: 'large' } }),
    },
    {
      id: 'crm-ransom',
      scenario: {
        traffic: 850,
        mix: { read: 0.975, write: 0.025 },
        audience: { 'us-east-1': 1 },
        twist: Twist.DataLoss,
        latencyTarget: 300,
        budget: 150,
        requirements: [...SERVERLESS, 'rotateSecrets'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication, LessonSlug.CostOptimizedArchitectures],
      solution: pooled({ secrets: true, cache: true, db: { backup: true } }),
      naive: pooled({ secrets: true, cache: true }),
    },
  ],
};
