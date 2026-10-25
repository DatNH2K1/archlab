import type { Lesson } from '@/content/types';

export const performanceLessonsEn: Lesson[] = [
  {
    slug: 'ec2-compute',
    domain: 'performance',
    title: 'EC2: instance families, placement groups, and compute performance',
    summary:
      'Pick the right instance family, Graviton, placement group, enhanced networking, and EC2 storage type to get the best performance.',
    services: ['Amazon EC2', 'AWS Graviton', 'Amazon EBS', 'EC2 Image Builder', 'Elastic Fabric Adapter'],
    minutes: 10,
    body: `## Overview

Amazon EC2 is the most basic virtual machine service. In Domain 3, questions usually revolve around **choosing the right instance type** for the workload, **where to place instances** (placement groups), and **which storage** goes with them.

## Instance families

An instance name looks like m7g.2xlarge: **m** = family, **7** = generation, **g** = attribute (g = Graviton, a = AMD, i = Intel, n = enhanced networking, d = has instance store), **2xlarge** = size.

| Family | Examples | Use when |
|---|---|---|
| General purpose | M, T (burstable) | Web servers, app servers, workloads with balanced CPU/RAM. T uses CPU credits, suited to low load with bursts |
| Compute optimized | C | CPU-heavy batch processing, media transcoding, HPC, game servers, CPU-based ML inference |
| Memory optimized | R, X, z, High Memory (u) | In-memory databases, large caches, SAP HANA, real-time big data processing |
| Storage optimized | I, D, H | High IOPS on instance store (NVMe), NoSQL, data warehouses, HDFS |
| Accelerated computing | P, G, Inf, Trn, F | GPU training (P), graphics/inference (G), Inferentia (Inf), Trainium (Trn), FPGA (F) |

### Graviton

- ARM CPUs designed by AWS, with up to about 40% better price/performance than same-generation x86.
- Available in many services: EC2, Lambda, Fargate, RDS, Aurora, ElastiCache, OpenSearch.
- Requirement: the application must run on ARM64 (Java, Python, Node.js, and multi-arch containers are usually fine).

## Placement groups

| Type | Layout | Advantages | Drawbacks / limits |
|---|---|---|---|
| Cluster | Packs instances close together in **1 AZ** | Lowest latency, high bandwidth between nodes (HPC, MPI) | A single hardware/AZ failure affects everything |
| Spread | Each instance on its own rack | Reduces correlated failure risk, for critical apps with few nodes | Max **7 running instances per AZ** per group |
| Partition | Split into partitions, each partition is a separate set of racks | Scales to hundreds of instances, topology-aware (HDFS, HBase, Cassandra, Kafka) | Max 7 partitions per AZ |

Tip: "lowest latency, highest throughput between nodes" is Cluster; "critical instances must not share hardware" is Spread; "distributed big data, rack-aware" is Partition.

## Enhanced networking: ENA and EFA

- **ENA (Elastic Network Adapter)**: uses SR-IOV, high bandwidth (up to 100 Gbps or more depending on the instance), high PPS, low latency. Enabled by default on most modern instances.
- **EFA (Elastic Fabric Adapter)**: ENA plus **OS-bypass** capability for distributed HPC/ML applications using MPI or NCCL. Linux only. Combine with a cluster placement group.
- When a question mentions "tightly coupled HPC, MPI, inter-node communication", think EFA + cluster placement group.

## Instance store vs EBS

| Criterion | Instance store | EBS |
|---|---|---|
| Location | Disks physically attached to the host | Network drive, within 1 AZ |
| Performance | Very high IOPS (hundreds of thousands to millions with NVMe) | Depends on volume type (gp3, io2...) |
| Durability | Data lost on stop, hibernate, or terminate, or if the host fails | Persists independently of the instance, supports snapshots |
| Use for | Buffers, caches, scratch, data already replicated at the app layer | Root volumes, databases, data that must be durable |

Instance store keeps data on reboot; stop/terminate loses it.

## EC2 Hibernate

- Saves RAM contents to the **EBS root volume (must be encrypted)**; on start, RAM is restored and the app starts faster (no cache warm-up, no OS reboot).
- Requirements: EBS root, enough space to hold RAM, limited RAM (for example under 150 GB), no hibernation longer than 60 days, only some families and On-Demand/Spot.
- Question: "long initialization time, preserve in-memory state" means choose Hibernate.

## User data, AMI, and EC2 Image Builder

- **User data**: a script that runs **once on first boot** (by default) with root privileges; used to install packages and pull code. Drawback: slows boot if it installs a lot.
- **AMI**: the image used to launch instances. An AMI belongs to **one Region**; to use it in another Region, copy the AMI. A **golden AMI** (everything pre-installed) reduces startup time when Auto Scaling scales out.
- **EC2 Image Builder**: an automated pipeline to build, test, patch, and distribute AMIs (and container images) on a schedule, and share them across Regions/accounts. The question "automate creation and patching of AMIs" means choose Image Builder.

## Quick selection tips for the exam

- Fast boot when scaling out: golden AMI instead of long user data, or an Auto Scaling warm pool.
- Stable workload that can run on ARM, want lower cost and higher performance: Graviton.
- Need extremely high IOPS, temporary data: instance store (storage optimized I family).
`,
    keywords: [
      { trigger: 'lowest network latency between instances, HPC tightly coupled', answer: 'Cluster placement group + EFA' },
      { trigger: 'critical instances must be on distinct hardware', answer: 'Spread placement group' },
      { trigger: 'Hadoop/Cassandra/Kafka rack-aware, hundreds of instances', answer: 'Partition placement group' },
      { trigger: 'preserve in-memory state, faster startup after stop', answer: 'EC2 Hibernate' },
      { trigger: 'very high random IOPS, temporary data, data replicated elsewhere', answer: 'Instance store (storage optimized)' },
      { trigger: 'better price performance, ARM-compatible workload', answer: 'AWS Graviton instances' },
      { trigger: 'automate building and patching AMIs', answer: 'EC2 Image Builder' },
      { trigger: 'reduce boot time when scaling out', answer: 'Golden AMI / Auto Scaling warm pool' },
    ],
    traps: [
      'A cluster placement group lives in only 1 AZ, so it is not a choice for high availability.',
      'A spread placement group is limited to 7 running instances per AZ, so do not use it for large fleets.',
      'Instance store loses data on stop/terminate, so do not choose it for databases that need durability.',
      'Hibernate needs an encrypted EBS root; instance store-backed instances cannot hibernate.',
      'An AMI is a Region-scoped resource; you must copy the AMI before launching in another Region.',
      'EFA supports Linux only and needs an application that uses MPI/NCCL; ENA is the regular enhanced networking.',
    ],
  },
  {
    slug: 'containers-compute',
    domain: 'performance',
    title: 'Container and serverless compute: ECS, EKS, Fargate, Lambda, Batch',
    summary:
      'Distinguish ECS from EKS, EC2 launch type from Fargate, plus App Runner, AWS Batch, Elastic Beanstalk, and how to choose between Lambda, containers, and EC2.',
    services: ['Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'Amazon ECR', 'AWS App Runner', 'AWS Batch', 'AWS Elastic Beanstalk', 'AWS Lambda'],
    minutes: 9,
    body: `## The big picture

AWS offers many ways to run code. The exam usually gives a scenario and asks which option has the **least operational overhead** or is **best for performance**.

## ECS vs EKS

| Criterion | Amazon ECS | Amazon EKS |
|---|---|---|
| Orchestrator | AWS-native, simple, deeply integrated with IAM, ALB, CloudWatch | Standard Kubernetes (CNCF), managed control plane |
| Choose when | You want to run containers quickly with little extra learning | You already use Kubernetes, need portability, the Helm/operator ecosystem, hybrid (EKS Anywhere) |
| Units | Task definition, task, service | Pod, deployment, service |
| Control plane cost | No separate charge | Hourly charge per cluster |

The keyword "already uses Kubernetes, migrate without changing manifests" means choose EKS.

## EC2 launch type vs Fargate

| | EC2 launch type / node group | Fargate |
|---|---|---|
| Infrastructure | You manage EC2 (AMI, patching, cluster scaling) | Serverless, you do not see EC2 |
| Customization | Choose GPU, large instances, Spot, daemons | Only declare vCPU/RAM for the task/pod |
| Cost | Cheaper with high utilization, supports Reserved/Savings Plans/Spot | Pay for the task's vCPU and RAM, Fargate Spot available |
| Overhead | Higher | Lowest |

- Both ECS and EKS can run on Fargate.
- **ECS task role** assigns IAM per task; **EC2 instance profile** is the host's permissions.
- ECS service auto scaling uses target tracking (CPU, RAM, ALB request count). On the EC2 launch type, use a **capacity provider** so the cluster scales EC2 automatically based on task demand.

## Amazon ECR

- Private (and public) Docker/OCI registry, integrated with IAM, image scanning, lifecycle policies, cross-Region and cross-account replication.
- The question "store container images securely, scan for vulnerabilities" means choose ECR.

## AWS App Runner

- Provide source code or a container image, and App Runner builds, deploys, attaches HTTPS, load balancing, and auto scaling for you.
- For simple web apps/APIs, for teams that do not want to manage clusters, load balancers, or complex VPCs.

## AWS Batch

- Runs large-scale **batch jobs**: manages the job queue, scheduling, and compute selection (EC2, Spot, Fargate) for you.
- No runtime limit like Lambda; suited to jobs lasting hours, genomics processing, rendering, simulation.
- The keyword "hundreds of thousands of batch computing jobs, job queues, dependencies" means choose Batch.

## AWS Elastic Beanstalk

- PaaS: upload code (Java, .NET, Node.js, Python, PHP, Go, Ruby, Docker), and Beanstalk creates EC2, Auto Scaling, ELB, and monitoring.
- You can still access the underlying resources. Fits lift-and-shift of traditional web apps, where developers want to focus on code.
- Deployment policies: all at once, rolling, rolling with additional batch, immutable, traffic splitting, blue/green (swap URL).

## Lambda vs container vs EC2

| Criterion | Lambda | Container (ECS/EKS/Fargate) | EC2 |
|---|---|---|---|
| Runtime | Up to 15 minutes per invocation | Unlimited | Unlimited |
| Resources | Up to 10,240 MB RAM, vCPU proportional to RAM, /tmp up to 10 GB | Flexible per task | Any size, GPU |
| Model | Event-driven, scales per request | Long-running services, microservices | Full OS control, licensing, legacy software |
| Cold start | Yes (reduced with Provisioned Concurrency or SnapStart for some runtimes) | Task startup time | Boot time |
| Overhead | Lowest | Medium (Fargate is low) | Highest |

Quick rules:
- Event-driven, short, irregular traffic: Lambda.
- Jobs longer than 15 minutes, or needing a custom runtime/continuously running microservices: containers on Fargate.
- Need specific GPUs, kernel access, host-bound licenses: EC2 (or Dedicated Host).

### Lambda performance points to remember

- Increasing memory also increases CPU proportionally; CPU-heavy functions should get more memory.
- **Provisioned Concurrency** keeps pre-initialized environments ready to eliminate cold starts for predictable load.
- **Reserved concurrency** caps/guarantees concurrency for a function.
- When Lambda connects to RDS with many concurrent connections: put **RDS Proxy** in between.
`,
    keywords: [
      { trigger: 'run containers without managing servers or clusters', answer: 'Fargate (ECS or EKS)' },
      { trigger: 'existing Kubernetes workloads, open-source tooling', answer: 'Amazon EKS' },
      { trigger: 'job runs longer than 15 minutes', answer: 'ECS/Fargate or AWS Batch instead of Lambda' },
      { trigger: 'large-scale batch jobs with queues and Spot', answer: 'AWS Batch' },
      { trigger: 'deploy web app from source code, no infrastructure knowledge', answer: 'AWS App Runner / Elastic Beanstalk' },
      { trigger: 'eliminate Lambda cold start latency', answer: 'Provisioned Concurrency' },
      { trigger: 'private container registry with vulnerability scanning', answer: 'Amazon ECR' },
    ],
    traps: [
      'Lambda is limited to 15 minutes; longer jobs must use Fargate, Batch, or EC2.',
      'Fargate does not support GPU in ECS; GPU workloads need the EC2 launch type.',
      'An ECS task role differs from an EC2 instance profile: assign container permissions at the task role.',
      'Elastic Beanstalk is not serverless; it still runs EC2 underneath.',
      'Choose EKS only when the question mentions Kubernetes; otherwise ECS usually has less overhead.',
    ],
  },
  {
    slug: 'block-file-storage',
    domain: 'performance',
    title: 'Block and file storage: EBS, EFS, FSx',
    summary:
      'Compare EBS volume types with IOPS/throughput figures, EFS with its performance modes and storage classes, and the four FSx flavors for Windows, Lustre, ONTAP, and OpenZFS.',
    services: ['Amazon EBS', 'Amazon EFS', 'Amazon FSx for Windows File Server', 'Amazon FSx for Lustre', 'Amazon FSx for NetApp ONTAP', 'Amazon FSx for OpenZFS'],
    minutes: 12,
    body: `## Amazon EBS

EBS is network block storage attached to EC2 in the **same AZ**. Snapshots are stored in S3 (managed by AWS) and can be copied to another Region.

### Volume types (figures commonly seen in SAA-C03)

| Type | Kind | IOPS | Throughput | Notes |
|---|---|---|---|---|
| gp3 | General purpose SSD | Baseline 3,000, up to 16,000 | Baseline 125 MiB/s, up to 1,000 MiB/s | IOPS and throughput **tuned independently of size**, about 20% cheaper than gp2 |
| gp2 | General purpose SSD | 3 IOPS/GiB, minimum 100, maximum 16,000; small volumes burst to 3,000 | Up to 250 MiB/s | IOPS tied to size; to get more IOPS you must increase size |
| io2 Block Express | Provisioned IOPS SSD | Up to 256,000 | Up to 4,000 MiB/s | Sub-millisecond latency, 99.999% durability, volumes up to 64 TiB |
| io1 | Provisioned IOPS SSD | Up to 64,000 (on Nitro) | Up to 1,000 MiB/s | Previous generation, io2 is better at a similar price |
| st1 | Throughput optimized HDD | Up to 500 | Up to 500 MiB/s | Big data, logs, data warehouses, sequential reads |
| sc1 | Cold HDD | Up to 250 | Up to 250 MiB/s | Infrequently accessed data, cheapest |

- **Boot volumes** can only be SSD (gp2/gp3/io1/io2), **not st1/sc1**.
- For a database needing steady IOPS, low latency, above 16,000 IOPS: io2 Block Express.
- Instances also have an EBS bandwidth limit: choose an **EBS-optimized** instance that is large enough, otherwise a fast volume is still bottlenecked.

### Multi-Attach

- **io1/io2** only, attaches one volume to up to **16 Nitro instances in the same AZ**.
- The application must manage concurrent writes itself (cluster-aware file system), not regular ext4/XFS.

### Snapshots

- Incremental; can be copied cross-Region and shared cross-account.
- **Fast Snapshot Restore (FSR)**: eliminates the initialization latency when creating a volume from a snapshot (no pre-warming needed).
- **Snapshot Archive**: up to 75% cheaper, restore takes 24 to 72 hours. **Recycle Bin** protects against accidental deletion.
- **Data Lifecycle Manager (DLM)** automatically creates/deletes snapshots on a schedule.

## Amazon EFS

- **NFS (NFSv4.1)** file system for **Linux**, managed, capacity scales automatically, many instances (thousands) mount it at once across **multiple AZs**. Supports EC2, ECS, EKS, Lambda.
- **Performance mode**: General Purpose (default, low latency, for most cases) and Max I/O (older generation, higher aggregate throughput but higher latency; AWS recommends General Purpose + Elastic throughput).
- **Throughput mode**:
  - **Elastic** (recommended): throughput scales automatically with load, pay for what you use, suited to hard-to-predict load.
  - **Provisioned**: reserve fixed throughput up front, independent of size.
  - **Bursting**: throughput grows with stored capacity, uses burst credits.
- **Storage classes**: Standard, Infrequent Access (IA), Archive; **One Zone** and One Zone-IA for data that does not need multi-AZ (cheaper). **Lifecycle management** automatically moves infrequently used files to IA/Archive.

### EFS vs EBS

| | EBS | EFS |
|---|---|---|
| Kind | Block | File (NFS) |
| Scope | 1 AZ, usually attached to 1 instance (except Multi-Attach) | Multi-AZ, many instances at once |
| Capacity | Provisioned up front | Scales automatically, pay for use |
| OS | Any OS | Linux (POSIX) |
| Price | Cheaper per GB | More expensive per GB but has IA/Archive |

## Amazon FSx

| Flavor | Protocol | Use when |
|---|---|---|
| FSx for Windows File Server | SMB, NTFS, Active Directory integration, DFS | Windows applications, home directories, SharePoint, SQL Server; supports Multi-AZ |
| FSx for Lustre | Lustre (Linux), POSIX | HPC, ML training, simulation, video processing: hundreds of GB/s, millions of IOPS, sub-millisecond latency |
| FSx for NetApp ONTAP | NFS, SMB, iSCSI (multi-protocol) | Migrating on-prem NetApp, need snapshots, clones, dedup, compression, SnapMirror; access from Linux, Windows, macOS |
| FSx for OpenZFS | NFS | Migrating on-prem ZFS, very low latency, instant snapshots and clones |

### FSx for Lustre in detail

- **Scratch**: temporary storage, no replication, high burst throughput, cheap; for short-term processing.
- **Persistent**: data is replicated within the same AZ, for long-term processing and sensitive data.
- **S3 integration** (data repository association): the S3 bucket appears as files in Lustre, data is lazy-loaded on first read, and results can be exported back to S3. This is the classic answer for "process data stored in S3 with a high-performance file system".

## Quick selection

- Many Linux EC2 instances need to share files, multi-AZ: EFS.
- Windows, SMB, Active Directory: FSx for Windows File Server.
- HPC/ML needing extreme throughput, data in S3: FSx for Lustre.
- Need NFS + SMB + iSCSI at the same time, or already using NetApp: FSx for NetApp ONTAP.
- Database on a single EC2 needing high IOPS: EBS io2 Block Express.
`,
    keywords: [
      { trigger: 'increase IOPS without increasing volume size', answer: 'EBS gp3' },
      { trigger: 'more than 64,000 IOPS, sub-millisecond latency, single volume', answer: 'EBS io2 Block Express' },
      { trigger: 'same block volume attached to multiple instances in one AZ', answer: 'EBS Multi-Attach (io1/io2)' },
      { trigger: 'sequential throughput, big data, log processing, low cost HDD', answer: 'EBS st1' },
      { trigger: 'shared file system for Linux instances across multiple AZs', answer: 'Amazon EFS' },
      { trigger: 'SMB, Windows, Active Directory integration', answer: 'FSx for Windows File Server' },
      { trigger: 'HPC, ML training, data in S3, hundreds of GB/s', answer: 'FSx for Lustre' },
      { trigger: 'NFS, SMB and iSCSI multi-protocol, NetApp migration', answer: 'FSx for NetApp ONTAP' },
      { trigger: 'unpredictable file throughput, pay per use', answer: 'EFS Elastic throughput' },
    ],
    traps: [
      'st1/sc1 cannot be boot volumes.',
      'With gp2, getting more IOPS means increasing size; gp3 does not need that.',
      'Multi-Attach works only within 1 AZ and only on io1/io2; it is not a normal way to share files (use EFS).',
      'EFS does not support Windows; Windows needs FSx for Windows File Server.',
      'FSx for Lustre scratch does not replicate data, so do not use it for data that must last long-term.',
      'A fast volume is still limited by the instance EBS bandwidth.',
    ],
  },
  {
    slug: 's3-performance',
    domain: 'performance',
    title: 'Amazon S3 performance',
    summary:
      'Consistency model, request rates per prefix, multipart upload, Transfer Acceleration, byte-range fetches, S3 Express One Zone, and features such as event notifications, static website hosting, and CORS.',
    services: ['Amazon S3', 'S3 Transfer Acceleration', 'S3 Express One Zone', 'S3 Object Lambda', 'Amazon CloudFront'],
    minutes: 9,
    body: `## Consistency model

- Since late 2020, S3 provides **strong read-after-write consistency** for all PUT, DELETE, and LIST operations, at no extra charge.
- After a successful write, the next read always returns the latest version. There is no longer any need to design around "eventual consistency".

## Request rate and prefixes

- Each **prefix** supports at least **3,500 PUT/COPY/POST/DELETE** and **5,500 GET/HEAD** requests per second.
- There is no limit on the number of prefixes in a bucket. To increase throughput: **spread objects across multiple prefixes** (for example by date or by hash). 4 prefixes can reach 22,000 GET/s.
- S3 scales automatically; a sudden load increase may briefly cause 503 Slow Down errors, and clients should retry with exponential backoff.

## Speeding up uploads and downloads

| Technique | When to use |
|---|---|
| **Multipart upload** | Recommended for files over 100 MB, **required** for files over 5 GB (a single PUT is at most 5 GB). Upload parts in parallel; if a part fails, only resend that part |
| **Transfer Acceleration** | Upload/download through CloudFront edge locations, then over the AWS backbone to a distant bucket. Use for globally distributed users uploading into one bucket. Endpoint looks like bucket.s3-accelerate.amazonaws.com |
| **Byte-range fetches** | Download multiple parts of one object in parallel using the Range header; also used to fetch only the beginning of a file (the header) |
| **CloudFront** | Cache frequently read content near users, reducing requests to S3 |

## S3 Select

- Uses simple SQL to filter data **inside a single object** (CSV, JSON, Parquet), reducing the data transferred back.
- Note: AWS has stopped opening S3 Select to new customers (since 2024) and recommends Athena or client-side filtering. Older exams may still mention S3 Select; for queries across many objects, Athena is always the standard choice.

## S3 Express One Zone

- The highest-performance storage class: **single-digit millisecond** latency, up to about 10 times faster than S3 Standard, hundreds of thousands of requests per second.
- Data lives in **one AZ only** and uses a **directory bucket** (different from a general purpose bucket).
- Use for ML training and interactive analytics, placed in the same AZ as compute to reduce latency.
- Trade-off: lower availability because it is only 1 AZ.

## Event notifications

- When an event occurs (ObjectCreated, ObjectRemoved, Restore, Replication...), S3 sends it to **SNS, SQS, Lambda**, or sends all events to **Amazon EventBridge** for advanced filtering, multiple targets, archive, and replay.
- Classic pattern: uploading an image to S3 triggers Lambda to create a thumbnail.

## Static website hosting

- A bucket serves static HTML/CSS/JS through the website endpoint (HTTP). You must disable Block Public Access and have a bucket policy allowing public read, **or** better: use **CloudFront + Origin Access Control (OAC)** to keep the bucket private and get HTTPS.
- Dynamic (server-side) content cannot run on S3.

## CORS

- When a web page on domain A uses JavaScript to load resources from a bucket on domain B, the browser needs bucket B to return CORS headers.
- Configure **CORS rules on the bucket being called** (not the bucket hosting the page).

## S3 Object Lambda

- Attaches Lambda to the GET path to **transform data on read** (hide PII, resize images, convert formats) without storing multiple copies.
- Goes through an S3 Access Point + Object Lambda Access Point.

## Quick selection table

| Requirement | Answer |
|---|---|
| Upload large files fast and tolerate network errors | Multipart upload |
| Users on multiple continents uploading to 1 bucket | Transfer Acceleration |
| Increase GET/s beyond 5,500 | Add prefixes, or CloudFront cache |
| Single-digit ms latency for ML | S3 Express One Zone |
| Each app needs a different view of the same data | S3 Object Lambda |
| SQL queries across many files in S3 | Athena |
`,
    keywords: [
      { trigger: 'upload large files faster, resume failed uploads', answer: 'Multipart upload' },
      { trigger: 'global users upload to a single bucket in one Region', answer: 'S3 Transfer Acceleration' },
      { trigger: 'more than 5,500 GET requests per second', answer: 'Distribute objects across multiple prefixes / CloudFront' },
      { trigger: 'download only part of a large object, parallel download', answer: 'Byte-range fetches' },
      { trigger: 'single-digit millisecond latency, colocate with compute in one AZ', answer: 'S3 Express One Zone' },
      { trigger: 'trigger processing when object is uploaded', answer: 'S3 Event Notifications (Lambda/SQS/SNS/EventBridge)' },
      { trigger: 'redact data on retrieval without storing copies', answer: 'S3 Object Lambda' },
      { trigger: 'browser blocked loading assets from another bucket', answer: 'Configure CORS on target bucket' },
    ],
    traps: [
      'The 3,500/5,500 limits are per prefix, not per bucket.',
      'A single PUT is at most 5 GB; larger files require multipart upload.',
      'Transfer Acceleration helps when the geographic distance is large; it does not improve things when the client is in the same Region.',
      'S3 Express One Zone is in only 1 AZ, so it is not suitable for data that must survive an AZ loss.',
      'The S3 website endpoint does not support HTTPS directly; you need CloudFront.',
      'CORS is configured on the bucket that holds the called resources, not the calling bucket.',
    ],
  },
  {
    slug: 'relational-databases',
    domain: 'performance',
    title: 'Relational databases: RDS, Aurora, and Redshift',
    summary:
      'How to scale RDS with read replicas, RDS Proxy, and storage autoscaling; Aurora architecture, endpoints, Serverless v2, I/O-Optimized; and when to use Redshift instead of RDS.',
    services: ['Amazon RDS', 'Amazon Aurora', 'Amazon RDS Proxy', 'Aurora Serverless v2', 'Amazon Redshift'],
    minutes: 11,
    body: `## Amazon RDS

- Managed relational database: **MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2** (Aurora is a separate engine).
- AWS handles patching, automated backups (retention up to 35 days), and point-in-time restore. You choose the instance class and storage.
- **Instance sizing**: scale up (switch to a larger instance class) causes brief downtime; memory optimized (R) for large DBs.
- **Storage autoscaling**: automatically grows storage when nearly full; you set a maximum storage threshold. Use for workloads with unpredictable storage needs.
- **RDS Custom**: for Oracle and SQL Server when you need OS/DB access for customization.

## Read replica vs Multi-AZ

| | Read Replica | Multi-AZ (instance) | Multi-AZ DB cluster |
|---|---|---|---|
| Purpose | **Scale reads** (performance) | **High availability** | HA + reads |
| Replication | Asynchronous | Synchronous | Synchronous (semi-sync) |
| Reads from secondary | Yes | **No** (the standby takes no traffic) | Yes, 2 readable standbys |
| Location | Same AZ, different AZ, different Region | Different AZ in the same Region | 3 AZs |
| Failover | Manually promote to a standalone DB | Automatic, DNS endpoint unchanged | Automatic, faster |

- RDS MySQL, MariaDB, and PostgreSQL support up to **15 read replicas**.
- The app must send read queries to the replica endpoint itself (a separate connection string).
- Cross-Region replication incurs data transfer charges.

## RDS Proxy

- Managed connection pooling, sitting between the app and RDS/Aurora.
- Solves **too many connections** (especially from Lambda), reduces failover time (by up to about 66%), and preserves connections during failover.
- Supports IAM authentication and fetching credentials from Secrets Manager; accessible only within the VPC.

## Amazon Aurora

### Architecture

- Compatible with **MySQL** and **PostgreSQL**, with higher performance than RDS on the same engine (AWS claims up to 5 times MySQL, 3 times PostgreSQL).
- The cluster storage volume grows automatically and stores **6 copies across 3 AZs**; writes need 4/6, reads need 3/6; self-healing.
- Up to **15 Aurora Replicas** share the same storage, so replica lag is very low (usually under 100 ms). Failover to a replica is typically under 30 seconds.

### Endpoints

| Endpoint | Function |
|---|---|
| Cluster (writer) endpoint | Always points to the primary, used for writes |
| Reader endpoint | Load-balances connections across the replicas |
| Custom endpoint | Groups a specific set of replicas (for example larger replicas for analytics) |
| Instance endpoint | Connects directly to one instance |

### Performance features

- **Aurora Auto Scaling**: automatically adds/removes Aurora Replicas based on CPU or connection count.
- **Aurora Serverless v2**: capacity scales in ACUs almost instantly and at fine granularity, for variable workloads, multi-tenant, dev/test. You can mix provisioned and serverless instances in the same cluster.
- **Aurora Global Database**: cross-Region replication usually under 1 second, to multiple read-only secondary Regions, used for low-latency global reads and DR (RPO about 1 second, RTO under 1 minute).
- **Aurora I/O-Optimized**: no I/O charges, higher instance and storage prices; saves money when I/O cost is more than about 25% of the total Aurora cost.
- **Babelfish for Aurora PostgreSQL**: understands T-SQL and the SQL Server protocol, helping SQL Server apps move to Aurora PostgreSQL with few code changes.
- **Parallel Query**, **Backtrack** (MySQL), fast **Database cloning** for testing.

## Redshift vs RDS

| | RDS / Aurora | Amazon Redshift |
|---|---|---|
| Type | OLTP (transactions, many small queries) | OLAP / data warehouse (large analytical queries) |
| Storage | Row-based | Columnar, highly compressed, MPP |
| Data | GB to tens of TB | TB to PB |
| Scenario | Orders, users, shopping carts | BI reports, aggregates over historical data |

- Heavy reports running on the OLTP DB slow down production: the usual solution is a **read replica** (if the reports are simple) or **moving the data to Redshift** (if it is complex, high-volume analytics).
- Redshift Serverless for uneven analytic load when you do not want to manage a cluster.

## Exam tips

- "Read-heavy, reduce load on primary": read replica / Aurora Replica.
- "Too many connections, Lambda": RDS Proxy.
- "Unpredictable, intermittent workload": Aurora Serverless v2.
- "Global users, low-latency reads, cross-Region DR": Aurora Global Database.
- "Migrate SQL Server with minimal code changes to open-source": Babelfish.
`,
    keywords: [
      { trigger: 'read-heavy workload, offload reads from primary', answer: 'Read replicas / Aurora Replicas' },
      { trigger: 'Lambda exhausts database connections', answer: 'Amazon RDS Proxy' },
      { trigger: 'unpredictable or intermittent database workload', answer: 'Aurora Serverless v2' },
      { trigger: 'storage fills up unpredictably', answer: 'RDS storage autoscaling' },
      { trigger: 'reporting queries on specific replicas only', answer: 'Aurora custom endpoint' },
      { trigger: 'I/O charges are a large part of Aurora bill', answer: 'Aurora I/O-Optimized' },
      { trigger: 'SQL Server app to PostgreSQL with minimal code change', answer: 'Babelfish for Aurora PostgreSQL' },
      { trigger: 'complex analytics on petabytes, columnar', answer: 'Amazon Redshift' },
      { trigger: 'low-latency global reads with sub-second replication', answer: 'Aurora Global Database' },
    ],
    traps: [
      'A Multi-AZ standby (instance) does not serve reads; to scale reads you must use read replicas.',
      'Read replicas replicate asynchronously, so they can return stale data.',
      'Aurora Replicas max out at 15; RDS read replicas are also max 15 with MySQL/MariaDB/PostgreSQL.',
      'Redshift is not for OLTP; RDS is not a data warehouse for PB of data.',
      'RDS Proxy has no public endpoint; it is only usable within the VPC.',
    ],
  },
  {
    slug: 'nosql-caching',
    domain: 'performance',
    title: 'NoSQL and caching: DynamoDB, ElastiCache, purpose-built databases',
    summary:
      'DynamoDB design (partition key, RCU/WCU, GSI/LSI, DAX), caching strategies with ElastiCache, MemoryDB, and choosing the right purpose-built database.',
    services: ['Amazon DynamoDB', 'DynamoDB Accelerator (DAX)', 'Amazon ElastiCache', 'Amazon MemoryDB', 'Amazon DocumentDB', 'Amazon Neptune', 'Amazon Keyspaces', 'Amazon Timestream', 'Amazon OpenSearch Service'],
    minutes: 12,
    body: `## Amazon DynamoDB

NoSQL key-value and document database, serverless, single-digit millisecond latency at any scale. Items are at most **400 KB**.

### Partition key design

- Data is split by the hash of the **partition key**. A key with **high cardinality and even distribution** (userId, orderId) avoids a **hot partition**.
- Poor keys: status, the current date, values with few choices. You can add a random suffix (write sharding) to spread writes.
- **Composite key** = partition key + sort key, allowing range queries on the sort key.

### Capacity

- **1 RCU** = 1 strongly consistent read/second for an item up to **4 KB**, or 2 eventually consistent reads/second. Transactional reads cost double.
- **1 WCU** = 1 write/second for an item up to **1 KB**. Transactional writes cost double.
- Example: strongly consistent reads of 10 items of 6 KB per second: each item rounds up to 8 KB = 2 RCU, total 20 RCU.

| Mode | When to use |
|---|---|
| **On-demand** | Unpredictable load, new applications, sudden spikes; pay per request, no planning needed |
| **Provisioned + Auto Scaling** | Steady or predictably growing load; cheaper with consistent usage, reserved capacity can be purchased |

### GSI vs LSI

| | GSI | LSI |
|---|---|---|
| Key | Partition key and sort key **different** from the table | **Same** partition key, different sort key |
| When created | Any time | **Only at table creation** |
| Consistency | Eventually consistent only | Can be strongly consistent |
| Capacity | The index's own | Shared with the table |
| Limits | Max 20 per table (default) | Max 5; 10 GB limit per partition key value |

Note: a GSI that is write-throttled can throttle writes on the main table, so provision enough capacity for the GSI.

### Other features

- **DAX**: in-memory cache for DynamoDB, reads go from **milliseconds down to microseconds**, API-compatible (few code changes). Helps reads only (eventually consistent), not writes.
- **DynamoDB Streams**: records item changes in order, kept for 24 hours; triggers Lambda to process events, replicate, and update aggregates.
- **TTL**: automatically deletes expired items, consumes no WCU; used for sessions and temporary data.
- **Transactions**: TransactWriteItems/TransactGetItems, ACID across multiple items/tables.
- **Global Tables**: multi-Region, multi-active, low latency for global users.
- **Export to S3** (point-in-time) for analysis with Athena without consuming RCU.

## Amazon ElastiCache

| | Redis OSS / Valkey | Memcached |
|---|---|---|
| Data structures | Rich: string, hash, list, set, **sorted set** (leaderboard), pub/sub, geo | Simple key-value |
| HA | Replication, Multi-AZ, auto failover | No replication |
| Persistence | Snapshots/backups | None |
| Scale | Cluster mode (sharding) | Multi-threaded, client-side sharding |

- **Valkey** is an open-source fork of Redis, supported by ElastiCache at a lower price; for exam questions, treat it as part of the Redis family.
- ElastiCache also has a **Serverless** option.
- Use for: caching DB query results, **session store** (stateless applications), leaderboards, rate limiting.

### Caching strategies

| Strategy | How it works | Pros | Cons |
|---|---|---|---|
| **Lazy loading (cache-aside)** | Read the cache; on a miss, read the DB and write to the cache | Only caches data that is used; a cache failure does not break the app | A cache miss costs 3 steps; data can be stale |
| **Write-through** | Every DB write also writes to the cache | Cached data is always fresh | Slower writes; the cache holds data that is never read |
| **TTL** | Set an expiration time on keys | Balances freshness and hit rate | A TTL that is too short lowers the hit rate |

Lazy loading + write-through + TTL are commonly combined.

## Amazon MemoryDB

- Redis/Valkey-compatible but a **durable primary database** (Multi-AZ transaction log), microsecond reads, single-digit millisecond writes.
- Choose when you need in-memory speed **and** cannot lose data. ElastiCache is mainly a cache.

## Purpose-built databases

| Service | Type | Keywords |
|---|---|---|
| DocumentDB | Document, MongoDB-compatible | "MongoDB workload, JSON documents" |
| Neptune | Graph | "social network, relationships, fraud detection, knowledge graph" |
| Keyspaces | Wide-column, Apache Cassandra-compatible (CQL) | "Cassandra migration, serverless" |
| Timestream | Time series | "IoT sensor data, metrics over time" |
| OpenSearch Service | Search and log analytics | "full-text search, log analytics, dashboards" |
| QLDB | Ledger | End of support (2025), do not choose for new designs |
`,
    keywords: [
      { trigger: 'microsecond read latency for DynamoDB', answer: 'DynamoDB Accelerator (DAX)' },
      { trigger: 'unpredictable traffic, new application, no capacity planning', answer: 'DynamoDB on-demand' },
      { trigger: 'query by a different attribute after table creation', answer: 'Global Secondary Index (GSI)' },
      { trigger: 'automatically delete expired items', answer: 'DynamoDB TTL' },
      { trigger: 'react to item changes, trigger Lambda', answer: 'DynamoDB Streams' },
      { trigger: 'leaderboard, sorted sets, HA cache', answer: 'ElastiCache for Redis OSS / Valkey' },
      { trigger: 'durable in-memory primary database, Redis compatible', answer: 'Amazon MemoryDB' },
      { trigger: 'graph relationships, fraud detection', answer: 'Amazon Neptune' },
      { trigger: 'MongoDB compatible managed database', answer: 'Amazon DocumentDB' },
      { trigger: 'Cassandra workload, CQL, serverless', answer: 'Amazon Keyspaces' },
    ],
    traps: [
      'An LSI can only be created at table creation; for a new index on an existing table, use a GSI.',
      'A GSI does not support strongly consistent reads.',
      'DAX only speeds up reads and does not help write throttling; heavy writes need a better partition key spread or more WCU.',
      'Memcached has no replication or persistence; if you need HA, choose Redis OSS/Valkey.',
      'ElastiCache is a cache, not a durable primary database; for durability use MemoryDB.',
      'A partition key with few values (status, country) causes a hot partition.',
    ],
  },
  {
    slug: 'edge-networking',
    domain: 'performance',
    title: 'Edge and high-performance networking: CloudFront, Global Accelerator, Direct Connect',
    summary:
      'Optimize global latency with CloudFront and Global Accelerator, enhanced networking, Direct Connect bandwidth, and S3 Transfer Acceleration.',
    services: ['Amazon CloudFront', 'AWS Global Accelerator', 'AWS Direct Connect', 'S3 Transfer Acceleration', 'Lambda@Edge', 'CloudFront Functions'],
    minutes: 10,
    body: `## Amazon CloudFront

A CDN with hundreds of edge locations. Caches content near users, reducing latency and origin load. Supports HTTP/HTTPS and WebSocket.

### Origins

- **S3 bucket**: use **Origin Access Control (OAC)** so that only CloudFront can read the bucket (OAI is the older method).
- **Custom origin**: ALB, EC2, API Gateway, any HTTP server (including on-premises). For ALB/EC2, the origin must be reachable over the internet (or use **VPC origins** for ALB/EC2 in a private subnet).
- An **S3 website endpoint** is treated as a custom origin.

### Behaviors and caching

- **Cache behavior**: routes by path pattern (for example /api/* to ALB, /static/* to S3); each behavior has its own cache policy, viewer protocol policy, and allowed methods.
- **Cache policy**: defines the cache key (which headers, cookies, query strings) and the TTL (min/default/max). The fewer components in the cache key, the higher the cache hit ratio.
- **Origin request policy**: sends additional headers/cookies/query strings to the origin **without** including them in the cache key.
- **TTL**: the origin can control it with Cache-Control/Expires within the min/max TTL limits.
- **Invalidation**: removes objects from the cache before the TTL expires (charged beyond the free allowance). A better approach for frequent deployments: **versioned file names** (app.v2.js).

### Availability and security

- **Origin failover (origin group)**: primary and secondary origins; when the primary returns a configured error code (for example 500, 502, 503, 504) or times out, CloudFront tries the secondary. Applies to GET, HEAD, OPTIONS requests.
- **Geo restriction**: allowlist/blocklist by country.
- **Field-level encryption**: encrypts specific fields in a POST (for example card numbers) at the edge with a public key; only the backend holding the private key can decrypt.
- **Signed URLs / signed cookies** for private content; integrates with AWS WAF and Shield.

### Compute at the edge

| | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Runtime | Lightweight JavaScript | Node.js, Python |
| Duration | Under 1 ms | Up to a few seconds |
| Use for | Simple URL rewrites, headers, cache keys, redirects | Complex logic, network calls, body processing |

## AWS Global Accelerator

- Provides **2 global static anycast IPs**. Traffic enters the nearest edge, then travels over the **AWS backbone network** to endpoints (ALB, NLB, EC2, Elastic IP) in one or more Regions.
- Health checks and **very fast failover between Regions** (not dependent on DNS caching). Traffic dials and endpoint weights for traffic steering.
- Supports **TCP and UDP**: gaming, IoT, VoIP, applications that need fixed IPs for allowlisting.

### CloudFront vs Global Accelerator

| | CloudFront | Global Accelerator |
|---|---|---|
| Mechanism | Caches content at the edge | Proxies packets, no caching |
| Protocol | HTTP/HTTPS (WebSocket) | TCP, UDP |
| IP | Many dynamic IPs (uses DNS) | 2 static anycast IPs |
| Scenario | Static/dynamic web content, video | Non-HTTP, fixed IPs, fast multi-Region failover |

## Enhanced networking on EC2

- **ENA**: up to 100 Gbps or more depending on the instance, high PPS, low latency.
- **EFA**: for HPC/ML with MPI, OS-bypass.
- Combine with a **cluster placement group** for the highest bandwidth between nodes. A single flow's traffic is limited to less than the instance's total bandwidth.

## AWS Direct Connect

- A **private, dedicated** network connection from your data center to AWS through a Direct Connect location. Consistent latency and more guaranteed bandwidth than the internet.
- **Dedicated connection**: 1, 10, 100 Gbps (and 400 Gbps at some locations), its own physical port.
- **Hosted connection**: through an AWS Partner, from 50 Mbps to 10 Gbps (some partners support higher).
- Setup usually takes **several weeks**: not suitable for urgent needs.
- **Not encrypted** by default: use MACsec (on supported dedicated ports) or a VPN running over Direct Connect.
- **LAG** bundles multiple connections to increase bandwidth. **Direct Connect Gateway** connects to multiple VPCs/Regions.
- HA: 2 connections at 2 different locations, or a Site-to-Site VPN as backup.

## S3 Transfer Acceleration

- Uploads through a CloudFront edge location, then continues over the AWS backbone to the bucket. You are charged only when it actually speeds things up.
- Compared with Global Accelerator: Transfer Acceleration is for S3 only; Global Accelerator is for application endpoints.

## Quick selection

- Global website, static content, reduce origin load: CloudFront.
- UDP gaming, fixed IPs, multi-Region failover within seconds: Global Accelerator.
- Stable bandwidth, private, continuous large data transfer from on-prem: Direct Connect.
`,
    keywords: [
      { trigger: 'cache static content globally, reduce origin load', answer: 'Amazon CloudFront' },
      { trigger: 'static IP addresses, TCP/UDP, multi-Region failover', answer: 'AWS Global Accelerator' },
      { trigger: 'restrict S3 access to CloudFront only', answer: 'Origin Access Control (OAC)' },
      { trigger: 'automatic failover to secondary origin on 5xx', answer: 'CloudFront origin group' },
      { trigger: 'protect specific form fields end-to-end', answer: 'CloudFront field-level encryption' },
      { trigger: 'block content in specific countries', answer: 'CloudFront geo restriction' },
      { trigger: 'lightweight header rewrite at edge, sub-millisecond', answer: 'CloudFront Functions' },
      { trigger: 'consistent network performance, private dedicated link to on-premises', answer: 'AWS Direct Connect' },
    ],
    traps: [
      'Global Accelerator does not cache content; if you need caching, use CloudFront.',
      'CloudFront does not support UDP; UDP gaming needs Global Accelerator.',
      'Direct Connect takes several weeks to set up, so it is not a solution for an immediate requirement.',
      'Direct Connect is not encrypted by default; you need a VPN or MACsec.',
      'Frequent invalidations cost money; use versioned file names instead.',
      'Adding many headers/cookies to the cache key lowers the cache hit ratio.',
    ],
  },
  {
    slug: 'data-analytics',
    domain: 'performance',
    title: 'Streaming and analytics: Kinesis, Firehose, Athena, Glue, EMR, Redshift',
    summary:
      'Choose services for streaming ingest, ETL processing, data lake queries, and data warehouses; optimize with columnar formats and partitioning.',
    services: ['Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'Amazon Managed Service for Apache Flink', 'Amazon MSK', 'Amazon Athena', 'AWS Glue', 'Amazon EMR', 'Amazon Redshift', 'AWS Lake Formation', 'Amazon QuickSight', 'Amazon OpenSearch Service'],
    minutes: 12,
    body: `## Streaming ingest

| Service | Nature | When to choose |
|---|---|---|
| **Kinesis Data Streams** | Real-time stream, you write the consumers | Need custom processing, multiple consumers, replay, sub-second latency |
| **Amazon Data Firehose** (formerly Kinesis Data Firehose) | Fully managed delivery stream, near real-time | Just need to push data into S3, Redshift, OpenSearch, Splunk, HTTP endpoints, Snowflake, Apache Iceberg tables without writing code |
| **Managed Service for Apache Flink** (formerly Kinesis Data Analytics) | Stream processing with Apache Flink (SQL, Java, Python) | Real-time analytics: windowing, aggregation, anomaly detection on streams |
| **Amazon MSK** | Managed Apache Kafka (MSK Serverless available) | Already using Kafka, need Kafka API compatibility |

### Kinesis Data Streams in detail

- Provisioned mode: each **shard** accepts **1 MB/s or 1,000 records/s** for writes and **2 MB/s** for reads (shared among consumers).
- **Enhanced fan-out**: each consumer gets its own 2 MB/s per shard, with lower latency.
- **On-demand mode**: scales automatically, no shard management.
- Default retention is 24 hours, extendable up to 365 days. Data is ordered within a shard by partition key.
- Consumers: Lambda, KCL apps on EC2/ECS, Managed Service for Apache Flink, Firehose.

### Amazon Data Firehose in detail

- Scales automatically, no shards. **Buffers** by size/time and then writes in batches, so it is **near real-time**.
- Can **transform with Lambda**, **convert to Parquet/ORC**, compress, and use dynamic partitioning when writing to S3.
- Does not store data for replay; no multiple custom consumers.

## Querying and processing

### Amazon Athena

- **Serverless SQL** (Trino/Presto) directly on S3, pay by the **amount of data scanned**.
- Uses the Glue Data Catalog as its metastore. **Federated query** queries other sources (RDS, DynamoDB...) through connectors.
- To cut cost and speed things up: **columnar formats (Parquet/ORC)**, **compression**, **partitions** (by year/month/day), moderately large files (avoid millions of small files).

### AWS Glue

- **Crawler**: scans S3/DBs, infers the schema, and creates tables in the **Glue Data Catalog**.
- **Data Catalog**: central metastore for Athena, EMR, Redshift Spectrum.
- **Glue ETL jobs**: serverless Apache Spark for transformations (for example converting CSV to Parquet). **Job bookmarks** avoid reprocessing old data.
- **Glue DataBrew**: cleans and normalizes data through a visual interface, no code needed.

### Amazon EMR

- Managed Hadoop/Spark/Hive/Presto/HBase clusters, running on EC2, EKS, or **EMR Serverless**.
- Choose when you need control over big data frameworks, large Spark jobs, or to use Spot instances for task nodes.

### Amazon Redshift

- **Columnar, MPP** data warehouse, analytical SQL queries on TB to PB.
- **RA3** separates compute and storage (managed storage). **Redshift Serverless** needs no cluster management.
- **Concurrency scaling** adds capacity when many queries run concurrently. **Materialized views** speed up repeated queries.
- **Redshift Spectrum**: queries data on S3 directly from Redshift, joining with tables in the warehouse without loading.
- Zero-ETL integration from Aurora/RDS/DynamoDB to Redshift for near real-time analytics.

### Athena vs Redshift vs EMR

| | Athena | Redshift | EMR |
|---|---|---|---|
| Model | Serverless, ad hoc | Warehouse, frequent queries, BI | Customizable big data cluster |
| Data | On S3 | Loaded into Redshift (or Spectrum) | S3/HDFS |
| Fits | Occasional queries, low overhead | Complex dashboards, many joins, steady performance | Spark/Hadoop, custom ML pipelines |

## Governance and visualization

- **AWS Lake Formation**: quickly builds a data lake on S3, centralized permission management with **fine-grained control down to column, row, and cell**, tag-based access control, cross-account sharing. Built on the Glue Data Catalog.
- **Amazon QuickSight**: serverless BI, dashboards, the in-memory SPICE engine, ML insights.
- **Amazon OpenSearch Service**: full-text search, log analytics, dashboards (OpenSearch Dashboards). A Serverless option exists. Often paired with Firehose to ingest logs.

## Columnar formats and partitioning

| | CSV/JSON (row) | Parquet/ORC (columnar) |
|---|---|---|
| Reading a few columns | Must read whole rows | Reads only the needed columns |
| Compression | Poor | Good (same-typed data) |
| Athena cost | High | Much lower |

- **Partition** by frequently filtered columns (for example s3://bucket/logs/year=2026/month=10/) so Athena scans only the relevant partitions (partition pruning).

## Quick selection

- Real-time clickstream, multiple consumers: Kinesis Data Streams.
- Get logs into S3 with the least operations, convert to Parquet: Data Firehose.
- Ad hoc SQL on S3: Athena.
- Fine-grained permissions for a data lake: Lake Formation.
`,
    keywords: [
      { trigger: 'real-time streaming, multiple consumers, replay data', answer: 'Kinesis Data Streams' },
      { trigger: 'load streaming data into S3/Redshift/OpenSearch with no code', answer: 'Amazon Data Firehose' },
      { trigger: 'real-time analytics on streams with SQL/Flink', answer: 'Managed Service for Apache Flink' },
      { trigger: 'existing Apache Kafka workloads', answer: 'Amazon MSK' },
      { trigger: 'ad hoc SQL queries on data in S3, serverless', answer: 'Amazon Athena' },
      { trigger: 'discover schema and populate data catalog', answer: 'AWS Glue crawler + Data Catalog' },
      { trigger: 'query S3 data from data warehouse without loading', answer: 'Redshift Spectrum' },
      { trigger: 'fine-grained column/row-level permissions on data lake', answer: 'AWS Lake Formation' },
      { trigger: 'reduce Athena cost and improve performance', answer: 'Parquet/ORC + compression + partitioning' },
      { trigger: 'visual data preparation without code', answer: 'AWS Glue DataBrew' },
    ],
    traps: [
      'Firehose is near real-time (it buffers), not sub-second real-time, and it does not support replay.',
      'Firehose does not write directly to DynamoDB or RDS.',
      'Athena charges by data scanned; uncompressed CSV increases cost.',
      'Provisioned Kinesis Data Streams needs more shards when throttled (ProvisionedThroughputExceeded); or switch to on-demand.',
      'Use the new names: Amazon Data Firehose and Managed Service for Apache Flink; Kinesis Data Analytics is the old name.',
    ],
  },
  {
    slug: 'data-migration',
    domain: 'performance',
    title: 'Migrating data and workloads to AWS',
    summary:
      'DataSync, Storage Gateway, Transfer Family, Snow Family, DMS + SCT, Application Migration Service, and how to calculate network data transfer time.',
    services: ['AWS DataSync', 'AWS Storage Gateway', 'AWS Transfer Family', 'AWS Snowball Edge', 'AWS Database Migration Service', 'AWS Schema Conversion Tool', 'AWS Application Migration Service'],
    minutes: 10,
    body: `## AWS DataSync

- An automated, fast **online data transfer** service: from NFS, SMB, HDFS, S3-compatible object storage (and between AWS services) to **S3, EFS, FSx**.
- On-premises requires installing a **DataSync agent** (VM). Encrypts in transit automatically, verifies data integrity, supports scheduling, bandwidth limits, and preserves metadata/permissions.
- Runs over the internet or Direct Connect. Suited to **one-time migrations** or **periodic synchronization**.

## AWS Storage Gateway

Hybrid storage: on-premises uses familiar protocols, data lives in AWS, with a local cache for low latency.

| Type | Protocol | Stored in AWS | Use when |
|---|---|---|---|
| **S3 File Gateway** | NFS, SMB | Objects in S3 | On-prem file share but data lives in S3, lifecycle applies |
| **Volume Gateway - Cached** | iSCSI | S3 (as EBS snapshots), hot data cached locally | Extend block capacity without buying more storage |
| **Volume Gateway - Stored** | iSCSI | All data local, asynchronous backup to AWS | Need low latency for the entire dataset, back up to the cloud |
| **Tape Gateway** | iSCSI VTL | S3, S3 Glacier Flexible Retrieval/Deep Archive | Replace physical tapes, keep existing backup software |

Note: Amazon FSx File Gateway no longer accepts new customers; for Windows file shares, prefer accessing FSx for Windows File Server directly.

## AWS Transfer Family

- Fully managed **SFTP, FTPS, FTP, AS2** endpoints, storing data in **S3 or EFS**.
- Use when external partners still send files via SFTP and you do not want to change their clients. Authenticate via service-managed users, AD, or a custom identity provider.

## Snow Family (offline transfer)

- **Snowball Edge**: a physical device (Storage Optimized, Compute Optimized) to move tens to hundreds of TB when the network is slow or unavailable, and for edge computing.
- Current status: **Snowmobile is discontinued**, **Snowcone is discontinued**, and AWS has scaled back Snowball Edge (no longer open to new customers). AWS recommends DataSync over the network, Direct Connect, or AWS Data Transfer Terminal (a physical data transfer location). In SAA-C03, Snowball Edge can still be the answer for "hundreds of TB, limited bandwidth, must finish within a few weeks".

## Database migration: DMS + SCT

- **AWS DMS**: migrates databases with **minimal downtime**; the source DB stays operational during migration. **Full load + CDC** (change data capture) to sync continuously until cutover.
- **Homogeneous** (Oracle to Oracle, MySQL to Aurora MySQL): no schema conversion needed.
- **Heterogeneous** (Oracle to Aurora PostgreSQL, SQL Server to MySQL): use **AWS SCT** or **DMS Schema Conversion** to convert schemas and stored procedures; then DMS moves the data.
- DMS needs a **replication instance** (or DMS Serverless). Targets can be RDS, Aurora, Redshift, DynamoDB, S3, OpenSearch, Kinesis...
- Very large DBs: combine Snowball Edge + DMS (if available) or use native backup/restore.

## AWS Application Migration Service (MGN)

- **Lift-and-shift (rehost)** of physical servers, VMware, Hyper-V, or other clouds to EC2.
- Continuous block-level replication, non-disruptive test launches, cutover with a few minutes of downtime.
- Replaces CloudEndure Migration and Server Migration Service (SMS).
- **Migration Hub** tracks progress; **Application Discovery Service** collects server information before migration.

## Calculating data transfer time

Formula: time = size / effective bandwidth.

- 1 Gbps = 125 MB/s, about 10.8 TB/day at 100% utilization (in practice lower, usually about 80%).
- 100 Mbps: about 1.08 TB/day.

| Data | 100 Mbps | 1 Gbps | 10 Gbps |
|---|---|---|---|
| 10 TB | about 9-10 days | about 1 day | about 2-3 hours |
| 100 TB | about 3 months | about 9-10 days | about 1 day |
| 1 PB | about 2.5 years | about 3 months | about 9-10 days |

How to approach it: if the network transfer time exceeds the deadline (and Direct Connect takes several weeks to install), choose an offline device. If there is enough time and bandwidth, choose DataSync.

## Quick selection

| Scenario | Service |
|---|---|
| Move NFS/SMB to S3/EFS/FSx, scheduled, integrity checks | DataSync |
| On-prem app still needs NFS/SMB, data lives in S3 | S3 File Gateway |
| Replace tape backup | Tape Gateway |
| Partners send files via SFTP | Transfer Family |
| Migrate a DB with little downtime | DMS (+ SCT if the engine differs) |
| Rehost hundreds of servers | Application Migration Service |
`,
    keywords: [
      { trigger: 'online transfer from NFS/SMB to S3/EFS/FSx, scheduled, integrity verification', answer: 'AWS DataSync' },
      { trigger: 'on-premises apps access S3 via NFS/SMB with local cache', answer: 'S3 File Gateway' },
      { trigger: 'replace physical tape library, keep backup software', answer: 'Tape Gateway' },
      { trigger: 'iSCSI block storage backed by AWS, cache frequently accessed data', answer: 'Volume Gateway cached' },
      { trigger: 'partners upload via SFTP to S3', answer: 'AWS Transfer Family' },
      { trigger: 'migrate database with minimal downtime, CDC', answer: 'AWS DMS' },
      { trigger: 'convert schema between different database engines', answer: 'AWS SCT / DMS Schema Conversion' },
      { trigger: 'lift-and-shift servers to EC2 with minimal downtime', answer: 'AWS Application Migration Service' },
      { trigger: 'hundreds of TB, limited bandwidth, tight deadline', answer: 'Offline device (Snowball Edge)' },
    ],
    traps: [
      'DataSync is for moving/synchronizing data; Storage Gateway is for when on-prem apps need long-term access.',
      'DMS does not convert schemas between different engines on its own; you need SCT or DMS Schema Conversion.',
      'Direct Connect takes several weeks to set up and does not help a migration with an urgent deadline.',
      'Snowmobile and Snowcone are discontinued; do not choose them for new designs.',
      '1 Gbps is not 1 GB/s: it is only about 125 MB/s.',
    ],
  },
  {
    slug: 'ai-ml-services',
    domain: 'performance',
    title: 'AI/ML services: picking the right service by use case',
    summary:
      'SageMaker AI, Bedrock, Rekognition, Textract, Comprehend, Transcribe, Translate, Polly, Lex, Kendra, Personalize, Amazon Q, and how to tell the commonly confused pairs apart.',
    services: ['Amazon SageMaker AI', 'Amazon Bedrock', 'Amazon Rekognition', 'Amazon Textract', 'Amazon Comprehend', 'Amazon Transcribe', 'Amazon Translate', 'Amazon Polly', 'Amazon Lex', 'Amazon Kendra', 'Amazon Personalize', 'Amazon Q'],
    minutes: 10,
    body: `## Two tiers of AI/ML services

SAA-C03 does not go deep into algorithms; it asks **which service fits which use case**, often with "LEAST operational overhead".

- **Managed AI services** (Rekognition, Textract, Comprehend...): call an API, the model is already trained by AWS, no ML expertise needed.
- **Amazon Bedrock**: use ready-made **foundation models (FMs)** through an API for generative AI.
- **Amazon SageMaker AI**: build, train, and deploy **custom models** yourself when no ready-made service fits.

## Amazon SageMaker AI

- A complete ML platform (the new name of Amazon SageMaker; the name "SageMaker" now refers to the wider data and AI platform with Unified Studio).
- **Notebooks / SageMaker Studio**: a Jupyter environment to explore data and write code.
- **Training jobs**: train on managed instances (including GPUs), read data from S3, store model artifacts in S3.
- **Ground Truth**: data labeling (human + automated).
- **Deployment**: **real-time endpoints** (low latency, with auto scaling), **serverless inference** (intermittent traffic), **asynchronous inference** (large payloads, long processing), **batch transform** (batch predictions, no always-on endpoint).
- **JumpStart**: prebuilt models and solutions to get started quickly.

## Amazon Bedrock

- Fully managed, **serverless**: access FMs from many providers (Anthropic, Meta, Mistral, Amazon Nova...) through one API, with no infrastructure to manage.
- **Knowledge Bases**: RAG, answers grounded in company documents (for example in S3).
- **Agents**: FMs call APIs/Lambda to perform multi-step tasks.
- **Guardrails**: filter harmful content, block topics, mask PII.
- Supports **fine-tuning** with your own data. Customer data is not used to train the base models.

## Purpose-built AI services

### Vision and documents

- **Rekognition**: analyzes **images and video**: objects, scenes, **faces** (comparison, search in a collection), celebrities, **content moderation** (inappropriate content), PPE detection, text in images (signs, license plates). **Custom Labels** for your own labels.
- **Textract**: extracts **text, forms (key-value), and tables** from scanned documents and PDFs. Has dedicated APIs for invoices/receipts (AnalyzeExpense) and identity documents (AnalyzeID). Differs from plain OCR by understanding document **structure**.

### Language and speech

- **Comprehend**: NLP on text: **sentiment**, entities, key phrases, language detection, **PII detection and redaction**, custom classification. **Comprehend Medical**: extracts medical information and PHI from clinical notes.
- **Transcribe**: **speech to text**; custom vocabulary, speaker identification, PII redaction; Call Analytics for contact-center calls; Transcribe Medical.
- **Translate**: machine translation between languages, real-time or batch; custom terminology.
- **Polly**: **text to speech**; neural voices, SSML, lexicons.
- **Lex**: builds voice/text **chatbots** (ASR + NLU, the same technology as Alexa); intents, slots, Lambda fulfillment.

### Search, recommendations, assistants

- **Kendra**: **intelligent enterprise search**: users ask in natural language and get answers from internal documents; connectors to S3, SharePoint, databases...
- **Personalize**: real-time **recommendations** (product suggestions, personalized ranking) without ML experience.
- **Amazon Q**: generative AI assistant. **Q Business** answers questions from enterprise data while respecting access permissions; **Q Developer** helps write code, upgrade code, and work with AWS.

## Quick selection table

| Use case | Service |
|---|---|
| Train your own model on your own data, notebooks, endpoints | SageMaker AI |
| Generative AI (summarization, document Q&A chatbot) without managing infrastructure | Bedrock |
| Detect faces, objects, inappropriate content in images/video | Rekognition |
| Extract forms and tables from scanned documents, invoices | Textract |
| Analyze review sentiment, find PII in text | Comprehend |
| Extract medications and diagnoses from doctor notes | Comprehend Medical |
| Convert call recordings to text | Transcribe |
| Translate website content | Translate |
| Read articles aloud as audio | Polly |
| Chatbot for booking appointments, checking order status | Lex |
| Employees ask natural-language questions over internal documents | Kendra (or Q Business) |
| "You might also like" product suggestions | Personalize |
| Coding assistant in the IDE | Q Developer |

## Managed AI service or SageMaker?

- A **common** problem (form OCR, sentiment, translation, face recognition) with a requirement for **little operational effort and no ML experts**: choose the ready-made AI service.
- Need a **custom algorithm**, control over training, or a specialized problem no service covers: choose **SageMaker AI**.
- Need **generative AI** with existing FMs: choose **Bedrock** first; do not self-host an LLM on EC2/SageMaker unless the question requires it.
- Typical pipeline: an S3 event triggers Lambda, Lambda calls Textract/Rekognition/Comprehend, and results are stored in DynamoDB or S3.

## Commonly confused pairs

| Pair | How to tell them apart |
|---|---|
| Textract vs Rekognition (text) | Textract: documents, forms, tables. Rekognition: short text in natural images (signs, license plates) |
| Comprehend vs Kendra | Comprehend analyzes text (sentiment, entities). Kendra searches and answers questions over a document corpus |
| Transcribe vs Polly | Transcribe: speech to text. Polly: text to speech |
| Lex vs Connect | Lex: chatbot engine. Amazon Connect: cloud contact center that can integrate Lex |
| Comprehend vs Translate | Comprehend detects the language but does not translate; Translate translates |

Note: Amazon Forecast and Amazon Fraud Detector are closed to new customers; do not choose them as the answer for new designs.
`,
    keywords: [
      { trigger: 'build, train, and deploy custom ML models, notebooks, endpoints', answer: 'Amazon SageMaker AI' },
      { trigger: 'generative AI with foundation models, no infrastructure to manage', answer: 'Amazon Bedrock' },
      { trigger: 'detect faces, objects, inappropriate content in images or videos', answer: 'Amazon Rekognition' },
      { trigger: 'extract text, forms, and tables from scanned documents', answer: 'Amazon Textract' },
      { trigger: 'sentiment analysis, entities, detect PII in text', answer: 'Amazon Comprehend' },
      { trigger: 'convert speech or call recordings to text', answer: 'Amazon Transcribe' },
      { trigger: 'convert text to lifelike speech', answer: 'Amazon Polly' },
      { trigger: 'conversational chatbot with voice and text', answer: 'Amazon Lex' },
      { trigger: 'natural language search across internal documents', answer: 'Amazon Kendra' },
      { trigger: 'real-time personalized product recommendations', answer: 'Amazon Personalize' },
    ],
    traps: [
      'Rekognition can detect text in images but does not extract forms/tables; for documents choose Textract.',
      'Transcribe and Polly go in opposite directions: Transcribe listens, Polly speaks.',
      'Comprehend analyzes text and is not a document search tool; Q&A over a document corpus is Kendra or Q Business.',
      'Do not choose SageMaker when a ready-made AI service fits and the question asks for least operational overhead.',
      'Lex is only the chatbot; a full contact center is Amazon Connect.',
      'Forecast and Fraud Detector are closed to new customers; do not choose them for new designs.',
    ],
  },
];
