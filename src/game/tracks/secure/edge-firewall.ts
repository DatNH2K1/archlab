import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig, RequirementId } from '@/game/types';

/** Compliance rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'noPublicServers', 'inspectTraffic'];

const WEB = { size: 'medium', count: 2, az: 'spread' } satisfies Partial<NodeConfig>;

/** Packet inspection in front of the web tier, entered directly or through Global Accelerator. */
const inspected = (o: { ga: boolean; db: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      ...(o.ga ? [{ id: 'ga', type: ComponentType.GlobalAccelerator, x: 240, y: 240 } as const] : []),
      { id: 'gwlb', type: ComponentType.Gwlb, x: 400, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 580, y: 240 },
      { id: 'web', type: ComponentType.Ec2, x: 760, y: 240, config: WEB },
      { id: 'db', type: ComponentType.Rds, x: 960, y: 240, config: { size: 'medium', encrypted: true, ...o.db } },
    ],
    [
      ...(o.ga
        ? [
            ['users', 'ga'],
            ['ga', 'gwlb'],
          ] as const
        : [['users', 'gwlb']] as const),
      ['gwlb', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

/** Adds an NLB and a FIX gateway group for raw TCP order flow beside the HTTP path. */
const withFix = (o: { db: Partial<NodeConfig>; fix: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 280 },
      { id: 'ga', type: ComponentType.GlobalAccelerator, x: 240, y: 280 },
      { id: 'gwlb', type: ComponentType.Gwlb, x: 400, y: 280 },
      { id: 'lb', type: ComponentType.Alb, x: 580, y: 180 },
      { id: 'web', type: ComponentType.Ec2, x: 760, y: 180, config: WEB },
      { id: 'nlb', type: ComponentType.Nlb, x: 580, y: 400 },
      { id: 'fix', type: ComponentType.Ec2, x: 760, y: 400, config: { count: 2, ...o.fix } },
      { id: 'db', type: ComponentType.Rds, x: 960, y: 180, config: { size: 'medium', encrypted: true, ...o.db } },
    ],
    [
      ['users', 'ga'],
      ['ga', 'gwlb'],
      ['gwlb', 'lb'],
      ['gwlb', 'nlb'],
      ['lb', 'web'],
      ['nlb', 'fix'],
      ['web', 'db'],
    ],
  );

const wafOnly = makeBoard(
  [
    { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
    { id: 'shield', type: ComponentType.Waf, x: 240, y: 240 },
    { id: 'lb', type: ComponentType.Alb, x: 400, y: 240 },
    { id: 'web', type: ComponentType.Ec2, x: 580, y: 240, config: WEB },
    { id: 'db', type: ComponentType.Rds, x: 780, y: 240, config: { size: 'medium', encrypted: true } },
  ],
  [
    ['users', 'shield'],
    ['shield', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const MIX = { read: 0.8, write: 0.2 };
const FIX_MIX = { read: 0.55, write: 0.15, tcp: 0.3 };

export const edgeFirewall: Track = {
  id: 'edge-firewall',
  difficulty: 'hard',
  rounds: [
    {
      id: 'fw-inspect',
      scenario: {
        traffic: 500,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 150,
        requirements: RULES,
      },
      unlocks: [],
      lessons: [LessonSlug.SecurityLayersOverview, LessonSlug.ElasticLoadBalancing],
      solution: inspected({ ga: false, db: {} }),
      naive: wafOnly,
    },
    {
      id: 'fw-partners',
      scenario: {
        traffic: 500,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 170,
        requirements: [...RULES, 'staticIp'],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.VpcNetworkingSecurity],
      solution: inspected({ ga: true, db: {} }),
      naive: inspected({ ga: false, db: {} }),
    },
    {
      id: 'fw-fix',
      scenario: {
        traffic: 600,
        mix: FIX_MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 225,
        requirements: [...RULES, 'staticIp'],
      },
      unlocks: [],
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.ThreatDetectionWafShield],
      solution: withFix({ db: {}, fix: { az: 'spread' } }),
      naive: inspected({ ga: true, db: {} }),
    },
    {
      id: 'fw-az',
      scenario: {
        traffic: 600,
        mix: FIX_MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.AzOutage,
        latencyTarget: 150,
        budget: 260,
        requirements: [...RULES, 'staticIp'],
      },
      unlocks: [],
      lessons: [LessonSlug.HighAvailabilityMultiAz],
      solution: withFix({ db: { multiAz: true }, fix: { az: 'spread' } }),
      naive: withFix({ db: {}, fix: { az: 'spread' } }),
    },
    {
      id: 'fw-ransom',
      scenario: {
        traffic: 600,
        mix: FIX_MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.DataLoss,
        latencyTarget: 150,
        budget: 275,
        requirements: [...RULES, 'staticIp'],
      },
      unlocks: [],
      lessons: [LessonSlug.BackupReplication, LessonSlug.SecurityLayersOverview],
      solution: withFix({ db: { multiAz: true, backup: true }, fix: { az: 'spread' } }),
      naive: withFix({ db: { multiAz: true }, fix: { az: 'spread' } }),
    },
  ],
};
