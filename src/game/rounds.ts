import type messages from '@/locales/vi.json';
import { makeBoard } from './board';
import { LEARN_TEXT } from './learnText';
import type { Board, ComponentType, Scenario } from './types';

export const CHAPTERS = ['basics', 'resilience', 'performance', 'decoupling', 'security', 'cost', 'final'] as const;

export type ChapterId = (typeof CHAPTERS)[number];

export type LessonSlug = keyof typeof messages.LessonTitles;

/** What the player reads about a round, in one language. */
export type RoundText = {
  title: string;
  /** What happens to the app this round. */
  story: string;
  /** The design idea the round teaches. */
  concept: string;
  /** First hint, before showing the reference design. */
  nudge: string;
};

export type Round = {
  /** Unique across Learn and every design problem; also the key of saved progress. */
  id: string;
  text: { vi: RoundText; en: RoundText };
  scenario: Scenario;
  /** Components added to the palette by this round (Learn only). */
  unlocks: ComponentType[];
  /** Lesson slugs that explain the idea of the round. */
  lessons: LessonSlug[];
  /** Board the round starts from, when it is not the previous round's board. */
  starter?: Board;
  /** A design that passes, shown as the last hint. */
  solution: Board;
  /** A plausible design that must fail; used by tests to keep the round meaningful. */
  naive?: Board;
};

export type LearnRound = Round & { chapter: ChapterId };

/** A design problem: several rounds on one product, like a system design interview. */
export type Track = {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: {
    vi: { title: string; pitch: string; tags: string[] };
    en: { title: string; pitch: string; tags: string[] };
  };
  rounds: Round[];
};

const ROUNDS_DATA: Omit<LearnRound, 'text'>[] = [
  {
    id: 'first-users',
    chapter: 'basics',
    scenario: { traffic: 50, mix: { read: 0.7, write: 0.3 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 35, requirements: [] },
    unlocks: ['ec2', 'rds'],
    lessons: ['ec2-compute', 'relational-databases'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['web', 'ec2', 360, 240],
        ['db', 'rds', 640, 240],
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'scale-up',
    chapter: 'basics',
    scenario: { traffic: 350, mix: { read: 0.7, write: 0.3 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 70, requirements: [] },
    unlocks: [],
    lessons: ['ec2-compute'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['web', 'ec2', 360, 240, { size: 'medium' }],
        ['db', 'rds', 640, 240, { size: 'medium' }],
      ],
      [
        ['users', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'scale-out',
    chapter: 'basics',
    scenario: {
      traffic: 1300,
      mix: { read: 0.85, write: 0.15 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 170,
      requirements: [],
    },
    unlocks: ['alb'],
    lessons: ['elastic-load-balancing'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'medium', count: 3 }],
        ['db', 'rds', 760, 240, { size: 'large' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'az-outage',
    chapter: 'resilience',
    scenario: {
      traffic: 400,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: 'azOutage',
      latencyTarget: 300,
      budget: 150,
      requirements: [],
    },
    unlocks: [],
    lessons: ['high-availability-multi-az'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'medium', count: 2, az: 'spread' }],
        ['db', 'rds', 760, 240, { size: 'medium', multiAz: true }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'flash-sale',
    chapter: 'resilience',
    scenario: {
      traffic: 220,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: 'flashSale',
      latencyTarget: 300,
      budget: 130,
      requirements: [],
    },
    unlocks: [],
    lessons: ['auto-scaling'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'medium', count: 1, autoScaling: true, maxCount: 3 }],
        ['db', 'rds', 760, 240, { size: 'large' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'region-down',
    chapter: 'resilience',
    scenario: {
      traffic: 300,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: 'regionOutage',
      outageRegion: 'us-east-1',
      latencyTarget: 300,
      budget: 220,
      requirements: [],
    },
    unlocks: ['route53', 'aurora'],
    lessons: ['disaster-recovery', 'route53-routing', 'backup-replication'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 280],
        ['dns', 'route53', 260, 280],
        ['lb1', 'alb', 440, 140],
        ['web1', 'ec2', 640, 140, { size: 'medium', count: 2, az: 'spread' }],
        ['db1', 'aurora', 860, 140],
        ['lb2', 'alb', 440, 420, { region: 'eu-west-1' }],
        ['web2', 'ec2', 640, 420, { size: 'medium', region: 'eu-west-1' }],
        ['db2', 'aurora', 860, 420, { region: 'eu-west-1' }],
      ],
      [
        ['users', 'dns'],
        ['dns', 'lb1'],
        ['dns', 'lb2'],
        ['lb1', 'web1'],
        ['web1', 'db1'],
        ['lb2', 'web2'],
        ['web2', 'db2'],
      ],
    ),
  },
  {
    id: 'cache-it',
    chapter: 'performance',
    scenario: {
      traffic: 2000,
      mix: { read: 0.95, write: 0.05 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 200,
      requirements: [],
    },
    unlocks: ['elasticache'],
    lessons: ['nosql-caching'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'large', count: 2 }],
        ['cache', 'elasticache', 760, 120],
        ['db', 'rds', 760, 340, { size: 'medium' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'cache-crash',
    chapter: 'performance',
    scenario: {
      traffic: 2000,
      mix: { read: 0.95, write: 0.05 },
      audience: { 'us-east-1': 1 },
      twist: 'cacheCrash',
      latencyTarget: 300,
      budget: 215,
      requirements: [],
    },
    unlocks: ['readReplica'],
    lessons: ['nosql-caching', 'relational-databases'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'large', count: 2 }],
        ['cache', 'elasticache', 760, 120, { multiAz: true }],
        ['db', 'rds', 760, 340, { size: 'medium' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'static-files',
    chapter: 'performance',
    scenario: {
      traffic: 4000,
      mix: { static: 0.85, read: 0.12, write: 0.03 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 200,
      requirements: [],
    },
    unlocks: ['s3', 'cloudfront'],
    lessons: ['s3-performance', 'edge-networking'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['cdn', 'cloudfront', 260, 240],
        ['files', 's3', 480, 100],
        ['lb', 'alb', 480, 300],
        ['web', 'ec2', 680, 300, { size: 'large' }],
        ['db', 'rds', 880, 300, { size: 'large' }],
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'global-users',
    chapter: 'performance',
    scenario: {
      traffic: 800,
      mix: { static: 0.4, read: 0.5, write: 0.1 },
      audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
      latencyTarget: 140,
      budget: 120,
      requirements: [],
    },
    unlocks: ['globalAccelerator'],
    lessons: ['edge-networking'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
        ['files', 's3', 480, 100],
        ['lb', 'alb', 480, 300],
        ['web', 'ec2', 680, 300, { size: 'medium' }],
        ['db', 'rds', 880, 300, { size: 'medium' }],
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'background-jobs',
    chapter: 'decoupling',
    scenario: {
      traffic: 400,
      mix: { read: 0.5, write: 0.2, job: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 150,
      budget: 130,
      requirements: ['drainQueue'],
    },
    unlocks: ['sqs'],
    lessons: ['decoupling-messaging'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 280, 240],
        ['web', 'ec2', 480, 240, { size: 'medium' }],
        ['db', 'rds', 720, 240, { size: 'medium' }],
        ['queue', 'sqs', 480, 420],
        ['worker', 'ec2', 720, 420, { size: 'medium' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
  {
    id: 'fan-out',
    chapter: 'decoupling',
    scenario: {
      traffic: 300,
      mix: { read: 0.6, write: 0.1, job: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 150,
      budget: 145,
      requirements: ['fanOut', 'drainQueue'],
    },
    unlocks: ['sns'],
    lessons: ['decoupling-messaging'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 260, 240],
        ['web', 'ec2', 440, 240, { size: 'medium' }],
        ['db', 'rds', 680, 120, { size: 'small' }],
        ['topic', 'sns', 440, 420],
        ['q1', 'sqs', 640, 340],
        ['q2', 'sqs', 640, 500],
        ['mail', 'ec2', 860, 340, { size: 'medium' }],
        ['stats', 'ec2', 860, 500, { size: 'medium' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'topic'],
        ['topic', 'q1'],
        ['topic', 'q2'],
        ['q1', 'mail'],
        ['q2', 'stats'],
      ],
    ),
  },
  {
    id: 'lock-it-down',
    chapter: 'security',
    scenario: {
      traffic: 300,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 100,
      requirements: ['encryptData', 'privateData', 'noPublicServers'],
    },
    unlocks: [],
    lessons: ['vpc-networking-security', 'data-encryption-kms'],
    starter: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['web', 'ec2', 360, 240, { size: 'medium' }],
        ['db', 'rds', 640, 240, { size: 'medium' }],
      ],
      [
        ['users', 'web'],
        ['users', 'db'],
        ['web', 'db'],
      ],
    ),
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 280, 240],
        ['web', 'ec2', 480, 240, { size: 'medium' }],
        ['db', 'rds', 720, 240, { size: 'medium', encrypted: true }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'bot-attack',
    chapter: 'security',
    scenario: {
      traffic: 300,
      mix: { read: 0.8, write: 0.2 },
      audience: { 'us-east-1': 1 },
      twist: 'ddos',
      latencyTarget: 300,
      budget: 110,
      requirements: [],
    },
    unlocks: ['waf'],
    lessons: ['threat-detection-waf-shield'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['shield', 'waf', 260, 240],
        ['lb', 'alb', 440, 240],
        ['web', 'ec2', 620, 240, { size: 'medium' }],
        ['db', 'rds', 820, 240, { size: 'medium' }],
      ],
      [
        ['users', 'shield'],
        ['shield', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'serverless',
    chapter: 'cost',
    scenario: { traffic: 20, mix: { read: 0.6, write: 0.4 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 12, requirements: [] },
    unlocks: ['apiGateway', 'lambda', 'dynamodb'],
    lessons: ['serverless-workflows', 'cost-optimized-architectures'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['api', 'apiGateway', 300, 240],
        ['fn', 'lambda', 520, 240],
        ['table', 'dynamodb', 740, 240],
      ],
      [
        ['users', 'api'],
        ['api', 'fn'],
        ['fn', 'table'],
      ],
    ),
  },
  {
    id: 'spot-workers',
    chapter: 'cost',
    scenario: {
      traffic: 300,
      mix: { read: 0.3, write: 0.1, job: 0.6 },
      audience: { 'us-east-1': 1 },
      twist: 'spotInterruption',
      latencyTarget: 150,
      budget: 120,
      requirements: ['drainQueue'],
    },
    unlocks: [],
    lessons: ['ec2-pricing-models'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 280, 240],
        ['web', 'ec2', 480, 240, { size: 'medium' }],
        ['db', 'rds', 720, 240, { size: 'small' }],
        ['queue', 'sqs', 480, 420],
        ['worker', 'ec2', 720, 420, { size: 'large', count: 2, pricing: 'spot' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
  {
    id: 'steady-table',
    chapter: 'cost',
    scenario: {
      traffic: 2000,
      mix: { read: 0.7, write: 0.3 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 230,
      requirements: [],
    },
    unlocks: [],
    lessons: ['nosql-caching', 'cost-database-storage-choices'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'large', count: 2, az: 'spread' }],
        ['table', 'dynamodb', 760, 240, { provisioned: true, size: 'large' }],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'table'],
      ],
    ),
  },
  {
    id: 'reserved',
    chapter: 'cost',
    scenario: {
      traffic: 1000,
      mix: { read: 0.85, write: 0.15 },
      audience: { 'us-east-1': 1 },
      latencyTarget: 300,
      budget: 120,
      requirements: [],
    },
    unlocks: [],
    lessons: ['ec2-pricing-models', 'cost-management-tools'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 240],
        ['lb', 'alb', 300, 240],
        ['web', 'ec2', 520, 240, { size: 'medium', count: 3, pricing: 'reserved' }],
        ['db', 'rds', 760, 240, { size: 'medium' }],
        ['cache', 'elasticache', 760, 80],
      ],
      [
        ['users', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
      ],
    ),
  },
  {
    id: 'final-boss',
    chapter: 'final',
    scenario: {
      traffic: 1500,
      mix: { static: 0.5, read: 0.35, write: 0.05, job: 0.1 },
      audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
      twist: 'azOutage',
      latencyTarget: 150,
      budget: 330,
      requirements: ['encryptData', 'privateData', 'noPublicServers', 'drainQueue'],
    },
    unlocks: [],
    lessons: ['high-availability-multi-az', 'edge-networking', 'decoupling-messaging', 'data-encryption-kms'],
    solution: makeBoard(
      [
        ['users', 'users', 80, 280],
        ['cdn', 'cloudfront', 240, 280, { cacheApi: true }],
        ['files', 's3', 420, 100],
        ['lb', 'alb', 420, 280],
        ['web', 'ec2', 600, 280, { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 4 }],
        ['cache', 'elasticache', 820, 140, { multiAz: true, encrypted: true }],
        ['db', 'rds', 820, 300, { size: 'medium', multiAz: true, encrypted: true }],
        ['queue', 'sqs', 600, 460, { encrypted: true }],
        ['worker', 'ec2', 820, 460, { size: 'medium', count: 2, az: 'spread' }],
      ],
      [
        ['users', 'cdn'],
        ['cdn', 'files'],
        ['cdn', 'lb'],
        ['lb', 'web'],
        ['web', 'cache'],
        ['web', 'db'],
        ['web', 'queue'],
        ['queue', 'worker'],
        ['worker', 'db'],
      ],
    ),
  },
];

export const ROUNDS: LearnRound[] = ROUNDS_DATA.map((round) => {
  const text = LEARN_TEXT[round.id];

  if (!text) {
    throw new Error(`Missing text for round ${round.id}`);
  }

  return { ...round, text };
});

/**
 * Lists the components a player can use in a Learn round.
 * @param index Position of the round in the campaign.
 * @returns Unlocked component types, oldest first.
 */
export const unlockedAt = (index: number) => ROUNDS.slice(0, index + 1).flatMap((round) => round.unlocks);
