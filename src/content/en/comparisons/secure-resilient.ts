import type { Comparison } from '@/content/types';

export const secureResilientComparisonsEn: Comparison[] = [
  {
    id: 'sg-vs-nacl',
    domain: 'secure',
    title: 'Security Group vs Network ACL',
    summary:
      'Both are VPC firewalls with inbound and outbound rules, but they work at different levels and handle return traffic differently.',
    services: ['Security Group', 'Network ACL'],
    rows: [
      { aspect: 'Applies to', values: ['ENI / instance', 'Whole subnet'] },
      {
        aspect: 'State',
        values: ['Stateful: return traffic allowed automatically', 'Stateless: return traffic needs its own rule'],
      },
      { aspect: 'Rule types', values: ['Allow only', 'Allow and Deny'] },
      {
        aspect: 'Evaluation',
        values: ['All rules evaluated together', 'Numbered rules, lowest first, first match wins'],
      },
      {
        aspect: 'Default',
        values: [
          'New SG: deny all inbound, allow all outbound',
          'Default NACL allows all; custom NACL denies all',
        ],
      },
      {
        aspect: 'Can reference',
        values: ['CIDR, prefix list, other security groups', 'CIDR only'],
      },
      {
        aspect: 'Exam detail',
        values: ['Chain tiers by referencing SG IDs', 'Remember ephemeral ports 1024-65535 for responses'],
      },
    ],
    pick: [
      'Choose a Security Group for normal least-privilege access between instances and tiers.',
      'Choose a Network ACL to explicitly block an IP or CIDR range at the subnet level.',
    ],
    diagram: `~~~flow
# A request passes the NACL then the SG; the reply skips SG rules but needs a NACL rule
Client -> NACL inbound (subnet) -> Security Group inbound (ENI) -> EC2
EC2 -[response]-> Security Group (stateful, auto-allowed) -> NACL outbound (open 1024-65535) -> Client
~~~

~~~ladder
# A NACL checks rules by number; the first match wins
Rule 100 | Deny 203.0.113.5/32 | Matched first
Rule 200 | Allow 0.0.0.0/0 port 443 | Allow
Rule * | Deny all traffic that matched no rule | Default
~~~`,
    keywords: [
      { trigger: 'Block a specific malicious IP address', answer: 'Network ACL Deny rule (or AWS WAF for HTTP)' },
      { trigger: 'Stateful, allow only', answer: 'Security Group' },
      { trigger: 'Allow traffic only from the web tier instances', answer: 'Security Group referencing the web tier SG' },
      { trigger: 'Outbound response traffic blocked at subnet', answer: 'NACL missing ephemeral port rule' },
    ],
    lessons: ['vpc-networking-security'],
  },
  {
    id: 'iam-policy-types',
    domain: 'secure',
    title: 'IAM policy types',
    summary:
      'All are JSON policies, but only some grant permissions; boundaries and SCPs only set the maximum allowed.',
    services: ['Identity-based policy', 'Resource-based policy', 'Permissions boundary', 'SCP'],
    rows: [
      {
        aspect: 'Attached to',
        values: ['User, group or role', 'Resource (S3 bucket, SQS, KMS key...)', 'User or role', 'Root, OU or account in Organizations'],
      },
      { aspect: 'Grants permissions?', values: ['Yes', 'Yes', 'No, sets the maximum', 'No, sets the maximum'] },
      { aspect: 'Principal field', values: ['No (implied identity)', 'Yes', 'No', 'No'] },
      {
        aspect: 'Cross-account',
        values: ['Caller side only', 'Yes, grants other accounts directly', 'Not applicable', 'Not applicable'],
      },
      {
        aspect: 'Scope',
        values: ['One identity', 'One resource', 'One identity', 'Every identity in member accounts, incl. root user'],
      },
      {
        aspect: 'Exam detail',
        values: [
          'Prefer customer managed for reuse',
          'Needed for cross-account S3/KMS access',
          'Stop privilege escalation by delegated admins',
          'Does not affect the management account',
        ],
      },
    ],
    pick: [
      'Choose an identity-based policy to give a user, group or role permissions.',
      'Choose a resource-based policy to let another account or service access a resource directly.',
      'Choose a permissions boundary when developers may create roles but must not exceed a limit.',
      'Choose an SCP to restrict what entire accounts or OUs can ever do, such as Regions or services.',
    ],
    diagram: `~~~groups
# Only two types grant access; the rest only set a maximum
[Effective permissions = Allow intersected with every limit]
Grant access: *Identity-based policy, *Resource-based policy
Limit only: Permissions boundary, SCP, Session policy
~~~

~~~decide
# What you need and which policy does it
Grant permissions to a Lambda role => Identity-based policy
Let another account read a bucket without assuming a role => Resource-based policy (bucket policy)
Developers create roles but cannot escalate privileges => Permissions boundary
Forbid a whole account from using unapproved Regions => SCP
~~~`,
    keywords: [
      { trigger: 'Prevent all accounts from using a Region', answer: 'SCP with Deny' },
      { trigger: 'Developers create IAM roles without privilege escalation', answer: 'Permissions boundary' },
      { trigger: 'Allow another account to read a bucket', answer: 'Resource-based policy (bucket policy)' },
      { trigger: 'Explicit Deny vs Allow', answer: 'Explicit Deny always wins' },
      { trigger: 'Even the member account root user is restricted', answer: 'SCP' },
    ],
    lessons: ['iam-fundamentals', 'iam-organizations-scp'],
  },
  {
    id: 'cognito-pools',
    domain: 'secure',
    title: 'Cognito User Pool vs Identity Pool vs IAM Identity Center',
    summary:
      'All three deal with signing people in, but one authenticates app users, one hands out AWS credentials, and one is SSO for employees.',
    services: ['Cognito User Pool', 'Cognito Identity Pool', 'IAM Identity Center'],
    rows: [
      {
        aspect: 'Main job',
        values: ['User directory: sign-up, sign-in', 'Exchange tokens for temporary AWS credentials', 'Workforce SSO to AWS accounts and apps'],
      },
      { aspect: 'Users', values: ['Customers of web/mobile apps', 'App users (incl. guests)', 'Employees'] },
      { aspect: 'Output', values: ['JWT tokens (ID, access, refresh)', 'STS credentials mapped to IAM role', 'Session in accounts via permission sets'] },
      {
        aspect: 'Federation',
        values: ['Social, SAML, OIDC', 'User Pool, social, SAML, OIDC', 'External IdP via SAML, SCIM provisioning'],
      },
      {
        aspect: 'Integrations',
        values: ['ALB auth, API Gateway authorizer', 'Direct calls to S3, DynamoDB', 'AWS Organizations, AWS access portal'],
      },
      { aspect: 'Unauthenticated access', values: ['No', 'Yes, guest role', 'No'] },
    ],
    pick: [
      'Choose a User Pool to add sign-up and sign-in to an app and get JWTs.',
      'Choose an Identity Pool when app users must call AWS services directly with temporary credentials.',
      'Choose IAM Identity Center for employees to sign in once to many AWS accounts.',
    ],
    diagram: `~~~flow
# Customers go through Cognito, employees through IAM Identity Center
Users -> Cognito User Pool -[JWT]-> Cognito Identity Pool -[STS credentials]-> S3
Employees -> IdP (Entra ID, Okta) -[SAML + SCIM]-> IAM Identity Center -[permission set]-> Many AWS accounts
~~~

~~~decide
# Exam keywords and the pick
App needs sign-up, sign-in and JWTs => Cognito User Pool
App users upload straight to S3 => Cognito Identity Pool
Unauthenticated guests call AWS with limited rights => Identity Pool (guest role)
Employees sign in once to many accounts => IAM Identity Center
~~~`,
    keywords: [
      { trigger: 'Mobile app users upload directly to S3', answer: 'Cognito Identity Pool' },
      { trigger: 'Sign-up and sign-in for millions of app users', answer: 'Cognito User Pool' },
      { trigger: 'Employees use Microsoft Entra ID to access many accounts', answer: 'IAM Identity Center' },
      { trigger: 'Guest users with limited AWS access', answer: 'Identity Pool unauthenticated role' },
    ],
    lessons: ['identity-federation-cognito'],
  },
  {
    id: 'kms-cloudhsm',
    domain: 'secure',
    title: 'KMS AWS managed key vs customer managed key vs CloudHSM',
    summary:
      'All protect encryption keys; the difference is how much control you have over policy, rotation and the hardware itself.',
    services: ['KMS (AWS managed key)', 'KMS (customer managed key)', 'CloudHSM'],
    rows: [
      { aspect: 'Created by', values: ['AWS service (aws/s3, aws/ebs...)', 'You', 'You, in your own HSM cluster'] },
      { aspect: 'Key policy', values: ['Cannot edit', 'Full control, grants', 'You manage users and keys in the HSM'] },
      { aspect: 'Rotation', values: ['Automatic, yearly, cannot change', 'Optional automatic, configurable period', 'You manage'] },
      { aspect: 'Cross-account use', values: ['No', 'Yes, via key policy', 'Your application controls it'] },
      { aspect: 'Tenancy', values: ['Multi-tenant, AWS managed', 'Multi-tenant, AWS managed', 'Single-tenant dedicated HSM'] },
      { aspect: 'Integration', values: ['Native AWS services', 'Native AWS services, CloudTrail audit', 'PKCS#11, JCE, CNG; KMS custom key store'] },
      { aspect: 'Operations', values: ['None', 'Low', 'High: you run HA across AZs'] },
    ],
    pick: [
      'Choose an AWS managed key for default encryption with no management at all.',
      'Choose a customer managed key when you need key policy control, cross-account sharing or disable/delete.',
      'Choose CloudHSM when compliance requires a single-tenant HSM under your exclusive control.',
    ],
    diagram: `~~~ladder
# More control means more operations
AWS managed key | AWS creates and rotates it, key policy not editable | No ops
Customer managed key | You own the key policy, grants, cross-account sharing | Low
CloudHSM | Single-tenant HSM, you hold the keys and run HA | High
~~~

~~~decide
# Exam requirements and the key to pick
Default encryption with nothing to manage => AWS managed key
Share an encrypted snapshot with another account => Customer managed key
Edit the key policy, disable or delete the key => Customer managed key
Single-tenant HSM under the company's exclusive control => CloudHSM
~~~`,
    keywords: [
      { trigger: 'Dedicated, single-tenant hardware security module', answer: 'CloudHSM' },
      { trigger: 'Share encrypted snapshot with another account', answer: 'Customer managed KMS key' },
      { trigger: 'Control key policy and audit key usage', answer: 'Customer managed KMS key + CloudTrail' },
      { trigger: 'Least operational overhead encryption', answer: 'AWS managed key or SSE-S3' },
      { trigger: 'Same keys usable in multiple Regions', answer: 'KMS multi-Region keys' },
    ],
    lessons: ['data-encryption-kms'],
  },
  {
    id: 's3-encryption',
    domain: 'secure',
    title: 'S3 encryption options',
    summary:
      'Five ways to encrypt S3 objects that differ in who holds the key, who encrypts, and how much audit you get.',
    services: ['SSE-S3', 'SSE-KMS', 'DSSE-KMS', 'SSE-C', 'Client-side'],
    rows: [
      { aspect: 'Who encrypts', values: ['S3', 'S3', 'S3 (two layers)', 'S3', 'Your application'] },
      { aspect: 'Key held by', values: ['S3', 'KMS', 'KMS', 'You, sent with each request', 'You'] },
      { aspect: 'Audit of key use', values: ['No', 'Yes, CloudTrail', 'Yes, CloudTrail', 'No', 'Your responsibility'] },
      { aspect: 'Default?', values: ['Yes, for all new objects', 'No', 'No', 'No', 'No'] },
      {
        aspect: 'Exam detail',
        values: [
          'Zero management, AES-256',
          'KMS request quotas; S3 Bucket Keys reduce calls',
          'Dual-layer server-side for compliance',
          'HTTPS required; AWS does not store key',
          'Data is encrypted before leaving your app',
        ],
      },
    ],
    pick: [
      'Choose SSE-S3 for simple encryption at rest with no key management.',
      'Choose SSE-KMS when you need key policy control and an audit trail of key usage.',
      'Choose DSSE-KMS when a standard requires two independent layers of encryption.',
      'Choose SSE-C when you must manage keys yourself but let S3 do the encryption.',
      'Choose client-side encryption when AWS must never see plaintext data.',
    ],
    diagram: `~~~ladder
# The key moves from AWS into your hands
SSE-S3 | S3 manages the key, default for new objects | Default
SSE-KMS | Key in KMS, audited in CloudTrail | Audit
DSSE-KMS | Key in KMS, two layers of encryption | 2 layers
SSE-C | You send the key with each request, S3 encrypts | HTTPS
Client-side | The app encrypts before upload | DIY
~~~

~~~flow
# S3 Bucket Keys cut KMS calls for SSE-KMS
PutObject -[SSE-KMS]-> S3 -[calls KMS for every object]-> KMS (risk of throttling)
PutObject -[SSE-KMS + Bucket Key]-> S3 (temporary bucket-level key) -[far fewer calls]-> KMS
~~~`,
    keywords: [
      { trigger: 'Audit who used the key', answer: 'SSE-KMS' },
      { trigger: 'KMS throttling on high request rate', answer: 'Enable S3 Bucket Keys' },
      { trigger: 'Dual-layer encryption requirement', answer: 'DSSE-KMS' },
      { trigger: 'Company provides its own key, not stored in AWS', answer: 'SSE-C' },
      { trigger: 'Encrypt before uploading', answer: 'Client-side encryption' },
    ],
    lessons: ['data-encryption-kms'],
  },
  {
    id: 'secrets-vs-parameters',
    domain: 'secure',
    title: 'Secrets Manager vs SSM Parameter Store',
    summary:
      'Both store encrypted configuration values; the exam separates them by automatic rotation and cost.',
    services: ['Secrets Manager', 'SSM Parameter Store'],
    rows: [
      { aspect: 'Purpose', values: ['Secrets: DB passwords, API keys', 'Config values and secrets (SecureString)'] },
      {
        aspect: 'Automatic rotation',
        values: ['Built-in (Lambda or managed rotation for RDS, Aurora...)', 'No native rotation'],
      },
      { aspect: 'Encryption', values: ['Always with KMS', 'Optional, SecureString uses KMS'] },
      { aspect: 'Cross-Region replication', values: ['Yes, replica secrets', 'No'] },
      { aspect: 'Cost', values: ['Paid per secret and API calls', 'Standard tier free; Advanced tier paid'] },
      { aspect: 'Extras', values: ['Generate random passwords', 'Hierarchy paths, parameter policies (Advanced)'] },
    ],
    pick: [
      'Choose Secrets Manager when credentials must rotate automatically or be replicated across Regions.',
      'Choose Parameter Store for cheap configuration values and secrets without rotation needs.',
    ],
    diagram: `~~~decide
# Choosing where to store a secret
DB password must rotate automatically => Secrets Manager
Secret must exist in the DR Region => Secrets Manager (replica secret)
Hierarchical config at the lowest cost => Parameter Store Standard
Simple secret with no rotation => Parameter Store SecureString
~~~

~~~flow
# How an app reads values at runtime
App -[GetParameter with WithDecryption]-> Parameter Store (SecureString) -[Decrypt]-> KMS
App -[GetSecretValue]-> Secrets Manager -[replicate]-> Replica secret in DR Region
~~~`,
    keywords: [
      { trigger: 'Rotate RDS credentials automatically', answer: 'Secrets Manager' },
      { trigger: 'Store configuration at lowest cost', answer: 'Parameter Store Standard tier' },
      { trigger: 'Secret needed in a DR Region', answer: 'Secrets Manager replication' },
      { trigger: 'Hierarchical config like /prod/app/db-url', answer: 'Parameter Store' },
    ],
    lessons: ['secrets-certificates'],
  },
  {
    id: 'security-detection',
    domain: 'secure',
    title: 'GuardDuty vs Inspector vs Macie vs Security Hub vs Detective',
    summary:
      'Five security services with similar names; each answers a different question: threats, vulnerabilities, sensitive data, posture, or root cause.',
    services: ['GuardDuty', 'Inspector', 'Macie', 'Security Hub', 'Detective'],
    rows: [
      {
        aspect: 'Question it answers',
        values: ['Is something malicious happening?', 'Is my workload vulnerable?', 'Where is sensitive data in S3?', 'What is my overall posture?', 'Why did it happen?'],
      },
      {
        aspect: 'Data source',
        values: ['CloudTrail, VPC Flow Logs, DNS logs, more', 'EC2, ECR images, Lambda', 'S3 objects', 'Findings from other services, Config', 'GuardDuty findings, logs'],
      },
      {
        aspect: 'Output',
        values: ['Threat findings', 'CVE and network exposure findings', 'PII / sensitive data findings', 'Aggregated findings, compliance score', 'Graph-based investigation'],
      },
      { aspect: 'Agent needed', values: ['No', 'SSM agent or agentless scan', 'No', 'No', 'No'] },
      {
        aspect: 'Example',
        values: ['Crypto mining, compromised credentials', 'Unpatched package on EC2', 'Credit card numbers in a bucket', 'CIS / FSBP checks across accounts', 'Trace a suspicious IP over time'],
      },
    ],
    pick: [
      'Choose GuardDuty for continuous, managed threat detection with no agents.',
      'Choose Inspector for automated vulnerability scanning of EC2, container images and Lambda.',
      'Choose Macie to discover and protect PII in S3.',
      'Choose Security Hub to centralize findings and check against security standards across accounts.',
      'Choose Detective to investigate the root cause of a finding.',
    ],
    diagram: `~~~flow
# Detect, aggregate, then investigate
GuardDuty (threats) -> Security Hub (aggregated findings)
Inspector (vulnerabilities) -> Security Hub (aggregated findings)
Macie (PII in S3) -> Security Hub (aggregated findings)
GuardDuty (finding) -> Detective (root cause)
~~~

~~~groups
# Each service looks at a different source
Logs and account activity: *GuardDuty, Detective
Software on workloads: *Inspector
Data in S3: *Macie
Findings from other services: *Security Hub
~~~`,
    keywords: [
      { trigger: 'Detect unusual API calls or crypto mining', answer: 'GuardDuty' },
      { trigger: 'Scan ECR images for CVEs', answer: 'Inspector' },
      { trigger: 'Find PII in S3 buckets', answer: 'Macie' },
      { trigger: 'Single dashboard of findings across accounts', answer: 'Security Hub' },
      { trigger: 'Investigate root cause of a GuardDuty finding', answer: 'Detective' },
    ],
    lessons: ['threat-detection-waf-shield'],
  },
  {
    id: 'audit-tools',
    domain: 'secure',
    title: 'CloudTrail vs AWS Config vs CloudWatch Logs',
    summary:
      'All three record "what happened"; the exam separates API calls, resource configuration, and application logs.',
    services: ['CloudTrail', 'AWS Config', 'CloudWatch Logs'],
    rows: [
      {
        aspect: 'Records',
        values: ['API calls: who, what, when, from where', 'Resource configuration and its changes', 'Log lines from apps, OS, services'],
      },
      {
        aspect: 'Question',
        values: ['Who deleted this bucket?', 'What did this SG look like last week? Is it compliant?', 'What errors did my app log?'],
      },
      {
        aspect: 'Default',
        values: ['Event history: 90 days of management events', 'Off until recorder enabled', 'Retention configurable, never expire by default'],
      },
      { aspect: 'Rules / alerts', values: ['CloudTrail Insights, EventBridge', 'Config rules, auto-remediation via SSM', 'Metric filters to alarms, Logs Insights'] },
      { aspect: 'Long-term storage', values: ['Trail to S3 (or CloudTrail Lake)', 'Delivers snapshots to S3', 'Export or stream to S3, Firehose'] },
    ],
    pick: [
      'Choose CloudTrail to audit who did what through the AWS API.',
      'Choose AWS Config to track configuration history and enforce compliance rules.',
      'Choose CloudWatch Logs to collect, search and alarm on application and system logs.',
    ],
    diagram: `~~~groups
# Each tool records something different
CloudTrail: Who called which API, When and from where
AWS Config: Resource configuration over time, *Config rules and remediation
CloudWatch Logs: App and OS logs, *Metric filter to alarm
~~~

~~~flow
# One event leaves a trace in each tool
Admin deletes an SG rule -[API call]-> CloudTrail (who, when, from where)
Admin deletes an SG rule -[configuration change]-> AWS Config (before and after, compliant?)
App hits an error -[writes log]-> CloudWatch Logs -[metric filter]-> CloudWatch alarm
~~~`,
    keywords: [
      { trigger: 'Who made the API call', answer: 'CloudTrail' },
      { trigger: 'Detect and remediate non-compliant resources', answer: 'AWS Config rules + remediation' },
      { trigger: 'Configuration at a point in time', answer: 'AWS Config' },
      { trigger: 'Alarm on an error string in logs', answer: 'CloudWatch Logs metric filter' },
      { trigger: 'Log files must not be tampered with', answer: 'CloudTrail log file integrity validation' },
    ],
    lessons: ['threat-detection-waf-shield', 'management-iac'],
  },
  {
    id: 'vpc-connectivity-options',
    domain: 'secure',
    title: 'VPC peering vs Transit Gateway vs PrivateLink vs Gateway endpoint',
    summary:
      'All keep traffic private, but they connect different things: whole networks, many networks, one service, or S3/DynamoDB.',
    services: ['VPC peering', 'Transit Gateway', 'PrivateLink (interface endpoint)', 'Gateway endpoint'],
    rows: [
      { aspect: 'Connects', values: ['Two VPCs', 'Many VPCs, VPN, Direct Connect', 'Consumer VPC to one service', 'VPC to S3 or DynamoDB'] },
      { aspect: 'Topology', values: ['1:1, non-transitive', 'Hub-and-spoke, transitive', 'One-way, service exposure', 'Route table target'] },
      { aspect: 'Overlapping CIDR', values: ['Not allowed', 'Not allowed for routing', 'Allowed', 'Not relevant'] },
      { aspect: 'Implementation', values: ['Peering connection + routes', 'Attachments + TGW route tables', 'ENI with private IP; provider uses NLB', 'Prefix list entry in route table'] },
      { aspect: 'Services', values: ['Any', 'Any', 'Most AWS services, SaaS, your own', 'Only S3 and DynamoDB'] },
      { aspect: 'Cost', values: ['Data transfer only', 'Per attachment-hour + per GB', 'Per endpoint-hour + per GB', 'Free'] },
      { aspect: 'From on-premises', values: ['No transitive access', 'Yes', 'Yes, via DX/VPN', 'No'] },
    ],
    pick: [
      'Choose VPC peering to link a few VPCs simply with no hub.',
      'Choose Transit Gateway to connect many VPCs and on-premises networks transitively.',
      'Choose PrivateLink to expose or consume one service privately, even with overlapping CIDRs.',
      'Choose a gateway endpoint for free private access to S3 or DynamoDB from inside the VPC.',
    ],
    diagram: `~~~groups
# Each option connects something different
VPC peering: Two VPCs 1:1, Not transitive
Transit Gateway: *Transitive hub, VPC + VPN + DX
PrivateLink: One service behind an NLB, Overlapping CIDRs are fine
Gateway endpoint: S3 and DynamoDB only, *Free
~~~

~~~decide
# Exam keywords and the pick
A few VPCs, simple and low cost => VPC peering
Hundreds of VPCs plus on-premises, transitive => Transit Gateway
Expose a service to customer VPCs with overlapping CIDRs => PrivateLink
Private subnet reaches S3 at no charge => Gateway endpoint
Private S3 access from on-premises => S3 interface endpoint
~~~`,
    keywords: [
      { trigger: 'Hundreds of VPCs, simplify network', answer: 'Transit Gateway' },
      { trigger: 'Expose a service to other VPCs with overlapping CIDRs', answer: 'PrivateLink (NLB endpoint service)' },
      { trigger: 'Private S3 access at no cost', answer: 'Gateway endpoint' },
      { trigger: 'Access S3 privately from on-premises', answer: 'S3 interface endpoint' },
      { trigger: 'A peered to B, B peered to C, A cannot reach C', answer: 'Peering is non-transitive' },
    ],
    lessons: ['vpc-connectivity', 'vpc-networking-security'],
  },
  {
    id: 'hybrid-connectivity',
    domain: 'secure',
    title: 'Site-to-Site VPN vs Direct Connect vs DX + VPN vs Client VPN',
    summary:
      'All connect outside networks to AWS; the trade-off is speed of setup, consistent performance, encryption and who connects.',
    services: ['Site-to-Site VPN', 'Direct Connect', 'DX + VPN', 'Client VPN'],
    rows: [
      { aspect: 'Connects', values: ['On-premises network', 'On-premises network', 'On-premises network', 'Individual user devices'] },
      { aspect: 'Path', values: ['Public internet', 'Dedicated private link', 'IPsec over Direct Connect', 'Internet, TLS (OpenVPN-based)'] },
      { aspect: 'Encrypted', values: ['Yes, IPsec', 'Not by default', 'Yes', 'Yes'] },
      { aspect: 'Setup time', values: ['Minutes to hours', 'Weeks or more', 'Weeks (needs DX)', 'Minutes to hours'] },
      { aspect: 'Performance', values: ['Variable, up to 1.25 Gbps per tunnel', 'Consistent, high bandwidth', 'Consistent', 'Variable'] },
      { aspect: 'AWS side', values: ['Virtual private gateway or TGW', 'Virtual interface to VGW, DX gateway or TGW', 'Usually Transit Gateway', 'Client VPN endpoint'] },
    ],
    pick: [
      'Choose Site-to-Site VPN for fast, low-cost encrypted connectivity or as a backup for DX.',
      'Choose Direct Connect for consistent latency and high, steady bandwidth.',
      'Choose DX + VPN when you need DX performance and encryption in transit.',
      'Choose Client VPN for remote employees connecting from laptops.',
    ],
    diagram: `~~~flow
# The paths from outside into AWS
Employee laptop -[TLS over the Internet]-> Client VPN endpoint -> VPC
Customer gateway -[IPsec over the Internet]-> VGW or Transit Gateway -> VPC
Data center -[dedicated line]-> DX location -[VIF]-> VPC
Data center -[IPsec over DX]-> Transit Gateway -> VPC
~~~

~~~ladder
# On-premises connection resiliency, lowest to highest
Single DX connection | One single point of failure | No redundancy
DX + Site-to-Site VPN | VPN over the Internet takes over when DX fails | Cost-effective
Two DX at two locations | Survives the loss of one location | High
Two DX at each of two locations | Survives device and location failures | Maximum
~~~`,
    keywords: [
      { trigger: 'Connect quickly, encrypted, low cost', answer: 'Site-to-Site VPN' },
      { trigger: 'Consistent network performance, large transfers', answer: 'Direct Connect' },
      { trigger: 'Private dedicated link that must be encrypted', answer: 'IPsec VPN over Direct Connect' },
      { trigger: 'Cost-effective backup for Direct Connect', answer: 'Site-to-Site VPN' },
      { trigger: 'Remote workers access VPC resources', answer: 'Client VPN' },
      { trigger: 'Maximum resilience for DX', answer: 'Two DX connections at separate locations' },
    ],
    lessons: ['vpc-connectivity'],
  },
  {
    id: 'multi-az-vs-replica',
    domain: 'resilient',
    title: 'RDS Multi-AZ vs Read Replica vs Aurora Replica vs Aurora Global Database',
    summary:
      'All create database copies, but some are for availability, some for read scaling, and one for cross-Region DR.',
    services: ['RDS Multi-AZ', 'RDS Read Replica', 'Aurora Replica', 'Aurora Global Database'],
    rows: [
      { aspect: 'Main goal', values: ['High availability', 'Read scaling', 'Read scaling + HA', 'Cross-Region DR, global reads'] },
      { aspect: 'Replication', values: ['Synchronous', 'Asynchronous', 'Shared cluster storage', 'Storage-level, typically under 1 second'] },
      { aspect: 'Readable', values: ['No (instance deployment)', 'Yes', 'Yes, via reader endpoint', 'Yes, in secondary Regions'] },
      { aspect: 'Failover', values: ['Automatic, same endpoint', 'Manual promotion', 'Automatic, by priority tier', 'Promote secondary Region'] },
      { aspect: 'Scope', values: ['Same Region, other AZ', 'Same or cross-Region', 'Same Region, up to 15', 'Multiple Regions'] },
      { aspect: 'Exam detail', values: ['Multi-AZ DB cluster has readable standbys', 'Can itself be Multi-AZ', 'Failover usually faster than RDS', 'RPO about 1 s, RTO under 1 minute'] },
    ],
    pick: [
      'Choose RDS Multi-AZ to survive an AZ failure with automatic failover.',
      'Choose RDS Read Replicas to offload read traffic or reports from the primary.',
      'Choose Aurora Replicas for both read scaling and fast failover inside a Region.',
      'Choose Aurora Global Database for cross-Region DR with very low RPO and RTO.',
    ],
    diagram: `~~~flow
# Each kind of copy serves a different goal
RDS primary -[sync]-> Multi-AZ standby (other AZ, not readable)
RDS primary -[async]-> Read Replica (readable, manual promote)
Aurora writer -[shared cluster storage]-> Aurora Replica (readable, automatic failover)
Aurora primary Region -[replication under 1 second]-> Secondary Region (Global Database)
~~~

~~~ladder
# The scope of failure each option survives
Read Replica in the same Region | Offloads reads, manual promotion | No auto failover
RDS Multi-AZ | Instance or AZ failure, automatic failover | AZ
Aurora Replica | Automatic failover by priority tier, usually faster than RDS | AZ
Aurora Global Database | Whole-Region outage, RPO about 1 second | Region
~~~`,
    keywords: [
      { trigger: 'Automatic failover if an AZ fails', answer: 'RDS Multi-AZ' },
      { trigger: 'Reporting queries slow down production', answer: 'Read Replica' },
      { trigger: 'Region outage, RPO seconds, RTO under a minute', answer: 'Aurora Global Database' },
      { trigger: 'Low-latency reads for users in other Regions', answer: 'Aurora Global Database or cross-Region replica' },
      { trigger: 'Standby used for reads?', answer: 'No, Multi-AZ instance standby is not readable' },
    ],
    lessons: ['high-availability-multi-az', 'backup-replication'],
  },
  {
    id: 'messaging',
    domain: 'resilient',
    title: 'SQS vs SNS vs EventBridge vs Kinesis Data Streams',
    summary:
      'All move messages between components; the exam separates queues, fan-out, event routing and replayable streams.',
    services: ['SQS Standard', 'SQS FIFO', 'SNS', 'EventBridge', 'Kinesis Data Streams'],
    rows: [
      { aspect: 'Model', values: ['Queue, consumers poll', 'Queue, consumers poll', 'Pub/sub push', 'Event bus with rules', 'Stream, consumers read shards'] },
      { aspect: 'Ordering', values: ['Best effort', 'Per message group ID', 'Not guaranteed (FIFO topics exist)', 'Not guaranteed', 'Per shard (partition key)'] },
      { aspect: 'Delivery', values: ['At least once, duplicates possible', 'Exactly-once processing', 'Push to all subscribers', 'To matching rule targets', 'Many consumers read same data'] },
      { aspect: 'Retention / replay', values: ['Up to 14 days, no replay', 'Up to 14 days, no replay', 'No storage', 'Archive and replay', 'Up to 365 days, replay'] },
      { aspect: 'Throughput', values: ['Nearly unlimited', 'Limited, higher with high-throughput mode', 'Very high', 'High', 'Scales by shards or on-demand'] },
      { aspect: 'Filtering', values: ['No', 'No', 'Subscription filter policy', 'Rich content-based patterns', 'No'] },
      { aspect: 'Typical use', values: ['Decouple, buffer work', 'Orders, financial transactions', 'Fan-out, notifications', 'SaaS and AWS events, schedules', 'Real-time analytics, clickstream'] },
    ],
    pick: [
      'Choose SQS Standard to buffer and decouple work at any scale.',
      'Choose SQS FIFO when order and no duplicates matter.',
      'Choose SNS to push one message to many subscribers (often SNS + SQS fan-out).',
      'Choose EventBridge to route events by content from AWS services, SaaS apps or schedules.',
      'Choose Kinesis Data Streams for real-time streaming that multiple consumers can replay.',
    ],
    diagram: `~~~flow
# Queue, fan-out, event bus and stream
Producer -> SQS -[consumer polls]-> Consumer
Producer -> SNS -[push fan-out]-> Many SQS queues
AWS or SaaS event -> EventBridge -[content-based rule]-> Target
Producer -> Kinesis Data Streams -[read and replay]-> Many consumers
~~~

~~~decide
# Exam keywords and the pick
Buffer work and decouple tiers => SQS Standard
Strict order, no duplicates => SQS FIFO
One message to many subscribers => SNS
Route SaaS events by content => EventBridge
Many consumers replay real-time data => Kinesis Data Streams
~~~`,
    keywords: [
      { trigger: 'Process orders in sequence, no duplicates', answer: 'SQS FIFO' },
      { trigger: 'One event to multiple queues', answer: 'SNS fan-out to SQS' },
      { trigger: 'React to events from a SaaS partner', answer: 'EventBridge' },
      { trigger: 'Real-time data, multiple apps read and replay', answer: 'Kinesis Data Streams' },
      { trigger: 'Absorb traffic spikes, decouple tiers', answer: 'SQS Standard' },
      { trigger: 'Messages that keep failing', answer: 'Dead-letter queue' },
    ],
    lessons: ['decoupling-messaging', 'application-integration'],
  },
  {
    id: 'dr-strategies',
    domain: 'resilient',
    title: 'Disaster recovery strategies',
    summary:
      'Four strategies trade cost against RTO/RPO; questions give a target RTO/RPO and budget and expect the cheapest one that fits.',
    services: ['Backup & restore', 'Pilot light', 'Warm standby', 'Multi-site active/active'],
    rows: [
      { aspect: 'Running in DR Region', values: ['Nothing, only backups', 'Core data replicated, app off', 'Scaled-down full stack', 'Full-scale stack serving traffic'] },
      { aspect: 'RPO', values: ['Hours', 'Minutes', 'Seconds to minutes', 'Near zero'] },
      { aspect: 'RTO', values: ['Hours', 'Tens of minutes', 'Minutes', 'Near zero'] },
      { aspect: 'Cost', values: ['Lowest', 'Low', 'Medium-high', 'Highest'] },
      { aspect: 'On disaster', values: ['Restore, then deploy everything', 'Start/scale app servers', 'Scale up to production size', 'Shift traffic (often automatic)'] },
      { aspect: 'Typical tools', values: ['AWS Backup, S3 CRR, snapshots', 'Replicated DB, AMIs, IaC', 'Small ASG, replica DB', 'Route 53, Aurora Global, DynamoDB global tables'] },
    ],
    pick: [
      'Choose backup & restore when hours of downtime are acceptable and cost must be lowest.',
      'Choose pilot light when data must be current but app servers can start after a disaster.',
      'Choose warm standby when recovery must take minutes and a small copy can always run.',
      'Choose multi-site active/active when downtime must be near zero regardless of cost.',
    ],
    diagram: `~~~ladder
# Cheapest to most expensive, RTO shrinking
Backup & restore | Only backups in the DR Region | Hours
Pilot light | Data replicated, app turned off | Tens of minutes
Warm standby | A scaled-down stack is running | Minutes
Multi-site active/active | A full stack serving traffic | Near zero
~~~

~~~groups
# What is running in the DR Region
Backup & restore: Snapshots and backups, Nothing running
Pilot light: *Database replica, AMIs and IaC ready
Warm standby: *Database replica, *Scaled-down ASG, ALB
Multi-site active/active: *Full database, *Production stack, Route 53 splits traffic
~~~`,
    keywords: [
      { trigger: 'Lowest cost, RTO of hours acceptable', answer: 'Backup & restore' },
      { trigger: 'Only the database runs in the DR Region', answer: 'Pilot light' },
      { trigger: 'Scaled-down but functional copy', answer: 'Warm standby' },
      { trigger: 'Zero downtime, both Regions serve traffic', answer: 'Multi-site active/active' },
    ],
    lessons: ['disaster-recovery', 'backup-replication'],
  },
  {
    id: 'route53-policies',
    domain: 'resilient',
    title: 'Route 53 routing policies',
    summary:
      'Seven policies that all return DNS answers; the trigger words are about location, latency, percentage or health.',
    services: ['Simple', 'Weighted', 'Latency', 'Failover', 'Geolocation', 'Geoproximity', 'Multivalue'],
    rows: [
      { aspect: 'Routes by', values: ['Nothing, one record', 'Relative weights', 'Lowest network latency', 'Primary health', 'User country/continent', 'Distance with bias', 'Random healthy records'] },
      { aspect: 'Records needed', values: ['One record (can hold several values)', 'Several records, same name, each weighted', 'One record per Region', 'Primary + secondary record', 'Records per continent/country + default', 'Records with Region or coordinates', 'Several records, each with own health check'] },
      { aspect: 'Health checks', values: ['No', 'Yes', 'Yes', 'Yes, required for primary', 'Yes', 'Yes', 'Yes'] },
      { aspect: 'Typical use', values: ['Single resource', 'A/B test, canary, migration', 'Global app, best speed', 'Active-passive DR', 'Compliance, localization', 'Shift traffic between Regions', 'Simple client-side load spread'] },
      { aspect: 'Exam detail', values: ['Multiple values returned in random order', 'Weight 0 stops traffic', 'Latency is not distance', 'Secondary used only if primary unhealthy', 'Add a default record', 'Set bias to grow or shrink area', 'Up to 8 healthy records; not a load balancer'] },
    ],
    pick: [
      'Choose Simple for one resource with no health checks.',
      'Choose Weighted to split traffic by percentage.',
      'Choose Latency to send users to the fastest Region.',
      'Choose Failover for active-passive DR with health checks.',
      'Choose Geolocation to serve content by where the user is.',
      'Choose Geoproximity to route by distance and shift traffic with bias.',
      'Choose Multivalue to return several healthy IPs.',
    ],
    diagram: `~~~decide
# Question keywords and the routing policy to pick
Split traffic by percentage, canary => Weighted
Send users to the fastest-responding Region => Latency
Active-passive based on health checks => Failover
Serve by the user's country, compliance => Geolocation
Shift traffic between Regions with a bias => Geoproximity
Return several healthy IPs => Multivalue
~~~

~~~flow
# Route 53 returns different records by health and weight
Users -> Route 53 -[failover, primary healthy]-> ALB in primary Region
Users -> Route 53 -[failover, primary unhealthy]-> ALB in DR Region
Users -> Route 53 -[weighted 90/10]-> Old and new versions
~~~`,
    keywords: [
      { trigger: 'Send 10% of traffic to the new version', answer: 'Weighted' },
      { trigger: 'Lowest latency for global users', answer: 'Latency' },
      { trigger: 'Users in Germany must reach EU servers', answer: 'Geolocation' },
      { trigger: 'Active-passive with health check', answer: 'Failover' },
      { trigger: 'Expand traffic to one Region using bias', answer: 'Geoproximity' },
    ],
    lessons: ['route53-routing'],
  },
  {
    id: 'load-balancers',
    domain: 'resilient',
    title: 'ALB vs NLB vs GWLB',
    summary:
      'All are Elastic Load Balancing, but they operate at different layers and solve different problems.',
    services: ['ALB', 'NLB', 'GWLB'],
    rows: [
      { aspect: 'Layer', values: ['7: HTTP, HTTPS, gRPC, WebSocket', '4: TCP, UDP, TLS', '3: IP packets (GENEVE 6081)'] },
      { aspect: 'Routing', values: ['Path, host, header, query string', 'Port and protocol', 'Through appliance fleet'] },
      { aspect: 'Targets', values: ['Instance, IP, Lambda', 'Instance, IP, ALB', 'Instance, IP of appliances'] },
      { aspect: 'Static IP', values: ['No, DNS name only', 'Yes, one per AZ (Elastic IP possible)', 'No'] },
      { aspect: 'Performance', values: ['Good for web traffic', 'Millions of requests/s, ultra-low latency', 'Transparent to traffic'] },
      { aspect: 'Exam detail', values: ['Cognito/OIDC auth, WAF attach', 'PrivateLink endpoint service', 'Third-party firewall, IDS/IPS'] },
    ],
    pick: [
      'Choose ALB for HTTP/HTTPS apps needing content-based routing.',
      'Choose NLB for TCP/UDP, extreme performance, static IPs or PrivateLink.',
      'Choose GWLB to insert third-party network appliances transparently.',
    ],
    diagram: `~~~flow
# Each load balancer works at a different layer
Users -[HTTP/HTTPS, layer 7]-> ALB -[path, host, header]-> EC2 / Lambda
Client -[TCP/UDP, layer 4]-> NLB (static IP per AZ) -> EC2
Traffic -[GENEVE, layer 3]-> GWLB -> Firewall appliance -> Original destination
~~~

~~~decide
# Exam requirements and the load balancer
Route by path, host or header => ALB
Authenticate with Cognito/OIDC or attach WAF => ALB
Static IPs, UDP, millions of requests per second => NLB
Expose a service through PrivateLink => NLB
Insert third-party firewall appliances transparently => GWLB
~~~`,
    keywords: [
      { trigger: 'Route /api and /images to different targets', answer: 'ALB' },
      { trigger: 'Static IP for allow-listing', answer: 'NLB (or Global Accelerator)' },
      { trigger: 'UDP or millions of requests per second', answer: 'NLB' },
      { trigger: 'Inspect traffic with third-party virtual appliances', answer: 'GWLB' },
      { trigger: 'Invoke Lambda over HTTP', answer: 'ALB' },
    ],
    lessons: ['elastic-load-balancing'],
  },
];
