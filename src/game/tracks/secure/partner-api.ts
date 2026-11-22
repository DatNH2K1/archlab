import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, RequirementId } from '@/game/types';

/** Rules partners and auditors set for every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'noPublicServers', 'staticIp'];

const WEB = { size: 'medium', count: 2, az: 'spread' } satisfies Partial<NodeConfig>;

/** NLB with static IPs in front of the API servers; optionally a secret and a private path to S3. */
const api = (o: {
  entry?: 'nlb' | 'alb';
  secret: boolean;
  files?: 'endpoint' | 'direct';
  db?: Partial<NodeConfig>;
  bucket?: Partial<NodeConfig>;
  web?: Partial<NodeConfig>;
}) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: o.entry === 'alb' ? ComponentType.Alb : ComponentType.Nlb, x: 280, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 480, y: 240, config: { ...WEB, ...o.web } },
      { id: 'db', type: ComponentType.Rds, x: 700, y: 240, config: { size: 'medium', encrypted: true, ...o.db } },
      ...(o.secret ? [{ id: 'secret', type: ComponentType.SecretsManager, x: 700, y: 80 } as const] : []),
      ...(o.files === 'endpoint' ? [{ id: 'vpce', type: ComponentType.VpcEndpoint, x: 600, y: 420 } as const] : []),
      ...(o.files ? [{ id: 'files', type: ComponentType.S3, x: 800, y: 420, config: o.bucket } as const] : []),
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
      ...(o.secret ? [['web', 'secret'] as const] : []),
      ...(o.files === 'endpoint'
        ? [
            ['web', 'vpce'],
            ['vpce', 'files'],
          ] as const
        : []),
      ...(o.files === 'direct' ? [['web', 'files'] as const] : []),
    ],
  );

/** Auto Scaling replaces the servers lost with an AZ. */
const AZ = {
  secret: true,
  files: 'endpoint',
  bucket: { backup: true },
  web: { autoScaling: true, maxCount: 4 },
} as const;

const MIX = { read: 0.7, write: 0.3 };
const FILES_MIX = { read: 0.35, write: 0.15, static: 0.5 };

export const partnerApi: Track = {
  id: 'partner-api',
  difficulty: 'medium',
  rounds: [
    {
      id: 'partner-allowlist',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 125,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.DataEncryptionKms],
      solution: api({ secret: false }),
      naive: api({ entry: 'alb', secret: false }),
    },
    {
      id: 'partner-secrets',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 125,
        requirements: [...RULES, 'rotateSecrets'],
      },
      unlocks: [],
      lessons: [LessonSlug.SecretsCertificates],
      solution: api({ secret: true }),
      naive: api({ secret: false }),
    },
    {
      id: 'partner-files',
      scenario: {
        traffic: 800,
        mix: FILES_MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 130,
        requirements: [...RULES, 'rotateSecrets', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.VpcConnectivity, LessonSlug.BlockFileStorage],
      solution: api({ secret: true, files: 'endpoint' }),
      naive: api({ secret: true, files: 'direct' }),
    },
    {
      id: 'partner-ransom',
      scenario: {
        traffic: 800,
        mix: FILES_MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.DataLoss,
        latencyTarget: 150,
        budget: 140,
        requirements: [...RULES, 'rotateSecrets', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication],
      solution: api({ secret: true, files: 'endpoint', db: { backup: true }, bucket: { backup: true } }),
      naive: api({ secret: true, files: 'endpoint', db: { backup: true } }),
    },
    {
      id: 'partner-az',
      scenario: {
        traffic: 800,
        mix: FILES_MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.AzOutage,
        latencyTarget: 150,
        budget: 230,
        requirements: [...RULES, 'rotateSecrets', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.HighAvailabilityMultiAz],
      solution: api({ ...AZ, db: { backup: true, multiAz: true } }),
      naive: api({ ...AZ, db: { backup: true } }),
    },
  ],
};
