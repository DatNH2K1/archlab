import type { Question } from '@/content/types';

export const secureQuestionsEn: Question[] = [
  // iam-fundamentals
  {
    id: 'sec-001',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'An application running on Amazon EC2 instances needs to read objects from an Amazon S3 bucket. A developer has stored an IAM user\'s access key and secret key in a configuration file on each instance. A security review flags this as a risk. Which solution is the MOST secure?',
    options: [
      'Encrypt the configuration file with AWS KMS and decrypt it when the application starts.',
      'Create an IAM role with read access to the bucket and attach it to the instances through an instance profile.',
      'Store the access key in AWS Systems Manager Parameter Store as a SecureString and rotate it every 90 days.',
      'Make the bucket public but restrict access with a bucket policy that allows only the instances\' public IP addresses.',
    ],
    answer: [1],
    explanation:
      'An IAM role attached through an instance profile provides automatically rotated temporary credentials, so no long-term credentials are stored on the machine. Encrypting the config file still means storing a long-term access key. Storing the access key in Parameter Store is better than a file but is still a long-term credential, less secure than a role. Making the bucket public based on IP is a flawed design and easily exposes data.',
  },
  {
    id: 'sec-002',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company wants developers to create IAM roles for their AWS Lambda functions without a central team approving each role. The security team must ensure that developers can never grant a role more permissions than a predefined set, preventing privilege escalation. What should a solutions architect recommend?',
    options: [
      'Attach the AdministratorAccess policy to developers and review the roles weekly with IAM Access Analyzer.',
      'Use a service control policy to deny iam:CreateRole for all developers.',
      'Create an IAM group for developers with an inline policy listing every allowed Lambda action.',
      'Allow developers to create roles only if a specific permissions boundary is attached, using the iam:PermissionsBoundary condition key.',
    ],
    answer: [3],
    explanation:
      'A permission boundary sets the maximum permissions for a role; the iam:PermissionsBoundary condition forces developers to attach the boundary when creating roles, so privilege escalation is impossible. AdministratorAccess with periodic review only detects after the fact, it does not prevent. An SCP denying iam:CreateRole stops developers from creating roles at all, contrary to the requirement. An inline policy on the group only controls the developers\' own permissions, not the permissions of the roles they create.',
  },
  {
    id: 'sec-003',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'An IAM user belongs to a group whose policy allows s3:* on all resources. A second managed policy attached directly to the user explicitly denies s3:DeleteObject on the bucket prod-data. What happens when the user tries to delete an object in prod-data?',
    options: [
      'The request is denied because an explicit deny overrides any allow.',
      'The request is allowed because the group policy grants s3:* on all resources.',
      'The request is allowed because policies attached to groups take precedence over policies attached to users.',
      'The request is denied only if the bucket policy also denies the action.',
    ],
    answer: [0],
    explanation:
      'In IAM policy evaluation logic, an explicit Deny always beats any Allow, regardless of which policy contains the Deny. There is no rule that groups take precedence over users. The bucket policy does not need a Deny because an explicit Deny in the identity policy is enough to deny the request.',
  },
  {
    id: 'sec-004',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A new AWS account was created for a startup. The founder has been using the root user with an access key for daily CLI work. Which set of actions follows AWS best practices for securing the root user?',
    options: [
      'Rotate the root access key every 30 days and store it in AWS Secrets Manager.',
      'Rename the root user and remove its console password.',
      'Enable MFA on the root user, delete the root access keys, and create an administrative identity for daily tasks.',
      'Attach a permissions boundary to the root user that limits it to read-only actions.',
    ],
    answer: [2],
    explanation:
      'Best practice: enable MFA for root, delete root access keys and use a separate administrative identity (IAM Identity Center or IAM) for daily work. Rotating root access keys still keeps a high-risk credential. The root user cannot be renamed. A permission boundary cannot be attached to the root user.',
  },
  {
    id: 'sec-005',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A security team wants to identify which AWS services each IAM role in an account has actually used in the last 90 days so they can remove unused permissions. Which feature provides this information with the LEAST effort?',
    options: [
      'AWS Config resource timeline for each IAM role.',
      'IAM last accessed information (Access Advisor) for each role.',
      'Amazon GuardDuty findings filtered by IAM role.',
      'Amazon Inspector reports for IAM roles.',
    ],
    answer: [1],
    explanation:
      'IAM Access Advisor (last accessed information) shows which services a role last used and when, which supports cleaning up excess permissions. AWS Config records configuration changes of the role, not permission usage. GuardDuty detects threats, it does not list services used. Inspector scans for software vulnerabilities, it does not analyze IAM.',
  },
  {
    id: 'sec-006',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company requires that IAM users can stop or terminate production EC2 instances only when they have authenticated with multi-factor authentication. How should a solutions architect enforce this requirement?',
    options: [
      'Add a condition using aws:MultiFactorAuthPresent to the IAM policy that allows ec2:StopInstances and ec2:TerminateInstances.',
      'Enable termination protection on all production instances.',
      'Configure an AWS Config rule that checks whether MFA is enabled for each IAM user.',
      'Require MFA in the account password policy.',
    ],
    answer: [0],
    explanation:
      'The aws:MultiFactorAuthPresent condition in a policy allows the action only when the session was authenticated with MFA. Termination protection is unrelated to MFA and does not block stop. A Config rule only checks whether the user has MFA enabled, it does not enforce it at API call time. The password policy has no option to require MFA.',
  },
  {
    id: 'sec-007',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company runs containers on Amazon ECS with the AWS Fargate launch type. The application inside one task must write items to an Amazon DynamoDB table. Which configuration grants the required permissions following least privilege?',
    options: [
      'Add DynamoDB write permissions to the task execution role.',
      'Attach a DynamoDB write policy to the IAM role of the ECS cluster\'s container instances.',
      'Pass an IAM user\'s access key to the container as environment variables in the task definition.',
      'Create a task role with a policy that allows writes to the specific table and reference it in the task definition.',
    ],
    answer: [3],
    explanation:
      'A task role grants permissions to code running in the container; a policy limited to the specific table to be written is least privilege. The task execution role is used by ECS to pull images and write logs, not for the application. Fargate has no container instances you manage, and attaching permissions at the instance level would give every task those permissions. Passing an access key through environment variables is a long-term credential and is not secure.',
  },
  {
    id: 'sec-008',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company is auditing its AWS account. Which TWO actions improve security according to IAM best practices? (Choose TWO.)',
    options: [
      'Use IAM roles and temporary credentials for workloads instead of long-term access keys.',
      'Share one IAM user among team members to reduce the number of credentials to manage.',
      'Grant AWS managed full-access policies to all developers to reduce support tickets.',
      'Use IAM Access Analyzer to identify resources shared with external principals.',
      'Create access keys for the root user so that automation can recover from IAM misconfigurations.',
    ],
    answer: [0, 3],
    explanation:
      'Using roles with temporary credentials and using IAM Access Analyzer to detect resources shared externally are best practices. Sharing one IAM user removes the ability to trace individual people. Granting full access to every developer violates least privilege. Creating access keys for root is something AWS strongly advises against.',
  },
  // iam-organizations-scp
  {
    id: 'sec-009',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company uses AWS Organizations with dozens of member accounts. The compliance team requires that no user in any member account, including the root user, can disable AWS CloudTrail or delete trails. Which solution meets this requirement?',
    options: [
      'Attach an IAM policy that denies cloudtrail:StopLogging to every IAM user in each account.',
      'Enable AWS Config in every account with a rule that detects when CloudTrail is disabled.',
      'Create a service control policy that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail and attach it to the organization root.',
      'Use IAM Identity Center permission sets that do not include CloudTrail permissions.',
    ],
    answer: [2],
    explanation:
      'An SCP attached at the organization root limits the permissions of every principal in member accounts, including the root user, so it blocks this action. An IAM policy does not apply to the root user and new users are easily missed. AWS Config only detects after the event. Permission sets apply only to Identity Center users and do not affect root or other IAM users.',
  },
  {
    id: 'sec-010',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has an Amazon S3 bucket that stores shared reports. The bucket must be accessible to IAM principals from every account in the company\'s organization in AWS Organizations, including accounts added in the future, and to no one else. Which solution requires the LEAST ongoing maintenance?',
    options: [
      'List every account ID in the bucket policy Principal element and update it when accounts are added.',
      'Add a bucket policy statement that allows access when the aws:PrincipalOrgID condition matches the organization ID.',
      'Create an IAM role in the bucket account and require every account to assume it.',
      'Use AWS Resource Access Manager to share the bucket with the organization.',
    ],
    answer: [1],
    explanation:
      'The aws:PrincipalOrgID condition in a bucket policy automatically covers all current and future accounts of the organization, with no updates needed. Listing account IDs requires editing the policy every time an account is added. A cross-account role works but every application must assume the role, which is more complex to operate. RAM does not support sharing S3 buckets.',
  },
  {
    id: 'sec-011',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company wants to quickly set up a new multi-account AWS environment that follows AWS best practices, with centralized logging, an audit account, single sign-on, and preventive and detective rules applied automatically to new accounts. Which service should the company use?',
    options: [
      'AWS Organizations with manually created SCPs.',
      'AWS Config conformance packs.',
      'AWS Security Hub.',
      'AWS Control Tower.',
    ],
    answer: [3],
    explanation:
      'Control Tower builds a best-practice landing zone: creates the Log Archive and Audit accounts, configures IAM Identity Center, and applies preventive (SCP) and detective (Config) controls to new accounts through Account Factory. Organizations with manual SCPs takes a lot of effort. Conformance packs are just sets of Config rules. Security Hub aggregates findings, it does not build multi-account environments.',
  },
  {
    id: 'sec-012',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A software vendor needs to access resources in a customer\'s AWS account to provide a monitoring service. The customer wants to avoid sharing long-term credentials and to protect against the confused deputy problem. What should the customer do?',
    options: [
      'Create an IAM role that trusts the vendor\'s AWS account and require a unique external ID in the trust policy condition.',
      'Create an IAM user for the vendor and share its access keys through an encrypted email.',
      'Add the vendor\'s account to the customer\'s organization in AWS Organizations.',
      'Create a resource-based policy on every resource that allows the vendor\'s root user.',
    ],
    answer: [0],
    explanation:
      'A cross-account role with an External ID in the trust policy is the AWS-recommended approach for third parties, using temporary credentials and preventing the confused deputy problem. Sharing an IAM user access key is a long-term credential. Bringing the vendor account into your organization is inappropriate and does not grant access. Not every resource supports resource-based policies, and this approach is hard to manage.',
  },
  {
    id: 'sec-013',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company wants to restrict all member accounts in its organization so that resources can be created only in the eu-west-1 and eu-central-1 Regions. Global services such as IAM must continue to work. Which approach should a solutions architect use?',
    options: [
      'Disable all other Regions in the account settings of each member account.',
      'Create an AWS Config rule that deletes resources created in other Regions.',
      'Attach an SCP that denies actions when aws:RequestedRegion is not one of the approved Regions, with exceptions for global services.',
      'Use IAM permission boundaries on every role that list the allowed Regions.',
    ],
    answer: [2],
    explanation:
      'An SCP with the aws:RequestedRegion condition (with NotAction exceptions for global services such as IAM, CloudFront, Route 53) is the standard way to restrict Regions across the organization. Default Regions cannot be disabled through account settings. A Config rule that deletes resources only remediates after the fact and is risky. A permission boundary must be attached to each role and does not apply to the root user.',
  },
  {
    id: 'sec-014',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has 40 AWS accounts in AWS Organizations. Employees authenticate with the corporate Microsoft Entra ID identity provider. The company wants employees to sign in once and access the accounts they are assigned to with role-based permissions. Which solution requires the LEAST operational overhead?',
    options: [
      'Create IAM users in each account and synchronize passwords with a script.',
      'Enable IAM Identity Center, connect Microsoft Entra ID as the external identity provider with SCIM provisioning, and assign permission sets to groups.',
      'Configure a separate SAML identity provider and IAM roles in each of the 40 accounts.',
      'Deploy AWS Managed Microsoft AD and create a forest trust with each account.',
    ],
    answer: [1],
    explanation:
      'IAM Identity Center connects an external IdP through SAML 2.0 and SCIM and assigns permission sets to groups across multiple accounts from one place, with the least operational effort. Creating IAM users in each account is both laborious and less secure. Configuring SAML separately for 40 accounts works but is operationally heavy. Managed Microsoft AD does not create a trust with AWS accounts; trusts are between AD domains.',
  },
  {
    id: 'sec-015',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has a central networking account that owns a VPC. Application teams in other accounts in the same organization need to launch EC2 instances into subnets of this VPC, while the networking team keeps control of routing and network ACLs. Which solution meets these requirements?',
    options: [
      'Share the subnets with the application accounts by using AWS Resource Access Manager.',
      'Create VPC peering connections from each application account to the central VPC.',
      'Create cross-account IAM roles so that application teams launch instances directly in the networking account.',
      'Use AWS Transit Gateway to attach application VPCs to the central VPC.',
    ],
    answer: [0],
    explanation:
      'VPC sharing through RAM lets other accounts create resources in a shared subnet, while the VPC-owning account keeps control of route tables and NACLs. Peering and Transit Gateway require each account to have its own VPC and do not satisfy launching into a central subnet. Launching directly in the networking account loses the billing boundary and the teams\' ownership of their resources.',
  },
  // identity-federation-cognito
  {
    id: 'sec-016',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company is building a mobile application. Users must be able to sign up and sign in with an email address or with their Google accounts. After signing in, the app must upload photos directly to a user-specific prefix in an Amazon S3 bucket. Which TWO components should a solutions architect use? (Choose TWO.)',
    options: [
      'IAM users created for each application user.',
      'An Amazon Cognito user pool configured with Google as a federated identity provider.',
      'AWS IAM Identity Center with Google as the identity source.',
      'An AWS Directory Service Simple AD directory.',
      'An Amazon Cognito identity pool that exchanges tokens for temporary AWS credentials scoped to the user\'s prefix.',
    ],
    answer: [1, 4],
    explanation:
      'A Cognito User Pool handles sign-up/sign-in with email and Google; a Cognito Identity Pool exchanges tokens for temporary credentials, using policy variables to limit each user to their own S3 prefix. Creating IAM users for end users does not scale. IAM Identity Center is for employees (workforce), not for customers of a mobile app. Simple AD is a directory for enterprises and does not serve mobile app sign-in.',
  },
  {
    id: 'sec-017',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company has an on-premises Active Directory. It wants employees to use their existing AD credentials to sign in to Amazon WorkSpaces. Company policy states that no directory data may be stored or cached in the cloud. Which solution meets these requirements?',
    options: [
      'Deploy AWS Managed Microsoft AD and create a two-way trust with the on-premises domain.',
      'Deploy Simple AD and import users from the on-premises directory.',
      'Create a Cognito user pool and migrate users with a Lambda trigger.',
      'Deploy AD Connector and connect it to the on-premises Active Directory over a VPN or AWS Direct Connect.',
    ],
    answer: [3],
    explanation:
      'AD Connector is a proxy that forwards authentication requests to on-prem AD and does not store or cache directory data in the cloud. Managed Microsoft AD is a directory running on AWS and stores directory data in the cloud. Simple AD also stores data on AWS and does not synchronize with on-prem AD. Cognito is not used for WorkSpaces sign-in with AD, and moving users to the cloud violates policy.',
  },
  {
    id: 'sec-018',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company is migrating Microsoft SharePoint and SQL Server workloads that require Active Directory to AWS. The company also needs users from its on-premises AD domain to access the migrated workloads by using a trust relationship. Which directory service should the company use?',
    options: [
      'Simple AD',
      'AD Connector',
      'AWS Managed Microsoft AD',
      'Amazon Cognito user pool',
    ],
    answer: [2],
    explanation:
      'AWS Managed Microsoft AD is a real Active Directory managed by AWS, supports AD-aware applications such as SharePoint and SQL Server, and creates a trust with on-prem AD. Simple AD does not support trusts and lacks many AD features. AD Connector is only a proxy and cannot serve as the directory for workloads on AWS when there is no on-prem. Cognito is not Active Directory.',
  },
  {
    id: 'sec-019',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company runs an internal web application behind an Application Load Balancer. The company wants users to authenticate before any request reaches the application servers, without changing application code. Which solution meets this requirement?',
    options: [
      'Configure an ALB listener rule with an authenticate action that uses an Amazon Cognito user pool or an OIDC identity provider.',
      'Attach AWS WAF to the ALB with a rule that requires an Authorization header.',
      'Place the application in a private subnet and use security groups to allow only authenticated users.',
      'Use an Amazon Cognito identity pool attached directly to the target group.',
    ],
    answer: [0],
    explanation:
      'ALB supports the authenticate-cognito or authenticate-oidc action right on the listener rule, authenticating users before forwarding requests to targets, with no code changes. WAF only checks whether a header exists, it does not authenticate identity. A Security Group filters by IP/port and does not know whether a user is authenticated. An identity pool issues AWS credentials and is not attached to a target group.',
  },
  {
    id: 'sec-020',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company uses an on-premises identity provider that supports SAML 2.0. The company has a single AWS account and wants employees to access the AWS Management Console with their corporate credentials without creating IAM users. What should a solutions architect configure?',
    options: [
      'An Amazon Cognito user pool with a SAML app client.',
      'A SAML identity provider in IAM and IAM roles whose trust policies allow federated users to call sts:AssumeRoleWithSAML.',
      'An IAM user for each employee with a password that matches the corporate password.',
      'AWS Directory Service Simple AD with a one-way trust to the identity provider.',
    ],
    answer: [1],
    explanation:
      'Creating a SAML identity provider in IAM and a role trusting that provider lets employees sign in to the console with their corporate accounts through AssumeRoleWithSAML. A Cognito user pool is for application users and is not used for console sign-in. Creating an IAM user for each employee contradicts the requirement. Simple AD does not support trusts.',
  },
  {
    id: 'sec-021',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A gaming company wants players to try a limited version of its mobile game without creating an account. Anonymous players must be able to read leaderboard data from an Amazon DynamoDB table but not write to it. Which solution meets these requirements?',
    options: [
      'Embed read-only IAM user credentials in the mobile application.',
      'Create a Cognito user pool and allow unauthenticated sign-in.',
      'Expose the DynamoDB table through a public VPC endpoint.',
      'Enable unauthenticated identities in an Amazon Cognito identity pool and attach a read-only role for guest users.',
    ],
    answer: [3],
    explanation:
      'A Cognito Identity Pool supports guest (unauthenticated) identities with a separate read-only IAM role, issuing temporary credentials. Embedding IAM user credentials in the app leaks long-term credentials. A user pool does not issue AWS credentials and has no concept of anonymous sign-in. A VPC endpoint is not public and does not replace authentication.',
  },
  {
    id: 'sec-022',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company runs a REST API on Amazon API Gateway. Only users who have signed in to the company\'s web application through an Amazon Cognito user pool should be able to call the API. Which solution requires the LEAST development effort?',
    options: [
      'Write a Lambda authorizer that validates usernames and passwords against a DynamoDB table.',
      'Use an API key and usage plan for every user.',
      'Configure a Cognito user pool authorizer on the API methods.',
      'Use IAM authorization and create an IAM user for each web application user.',
    ],
    answer: [2],
    explanation:
      'API Gateway has a built-in Cognito user pool authorizer that validates JWTs automatically without writing code. A Lambda authorizer that checks passwords itself is laborious and less secure. API keys are for identification/throttling, not a user authentication mechanism. Creating IAM users for each web user does not scale.',
  },
  // vpc-networking-security
  {
    id: 'sec-023',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A web application runs on EC2 instances in a public subnet. The security team notices malicious traffic from a single IP address and needs to block it immediately at the subnet level. What should a solutions architect do?',
    options: [
      'Add an inbound deny rule for the IP address to the network ACL associated with the subnet.',
      'Add an inbound deny rule for the IP address to the security group of the instances.',
      'Remove the route to the internet gateway from the subnet route table.',
      'Enable VPC Flow Logs and filter the IP address.',
    ],
    answer: [0],
    explanation:
      'A NACL works at the subnet level and supports Deny rules, so it can block a specific IP. A Security Group only has Allow rules and cannot Deny. Removing the route to the IGW would take down the whole application. Flow Logs only record traffic, they do not block it.',
  },
  {
    id: 'sec-024',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company has a three-tier application with web servers behind an Application Load Balancer, application servers, and an Amazon RDS for MySQL database. The security team requires that the database accepts connections only from the application tier, and that the application tier accepts traffic only from the load balancer. Which TWO configurations meet these requirements? (Choose TWO.)',
    options: [
      'Configure the database network ACL to allow port 3306 from 0.0.0.0/0.',
      'Place the RDS instance in a public subnet with a security group that allows the application servers\' public IP addresses.',
      'Configure the application tier security group to allow inbound traffic only from the ALB security group.',
      'Configure the application servers to use a NAT gateway to reach the database.',
      'Configure the database security group to allow inbound port 3306 only from the application tier security group.',
    ],
    answer: [2, 4],
    explanation:
      'Security Group referencing: the app tier SG allows traffic only from the ALB SG, and the DB SG allows port 3306 only from the app tier SG; this updates automatically when Auto Scaling adds instances. A NACL opening 3306 to 0.0.0.0/0 loosens security. Placing RDS in a public subnet is a flawed design. A NAT Gateway is for outbound Internet access and is unrelated to internal DB access.',
  },
  {
    id: 'sec-025',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'EC2 instances in private subnets across three Availability Zones need to download software updates from the internet. The solution must be highly available and require minimal management. What should a solutions architect do?',
    options: [
      'Launch a NAT instance in one public subnet and update all private route tables to use it.',
      'Create a NAT gateway in a public subnet in each Availability Zone and route each private subnet to the NAT gateway in the same AZ.',
      'Create one NAT gateway in a private subnet and route all private subnets to it.',
      'Attach an egress-only internet gateway to the VPC and route private subnets to it.',
    ],
    answer: [1],
    explanation:
      'A NAT Gateway is a managed service; placing one NAT Gateway in the public subnet of each AZ avoids a single point of failure and cross-AZ charges. A NAT instance must be self-managed and a single instance is a single point of failure. A NAT Gateway must be in a public subnet, and a single NAT is not HA when its AZ fails. An egress-only IGW is for IPv6 only.',
  },
  {
    id: 'sec-026',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company\'s administrators currently connect to Linux EC2 instances in private subnets through a bastion host that allows SSH from the corporate network. The company wants to remove the bastion host, close all inbound ports, and keep an audit log of all session activity. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Replace the bastion host with an AWS Client VPN endpoint and use SSH keys.',
      'Move the instances to public subnets and restrict SSH to the corporate IP range.',
      'Use a Network Load Balancer to forward SSH traffic to the instances.',
      'Use AWS Systems Manager Session Manager with an instance profile that allows SSM, and send session logs to Amazon S3 or CloudWatch Logs.',
    ],
    answer: [3],
    explanation:
      'Session Manager provides shell access without opening inbound ports, without a bastion or SSH keys, with access controlled by IAM and session logs written to S3/CloudWatch Logs. Client VPN still requires opening port 22 on the SG and managing keys. Moving instances to a public subnet increases the attack surface. An NLB forwarding SSH still requires an open port and has no session audit.',
  },
  {
    id: 'sec-027',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company created a custom network ACL for a public subnet that hosts web servers. The NACL allows inbound TCP 443 from 0.0.0.0/0 and outbound TCP 443 to 0.0.0.0/0. Users report that HTTPS connections to the web servers time out. The security groups are configured correctly. What is the MOST likely cause?',
    options: [
      'Security groups must also explicitly allow outbound responses on port 443.',
      'The internet gateway does not support HTTPS traffic.',
      'The NACL does not allow outbound traffic on ephemeral ports 1024-65535 for return traffic to clients.',
      'Network ACLs evaluate deny rules before allow rules.',
    ],
    answer: [2],
    explanation:
      'A NACL is stateless, so responses going out to the client on ephemeral ports (1024-65535) must be allowed separately in outbound. A Security Group is stateful and responses are automatically allowed. An IGW does not filter protocols. NACLs evaluate by rule number, not Deny before Allow.',
  },
  {
    id: 'sec-028',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company needs to inspect all outbound traffic from its VPCs and block connections to domain names that are not on an approved list. The company also needs intrusion prevention capabilities with Suricata-compatible rules. Which AWS service should be used?',
    options: [
      'AWS Network Firewall',
      'AWS WAF',
      'Security groups with outbound rules',
      'Amazon GuardDuty',
    ],
    answer: [0],
    explanation:
      'AWS Network Firewall is a managed VPC-level firewall that filters by domain (FQDN) and supports IPS with Suricata-compatible rules. WAF filters HTTP layer 7 for ALB/CloudFront/API Gateway and does not filter VPC egress. A Security Group only filters by IP/port, not by domain. GuardDuty detects threats but does not block traffic.',
  },
  {
    id: 'sec-029',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A solutions architect needs to troubleshoot why connections from an on-premises network to an EC2 instance are being rejected. The architect wants to see whether traffic is accepted or rejected at the network interface, without capturing packet contents. What should the architect enable?',
    options: [
      'AWS CloudTrail data events for Amazon EC2.',
      'VPC Flow Logs on the instance\'s network interface.',
      'VPC Traffic Mirroring on the instance.',
      'Amazon Inspector network reachability analysis.',
    ],
    answer: [1],
    explanation:
      'VPC Flow Logs record traffic metadata at the ENI level with ACCEPT/REJECT status, exactly what is needed to diagnose SGs/NACLs. CloudTrail records API calls, not network traffic. Traffic Mirroring captures packet contents, which exceeds the requirement and is more complex. Inspector assesses network reachability based on configuration and does not show actual rejected traffic.',
  },
  {
    id: 'sec-030',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company deploys a NAT instance to save costs. Instances in the private subnet still cannot reach the internet, even though the private route table points 0.0.0.0/0 to the NAT instance and its security group allows the traffic. What should the solutions architect do?',
    options: [
      'Attach an Elastic IP address to each private instance.',
      'Move the NAT instance to the private subnet.',
      'Add a route to the internet gateway in the private route table.',
      'Disable the source/destination check on the NAT instance.',
    ],
    answer: [3],
    explanation:
      'A NAT instance must have source/destination check disabled because it forwards traffic whose source/destination is not itself. Assigning an Elastic IP to a private instance does not provide Internet access because there is no route to the IGW. A NAT instance must be in a public subnet. Adding an IGW route to a private subnet turns it into a public subnet, contrary to the design.',
  },
  // vpc-connectivity
  {
    id: 'sec-031',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'EC2 instances in private subnets upload several terabytes of data to Amazon S3 each day through a NAT gateway. The company wants to reduce data transfer costs and keep traffic off the internet. What should a solutions architect do?',
    options: [
      'Create an interface VPC endpoint for Amazon S3 in each subnet.',
      'Replace the NAT gateway with a NAT instance.',
      'Create a gateway VPC endpoint for Amazon S3 and add it to the private subnet route tables.',
      'Enable S3 Transfer Acceleration on the bucket.',
    ],
    answer: [2],
    explanation:
      'A gateway endpoint for S3 is free, traffic stays within the AWS network, and it eliminates NAT Gateway data processing charges. An interface endpoint is also private but is charged per hour and per GB, so it is not the cheapest. A NAT instance still goes through the Internet and requires management effort. Transfer Acceleration speeds up transfers through the edge, costs extra and still goes over the Internet.',
  },
  {
    id: 'sec-032',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company has a 10 Gbps AWS Direct Connect connection to a single AWS Region. Security policy requires that all data in transit between the data center and the VPCs is encrypted. The company also wants a cost-effective backup path if the Direct Connect connection fails. Which TWO actions should a solutions architect take? (Choose TWO.)',
    options: [
      'Establish an IPsec Site-to-Site VPN connection over the Direct Connect connection.',
      'Enable default encryption on the Direct Connect connection in the console.',
      'Configure a Site-to-Site VPN connection over the internet as a backup to Direct Connect.',
      'Replace Direct Connect with VPC peering to the data center.',
      'Order a second Direct Connect connection at the same location for encryption.',
    ],
    answer: [0, 2],
    explanation:
      'Direct Connect is not encrypted by default; running an IPsec VPN over DX meets the encryption requirement. Site-to-Site VPN over the Internet is a cheap backup path for DX. There is no "default encryption" option in the console for DX. VPC peering only connects VPCs to VPCs. Adding another DX at the same location increases resiliency but does not encrypt and costs more than a VPN.',
  },
  {
    id: 'sec-033',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company has 150 VPCs across multiple accounts and an on-premises data center connected by VPN. All VPCs must communicate with each other and with the data center. The current full mesh of VPC peering connections is difficult to manage. Which solution simplifies the network with the LEAST operational overhead?',
    options: [
      'Create an AWS Transit Gateway, attach all VPCs and the VPN, and share the transit gateway across accounts with AWS RAM.',
      'Replace VPC peering with AWS PrivateLink endpoints between every pair of VPCs.',
      'Use a VPN CloudHub on a virtual private gateway in one VPC.',
      'Deploy EC2-based transit routers in a hub VPC.',
    ],
    answer: [0],
    explanation:
      'Transit Gateway uses a hub-and-spoke model, supports transitive routing for thousands of VPCs and VPNs, and is shared cross-account through RAM. PrivateLink offers one-directional service access and cannot replace full network connectivity. VPN CloudHub is for branches connecting to one VGW and does not route between 150 VPCs. A self-built router on EC2 requires a lot of operational effort.',
  },
  {
    id: 'sec-034',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A SaaS provider wants to offer its application, running behind a Network Load Balancer in its VPC, to hundreds of customers. Customers must connect privately from their own VPCs. Many customer VPCs use CIDR ranges that overlap with the provider\'s VPC. Which solution should the provider use?',
    options: [
      'VPC peering with each customer VPC.',
      'AWS Transit Gateway shared with all customers.',
      'A public Application Load Balancer with security group rules for each customer.',
      'A VPC endpoint service powered by AWS PrivateLink that customers connect to with interface endpoints.',
    ],
    answer: [3],
    explanation:
      'PrivateLink lets the provider put the service behind an NLB and customers access it privately through interface endpoints, regardless of overlapping CIDRs and without exposing the whole VPC. VPC peering does not allow overlapping CIDRs and does not scale to hundreds of customers. Transit Gateway also has the overlapping CIDR problem and exposes the network. A public ALB goes over the Internet and is not private.',
  },
  {
    id: 'sec-035',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company needs to connect its data center to AWS within the next week. The connection must be encrypted. Long-term, the company may need more bandwidth. Which solution should the company implement NOW?',
    options: [
      'AWS Direct Connect dedicated connection.',
      'AWS Site-to-Site VPN connection to a virtual private gateway.',
      'VPC peering between the data center and the VPC.',
      'AWS Client VPN for every server in the data center.',
    ],
    answer: [1],
    explanation:
      'Site-to-Site VPN uses IPsec encryption and sets up quickly within hours. Direct Connect usually takes more than a month to provision and is not encrypted by default. VPC peering is not used for on-prem networks. Client VPN is for individual users, not a site-to-site connection for a whole data center.',
  },
  {
    id: 'sec-036',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company uses AWS Direct Connect from its data center in Frankfurt. It now needs private connectivity from the same Direct Connect connection to VPCs in eu-central-1, us-east-1, and ap-southeast-1. Which solution meets this requirement with the LEAST cost?',
    options: [
      'Order new Direct Connect connections in each Region.',
      'Create VPC peering connections from the eu-central-1 VPC to the other Regions.',
      'Create a Direct Connect gateway and associate the virtual private gateways of the VPCs in each Region.',
      'Set up Site-to-Site VPN connections from the data center to each Region.',
    ],
    answer: [2],
    explanation:
      'Direct Connect Gateway lets one DX connection reach VPCs in multiple Regions without adding more links. Ordering a new DX in each Region is costly and slow. VPC peering is not transitive, so traffic from on-prem does not continue on to the peered VPC. A VPN over the Internet is not a dedicated connection as required.',
  },
  {
    id: 'sec-037',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company stores sensitive data in an Amazon S3 bucket. The company wants to ensure that the bucket can be accessed only from EC2 instances in a specific VPC through a VPC endpoint. Which solution meets this requirement?',
    options: [
      'Add a bucket policy that denies all access unless the request comes from the specific VPC endpoint by using the aws:SourceVpce condition.',
      'Add a security group to the gateway endpoint that allows only the EC2 instances.',
      'Enable S3 Block Public Access on the bucket.',
      'Configure a network ACL that allows only the S3 prefix list.',
    ],
    answer: [0],
    explanation:
      'A bucket policy Deny with the aws:SourceVpce condition not equal to the specified endpoint ensures the bucket is accessible only through that endpoint. A gateway endpoint cannot have a Security Group attached. Block Public Access prevents public access but does not restrict by VPC. A NACL controls subnet traffic and does not prevent others from accessing the bucket from elsewhere.',
  },
  {
    id: 'sec-038',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'An on-premises application connects to AWS over AWS Direct Connect with a private virtual interface. The application must call the Amazon SQS API privately without traversing the public internet. Which solution meets this requirement?',
    options: [
      'Create a gateway VPC endpoint for Amazon SQS.',
      'Create an interface VPC endpoint for Amazon SQS in the VPC and resolve its private DNS name from on premises.',
      'Route SQS traffic through a NAT gateway in the VPC.',
      'Enable VPC peering between the on-premises network and SQS.',
    ],
    answer: [1],
    explanation:
      'An interface endpoint creates an ENI with a private IP in the VPC, accessible from on-prem over Direct Connect/VPN. A gateway endpoint supports only S3 and DynamoDB and cannot be accessed from on-prem. A NAT Gateway sends traffic to public endpoints over the Internet. You cannot peer with an AWS service.',
  },
  // data-encryption-kms
  {
    id: 'sec-039',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company has an unencrypted Amazon RDS for PostgreSQL DB instance in production. A new compliance requirement states that the database must be encrypted at rest. What should a solutions architect do?',
    options: [
      'Modify the DB instance and enable encryption with an AWS KMS key.',
      'Create an encrypted read replica of the DB instance and promote it.',
      'Enable EBS encryption by default in the Region and reboot the DB instance.',
      'Take a snapshot, copy the snapshot with encryption enabled, restore a new DB instance from the encrypted snapshot, and switch the application to it.',
    ],
    answer: [3],
    explanation:
      'You cannot enable encryption on a running RDS instance; the standard approach is to snapshot, copy the snapshot with encryption enabled, restore a new DB and switch the application. Modify DB does not allow enabling encryption on an unencrypted instance. A read replica must have the same encryption state as the primary, so you cannot create an encrypted replica from an unencrypted DB. EBS encryption by default does not affect existing RDS.',
  },
  {
    id: 'sec-040',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company stores financial records in Amazon S3. Regulations require that records cannot be overwritten or deleted by any user, including the root user, for 7 years. The company also needs an audit trail of every use of the encryption key. Which TWO actions meet these requirements? (Choose TWO.)',
    options: [
      'Enable S3 Object Lock in governance mode with a 7-year retention period.',
      'Enable S3 Object Lock in compliance mode with a 7-year retention period.',
      'Use SSE-C encryption so that the company controls the keys.',
      'Use SSE-KMS with a customer managed key and record key usage with AWS CloudTrail.',
      'Enable MFA Delete and give the MFA device to the compliance officer.',
    ],
    answer: [1, 3],
    explanation:
      'Object Lock compliance mode prevents everyone, including root, from deleting or overwriting objects until retention expires. SSE-KMS with a customer managed key records every key use in CloudTrail. Governance mode lets users with bypass permission delete objects. SSE-C has no key usage audit in KMS. MFA Delete only adds an authentication step; whoever has the MFA device can still delete.',
  },
  {
    id: 'sec-041',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company must store encryption keys in single-tenant hardware security modules that it controls exclusively. AWS must not have access to the key material. The company wants to use the keys with Oracle Transparent Data Encryption on EC2. Which service should the company use?',
    options: [
      'AWS KMS with AWS managed keys.',
      'AWS KMS with customer managed keys and automatic rotation.',
      'AWS CloudHSM.',
      'AWS Secrets Manager.',
    ],
    answer: [2],
    explanation:
      'CloudHSM provides a single-tenant HSM, the customer has full control of keys and users, AWS cannot access the keys, and it supports Oracle TDE. KMS (both AWS managed and customer managed) is a multi-tenant service where AWS operates the HSMs. Secrets Manager stores secrets and is not an HSM.',
  },
  {
    id: 'sec-042',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company needs to share an encrypted Amazon EBS snapshot with a partner\'s AWS account. The snapshot is currently encrypted with the AWS managed key aws/ebs. What must the company do?',
    options: [
      'Copy the snapshot and re-encrypt it with a customer managed KMS key, share that key with the partner account through the key policy, and then share the snapshot.',
      'Share the snapshot directly and grant the partner access to the aws/ebs key.',
      'Make the snapshot public so the partner can copy it.',
      'Export the AWS managed key and send it to the partner securely.',
    ],
    answer: [0],
    explanation:
      'A snapshot encrypted with an AWS managed key cannot be shared; it must be copied and re-encrypted with a customer managed key, key access granted to the partner account, and then the snapshot shared. You cannot edit the key policy of aws/ebs. An encrypted snapshot cannot be made public, and making sensitive data public is wrong. KMS key material cannot be exported.',
  },
  {
    id: 'sec-043',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company uses SSE-KMS for an Amazon S3 bucket that receives millions of small objects every hour. The application has started receiving KMS throttling errors and KMS costs have increased significantly. Which solution resolves these issues with the LEAST effort?',
    options: [
      'Switch to client-side encryption with the AWS Encryption SDK.',
      'Enable S3 Bucket Keys for the bucket.',
      'Request a KMS quota increase and keep the current configuration.',
      'Use a different KMS key for each prefix.',
    ],
    answer: [1],
    explanation:
      'S3 Bucket Keys create a bucket-level key to sharply reduce requests to KMS, reducing both throttling and cost, by enabling a single option. Client-side encryption requires changing the application. Raising the quota reduces throttling but not cost. Using more keys does not reduce requests because quotas are per account/Region.',
  },
  {
    id: 'sec-044',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company wants to guarantee that every object uploaded to an S3 bucket is encrypted with a specific AWS KMS key, and that all requests to the bucket use TLS. What should a solutions architect configure?',
    options: [
      'Enable default encryption with SSE-S3 and enable S3 Block Public Access.',
      'Enable S3 Object Lock and require MFA Delete.',
      'Configure an S3 Lifecycle rule to re-encrypt objects that are not encrypted with the KMS key.',
      'Set default encryption to SSE-KMS with the key, and add a bucket policy that denies requests where aws:SecureTransport is false and denies PutObject requests that specify a different encryption key.',
    ],
    answer: [3],
    explanation:
      'Default encryption SSE-KMS with the specified key, combined with a bucket policy that Denies when aws:SecureTransport is false and Denies PutObject using another key, ensures both requirements. SSE-S3 does not use the specified KMS key, and Block Public Access does not enforce TLS. Object Lock and MFA Delete protect against deletion and are unrelated to encryption. Lifecycle does not re-encrypt objects.',
  },
  {
    id: 'sec-045',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company runs a DynamoDB global table in two Regions and encrypts sensitive attributes on the client side before writing them. The application in either Region must be able to decrypt data written in the other Region, even if KMS in the other Region is unreachable. Which solution meets these requirements?',
    options: [
      'Use AWS KMS multi-Region keys with a replica key in each Region.',
      'Create separate customer managed keys in each Region and copy the ciphertext between Regions.',
      'Use the AWS managed key aws/dynamodb in both Regions.',
      'Store a symmetric key in AWS Secrets Manager and replicate the secret.',
    ],
    answer: [0],
    explanation:
      'Multi-Region keys have the same key ID and key material in each Region, so data encrypted in one Region can be decrypted in another using the local replica key. Separate keys in each Region have different key material and cannot decrypt across Regions. AWS managed keys in each Region are different keys and are used for server-side encryption. Storing the key yourself in Secrets Manager is manual key management, without the control and auditing of KMS.',
  },
  {
    id: 'sec-046',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company has a private S3 bucket. A mobile application needs to let a specific user download one object for the next 15 minutes without making the object public and without giving the user AWS credentials. What is the simplest solution?',
    options: [
      'Enable S3 static website hosting on the bucket.',
      'Create an IAM user for the mobile user and share the access key.',
      'Generate an S3 presigned URL for the object with a 15-minute expiration.',
      'Temporarily disable S3 Block Public Access on the bucket.',
    ],
    answer: [2],
    explanation:
      'A presigned URL lets a user download a private object for a limited time using the permissions of the URL creator, without giving credentials to the user. Static website hosting requires public objects. Creating an IAM user and sharing keys is a long-term credential. Turning off Block Public Access exposes data.',
  },
  {
    id: 'sec-047',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company runs EC2 instances with unencrypted EBS data volumes. The security team now requires all EBS volumes to be encrypted, including any new volumes created in the future. Which combination of actions meets these requirements?',
    options: [
      'Enable encryption on each existing volume from the EC2 console, and use a tag policy for new volumes.',
      'Create snapshots of existing volumes, copy them with encryption enabled, create new volumes from the encrypted snapshots, and enable EBS encryption by default for the Region.',
      'Use AWS Backup to back up the volumes, which automatically encrypts the original volumes.',
      'Attach an IAM policy that requires encryption to the instance profile.',
    ],
    answer: [1],
    explanation:
      'An existing volume cannot be encrypted directly; you must copy a snapshot with encryption and create a new volume. Enabling EBS encryption by default ensures new volumes in the Region are always encrypted. There is no option to enable encryption on an existing volume, and tag policies do not enforce encryption. AWS Backup does not encrypt the original volume. A policy on the instance profile does not affect volume creation.',
  },
  // secrets-certificates
  {
    id: 'sec-048',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company\'s Lambda functions connect to an Amazon Aurora MySQL database using a password that is hard-coded in the function code. The security team requires that the password is removed from code and rotated automatically every 30 days. Which TWO steps should a solutions architect take? (Choose TWO.)',
    options: [
      'Store the password in an SSM Parameter Store String parameter.',
      'Store the password as a Lambda environment variable encrypted with the default key.',
      'Create a cron job on an EC2 instance that changes the password monthly.',
      'Store the credentials in AWS Secrets Manager and enable automatic rotation with a 30-day schedule.',
      'Update the Lambda functions to retrieve the secret from AWS Secrets Manager at runtime and grant the execution role permission to read the secret.',
    ],
    answer: [3, 4],
    explanation:
      'Secrets Manager supports built-in automatic rotation for Aurora; Lambda reads the secret at runtime using permissions in its execution role. Parameter Store String is not encrypted and has no built-in rotation. Environment variables do not solve rotation. A cron job on EC2 adds operational effort and cannot stay in sync with the application.',
  },
  {
    id: 'sec-049',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company serves static content from an Amazon S3 bucket through Amazon CloudFront. Users have discovered that they can access the objects directly through the S3 URL, bypassing CloudFront. The bucket uses SSE-KMS encryption. Which solution prevents direct access to the bucket?',
    options: [
      'Configure an origin access control (OAC) on the distribution, update the bucket policy to allow only the CloudFront service principal for that distribution, and keep the bucket private.',
      'Configure an origin access identity (OAI) and enable S3 static website hosting.',
      'Enable S3 Transfer Acceleration and block the S3 regional endpoint.',
      'Use CloudFront signed URLs for all objects.',
    ],
    answer: [0],
    explanation:
      'OAC is the current mechanism replacing OAI and supports SSE-KMS; the bucket policy allows only cloudfront.amazonaws.com with AWS:SourceArn set to the distribution, and the bucket stays private. OAI is the legacy mechanism, does not support SSE-KMS, and the S3 website endpoint cannot be used with OAI/OAC. Transfer Acceleration does not block access. Signed URLs control viewers through CloudFront but do not block direct S3 access.',
  },
  {
    id: 'sec-050',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company is deploying a website on Amazon CloudFront with a custom domain name. The company wants a free public TLS certificate that renews automatically. The rest of the infrastructure runs in eu-west-1. Where should the certificate be requested?',
    options: [
      'In AWS Certificate Manager in eu-west-1.',
      'In AWS Private Certificate Authority in eu-west-1.',
      'In AWS Certificate Manager in us-east-1.',
      'In IAM by uploading a self-signed certificate.',
    ],
    answer: [2],
    explanation:
      'CloudFront only uses ACM certificates created or imported in us-east-1; ACM issues free public certificates and renews them automatically. A certificate in eu-west-1 cannot be attached to CloudFront. Private CA issues private certificates, is paid, and browsers do not trust them. Self-signed certificates are not trusted by browsers and do not renew automatically.',
  },
  {
    id: 'sec-051',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A video streaming company distributes premium content through Amazon CloudFront. Subscribers must be able to access hundreds of video segment files for a movie without changing the URLs used by the existing player. Which solution meets these requirements?',
    options: [
      'CloudFront signed URLs for each segment file.',
      'S3 presigned URLs for each segment file.',
      'AWS WAF geo match rules on the distribution.',
      'CloudFront signed cookies issued to authenticated subscribers.',
    ],
    answer: [3],
    explanation:
      'Signed cookies grant access to multiple files without changing URLs, suitable for premium content made up of many segments. Signed URLs must be created per file and change the URL. S3 presigned URLs bypass CloudFront and also change the URL. Geo match only filters by country and does not identify subscribers.',
  },
  {
    id: 'sec-052',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'An application stores dozens of configuration values, such as feature flags and endpoint URLs, plus a few API keys that do not need rotation. The company wants a low-cost, hierarchical store with encryption for the sensitive values. Which solution is MOST cost-effective?',
    options: [
      'Store all values in AWS Secrets Manager.',
      'Use AWS Systems Manager Parameter Store standard parameters, with SecureString parameters for the API keys.',
      'Store the values in a DynamoDB table encrypted with a customer managed key.',
      'Store the values in an S3 object encrypted with SSE-C.',
    ],
    answer: [1],
    explanation:
      'Parameter Store standard tier is free, supports hierarchical structure and SecureString encrypted with KMS, enough for secrets that do not need rotation. Secrets Manager charges per secret, which costs more when rotation is not needed. DynamoDB and S3 require building your own configuration management, and SSE-C requires you to manage keys yourself.',
  },
  {
    id: 'sec-053',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company has a web application behind an Application Load Balancer. It wants to offload TLS processing from the EC2 instances while using certificates that renew automatically. Which solution requires the LEAST operational overhead?',
    options: [
      'Request a public certificate in AWS Certificate Manager and attach it to an HTTPS listener on the ALB.',
      'Install a third-party certificate on each EC2 instance and use a TCP listener on a Network Load Balancer.',
      'Import a third-party certificate into ACM and attach it to the ALB.',
      'Store the certificate in Secrets Manager and load it on the instances at boot.',
    ],
    answer: [0],
    explanation:
      'An ACM public certificate attached to the ALB HTTPS listener both offloads TLS from EC2 and renews automatically. Installing certs on each EC2 instance does not offload TLS and must be renewed manually. ACM does not auto-renew imported certificates. Storing the cert in Secrets Manager still leaves EC2 handling TLS and renewal must be managed manually.',
  },
  // threat-detection-waf-shield
  {
    id: 'sec-054',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company\'s e-commerce website runs behind an Application Load Balancer. The website is experiencing SQL injection attempts and an HTTP flood from a small set of IP addresses. Which solution addresses both issues?',
    options: [
      'Enable AWS Shield Standard on the ALB.',
      'Add network ACL deny rules for every attacking IP address.',
      'Associate an AWS WAF web ACL with the ALB that includes the SQL injection managed rule group and a rate-based rule.',
      'Enable Amazon GuardDuty and Amazon Inspector.',
    ],
    answer: [2],
    explanation:
      'WAF attached to the ALB with a managed rule against SQL injection and a rate-based rule blocking IPs that send too many requests solves both problems. Shield Standard is already on and only protects against layer 3/4 DDoS, it does not block SQLi. A NACL does not block SQLi and must be updated manually when IPs change. GuardDuty detects and Inspector scans for vulnerabilities; neither blocks requests.',
  },
  {
    id: 'sec-055',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A financial services company is concerned about large, sophisticated DDoS attacks against its applications on CloudFront, Route 53, and Elastic Load Balancing. The company wants access to a 24/7 DDoS response team and protection against scaling charges caused by attacks. Which service should the company use?',
    options: [
      'AWS Shield Standard',
      'AWS WAF with rate-based rules',
      'Amazon GuardDuty',
      'AWS Shield Advanced',
    ],
    answer: [3],
    explanation:
      'Shield Advanced provides enhanced DDoS protection for CloudFront, Route 53, ELB, Global Accelerator, EC2, with a 24/7 Shield Response Team and cost protection. Shield Standard is free but has no SRT or cost protection. WAF filters layer 7 but has no response team or cost protection. GuardDuty detects threats in the account and does not defend against DDoS.',
  },
  {
    id: 'sec-056',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A security team wants to automatically detect cryptocurrency mining activity on EC2 instances and immediately isolate any affected instance by replacing its security group. Which TWO services should be combined to achieve this with the LEAST custom infrastructure? (Choose TWO.)',
    options: [
      'Amazon GuardDuty to detect the threat.',
      'Amazon Macie to classify instance data.',
      'AWS Trusted Advisor to scan instances.',
      'Amazon Inspector to monitor network traffic.',
      'Amazon EventBridge with an AWS Lambda function that modifies the instance security group when a finding is published.',
    ],
    answer: [0, 4],
    explanation:
      'GuardDuty detects crypto mining based on Flow Logs, DNS logs and threat intelligence; EventBridge captures the finding and invokes Lambda to change the Security Group to isolate the instance. Macie finds sensitive data in S3. Trusted Advisor gives best practice recommendations and does not detect real-time threats. Inspector scans for software vulnerabilities and does not monitor traffic.',
  },
  {
    id: 'sec-057',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company stores millions of documents in Amazon S3 across many buckets. The compliance team needs to discover which objects contain personally identifiable information (PII) such as passport numbers and credit card numbers. Which service should be used?',
    options: [
      'Amazon GuardDuty S3 Protection',
      'Amazon Macie',
      'AWS Config',
      'Amazon Detective',
    ],
    answer: [1],
    explanation:
      'Macie uses machine learning and pattern matching to discover sensitive data (PII) in S3. GuardDuty S3 Protection detects suspicious access activity and does not classify content. AWS Config evaluates bucket configuration and does not scan content. Detective is used to investigate the root cause of findings.',
  },
  {
    id: 'sec-058',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company with 60 accounts in AWS Organizations must ensure that every Application Load Balancer and CloudFront distribution, including resources created in the future, is protected by a standard set of AWS WAF rules. Which solution requires the LEAST operational overhead?',
    options: [
      'Create a CloudFormation StackSet that deploys a web ACL to each account and ask teams to associate it.',
      'Use an AWS Config rule in each account to detect unprotected resources and notify teams.',
      'Use AWS Firewall Manager with a WAF security policy that applies the rules across the organization automatically.',
      'Write a Lambda function in each account that attaches the web ACL when resources are created.',
    ],
    answer: [2],
    explanation:
      'Firewall Manager centrally manages WAF policies across all accounts in Organizations and automatically applies them to new resources. A StackSet only deploys the web ACL, and attaching remains manual. A Config rule only detects and notifies. A self-written Lambda in each account takes development and maintenance effort.',
  },
  {
    id: 'sec-059',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'An auditor asks a company to show who deleted a security group in production last month and from which IP address the request was made. Which service provides this information?',
    options: [
      'AWS Config configuration history.',
      'VPC Flow Logs.',
      'Amazon CloudWatch metrics.',
      'AWS CloudTrail.',
    ],
    answer: [3],
    explanation:
      'CloudTrail records every API call including the caller identity, time and source IP address, so it answers the question "who deleted it". AWS Config shows how the configuration changed but the questions "who" and "from which IP" belong to CloudTrail. Flow Logs record network traffic, not API calls. CloudWatch metrics are performance data.',
  },
  {
    id: 'sec-060',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company must continuously verify that all Amazon S3 buckets have server access logging enabled and that no security group allows unrestricted SSH access. Noncompliant resources should be remediated automatically. Which solution meets these requirements?',
    options: [
      'Use AWS Config managed rules with automatic remediation through AWS Systems Manager Automation documents.',
      'Enable Amazon GuardDuty and review its findings weekly.',
      'Use Amazon Inspector to scan S3 buckets and security groups.',
      'Create CloudTrail trails and query them with Amazon Athena each day.',
    ],
    answer: [0],
    explanation:
      'AWS Config rules continuously evaluate resource configuration and support automatic remediation with SSM Automation. GuardDuty detects threats and does not check configuration compliance. Inspector scans for software vulnerabilities on EC2/ECR/Lambda and does not evaluate S3 or SGs against rules. Querying CloudTrail with Athena is manual and does not remediate automatically.',
  },
];
