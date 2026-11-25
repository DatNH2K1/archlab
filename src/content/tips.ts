import { LessonSlug } from '@/content/types';
import type { TipGroupData } from '@/content/types';

/** Quick-pick tip groups, exam strategy first, then by domain; texts live in the locale files. */
export const TIP_GROUPS: TipGroupData[] = [
  { id: 'strategy', lessons: [] },
  {
    id: 'identity',
    domain: 'secure',
    lessons: [LessonSlug.IamFundamentals, LessonSlug.IamOrganizationsScp, LessonSlug.IdentityFederationCognito],
  },
  {
    id: 'data-protection',
    domain: 'secure',
    lessons: [LessonSlug.DataEncryptionKms, LessonSlug.SecretsCertificates, LessonSlug.ThreatDetectionWafShield],
  },
  {
    id: 'networking',
    domain: 'secure',
    lessons: [LessonSlug.VpcNetworkingSecurity, LessonSlug.VpcConnectivity, LessonSlug.EdgeNetworking],
  },
  {
    id: 'resilience',
    domain: 'resilient',
    lessons: [
      LessonSlug.HighAvailabilityMultiAz,
      LessonSlug.ElasticLoadBalancing,
      LessonSlug.AutoScaling,
      LessonSlug.Route53Routing,
      LessonSlug.DisasterRecovery,
      LessonSlug.BackupReplication,
    ],
  },
  {
    id: 'integration',
    domain: 'resilient',
    lessons: [
      LessonSlug.DecouplingMessaging,
      LessonSlug.ApplicationIntegration,
      LessonSlug.ServerlessWorkflows,
      LessonSlug.Ec2Compute,
      LessonSlug.ContainersCompute,
    ],
  },
  {
    id: 'storage',
    domain: 'performance',
    lessons: [LessonSlug.BlockFileStorage, LessonSlug.S3Performance, LessonSlug.S3StorageClasses],
  },
  {
    id: 'data',
    domain: 'performance',
    lessons: [LessonSlug.RelationalDatabases, LessonSlug.NoSqlCaching, LessonSlug.DataAnalytics, LessonSlug.DataMigration],
  },
  {
    id: 'cost',
    domain: 'cost',
    lessons: [
      LessonSlug.Ec2PricingModels,
      LessonSlug.CostManagementTools,
      LessonSlug.CostNetworkTransfer,
      LessonSlug.CostOptimizedArchitectures,
    ],
  },
];
