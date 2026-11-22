import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;

const single = (web: Cfg, db: Cfg) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['lb', 'alb', 300, 240],
      ['web', 'ec2', 520, 240, web],
      ['db', 'rds', 760, 240, db],
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
      ['users', 'users', 80, 300],
      ...(o.dns === false ? [] : [['dns', 'route53', 260, 300] as const]),
      ['lb', 'alb', 440, 160],
      ['web', 'ec2', 640, 160, o.web],
      // Aurora Global Database: one cluster with a managed copy in eu-west-1.
      ['db', 'aurora', 860, 300, { ...o.db, globalDb: true }],
      ...(cached ? [['cache', 'elasticache', 860, 20, o.cache] as const, ['cache2', 'elasticache', 860, 590, { ...o.cache, region: 'eu-west-1' }] as const] : []),
      ['lb2', 'alb', 440, 440, { region: 'eu-west-1' }],
      ['web2', 'ec2', 640, 440, { ...o.web2, region: 'eu-west-1' }],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.dns === false
        ? ([
            ['users', 'lb'],
            ['users', 'lb2'],
          ] as [string, string][])
        : ([
            ['users', 'dns'],
            ['dns', 'lb'],
            ['dns', 'lb2'],
          ] as [string, string][])),
      ['lb', 'web'],
      ['web', 'db'],
      ['lb2', 'web2'],
      ['web2', 'db'],
      ...(cached
        ? ([
            ['web', 'cache'],
            ['web2', 'cache2'],
          ] as [string, string][])
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
      lessons: ['elastic-load-balancing', 'relational-databases'],
      solution: launch,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 360, 240, { size: 'medium' }],
          ['db', 'rds', 640, 240, { size: 'small' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'dr-2-az',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'azOutage', latencyTarget: 200, budget: 155, requirements: [] },
      unlocks: [],
      lessons: ['high-availability-multi-az'],
      solution: multiAz,
      naive: single({ size: 'medium', count: 2, az: 'spread' }, { size: 'medium' }),
    },
    {
      id: 'dr-3-region',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 150, budget: 250, requirements: [] },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing'],
      solution: warm,
      naive: standby({ ...warmCfg, dns: false }),
    },
    {
      id: 'dr-4-comply',
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 150, budget: 250, requirements: [...compliance] },
      unlocks: [],
      lessons: ['data-encryption-kms', 'vpc-networking-security'],
      solution: locked,
      naive: warm,
    },
    {
      id: 'dr-5-active',
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 330, requirements: [...compliance] },
      unlocks: [],
      lessons: ['route53-routing', 'nosql-caching'],
      solution: active,
      naive: locked,
    },
    {
      id: 'dr-6-reserved',
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 280, requirements: [...compliance] },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'cost-management-tools'],
      solution: reserved,
      naive: active,
    },
  ],
};
