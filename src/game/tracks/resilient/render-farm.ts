import { LessonSlug } from '@/content/types';
import { makeBoard } from '@/game/board';
import type { Track } from '@/game/rounds';
import { ComponentType, Twist } from '@/game/types';
import type { NodeConfig } from '@/game/types';

const MIX = { read: 0.6, write: 0.25, batch: 0.15 };

const web = (o: { type?: ComponentType; config?: Partial<NodeConfig> } = {}) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'web', type: o.type ?? ComponentType.Fargate, x: 480, y: 240, config: { count: 2, ...o.config } },
      { id: 'db', type: ComponentType.DynamoDb, x: 720, y: 240 },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

const jobs = (o: {
  worker?: ComponentType;
  workerConfig?: Partial<NodeConfig>;
  webConfig?: Partial<NodeConfig>;
  endpoint: boolean;
}) =>
  makeBoard(
    [
      { id: 'users', type: ComponentType.Users, x: 80, y: 240 },
      { id: 'lb', type: ComponentType.Alb, x: 280, y: 240 },
      { id: 'web', type: ComponentType.Fargate, x: 480, y: 240, config: { count: 2, ...o.webConfig } },
      ...(o.endpoint ? [{ id: 'vpce', type: ComponentType.VpcEndpoint, x: 640, y: 240 } as const] : []),
      { id: 'db', type: ComponentType.DynamoDb, x: 820, y: 240 },
      { id: 'queue', type: ComponentType.Sqs, x: 480, y: 420 },
      { id: 'worker', type: o.worker ?? ComponentType.Fargate, x: 720, y: 420, config: o.workerConfig ?? { count: 2 } },
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ...(o.endpoint
        ? ([
            ['web', 'vpce'],
            ['vpce', 'db'],
          ] as const)
        : ([['web', 'db']] as const)),
      ['web', 'queue'],
      ['queue', 'worker'],
    ],
  );

const SPOT_WORKER = { size: 'large', pricing: 'spot' } satisfies Partial<NodeConfig>;

export const renderFarm: Track = {
  id: 'render-farm',
  difficulty: 'medium',
  rounds: [
    {
      id: 'render-web',
      scenario: {
        traffic: 300,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 85,
        requirements: ['noServers'],
      },
      unlocks: [],
      lessons: [LessonSlug.ContainersCompute, LessonSlug.CostComputeServerlessContainers],
      solution: web(),
      naive: web({ type: ComponentType.Ec2 }),
    },
    {
      id: 'render-jobs',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 135,
        requirements: ['noServers', 'drainQueue'],
      },
      unlocks: [],
      lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ContainersCompute],
      solution: jobs({ endpoint: false }),
      naive: jobs({ endpoint: false, worker: ComponentType.Lambda, workerConfig: {} }),
    },
    {
      id: 'render-egress',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 135,
        requirements: ['noServers', 'drainQueue', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.VpcConnectivity, LessonSlug.CostNetworkTransfer],
      solution: jobs({ endpoint: true }),
      naive: jobs({ endpoint: false }),
    },
    {
      id: 'render-spot',
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.SpotInterruption,
        latencyTarget: 150,
        budget: 108,
        requirements: ['noServers', 'drainQueue', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.Ec2PricingModels, LessonSlug.DecouplingMessaging],
      solution: jobs({ endpoint: true, workerConfig: SPOT_WORKER }),
      naive: jobs({ endpoint: true, workerConfig: { count: 2, pricing: 'spot' } }),
    },
    {
      id: 'render-cycle',
      scenario: {
        traffic: 600,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: Twist.DailyCycle,
        latencyTarget: 150,
        budget: 132,
        requirements: ['noServers', 'drainQueue', 'privateEgress'],
      },
      unlocks: [],
      lessons: [LessonSlug.AutoScaling, LessonSlug.ManagementIac],
      solution: jobs({
        endpoint: true,
        webConfig: { count: 1, autoScaling: true, maxCount: 4 },
        workerConfig: SPOT_WORKER,
      }),
      naive: jobs({ endpoint: true, webConfig: { count: 4 }, workerConfig: SPOT_WORKER }),
    },
  ],
};
