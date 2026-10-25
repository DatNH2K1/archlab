import type { Question } from '@/content/types';

export const costQuestionsEn: Question[] = [
  {
    id: 'cost-001',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company runs a fleet of Amazon EC2 instances for a web application 24 hours a day. The company expects to keep the workload for at least 3 years, but it plans to migrate part of the application to AWS Fargate and AWS Lambda over the next year and might move to a different AWS Region. Which purchasing option meets these requirements MOST cost-effectively?',
    options: [
      'Purchase 3-year Standard Reserved Instances for the current instance family',
      'Purchase a 3-year Compute Savings Plan',
      'Purchase a 3-year EC2 Instance Savings Plan',
      'Use On-Demand Instances and migrate to Spot Instances later',
    ],
    answer: [1],
    explanation:
      'Compute Savings Plans apply to EC2 in any family, Region, and OS, as well as Fargate and Lambda, so they fit when the workload will move to serverless or change Region while still getting a 3-year committed discount. Standard RIs are tied to a family/Region and do not apply to Fargate/Lambda. EC2 Instance Savings Plans apply only to one family in one Region. On-Demand is expensive, and Spot is unsuitable for a web app that runs continuously and needs stability.',
  },
  {
    id: 'cost-002',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A media company runs nightly video transcoding jobs. Each job processes files from Amazon S3, checkpoints progress, and can be restarted at any time without data loss. The jobs must finish by the next morning, but the start time is flexible. Which solution is the MOST cost-effective?',
    options: [
      'Run the jobs on On-Demand Instances in an Auto Scaling group',
      'Run the jobs on Dedicated Instances',
      'Purchase Reserved Instances for the transcoding fleet',
      'Run the jobs on Spot Instances using a diversified set of instance types',
    ],
    answer: [3],
    explanation:
      'Jobs that checkpoint, can restart, and have flexible timing are the classic Spot Instances case (up to 90% cheaper); diversifying instance types reduces the risk of interruption. On-Demand works but costs much more. Dedicated Instances are more expensive and unnecessary. Reserved Instances require a commitment to run continuously, which wastes money for jobs that run only at night.',
  },
  {
    id: 'cost-003',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company wants to migrate an on-premises application to Amazon EC2. The application uses Microsoft SQL Server Enterprise licenses that are licensed per physical core. The company wants to use its existing licenses and must be able to track license usage against physical cores. Which EC2 option should a solutions architect recommend?',
    options: [
      'Dedicated Hosts',
      'Dedicated Instances',
      'On-Demand Instances with default tenancy',
      'Spot Instances with license-included AMIs',
    ],
    answer: [0],
    explanation:
      'Dedicated Hosts expose sockets and physical cores, support BYOL for per-core/per-socket licenses, and allow license tracking. Dedicated Instances run on dedicated hardware but do not expose sockets/cores, so they do not meet the license tracking requirement. Default tenancy uses shared hardware. Spot with license-included AMIs means buying a new license from AWS instead of using existing ones, and can be interrupted.',
  },
  {
    id: 'cost-004',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'An ecommerce company needs to guarantee EC2 capacity in a specific Availability Zone for a 2-week holiday sales event. After the event, the capacity will no longer be needed. Which solution meets these requirements with the LEAST commitment?',
    options: [
      'Purchase a 1-year zonal Reserved Instance',
      'Purchase a 1-year Compute Savings Plan',
      'Create an On-Demand Capacity Reservation and cancel it after the event',
      'Request Spot Instances with a maximum price equal to the On-Demand price',
    ],
    answer: [2],
    explanation:
      'An On-Demand Capacity Reservation holds capacity in a specific AZ, requires no term commitment, and can be canceled after the event. A zonal RI does reserve capacity but requires a commitment of at least 1 year. Savings Plans only discount prices and do not guarantee capacity. Spot does not guarantee capacity and can be reclaimed.',
  },
  {
    id: 'cost-005',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company runs a stateless web tier in an Auto Scaling group. At least four instances must always be running to handle baseline traffic. During peaks, the group scales to 20 instances. The company wants to minimize cost while keeping the baseline reliable. What should a solutions architect do?',
    options: [
      'Use only Spot Instances in the Auto Scaling group with capacity rebalancing',
      'Use a mixed instances policy with an On-Demand base capacity of four instances covered by a Savings Plan, and Spot Instances for capacity above the base',
      'Purchase Reserved Instances for 20 instances',
      'Use Dedicated Instances for the baseline and On-Demand Instances for peaks',
    ],
    answer: [1],
    explanation:
      'A mixed instances policy lets you set an On-Demand base capacity (4 instances, covered by a Savings Plan for a discount) and use Spot for the extra load, giving both stability and low cost. Using only Spot does not guarantee the baseline. Buying RIs for 20 instances wastes money because most of the time only 4 are needed. Dedicated Instances are more expensive and do not save money.',
  },
  {
    id: 'cost-006',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company purchased 3-year Standard Reserved Instances for the m5 instance family. After a performance review, the company wants to move the workload to the c6g instance family. The company also wants to avoid losing the remaining value of the commitment where possible. Which approach should the company have used when purchasing the commitment to allow this change?',
    options: [
      'Zonal Standard Reserved Instances',
      'Regional Standard Reserved Instances',
      'On-Demand Capacity Reservations',
      'Convertible Reserved Instances',
    ],
    answer: [3],
    explanation:
      'Convertible RIs allow exchanging for a different instance family, OS, or tenancy (of equal or higher value). Standard RIs, whether zonal or regional, cannot change the instance family (regional is flexible only on size and AZ). A Capacity Reservation is not a discounted commitment.',
  },
  {
    id: 'cost-007',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company has hundreds of EC2 instances across multiple accounts. A solutions architect suspects that many instances are over-provisioned. The company wants recommendations for smaller instance types based on historical CPU and memory utilization, with the LEAST operational effort. What should the solutions architect do?',
    options: [
      'Install the Amazon CloudWatch agent to collect memory metrics and use AWS Compute Optimizer recommendations',
      'Use AWS Pricing Calculator to compare instance types',
      'Create AWS Budgets for each account to track EC2 spend',
      'Write a script that queries CloudWatch CPU metrics and resizes instances automatically',
    ],
    answer: [0],
    explanation:
      'AWS Compute Optimizer uses ML on CloudWatch metrics to recommend right-sizing; memory metrics require the CloudWatch agent. Pricing Calculator only estimates prices and does not analyze utilization. Budgets only tracks spend. A custom script adds operational effort and would only see CPU because EC2 does not send memory metrics by default.',
  },
  {
    id: 'cost-008',
    domain: 'cost',
    lesson: 'ec2-pricing-models',
    stem: 'A company runs a batch processing application on Spot Instances. The application must gracefully save its state before an instance is reclaimed. Which mechanisms can the application use to detect an upcoming Spot interruption? (Choose TWO.)',
    options: [
      'Poll the instance metadata service for the spot instance-action notice',
      'Subscribe to AWS Trusted Advisor notifications',
      'Create an Amazon EventBridge rule for the EC2 Spot Instance Interruption Warning event',
      'Monitor AWS Cost Anomaly Detection alerts',
      'Configure an AWS Budgets alert for Spot usage',
    ],
    answer: [0, 2],
    explanation:
      'The Spot interruption notice (2 minutes ahead) can be obtained through instance metadata (spot/instance-action) and through the EventBridge event "EC2 Spot Instance Interruption Warning". Trusted Advisor, Cost Anomaly Detection, and Budgets are cost/best-practice tools and do not signal Spot reclamation.',
  },
  {
    id: 'cost-009',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company stores user-uploaded files in Amazon S3. Access patterns are unpredictable: some files are accessed frequently for months, while others are never accessed after upload. The company wants to optimize storage costs automatically without retrieval fees or operational overhead. Which storage class should be used?',
    options: [
      'S3 Standard-IA',
      'S3 One Zone-IA',
      'S3 Intelligent-Tiering',
      'S3 Glacier Instant Retrieval',
    ],
    answer: [2],
    explanation:
      'S3 Intelligent-Tiering automatically moves objects between tiers based on access patterns, has no retrieval fee, and fits unpredictable access patterns. Standard-IA and Glacier Instant Retrieval have retrieval fees, which are costly for frequently accessed files. One Zone-IA has retrieval fees and stores data in only 1 AZ.',
  },
  {
    id: 'cost-010',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A hospital must retain medical images for 10 years. The images are rarely accessed after the first month, but when a doctor requests an image, it must be available within milliseconds. Which storage solution is MOST cost-effective?',
    options: [
      'Store the images in S3 Standard and use a lifecycle rule to transition them to S3 Glacier Deep Archive after 30 days',
      'Store the images in S3 Standard and use a lifecycle rule to transition them to S3 Glacier Flexible Retrieval after 30 days',
      'Store the images in S3 One Zone-IA',
      'Store the images in S3 Standard and use a lifecycle rule to transition them to S3 Glacier Instant Retrieval after 30 days',
    ],
    answer: [3],
    explanation:
      'Glacier Instant Retrieval is for long-lived, infrequently accessed data that must be retrieved in milliseconds, with cheaper storage than Standard-IA. Deep Archive takes 12–48 hours and Flexible Retrieval takes minutes to hours, so neither meets the millisecond requirement. One Zone-IA is in only 1 AZ, risking loss of important medical data, and costs more than Glacier IR for long-term storage.',
  },
  {
    id: 'cost-011',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company generates thumbnails from original images stored in S3 Standard. The thumbnails are accessed infrequently and can be regenerated from the originals at any time. Which storage class is MOST cost-effective for the thumbnails while still providing millisecond access?',
    options: [
      'S3 One Zone-IA',
      'S3 Standard',
      'S3 Glacier Deep Archive',
      'S3 Glacier Flexible Retrieval',
    ],
    answer: [0],
    explanation:
      'Infrequently accessed, re-creatable data is the classic One Zone-IA case: cheaper than Standard-IA, millisecond access, and the risk of losing one AZ is acceptable. S3 Standard costs more for infrequently accessed data. Deep Archive and Flexible Retrieval do not provide millisecond access.',
  },
  {
    id: 'cost-012',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A financial company must keep transaction archives for 7 years to meet regulatory requirements. Auditors request data about once a year and accept a retrieval time of up to 48 hours. Which storage class provides the LOWEST cost?',
    options: [
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Deep Archive',
      'S3 Standard-IA',
      'S3 Intelligent-Tiering with only the Frequent and Infrequent Access tiers',
    ],
    answer: [1],
    explanation:
      'Glacier Deep Archive is the cheapest class, suited to 7–10 year compliance archives, with retrieval within 12 hours (Standard) or 48 hours (Bulk). Glacier Instant Retrieval and Standard-IA cost more because they support millisecond access that is not needed. Intelligent-Tiering with only the Frequent/Infrequent tiers cannot reach storage prices as low as Deep Archive.',
  },
  {
    id: 'cost-013',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company stores data in S3 Glacier Flexible Retrieval. Occasionally, an urgent legal request requires that a few files be restored within 5 minutes. Which retrieval option should be used?',
    options: [
      'Bulk retrieval',
      'Standard retrieval',
      'Expedited retrieval',
      'Copy the objects to S3 Glacier Deep Archive and retrieve them from there',
    ],
    answer: [2],
    explanation:
      'Glacier Flexible Retrieval Expedited retrieval returns data in about 1–5 minutes. Standard takes 3–5 hours and Bulk takes 5–12 hours. Deep Archive is even slower (within 12–48 hours) and has no Expedited option.',
  },
  {
    id: 'cost-014',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company has versioning enabled on an S3 bucket that stores frequently updated reports. Storage costs have grown much faster than the size of the current data. A solutions architect discovers that old object versions and incomplete multipart uploads are accumulating. What is the MOST cost-effective solution with the LEAST operational overhead?',
    options: [
      'Disable versioning on the bucket',
      'Write an AWS Lambda function that runs daily to delete old versions',
      'Move the bucket to S3 Intelligent-Tiering',
      'Configure S3 Lifecycle rules to expire noncurrent versions after a set number of days and abort incomplete multipart uploads',
    ],
    answer: [3],
    explanation:
      'The lifecycle rules NoncurrentVersionExpiration and AbortIncompleteMultipartUpload automatically clean up old versions and unfinished upload parts, with no code. Disabling versioning does not delete existing versions and removes data protection. A custom Lambda adds operational effort. Intelligent-Tiering only lowers storage price; it does not delete excess versions or incomplete multipart uploads.',
  },
  {
    id: 'cost-015',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A research institute publishes a multi-terabyte genomics dataset in Amazon S3 for other organizations to download. The institute wants the organizations that download the data to pay for the data transfer and request costs. What should the institute configure?',
    options: [
      'Enable Requester Pays on the bucket',
      'Use S3 Transfer Acceleration',
      'Distribute the dataset through Amazon CloudFront with signed URLs',
      'Create a bucket policy that allows anonymous access',
    ],
    answer: [0],
    explanation:
      'Requester Pays makes the requester (who must be an authenticated AWS principal) pay for requests and data transfer, and the bucket owner pays only for storage. Transfer Acceleration speeds things up but adds cost for the bucket owner. CloudFront with signed URLs controls access but the owner still pays egress. Anonymous access cannot be used with Requester Pays, and the bucket owner would pay everything.',
  },
  {
    id: 'cost-016',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company has hundreds of S3 buckets across multiple AWS accounts in an organization. The company wants organization-wide visibility into storage usage and activity trends, and recommendations to reduce storage costs, such as identifying buckets with many incomplete multipart uploads. It also needs a daily list of objects with their storage class for a large bucket to plan a transition. Which features should a solutions architect use? (Choose TWO.)',
    options: [
      'Amazon S3 Storage Lens',
      'AWS Trusted Advisor service limit checks',
      'Amazon S3 Inventory',
      'S3 Transfer Acceleration',
      'S3 Object Lock',
    ],
    answer: [0, 2],
    explanation:
      'S3 Storage Lens provides an organization-level dashboard of usage, activity, and cost optimization recommendations. S3 Inventory exports a daily/weekly list of objects with their storage class. Trusted Advisor service limit checks relate only to quotas. Transfer Acceleration speeds up uploads. Object Lock is for WORM/compliance, not cost analysis.',
  },
  {
    id: 'cost-017',
    domain: 'cost',
    lesson: 's3-storage-classes',
    stem: 'A company stores application logs in S3 Standard. Logs are queried frequently for the first 30 days, occasionally for the next 60 days, and must then be retained for 1 year for audit purposes with retrieval within hours acceptable. After 1 year, the logs can be deleted. Which lifecycle configuration is MOST cost-effective?',
    options: [
      'Keep logs in S3 Standard for 1 year, then delete them',
      'Transition logs to S3 Standard-IA after 30 days, to S3 Glacier Flexible Retrieval after 90 days, and expire them after 365 days',
      'Transition logs to S3 One Zone-IA after 1 day and expire them after 365 days',
      'Transition logs to S3 Glacier Deep Archive after 1 day and expire them after 365 days',
    ],
    answer: [1],
    explanation:
      'Transition progressively by access pattern: Standard for 30 days (frequent queries), Standard-IA until day 90 (occasional), then Glacier Flexible Retrieval (retrieval within hours), then expire after 365 days. Keeping Standard for the whole year costs more. One Zone-IA after 1 day violates the lifecycle constraint (objects must stay in Standard at least 30 days before moving to IA) and still incurs retrieval fees for heavy querying. Deep Archive after 1 day would make the logs unqueryable during the first 30 days.',
  },
  {
    id: 'cost-018',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company wants to receive an alert when its forecasted monthly AWS spend for a development account is expected to exceed $5,000. If actual spend exceeds the threshold, the company wants to automatically apply an IAM policy that prevents developers from launching new EC2 instances. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Use AWS Cost Explorer reports and review them daily',
      'Use AWS Cost Anomaly Detection with an SNS subscription',
      'Create an AWS Budgets cost budget with a forecasted alert and a budget action that applies an IAM policy',
      'Create a CloudWatch billing alarm that invokes a Lambda function to modify IAM policies',
    ],
    answer: [2],
    explanation:
      'AWS Budgets supports alerts on forecasted cost and Budget actions that automatically apply an IAM policy/SCP or stop EC2/RDS when a threshold is exceeded, with no code. Cost Explorer requires manual review. Cost Anomaly Detection detects anomalies, does not use fixed thresholds, and does not apply policies. A CloudWatch billing alarm + Lambda works but must be written by hand and takes more operational effort.',
  },
  {
    id: 'cost-019',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A finance team needs hourly, resource-level billing data for all accounts in an organization, including cost allocation tags, so that analysts can run SQL queries and build dashboards. Which solution meets these requirements?',
    options: [
      'Create a CUR 2.0 export with AWS Data Exports to an S3 bucket, and query it with Amazon Athena',
      'Use AWS Cost Explorer and download CSV reports each day',
      'Enable AWS Trusted Advisor for all accounts',
      'Use AWS Pricing Calculator to build estimates for each account',
    ],
    answer: [0],
    explanation:
      'CUR 2.0 via AWS Data Exports provides the most detailed billing data (hourly, per resource, with tags) into S3, queried with Athena and visualized with QuickSight. Cost Explorer does not provide detailed resource-level data for SQL, and daily manual downloads take effort. Trusted Advisor is a best-practice check. Pricing Calculator only estimates.',
  },
  {
    id: 'cost-020',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company tagged all resources with a CostCenter tag. However, when the finance team opens AWS Cost Explorer, they cannot group costs by CostCenter. What should a solutions architect do?',
    options: [
      'Enable AWS Config rules for required tags',
      'Activate the CostCenter tag as a user-defined cost allocation tag in the Billing console of the management account',
      'Recreate the resources with the tag applied at launch',
      'Create an AWS Budgets usage budget filtered by CostCenter',
    ],
    answer: [1],
    explanation:
      'A tag appears in Cost Explorer/CUR only after it is activated as a cost allocation tag in the Billing console of the management account (data counts from the activation time). AWS Config checks tag compliance but does not make tags appear in cost reports. Recreating resources is unnecessary. A budget does not help group costs by tag while the tag is not activated.',
  },
  {
    id: 'cost-021',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company wants to be notified when spending on any AWS service suddenly increases in an unusual way, for example because of a misconfigured resource. The company does not want to define and maintain fixed thresholds for each service. Which AWS service should be used?',
    options: [
      'AWS Budgets',
      'AWS Trusted Advisor',
      'AWS Compute Optimizer',
      'AWS Cost Anomaly Detection',
    ],
    answer: [3],
    explanation:
      'Cost Anomaly Detection uses machine learning to detect unusual spend and analyze root causes, needs no thresholds, and sends alerts via SNS or email. Budgets requires fixed thresholds. Trusted Advisor checks best practices and does not track cost fluctuations. Compute Optimizer only recommends right-sizing.',
  },
  {
    id: 'cost-022',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company has 15 AWS accounts, each billed separately. The company wants a single bill, wants to benefit from volume pricing tiers across all accounts, and wants unused Reserved Instance discounts in one account to apply to usage in other accounts. What should a solutions architect recommend?',
    options: [
      'Purchase Reserved Instances separately in each account',
      'Use AWS Billing Conductor to create billing groups',
      'Create an organization in AWS Organizations with consolidated billing',
      'Use AWS Control Tower Account Factory to recreate the accounts',
    ],
    answer: [2],
    explanation:
      'Consolidated billing in AWS Organizations combines bills, combines usage to reach lower pricing tiers, and shares RIs/Savings Plans across accounts. Buying RIs separately in each account cannot be shared unless the accounts are in the same organization. Billing Conductor creates pro forma bills for showback/chargeback and does not replace consolidated billing. Control Tower sets up a landing zone; there is no need to recreate the accounts.',
  },
  {
    id: 'cost-023',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company wants to identify unassociated Elastic IP addresses, idle load balancers, and underutilized Amazon EBS volumes across its account. The company has an Enterprise Support plan. Which service provides these checks with the LEAST effort?',
    options: [
      'AWS Trusted Advisor',
      'AWS Pricing Calculator',
      'Amazon Inspector',
      'AWS CloudTrail',
    ],
    answer: [0],
    explanation:
      'Trusted Advisor has cost optimization checks such as unassociated Elastic IPs, idle load balancers, and underutilized EBS; the Enterprise Support plan includes the full set of checks. Pricing Calculator only estimates. Inspector scans for security vulnerabilities. CloudTrail records API calls.',
  },
  {
    id: 'cost-024',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'A company that runs workloads in many accounts in AWS Organizations wants to analyze how much of its EC2 usage is covered by Savings Plans and how much of its purchased commitment is actually used. The company also wants purchase recommendations based on past usage. Which tools provide this information? (Choose TWO.)',
    options: [
      'AWS Cost Explorer Savings Plans coverage and utilization reports',
      'Amazon CloudWatch Logs Insights',
      'AWS Cost Explorer Savings Plans purchase recommendations',
      'AWS Config conformance packs',
      'AWS Service Catalog',
    ],
    answer: [0, 2],
    explanation:
      'Cost Explorer has coverage reports (how much usage is covered) and utilization reports (how much of the commitment was used), plus Savings Plans purchase recommendations based on past usage. CloudWatch Logs Insights analyzes application logs. Config conformance packs check configuration compliance. Service Catalog manages approved IT products.',
  },
  {
    id: 'cost-025',
    domain: 'cost',
    lesson: 'cost-management-tools',
    stem: 'An AWS Partner resells AWS to several customers and manages their accounts in one organization. The partner needs to present each customer with a bill that reflects custom pricing rates rather than the partner\'s actual AWS invoice. Which service should the partner use?',
    options: [
      'AWS Cost Anomaly Detection',
      'AWS Billing Conductor',
      'AWS Budgets',
      'AWS Cost Explorer forecasting',
    ],
    answer: [1],
    explanation:
      'AWS Billing Conductor creates pro forma bills with custom billing groups and pricing rules, suited to resellers or showback/chargeback, without affecting the real bill. Cost Anomaly Detection detects unusual spend. Budgets tracks thresholds. Cost Explorer forecasting predicts actual cost and does not create bills with custom prices.',
  },
  {
    id: 'cost-026',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'EC2 instances in private subnets process large volumes of data stored in Amazon S3 in the same Region. Traffic flows through a NAT gateway, and NAT gateway data processing charges have become a large part of the monthly bill. What is the MOST cost-effective way to reduce these charges?',
    options: [
      'Replace the NAT gateway with a NAT instance on a larger EC2 instance type',
      'Create an interface VPC endpoint for Amazon S3 in each Availability Zone',
      'Move the EC2 instances to public subnets and assign Elastic IP addresses',
      'Create a gateway VPC endpoint for Amazon S3 and update the private subnet route tables',
    ],
    answer: [3],
    explanation:
      'A gateway VPC endpoint for S3 is free, and traffic to S3 goes through the endpoint instead of NAT, so NAT processing charges disappear. An interface endpoint has hourly and per-GB charges, so it is not as cheap. A NAT instance adds operational effort and has bandwidth limits. Moving to public subnets reduces security and incurs public IPv4 charges.',
  },
  {
    id: 'cost-027',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company serves large video files from an Amazon S3 bucket directly to users around the world. Data transfer out to the internet is the largest item on the bill. Which solution will reduce costs and improve performance?',
    options: [
      'Enable S3 Transfer Acceleration on the bucket',
      'Use AWS Global Accelerator in front of the S3 bucket',
      'Create an Amazon CloudFront distribution with the S3 bucket as the origin',
      'Replicate the bucket to multiple Regions with S3 Cross-Region Replication',
    ],
    answer: [2],
    explanation:
      'CloudFront caches content at the edge, transfer from S3 to CloudFront is free, and CloudFront egress pricing is usually lower than direct egress from S3, while also reducing latency. Transfer Acceleration optimizes uploads and costs extra. Global Accelerator does not cache and has additional charges. Cross-Region Replication incurs replication costs and stores multiple copies.',
  },
  {
    id: 'cost-028',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company runs development and test EC2 instances and Amazon RDS DB instances that are used only from 8 AM to 6 PM on weekdays. The company wants to reduce costs with the LEAST operational overhead. What should a solutions architect do?',
    options: [
      'Deploy Instance Scheduler on AWS and tag the resources with a weekday business-hours schedule',
      'Purchase Reserved Instances for the development and test resources',
      'Move the development and test workloads to Spot Instances',
      'Ask developers to manually stop resources at the end of each day',
    ],
    answer: [0],
    explanation:
      'Instance Scheduler on AWS automatically starts/stops EC2 and RDS on a tag-based schedule, cutting most of the off-hours compute cost with no manual work. RIs are billed 24/7, which wastes money for resources that run only about 50 hours/week. Spot does not apply to RDS and can be interrupted. Manual stopping is easy to forget and takes effort.',
  },
  {
    id: 'cost-029',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company has hundreds of Amazon EBS gp2 volumes. Most are 100 GB volumes attached to application servers that need about 3,000 IOPS. The company wants to reduce storage costs without downtime and without reducing performance. What should a solutions architect do?',
    options: [
      'Change the volumes to st1 by using snapshots and restoring new volumes',
      'Modify the volumes to gp3 by using Elastic Volumes',
      'Change the volumes to io2 Block Express',
      'Move the data to Amazon EFS One Zone',
    ],
    answer: [1],
    explanation:
      'gp3 is cheaper per GB than gp2 and has a baseline of 3,000 IOPS and 125 MB/s regardless of size; a 100 GB gp2 volume has only about 300 IOPS baseline. Elastic Volumes changes the volume type with no downtime. st1 is HDD, unsuitable for random IOPS, and cannot be used as a boot volume. io2 is much more expensive. EFS costs more per GB and requires application changes.',
  },
  {
    id: 'cost-030',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A startup is launching a new mobile app backed by Amazon DynamoDB. Traffic is unpredictable, with long idle periods and occasional sharp spikes. The company wants to pay only for what it uses with no capacity planning. Which configuration should be used?',
    options: [
      'Provisioned capacity with reserved capacity',
      'Provisioned capacity with Auto Scaling set to a high minimum',
      'DynamoDB Standard-IA table class with provisioned capacity',
      'On-demand capacity mode',
    ],
    answer: [3],
    explanation:
      'DynamoDB on-demand is billed per request, needs no capacity planning, and fits unpredictable load with long idle periods. Reserved capacity requires a long-term commitment for steady load. Auto Scaling with a high minimum still pays when idle and reacts slowly to sudden spikes. The Standard-IA table class lowers storage price and does not address the capacity problem.',
  },
  {
    id: 'cost-031',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company runs an internal reporting application backed by an Amazon Aurora PostgreSQL provisioned DB cluster. The database is heavily used for a few hours at the beginning of each month and is mostly idle the rest of the time. The company wants to reduce database costs with minimal changes. What should a solutions architect recommend?',
    options: [
      'Migrate to Aurora Serverless v2 and configure appropriate minimum and maximum ACUs',
      'Purchase Reserved Instances for the current DB instance class',
      'Add Aurora Replicas to handle the monthly peak',
      'Migrate the database to Amazon DynamoDB',
    ],
    answer: [0],
    explanation:
      'Aurora Serverless v2 scales ACUs automatically with load and charges only for the capacity actually used, which suits load concentrated in a few hours each month; changes are minimal since it is still Aurora PostgreSQL. RIs suit steady 24/7 load; here you would still pay for idle time. Adding replicas increases cost. Moving to DynamoDB requires redesigning the application.',
  },
  {
    id: 'cost-032',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company\'s order-processing application uses a fleet of EC2 instances that is sized for peak load, but load is bursty and orders do not need to be processed in real time. The company wants to reduce compute costs. Which actions should a solutions architect take? (Choose TWO.)',
    options: [
      'Place an Amazon SQS queue between the web tier and the processing tier',
      'Increase the instance size of the processing tier to handle peaks faster',
      'Scale the processing Auto Scaling group based on the queue backlog per instance and use Spot Instances for the idempotent workers',
      'Replace the processing tier with Dedicated Hosts',
      'Add an Application Load Balancer in front of the processing tier with sticky sessions',
    ],
    answer: [0, 2],
    explanation:
      'SQS decouples the web and processing tiers, letting workers process at their own pace instead of being provisioned for peak. Scaling on backlog per instance and using Spot for idempotent workers cuts compute cost sharply. Increasing instance size raises cost. Dedicated Hosts are more expensive. An ALB with sticky sessions does not solve provisioning for peak.',
  },
  {
    id: 'cost-033',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'After reviewing the bill, a company notices new charges for public IPv4 addresses on many EC2 instances in public subnets. Most instances only need to be reached by administrators for maintenance and make outbound calls to Amazon S3. Which solution reduces these charges while maintaining access?',
    options: [
      'Allocate Elastic IP addresses to all instances, because in-use Elastic IP addresses are free',
      'Move instances to private subnets, use AWS Systems Manager Session Manager for administration, and use a gateway VPC endpoint for S3',
      'Put all instances behind a Network Load Balancer with a public IP per instance',
      'Use AWS Global Accelerator static IP addresses for each instance',
    ],
    answer: [1],
    explanation:
      'Since February 2024 AWS charges for every public IPv4 address, including attached Elastic IPs. Moving instances to private subnets, administering through Session Manager (no public IP or bastion needed), and accessing S3 through a free gateway endpoint eliminates the public IPs. In-use Elastic IPs are still charged. An NLB with a public IP per instance does not reduce the number of public IPs. Global Accelerator has its own charges and is unnecessary.',
  },
  {
    id: 'cost-034',
    domain: 'cost',
    lesson: 'cost-optimized-architectures',
    stem: 'A company runs an AWS Lambda function that performs CPU-intensive image processing. The function is configured with 128 MB of memory and often runs for close to its timeout. A solutions architect wants to reduce cost and duration. What should the solutions architect do FIRST?',
    options: [
      'Move the function to EC2 On-Demand Instances',
      'Increase the function timeout to the maximum of 15 minutes',
      'Test the function with higher memory settings, for example with AWS Lambda Power Tuning, and choose the configuration with the lowest cost',
      'Enable provisioned concurrency for the function',
    ],
    answer: [2],
    explanation:
      'Lambda allocates CPU in proportion to memory; raising memory for a CPU-intensive task usually cuts run time sharply and can lower the total cost. Lambda Power Tuning helps find the optimal configuration. Moving to EC2 adds operational effort and is not necessarily cheaper. Increasing the timeout only extends billed time. Provisioned concurrency reduces cold starts but increases cost.',
  },
  {
    id: 'cost-035',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'A data analytics team runs ad hoc SQL queries with Amazon Athena on several terabytes of CSV log files stored in Amazon S3. Most queries filter by date. Athena costs are increasing. Which actions will MOST reduce query costs? (Choose TWO.)',
    options: [
      'Convert the data to compressed Apache Parquet format',
      'Move the data to S3 Glacier Flexible Retrieval',
      'Load the data into an Amazon RDS for PostgreSQL database',
      'Enable S3 Transfer Acceleration on the bucket',
      'Partition the data by date and include the partition key in query filters',
    ],
    answer: [0, 4],
    explanation:
      'Athena is billed by data scanned. Compressed columnar Parquet reads only the needed columns, and partitioning by date skips irrelevant data; both sharply reduce data scanned. Athena cannot query objects in Glacier Flexible Retrieval directly. RDS for several TB of logs costs more and takes more operational effort. Transfer Acceleration is unrelated to queries.',
  },
  {
    id: 'cost-036',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'A marketing team runs data warehouse queries a few times each week at unpredictable times. Between queries, the warehouse is idle. The team wants to minimize cost without managing cluster capacity. Which solution should a solutions architect recommend?',
    options: [
      'An Amazon Redshift provisioned cluster with 3-year reserved nodes',
      'Amazon Redshift Serverless',
      'An Amazon RDS for MySQL Multi-AZ DB instance',
      'An Amazon EMR cluster running continuously',
    ],
    answer: [1],
    explanation:
      'Redshift Serverless scales automatically and charges for compute only while queries run, which suits sporadic load and requires no cluster management. A provisioned cluster with reserved nodes is billed continuously, even when idle. RDS MySQL is not a data warehouse. EMR running continuously costs more and takes much operational effort.',
  },
  {
    id: 'cost-037',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'An application on Amazon RDS for MySQL is experiencing high CPU utilization caused by the same product catalog queries being executed repeatedly. The company is considering scaling to a much larger DB instance class. Which solution is MOST cost-effective?',
    options: [
      'Scale the DB instance to the largest available instance class',
      'Convert the database to Multi-AZ',
      'Migrate the database to Amazon Aurora with provisioned IOPS',
      'Add an Amazon ElastiCache cluster to cache frequently read query results',
    ],
    answer: [3],
    explanation:
      'ElastiCache caches repeated read query results, reducing CPU load on RDS and often allowing a smaller, cheaper DB instead of scaling the DB up very large. Scaling the instance class costs much more. Multi-AZ increases availability but does not reduce read load (the standby does not serve reads). Migrating to Aurora takes effort and does not solve the repeated-query problem.',
  },
  {
    id: 'cost-038',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'A company needs to migrate 500 TB of archived data from its on-premises data center to Amazon S3. The data center has a 100 Mbps internet connection that is already heavily used. The migration must be completed within 1 month. Which solution is MOST cost-effective?',
    options: [
      'Order AWS Snowball Edge devices to transfer the data offline',
      'Set up an AWS Direct Connect connection and use AWS DataSync',
      'Use AWS DataSync over the existing internet connection',
      'Use S3 Transfer Acceleration over the existing internet connection',
    ],
    answer: [0],
    explanation:
      '500 TB over a 100 Mbps link takes more than a year even using the full bandwidth, so it must be moved offline with Snowball Edge. Direct Connect takes several weeks to set up, has fixed fees, and still could not finish in 1 month. DataSync or Transfer Acceleration over the existing link is limited by bandwidth.',
  },
  {
    id: 'cost-039',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'A company runs a genomics pipeline that processes 50 TB of input data stored in Amazon S3 for about 6 hours each week. The pipeline needs a high-performance parallel file system during processing, and results are written back to S3. Which storage solution is MOST cost-effective?',
    options: [
      'Amazon FSx for Lustre persistent file system kept running all week',
      'Amazon EFS with Max I/O performance mode',
      'Amazon FSx for Lustre scratch file system linked to the S3 bucket, created for each run and deleted afterward',
      'Amazon EBS io2 volumes attached to each compute instance',
    ],
    answer: [2],
    explanation:
      'FSx for Lustre scratch is cheap and high-performance for temporary processing, links to S3 as a data repository, and can be created/deleted for each run so you pay only while in use. Persistent running all week charges continuously for 50 TB. EFS does not reach Lustre\'s HPC performance and costs more per GB. EBS io2 is very expensive and is not a shared file system.',
  },
  {
    id: 'cost-040',
    domain: 'cost',
    lesson: 'cost-database-storage-choices',
    stem: 'A company stores 200 TB of rarely accessed engineering documents on an Amazon FSx for Windows File Server SSD file system. Users tolerate higher latency, and many files are duplicates. The company wants to reduce costs while continuing to use SMB access with Active Directory integration. Which actions should a solutions architect take? (Choose TWO.)',
    options: [
      'Migrate the data to Amazon EFS',
      'Migrate to an FSx for Windows File Server file system with HDD storage',
      'Enable data deduplication on the file system',
      'Store the data on Amazon EBS gp3 volumes attached to a Windows EC2 instance',
      'Move the data to FSx for Lustre',
    ],
    answer: [1, 2],
    explanation:
      'FSx for Windows File Server HDD storage is cheaper than SSD for infrequently accessed file shares, and data deduplication reduces stored capacity when there are many duplicate files; SMB and Active Directory integration are preserved. EFS is NFS and does not support SMB for Windows. Self-managing EBS on EC2 adds operational effort and loses managed features. FSx for Lustre is for HPC on Linux, not SMB.',
  },
  {
    id: 'cost-041',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A company is building an image-thumbnail API. The API receives a few hundred requests per day in unpredictable bursts and is idle most of the time. Each request completes in less than 2 seconds. Which compute option is the MOST cost-effective?',
    options: [
      'Amazon EC2 On-Demand Instances behind an Application Load Balancer',
      'AWS Lambda functions invoked through Amazon API Gateway',
      'An Amazon ECS service on AWS Fargate with two tasks running at all times',
      'Amazon EC2 instances covered by a 1-year Reserved Instance',
    ],
    answer: [1],
    explanation:
      'Sparse, bursty traffic that is idle most of the time with short requests is the textbook case for Lambda + API Gateway: you pay only per request and duration, nothing while idle. EC2 On-Demand and an always-on Fargate service both pay during idle time. A 1-year Reserved Instance commits to an instance that is barely used, which is wasteful.',
  },
  {
    id: 'cost-042',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A company runs a business-critical containerized application on Amazon ECS with AWS Fargate 24 hours a day. The usage is steady and the tasks must not be interrupted. Over the next year, the company plans to move some components to AWS Lambda and others to Amazon EC2. Which purchasing option will provide the MOST cost savings for this usage?',
    options: [
      'Purchase an EC2 Instance Savings Plan for the current Region',
      'Purchase Standard Reserved Instances for the instance family the company plans to use',
      'Move all tasks to Fargate Spot',
      'Purchase a 1-year Compute Savings Plan',
    ],
    answer: [3],
    explanation:
      'Compute Savings Plans apply automatically to Fargate, Lambda and EC2, so the discount stays as workloads move between compute types. EC2 Instance Savings Plans and Reserved Instances apply only to EC2 and do not discount Fargate/Lambda. Fargate Spot can be reclaimed with a 2-minute warning, which is not acceptable for an application that must not be interrupted.',
  },
  {
    id: 'cost-043',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A company runs an Amazon ECS service on AWS Fargate. The tasks process messages from an Amazon SQS queue and are idempotent. At least two tasks must always be running, but any additional tasks can be interrupted. The company wants to reduce compute costs. What should a solutions architect do?',
    options: [
      'Configure a capacity provider strategy with FARGATE as base 2 and weight 1, and FARGATE_SPOT with weight 3',
      'Run all tasks on the FARGATE_SPOT capacity provider',
      'Migrate the tasks to Amazon EC2 Dedicated Instances',
      'Run all tasks on the FARGATE capacity provider and purchase an EC2 Instance Savings Plan',
    ],
    answer: [0],
    explanation:
      'A capacity provider strategy lets you keep a base of 2 tasks on FARGATE (never reclaimed) and split the rest by weight, mostly onto the much cheaper FARGATE_SPOT. Running everything on Fargate Spot could lose both required tasks during reclamation. Dedicated Instances cost more and are unnecessary. EC2 Instance Savings Plans do not apply to Fargate.',
  },
  {
    id: 'cost-044',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A research company runs thousands of containerized simulation jobs each week by using AWS Batch with an On-Demand compute environment. The jobs can be retried if they fail, and they have no strict completion deadline. The company wants to reduce costs with the LEAST operational overhead. Which solution meets these requirements?',
    options: [
      'Purchase Reserved Instances for the largest instance type that the jobs use',
      'Replace AWS Batch with a self-managed fleet of EC2 Spot Instances and a custom scheduler',
      'Create an AWS Batch Spot compute environment with multiple instance types and the SPOT_PRICE_CAPACITY_OPTIMIZED allocation strategy, and configure a job retry strategy',
      'Move the jobs to AWS Lambda functions',
    ],
    answer: [2],
    explanation:
      'AWS Batch supports a Spot compute environment with the SPOT_PRICE_CAPACITY_OPTIMIZED allocation strategy, multiple instance types for pool diversity, and a retry strategy to rerun interrupted jobs, so it is cheap with little operations work. Reserved Instances do not fit weekly fluctuating batch load. A self-built scheduler adds operational overhead. Lambda is limited to 15 minutes and does not suit long simulations.',
  },
  {
    id: 'cost-045',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A company runs long image-processing jobs on Amazon EC2 Spot Instances. When an instance is interrupted, all work in progress is lost and the job must restart from the beginning. The company wants to keep using Spot Instances. Which actions will improve resilience to interruptions MOST cost-effectively? (Choose TWO.)',
    options: [
      'Pull work items from an Amazon SQS queue and delete each message only after processing completes',
      'Replace the Spot Instances with Reserved Instances',
      'Store intermediate results on instance store volumes',
      'Periodically checkpoint job progress to Amazon S3 and resume from the latest checkpoint',
      'Increase the maximum Spot price to the On-Demand price',
    ],
    answer: [0, 3],
    explanation:
      'Pulling work from SQS and deleting the message only on completion lets the message reappear after the visibility timeout for another worker if the instance is reclaimed; checkpointing to S3 lets the job resume from the latest point instead of restarting. Reserved Instances give up the Spot price benefit. Instance store data is lost when the instance terminates. Raising the max price does not prevent interruptions, which happen mainly because AWS needs the capacity back.',
  },
  {
    id: 'cost-046',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'An AWS Lambda function is configured with 128 MB of memory. The function is CPU-bound and runs for about 9 seconds per invocation, millions of times each month. The code has no architecture-specific dependencies. A solutions architect needs to reduce the cost of the function. What should the solutions architect do?',
    options: [
      'Reduce the function timeout to 5 seconds',
      'Test the function at several memory settings with AWS Lambda Power Tuning, choose the lowest-cost setting, and switch the function to the arm64 architecture',
      'Configure provisioned concurrency for the function',
      'Move the function to an Amazon EC2 On-Demand Instance',
    ],
    answer: [1],
    explanation:
      'Lambda CPU scales with memory, so a CPU-bound function at 128 MB runs long; more memory can cut duration enough to lower total cost, and Lambda Power Tuning finds the cheapest setting. arm64 (Graviton) has a lower price per GB-second than x86. A shorter timeout makes the function fail midway. Provisioned concurrency adds cost and only reduces cold starts. Moving to EC2 adds operations and is not necessarily cheaper.',
  },
  {
    id: 'cost-047',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'An AWS Lambda function submits a report-generation job to a third-party API and then polls the API every 30 seconds until the job finishes, which takes up to 10 minutes. Most of the function duration is spent waiting. Which solution will reduce costs the MOST?',
    options: [
      'Increase the memory of the function so that each poll completes faster',
      'Configure provisioned concurrency for the function',
      'Use an AWS Step Functions Standard workflow with a Wait state to loop, and invoke a short Lambda function only to check the job status',
      'Run the polling loop in a Lambda function that uses the arm64 architecture',
    ],
    answer: [2],
    explanation:
      'Lambda bills duration even while just waiting. A Step Functions Standard workflow is billed per state transition and a Wait state uses no compute, so you pay only for short Lambda invocations that check the status. More memory costs more when the time is mostly waiting. Provisioned concurrency adds a fee. arm64 lowers the unit price but still pays for all the waiting time.',
  },
  {
    id: 'cost-048',
    domain: 'cost',
    lesson: 'cost-compute-serverless-containers',
    stem: 'A company runs development and test environments on Amazon EC2 Auto Scaling groups and Amazon ECS services. The environments run 24 hours a day, but developers use them only from 8 AM to 6 PM on weekdays. Which solution is the MOST cost-effective?',
    options: [
      'Purchase 3-year Reserved Instances for the development instances',
      'Move the environments to Dedicated Instances',
      'Purchase a Compute Savings Plan that covers the current 24/7 usage',
      'Use scheduled actions to set the Auto Scaling groups desired capacity and the ECS services desired count to 0 outside business hours',
    ],
    answer: [3],
    explanation:
      'The environments are used about 50 of 168 hours a week, so turning them off after hours (scheduled actions setting the ASG and ECS service to 0) saves the most. Reserved Instances and Savings Plans commit you to paying for hours that are not used. Dedicated Instances cost more.',
  },
  {
    id: 'cost-049',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'Amazon EC2 instances in private subnets download several terabytes of data each day from an Amazon S3 bucket in the same AWS Region. The traffic goes through a NAT gateway, and NAT gateway data processing charges are high. Which solution will reduce these costs MOST cost-effectively?',
    options: [
      'Create a gateway VPC endpoint for Amazon S3 and add it to the private subnet route tables',
      'Create an interface VPC endpoint for Amazon S3 in each Availability Zone',
      'Replace the NAT gateway with a larger NAT instance',
      'Enable S3 Transfer Acceleration on the bucket',
    ],
    answer: [0],
    explanation:
      'A gateway VPC endpoint for S3 is free and only needs a route table entry, so S3 traffic no longer goes through NAT. An interface endpoint for S3 also avoids NAT but has hourly per-AZ and per-GB fees. A NAT instance adds operational work and still costs money. Transfer Acceleration improves speed and adds a fee; it does not reduce cost.',
  },
  {
    id: 'cost-050',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A production VPC spans three Availability Zones. All private subnets route internet-bound traffic to a single NAT gateway in the first Availability Zone. The company sees significant inter-AZ data transfer charges and is concerned about availability if that Availability Zone fails. Which solution addresses both concerns?',
    options: [
      'Move all instances into the Availability Zone that contains the NAT gateway',
      'Remove the NAT gateway and assign public IPv4 addresses to all instances',
      'Deploy a NAT gateway in each Availability Zone and route each private subnet to the NAT gateway in the same Availability Zone',
      'Add a second NAT gateway in the same Availability Zone as the first one',
    ],
    answer: [2],
    explanation:
      'One NAT gateway per AZ, with each subnet routed to the NAT in its own AZ, removes cross-AZ charges and the single point of failure. Moving everything into one AZ loses high availability. Assigning public IPv4 addresses to every instance adds public IPv4 charges and exposes the instances. A second NAT in the same AZ solves neither problem.',
  },
  {
    id: 'cost-051',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A company serves large video files directly from an Amazon S3 bucket to users worldwide. Data transfer out costs are high. Most users are in North America and Europe, and slightly higher latency for users in other regions is acceptable. Which solution is the MOST cost-effective?',
    options: [
      'Enable S3 Transfer Acceleration on the bucket',
      'Serve the files through an Amazon CloudFront distribution with the S3 bucket as the origin and use Price Class 100',
      'Use S3 Cross-Region Replication to copy the files to buckets in several Regions',
      'Use AWS Global Accelerator in front of the S3 bucket',
    ],
    answer: [1],
    explanation:
      'With CloudFront, data from the S3 origin to CloudFront is free, caching reduces origin requests, and Price Class 100 uses only edges in the cheapest areas (North America, Europe), which fits where the users are. Transfer Acceleration and Global Accelerator improve speed but add fees. Cross-Region Replication adds inter-Region and duplicate storage charges and still pays egress.',
  },
  {
    id: 'cost-052',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A company sends about 50 TB of data each month from AWS to its on-premises data center over an AWS Site-to-Site VPN connection. The transfer volume is steady and expected to grow. The company wants to reduce data transfer costs and get more consistent network performance. Which solution meets these requirements?',
    options: [
      'Add more VPN tunnels and use equal-cost multi-path routing',
      'Enable S3 Transfer Acceleration for the data',
      'Attach the VPN connection to a transit gateway',
      'Set up an AWS Direct Connect connection',
    ],
    answer: [3],
    explanation:
      'Direct Connect has an hourly port fee but a lower data transfer out rate than the internet, so for large, steady volumes the total cost is lower, with consistent bandwidth. VPN egress is billed at internet rates; more tunnels do not lower the rate. Transfer Acceleration adds a fee. Transit Gateway adds attachment and processing fees without reducing egress.',
  },
  {
    id: 'cost-053',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'An application runs on Amazon ECS with AWS Fargate in private subnets. The tasks frequently pull large container images from Amazon ECR and send logs to Amazon CloudWatch Logs. All traffic goes through NAT gateways, and NAT gateway data processing charges are high. Which actions will reduce these charges? (Choose TWO.)',
    options: [
      'Move the tasks to public subnets and assign public IP addresses',
      'Create a gateway VPC endpoint for Amazon S3',
      'Create interface VPC endpoints for Amazon ECR (ecr.api and ecr.dkr) and CloudWatch Logs',
      'Enable S3 Transfer Acceleration',
      'Deploy an additional NAT gateway in each Availability Zone',
    ],
    answer: [1, 2],
    explanation:
      'ECR images involve the API (ecr.api), the registry (ecr.dkr) and layers stored in S3: interface endpoints for ECR and CloudWatch Logs plus a free S3 gateway endpoint take the traffic off NAT; interface endpoint processing costs less than NAT. Public subnets with public IPs add public IPv4 charges and weaken security. Transfer Acceleration is irrelevant. More NAT gateways do not lower the per-GB processing fee.',
  },
  {
    id: 'cost-054',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A company connects dozens of VPCs in one AWS Region through a transit gateway. Two of the VPCs exchange many terabytes of data each month between application tiers. Cost Explorer shows high transit gateway data processing charges for this traffic. Which solution will reduce costs with the LEAST effort?',
    options: [
      'Create a VPC peering connection between the two VPCs and update their route tables to send traffic to each other over the peering connection',
      'Create a Site-to-Site VPN connection between the two VPCs',
      'Create a second transit gateway for the two VPCs',
      'Route the traffic between the two VPCs through internet gateways by using public IP addresses',
    ],
    answer: [0],
    explanation:
      'VPC peering has no hourly fee and no per-GB processing fee (same-AZ traffic is free), so adding a dedicated peering for the high-volume pair cuts transit gateway charges while other VPCs stay on the TGW. A VPN between VPCs costs money and adds complexity. A second transit gateway still has attachment and processing fees. Going over the internet adds public IPv4 and egress charges and is less secure.',
  },
  {
    id: 'cost-055',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A company runs a self-managed Apache Kafka cluster on Amazon EC2 instances across three Availability Zones, together with many producer and consumer applications. Inter-AZ data transfer charges have grown sharply. A solutions architect needs to identify which source and destination instances generate the cross-AZ traffic. What should the solutions architect do?',
    options: [
      'Review the AWS Trusted Advisor cost optimization checks',
      'Review AWS Compute Optimizer recommendations for the instances',
      'Use Amazon S3 Storage Lens to analyze the traffic',
      'Enable VPC Flow Logs and query them with Amazon Athena, together with Cost Explorer filtered by the inter-AZ data transfer usage type',
    ],
    answer: [3],
    explanation:
      'VPC Flow Logs record source/destination IP pairs and bytes; querying them with Athena shows which instances send traffic to other AZs, and Cost Explorer by usage type (DataTransfer-Regional-Bytes) confirms the inter-AZ cost. Trusted Advisor and Compute Optimizer do not analyze network flows. S3 Storage Lens is only for S3.',
  },
  {
    id: 'cost-056',
    domain: 'cost',
    lesson: 'cost-network-transfer',
    stem: 'A company uses a Network Load Balancer with cross-zone load balancing enabled across three Availability Zones. The targets are evenly distributed, with the same number of targets in each Availability Zone, and clients are spread evenly across the zones. The company notices high regional data transfer charges. Which change will reduce costs without reducing availability?',
    options: [
      'Replace the Network Load Balancer with AWS Global Accelerator',
      'Move all targets into a single Availability Zone',
      'Turn off cross-zone load balancing on the Network Load Balancer',
      'Add more targets in each Availability Zone',
    ],
    answer: [2],
    explanation:
      'With an NLB, enabling cross-zone load balancing means traffic to targets in other AZs is billed as inter-AZ transfer. Since targets are already evenly spread per AZ, turning cross-zone off keeps traffic within the AZ while staying balanced and multi-AZ. Global Accelerator adds cost. Putting all targets in one AZ loses HA. More targets do not reduce cross-AZ charges.',
  },
];
