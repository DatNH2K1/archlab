import { LessonSlug } from '@/content/types';
import type { TipGroupData } from '@/content/types';

/** Quick-pick decisions, exam strategy first, then by domain; texts live in the locale files. */
export const TIP_GROUPS: TipGroupData[] = [
  { id: 'strategy', lessons: [] },
  { id: 'identity', domain: 'secure', lessons: [LessonSlug.IamFundamentals, LessonSlug.IamOrganizationsScp, LessonSlug.IdentityFederationCognito] },
  { id: 'encryption', domain: 'secure', lessons: [LessonSlug.DataEncryptionKms, LessonSlug.SecretsCertificates] },
  { id: 'threats', domain: 'secure', lessons: [LessonSlug.ThreatDetectionWafShield, LessonSlug.ManagementIac] },
  { id: 'network', domain: 'secure', lessons: [LessonSlug.VpcNetworkingSecurity, LessonSlug.VpcConnectivity] },
  { id: 'messaging', domain: 'resilient', lessons: [LessonSlug.DecouplingMessaging, LessonSlug.ApplicationIntegration, LessonSlug.ServerlessWorkflows] },
  { id: 'routing', domain: 'resilient', lessons: [LessonSlug.ElasticLoadBalancing, LessonSlug.Route53Routing, LessonSlug.EdgeNetworking] },
  { id: 'disaster-recovery', domain: 'resilient', lessons: [LessonSlug.HighAvailabilityMultiAz, LessonSlug.DisasterRecovery, LessonSlug.BackupReplication] },
  { id: 'compute', domain: 'performance', lessons: [LessonSlug.Ec2Compute, LessonSlug.ContainersCompute, LessonSlug.ServerlessWorkflows] },
  { id: 'storage', domain: 'performance', lessons: [LessonSlug.BlockFileStorage, LessonSlug.S3Performance] },
  { id: 'database', domain: 'performance', lessons: [LessonSlug.RelationalDatabases, LessonSlug.NoSqlCaching] },
  { id: 'analytics', domain: 'performance', lessons: [LessonSlug.DataAnalytics] },
  { id: 'migration', domain: 'performance', lessons: [LessonSlug.DataMigration] },
  { id: 'pricing', domain: 'cost', lessons: [LessonSlug.Ec2PricingModels, LessonSlug.CostComputeServerlessContainers] },
  { id: 's3-classes', domain: 'cost', lessons: [LessonSlug.S3StorageClasses] },
  { id: 'cost-tools', domain: 'cost', lessons: [LessonSlug.CostManagementTools, LessonSlug.CostNetworkTransfer] },
];
