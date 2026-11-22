import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig } from '@/game/types';

const SERVERS = { size: 'large', count: 2, az: 'spread' } satisfies Partial<NodeConfig>;

/** Game servers behind an entry point, keeping match state in DynamoDB. */
const arena = (o: { entry: 'nlb' | 'alb'; ga: boolean; servers?: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      ...(o.ga ? [{ id: 'ga', type: ComponentType.GlobalAccelerator, x: 260, y: 240 } as const] : []),
      {
        id: 'lb',
        type: o.entry === 'nlb' ? ComponentType.Nlb : ComponentType.Alb,
        x: 440,
        y: 240,
      },
      { id: 'game', type: ComponentType.Ec2, x: 640, y: 240, config: o.servers ?? SERVERS },
      { id: 'matches', type: ComponentType.DynamoDb, x: 860, y: 240 },
    ],
    [
      ...(o.ga
        ? [
            ['users', 'ga'],
            ['ga', 'lb'],
          ] as const
        : [['users', 'lb']] as const),
      ['lb', 'game'],
      ['game', 'matches'],
    ],
  );

/** Match telemetry goes to a stream that several apps read, or to a queue that only one can. */
const telemetry = (o: { stream: 'kinesis' | 'sqs'; servers?: Partial<NodeConfig>; streamConfig?: Partial<NodeConfig> }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'ga', type: ComponentType.GlobalAccelerator, x: 260, y: 240 },
      { id: 'lb', type: ComponentType.Nlb, x: 440, y: 240 },
      { id: 'game', type: ComponentType.Ec2, x: 640, y: 240, config: o.servers ?? SERVERS },
      { id: 'matches', type: ComponentType.DynamoDb, x: 860, y: 240 },
      {
        id: 'events',
        type: o.stream === 'kinesis' ? ComponentType.Kinesis : ComponentType.Sqs,
        x: 640,
        y: 440,
        config: o.streamConfig,
      },
      { id: 'cheat', type: ComponentType.Lambda, x: 860, y: 400 },
      { id: 'stats', type: ComponentType.Lambda, x: 860, y: 520 },
    ],
    [
      ['users', 'ga'],
      ['ga', 'lb'],
      ['lb', 'game'],
      ['game', 'matches'],
      ['game', 'events'],
      ['events', 'cheat'],
      ['events', 'stats'],
    ],
  );

/** Bigger instances scale in larger steps, so one covers normal play and three cover the peak. */
const AUTO = { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 } satisfies Partial<NodeConfig>;

/** A copy of the game in each Region behind one accelerator; matches live in a DynamoDB global table. */
const twoRegions = (o: { globalDb: boolean }) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 320 },
      { id: 'ga', type: ComponentType.GlobalAccelerator, x: 240, y: 320 },
      { id: 'dns', type: ComponentType.Route53, x: 400, y: 320 },
      { id: 'lb', type: ComponentType.Nlb, x: 560, y: 160 },
      { id: 'game', type: ComponentType.Ec2, x: 740, y: 160, config: AUTO },
      { id: 'events', type: ComponentType.Kinesis, x: 740, y: 20 },
      { id: 'cheat', type: ComponentType.Lambda, x: 940, y: 0 },
      { id: 'stats', type: ComponentType.Lambda, x: 940, y: 100 },
      { id: 'matches', type: ComponentType.DynamoDb, x: 960, y: 320, config: { globalDb: o.globalDb } },
      { id: 'lb2', type: ComponentType.Nlb, x: 560, y: 480, config: { region: 'eu-west-1' } },
      { id: 'game2', type: ComponentType.Ec2, x: 740, y: 480, config: { ...AUTO, region: 'eu-west-1' } },
      { id: 'events2', type: ComponentType.Kinesis, x: 740, y: 620, config: { region: 'eu-west-1' } },
      { id: 'cheat2', type: ComponentType.Lambda, x: 940, y: 560, config: { region: 'eu-west-1' } },
      { id: 'stats2', type: ComponentType.Lambda, x: 940, y: 660, config: { region: 'eu-west-1' } },
    ],
    [
      ['users', 'ga'],
      ['ga', 'dns'],
      ['dns', 'lb'],
      ['dns', 'lb2'],
      ['lb', 'game'],
      ['game', 'matches'],
      ['game', 'events'],
      ['events', 'cheat'],
      ['events', 'stats'],
      ['lb2', 'game2'],
      ['game2', 'matches'],
      ['game2', 'events2'],
      ['events2', 'cheat2'],
      ['events2', 'stats2'],
    ],
  );

export const realtimeGame: Track = {
  id: 'realtime-game',
  difficulty: 'hard',
  rounds: [
    {
      id: 'rt-udp',
      scenario: {
        traffic: 1500,
        mix: { tcp: 0.85, read: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 120,
        budget: 170,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.Ec2Compute],
      solution: arena({ entry: 'nlb', ga: false }),
      naive: arena({ entry: 'alb', ga: false }),
    },
    {
      id: 'rt-global',
      scenario: {
        traffic: 1500,
        mix: { tcp: 0.85, read: 0.15 },
        audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 },
        latencyTarget: 120,
        budget: 190,
        requirements: [],
      },
      unlocks: [],
      lessons: [LessonSlug.EdgeNetworking, LessonSlug.ElasticLoadBalancing],
      solution: arena({ entry: 'nlb', ga: true }),
      naive: arena({ entry: 'alb', ga: true }),
    },
    {
      id: 'rt-events',
      scenario: {
        traffic: 1500,
        mix: { tcp: 0.75, read: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 },
        latencyTarget: 120,
        budget: 240,
        requirements: ['replayStream', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DataAnalytics, LessonSlug.DecouplingMessaging],
      solution: telemetry({ stream: 'kinesis' }),
      naive: telemetry({ stream: 'sqs' }),
    },
    {
      id: 'rt-tournament',
      scenario: {
        traffic: 1650,
        mix: { tcp: 0.75, read: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 },
        twist: Twist.FlashSale,
        latencyTarget: 120,
        budget: 320,
        requirements: ['replayStream', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.DataAnalytics],
      solution: telemetry({ stream: 'kinesis', servers: AUTO }),
      naive: telemetry({ stream: 'kinesis', servers: { ...SERVERS, size: 'xlarge' } }),
    },
    {
      id: 'rt-region',
      scenario: {
        traffic: 1650,
        mix: { tcp: 0.75, read: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 },
        twist: Twist.RegionOutage,
        latencyTarget: 120,
        budget: 420,
        requirements: ['replayStream', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DisasterRecovery, LessonSlug.Route53Routing],
      solution: twoRegions({ globalDb: true }),
      naive: twoRegions({ globalDb: false }),
    },
  ],
};
