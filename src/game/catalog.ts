import type { ComponentType, NodeConfig, RequestClass, Size } from './types';

export type ComponentCategory = 'entry' | 'edge' | 'network' | 'compute' | 'data' | 'messaging';

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
  | 'cacheApi';

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
  users: { category: 'entry', label: 'Users', accepts: [], fields: [], regional: true, global: true, latency: 0 },
  route53: { category: 'network', label: 'Route 53', accepts: ALL, fields: [], regional: true, global: true, latency: 0 },
  globalAccelerator: {
    category: 'network',
    label: 'Global Accelerator',
    accepts: ALL,
    fields: [],
    regional: true,
    global: true,
    latency: 2,
  },
  waf: { category: 'edge', label: 'WAF', accepts: ALL, fields: [], regional: true, global: true, latency: 1 },
  cloudfront: {
    category: 'edge',
    label: 'CloudFront',
    accepts: ALL,
    fields: ['cacheApi'],
    regional: true,
    global: true,
    latency: 8,
  },
  alb: { category: 'network', label: 'ALB', accepts: ALL, fields: ['region'], regional: true, global: false, latency: 4 },
  apiGateway: {
    category: 'network',
    label: 'API Gateway',
    accepts: ALL,
    fields: ['region'],
    regional: true,
    global: false,
    latency: 12,
  },
  ec2: {
    category: 'compute',
    label: 'EC2',
    accepts: ALL,
    fields: ['size', 'count', 'az', 'pricing', 'autoScaling', 'region'],
    regional: false,
    global: false,
    latency: 30,
  },
  lambda: {
    category: 'compute',
    label: 'Lambda',
    accepts: ALL,
    fields: ['provisioned', 'region'],
    regional: true,
    global: false,
    latency: 35,
  },
  elasticache: {
    category: 'data',
    label: 'ElastiCache',
    accepts: ['read'],
    fields: ['size', 'multiAz', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 2,
  },
  rds: {
    category: 'data',
    label: 'RDS',
    accepts: ['read', 'write'],
    fields: ['size', 'multiAz', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 12,
  },
  aurora: {
    category: 'data',
    label: 'Aurora',
    accepts: ['read', 'write'],
    fields: ['size', 'encrypted', 'region'],
    regional: true,
    global: false,
    latency: 8,
  },
  readReplica: {
    category: 'data',
    label: 'Read Replica',
    accepts: ['read', 'write'],
    fields: ['size', 'az', 'encrypted', 'region'],
    regional: false,
    global: false,
    latency: 12,
  },
  dynamodb: {
    category: 'data',
    label: 'DynamoDB',
    accepts: ['read', 'write'],
    fields: ['provisioned', 'size', 'encrypted', 'region'],
    regional: true,
    global: false,
    latency: 6,
  },
  s3: {
    category: 'data',
    label: 'S3',
    accepts: ['static'],
    fields: ['encrypted', 'region'],
    regional: true,
    global: false,
    latency: 20,
  },
  sqs: {
    category: 'messaging',
    label: 'SQS',
    accepts: ['write', 'job'],
    fields: ['encrypted', 'region'],
    regional: true,
    global: false,
    latency: 8,
  },
  sns: {
    category: 'messaging',
    label: 'SNS',
    accepts: ['write', 'job'],
    fields: ['region'],
    regional: true,
    global: false,
    latency: 8,
  },
};

export const COMPUTE_TYPES = new Set<ComponentType>(['ec2', 'lambda']);
export const DATABASE_TYPES = new Set<ComponentType>(['rds', 'aurora', 'readReplica', 'dynamodb']);
export const DATA_STORE_TYPES = new Set<ComponentType>([...DATABASE_TYPES, 'elasticache', 's3']);
export const QUEUE_TYPES = new Set<ComponentType>(['sqs', 'sns']);
/** Components that only send traffic to healthy targets. */
export const HEALTH_AWARE_TYPES = new Set<ComponentType>(['alb', 'route53', 'cloudfront', 'globalAccelerator']);

/** Capacity in work units per second, by size. */
export const CAPACITY: Partial<Record<ComponentType, Record<Size, number>>> = {
  ec2: { small: 200, medium: 500, large: 1200, xlarge: 3000 },
  rds: { small: 300, medium: 800, large: 2000, xlarge: 5000 },
  readReplica: { small: 300, medium: 800, large: 2000, xlarge: 5000 },
  aurora: { small: 800, medium: 2000, large: 5000, xlarge: 12_000 },
  elasticache: { small: 3000, medium: 8000, large: 20_000, xlarge: 50_000 },
  dynamodb: { small: 500, medium: 2000, large: 8000, xlarge: 30_000 },
};

export const FIXED_CAPACITY: Partial<Record<ComponentType, number>> = {
  lambda: 1000,
  apiGateway: 10_000,
  alb: 50_000,
};

/** Monthly price in $ by size. */
export const SIZE_PRICE: Partial<Record<ComponentType, Record<Size, number>>> = {
  ec2: { small: 15, medium: 30, large: 60, xlarge: 120 },
  rds: { small: 15, medium: 30, large: 60, xlarge: 120 },
  readReplica: { small: 15, medium: 30, large: 60, xlarge: 120 },
  aurora: { small: 35, medium: 70, large: 140, xlarge: 280 },
  elasticache: { small: 15, medium: 30, large: 60, xlarge: 120 },
  dynamodb: { small: 10, medium: 30, large: 90, xlarge: 270 },
};

/** Flat monthly price in $. */
export const FLAT_PRICE: Partial<Record<ComponentType, number>> = {
  route53: 1,
  globalAccelerator: 18,
  waf: 6,
  cloudfront: 2,
  alb: 16,
  s3: 1,
  sqs: 1,
  sns: 1,
};

/** Monthly price in $ for every 100 requests per second handled. */
export const REQUEST_PRICE: Partial<Record<ComponentType, number>> = {
  lambda: 5,
  apiGateway: 3.5,
  cloudfront: 1,
  s3: 0.5,
  sqs: 0.4,
  sns: 0.3,
  dynamodb: 5,
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
  encrypted: type === 's3',
  provisioned: false,
  cacheApi: false,
});

/** Every component the player can place, in palette order. */
export const COMPONENT_TYPES_IN_PALETTE: ComponentType[] = [
  'ec2',
  'rds',
  'alb',
  'route53',
  'aurora',
  'elasticache',
  'readReplica',
  's3',
  'cloudfront',
  'globalAccelerator',
  'sqs',
  'sns',
  'waf',
  'apiGateway',
  'lambda',
  'dynamodb',
];
