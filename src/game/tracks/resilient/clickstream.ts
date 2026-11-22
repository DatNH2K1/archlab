import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, Region, RequirementId } from '@/game/types';

const MIX = { write: 0.9, job: 0.1 };

const EU: Partial<Record<Region, number>> = { 'eu-west-1': 0.8, 'us-east-1': 0.2 };

const RULES: RequirementId[] = ['replayStream', 'drainQueue'];

const stream = (o: {
  region?: Region;
  bus?: ComponentType;
  bus2?: Partial<NodeConfig>;
  db?: Partial<NodeConfig>;
}) => {
  const region = o.region ?? 'us-east-1';

  return makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'api', type: ComponentType.ApiGateway, x: 260, y: 240, config: { region } },
      { id: 'bus', type: o.bus ?? ComponentType.Kinesis, x: 460, y: 240, config: { region, ...o.bus2 } },
      { id: 'dash', type: ComponentType.Lambda, x: 660, y: 140, config: { region } },
      { id: 'fraud', type: ComponentType.Lambda, x: 660, y: 340, config: { region } },
      { id: 'db', type: ComponentType.DynamoDb, x: 880, y: 240, config: { region, ...o.db } },
    ],
    [
      ['users', 'api'],
      ['api', 'bus'],
      ['bus', 'dash'],
      ['bus', 'fraud'],
      ['dash', 'db'],
      ['fraud', 'db'],
    ],
  );
};

const LOCKED = { encrypted: true } satisfies Partial<NodeConfig>;

export const clickstream: Track = {
  id: 'clickstream',
  difficulty: 'hard',
  rounds: [
    {
      id: 'click-ingest',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 120,
        budget: 130,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.DataAnalytics, LessonSlug.AiMlServices],
      solution: stream({}),
      naive: stream({ bus: ComponentType.Sqs }),
    },
    {
      id: 'click-eu',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: EU,
        latencyTarget: 120,
        budget: 130,
        requirements: [...RULES, 'dataResidency'],
      },
      unlocks: [],
      lessons: [LessonSlug.IamOrganizationsScp, LessonSlug.DataAnalytics],
      solution: stream({ region: 'eu-west-1' }),
      naive: stream({ region: 'eu-west-1', db: { region: 'us-east-1' } }),
    },
    {
      id: 'click-encrypt',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: EU,
        latencyTarget: 120,
        budget: 130,
        requirements: [...RULES, 'dataResidency', 'encryptData'],
      },
      unlocks: [],
      lessons: [LessonSlug.DataEncryptionKms],
      solution: stream({ region: 'eu-west-1', bus2: LOCKED, db: LOCKED }),
      naive: stream({ region: 'eu-west-1', db: LOCKED }),
    },
    {
      id: 'click-ransom',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: EU,
        twist: Twist.DataLoss,
        latencyTarget: 120,
        budget: 140,
        requirements: [...RULES, 'dataResidency', 'encryptData'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication, LessonSlug.DataEncryptionKms],
      solution: stream({ region: 'eu-west-1', bus2: LOCKED, db: { ...LOCKED, backup: true } }),
      naive: stream({ region: 'eu-west-1', bus2: LOCKED, db: { ...LOCKED, globalDb: true } }),
    },
    {
      id: 'click-peak',
      scenario: {
        traffic: 360,
        mix: MIX,
        audience: EU,
        twist: Twist.FlashSale,
        latencyTarget: 120,
        budget: 260,
        requirements: [...RULES, 'dataResidency', 'encryptData'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ServerlessWorkflows],
      solution: stream({
        region: 'eu-west-1',
        bus2: { ...LOCKED, size: 'medium' },
        db: { ...LOCKED, backup: true },
      }),
      naive: stream({ region: 'eu-west-1', bus2: LOCKED, db: { ...LOCKED, backup: true } }),
    },
  ],
};
