import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, Region, RequirementId } from '@/game/types';

/** Wallet rules that hold in every round. */
const RULES: RequirementId[] = ['dataResidency', 'encryptData', 'privateData', 'rotateSecrets'];

const MIX = { read: 0.6, write: 0.4 } as const;

const wallet = (o: {
  region?: Region;
  cognito?: boolean;
  waf?: boolean;
  cdn?: boolean;
  backup?: boolean;
  /** Lambda talks to Aurora with its own connections and no secret. */
  direct?: boolean;
}) => {
  const region = o.region ?? 'eu-west-1';
  const at = { region } satisfies Partial<NodeConfig>;
  const db = { ...at, encrypted: true, backup: o.backup ?? false } satisfies Partial<NodeConfig>;

  return makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 260 },
      ...(o.waf ? [{ id: 'shield', type: ComponentType.Waf, x: 220, y: 260 } as const] : []),
      ...(o.cdn ? [{ id: 'cdn', type: ComponentType.CloudFront, x: 360, y: 260, config: { cacheApi: true } } as const] : []),
      { id: 'api', type: ComponentType.ApiGateway, x: 520, y: 260, config: at },
      ...(o.cognito ? [{ id: 'auth', type: ComponentType.Cognito, x: 520, y: 440 } as const] : []),
      { id: 'fn', type: ComponentType.Lambda, x: 720, y: 260, config: at },
      ...(o.direct
        ? []
        : ([
            { id: 'proxy', type: ComponentType.RdsProxy, x: 920, y: 260, config: at },
            { id: 'secret', type: ComponentType.SecretsManager, x: 920, y: 440 },
          ] as const)),
      { id: 'db', type: ComponentType.Aurora, x: 1120, y: 260, config: db },
    ],
    [
      ...(o.waf ? [['users', 'shield'] as const] : []),
      ...(o.cdn ? [[o.waf ? 'shield' : 'users', 'cdn'] as const, ['cdn', 'api'] as const] : [[o.waf ? 'shield' : 'users', 'api'] as const]),
      ...(o.cognito ? [['api', 'auth'] as const] : []),
      ['api', 'fn'],
      ...(o.direct
        ? [['fn', 'db'] as const]
        : ([
            ['fn', 'proxy'],
            ['proxy', 'db'],
            ['proxy', 'secret'],
          ] as const)),
    ],
  );
};

const EUROPE = { 'eu-west-1': 1 } as const;
const ATLANTIC = { 'us-east-1': 0.4, 'eu-west-1': 0.6 } as const;

export const fintechEu: Track = {
  id: 'fintech-eu',
  difficulty: 'hard',
  rounds: [
    {
      id: 'wallet-ledger',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: EUROPE,
        latencyTarget: 200,
        budget: 105,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.SecretsCertificates, LessonSlug.RelationalDatabases, LessonSlug.IamOrganizationsScp],
      solution: wallet({}),
      naive: wallet({ direct: true }),
    },
    {
      id: 'wallet-login',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: EUROPE,
        latencyTarget: 200,
        budget: 110,
        requirements: [...RULES, 'userAuth'],
      },
      unlocks: [],
      lessons: [LessonSlug.IdentityFederationCognito],
      solution: wallet({ cognito: true }),
      naive: wallet({ cognito: true, region: 'us-east-1' }),
    },
    {
      id: 'wallet-bots',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: EUROPE,
        twist: Twist.Ddos,
        latencyTarget: 200,
        budget: 120,
        requirements: [...RULES, 'userAuth', 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.ThreatDetectionWafShield, LessonSlug.DataEncryptionKms],
      solution: wallet({ cognito: true, waf: true }),
      naive: wallet({ cognito: true }),
    },
    {
      id: 'wallet-ransom',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: EUROPE,
        twist: Twist.DataLoss,
        latencyTarget: 200,
        budget: 125,
        requirements: [...RULES, 'userAuth', 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication, LessonSlug.RelationalDatabases],
      solution: wallet({ cognito: true, waf: true, backup: true }),
      naive: wallet({ cognito: true, waf: true }),
    },
    {
      id: 'wallet-us',
      scenario: {
        traffic: 400,
        mix: MIX,
        audience: ATLANTIC,
        twist: Twist.DataLoss,
        latencyTarget: 120,
        budget: 125,
        requirements: [...RULES, 'userAuth', 'webFirewall'],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.IamOrganizationsScp],
      solution: wallet({ cognito: true, waf: true, backup: true, cdn: true }),
      naive: wallet({ cognito: true, waf: true, backup: true }),
    },
  ],
};
