import type { Messages } from 'next-intl';

/** SAA-C03 exam domains with their official weight. */
export const DOMAINS = {
  secure: { code: 'D1', weight: 30 },
  resilient: { code: 'D2', weight: 26 },
  performance: { code: 'D3', weight: 24 },
  cost: { code: 'D4', weight: 20 },
} as const;

export type DomainId = keyof typeof DOMAINS;

/** Lesson slugs; each one must have its texts in the `Lessons` messages. */
export const LessonSlug = {
  SecurityLayersOverview: 'security-layers-overview',
  IamFundamentals: 'iam-fundamentals',
  IamOrganizationsScp: 'iam-organizations-scp',
  IdentityFederationCognito: 'identity-federation-cognito',
  VpcNetworkingSecurity: 'vpc-networking-security',
  VpcConnectivity: 'vpc-connectivity',
  DataEncryptionKms: 'data-encryption-kms',
  SecretsCertificates: 'secrets-certificates',
  ThreatDetectionWafShield: 'threat-detection-waf-shield',
  HighAvailabilityMultiAz: 'high-availability-multi-az',
  ElasticLoadBalancing: 'elastic-load-balancing',
  AutoScaling: 'auto-scaling',
  DecouplingMessaging: 'decoupling-messaging',
  ServerlessWorkflows: 'serverless-workflows',
  Route53Routing: 'route53-routing',
  DisasterRecovery: 'disaster-recovery',
  BackupReplication: 'backup-replication',
  ManagementIac: 'management-iac',
  ApplicationIntegration: 'application-integration',
  Ec2Compute: 'ec2-compute',
  ContainersCompute: 'containers-compute',
  BlockFileStorage: 'block-file-storage',
  S3Performance: 's3-performance',
  RelationalDatabases: 'relational-databases',
  NoSqlCaching: 'nosql-caching',
  EdgeNetworking: 'edge-networking',
  DataAnalytics: 'data-analytics',
  DataMigration: 'data-migration',
  AiMlServices: 'ai-ml-services',
  Ec2PricingModels: 'ec2-pricing-models',
  S3StorageClasses: 's3-storage-classes',
  CostManagementTools: 'cost-management-tools',
  CostOptimizedArchitectures: 'cost-optimized-architectures',
  CostDatabaseStorageChoices: 'cost-database-storage-choices',
  CostComputeServerlessContainers: 'cost-compute-serverless-containers',
  CostNetworkTransfer: 'cost-network-transfer',
} as const satisfies Record<string, keyof Messages['Lessons']>;

export type LessonSlug = (typeof LessonSlug)[keyof typeof LessonSlug];

/** The language-neutral part of a lesson; texts live in the `Lessons` namespace. */
export type LessonData = {
  slug: LessonSlug;
  domain: DomainId;
  /** AWS services covered, used for search and tags. */
  services: string[];
  /** Estimated reading time in minutes. */
  minutes: number;
};

/** A study lesson rendered from Markdown (GitHub-flavored, tables allowed). */
export type Lesson = LessonData & {
  title: string;
  /** One or two sentences shown on the lesson card. */
  summary: string;
  /** Lesson body in Markdown. Use `##` and `###` headings, lists and tables. */
  body: string;
  /** Exam keywords: when the question says `trigger`, think `answer`. */
  keywords: { trigger: string; answer: string }[];
  /** Common traps and distractors seen in the exam. */
  traps: string[];
};

/** A practice exam question, written in English like the real exam in every locale. */
export type QuestionData = {
  id: keyof Messages['Questions'];
  domain: DomainId;
  /** Slug of the lesson that explains this topic. */
  lesson: LessonSlug;
  stem: string;
  options: string[];
  /** Indexes of the correct options. More than one means "Choose TWO/THREE". */
  answer: number[];
};

/** A practice exam question with its explanation in the page language. */
export type Question = QuestionData & {
  /** Why the correct answer is right and the others are wrong. */
  explanation: string;
};

/** The language-neutral part of a flashcard; texts live in the `Flashcards` namespace. */
export type FlashcardData = {
  id: keyof Messages['Flashcards'];
  domain: DomainId;
};

/** A flashcard for spaced review. */
export type Flashcard = FlashcardData & {
  front: string;
  back: string;
};

/** The language-neutral part of a comparison; texts live in the `Comparisons` namespace. */
export type ComparisonData = {
  id: keyof Messages['Comparisons'];
  domain: DomainId;
  /** Column headers: the services or options compared. */
  services: string[];
  /** Slugs of lessons with more detail. */
  lessons: LessonSlug[];
};

/** A side-by-side comparison of services that the exam likes to mix up. */
export type Comparison = ComparisonData & {
  title: string;
  /** Why these services get confused, in one or two sentences. */
  summary: string;
  /** One row per aspect; `values` follows the order of `services`. */
  rows: { aspect: string; values: string[] }[];
  /** When to pick each one; same order as `services`. */
  pick: string[];
  /** Optional fenced diagram block in lesson Markdown syntax, shown above the table. */
  diagram?: string;
  /** Phrases in a question that point to one answer. */
  keywords: { trigger: string; answer: string }[];
};

/** The language-neutral part of a quick-pick tip group; texts live in the `Tips` namespace. */
export type TipGroupData = {
  id: keyof Messages['Tips'];
  /** Exam domain; absent for general exam strategy. */
  domain?: DomainId;
  /** Slugs of lessons with more detail. */
  lessons: LessonSlug[];
};

/** One decision the exam asks for, as a list of key constraints and the service each one points to. */
export type TipGroup = TipGroupData & {
  title: string;
  /** What to look for in the question, in one sentence. */
  intro: string;
  tips: { when: string; pick: string }[];
};

/** The language-neutral part of a common-trap group; texts live in the `Traps` namespace. */
export type TrapGroupData = {
  id: keyof Messages['Traps'];
  /** Exam domain; absent for general exam strategy. */
  domain?: DomainId;
  /** Slugs of lessons with more detail. */
  lessons: LessonSlug[];
};

/** A group of wrong beliefs the exam baits, each with the fact that defuses it. */
export type TrapGroup = TrapGroupData & {
  title: string;
  traps: { trap: string; fact: string }[];
};

/** The language-neutral part of a name-mnemonic group; texts live in the `Mnemonics` namespace. */
export type MnemonicGroupData = {
  id: keyof Messages['Mnemonics'];
  /** Service names, in the order of the `items` texts. */
  services: string[];
  /** Slugs of lessons with more detail. */
  lessons: LessonSlug[];
};

/** A group of services with a memory hook for each name and what the service does. */
export type MnemonicGroup = MnemonicGroupData & {
  title: string;
  /** One entry per service, same order as `services`. */
  items: { hint: string; does: string }[];
};
