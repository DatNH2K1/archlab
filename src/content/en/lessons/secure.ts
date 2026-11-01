import type { Lesson } from '@/content/types';

export const secureLessonsEn: Lesson[] = [
  {
    slug: 'security-layers-overview',
    domain: 'secure',
    title: 'Security by system layer: the big picture',
    summary:
      'A summary map: how each layer of a system (edge, network, compute, application, data) gets attacked and which AWS service stops it there. Read this before the detailed lessons.',
    services: [
      'AWS WAF',
      'AWS Shield',
      'Amazon CloudFront',
      'AWS Network Firewall',
      'Amazon VPC',
      'AWS IAM',
      'AWS KMS',
      'Amazon GuardDuty',
      'AWS Security Hub',
    ],
    minutes: 8,
    body: `## Defense in depth

Exam questions often list a pile of security services (WAF, Shield, Security Group, NACL, Network Firewall, KMS, GuardDuty...) as distractors. The fastest way through: **work out which layer the threat lives in**, then pick the service that works at that layer.

No layer is enough on its own. A request from the Internet passes through several layers, and each one stops a different kind of attack. The outer layers stop things early and cheaply; the innermost layer protects the data once the outer ones have been bypassed.

~~~layers
# Outside in: each layer has its own group of services
Edge (outside the VPC): Route 53, CloudFront, *AWS WAF, *Shield
Network (VPC and subnets): Public/private subnet, *NACL, Network Firewall, NAT Gateway, VPC endpoint
Compute (instances): *Security Group, IMDSv2, Inspector, Systems Manager Patch Manager
Application: Cognito, API Gateway authorizer, Secrets Manager, ACM (TLS)
Data (core): *KMS, S3 Block Public Access, bucket policy, Macie, AWS Backup
~~~

Two things **belong to no single layer and cut across all of them**:

- **Identity (IAM)**: who may call which API. It applies to every layer, from editing a WAF rule to reading a KMS key.
- **Detection and audit**: CloudTrail, Config, GuardDuty and Security Hub record and alert on what happens at every layer.

~~~groups
# Two cross-cutting layers next to the five system layers
Access control (IAM): IAM policy, *Roles instead of access keys, SCP, Permissions boundary, IAM Identity Center
Detection and audit: *CloudTrail, AWS Config, *GuardDuty, Security Hub, Detective
~~~

## How a request passes through the layers

Follow one HTTPS request from a user to the database in a standard 3-tier web architecture:

~~~flow
# Every hop has its own check
Users -[DNS]-> Route 53 -[HTTPS]-> CloudFront (WAF + Shield) -> ALB (public subnet) -> EC2 (private subnet)
EC2 (private subnet) -[SG port 3306]-> RDS (KMS encrypted) -> Snapshot (also encrypted)
~~~

What to remember at each hop:

1. **Route 53 + CloudFront + Shield Standard**: absorb layer 3/4 DDoS at the edge, before traffic reaches the VPC.
2. **AWS WAF** (attached to CloudFront, ALB, API Gateway or AppSync): filters on HTTP content such as SQL injection, XSS, per-IP rate limits and geo blocking.
3. **ALB in a public subnet**: only the ALB has a path to the Internet. Its Security Group opens 443 from the Internet (or only from the CloudFront prefix list).
4. **EC2 in a private subnet**: no public IP. Its Security Group only accepts traffic **from the ALB's Security Group**, not from a CIDR.
5. **RDS**: its Security Group only accepts traffic from the app tier's Security Group. Data is encrypted at rest with KMS and connections use TLS.

~~~groups
# Where each tier sits in the VPC
[VPC 10.0.0.0/16]
Public subnet: *ALB, NAT Gateway
Private subnet (app): *EC2 (ASG)
Private subnet (data): *RDS, ElastiCache
~~~

## Summary table: layer, threat, service

| Layer | Typical threat | Services that stop it here | The exam usually says |
|---|---|---|---|
| Edge | DDoS, bots, SQL injection, XSS | Shield, WAF, CloudFront | "layer 7 attack", "block SQL injection", "DDoS" |
| Network | Access from unknown IPs, filtering between subnets, data leaving to the Internet | NACL, Network Firewall, private subnet, VPC endpoint | "block an IP range", "filter by domain", "must not traverse the Internet" |
| Compute | Extra open ports, unpatched OS, credentials leaked on an instance | Security Group, Inspector, Patch Manager, IMDSv2, roles | "least privilege between tiers", "software vulnerabilities" |
| Application | Unauthenticated users, hard-coded secrets, eavesdropping | Cognito, API Gateway authorizer, Secrets Manager, ACM | "sign-in for a mobile app", "rotate the DB password" |
| Data | Data theft, public buckets, accidental deletes, ransomware | KMS, S3 Block Public Access, Macie, Object Lock, Backup | "encrypt at rest", "find PII", "WORM" |

## Traffic filtering: 5 services that get mixed up

The hardest questions put the traffic filters side by side. Tell them apart by **OSI layer** and **what they attach to**:

~~~ladder
# From the application layer down to the network layer
AWS WAF | Reads HTTP content: URL, headers, body, IP, country | L7
AWS Shield Advanced | DDoS protection with the DRT team and cost protection | L3/4/7
Network Firewall | Stateful firewall for the whole VPC, domain filtering, IPS | L3-7
Network ACL | Stateless allow/deny rules by CIDR for a whole subnet | L3/4
Security Group | Stateful, allow only, attached to an ENI/instance | L3/4
~~~

~~~decide
# What the question says and which filter to pick
Block SQL injection or XSS => AWS WAF
Limit requests per IP over 5 minutes => AWS WAF rate-based rule
Block one specific IP at the subnet level => Network ACL Deny rule
Let EC2 reach only an allow list of domains => AWS Network Firewall
Large DDoS, need AWS responders and scaling cost refunds => Shield Advanced
Only the app tier may connect to the database => Security Group referencing an SG
~~~

## Encryption: in transit and at rest

Encryption is the last line of defense: even if an attacker gets a disk or a snapshot, they can't read it without the key.

~~~flow
# In transit uses TLS, at rest uses KMS
Users -[TLS, ACM cert]-> CloudFront -[TLS]-> ALB -[TLS optional]-> EC2
EC2 -[TLS]-> RDS -[at rest]-> KMS key
~~~

- **In transit**: TLS on every hop. Free public certificates come from **ACM** and attach to CloudFront, ALB and API Gateway. To force HTTPS for S3, use a bucket policy with the \`aws:SecureTransport\` condition.
- **At rest**: most storage services (S3, EBS, RDS, DynamoDB, EFS) encrypt with **KMS**. To control the key policy and rotation yourself, use a **customer managed key**; for a single-tenant HSM at FIPS 140-3 level 3, use **CloudHSM**.

## Identity: the layer you never skip

The network controls **who can reach** a resource; IAM controls **who may call the API**. An S3 bucket is not inside any VPC, so only IAM and the bucket policy protect it.

~~~flow
# One API call is evaluated through several policy layers
Request -> SCP (account limit) -> Permissions boundary -> Identity policy -> Resource policy
~~~

- An explicit Deny at any layer always wins.
- Apps on EC2, Lambda and ECS use an **IAM role**, never access keys stored on the machine.
- Workforce users sign in through **IAM Identity Center**; an app's end users sign in through **Cognito**.

## Detection and response

Defensive layers can be bypassed, so you need a **detection** layer. This is the typical chain the exam asks about:

~~~flow
# From logs to automatic response
CloudTrail + VPC Flow Logs + DNS logs -> GuardDuty (detects) -> Security Hub (aggregates)
GuardDuty (finding) -> EventBridge -> Lambda (isolates the instance) -> SNS (alerts the team)
~~~

~~~decide
# Each detection service answers one question
Who called which API, and when => CloudTrail
Is the resource configuration compliant, and who changed it => AWS Config
Unusual behaviour such as crypto mining or calls to malicious IPs => GuardDuty
EC2 or container images with unpatched CVEs => Amazon Inspector
S3 holds sensitive data such as PII => Amazon Macie
Gather every finding and score it against a standard => Security Hub
~~~

## Quick summary

1. For any security question, identify the layer first (edge, network, compute, application, data), then pick the service.
2. HTTP/request content → WAF. DDoS → Shield. Subnet/IP → NACL. Between tiers → Security Group. Domain filtering for a whole VPC → Network Firewall.
3. Data is always encrypted: TLS (ACM) in transit, KMS at rest.
4. IAM and the detection layer (CloudTrail, Config, GuardDuty, Security Hub) apply to every layer.
5. Each layer is covered in detail in the following lessons of this domain: IAM, Organizations, Cognito, VPC security, VPC connectivity, KMS, secrets and WAF/Shield/GuardDuty.
`,
    keywords: [
      { trigger: 'block SQL injection, XSS, rate limit per IP', answer: 'AWS WAF' },
      { trigger: 'large DDoS, need a response team and cost protection', answer: 'AWS Shield Advanced' },
      { trigger: 'block an IP range at the subnet level', answer: 'Network ACL' },
      { trigger: 'filter outbound traffic by domain for a whole VPC', answer: 'AWS Network Firewall' },
      { trigger: 'only the app tier may connect to the database', answer: 'Security Group referencing a Security Group' },
      { trigger: 'encrypt at rest and manage the key policy yourself', answer: 'KMS customer managed key' },
      { trigger: 'aggregate security findings across services and accounts', answer: 'AWS Security Hub' },
    ],
    traps: [
      'Security Groups and NACLs cannot read HTTP content; blocking SQL injection needs WAF.',
      'WAF does not attach to an NLB or directly to EC2; it attaches to CloudFront, ALB, API Gateway, AppSync, Cognito User Pools and a few other services.',
      'Security Groups have no Deny rules; to block one specific IP, use a NACL or WAF.',
      'S3 is not inside a VPC; protect it with IAM, bucket policies and Block Public Access, not Security Groups.',
      'GuardDuty only detects, it does not block; for automatic response, route findings through EventBridge to Lambda.',
      'Shield Standard is free and always on; only Shield Advanced adds the DRT and cost protection.',
    ],
  },
  {
    slug: 'iam-fundamentals',
    domain: 'secure',
    title: 'IAM Basics: Users, Groups, Roles and Policies',
    summary:
      'The foundation of every security question: who can do what on which resource. Master policy evaluation logic, permission boundaries and using roles instead of access keys.',
    services: ['AWS IAM', 'AWS STS', 'Amazon EC2'],
    minutes: 10,
    body: `## What is IAM

AWS Identity and Access Management (IAM) is a global service (not tied to a Region) used to manage identities and permissions to AWS resources. IAM is free.

### Main components

- **Root user**: the identity created when you open the account; it has full access and cannot be restricted by IAM policies within that account.
- **IAM user**: a person or application, which can have a console password and/or access keys (long-term credentials).
- **IAM group**: a collection of users for assigning shared policies. A group contains only users, **groups cannot be nested**, and a group is not a principal (you cannot put a group in the Principal of a resource-based policy).
- **IAM role**: an identity with no long-term credentials. Whoever is allowed (per the trust policy) assumes the role and receives **temporary credentials** from AWS STS.
- **Policy**: a JSON document with Effect (Allow/Deny), Action, Resource, Condition.

~~~groups
# IAM identities and how they get credentials
Root user: Full account access, *Enable MFA and lock it away
IAM user: Console password, Long-term access keys
IAM group: Users only, Cannot be nested, Not a principal
IAM role: Trust policy, *Temporary credentials from STS
~~~

### Policy types

| Type | Attached to | Exam notes |
|---|---|---|
| AWS managed policy | User/Group/Role | Maintained by AWS, convenient but usually overly broad |
| Customer managed policy | User/Group/Role | Reusable, versioned, preferred for least privilege |
| Inline policy | A single identity | Tightly coupled 1-1, deleted with the identity |
| Resource-based policy | Resource (S3 bucket, SQS, KMS key...) | Has a Principal field, allows cross-account |
| Permission boundary | User/Role | Limits **maximum** permissions, does not grant permissions itself |
| SCP (Organizations) | OU/Account | Limits maximum permissions for the whole account |
| Session policy | When assuming a role | Narrows the permissions of the session |

~~~groups
# Where each policy type attaches
Identity: Managed policy, Inline policy, *Permission boundary (user or role only)
Resource: Bucket policy, Key policy, Role trust policy
Organizations: *SCP on an OU or account
Session: Session policy when assuming a role
~~~

## Policy evaluation logic

1. By default every request is an **implicit deny**.
2. If any **explicit Deny** applies → denied immediately. Explicit Deny always wins.
3. SCPs, permission boundaries and session policies must **allow** the action (they are "filters", they do not grant permissions).
4. An identity-based policy or resource-based policy must have an **Allow**.

Remember: **effective permissions = intersection** of the identity policy with the boundary and SCP. Example: a policy allows s3:* but the permission boundary only allows s3:GetObject → the user can only read objects.

For **cross-account** access, both sides must allow: the identity policy in the calling account and the resource-based policy (or role trust policy) in the account that owns the resource.

~~~ladder
# A request is evaluated from top to bottom
Explicit Deny | Present in any policy means denied immediately | Deny
SCP, permission boundary, session policy | Must allow, but grants nothing by itself | Filter
Identity-based or resource-based policy | Needs at least one Allow | Allow
No Allow anywhere | Denied by default | Implicit deny
~~~

### When to use a permission boundary

Classic scenario: let developers create IAM roles for their own Lambda functions without allowing privilege escalation. Solution: require every role created by developers to have a specific permission boundary attached (using the Condition iam:PermissionsBoundary).

~~~flow
# Developers can only create roles that carry the boundary
Developer -[CreateRole with boundary]-> Role for Lambda -> Permissions = policy intersected with boundary
Developer -[CreateRole without boundary]-> Denied (iam:PermissionsBoundary condition)
~~~

## Root user – best practices

- Enable **MFA** for the root user, do not create access keys for root (delete them if they exist).
- Use root only for tasks that require it: changing account information, closing the account, changing the Support plan, restoring access when IAM is locked out by mistake, certain billing tasks.
- Create a separate admin (ideally via IAM Identity Center) for daily work.

## MFA and password policy

- Supported MFA: virtual MFA app, FIDO2 passkey/security key, hardware TOTP token.
- You can require MFA in a policy using the Condition aws:MultiFactorAuthPresent.
- Account password policy: minimum length, required characters, password expiration, preventing reuse.

## Access keys and credentials

- Access key = Access Key ID + Secret Access Key, used for CLI/SDK. These are **long-term** credentials → risk of leakage.
- Each IAM user can have at most **2 access keys** (for rotation).
- Never embed access keys in code or AMIs or store them on EC2. Use an **IAM role**.
- IAM Credential Report (account level) and IAM Access Advisor (user/role level, shows when each service was last used) help clean up excess permissions.
- IAM Access Analyzer: detects resources shared outside the account/organization, validates policies, generates least-privilege policies from CloudTrail.

~~~decide
# Tools for cleaning up permissions and credentials
List password, access key and MFA status of every user => IAM Credential Report
See when a user or role last used each service => IAM Access Advisor
Find resources shared outside the account or organization => IAM Access Analyzer
Generate a least-privilege policy from CloudTrail activity => IAM Access Analyzer
~~~

## Roles for services and Instance profiles

- EC2 uses a role through an **instance profile** (a container for the role). Applications on EC2 get temporary credentials from the Instance Metadata Service (IMDSv2 recommended).
- Lambda uses an **execution role**; ECS tasks use a **task role** (different from the task execution role used to pull images and write logs).
- You can replace the role of a running EC2 instance without stopping it.

~~~flow
# EC2 uses a role instead of access keys
IAM role -> Instance profile -> EC2
App on EC2 -[IMDSv2]-> Temporary credentials (auto-rotated) -> S3
~~~

## Quick comparison

| Need | Choose |
|---|---|
| An application on EC2 needs to call S3 | IAM role + instance profile |
| Employees sign in to multiple accounts | IAM Identity Center |
| Limit the maximum permissions a developer can grant | Permission boundary |
| Forbid an action for an entire account | SCP |
| Let another account read a bucket | Bucket policy (resource-based) or cross-account role |
| Who called this API? | CloudTrail |

## Exam tips

- See "access key on EC2" or "hard-coded credentials" → the answer is almost always an IAM role.
- "Least privilege" → policies specific to actions/resources, avoid wildcards.
- An explicit Deny anywhere (identity, resource, SCP, boundary) beats Allow.
`,
    keywords: [
      { trigger: 'application on EC2 needs secure access to S3/DynamoDB', answer: 'IAM role attached via instance profile, not access keys' },
      { trigger: 'limit the maximum permissions a developer can assign to roles they create', answer: 'Permission boundary' },
      { trigger: 'an Allow policy and a Deny policy both apply', answer: 'Explicit Deny always wins' },
      { trigger: 'protect the root user', answer: 'Enable MFA, delete root access keys, use a separate admin' },
      { trigger: 'find unused permissions to clean up', answer: 'IAM Access Advisor / IAM Access Analyzer' },
      { trigger: 'list credential status of every user in the account', answer: 'IAM Credential Report' },
      { trigger: 'require MFA before a sensitive action', answer: 'Condition aws:MultiFactorAuthPresent in the policy' },
      { trigger: 'detect resources shared outside the account', answer: 'IAM Access Analyzer' },
    ],
    traps: [
      'Permission boundaries and SCPs do not grant permissions on their own; an identity policy with Allow is still required.',
      'Groups cannot be nested, and a group cannot be used as a Principal in a resource-based policy.',
      'Storing access keys in a config file on EC2 or in an AMI is wrong even if encrypted; the correct answer is an IAM role.',
      'IAM is a global service; you do not need separate users/roles per Region.',
      'Attaching AdministratorAccess for convenience violates least privilege and is usually a distractor.',
    ],
  },
  {
    slug: 'iam-organizations-scp',
    domain: 'secure',
    title: 'AWS Organizations, SCPs and Cross-Account Access',
    summary:
      'Managing multiple accounts: OUs, SCPs, Control Tower, IAM Identity Center, sharing resources with RAM and cross-account access with STS AssumeRole.',
    services: ['AWS Organizations', 'AWS Control Tower', 'AWS IAM Identity Center', 'AWS STS', 'AWS Resource Access Manager'],
    minutes: 10,
    body: `## AWS Organizations

AWS Organizations groups multiple accounts into an organization with a **management account** (formerly called master) and **member accounts**.

- **Organizational Unit (OU)**: groups accounts hierarchically (e.g., Prod, Dev, Security, Sandbox). Policies attached to an OU are inherited by child accounts.
- **Consolidated billing**: one bill, usage is aggregated for volume discounts; Reserved Instances and Savings Plans can be shared across accounts.
- Two modes: consolidated billing only, or **all features** (required to use SCPs).
- Creating a new account via API automatically creates the OrganizationAccountAccessRole so the management account can administer it.

~~~groups
# Policies attached to an OU are inherited by child accounts
[Organization root]
Management account: Central billing, *Not affected by SCPs
OU Security: Log Archive account, Audit account
OU Prod: App A account, App B account
OU Dev: Dev account, Sandbox account
~~~

## Service Control Policy (SCP)

An SCP sets the **maximum permissions** for every IAM user and role in member accounts, **including the member account root user**.

- SCPs **do not grant permissions**. An IAM policy Allow is still required.
- SCPs **do not apply to the management account**. So the best practice is not to run workloads in the management account.
- SCPs do not affect service-linked roles.
- Two strategies: **deny list** (keep FullAWSAccess, add specific Denies) or **allow list** (remove FullAWSAccess, Allow only what is needed).
- Typical examples: prevent disabling CloudTrail, prevent leaving the Organization, allow only certain Regions (using Condition aws:RequestedRegion), require tags, forbid creating IAM users.

Besides SCPs there is the **Resource Control Policy (RCP)**, which limits maximum permissions on resources (such as S3, KMS, SQS, STS, Secrets Manager) within the organization, and management policies such as tag policies and backup policies.

To block access to resources from outside the organization: use the Condition **aws:PrincipalOrgID** in resource-based policies (e.g., a bucket policy that only allows principals in your own organization).

~~~flow
# An SCP is only a filter: effective permissions are the SCP intersected with IAM policies
Request in a member account -[SCP allows?]-> IAM policy -[has Allow?]-> Executed
Request to an unapproved Region -[SCP Deny]-> Denied (even member account root)
~~~

## AWS Control Tower

Control Tower sets up a best-practice multi-account **landing zone** in just a few steps, running on top of Organizations.

- Automatically creates the Log Archive and Audit accounts, configures IAM Identity Center, centralized CloudTrail and AWS Config.
- **Controls** (formerly guardrails): preventive (enforced with SCPs), detective (enforced with AWS Config rules), proactive (checked with CloudFormation hooks before resources are created).
- **Account Factory**: creates new, standardized accounts.
- Dashboard shows which accounts are non-compliant.

~~~groups
# Control Tower's three kinds of controls
Preventive: Blocks before it happens, *Enforced by SCPs
Detective: Detects after it happens, *Enforced by AWS Config rules
Proactive: Checks before resources are created, *CloudFormation hooks
~~~

Exam keywords: "set up and govern a secure multi-account environment quickly", "landing zone" → Control Tower.

## IAM Identity Center

The new name for AWS Single Sign-On. A single place to sign in to multiple AWS accounts in the Organization and SAML applications (Salesforce, Microsoft 365...).

- Identity source: the built-in Identity Center directory, Active Directory (via AWS Managed Microsoft AD or AD Connector), or an external IdP (Microsoft Entra ID, Okta...) via SAML 2.0 + SCIM.
- **Permission set**: a set of policies assigned to users/groups on each account; Identity Center automatically creates the corresponding role in the account.
- AWS-recommended choice for human (workforce) access, instead of creating IAM users in each account.

~~~flow
# One sign-in, many accounts
External IdP (Entra ID, Okta) -[SCIM syncs users and groups]-> IAM Identity Center
Employee -[SAML sign-in]-> IAM Identity Center -[permission set]-> Role created in each account
~~~

## Identity-based vs Resource-based policy

| Criterion | Identity-based | Resource-based |
|---|---|---|
| Attached to | User, group, role | Resources: S3, SQS, SNS, KMS key, Lambda, ECR... |
| Has Principal? | No | Yes |
| Cross-account | Requires assuming a role in the target account | An external principal calls directly, without giving up its own permissions |
| Examples | Policy for an EC2 role | Bucket policy, key policy, role trust policy |

Exam point: when you assume a role, you **lose the permissions of your original identity** and only have the role's permissions. With a resource-based policy the principal keeps its own permissions (useful when you need to read from bucket A and write to bucket B in two different accounts).

~~~flow
# Assuming a role drops your original permissions; a resource-based policy does not
Role in account A -[sts:AssumeRole]-> Role in account B (only role B's permissions)
Role in account A -[bucket policy allows it]-> Bucket in account B (keeps account A permissions)
~~~

## Cross-account access with STS AssumeRole

1. Account B (owns the resource) creates a role with a **trust policy** allowing account A (or a specific role) to assume it.
2. Account A grants the user/role the sts:AssumeRole permission on that role's ARN.
3. The application calls AssumeRole and receives temporary credentials (1 hour by default, up to the role's configured max session duration, which can be up to 12 hours).

~~~flow
# Account A accesses resources in account B
User/role in account A -[sts:AssumeRole]-> STS -[checks trust policy]-> Role in account B
Role in account B -[temporary credentials]-> S3 (account B bucket)
~~~

For **third-party** (vendor) access: use a cross-account role with an **External ID** in the Condition to prevent the "confused deputy" problem. Never share access keys.

STS APIs to remember: AssumeRole, AssumeRoleWithSAML, AssumeRoleWithWebIdentity, GetSessionToken (used with MFA), GetCallerIdentity.

## AWS Resource Access Manager (RAM)

RAM shares resources between accounts (inside or outside the Organization) without copying them:

- **VPC subnets** (VPC sharing): multiple accounts create resources in the same subnet managed by a central account.
- Transit Gateway, Route 53 Resolver rules, License Manager configurations, AWS Network Firewall policies, Aurora DB clusters (for cloning) and many other types.

VPC sharing reduces the number of VPCs and removes the need for peering, but each account manages only its own resources.

## Exam tips

- "Prevent all accounts, including root of member accounts, from doing X" → SCP.
- "Restrict to approved Regions" → SCP with aws:RequestedRegion.
- "Only principals in our organization can access the bucket" → aws:PrincipalOrgID.
- "Third party needs access" → cross-account role + External ID.
- "Centralized login for employees across accounts" → IAM Identity Center.
`,
    keywords: [
      { trigger: 'prevent all accounts (including member account root) from performing an action', answer: 'Service Control Policy (SCP)' },
      { trigger: 'allow only a set of approved Regions', answer: 'SCP with the aws:RequestedRegion condition' },
      { trigger: 'quickly set up a best-practice multi-account environment, landing zone', answer: 'AWS Control Tower' },
      { trigger: 'employees sign in once to multiple accounts', answer: 'IAM Identity Center with permission sets' },
      { trigger: 'only principals in the organization can access the bucket', answer: 'Bucket policy with aws:PrincipalOrgID' },
      { trigger: 'third party needs access to resources in the account', answer: 'Cross-account IAM role with External ID' },
      { trigger: 'share subnets/Transit Gateway across accounts', answer: 'AWS Resource Access Manager (RAM)' },
      { trigger: 'combine bills, share RIs/Savings Plans', answer: 'AWS Organizations consolidated billing' },
    ],
    traps: [
      'SCPs do not apply to the management account; do not choose an SCP to restrict the management account.',
      'SCPs do not grant permissions: an account with an SCP Allow but no IAM policy Allow is still denied.',
      'When assuming a role, the principal loses its original permissions; if you need to keep permissions on both sides, think of resource-based policies.',
      'Sharing access keys with a vendor is wrong; use a role + External ID.',
      'Control Tower preventive controls are based on SCPs, detective controls on AWS Config; do not mix up the two.',
    ],
  },
  {
    slug: 'identity-federation-cognito',
    domain: 'secure',
    title: 'Federation, Amazon Cognito and Directory Service',
    summary:
      'Giving users outside AWS access: SAML 2.0, OIDC, Cognito User Pools and Identity Pools, plus the three AWS Directory Service options.',
    services: ['Amazon Cognito', 'AWS STS', 'AWS Directory Service', 'AWS IAM Identity Center'],
    minutes: 9,
    body: `## What is identity federation

Federation lets identities managed **outside AWS** (Active Directory, Okta, Google, Facebook...) access AWS without creating IAM users. The end result is always **temporary credentials** from STS tied to an IAM role.

### SAML 2.0 federation

- For enterprises with a SAML 2.0-compatible IdP (AD FS, Microsoft Entra ID, Okta...).
- Flow: user signs in to the IdP → IdP returns a SAML assertion → call **AssumeRoleWithSAML** (or use the console sign-in endpoint) → receive temporary credentials.
- Today AWS recommends using **IAM Identity Center** as an intermediate layer when you have multiple accounts.

~~~flow
# SAML 2.0 federation flow
Employee -> Corporate IdP (AD FS, Entra ID, Okta) -[SAML assertion]-> STS (AssumeRoleWithSAML) -[temporary credentials]-> AWS console / API
~~~

### OIDC / Web identity federation

- For web/mobile applications with IdPs such as Google, Facebook, Amazon, Apple or any OIDC IdP.
- API: **AssumeRoleWithWebIdentity**. For mobile apps, AWS recommends using **Cognito Identity Pools** instead of calling it directly.
- Also used for workloads: GitHub Actions, EKS (IRSA) assume roles via OIDC without access keys.

~~~flow
# Workloads trade an OIDC token for temporary credentials, no access keys
GitHub Actions -[OIDC token]-> STS (AssumeRoleWithWebIdentity) -[temporary credentials]-> Deploy to AWS
EKS pod (IRSA) -[service account token]-> STS (AssumeRoleWithWebIdentity) -[temporary credentials]-> DynamoDB
~~~

## Amazon Cognito

### User Pools – authentication

- A managed user directory: sign-up, sign-in, email/phone verification, forgot password, MFA, hosted UI.
- Federates sign-in with social providers (Google, Facebook, Apple, Amazon) and enterprise IdPs (SAML, OIDC).
- Returns **JWTs** (ID token, access token, refresh token).
- Direct integration: **API Gateway** (Cognito authorizer), **Application Load Balancer** (authenticate-cognito listener rule).
- Lambda triggers to customize flows (pre sign-up, post confirmation...).

~~~flow
# A User Pool protects an ALB and API Gateway
Users -> ALB (authenticate-cognito) -[redirect if not signed in]-> Cognito hosted UI -[after sign-in]-> ALB -> EC2
Users -[JWT in header]-> API Gateway (Cognito authorizer) -> Lambda
~~~

### Identity Pools – authorization to AWS

- Exchanges tokens (from a User Pool, social IdP, SAML, OIDC or developer-authenticated) for **temporary AWS credentials**.
- Supports **guest (unauthenticated) access** with a separate role that has limited permissions.
- You can use policy variables such as cognito-identity.amazonaws.com:sub so each user can only access their own S3 prefix or their own DynamoDB items (fine-grained access control).

| Criterion | User Pool | Identity Pool |
|---|---|---|
| Purpose | Authenticate application users | Issue temporary AWS credentials |
| Output | JWT tokens | Access key/secret/session token (STS) |
| Direct S3/DynamoDB access from the app | No | Yes |
| Guest access | No | Yes |
| ALB/API Gateway integration | Yes | Not directly |

Common combination: the user signs in via a User Pool, then exchanges the JWT at an Identity Pool to upload photos directly to S3.

~~~flow
# The User Pool authenticates, the Identity Pool authorizes to AWS
Users -[sign-in]-> Cognito User Pool -[JWT]-> Cognito Identity Pool -[temporary credentials]-> S3 (the user's own prefix)
~~~

## AWS Directory Service

| Option | What it is | When to choose |
|---|---|---|
| AWS Managed Microsoft AD | A real Active Directory managed by AWS (multi-AZ) | Need a full AD on AWS, AD-aware applications, a **trust** with on-premises AD, MFA, thousands of users |
| AD Connector | A proxy that forwards requests to on-premises AD, does not cache directory data | Want to use existing on-prem AD for AWS services (WorkSpaces, IAM Identity Center, console) without syncing data to the cloud; needs VPN/Direct Connect |
| Simple AD | Samba-based AD-compatible directory | Small needs, low cost, no trust, no advanced AD features |

Exam points:

- "Trust relationship with on-prem AD" or "run SQL Server/SharePoint that needs AD on AWS" → **AWS Managed Microsoft AD**.
- "Do not want to store directory information in the cloud", "proxy" → **AD Connector**. AD Connector depends on on-prem connectivity; if the link goes down, authentication fails.
- "Low cost, basic AD features, standalone" → **Simple AD**.

~~~decide
# Picking a Directory Service option
Need a trust with on-prem AD or AD-aware apps on AWS => AWS Managed Microsoft AD
Reuse existing on-prem AD without storing directory data in the cloud => AD Connector
Small, low-cost directory with no trust needed => Simple AD
~~~

## Which solution?

| Scenario | Answer |
|---|---|
| Employees use on-prem AD, need console sign-in across multiple accounts | IAM Identity Center + AD Connector or Managed Microsoft AD |
| Mobile app with millions of users, Google/Facebook sign-in | Cognito User Pool |
| Mobile app uploads directly to S3 | Cognito Identity Pool |
| Has a SAML IdP, only one account | SAML federation with an IAM role |
| Protect an application behind an ALB with sign-in | ALB + Cognito User Pool or OIDC IdP |

~~~groups
# Who signs in decides the service
Employees (workforce): *IAM Identity Center, SAML federation, Directory Service
Application customers: *Cognito User Pool, Cognito Identity Pool, Google/Facebook/Apple sign-in
~~~

## Exam tips

- Cognito is the default answer for "users of a mobile/web application" (customer identity). IAM Identity Center is the answer for the workforce (employees).
- Do not create IAM users for end users of an application: it does not scale and violates best practice.
`,
    keywords: [
      { trigger: 'millions of mobile/web users need to sign up and sign in', answer: 'Amazon Cognito User Pool' },
      { trigger: 'application users need temporary credentials to write directly to S3', answer: 'Amazon Cognito Identity Pool' },
      { trigger: 'allow limited guest/unauthenticated access', answer: 'Cognito Identity Pool with an unauthenticated role' },
      { trigger: 'SAML 2.0-compatible enterprise IdP', answer: 'SAML federation (AssumeRoleWithSAML) or IAM Identity Center' },
      { trigger: 'need a trust relationship between AD on AWS and on-premises AD', answer: 'AWS Managed Microsoft AD' },
      { trigger: 'use on-prem AD without storing directory data in the cloud', answer: 'AD Connector' },
      { trigger: 'cheap, simple directory, no trust needed', answer: 'Simple AD' },
      { trigger: 'authenticate users right at the load balancer', answer: 'ALB integrated with Cognito User Pool / OIDC' },
    ],
    traps: [
      'A User Pool only returns JWTs and does not issue AWS credentials; calling S3 directly requires an Identity Pool.',
      'AD Connector does not cache and does not run standalone; losing the on-prem connection means losing authentication.',
      'Simple AD does not support trust with other ADs.',
      'Creating an IAM user for each customer of the application is a wrong design.',
      'Direct web identity federation is still technically correct but exams usually expect Cognito.',
    ],
  },
  {
    slug: 'vpc-networking-security',
    domain: 'secure',
    title: 'VPC Security: Subnets, Security Groups, NACLs and NAT',
    summary:
      'Designing a secure VPC: public/private subnets, IGW, NAT Gateway, route tables, Security Group vs NACL, administrative access without a bastion, and monitoring with Flow Logs.',
    services: ['Amazon VPC', 'NAT Gateway', 'AWS Systems Manager Session Manager', 'VPC Flow Logs', 'AWS Network Firewall'],
    minutes: 12,
    body: `## Basic VPC components

- **VPC**: a private virtual network within a Region. IPv4 CIDR from /16 to /28, secondary CIDRs and IPv6 can be added.
- **Subnet**: lives in **one AZ**. AWS reserves **5 IP addresses** per subnet (the first 4 and the last 1).
- **Internet Gateway (IGW)**: allows the VPC to reach and be reached from the Internet, scales automatically, one IGW per VPC.
- **Route table**: decides where traffic goes. A subnet is **public** if its route table has a 0.0.0.0/0 route to the IGW. A **private** subnet has no route to the IGW.
- **Egress-only Internet Gateway**: lets IPv6 traffic go out to the Internet but not in (the IPv6 equivalent of NAT).
- **Public IPv4 addresses are charged** hourly (including in-use Elastic IPs), so avoid assigning unnecessary public IPs.

~~~groups
# Public subnets route to the IGW, private subnets go out through NAT
[VPC 10.0.0.0/16]
Public subnet: ALB, NAT Gateway, *Route 0.0.0.0/0 to IGW
Private subnet: EC2, *Route 0.0.0.0/0 to NAT Gateway
Database subnet: RDS, No route to the Internet
~~~

## NAT Gateway vs NAT instance

Instances in a private subnet that need to reach the Internet (patching, calling external APIs) but must not accept connections initiated from the Internet → use NAT.

| Criterion | NAT Gateway | NAT instance |
|---|---|---|
| Management | AWS managed | You manage the EC2 instance |
| High availability | Redundant within one AZ; create one NAT GW per AZ to tolerate AZ failure | You build failover yourself with scripts |
| Bandwidth | Scales automatically up to 100 Gbps | Depends on instance type |
| Security Group | Cannot be attached | Can be attached |
| Bastion | Cannot be used as a bastion | Can double as a bastion |
| Special configuration | Placed in a public subnet, has an Elastic IP | Must **disable source/destination check** |

Standard HA architecture: each AZ has a NAT Gateway in a public subnet, and the private subnet route table in the same AZ points to the NAT GW in that AZ (avoids cross-AZ charges and single points of failure).

~~~flow
# One NAT Gateway per AZ, outbound only
EC2 (private subnet AZ a) -> NAT Gateway (public subnet AZ a) -> Internet Gateway -> Internet
EC2 (private subnet AZ b) -> NAT Gateway (public subnet AZ b) -> Internet Gateway -> Internet
~~~

## Security Group vs Network ACL

| Criterion | Security Group | Network ACL |
|---|---|---|
| Applies at | ENI / instance | Subnet |
| State | **Stateful**: responses are automatically allowed | **Stateless**: must also open the return direction (ephemeral ports 1024-65535) |
| Rule type | **Allow only** | **Allow and Deny** |
| Evaluation order | All rules are evaluated | By rule number, first matching rule wins |
| Default | Inbound blocked entirely, outbound allowed entirely | Default NACL allows everything; a newly created custom NACL blocks everything |
| References | Can reference other Security Groups | CIDR only |

Important exam points:

- **Block a specific attacking IP** → add a **Deny rule in the NACL** (Security Groups have no Deny). If ALB/CloudFront is in front, use **AWS WAF**.
- 3-tier architecture: the app SG allows inbound only from the **ALB SG**; the DB SG allows the DB port only from the **app SG**. Referencing an SG is safer than a CIDR because it updates automatically as you scale.
- NACL forgetting to open outbound ephemeral ports → clients do not receive responses.

~~~flow
# NACLs filter at the subnet edge, SGs at each instance; tiers are chained by SG ID
Internet -> NACL (subnet, stateless) -> Security Group (ENI, stateful) -> EC2
ALB SG -[app port only]-> App SG -[DB port only]-> DB SG
~~~

## Administrative access to instances

- **Bastion host**: an EC2 instance in a public subnet, SG opens SSH only from the company IP; from there you SSH into private instances. You must patch it and manage keys yourself.
- **AWS Systems Manager Session Manager**: shell/RDP access **without opening inbound ports, without a bastion, without SSH keys**. Access is controlled by IAM, sessions are logged to S3/CloudWatch Logs, and audited in CloudTrail. The instance needs the SSM Agent, a suitable instance role and a path to the SSM endpoints (via NAT or VPC interface endpoints).
- **EC2 Instance Connect**: pushes a temporary SSH key via API; Instance Connect Endpoint allows SSH into private instances without a public IP.

When the question asks for "most secure, least operational overhead to access private instances" → **Session Manager**.

~~~flow
# Session Manager needs no bastion and no inbound port
Admin -[SSH port 22]-> Bastion (public subnet) -[SSH]-> EC2 (private subnet)
Admin -[IAM, console or CLI]-> Systems Manager -> SSM Agent on EC2 (no inbound port open)
SSM Agent -[outbound HTTPS via NAT or VPC endpoint]-> Systems Manager
~~~

## VPC Flow Logs

- Records IP traffic metadata (source, destination, port, protocol, ACCEPT/REJECT) at the VPC, subnet or ENI level.
- Destinations: CloudWatch Logs, S3, Kinesis Data Firehose.
- Does not record packet contents (payload). To capture packets → **Traffic Mirroring**.
- Used to diagnose SG/NACL blocking traffic, analyzed with Athena; GuardDuty also analyzes Flow Logs.

## AWS Network Firewall

- Managed, stateful, VPC-level firewall: filters by domain (FQDN), IP/port, IPS/IDS using Suricata-compatible rules.
- Deployed in dedicated firewall subnets, with route tables adjusted so traffic flows through the firewall endpoint.
- Centralized architecture: an inspection VPC attached to Transit Gateway filters East-West and egress traffic for multiple VPCs.
- Multi-account policies are managed via Firewall Manager.

~~~flow
# Route tables steer traffic through the firewall endpoint
Internet -> Internet Gateway -[ingress route table]-> Firewall endpoint (firewall subnet) -> ALB (public subnet)
EC2 (private subnet) -> NAT Gateway -> Firewall endpoint -> Internet Gateway
~~~

| Need | Choose |
|---|---|
| Filter HTTP layer 7 (SQLi, XSS) in front of ALB/CloudFront | AWS WAF |
| Block outbound to unapproved domains, IPS for the whole VPC | AWS Network Firewall |
| Block DNS queries to malicious domains | Route 53 Resolver DNS Firewall |
| Block an IP at the subnet level | NACL |
| Allow traffic between application tiers | Security Group |

~~~ladder
# Traffic filtering layers from the outside in
AWS WAF | HTTP layer 7 at CloudFront or ALB | Layer 7
Network Firewall | Stateful, FQDN filtering, IPS for the whole VPC | VPC
NACL | Stateless, Allow and Deny at the subnet edge | Subnet
Security Group | Stateful, Allow only on each ENI | ENI
~~~

## Exam tips

- Private subnet + needs Internet access → NAT Gateway in a **public** subnet.
- Private subnet + only needs S3/DynamoDB → **gateway endpoint** (cheaper than NAT).
- "Stateless", "deny rule", "subnet level" → NACL; "stateful", "instance level" → Security Group.
`,
    keywords: [
      { trigger: 'block a specific IP address at the subnet level', answer: 'Network ACL with a Deny rule' },
      { trigger: 'private instances need to download patches from the Internet, managed, HA', answer: 'NAT Gateway in a public subnet in each AZ' },
      { trigger: 'shell access to private instances without opening port 22, no bastion', answer: 'AWS Systems Manager Session Manager' },
      { trigger: 'only let the app tier receive traffic from the load balancer', answer: 'App Security Group referencing the ALB Security Group' },
      { trigger: 'record REJECTed traffic for investigation', answer: 'VPC Flow Logs' },
      { trigger: 'deep packet inspection, outbound domain filtering, IPS for the VPC', answer: 'AWS Network Firewall' },
      { trigger: 'IPv6 outbound only, do not let the Internet initiate inbound', answer: 'Egress-only Internet Gateway' },
      { trigger: 'NAT instance cannot forward traffic', answer: 'Disable source/destination check' },
      { trigger: 'need to capture packet contents for analysis', answer: 'VPC Traffic Mirroring' },
    ],
    traps: [
      'Security Groups have no Deny rule; to block an IP use a NACL or WAF.',
      'NACLs are stateless: forgetting to open ephemeral ports in the return direction makes connections fail.',
      'A NAT Gateway must be in a public subnet, not a private subnet; and it cannot have a Security Group attached.',
      'A single NAT Gateway shared across all AZs is a single point of failure when its AZ goes down.',
      'VPC Flow Logs do not contain packet payload.',
      'A newly created custom NACL denies all by default, while the default NACL allows all.',
    ],
  },
  {
    slug: 'vpc-connectivity',
    domain: 'secure',
    title: 'VPC Connectivity: Peering, Transit Gateway, Endpoints, VPN and Direct Connect',
    summary:
      'Connecting VPCs to each other, to AWS services privately, and to on-premises data centers: choose the right solution based on complexity, bandwidth, security and cost.',
    services: ['VPC Peering', 'AWS Transit Gateway', 'VPC Endpoints', 'AWS PrivateLink', 'AWS Site-to-Site VPN', 'AWS Client VPN', 'AWS Direct Connect'],
    minutes: 12,
    body: `## VPC Peering

- A private connection between **two** VPCs (same or different account, same or different Region), with traffic over the AWS backbone network.
- **Not transitive**: if A peers with B and B peers with C, A cannot talk to C.
- CIDRs **must not overlap**.
- Route tables must be updated on both sides; SGs can reference the SG of the peered VPC (same Region).
- No fixed fee, you only pay data transfer. Suitable when there are few VPCs.

## AWS Transit Gateway

- **Hub-and-spoke** model: thousands of VPCs and on-prem connections attach to a central gateway, **supports transitive routing**.
- Attachments: VPC, Site-to-Site VPN, Direct Connect (via Direct Connect Gateway and transit VIF), peering with TGWs in other Regions.
- TGW route tables allow network segmentation (e.g., Dev cannot talk to Prod).
- Supports **ECMP** with VPN to aggregate bandwidth across multiple tunnels; supports IP multicast.
- Share a TGW between accounts using **RAM**.

~~~flow
# Peering is not transitive, Transit Gateway is
VPC A -[peering]-> VPC B -[peering]-> VPC C (A cannot reach C)
VPC A -> Transit Gateway -> VPC C (transitive routing)
On-premises -[VPN or DX]-> Transit Gateway -> VPC B
~~~

| Criterion | VPC Peering | Transit Gateway |
|---|---|---|
| Transitive | No | Yes |
| Scale | A few VPCs (mesh of n*(n-1)/2 connections) | Thousands of VPCs |
| Cost | Data transfer only | Hourly per-attachment fee + data processing |
| Management | Complex with many VPCs | Centralized |

## VPC Endpoints

Let resources in a VPC access AWS services **without going through the Internet, IGW or NAT**.

| Criterion | Gateway endpoint | Interface endpoint (PrivateLink) |
|---|---|---|
| Services | **S3 and DynamoDB only** | Most AWS services (including S3), SaaS services, your own services |
| Mechanism | Target in the route table (prefix list) | ENI with a private IP in the subnet |
| Cost | **Free** | Charged per hour + per GB |
| Access from on-prem via VPN/DX | No | Yes |
| Security | Endpoint policy | Endpoint policy + Security Group |

- An endpoint policy limits which buckets can be accessed; a bucket policy can require aws:SourceVpce or aws:SourceVpc to allow access only from the endpoint.
- When the question says "private subnet accesses S3, reduce NAT costs" → **gateway endpoint**.
- Interface endpoints need private DNS enabled so the SDK uses the service's default name.

~~~flow
# Reaching AWS services without the Internet or NAT
EC2 (private subnet) -[route table]-> Gateway endpoint (free) -> S3
EC2 (private subnet) -[private DNS]-> Interface endpoint (ENI, paid) -> SQS
On-premises -[VPN or DX]-> Interface endpoint -> S3
~~~

## AWS PrivateLink

- The technology behind interface endpoints. Lets you **offer your own service** (placed behind a **Network Load Balancer** or Gateway Load Balancer) to other VPCs/accounts/customers **without peering, without exposing the whole VPC**, regardless of overlapping CIDRs.
- One-directional only: the consumer initiates the connection to the service.
- Question: "expose a service to hundreds of customer VPCs, overlapping CIDRs, private" → **PrivateLink**.

~~~flow
# The consumer sees one ENI, not the provider's whole VPC
Customer VPC -> Interface endpoint (ENI) -[PrivateLink]-> Endpoint service -> NLB -> Provider app
~~~

## Site-to-Site VPN

- An encrypted IPsec connection over the Internet between on-prem (**Customer Gateway**) and AWS (**Virtual Private Gateway** attached to a VPC, or **Transit Gateway**).
- Each connection has **2 tunnels** at 2 different endpoints for HA; each tunnel supports up to about **1.25 Gbps**.
- Quick to set up (minutes to hours), cheap, but latency depends on the Internet.
- Static or dynamic (BGP) routing.

~~~flow
# Each VPN connection has two tunnels to two endpoints for HA
Customer Gateway (on-prem) -[IPsec tunnel 1]-> VGW endpoint 1 -> VPC
Customer Gateway (on-prem) -[IPsec tunnel 2]-> VGW endpoint 2 -> VPC
~~~

## AWS VPN CloudHub

- Multiple branch offices (multiple Customer Gateways) connect to the **same Virtual Private Gateway**, and branches talk to each other through AWS in a hub-and-spoke model, using BGP with different ASNs.
- Low cost, encrypted over the Internet.

## AWS Client VPN

- An AWS-managed VPN based on **OpenVPN** for **individual users** (laptops) to access the VPC and on-prem networks.
- Authentication with Active Directory, SAML or certificates (mutual authentication).

## AWS Direct Connect (DX)

- A **dedicated** physical connection from a data center to AWS through a DX location: stable bandwidth, low latency, cheaper data transfer out than the Internet.
- **Dedicated connection**: 1, 10, 100 Gbps (dedicated physical port). **Hosted connection**: through a partner, with more flexible smaller capacities.
- Provisioning usually takes **more than a month** → not the answer if you need connectivity immediately.
- **Virtual interfaces (VIF)**: private VIF (to a VPC via VGW/DX Gateway), public VIF (to AWS public endpoints such as S3), transit VIF (to Transit Gateway).
- **Not encrypted by default**. To encrypt: **Site-to-Site VPN over DX** (via public VIF or private IP VPN) or **MACsec** (layer 2) on supported connections.
- **Direct Connect Gateway**: one DX connection to **VPCs in multiple Regions** (and multiple accounts).

~~~flow
# One DX connection to many VPCs through a Direct Connect Gateway
Data center -> DX location -[private VIF]-> Direct Connect Gateway -> VPC (multiple Regions)
Data center -> DX location -[transit VIF]-> Direct Connect Gateway -> Transit Gateway
~~~

### Resiliency

| Level | Design |
|---|---|
| Cost-effective | Primary DX + **Site-to-Site VPN as backup** |
| High resiliency | 2 DX connections at **2 different DX locations** |
| Maximum resiliency | 2 separate connections on separate devices at **each** of 2 DX locations |

~~~groups
# Maximum resiliency: no single point of failure in devices or locations
DX location 1: *Connection 1 (device A), *Connection 2 (device B)
DX location 2: *Connection 3 (device C), *Connection 4 (device D)
~~~

## Choosing a solution

| Scenario | Answer |
|---|---|
| Need on-prem connectivity today, encrypted | Site-to-Site VPN |
| Large, stable, long-term bandwidth | Direct Connect |
| DX but needs encryption | VPN over DX or MACsec |
| Connect 1 DX to VPCs in multiple Regions | Direct Connect Gateway |
| Hundreds of VPCs + on-prem, transitive | Transit Gateway |
| Remote employees | Client VPN |
| Multiple branches communicating with each other | VPN CloudHub |
`,
    keywords: [
      { trigger: 'connect hundreds of VPCs and on-prem, need transitive routing', answer: 'AWS Transit Gateway' },
      { trigger: 'private instances access S3/DynamoDB, not via Internet, cheapest', answer: 'Gateway VPC endpoint' },
      { trigger: 'offer a service to customer VPCs with overlapping CIDRs', answer: 'AWS PrivateLink (endpoint service behind NLB)' },
      { trigger: 'need an encrypted connection to on-prem quickly', answer: 'AWS Site-to-Site VPN' },
      { trigger: 'large bandwidth, consistent latency, dedicated connection', answer: 'AWS Direct Connect' },
      { trigger: 'Direct Connect but encryption required', answer: 'IPsec VPN over Direct Connect or MACsec' },
      { trigger: 'one DX connection to VPCs in multiple Regions', answer: 'Direct Connect Gateway' },
      { trigger: 'cheap backup for Direct Connect', answer: 'Site-to-Site VPN as a backup path' },
      { trigger: 'multiple branches connect to each other through AWS', answer: 'AWS VPN CloudHub' },
      { trigger: 'remote employees access the VPC', answer: 'AWS Client VPN' },
    ],
    traps: [
      'VPC Peering is not transitive and does not allow overlapping CIDRs.',
      'Gateway endpoints support only S3 and DynamoDB, and cannot be accessed from on-prem.',
      'Direct Connect is not encrypted by default and takes weeks to provision.',
      'PrivateLink requires a Network Load Balancer (or GWLB) on the provider side, not an ALB as the direct target.',
      'Using a NAT Gateway to reach S3 incurs data processing charges; a gateway endpoint is free.',
    ],
  },
  {
    slug: 'data-encryption-kms',
    domain: 'secure',
    title: 'Data Encryption: KMS, CloudHSM and Protecting S3/EBS/RDS',
    summary:
      'Encryption at rest and in transit, KMS key types, envelope encryption, S3 encryption types, built-in EBS/RDS encryption, and S3 protection mechanisms such as Block Public Access and Object Lock.',
    services: ['AWS KMS', 'AWS CloudHSM', 'Amazon S3', 'Amazon EBS', 'Amazon RDS', 'Amazon S3 Glacier'],
    minutes: 12,
    body: `## Encryption at rest and in transit

- **In transit**: TLS/HTTPS. Enforce HTTPS for S3 with a bucket policy that Denies when aws:SecureTransport is false.
- **At rest**: data stored on disk is encrypted with a key, mostly through AWS KMS.

## AWS KMS

| Key type | Who manages it | Rotation | Notes |
|---|---|---|---|
| AWS owned key | AWS, shared across many accounts | AWS handles it | Not visible in your account, free |
| AWS managed key (aws/s3, aws/ebs...) | AWS creates it in your account | Automatic every year | Key policy not editable, cannot be shared cross-account |
| Customer managed key (CMK) | You | Optional, configurable period, or on-demand | Full control of key policy, grants, cross-account, disable, delete (7-30 day wait) |

- The **key policy** is the mandatory resource-based policy of every KMS key. To let another account use a key → add that account to the key policy **and** grant an IAM policy in that account.
- To share encrypted EBS/RDS snapshots cross-account → you must use a **customer managed key** (snapshots encrypted with an AWS managed key cannot be shared).
- KMS keys are **Regional**. **Multi-Region keys**: keys in multiple Regions share the same key ID and key material, and can decrypt in another Region without cross-Region calls (used for DynamoDB global tables, multi-Region client-side encryption). Each key is still managed independently, it is not global.
- API limit: Encrypt directly handles at most **4 KB** of data. There are request-per-second quotas; SSE-KMS with heavy traffic may be throttled → enable **S3 Bucket Keys** to reduce requests to KMS (and reduce cost).
- Every use of a key is logged in **CloudTrail**.

~~~flow
# Cross-account KMS key use needs both sides to allow it
Role in account B -[IAM policy allows kms:Decrypt]-> KMS key in account A -[key policy lists account B]-> Decrypt succeeds
Role in account B -[key policy omits account B]-> KMS key in account A (AccessDenied)
~~~

### Envelope encryption

1. Call GenerateDataKey → KMS returns the data key in plaintext and encrypted form.
2. Use the plaintext data key to encrypt large data on the client side, and delete the plaintext from memory.
3. Store the encrypted data key alongside the data. To decrypt: call Decrypt to get the data key back.

Benefit: large data does not have to be sent to KMS, only the small data key.

~~~flow
# Envelope encryption: only the small data key goes to KMS
App -[GenerateDataKey]-> KMS -[plaintext + encrypted data key]-> App
App -[encrypt with plaintext data key]-> Encrypted data + encrypted data key -> Storage (S3, EBS)
~~~

## AWS CloudHSM

- A dedicated **single-tenant** HSM in your VPC, FIPS 140 Level 3 certified.
- **You fully manage keys and users**; AWS cannot access the keys. Losing credentials means losing the keys.
- Use when the question requires: exclusive control of keys, dedicated HSM, SSL offloading, Oracle TDE, PKCS#11/JCE.
- Can serve as a **custom key store** for KMS to get KMS integration while keeping keys in your own HSM.

~~~ladder
# Who holds the key, from AWS toward you
AWS managed key | AWS creates and rotates it in your account | AWS
Customer managed key | You manage the key policy, KMS holds the HSMs | KMS
KMS custom key store | Key material lives in your CloudHSM cluster | Your HSM
CloudHSM directly | You fully control keys and users, AWS has no access | You
~~~

## S3 encryption

Since January 2023, all new objects are **encrypted by default with SSE-S3**.

| Type | Who manages the key | When to choose |
|---|---|---|
| SSE-S3 | S3 (AES-256) | Default, no key management needed |
| SSE-KMS | KMS key | Need auditing in CloudTrail, control over key usage permissions, separation of duties |
| DSSE-KMS | KMS, two layers of encryption | Compliance with dual-layer encryption requirements |
| SSE-C | Customer supplies the key with each request | Want to keep your own keys but let S3 encrypt; HTTPS required, AWS does not store the key |
| Client-side | Customer encrypts before uploading | Data never reaches AWS in plaintext |

You can enforce an encryption type with a bucket policy (Deny PutObject if the s3:x-amz-server-side-encryption header is not aws:kms). Note: the bucket policy is evaluated before default encryption.

~~~flow
# The bucket policy blocks requests before default encryption applies
PutObject without SSE header aws:kms -[bucket policy Deny]-> Denied
PutObject with SSE header aws:kms -> Bucket policy allows -> Object encrypted with SSE-KMS
~~~

## S3 protection

- **Bucket policy**: resource-based, allows cross-account, enforces HTTPS, restricts by VPC endpoint, IP, aws:PrincipalOrgID.
- **Block Public Access**: 4 settings at the bucket and account level; **enabled by default for new buckets** (since 2023). Overrides any public policy/ACL. ACLs are also disabled by default (Object Ownership = Bucket owner enforced).
- **Versioning + MFA Delete**: protects against accidental deletion; MFA Delete can only be enabled by the root user via CLI/API.
- **S3 Object Lock** (WORM, requires versioning):
  - **Governance mode**: users with special permission (s3:BypassGovernanceRetention) can overwrite/delete.
  - **Compliance mode**: **no one**, including root, can delete/modify until retention expires; it cannot be shortened.
  - **Legal hold**: held indefinitely until removed, independent of the retention period.
- **S3 Glacier Vault Lock**: attach a Vault Lock policy (WORM) to a vault; once the lock is confirmed (within 24 hours of the in-progress state) the policy **cannot be changed**.
- **Presigned URL**: grants temporary GET/PUT access to an object with the permissions of the URL creator; time-limited (up to 7 days when signed with an IAM user, shorter with temporary credentials).

~~~ladder
# Protecting S3 objects from deletion, weakest to strongest
Versioning | Restore an older version after an accidental delete | Basic
MFA Delete | Permanently deleting a version needs root MFA | MFA
Object Lock governance | Users with s3:BypassGovernanceRetention can still delete | Bypass
Object Lock compliance | No one, including root, can delete until expiry | WORM
~~~

## EBS encryption

- Encrypted with KMS: data at rest, data in transit between instance and volume, snapshots, and volumes created from snapshots are all encrypted. Minimal performance impact.
- You can enable **EBS encryption by default** per Region.
- You cannot directly encrypt an existing volume. Approach: **create a snapshot → copy the snapshot with the encrypt option → create a new volume from the encrypted snapshot** → attach it to the instance.

## RDS / Aurora encryption

- Enable encryption **at creation** of the DB. You cannot enable encryption on a running unencrypted DB instance.
- To encrypt an existing DB: **snapshot → copy the snapshot with encryption enabled (choose a KMS key) → restore a new DB from the encrypted snapshot** → switch the application to the new endpoint.
- Read replicas have the same encryption state as the primary.
- In transit: use SSL/TLS; can be enforced with a parameter (e.g., rds.force_ssl).
- RDS and Aurora support IAM database authentication for MySQL/PostgreSQL.

~~~flow
# Encrypting an existing unencrypted EBS volume or RDS DB
Snapshot -[copy with encryption and a KMS key]-> Encrypted snapshot -[create volume or restore]-> New volume / DB -> Switch the application over
~~~

## Exam tips

- "Audit who used the key", "separation of duties" → SSE-KMS with a customer managed key.
- "Company must manage its own keys in dedicated hardware" → CloudHSM.
- "Prevent deletion for 7 years, even by root" → Object Lock compliance mode.
- "Share encrypted snapshot with another account" → re-encrypt with a customer managed key and share the key.
`,
    keywords: [
      { trigger: 'audit key usage, control who can decrypt', answer: 'SSE-KMS with a customer managed key + CloudTrail' },
      { trigger: 'single-tenant HSM, customer has full control of keys', answer: 'AWS CloudHSM' },
      { trigger: 'no one, including root, can delete an object during the retention period', answer: 'S3 Object Lock compliance mode' },
      { trigger: 'encrypt a running unencrypted RDS DB', answer: 'Snapshot → copy snapshot with encryption → restore a new DB' },
      { trigger: 'share an encrypted snapshot with another account', answer: 'Use a customer managed KMS key and grant access in the key policy' },
      { trigger: 'SSE-KMS throttling or high KMS cost', answer: 'Enable S3 Bucket Keys' },
      { trigger: 'decrypt the same data in multiple Regions with the same key', answer: 'KMS multi-Region keys' },
      { trigger: 'temporary user downloads/uploads a private object', answer: 'S3 presigned URL' },
      { trigger: 'customer supplies the key but lets S3 do the encryption', answer: 'SSE-C (HTTPS required)' },
      { trigger: 'immutable WORM policy for an archive', answer: 'S3 Glacier Vault Lock' },
    ],
    traps: [
      'You cannot directly enable encryption on an existing RDS instance or EBS volume; it must go through a snapshot copy.',
      'AWS managed keys cannot be shared cross-account; snapshots encrypted with them cannot be shared.',
      'Governance mode lets users with bypass permission delete objects; only compliance mode blocks absolutely.',
      'S3 is already encrypted by default with SSE-S3; if the question requires key auditing or key control, SSE-S3 is not enough.',
      'KMS keys are Regional; a multi-Region key is still a set of separate keys with the same key material, not a global key.',
      'SSE-C does not work over HTTP and AWS does not store the key; losing the key means losing the data.',
    ],
  },
  {
    slug: 'secrets-certificates',
    domain: 'secure',
    title: 'Secrets, Parameter Store, ACM and CloudFront Content Protection',
    summary:
      'Storing and rotating secrets securely, managing TLS certificates with ACM, protecting S3 origins with CloudFront OAC, and delivering private content with signed URLs/cookies.',
    services: ['AWS Secrets Manager', 'AWS Systems Manager Parameter Store', 'AWS Certificate Manager', 'Amazon CloudFront', 'Elastic Load Balancing'],
    minutes: 9,
    body: `## AWS Secrets Manager

- Stores secrets (DB passwords, API keys, OAuth tokens), encrypted with KMS.
- **Automatic rotation** on a schedule using Lambda; built-in integration for Amazon RDS, Aurora, Redshift, DocumentDB (AWS provides sample rotation Lambda functions).
- RDS/Aurora can have **RDS manage the master password in Secrets Manager** automatically.
- **Replicate secrets** to another Region for DR and multi-Region applications.
- Resource-based policies allow cross-account access.
- Billed per secret per month and per API call.

## SSM Parameter Store

- Stores configuration and secrets hierarchically (e.g., /prod/app/db-url).
- Types: String, StringList, **SecureString** (encrypted with KMS).
- **Standard tier**: free, values up to 4 KB. **Advanced tier**: up to 8 KB, supports parameter policies (e.g., expiration, notifications), paid.
- **No built-in automatic rotation**; you must write your own Lambda + EventBridge.
- Can reference a Secrets Manager secret through Parameter Store.

~~~groups
# Parameter Store keeps values in a path tree
/prod/app: db-url (String), *db-password (SecureString)
/dev/app: db-url (String), *db-password (SecureString)
IAM permissions: ssm:GetParametersByPath on /prod/app, *kms:Decrypt for SecureString
~~~

| Criterion | Secrets Manager | Parameter Store |
|---|---|---|
| Automatic rotation | Yes, integrated with RDS/Aurora/Redshift | Not built in |
| Cost | Pay per secret + API call | Standard is free |
| Cross-Region replication | Yes | No |
| Size | Up to 64 KB | 4 KB (standard) / 8 KB (advanced) |
| Exam use case | DB passwords that need rotation | Configuration, simple secrets, low cost |

Question: "rotate database credentials automatically with least operational overhead" → **Secrets Manager**. "Store configuration values, low cost" → **Parameter Store**.

~~~flow
# Secrets Manager rotates the DB password automatically
Rotation schedule -> Lambda (rotation function) -[sets new password]-> RDS
Lambda (rotation function) -[stores new version]-> Secrets Manager
App -[GetSecretValue]-> Secrets Manager
~~~

## AWS Certificate Manager (ACM)

- Issues **free public TLS certificates** for integrated services, with **automatic renewal** (with DNS domain validation, renewal is fully automatic).
- Integrates with: **Elastic Load Balancing (ALB, NLB)**, **CloudFront**, **API Gateway**, App Runner, Elastic Beanstalk...
- Validation: DNS (recommended, uses a CNAME, supports auto-renewal) or email.
- You can **import** third-party certificates, but **ACM does not auto-renew imported certificates** → use EventBridge/AWS Config to alert before expiry.
- Certificates used for **CloudFront must be in us-east-1**. Certificates for ALB/regional API Gateway must be in the same Region as the resource.
- In exam context, ACM public certificates are attached to integrated services rather than manually installed on EC2. AWS Private CA is used to issue internal private certificates.

~~~flow
# ACM certificates must live in the Region of the service that uses them
Route 53 (CNAME record) -[DNS validation]-> ACM -[auto-renewal]-> Public certificate
ACM us-east-1 -> CloudFront (all edge locations)
ACM eu-west-1 -> ALB in eu-west-1
~~~

### TLS on ALB and CloudFront

- **TLS termination at the ALB**: the ALB decrypts, offloading CPU from EC2; uses SNI to serve multiple certificates on one listener.
- For end-to-end encryption: the ALB re-encrypts to targets over HTTPS (targets use their own certificates), or use **NLB TCP passthrough** so targets terminate TLS themselves.
- CloudFront: Viewer Protocol Policy = Redirect HTTP to HTTPS or HTTPS only; Origin Protocol Policy to encrypt to the origin. **Field-level encryption** encrypts sensitive fields (card numbers) from the edge.

~~~flow
# ACM certificates and where TLS terminates
Users -[HTTPS, ACM cert in us-east-1]-> CloudFront -[HTTPS]-> ALB (ACM cert in same Region) -[HTTP or HTTPS re-encrypt]-> EC2
Users -[TLS]-> NLB (TCP passthrough) -[TLS]-> EC2 (terminates TLS itself)
~~~

## CloudFront Origin Access Control (OAC)

- Goal: **let only CloudFront read the S3 bucket**, users cannot access the S3 URL directly.
- **OAC replaces OAI** (legacy). OAC supports SSE-KMS, all Regions, PUT/DELETE methods, and signs requests with SigV4.
- Configuration: keep the bucket private (Block Public Access on), bucket policy allows the cloudfront.amazonaws.com principal with Condition AWS:SourceArn set to the distribution ARN.
- For ALB/EC2 origins (custom origin): there is no S3-style OAC; use a **secret custom header** added by CloudFront and verified by the ALB, combined with an SG that only allows the **CloudFront managed prefix list**. CloudFront also supports VPC origins for ALB/EC2 in private subnets.

~~~flow
# Only CloudFront can read the bucket
Users -> CloudFront -[OAC, SigV4 signed]-> S3 (private, Block Public Access on)
Users -[direct S3 URL]-> S3 (denied by bucket policy)
~~~

## Signed URL vs Signed Cookie

| Criterion | Signed URL | Signed Cookie |
|---|---|---|
| Scope | One file | Multiple files (a whole directory, an entire premium site) |
| URL change | Yes (parameters added) | No |
| Example | Download link for one installer | Paying users watch all videos |

- Signed with a key pair; best practice is to use **trusted key groups** (no root user needed, unlike the old CloudFront key pair).
- Policy: canned (simple, expiration time) or custom (adds IP, start time, wildcards).

### CloudFront signed URL vs S3 presigned URL

| CloudFront signed URL | S3 presigned URL |
|---|---|
| Access via edge, cached | Direct access to S3 |
| Origin can be S3 or custom | S3 only |
| Restrict by IP, time (custom policy) | Uses the permissions of the IAM principal that signed the URL |

~~~decide
# Temporary access to private content
One file through CloudFront => CloudFront signed URL
Many files or a whole premium area through CloudFront => CloudFront signed cookies
Download or upload one object directly with S3 => S3 presigned URL
Restrict by IP or start time => CloudFront signed URL/cookie with a custom policy
~~~

## Exam tips

- "Hard-coded DB password in code" → Secrets Manager + rotation.
- "Users bypass CloudFront and hit S3 directly" → OAC + bucket policy.
- "Certificate for CloudFront" → ACM in us-east-1.
- "Premium members access many files" → signed cookies.
`,
    keywords: [
      { trigger: 'automatically rotate RDS password with least operational overhead', answer: 'AWS Secrets Manager with rotation' },
      { trigger: 'store hierarchical configuration, low cost, can be encrypted', answer: 'SSM Parameter Store (SecureString)' },
      { trigger: 'free, auto-renewing TLS certificate for ALB/CloudFront', answer: 'AWS Certificate Manager' },
      { trigger: 'ACM certificate for CloudFront', answer: 'Must be created/imported in us-east-1' },
      { trigger: 'let only CloudFront access the S3 bucket', answer: 'Origin Access Control (OAC) + bucket policy' },
      { trigger: 'paying users access many private files via CloudFront', answer: 'CloudFront signed cookies' },
      { trigger: 'allow time-limited download of one private file via CloudFront', answer: 'CloudFront signed URL' },
      { trigger: 'imported certificate about to expire', answer: 'ACM does not auto-renew imported certs; alert with EventBridge/AWS Config' },
    ],
    traps: [
      'Parameter Store has no built-in automatic rotation like Secrets Manager.',
      'OAI is the legacy mechanism; newer exam questions choose OAC, especially when the bucket uses SSE-KMS.',
      'An ACM certificate in a Region other than us-east-1 cannot be selected for CloudFront.',
      'ACM does not auto-renew certificates imported from outside.',
      'Signed URLs for many files at once are inconvenient; many files → signed cookies.',
    ],
  },
  {
    slug: 'threat-detection-waf-shield',
    domain: 'secure',
    title: 'Threat Detection: WAF, Shield, GuardDuty and Monitoring',
    summary:
      'The protection and detection toolkit: WAF, Shield, Firewall Manager, GuardDuty, Inspector, Macie, Security Hub, Detective, plus CloudTrail, AWS Config, CloudWatch and EventBridge for automated remediation.',
    services: ['AWS WAF', 'AWS Shield', 'AWS Firewall Manager', 'Amazon GuardDuty', 'Amazon Inspector', 'Amazon Macie', 'AWS Security Hub', 'Amazon Detective', 'AWS CloudTrail', 'AWS Config', 'Amazon CloudWatch', 'Amazon EventBridge'],
    minutes: 12,
    body: `## AWS WAF

- **Layer 7** Web Application Firewall (HTTP/HTTPS).
- Attaches to: **CloudFront, Application Load Balancer, API Gateway (REST), AppSync, Cognito User Pool**, App Runner, Verified Access. **It cannot attach directly to an NLB or EC2**.
- A Web ACL contains rules:
  - IP set (allow/block IPs), **geo match** (block countries).
  - **Rate-based rule**: blocks IPs sending too many requests in a time window (protects against HTTP floods, brute force).
  - Blocks **SQL injection, cross-site scripting (XSS)**, inspects headers, body, size.
  - **AWS Managed Rules** and rules from AWS Marketplace; Bot Control, Account Takeover Prevention.
- Logs to CloudWatch Logs, S3 or Firehose.

~~~flow
# WAF filters layer 7 at the edge or in front of the ALB; Shield stops layer 3/4 DDoS
Users -> CloudFront (WAF, Shield) -> ALB (WAF) -> EC2 (ASG)
Users -> API Gateway (WAF) -> Lambda
~~~

## AWS Shield

| Criterion | Shield Standard | Shield Advanced |
|---|---|---|
| Cost | Free, automatic for every account | About 3,000 USD/month per organization + data fees |
| Protection | Common layer 3/4 DDoS (SYN flood, UDP reflection) | More sophisticated DDoS for EC2, ELB, CloudFront, Global Accelerator, Route 53 |
| Support | None | 24/7 **Shield Response Team (SRT)** |
| Cost protection | None | **Cost protection**: refunds scaling charges caused by DDoS |
| Other | | Automatic layer 7 DDoS detection and mitigation with WAF, WAF fees for protected resources included |

Question: "protect against DDoS, need 24/7 DDoS experts and cost protection" → **Shield Advanced**.

## AWS Firewall Manager

- **Centrally** manages security policies across multiple accounts in **AWS Organizations** (requires Organizations and AWS Config).
- Manages: WAF rules, Shield Advanced, Security Groups, Network Firewall, Route 53 Resolver DNS Firewall, third-party firewall policies.
- Automatically applies policies to **newly created** resources (e.g., every new ALB gets WAF attached).

~~~flow
# Firewall Manager applies policies to every account, new resources included
Security admin account -[WAF policy]-> Firewall Manager -[attaches web ACL]-> New ALB in account A
Firewall Manager -[attaches web ACL]-> CloudFront in account B
~~~

## Detection and assessment services

| Service | What it does | Exam keywords |
|---|---|---|
| **GuardDuty** | Detects threats using ML/threat intel from CloudTrail management events, VPC Flow Logs, DNS logs; optional S3, EKS, RDS login, Lambda, malware protection | "Detect malicious activity, cryptocurrency mining, leaked credentials, unusual API calls" |
| **Inspector** | Automatically scans for vulnerabilities (CVEs) and network reachability for EC2, container images in ECR, Lambda | "Vulnerability scanning", "software vulnerabilities", "CVE" |
| **Macie** | Uses ML to discover **sensitive data (PII)** in S3 | "Find PII / sensitive data in S3" |
| **Security Hub** | Aggregates findings from GuardDuty, Inspector, Macie, Config...; checks against standards (CIS, AWS Foundational Security Best Practices); multi-account | "Single dashboard / centralized view of security findings" |
| **Detective** | Investigates root cause, visualizes relationships from logs | "Investigate root cause of findings" |
| **Trusted Advisor** | Best practice recommendations (cost, security, performance...) | "Check for open security groups, MFA on root" |

GuardDuty is enabled with a single action, **without needing to enable Flow Logs or a separate CloudTrail trail** (it reads from the data sources independently).

~~~groups
# The security toolkit by role
Block up front: WAF, Shield, Firewall Manager, Network Firewall
Detect: GuardDuty, Inspector, Macie
Aggregate and investigate: *Security Hub, Detective
Record and comply: CloudTrail, AWS Config, CloudWatch
~~~

## Logging and compliance

### AWS CloudTrail

- Records **API calls** (who, when, from where, what). 90-day event history of management events is available by default.
- Create a **trail** to store logs long-term in S3 (and CloudWatch Logs); an **organization trail** records for every account.
- **Data events** (S3 object-level, Lambda invoke) are not recorded by default and must be enabled (charged).
- **Log file integrity validation** proves logs were not tampered with. Add protection with a dedicated bucket, Object Lock, and an SCP that blocks StopLogging.
- CloudTrail Insights detects unusual API activity; CloudTrail Lake allows SQL queries.

~~~groups
# Types of events CloudTrail records
Management events: *On by default, 90-day event history, Creating or deleting resources
Data events: Off by default, Extra cost, S3 object-level and Lambda invoke
Insights events: Unusual API activity, Enabled separately at extra cost
~~~

### AWS Config

- Records **resource configuration and change history**, evaluates **compliance** with Config rules (managed or custom Lambda).
- Examples: is an S3 bucket public, is EBS encrypted, does an SG open 22 to 0.0.0.0/0.
- Automatic **remediation** with SSM Automation documents.
- Conformance packs; multi-account/Region aggregator.
- Config is **detective** (detects after the fact), it does not block actions beforehand. To block beforehand → SCP/IAM.

| Question | Service |
|---|---|
| Who deleted this security group? | CloudTrail |
| What did this security group look like last week? Is it compliant? | AWS Config |
| Alert when CPU exceeds 80% | CloudWatch alarm |

### CloudWatch

- **CloudWatch Logs**: centralizes application logs, VPC Flow Logs, CloudTrail; **metric filters** create metrics from logs (e.g., count failed console sign-ins or root logins) → **alarm** → SNS.
- Logs Insights for queries; encrypt log groups with KMS; set retention.
- CloudWatch agent to collect logs and memory/disk metrics from EC2.

~~~flow
# Alert when the root user signs in
CloudTrail (trail) -> CloudWatch Logs -[root login metric filter]-> Metric -[alarm when above 0]-> SNS (email to security team)
~~~

### EventBridge for automated remediation

- Captures events from GuardDuty findings, Config compliance changes, CloudTrail API calls, Security Hub, ACM expiring certificates...
- Targets: **Lambda**, SSM Automation, SNS, Step Functions for automatic handling (isolate an instance, revoke a key, close a port).
- Classic pattern: GuardDuty finding → EventBridge rule → Lambda switches the compromised EC2 instance's Security Group to an isolation SG + SNS notification.

~~~flow
# Automatically isolating a compromised EC2 instance
GuardDuty (finding) -> EventBridge (rule) -> Lambda -[switch to isolation SG]-> EC2
EventBridge (rule) -> SNS -> Security team
~~~

## Exam tips

- SQL injection/XSS → WAF; DDoS L3/L4 → Shield; threats inside the account → GuardDuty; software vulnerabilities → Inspector; PII in S3 → Macie.
- Apply standard WAF/SG to every account including new resources → Firewall Manager.
- "Automatically remediate" → EventBridge + Lambda or Config rule + SSM Automation.
`,
    keywords: [
      { trigger: 'block SQL injection, XSS in front of ALB/CloudFront', answer: 'AWS WAF' },
      { trigger: 'block IPs sending too many requests (HTTP flood)', answer: 'WAF rate-based rule' },
      { trigger: 'DDoS, need a 24/7 response team and cost protection', answer: 'AWS Shield Advanced' },
      { trigger: 'apply WAF rules to every account and new resource in the organization', answer: 'AWS Firewall Manager' },
      { trigger: 'detect crypto mining, unusual API calls, leaked credentials', answer: 'Amazon GuardDuty' },
      { trigger: 'scan for software vulnerabilities on EC2, ECR, Lambda', answer: 'Amazon Inspector' },
      { trigger: 'find PII in S3', answer: 'Amazon Macie' },
      { trigger: 'centralized multi-account dashboard of security findings', answer: 'AWS Security Hub' },
      { trigger: 'who made an API call', answer: 'AWS CloudTrail' },
      { trigger: 'evaluate resource configuration compliance over time', answer: 'AWS Config rules' },
    ],
    traps: [
      'WAF cannot be attached to a Network Load Balancer.',
      'Shield Standard is already free and automatic; choose Advanced only when the question needs SRT, cost protection or enhanced protection.',
      'AWS Config detects and remediates after the fact, it cannot block an action before it happens.',
      'CloudTrail does not record data events (S3 object-level) by default.',
      'Inspector scans for software vulnerabilities, GuardDuty detects threatening behavior; do not mix up the two services.',
      'Firewall Manager requires AWS Organizations.',
    ],
  },
];
