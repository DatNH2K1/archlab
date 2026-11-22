import { ComponentType } from './types';
import type { NodeConfig, RequestClass, Size } from './types';

type ComponentCategory = 'entry' | 'edge' | 'network' | 'compute' | 'data' | 'messaging';

/** Inspector settings a component exposes. */
export type ConfigField =
  | 'size'
  | 'count'
  | 'az'
  | 'region'
  | 'pricing'
  | 'autoScaling'
  | 'multiAz'
  | 'encrypted'
  | 'provisioned'
  | 'cacheApi'
  | 'globalDb';

type ComponentSpec = {
  category: ComponentCategory;
  /** Short label printed on the board. */
  label: string;
  /** Requests a component takes from its parent. */
  accepts: RequestClass[];
  fields: ConfigField[];
  /** Survives the loss of one AZ without extra settings. */
  regional: boolean;
  /** Lives outside any Region, so a Region outage does not touch it. */
  global: boolean;
  /** Own processing time in ms. */
  latency: number;
};

const ALL: RequestClass[] = ['read', 'write', 'static', 'job', 'attack'];

export const CATALOG: Record<ComponentType, ComponentSpec> = {
  [ComponentType.Users]: {
    category: 'entry',
    label: 'Users',
    accepts: [],
    fields: [],
    regional: true,
    global: true,
    latency: 0,
  },
  [ComponentType.Route53]: {
    category: 'network',
    label: 'Route 53',
    accepts: ALL,
    fields: [],
    regional: true,
    global: true,
    latency: 0,
  },
  [ComponentType.GlobalAccelerator]: {
    category: 'network',
    label: 'Global Accelerator',
    accepts: ALL,
    fields: [],
    regional: true,
    global: true,
    latency: 2,
  },
  [ComponentType.Waf]: {
    category: 'edge',
    label: 'WAF',
    accepts: ALL,
    fields: [],
    regional: true,
    global: true,
    latency: 1,
  },
  [ComponentType.CloudFront]: {
    category: 'edge',
    label: 'CloudFront',
    accepts: ALL,
    fields: ['cacheApi'],
    regional: true,
    global: true,
    latency: 8,
  },
  [ComponentType.Alb]: {
    category: 'network',
    label: 'ALB',
    accepts: ALL,
    fields: ['region'],
    regional: true,
    global: false,
    latency: 4,
  },
  [ComponentType.ApiGateway]: {
    category: 'network',
    label: 'API Gateway',
    accepts: ALL,
    fields: ['region'],
    regional: true,
    global: false,
    latency: 12,
  },
  [ComponentType.Ec2]: {
    category: 'compute',
    label: 'EC2',
    accepts: ALL,
    fields: ['size', 'count', 'az', 'pricing', 'autoScaling', 'region'],
    regional: false,
    global: false,
    latency: 30,
  },
  [ComponentType.Lambda]: {
    category: 'compute',
    label: 'Lambda',
    accepts: ALL,
    fields: ['provisioned', 'region'],
    regional: true,
    global: false,
    latency: 35,
  },
  [ComponentType.ElastiCache]: {
    category: 'data',
    label: 'ElastiCache',
    accepts: ['read'],
    fields: ['size', 'multiAz', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 2,
  },
  [ComponentType.Rds]: {
    category: 'data',
    label: 'RDS',
    accepts: ['read', 'write'],
    fields: ['size', 'multiAz', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 12,
  },
  [ComponentType.Aurora]: {
    category: 'data',
    label: 'Aurora',
    accepts: ['read', 'write'],
    fields: ['size', 'encrypted', 'region', 'globalDb'],
    regional: true,
    global: false,
    latency: 8,
  },
  [ComponentType.ReadReplica]: {
    category: 'data',
    label: 'Read Replica',
    accepts: ['read', 'write'],
    fields: ['size', 'az', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 12,
  },
  [ComponentType.DynamoDb]: {
    category: 'data',
    label: 'DynamoDB',
    accepts: ['read', 'write'],
    fields: ['provisioned', 'size', 'encrypted', 'region', 'globalDb'],
    regional: true,
    global: false,
    latency: 6,
  },
  [ComponentType.S3]: {
    category: 'data',
    label: 'S3',
    accepts: ['static'],
    fields: ['encrypted', 'region'],
    regional: true,
    global: false,
    latency: 20,
  },
  [ComponentType.Sqs]: {
    category: 'messaging',
    label: 'SQS',
    accepts: ['write', 'job'],
    fields: ['encrypted', 'region'],
    regional: true,
    global: false,
    latency: 8,
  },
  [ComponentType.Sns]: {
    category: 'messaging',
    label: 'SNS',
    accepts: ['write', 'job'],
    fields: ['region'],
    regional: true,
    global: false,
    latency: 8,
  },
};

export const COMPUTE_TYPES = new Set<ComponentType>([ComponentType.Ec2, ComponentType.Lambda]);
export const DATABASE_TYPES = new Set<ComponentType>([
  ComponentType.Rds,
  ComponentType.Aurora,
  ComponentType.ReadReplica,
  ComponentType.DynamoDb,
]);
/** Databases that take writes; a design holds one, as in gonnacrash. Read Replicas are copies of it. */
export const WRITE_DATABASE_TYPES = new Set<ComponentType>([
  ComponentType.Rds,
  ComponentType.Aurora,
  ComponentType.DynamoDb,
]);
export const DATA_STORE_TYPES = new Set<ComponentType>([
  ...DATABASE_TYPES,
  ComponentType.ElastiCache,
  ComponentType.S3,
]);
export const QUEUE_TYPES = new Set<ComponentType>([ComponentType.Sqs, ComponentType.Sns]);
/** Components that only send traffic to healthy targets. */
export const HEALTH_AWARE_TYPES = new Set<ComponentType>([
  ComponentType.Alb,
  ComponentType.Route53,
  ComponentType.CloudFront,
  ComponentType.GlobalAccelerator,
]);
/** Parents that share work across every instance of an EC2 group: a load balancer, or workers polling a queue. */
export const BALANCER_TYPES = new Set<ComponentType>([ComponentType.Alb, ComponentType.Sqs]);

const DATA_TARGETS: ComponentType[] = [
  ComponentType.ElastiCache,
  ComponentType.Rds,
  ComponentType.Aurora,
  ComponentType.ReadReplica,
  ComponentType.DynamoDb,
  ComponentType.S3,
];
const SERVER_TARGETS: ComponentType[] = [
  ComponentType.Ec2,
  ComponentType.Lambda,
  ComponentType.Alb,
  ...DATA_TARGETS,
  ComponentType.Sqs,
  ComponentType.Sns,
];

/** Components each component may send requests to, as in AWS. */
export const LINKS: Record<ComponentType, ComponentType[]> = {
  [ComponentType.Users]: [
    ComponentType.Route53,
    ComponentType.GlobalAccelerator,
    ComponentType.Waf,
    ComponentType.CloudFront,
    ComponentType.Alb,
    ComponentType.ApiGateway,
    ComponentType.Ec2,
    ComponentType.S3,
  ],
  [ComponentType.Route53]: [
    ComponentType.GlobalAccelerator,
    ComponentType.Waf,
    ComponentType.CloudFront,
    ComponentType.Alb,
    ComponentType.ApiGateway,
    ComponentType.Ec2,
    ComponentType.S3,
  ],
  [ComponentType.GlobalAccelerator]: [
    ComponentType.Route53,
    ComponentType.Waf,
    ComponentType.Alb,
    ComponentType.ApiGateway,
    ComponentType.Ec2,
  ],
  [ComponentType.Waf]: [ComponentType.CloudFront, ComponentType.Alb, ComponentType.ApiGateway],
  [ComponentType.CloudFront]: [
    ComponentType.Route53,
    ComponentType.GlobalAccelerator,
    ComponentType.Alb,
    ComponentType.ApiGateway,
    ComponentType.Ec2,
    ComponentType.S3,
  ],
  [ComponentType.Alb]: [ComponentType.Ec2, ComponentType.Lambda],
  [ComponentType.ApiGateway]: [
    ComponentType.Alb,
    ComponentType.Ec2,
    ComponentType.Lambda,
    ComponentType.Sqs,
    ComponentType.Sns,
  ],
  [ComponentType.Ec2]: SERVER_TARGETS,
  [ComponentType.Lambda]: SERVER_TARGETS,
  [ComponentType.ElastiCache]: [
    ComponentType.Rds,
    ComponentType.Aurora,
    ComponentType.ReadReplica,
    ComponentType.DynamoDb,
  ],
  // A link to a Read Replica is asynchronous replication to a read-only copy.
  [ComponentType.Rds]: [ComponentType.ReadReplica],
  [ComponentType.Aurora]: [ComponentType.ReadReplica],
  [ComponentType.ReadReplica]: [],
  [ComponentType.DynamoDb]: [],
  [ComponentType.S3]: [],
  [ComponentType.Sqs]: [ComponentType.Ec2, ComponentType.Lambda],
  [ComponentType.Sns]: [ComponentType.Sqs, ComponentType.Lambda],
};

/** Most copies of a component one design needs; global entry points are shared by the whole app. */
export const MAX_PER_BOARD: Partial<Record<ComponentType, number>> = {
  [ComponentType.Users]: 1,
  [ComponentType.Route53]: 1,
  [ComponentType.GlobalAccelerator]: 1,
  [ComponentType.Waf]: 1,
  [ComponentType.CloudFront]: 1,
};

/** Capacity in work units per second, by size. */
export const CAPACITY: Partial<Record<ComponentType, Record<Size, number>>> = {
  [ComponentType.Ec2]: { small: 200, medium: 500, large: 1200, xlarge: 3000 },
  [ComponentType.Rds]: { small: 300, medium: 800, large: 2000, xlarge: 5000 },
  [ComponentType.ReadReplica]: { small: 300, medium: 800, large: 2000, xlarge: 5000 },
  [ComponentType.Aurora]: { small: 800, medium: 2000, large: 5000, xlarge: 12_000 },
  [ComponentType.ElastiCache]: { small: 3000, medium: 8000, large: 20_000, xlarge: 50_000 },
  [ComponentType.DynamoDb]: { small: 500, medium: 2000, large: 8000, xlarge: 30_000 },
};

export const FIXED_CAPACITY: Partial<Record<ComponentType, number>> = {
  [ComponentType.Lambda]: 1000,
  [ComponentType.ApiGateway]: 10_000,
  [ComponentType.Alb]: 50_000,
};

/** Monthly price in $ by size. */
export const SIZE_PRICE: Partial<Record<ComponentType, Record<Size, number>>> = {
  [ComponentType.Ec2]: { small: 15, medium: 30, large: 60, xlarge: 120 },
  [ComponentType.Rds]: { small: 15, medium: 30, large: 60, xlarge: 120 },
  [ComponentType.ReadReplica]: { small: 15, medium: 30, large: 60, xlarge: 120 },
  [ComponentType.Aurora]: { small: 35, medium: 70, large: 140, xlarge: 280 },
  [ComponentType.ElastiCache]: { small: 15, medium: 30, large: 60, xlarge: 120 },
  [ComponentType.DynamoDb]: { small: 10, medium: 30, large: 90, xlarge: 270 },
};

/** Flat monthly price in $. */
export const FLAT_PRICE: Partial<Record<ComponentType, number>> = {
  [ComponentType.Route53]: 1,
  [ComponentType.GlobalAccelerator]: 18,
  [ComponentType.Waf]: 6,
  [ComponentType.CloudFront]: 2,
  [ComponentType.Alb]: 16,
  [ComponentType.S3]: 1,
  [ComponentType.Sqs]: 1,
  [ComponentType.Sns]: 1,
};

/** Monthly price in $ for every 100 requests per second handled. */
export const REQUEST_PRICE: Partial<Record<ComponentType, number>> = {
  [ComponentType.Lambda]: 5,
  [ComponentType.ApiGateway]: 3.5,
  [ComponentType.CloudFront]: 1,
  [ComponentType.S3]: 0.5,
  [ComponentType.Sqs]: 0.4,
  [ComponentType.Sns]: 0.3,
  [ComponentType.DynamoDb]: 5,
};

export const PRICING_FACTOR = { onDemand: 1, reserved: 0.6, spot: 0.3 } as const;

export const PROVISIONED_CONCURRENCY_PRICE = 15;

export const SIZES: Size[] = ['small', 'medium', 'large', 'xlarge'];

/**
 * Builds the default settings of a new component.
 * @param type The component type.
 * @returns Default node settings.
 */
export const defaultConfig = (type: ComponentType): NodeConfig => ({
  size: 'small',
  count: 1,
  az: 'a',
  region: 'us-east-1',
  pricing: 'onDemand',
  autoScaling: false,
  maxCount: 4,
  multiAz: false,
  encrypted: type === ComponentType.S3,
  provisioned: false,
  cacheApi: false,
  globalDb: false,
});

/** Every component the player can place, in palette order. */
export const COMPONENT_TYPES_IN_PALETTE: ComponentType[] = [
  ComponentType.Ec2,
  ComponentType.Rds,
  ComponentType.Alb,
  ComponentType.Route53,
  ComponentType.Aurora,
  ComponentType.ElastiCache,
  ComponentType.ReadReplica,
  ComponentType.S3,
  ComponentType.CloudFront,
  ComponentType.GlobalAccelerator,
  ComponentType.Sqs,
  ComponentType.Sns,
  ComponentType.Waf,
  ComponentType.ApiGateway,
  ComponentType.Lambda,
  ComponentType.DynamoDb,
];
