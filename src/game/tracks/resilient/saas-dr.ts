import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig } from '@/game/types';

type Cfg = Partial<NodeConfig>;

const single = (web: Cfg, db: Cfg) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 300, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 520, y: 240, config: web },
      { id: 'db', type: ComponentType.Rds, x: 760, y: 240, config: db },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

const launch = single({ size: 'medium' }, { size: 'medium' });
const multiAz = single({ size: 'medium', count: 2, az: 'spread' }, { size: 'medium', multiAz: true });

const standby = (o: { web: Cfg; db: Cfg; web2: Cfg; cache?: Cfg; dns?: boolean }) => {
  const cached = o.cache !== undefined;

  return makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 300 },
      ...(o.dns === false ? [] : [{ id: 'dns', type: ComponentType.Route53, x: 260, y: 300 } as const]),
      { id: 'lb', type: ComponentType.Alb, x: 440, y: 160 },
      { id: 'web', type: ComponentType.Ec2, x: 640, y: 160, config: o.web },
      // Aurora Global Database: one cluster with a managed copy in eu-west-1.
      { id: 'db', type: ComponentType.Aurora, x: 860, y: 300, config: { ...o.db, globalDb: true } },
      ...(cached
        ? [
            { id: 'cache', type: ComponentType.ElastiCache, x: 860, y: 20, config: o.cache } as const,
            { id: 'cache2', type: ComponentType.ElastiCache, x: 860, y: 590, config: { ...o.cache, region: 'eu-west-1' } } as const,
          ]
        : []),
      { id: 'lb2', type: ComponentType.Alb, x: 440, y: 440, config: { region: 'eu-west-1' } },
      { id: 'web2', type: ComponentType.Ec2, x: 640, y: 440, config: { ...o.web2, region: 'eu-west-1' } },
    ],
    [
      ...(o.dns === false
        ? [
            ['users', 'lb'],
            ['users', 'lb2'],
          ] as const
        : [
            ['users', 'dns'],
            ['dns', 'lb'],
            ['dns', 'lb2'],
          ] as const),
      ['lb', 'web'],
      ['web', 'db'],
      ['lb2', 'web2'],
      ['web2', 'db'],
      ...(cached
        ? [
            ['web', 'cache'],
            ['web2', 'cache2'],
          ] as const
        : []),
    ],
  );
};

const warmCfg = {
  web: { size: 'medium', count: 2, az: 'spread' },
  db: { size: 'small' },
  web2: { size: 'medium', count: 1, autoScaling: true, maxCount: 3 },
} satisfies Parameters<typeof standby>[0];
const warm = standby(warmCfg);

const enc = { encrypted: true };
const lockedCfg = {
  ...warmCfg,
  db: { ...warmCfg.db, ...enc },
};
const locked = standby(lockedCfg);

const activeCfg = {
  web: { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 4 },
  db: { size: 'small', encrypted: true },
  web2: { size: 'medium', count: 2, autoScaling: true, maxCount: 4 },
  cache: { encrypted: true },
} satisfies Parameters<typeof standby>[0];
const active = standby(activeCfg);

const reserved = standby({
  ...activeCfg,
  web: { ...activeCfg.web, pricing: 'reserved' },
  web2: { ...activeCfg.web2, pricing: 'reserved' },
});

const compliance = ['encryptData', 'privateData', 'noPublicServers'] as const;

export const saasDr: Track = {
  id: 'saas-dr',
  difficulty: 'hard',
  rounds: [
    {
      id: 'dr-1-launch',
      scenario: { traffic: 300, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 90, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.RelationalDatabases],
      solution: launch,
      naive: makeBoard(
        [
          { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
          { id: 'web', type: ComponentType.Ec2, x: 360, y: 240, config: { size: 'medium' } },
          { id: 'db', type: ComponentType.Rds, x: 640, y: 240, config: { size: 'small' } },
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'dr-2-az',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: Twist.AzOutage, latencyTarget: 200, budget: 155, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.HighAvailabilityMultiAz],
      solution: multiAz,
      naive: single({ size: 'medium', count: 2, az: 'spread' }, { size: 'medium' }),
    },
    {
      id: 'dr-3-region',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: Twist.RegionOutage, latencyTarget: 150, budget: 250, requirements: [] },
      unlocks: [],
      lessons: [LessonSlug.DisasterRecovery, LessonSlug.Route53Routing],
      solution: warm,
      naive: standby({ ...warmCfg, dns: false }),
    },
    {
      id: 'dr-4-comply',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: Twist.RegionOutage, latencyTarget: 150, budget: 250, requirements: [...compliance] },
      unlocks: [],
      lessons: [LessonSlug.DataEncryptionKms, LessonSlug.VpcNetworkingSecurity],
      solution: locked,
      naive: warm,
    },
    {
      id: 'dr-5-active',
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: Twist.RegionOutage, latencyTarget: 120, budget: 330, requirements: [...compliance] },
      unlocks: [],
      lessons: [LessonSlug.Route53Routing, LessonSlug.NoSqlCaching],
      solution: active,
      naive: locked,
    },
    {
      id: 'dr-6-reserved',
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: Twist.RegionOutage, latencyTarget: 120, budget: 280, requirements: [...compliance] },
      unlocks: [],
      lessons: [LessonSlug.Ec2PricingModels, LessonSlug.CostManagementTools],
      solution: reserved,
      naive: active,
    },
  ],
};
