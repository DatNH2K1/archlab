import type { Lesson } from '@/content/types';

export const costLessonsEn: Lesson[] = [
  {
    slug: 'ec2-pricing-models',
    domain: 'cost',
    title: 'EC2 pricing models: On-Demand, RI, Savings Plans, Spot, Dedicated',
    summary:
      'Choosing the right EC2 purchase model is the biggest saving on the exam: Savings Plans/RI for steady workloads, Spot for interruption-tolerant workloads, Dedicated Host for BYOL licenses.',
    services: [
      'Amazon EC2',
      'Savings Plans',
      'Reserved Instances',
      'Spot Instances',
      'EC2 Auto Scaling',
      'AWS Compute Optimizer',
      'AWS Graviton',
    ],
    minutes: 12,
    body: `## Overview

The SAA-C03 exam almost always has questions like "workload runs 24/7 for 3 years", "batch job that can be interrupted", "software license is per socket/core". Each of these phrases points straight to one pricing model. Learn them as pairs of **workload characteristic → pricing model**.

## On-Demand

- Pay per second (Linux/Windows, 60-second minimum) or per hour for some other OSes.
- No commitment, no upfront payment, highest price.
- Fits: short-term workloads, unpredictable workloads, test environments, and usage "above" the committed baseline.

## Reserved Instances (RI)

- Commit for **1 year or 3 years**; payment options All Upfront / Partial Upfront / No Upfront (the more you pay upfront, the deeper the discount).
- **Standard RI**: discount up to about 72%. You can change the AZ and the size within the same family (Linux, regional RI), but you **cannot change the instance family, OS, or tenancy**. It can be resold on the **Reserved Instance Marketplace**.
- **Convertible RI**: smaller discount than Standard, but you **can change family, OS, and tenancy** (exchange for an RI of equal or higher value). It cannot be sold on the Marketplace.
- **Regional RI** applies the discount to every AZ in the Region but **does not reserve capacity**. **Zonal RI** is tied to one AZ and **does reserve capacity**.
- RIs also exist for RDS, ElastiCache, OpenSearch, Redshift (reserved nodes), and DynamoDB (reserved capacity).

## Savings Plans

Commit to an **hourly spend amount** (for example, X USD/hour) for 1 or 3 years.

| Type | Discount up to | Applies to | Flexibility |
|---|---|---|---|
| Compute Savings Plans | ~66% | EC2 (any family, size, OS, tenancy, Region), AWS Fargate, AWS Lambda | Highest |
| EC2 Instance Savings Plans | ~72% | One instance family in one Region (e.g. M7g in us-east-1) | Change size, OS, tenancy within the family |
| SageMaker Savings Plans | (lower than Compute SP) | SageMaker AI instance usage | Any SageMaker instance family/Region |

- Need to change Region, move from EC2 to Fargate/Lambda, or unsure about the family → **Compute Savings Plans**.
- Certain to use one family in one Region and want the deepest discount → **EC2 Instance Savings Plans** (or Standard RI).
- AWS recommends Savings Plans over RIs for EC2 because they require less management.

## Spot Instances

- Use spare AWS capacity, **up to 90% cheaper** than On-Demand.
- Can be reclaimed when AWS needs the capacity back, with a **2-minute warning** (via instance metadata and the EventBridge event "EC2 Spot Instance Interruption Warning"). There is also an **EC2 Instance Rebalance Recommendation** that signals early when an instance is at elevated risk of reclamation.
- Behavior on interruption: terminate (default), stop, or hibernate.
- Fits: batch processing, big data, CI/CD, rendering, HPC, fault-tolerant stateless web, container workers. Does **not** fit: primary databases, jobs that must finish by a hard deadline without checkpointing.

### Spot Fleet and Auto Scaling mixed instances

- **Spot Fleet / EC2 Fleet**: a collection of Spot (and optionally On-Demand) to reach a target capacity. Allocation strategies: lowestPrice, diversified, capacityOptimized, **priceCapacityOptimized** (recommended: prefers pools with low interruption but low price).
- **Auto Scaling group with a mixed instances policy**: set an **On-Demand base capacity** (e.g. 2 instances always On-Demand), the rest split by an On-Demand/Spot ratio, and declare multiple instance types to diversify pools. This is the typical answer for "keep a stable baseline but optimize cost for the extra load".
- Capacity Rebalancing in an ASG proactively replaces Spot instances that are about to be reclaimed.

## Dedicated Hosts vs Dedicated Instances

| Criterion | Dedicated Host | Dedicated Instance |
|---|---|---|
| Hardware dedicated to your account | Yes | Yes |
| See sockets, cores, host ID | Yes | No |
| BYOL per socket/core/VM (Windows Server, SQL Server, Oracle) | Yes (standard answer) | Not suitable |
| Control over instance placement on the host (host affinity) | Yes | No |
| Billing | Per host | Per instance + per-Region fee |

- Keywords "server-bound software licenses", "compliance requires dedicated physical hardware and license tracking" → **Dedicated Host**.
- If you only need "no hardware shared with other accounts" → Dedicated Instance is enough and usually cheaper.
- Dedicated Hosts also come with On-Demand and Reservation (discounts similar to RI).

## On-Demand Capacity Reservations

- Reserve capacity in **one specific AZ**, with no term commitment, cancel anytime.
- You are charged the On-Demand rate **whether or not you run instances**.
- Combine with **Regional RI or Savings Plans** to get both capacity and a discount.
- A common exam question: "need guaranteed capacity for a short event (e.g. Black Friday) in one AZ" → Capacity Reservation (not a 1-year RI).

## Graviton and right-sizing

- **AWS Graviton** (ARM): up to about 40% better price/performance than same-generation x86; usable for EC2, Lambda (arm64), Fargate, RDS, Aurora, ElastiCache, OpenSearch. The application must be ARM-compatible.
- **AWS Compute Optimizer**: uses machine learning on CloudWatch metrics to recommend right-sizing for EC2, Auto Scaling groups, EBS volumes, Lambda, ECS on Fargate, RDS. Memory metrics require the **CloudWatch agent**.
- Right-size **first**, then buy Savings Plans/RI, so you do not commit to excess resources.

## Quick decision tree

- Steady 24/7, known for 1–3 years → Savings Plans / RI.
- Can be interrupted, flexible timing → Spot.
- Short-term, unpredictable → On-Demand.
- Need guaranteed capacity in an AZ → Capacity Reservation (or Zonal RI).
- License per core/socket → Dedicated Host.
- Baseline + spike → ASG mixed instances (On-Demand/SP for the base, Spot for the extra load).`,
    keywords: [
      { trigger: 'steady-state workload for 1 or 3 years', answer: 'Savings Plans or Reserved Instances' },
      { trigger: 'can change instance family, Region, or move to Fargate/Lambda', answer: 'Compute Savings Plans' },
      { trigger: 'fault-tolerant, can be interrupted, flexible start time', answer: 'Spot Instances' },
      { trigger: 'bring your own license per socket/per core', answer: 'Dedicated Hosts' },
      { trigger: 'guarantee capacity in a specific AZ for a short event', answer: 'On-Demand Capacity Reservation' },
      { trigger: 'baseline must always run, burst should be cheap', answer: 'Auto Scaling mixed instances policy (On-Demand base + Spot)' },
      { trigger: 'need to change instance family during the term with an RI', answer: 'Convertible Reserved Instances' },
      { trigger: 'over-provisioned instances, recommend right size', answer: 'AWS Compute Optimizer' },
      { trigger: 'better price performance, ARM-compatible app', answer: 'AWS Graviton instances' },
    ],
    traps: [
      'Spot is not for primary databases or jobs that cannot tolerate interruption, even though it is the cheapest.',
      'Regional RIs and Savings Plans do NOT reserve capacity; to guarantee capacity you must use a Zonal RI or a Capacity Reservation.',
      'Standard RI cannot change the instance family; if the question says "can change family", choose Convertible RI or Compute Savings Plans.',
      'Dedicated Instance does not expose sockets/cores, so it does not meet per-socket BYOL; you must choose Dedicated Host.',
      'A Capacity Reservation is billed even when no instance is running.',
      'EC2 Instance Savings Plans do not apply to Fargate or Lambda; only Compute Savings Plans do.',
    ],
  },
  {
    slug: 's3-storage-classes',
    domain: 'cost',
    title: 'S3 Storage Classes, Lifecycle, and S3 cost analysis tools',
    summary:
      'Choose a storage class by access frequency and retrieval time, transition automatically with lifecycle rules or Intelligent-Tiering, and watch the minimum storage duration and retrieval fees.',
    services: [
      'Amazon S3',
      'S3 Intelligent-Tiering',
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Flexible Retrieval',
      'S3 Glacier Deep Archive',
      'S3 Storage Lens',
      'S3 Inventory',
    ],
    minutes: 12,
    body: `## General principles

- Every storage class has **99.999999999% durability (11 nines)**. They differ in **availability, number of AZs, storage price, retrieval fee, minimum storage duration, and retrieval time**.
- The cheaper the storage, the more expensive/slower the retrieval and the longer the minimum storage duration.
- Deleting an object before the minimum storage duration still incurs charges for the full duration.

## Storage classes

### S3 Standard
- Frequently accessed data, millisecond latency, at least 3 AZs, no retrieval fee, no minimum storage duration.

### S3 Intelligent-Tiering
- Automatically moves objects between tiers based on access patterns: Frequent Access → Infrequent Access (after 30 days without access) → Archive Instant Access (after 90 days). You can also enable Archive Access and Deep Archive Access (optional, not instant retrieval).
- **No retrieval fee**, no minimum storage duration; there is a **small per-object monitoring fee**. Objects smaller than 128 KB are not monitored and are always charged at the Frequent tier rate.
- The standard answer when the question says **"unknown or changing access patterns"**.

### S3 Standard-IA
- Infrequently accessed but needs immediate (millisecond) retrieval. Multiple AZs, 99.9% availability.
- Minimum **30 days**, minimum billable size 128 KB/object, **per-GB retrieval fee**.

### S3 One Zone-IA
- Like Standard-IA but only **1 AZ**, about 20% cheaper, 99.5% availability.
- Use for **re-creatable** data or secondary copies (e.g. cross-Region replicas, regenerable thumbnails). Losing the AZ means losing the data.

### S3 Glacier Instant Retrieval
- Long-lived archive data accessed about **once a quarter**, but must be retrieved in **milliseconds** when needed (e.g. medical images, archived news).
- Minimum **90 days**, higher retrieval fee than Standard-IA but cheaper storage.

### S3 Glacier Flexible Retrieval
- Archive, accessed 1–2 times a year, no need for immediate retrieval. Minimum **90 days**.
- Retrieval options: **Expedited 1–5 minutes**, **Standard 3–5 hours**, **Bulk 5–12 hours** (Bulk retrieval is free). You can buy Provisioned capacity to guarantee Expedited.

### S3 Glacier Deep Archive
- Cheapest, for data kept 7–10 years for compliance. Minimum **180 days**.
- Standard **within 12 hours**, Bulk **within 48 hours**. No Expedited.

## Comparison table

| Class | Availability (design) | AZs | Minimum storage duration | Retrieval fee | Retrieval time |
|---|---|---|---|---|---|
| Standard | 99.99% | ≥3 | None | None | milliseconds |
| Intelligent-Tiering | 99.9% | ≥3 | None | None (monitoring fee applies) | milliseconds (except optional Archive tiers) |
| Standard-IA | 99.9% | ≥3 | 30 days | Yes | milliseconds |
| One Zone-IA | 99.5% | 1 | 30 days | Yes | milliseconds |
| Glacier Instant Retrieval | 99.9% | ≥3 | 90 days | Yes | milliseconds |
| Glacier Flexible Retrieval | 99.99% | ≥3 | 90 days | Yes (Bulk is free) | 1–5 minutes / 3–5 hours / 5–12 hours |
| Glacier Deep Archive | 99.99% | ≥3 | 180 days | Yes | within 12 hours / within 48 hours |

## Lifecycle rules

- **Transition actions**: move objects to a cheaper class N days after creation (e.g. Standard → Standard-IA after 30 days → Glacier Flexible Retrieval after 90 days → Deep Archive after 365 days).
- **Expiration actions**: automatically delete objects after N days (e.g. delete logs after 1 year).
- Apply by prefix or tag; there are separate rules for **noncurrent versions** when Versioning is enabled (often forgotten, causing the bucket to bloat).
- The **AbortIncompleteMultipartUpload** rule cleans up unfinished upload parts (which still incur storage charges).
- Constraint: objects must stay in Standard for at least 30 days before lifecycle can transition them to Standard-IA or One Zone-IA. By default, objects smaller than 128 KB are not transitioned because it is not cost-effective.
- **Storage Class Analysis** observes access patterns to suggest when to move data to Standard-IA.

## Other tools

- **S3 Storage Lens**: organization/account/bucket-level dashboard for storage, activity, and recommendations for cost optimization and data protection (e.g. buckets with many noncurrent versions, incomplete multipart uploads). Has free metrics and advanced metrics (paid).
- **S3 Inventory**: exports a list of objects and metadata (storage class, encryption, replication status) daily/weekly to CSV, ORC, or Parquet; query with Athena. Replaces calling the LIST API on billions of objects.
- **Requester Pays**: the requester pays for requests and data transfer, and the bucket owner pays only for storage. The requester must be authenticated (not anonymous). Use when sharing large datasets with partners/external parties.
- **S3 Batch Operations**: change the storage class in bulk for existing objects (combine with S3 Inventory).

## Exam tips

- "Unpredictable access" → Intelligent-Tiering.
- "Infrequent access but needed immediately when accessed, important data" → Standard-IA.
- "Infrequent access, re-creatable" → One Zone-IA.
- "Archive, accessed a few times a year, needs milliseconds" → Glacier Instant Retrieval.
- "Retrieval in a few hours is fine" → Glacier Flexible Retrieval; "within 12–48 hours, cheapest" → Deep Archive.`,
    keywords: [
      { trigger: 'unknown or changing access patterns', answer: 'S3 Intelligent-Tiering' },
      { trigger: 'infrequently accessed but requires millisecond access, must survive AZ loss', answer: 'S3 Standard-IA' },
      { trigger: 'infrequently accessed and easily reproducible data', answer: 'S3 One Zone-IA' },
      { trigger: 'archive accessed once a quarter, retrieval in milliseconds', answer: 'S3 Glacier Instant Retrieval' },
      { trigger: 'retrieve archive within minutes occasionally', answer: 'Glacier Flexible Retrieval with Expedited retrieval' },
      { trigger: 'retain 7–10 years for compliance, retrieval within 48 hours acceptable', answer: 'S3 Glacier Deep Archive' },
      { trigger: 'organization-wide visibility into S3 usage and cost recommendations', answer: 'S3 Storage Lens' },
      { trigger: 'share large dataset, consumers pay for download', answer: 'S3 Requester Pays' },
      { trigger: 'list billions of objects and their storage class daily', answer: 'S3 Inventory' },
    ],
    traps: [
      'One Zone-IA lives in only 1 AZ; do not use it for the only copy of data that cannot be re-created.',
      'Standard-IA and Glacier have retrieval fees; data that is read frequently and left in IA can cost more than Standard.',
      'Glacier Deep Archive has no Expedited retrieval; if the data is needed within minutes, Deep Archive is wrong.',
      'Deleting or transitioning objects before the minimum storage duration (30/90/180 days) is still charged in full.',
      'Intelligent-Tiering has no retrieval fee but has a per-object monitoring fee; with billions of very small objects it does not pay off.',
      'Enabling Versioning without a lifecycle rule for noncurrent versions makes costs grow silently.',
    ],
  },
  {
    slug: 'cost-management-tools',
    domain: 'cost',
    title: 'Cost management tools: Cost Explorer, Budgets, CUR, Tags, Anomaly Detection',
    summary:
      'Know which tool to use to view, forecast, alert on, allocate, and automatically react to AWS costs; the exam usually asks you to pick the right tool with the least operational effort.',
    services: [
      'AWS Cost Explorer',
      'AWS Budgets',
      'AWS Cost and Usage Report',
      'AWS Data Exports',
      'AWS Cost Anomaly Detection',
      'AWS Trusted Advisor',
      'AWS Compute Optimizer',
      'AWS Pricing Calculator',
      'AWS Organizations',
      'AWS Billing Conductor',
    ],
    minutes: 10,
    body: `## Tool map

| Need | Tool |
|---|---|
| View, filter, group costs by service/account/tag; forecast | AWS Cost Explorer |
| Set thresholds and get alerts, take automatic action when exceeded | AWS Budgets (+ Budget actions) |
| Most detailed data (per resource, per hour) for SQL/BI analysis | Cost and Usage Report / AWS Data Exports (CUR 2.0) |
| Detect unusual spend with ML | AWS Cost Anomaly Detection |
| Best-practice checks: idle resources, unused EIPs | AWS Trusted Advisor |
| Metric-based right-sizing recommendations | AWS Compute Optimizer |
| Estimate cost before deployment | AWS Pricing Calculator |
| One bill for multiple accounts, shared discounts | Consolidated billing (AWS Organizations) |
| Custom bills (showback/chargeback, reseller) | AWS Billing Conductor |

## AWS Cost Explorer

- A visual interface to view cost and usage by day/month (hourly granularity if enabled), filtered by service, linked account, Region, tag, cost category.
- **Forecast** of future costs based on history.
- Provides **Savings Plans and RI purchase recommendations**, **utilization** reports (did you use up the commitment) and **coverage** reports (what % of usage is covered by commitments).
- Provides basic EC2 right-sizing recommendations.

## AWS Budgets

- Budget types: **cost**, **usage**, **RI utilization/coverage**, **Savings Plans utilization/coverage**.
- Alerts on **actual or forecasted** cost via email or **Amazon SNS** (and from there to Chatbot/Slack, Lambda).
- **Budget actions**: when a threshold is exceeded it can automatically **apply an IAM policy**, **apply an SCP** (in Organizations), or **stop specific EC2/RDS instances**; can run automatically or wait for approval.
- A question like "prevent developers from creating more resources once the budget is exceeded with the least effort" → Budgets + a Budget action that applies an IAM policy/SCP deny.

## Cost and Usage Report / Data Exports

- The **most detailed** billing dataset (hourly, by resource ID, with tags), delivered to an **S3 bucket**.
- **AWS Data Exports** is the current way to create exports: **CUR 2.0** (select columns with a SQL-like statement, stable schema), plus exports in the **FOCUS** standard and exports for Cost Optimization Recommendations.
- Analyze with **Amazon Athena**, visualize with **Amazon QuickSight** (Cloud Intelligence Dashboards solution).
- A question saying "need per-resource detailed cost data to query with SQL" → CUR/Data Exports + Athena.

## Cost allocation tags

- Two types: **AWS-generated** (e.g. aws:createdBy) and **user-defined** (e.g. CostCenter, Project, Environment).
- Must be **activated** in the Billing console of the **management account** before the tag appears in Cost Explorer/CUR. Activation is not retroactive for data before activation.
- Use **Tag Policies** (Organizations) to standardize tag names/values, and SCP/IAM with the aws:RequestTag condition to enforce tagging when creating resources.
- **Cost Categories** group costs by rules (account, tag, service) into business units.

## AWS Cost Anomaly Detection

- Uses **machine learning** to learn spending patterns, detect anomalies and their **root cause** (service, account, Region, usage type).
- Create a **cost monitor** (by service, linked account, cost category, tag) and an **alert subscription** (immediate via SNS or a daily/weekly summary via email).
- Unlike Budgets: Budgets use **fixed thresholds you set**; Anomaly Detection **needs no threshold** and detects abnormal increases on its own.

## AWS Trusted Advisor

- Checks across categories: cost optimization, performance, security, fault tolerance, service limits, operational excellence.
- Typical cost checks: low-utilization EC2, idle load balancers, **unattached Elastic IPs**, underutilized EBS volumes, idle RDS, RIs about to expire.
- **All checks** are available only with **Business Support or higher** (Enterprise On-Ramp/Enterprise); Basic/Developer get only the core checks.

## Compute Optimizer vs Trusted Advisor vs Cost Explorer

- **Compute Optimizer**: deep right-sizing using ML on CloudWatch metrics (EC2, ASG, EBS, Lambda, ECS Fargate, RDS), shows over-/under-provisioned resources.
- **Trusted Advisor**: a broad checklist, detects idle resources.
- **Cost Explorer**: cost analysis and SP/RI purchase recommendations.

## Pricing Calculator

- Estimates architecture cost **before you build**; export and share estimates. It does not read actual account data (except the newer bill estimate feature in the console).

## Consolidated billing in AWS Organizations

- A single bill in the **management account** for all member accounts.
- **Usage is combined to reach volume tiers**, for example S3 or data transfer.
- **RIs and Savings Plans are shared** across accounts in the organization (sharing can be turned off per account).
- No extra charge.

## AWS Billing Conductor

- Creates a **pro forma bill** with custom pricing (pricing rules, billing groups) for **showback/chargeback** or for resellers/AWS Partners to rebill customers.
- Does not change the real bill that AWS sends you.`,
    keywords: [
      { trigger: 'visualize and forecast costs, filter by service or tag', answer: 'AWS Cost Explorer' },
      { trigger: 'alert when forecasted spend exceeds a threshold', answer: 'AWS Budgets (forecasted alert)' },
      { trigger: 'automatically stop instances or apply policy when budget exceeded', answer: 'AWS Budgets actions' },
      { trigger: 'most granular hourly, resource-level billing data queried with SQL', answer: 'CUR 2.0 via AWS Data Exports + Amazon Athena' },
      { trigger: 'detect unusual spend without setting thresholds, using ML', answer: 'AWS Cost Anomaly Detection' },
      { trigger: 'allocate costs per department/project', answer: 'Cost allocation tags (activate in the management account)' },
      { trigger: 'unassociated Elastic IPs, idle load balancers', answer: 'AWS Trusted Advisor' },
      { trigger: 'share Reserved Instance discounts across accounts, single bill', answer: 'Consolidated billing in AWS Organizations' },
      { trigger: 'custom rates for showback/chargeback or reseller billing', answer: 'AWS Billing Conductor' },
    ],
    traps: [
      'A newly created tag does not appear in Cost Explorer until you activate the cost allocation tag in the management account.',
      'Budgets only alert unless Budget actions are configured; Budgets does not delete resources on its own.',
      'Cost Explorer is not where you get hourly per-resource data to query with SQL; that is CUR/Data Exports.',
      'The full set of Trusted Advisor cost checks requires Business Support or higher.',
      'Pricing Calculator only estimates in advance; it does not monitor actual costs.',
    ],
  },
  {
    slug: 'cost-optimized-architectures',
    domain: 'cost',
    title: 'Cost-optimized architectures: data transfer, network, serverless, scheduling',
    summary:
      'Common cost-reducing architecture patterns: avoid NAT and egress charges with VPC endpoints and CloudFront, pick the right capacity mode, shut down dev environments after hours, gp3 instead of gp2, SQS to run a smaller fleet.',
    services: [
      'Amazon VPC',
      'NAT Gateway',
      'VPC Endpoints',
      'Amazon CloudFront',
      'AWS Lambda',
      'Amazon DynamoDB',
      'Amazon Aurora Serverless v2',
      'Amazon RDS',
      'Amazon EBS',
      'Amazon EFS',
      'Amazon SQS',
      'Instance Scheduler on AWS',
      'Amazon CloudWatch Logs',
    ],
    minutes: 12,
    body: `## Data transfer costs

| Data flow | Charged? |
|---|---|
| Internet → AWS (inbound) | Free |
| Within the same AZ over private IP | Free |
| Between AZs in the same Region | Charged (per GB, in both directions) |
| Between Regions (inter-Region) | Charged, usually higher than cross-AZ |
| AWS → Internet (egress) | Charged, most expensive, decreases by tier |
| AWS origin (S3, EC2, ALB) → CloudFront | Free |
| CloudFront → users | Charged but usually cheaper than direct egress, plus caching |

Tips:
- Send data between instances over **private IP** rather than public IP/Elastic IP (traffic via a public IP is charged like cross-AZ or more).
- Workloads that exchange very large amounts of data and do not need HA (e.g. a temporary compute cluster) can be placed in **one AZ** to avoid cross-AZ charges; this trades away availability.
- **CloudFront** reduces egress from the origin and reduces origin load through caching. A question saying "reduce data transfer cost to the internet for static content/video" → CloudFront.
- S3 Transfer Acceleration speeds up uploads but **costs extra**; it is not a cost-reduction solution.

## NAT Gateway vs VPC Endpoints

- **NAT Gateway** is charged **per hour + per GB of data processed**. If private instances call S3/DynamoDB through NAT, every GB incurs a processing fee.
- **Gateway VPC endpoint** for **S3 and DynamoDB**: **free**, you only add a route to the route table. This is the classic answer for "reduce NAT costs when private EC2 reads/writes S3 heavily".
- **Interface VPC endpoint (PrivateLink)** for other services (SQS, ECR, Secrets Manager, ...): charged per hour per AZ + per GB, but the processing fee is usually cheaper than NAT.
- One NAT Gateway per AZ for HA; sharing one NAT across AZs is cheaper but incurs cross-AZ charges and loses HA.

## Public IPv4 charges

- Since **Feb 1, 2024**, AWS charges hourly for **every public IPv4 address**, including those attached to resources and in-use Elastic IPs (previously only unattached EIPs were charged).
- To reduce costs: drop public IPs when not needed (use ALB/NAT/endpoints), use **IPv6**, use **EC2 Instance Connect Endpoint** or **Session Manager** instead of bastions with public IPs. **Public IP Insights** in Amazon VPC IP Address Manager helps find addresses in use.

## Serverless vs EC2

- **Lambda/Fargate/API Gateway**: pay per request and run time, no cost when idle. Cheap for **uneven, intermittent workloads with lots of idle time**.
- **EC2 (+ Savings Plans)**: cheaper for **high, steady 24/7** workloads.
- **Lambda memory tuning**: CPU is proportional to memory; raising memory can shorten run time and **reduce total cost**. Use **AWS Lambda Power Tuning** or Compute Optimizer. Lambda on **arm64 (Graviton)** has a lower GB-second price than x86.

## Database capacity mode

### DynamoDB
| Mode | When to choose |
|---|---|
| On-demand | Unpredictable load, new launch, long idle periods; pay per request |
| Provisioned + Auto Scaling | Steady load or predictable gradual growth; cheaper with consistent use |
| Provisioned + Reserved capacity | Long-term steady load, 1 or 3 year commitment |

- **Standard-IA table class** for tables that store a lot but are rarely accessed (lower storage price, higher read/write price).
- TTL deletes expired items for free.

### Aurora Serverless v2 and RDS
- **Aurora Serverless v2** scales automatically by ACU in small steps, suited to variable load, dev/test, and many rarely used databases. It can now be configured with **min 0 ACU (auto-pause)** so you pay no compute while idle.
- Steady 24/7 load → **provisioned RDS/Aurora + Reserved Instances** (deepest discount).
- Aurora I/O-Optimized fits when I/O cost makes up a large share (roughly over 25%) of total Aurora cost.

## Shutting down unused environments

- **Instance Scheduler on AWS** (an AWS solution using Lambda + DynamoDB + tags) automatically starts/stops EC2 and RDS on a schedule, for example running only during business hours → cuts dev compute cost by about 2/3.
- You can use EventBridge Scheduler + Lambda/SSM Automation for simple cases.
- Note: a stopped RDS instance restarts automatically after 7 days.
- EBS volumes are still charged when the instance is stopped.

## Storage

- **EBS gp2 → gp3**: gp3 is about 20% cheaper per GB, with a baseline of **3,000 IOPS and 125 MB/s** independent of size, and IOPS/throughput can be increased independently. Convert with **Elastic Volumes** without downtime.
- Delete unattached EBS volumes and old snapshots; use **EBS Snapshots Archive** for long-retained snapshots.
- **EFS**: enable **lifecycle management** to move infrequently used files to **EFS Infrequent Access** and **EFS Archive**; use **EFS One Zone** for data that does not need multi-AZ.
- **Logs**: set **retention** on CloudWatch Logs (default is keep forever), use the **Infrequent Access log class** for rarely queried logs, export/stream logs to S3 then lifecycle to Glacier.

## Decoupling to run a smaller fleet

- Put **SQS** between the frontend and workers: workers process at their own pace, with no need to provision for peak. Scale the worker ASG on **backlog per instance** (messages in the queue per instance).
- Workers that process messages idempotently can run on **Spot**.

## Quick checklist

- Private subnet reading S3/DynamoDB → Gateway endpoint.
- Large content egress → CloudFront.
- Dev/test after hours → Instance Scheduler.
- gp2 → gp3.
- Spiky load → serverless/on-demand; steady load → provisioned + commitment.`,
    keywords: [
      { trigger: 'private instances access S3, NAT gateway charges are high', answer: 'Gateway VPC endpoint for S3 (free)' },
      { trigger: 'reduce data transfer out costs for global users', answer: 'Amazon CloudFront' },
      { trigger: 'unpredictable traffic, pay per request for NoSQL', answer: 'DynamoDB on-demand capacity' },
      { trigger: 'predictable steady DynamoDB traffic', answer: 'DynamoDB provisioned + Auto Scaling (+ reserved capacity)' },
      { trigger: 'variable or intermittent relational database usage', answer: 'Aurora Serverless v2' },
      { trigger: 'dev/test instances only used during business hours', answer: 'Instance Scheduler on AWS' },
      { trigger: 'reduce EBS cost without performance loss', answer: 'Convert gp2 to gp3 with Elastic Volumes' },
      { trigger: 'files rarely accessed after 30 days on shared file system', answer: 'EFS lifecycle management to EFS IA/Archive' },
      { trigger: 'workers sized for peak, load is bursty', answer: 'SQS queue + scale on backlog per instance' },
      { trigger: 'unexpected charges for public IPv4 addresses', answer: 'Remove unneeded public IPs, use IPv6/endpoints/Session Manager' },
    ],
    traps: [
      'Interface endpoints are not free; only Gateway endpoints (S3, DynamoDB) are free.',
      'Cross-AZ traffic is charged; putting everything in one AZ is cheaper but loses high availability, so do not choose it when the question requires HA.',
      'S3 Transfer Acceleration and Global Accelerator increase speed, not reduce cost.',
      'A stopped instance still costs EBS and public IPv4/Elastic IP charges.',
      'DynamoDB on-demand is not always cheaper; for high steady load, provisioned is cheaper.',
      'Increasing Lambda memory does not necessarily increase cost; the shorter run time can lower the total cost.',
    ],
  },
  {
    slug: 'cost-database-storage-choices',
    domain: 'cost',
    title: 'Choosing cheaper storage and databases: EBS/EFS/S3, FSx, Redshift, Athena, ElastiCache, Snow',
    summary:
      'Compare the cost structures of storage and data analytics options: pay for provisioned vs actually used capacity, pay per query vs per cluster, when to cache to offload the database, and when to move data with Snow devices.',
    services: [
      'Amazon EBS',
      'Amazon EFS',
      'Amazon S3',
      'Amazon FSx',
      'Amazon Redshift',
      'Amazon Athena',
      'Amazon ElastiCache',
      'AWS Backup',
      'AWS Snowball',
      'AWS DataSync',
    ],
    minutes: 11,
    body: `## EBS vs EFS vs S3: cost structure

| Criterion | Amazon EBS | Amazon EFS | Amazon S3 |
|---|---|---|---|
| Type | Block, attached to an instance (usually 1 instance, same AZ) | NFS file system shared by many instances, multiple AZs | Object, accessed via API/HTTP |
| Billing | By **provisioned capacity**, you pay whether used or not | By **actual used capacity**, scales automatically | By actual used capacity + requests + data transfer |
| Price per GB (relative) | Medium | Highest (Standard), drops sharply with IA/Archive | Lowest, very cheap with Glacier |
| Cost optimization | gp3, sc1/st1 for cold sequential data, delete excess volumes | Lifecycle to IA/Archive, One Zone, Elastic throughput | Storage class + lifecycle, Intelligent-Tiering |

- Data that is only read/written through the application (images, video, backups, logs) → **S3** is almost always cheapest.
- Need a shared POSIX file system for Linux → EFS; optimize with lifecycle.
- **st1** (throughput optimized HDD) for big data/sequential logs; **sc1** (cold HDD) is cheapest for infrequently accessed data. Do not use HDD as a boot volume.

## Amazon FSx: savings options

| FSx | Cost-reduction options |
|---|---|
| FSx for Windows File Server | Choose **HDD storage** instead of SSD for lightly loaded shares; **Single-AZ** for dev/test; enable **data deduplication** |
| FSx for Lustre | **Scratch** file system (cheap, no replication, for temporary processing) vs **Persistent** (long-lived); link an **S3 data repository** to keep only hot data on Lustre |
| FSx for NetApp ONTAP | Dedup, compression, compaction; **automatically tier cold data to the low-cost capacity pool** |
| FSx for OpenZFS | Compression, snapshots, clones that use no extra capacity |

- A question saying "HPC processing data from S3 for a few hours then discarding it" → **FSx for Lustre scratch** linked to S3.

## Redshift Serverless vs provisioned

- **Redshift Serverless**: scales automatically, billed in **RPU-hours while queries run**, no compute cost when idle. Fits **sporadic, unpredictable** analytics and small teams.
- **Redshift provisioned (RA3)** + **Reserved nodes**: cheaper for always-on warehouses with steady load. RA3 separates compute and managed storage. A provisioned cluster can be **paused/resumed**.
- **Redshift Spectrum**: query data in S3 without loading it all into the cluster.

## Amazon Athena: pay-per-query

- Serverless, billed by the **amount of data scanned** per query (a provisioned capacity option is also available).
- Reduce cost by reducing data scanned:
  - **Partition** data (e.g. by year/month/day) and filter on partitions in WHERE; use **partition projection** for many partitions.
  - Convert to a **columnar format (Apache Parquet, ORC)** and **compress** (Snappy, GZIP): only the needed columns are read, usually cutting scanned data dramatically.
  - Combine small files into larger ones; use **CTAS** or AWS Glue ETL to convert CSV/JSON to Parquet.
- Ad-hoc queries on S3 logs (CloudTrail, ALB, VPC Flow Logs) → Athena is cheaper than building a cluster.

## ElastiCache to reduce database cost

- Put **ElastiCache (Redis OSS/Valkey or Memcached)** in front of the database for repeated read queries → reduces read load, and you may **use a smaller DB instance or fewer read replicas**.
- Compared with scaling up RDS or adding many read replicas, a cache is usually cheaper for heavy, repetitive read load.
- **DynamoDB Accelerator (DAX)** is a cache for DynamoDB, reducing RCU consumption for repeated reads.
- ElastiCache has **reserved nodes** and **ElastiCache Serverless** (pay for data stored and ECPU).

## Backup costs

- **RDS automated backups**: retention 1–35 days; backup storage up to the size of the DB is free within the Region, beyond that it is charged. Manual snapshots are kept until deleted.
- **EBS snapshots** are incremental; use **Amazon Data Lifecycle Manager** to create and delete them automatically by retention. **EBS Snapshots Archive** is much cheaper for long-retained snapshots (90-day minimum, restore takes hours).
- **AWS Backup**: a backup plan with a lifecycle that moves recovery points to **cold storage** (for supported resources, 90-day minimum in cold) and deletes them automatically after the retention period.
- Keep backups for exactly the compliance-required period, not forever.

## Snow family vs network transfer

- Estimate transfer time: size / actual bandwidth. If a network transfer would take **more than about a week** or would saturate the existing link → consider **AWS Snowball Edge** (physical device, data imported into S3).
- For many TB to PB with limited bandwidth → Snowball is cheaper and faster than adding network capacity.
- Enough bandwidth, and you need continuous or repeated sync → **AWS DataSync** (over the internet or Direct Connect).
- **AWS Direct Connect** takes time to set up (usually several weeks) and has fixed fees; it is not the choice for an urgent one-time migration.
- Snowmobile and Snowcone have been discontinued; older exam questions may still mention them, but the core knowledge is Snowball Edge for offline transfer.

## Choice summary

- Sporadically used warehouse → Redshift Serverless; continuously used → provisioned + reserved nodes.
- Ad-hoc queries on S3 → Athena + Parquet + partitioning.
- Heavy repeated reads → ElastiCache/DAX instead of scaling the DB.
- Large data, slow network, one-time → Snowball Edge.`,
    keywords: [
      { trigger: 'pay only for storage used, shared Linux file system', answer: 'Amazon EFS (+ lifecycle to IA)' },
      { trigger: 'reduce Athena query cost', answer: 'Partition data + convert to compressed Parquet/ORC' },
      { trigger: 'intermittent, unpredictable data warehouse queries', answer: 'Amazon Redshift Serverless' },
      { trigger: 'read-heavy repeated queries overload RDS, reduce cost', answer: 'Amazon ElastiCache in front of the database' },
      { trigger: 'temporary HPC processing of data in S3', answer: 'FSx for Lustre scratch linked to S3' },
      { trigger: 'Windows file share with low performance needs, lowest cost', answer: 'FSx for Windows File Server HDD + data deduplication' },
      { trigger: 'hundreds of TB, limited bandwidth, one-time migration', answer: 'AWS Snowball Edge' },
      { trigger: 'keep EBS snapshots for years rarely restored', answer: 'EBS Snapshots Archive' },
      { trigger: 'cold data in ONTAP file system', answer: 'FSx for NetApp ONTAP capacity pool tiering' },
    ],
    traps: [
      'EBS is billed on provisioned capacity, not used capacity; a 1 TB volume holding only 100 GB still costs 1 TB.',
      'EFS Standard is much more expensive per GB than S3; do not choose EFS just to store objects like images/video.',
      'Athena is billed on data scanned: querying unpartitioned CSV is very costly; LIMIT does not reduce data scanned in many cases.',
      'Direct Connect is not the answer for a one-time migration that must finish within a few weeks (long setup).',
      'FSx for Lustre scratch does not replicate data; do not use it for the only copy of long-lived data.',
    ],
  },
  {
    slug: 'cost-compute-serverless-containers',
    domain: 'cost',
    title: 'Choosing the cheapest compute: EC2, ECS, Fargate, Lambda, Spot and Graviton',
    summary:
      'Compare the cost structure of EC2, ECS on EC2, Fargate and Lambda by utilization and traffic shape, then cut further with Compute Savings Plans, Fargate Spot, EC2 Spot, Graviton and Lambda tuning.',
    services: [
      'Amazon EC2',
      'Amazon ECS',
      'AWS Fargate',
      'AWS Lambda',
      'Savings Plans',
      'Spot Instances',
      'AWS Graviton',
      'AWS Batch',
      'AWS Step Functions',
      'AWS Compute Optimizer',
    ],
    minutes: 11,
    body: `## What each compute model charges for

| Model | You pay for | Cheap when | Expensive when |
|---|---|---|---|
| EC2 | Running instances (Linux billed per second), used or not | High, steady utilization with Savings Plans/RI | Idle instances, provisioned for peak |
| ECS on EC2 | The EC2 instances in the cluster (the ECS control plane is free) | Many containers densely bin-packed on instances | Cluster has spare capacity |
| Fargate | vCPU and memory requested by the task, per second (1-minute minimum) | Variable load, scheduled tasks, no wish to manage nodes | Dense 24/7 load; per-vCPU price is higher than well-used EC2 |
| Lambda | Requests + duration in GB-seconds (rounded to the ms) | Sparse, spiky traffic, lots of idle time, short events | Sustained high traffic, long-running or waiting functions |

Key idea: **utilization decides**. Serverless costs nothing when idle but has a higher unit price; at high, steady load, EC2 or ECS on EC2 with a commitment is usually cheaper. Amazon EKS adds an hourly control plane fee per cluster; ECS does not.

## Workload → cheapest fit

| Workload | Usual cheapest choice |
|---|---|
| API with few requests and minutes of no traffic | Lambda + API Gateway |
| Steady 24/7 web/API with high traffic | EC2 or ECS on EC2 + Savings Plans + Graviton |
| Containers with variable load, small team that does not want to manage nodes | Fargate + Compute Savings Plans for the baseline |
| Interruption-tolerant container workers | Fargate Spot or an ECS capacity provider using EC2 Spot |
| Large batch, HPC, rendering with checkpoints | AWS Batch with a Spot compute environment |
| Jobs that run longer than 15 minutes | Not Lambda: Fargate, AWS Batch or EC2 |

## Compute Savings Plans across all three

- One USD/hour commitment applies automatically to **EC2, Fargate and Lambda**, even after a workload moves between them.
- The discount for Fargate and Lambda is lower than for EC2, but still significant for a steady baseline.
- EC2 Instance Savings Plans and Reserved Instances do **not** apply to Fargate/Lambda.
- Commit at the lowest baseline; leave the fluctuating part to On-Demand or Spot.

## Spot for containers

### Fargate Spot
- Runs Fargate tasks on spare capacity at up to about 70% off; when reclaimed, the task gets a **2-minute warning** (SIGTERM).
- Use a **capacity provider strategy** with FARGATE and FARGATE_SPOT: **base** is the minimum number of tasks always placed on that provider, **weight** splits the rest (for example FARGATE base 2, then FARGATE:FARGATE_SPOT = 1:3).
- Fargate Spot does not support Windows tasks or ARM64 tasks.

### ECS capacity providers on EC2
- An **Auto Scaling group capacity provider** with managed scaling lets ECS scale the ASG to the tasks it needs; combine an On-Demand provider (baseline) and a Spot provider in one strategy.
- Enable ECS agent **Spot instance draining** so tasks are moved off instances about to be reclaimed.

## EC2 Spot done right

- **Diversify**: many instance types (families, generations, similar sizes) across several AZs, or **attribute-based instance type selection**.
- Use the **price-capacity-optimized** or **capacity-optimized** allocation strategy to pick pools less likely to be interrupted; avoid lowest-price with few pools.
- By default you pay the current Spot price, capped at On-Demand; raising the max price does not prevent interruptions.
- **Handle interruptions**: catch the 2-minute warning and rebalance recommendations through EventBridge; enable **Capacity Rebalancing** in the ASG.
- **Design stateless**: workers pull from **SQS** and delete the message only when done; if an instance dies, the message reappears after the visibility timeout. **Checkpoint** progress to S3/DynamoDB to resume instead of restarting.

## AWS Batch with Spot

- AWS Batch has no extra charge; you pay for the underlying EC2/Fargate.
- Use a **SPOT** compute environment with the **SPOT_PRICE_CAPACITY_OPTIMIZED** (or SPOT_CAPACITY_OPTIMIZED) allocation strategy, or use Fargate Spot.
- Configure a **retry strategy** so interrupted jobs rerun automatically; a job queue can attach several compute environments in order (Spot first, On-Demand next).

## Graviton everywhere

- Available for EC2 (families with a g such as M7g, C7g, R8g), Lambda arm64, Fargate ARM64, RDS/Aurora, ElastiCache, OpenSearch.
- Better price/performance than comparable x86; managed databases usually just need a new instance class, EC2/containers need ARM64 binaries or multi-arch images.
- Lambda arm64 has a lower price per GB-second than x86; usually just switch the architecture if the code has no x86 native dependencies.

## Lambda cost levers

- Cost = requests + memory × duration. CPU scales with memory, so more memory can shorten duration enough to lower the total bill.
- **AWS Lambda Power Tuning** (open source, runs on Step Functions) tests several memory settings and shows the cheapest or fastest one; Compute Optimizer also recommends memory.
- **Do not wait inside Lambda**: a function waiting on a slow API or polling is still billed for duration. Move the waiting to **Step Functions** (Wait state, callback with a task token); Standard workflows are billed per state transition, not for waiting time.

## Right-sizing and turning off non-production

- Order: turn off what is unused → right-size → move to Graviton → only then buy Savings Plans.
- Non-production: ASG scheduled actions set desired capacity to 0 after hours, ECS service desired count to 0, Instance Scheduler on AWS for EC2/RDS.`,
    keywords: [
      { trigger: 'infrequent, spiky requests with long idle periods', answer: 'AWS Lambda (+ API Gateway)' },
      { trigger: 'steady high-utilization containers running 24/7', answer: 'ECS on EC2 (or EC2) + Savings Plans + Graviton' },
      { trigger: 'one commitment covering EC2, Fargate and Lambda', answer: 'Compute Savings Plans' },
      { trigger: 'interruption-tolerant ECS tasks, keep a minimum always running', answer: 'Capacity provider strategy FARGATE (base) + FARGATE_SPOT (weight)' },
      { trigger: 'Spot interruptions too frequent with one instance type', answer: 'Diversify instance types/AZs + price-capacity-optimized' },
      { trigger: 'Spot workers lose work when interrupted', answer: 'SQS (delete message after completion) + checkpoint to S3/DynamoDB' },
      { trigger: 'large retriable batch jobs, lowest cost, managed scheduling', answer: 'AWS Batch with a Spot compute environment' },
      { trigger: 'Lambda billed while waiting for an external job', answer: 'Step Functions Wait state or callback task token' },
      { trigger: 'find the cheapest Lambda memory setting', answer: 'AWS Lambda Power Tuning / Compute Optimizer' },
    ],
    traps: [
      'Lambda is not always cheapest: for high, steady traffic, EC2/ECS on EC2 with Savings Plans is usually cheaper.',
      'EC2 Instance Savings Plans and RIs do not apply to Fargate or Lambda; only Compute Savings Plans do.',
      'Fargate Spot does not support Windows or ARM64 tasks; for Graviton plus low cost use regular Fargate ARM64 + Savings Plans.',
      'Raising the Spot max price does not reduce interruptions; diversify pools and use a capacity-aware allocation strategy.',
      'Lambda waiting or polling is still billed for duration; jobs longer than 15 minutes cannot run on Lambda.',
      'Provisioned Concurrency is billed even with no requests; it is not a cost-saving tool.',
    ],
  },
  {
    slug: 'cost-network-transfer',
    domain: 'cost',
    title: 'Network and data transfer cost in depth: AZ, Region, NAT, endpoints, hybrid, Transit Gateway',
    summary:
      'Understand which direction and which component data transfer is billed on: inter-AZ, inter-Region, NAT Gateway, VPC endpoints, CloudFront, Direct Connect, VPN, Transit Gateway, public IPv4, and how to find the flow that costs money.',
    services: [
      'Amazon VPC',
      'NAT Gateway',
      'VPC Endpoints',
      'AWS PrivateLink',
      'Amazon CloudFront',
      'AWS Direct Connect',
      'AWS Site-to-Site VPN',
      'AWS Transit Gateway',
      'Elastic Load Balancing',
      'VPC Flow Logs',
      'AWS Cost Explorer',
    ],
    minutes: 12,
    body: `## Principle: money follows direction and distance

- **From the internet into AWS (inbound)**: free.
- **Out to the internet (egress)**: billed per GB, with tiered prices that drop at higher volume.
- **Between AZs in the same Region**: billed per GB in **both directions** (sender and receiver).
- **Between Regions**: billed per GB on the sending side, usually more than cross-AZ.
- **Within the same AZ over private IP**: free.
- EC2 ↔ S3/DynamoDB in the same Region: no data transfer charge, but going through a NAT Gateway still incurs NAT processing charges.

## Cost comparison of network components

| Component | Hourly charge | Per-GB charge | Notes |
|---|---|---|---|
| Internet Gateway | No | Only normal internet egress | No separate processing fee |
| NAT Gateway | Yes, per NAT | Yes (data processing) + data transfer | Expensive at high volume |
| Gateway VPC endpoint (S3, DynamoDB) | No | No | Same Region only |
| Interface VPC endpoint | Yes, per AZ | Yes, lower than NAT | For most other services |
| VPC peering | No | Same AZ free; cross-AZ, inter-Region billed | Not transitive |
| Transit Gateway | Yes, per attachment | Yes (data processing) | Hub-and-spoke, easy to manage |
| Site-to-Site VPN | Yes, per connection | Egress at internet rates | Set up in minutes |
| Direct Connect | Yes (port-hour) | Egress cheaper than internet; inbound free | Long setup, consistent bandwidth |
| CloudFront | No | Egress to viewers; AWS origin → CloudFront free | Caching offloads the origin |
| Public IPv4 | Yes, per address | No | IPv6 addresses are not charged |

## Inter-AZ: the hidden cost of high availability

- Managed **RDS/Aurora Multi-AZ** replication: no data transfer charge between primary and standby. Running your own database, Kafka or Elasticsearch on EC2 means cross-AZ replication **is billed**.
- An app in AZ A calling a cache/database in AZ B pays cross-AZ on every request. Prefer AZ-aware routing and reading from a replica in the same AZ.
- **Cross-zone load balancing**: for **NLB and GWLB** (off by default), turning it on incurs inter-AZ charges. ALB always has cross-zone on and does not charge inter-AZ for it.
- Do not sacrifice production HA just to avoid cross-AZ charges; single-AZ only suits batch, dev or temporary clusters.

## NAT Gateway: the surprise bill

- NAT is billed **per hour + per GB processed**, plus normal data transfer.
- Traffic to S3/DynamoDB → **Gateway endpoint** (free, add a route to the route table).
- Traffic to ECR, CloudWatch Logs, SQS, STS... → **interface endpoint** when the GB volume is large enough to offset the hourly per-AZ fee.
- Containers pulling large images from ECR through NAT → interface endpoints for ECR (ecr.api, ecr.dkr) plus an S3 gateway endpoint, because image layers live in S3.
- **One NAT per AZ**: HA and no cross-AZ traffic, but you pay hourly for several NATs. **One shared NAT**: lower hourly cost, but subnets in other AZs pay cross-AZ and lose outbound access if the NAT\'s AZ fails. Production → one NAT per AZ; dev/test → sharing is acceptable.

## Inter-Region

- S3 Cross-Region Replication, DynamoDB global tables, Aurora Global Database, copying snapshots/AMIs to another Region all incur inter-Region charges. Replicate only the data you really need for DR or latency.

## CloudFront

- Data from AWS origins (S3, ALB, EC2) to CloudFront is **free**; you pay egress from the edge to users, and cache hits reduce requests to the origin.
- **Price classes**: All, 200, 100. **Price Class 100** uses only edges in the cheapest areas (North America, Europe) → cheaper, at the cost of higher latency for users elsewhere.

## S3 Transfer Acceleration

- Adds a per-GB fee on top of data transfer; charged only when acceleration is actually faster. It is a **speed** feature, not a saving.

## Hybrid connectivity

- **Site-to-Site VPN**: hourly fee per connection + egress at internet rates. Cheap for low or moderate traffic, quick to set up.
- **Direct Connect**: fixed port-hour fee + egress (DTO) cheaper than the internet. With large, steady volumes from AWS to on-premises, the egress savings outweigh the port fee, plus you get consistent bandwidth.

## Transit Gateway vs VPC peering

- **VPC peering**: no hourly fee, no processing fee; same-AZ traffic is free. But it is not transitive, and a full mesh is hard to manage with many VPCs.
- **Transit Gateway**: hourly fee per attachment + per-GB processing fee. You pay for simpler management.
- Two VPCs exchanging very large volumes → add a direct peering for that pair, while other VPCs stay on the TGW.

## Public IPv4 and IPv6

- Every public IPv4 address (including attached Elastic IPs) is billed hourly. Consolidate traffic through ALB/NAT, remove unneeded public IPs, move to **IPv6** (egress-only internet gateway for outbound); IPv6 addresses are not charged.

## Finding the expensive flows

- **Cost Explorer**: group by **Usage Type** and look for types such as DataTransfer-Regional-Bytes (inter-AZ), NatGateway-Bytes, DataTransfer-Out-Bytes.
- **CUR/Data Exports + Athena** to find which resource generates them.
- **VPC Flow Logs** (queried with Athena or CloudWatch Logs Insights) to find the exact source/destination pairs and which flows go through NAT or to another AZ.`,
    keywords: [
      { trigger: 'private instances pull large data from S3 or DynamoDB through NAT', answer: 'Gateway VPC endpoint (free)' },
      { trigger: 'high NAT charges for ECR image pulls and CloudWatch Logs', answer: 'Interface VPC endpoints (+ S3 gateway endpoint for ECR layers)' },
      { trigger: 'single NAT gateway, inter-AZ charges and AZ failure risk', answer: 'One NAT Gateway per AZ, route each subnet to the NAT in its AZ' },
      { trigger: 'reduce egress for global downloads, users mostly in North America and Europe', answer: 'CloudFront with Price Class 100' },
      { trigger: 'large steady data transfer from AWS to on-premises', answer: 'AWS Direct Connect' },
      { trigger: 'two VPCs exchange huge traffic through Transit Gateway', answer: 'Direct VPC peering (no hourly fee, no processing fee)' },
      { trigger: 'NLB cross-zone enabled, high inter-AZ cost, targets balanced per AZ', answer: 'Turn off cross-zone load balancing on the NLB' },
      { trigger: 'identify which instances generate inter-AZ traffic', answer: 'VPC Flow Logs + Athena, Cost Explorer by usage type' },
      { trigger: 'charges for public IPv4 addresses', answer: 'Remove unneeded public IPs, use IPv6 / ALB / NAT' },
    ],
    traps: [
      'Interface endpoints have an hourly per-AZ fee and a per-GB fee; only gateway endpoints for S3/DynamoDB are free.',
      'Gateway endpoints work only within the same Region and cannot be used from on-premises; on-premises access needs an interface endpoint.',
      'One NAT shared across AZs saves hourly fees but adds cross-AZ charges and a single point of failure.',
      'S3 Transfer Acceleration and Global Accelerator improve speed, not cost.',
      'Transit Gateway has a per-GB processing fee; VPC peering has no hourly or processing fee.',
      'RDS/Aurora Multi-AZ replication has no transfer charge, but a self-managed database on EC2 replicating across AZs does.',
    ],
  },
];
