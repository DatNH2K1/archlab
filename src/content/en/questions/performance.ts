import type { Question } from '@/content/types';

export const performanceQuestionsEn: Question[] = [
  {
    id: 'perf-001',
    domain: 'performance',
    lesson: 'ec2-compute',
    stem: 'A research company runs a tightly coupled computational fluid dynamics simulation that uses MPI across 64 Linux EC2 instances. The nodes exchange large volumes of data and the job is sensitive to inter-node latency. Which solution provides the HIGHEST network performance between the nodes?',
    options: [
      'Launch the instances in a spread placement group across three Availability Zones and enable enhanced networking with ENA.',
      'Launch the instances in a partition placement group and attach an additional elastic network interface to each instance.',
      'Launch the instances in a cluster placement group in a single Availability Zone and use instance types that support Elastic Fabric Adapter (EFA).',
      'Launch the instances in an Auto Scaling group across multiple Availability Zones behind a Network Load Balancer.',
    ],
    answer: [2],
    explanation:
      'A cluster placement group places instances close together in 1 AZ for the lowest latency and highest bandwidth; EFA provides OS-bypass for MPI applications, which fits tightly coupled HPC. A spread placement group spreads instances across different racks/AZs, which increases latency and allows at most 7 instances per AZ. A partition placement group is for distributed rack-aware workloads (Hadoop, Cassandra), and adding an ENI does not increase bandwidth. NLB and a multi-AZ Auto Scaling group do not serve node-to-node communication in HPC.',
  },
  {
    id: 'perf-002',
    domain: 'performance',
    lesson: 'ec2-compute',
    stem: 'A company runs a small application tier of five critical EC2 instances. Each instance holds a unique role, and the company must minimize the risk that a single hardware failure affects more than one instance. Which placement strategy should a solutions architect use?',
    options: [
      'A spread placement group',
      'A cluster placement group',
      'A partition placement group with one partition',
      'Dedicated Hosts with host affinity enabled',
    ],
    answer: [0],
    explanation:
      'A spread placement group puts each instance on its own hardware (rack), which suits a small number of critical instances (at most 7 running instances per AZ). A cluster group packs instances together, so one hardware failure can affect several instances. A partition group with one partition means all instances share the same set of racks. Dedicated Hosts serve licensing/compliance needs, and host affinity ties instances to the same host, the opposite of the requirement.',
  },
  {
    id: 'perf-003',
    domain: 'performance',
    lesson: 'ec2-compute',
    stem: 'A company runs an analytics application on EC2 instances that take more than 20 minutes to load reference data into memory after the operating system starts. The instances are stopped every night to save cost. The company wants the application to be ready faster each morning. What should a solutions architect do?',
    options: [
      'Move the reference data to an instance store volume so it is available immediately after the instance starts.',
      'Create a new AMI every night and launch new instances from the AMI each morning.',
      'Use larger instance types so that the data loads faster during startup.',
      'Enable EC2 hibernation on instances with an encrypted EBS root volume large enough to hold the instance memory, and hibernate the instances instead of stopping them.',
    ],
    answer: [3],
    explanation:
      'EC2 Hibernate saves RAM contents to the EBS root volume (encryption required) and restores them on start, so the application does not have to reload data into memory. Instance store loses data on stop. An AMI contains only disk data, not RAM state, so the data would still need to be reloaded. Larger instances cost more and still have to reload the data.',
  },
  {
    id: 'perf-004',
    domain: 'performance',
    lesson: 'ec2-compute',
    stem: 'An Auto Scaling group launches EC2 instances that run a long user data script to install packages and dependencies. New instances take 15 minutes to become healthy, which causes poor performance during traffic spikes. The company also needs the operating system to be patched monthly. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Increase the health check grace period of the Auto Scaling group to 20 minutes.',
      'Use EC2 Image Builder to create a pipeline that builds and patches a golden AMI monthly, and update the launch template to use the latest AMI.',
      'Move the user data script to an S3 bucket and download it during boot to speed up execution.',
      'Replace the Auto Scaling group with a fixed number of instances sized for peak traffic.',
    ],
    answer: [1],
    explanation:
      'A golden AMI with pre-installed software makes instances start fast; EC2 Image Builder automatically builds, tests, and patches AMIs on a schedule, so it has the least operational overhead. Increasing the grace period only prevents instances from being marked unhealthy; it does not speed up startup. Downloading the script from S3 does not reduce installation time. Running a fixed fleet sized for peak costs more and does not address the patching requirement.',
  },
  {
    id: 'perf-005',
    domain: 'performance',
    lesson: 'ec2-compute',
    stem: 'A company is deploying a self-managed Apache Cassandra cluster on EC2. The database requires very high random I/O with low latency. Cassandra already replicates data across nodes, and the company wants to reduce the impact of correlated rack failures. Which combination of actions meets these requirements MOST cost-effectively? (Choose TWO.)',
    options: [
      'Use General Purpose instances with Provisioned IOPS SSD (io2) volumes for all data.',
      'Use storage optimized instances with local NVMe instance store volumes for the data files.',
      'Use a cluster placement group so that all nodes are in the same rack.',
      'Use Amazon EFS with Max I/O performance mode as the data directory.',
      'Use a partition placement group and map Cassandra racks to partitions.',
    ],
    answer: [1, 4],
    explanation:
      'Storage optimized (I family) with NVMe instance store gives very high random IOPS, low latency, and no EBS charges; because Cassandra already replicates data, the ephemeral nature of instance store is acceptable. A partition placement group puts each partition on its own set of racks, letting Cassandra be topology-aware and reducing correlated failures. io2 is much more expensive for the same IOPS. A cluster placement group increases the risk of rack failure. EFS is a network file system, not suitable for Cassandra data files that need low latency.',
  },
  {
    id: 'perf-006',
    domain: 'performance',
    lesson: 'containers-compute',
    stem: 'A company is containerizing a stateless web application. The operations team is small and does not want to provision, patch, or scale EC2 instances for the containers. The application does not use Kubernetes. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Deploy the containers on Amazon EKS with self-managed node groups.',
      'Install Docker on EC2 instances in an Auto Scaling group and run the containers with user data scripts.',
      'Deploy the containers on Amazon ECS using the AWS Fargate launch type behind an Application Load Balancer.',
      'Deploy the containers on Amazon ECS using the EC2 launch type with a capacity provider.',
    ],
    answer: [2],
    explanation:
      'ECS on Fargate is serverless: you do not manage EC2 and AWS handles the infrastructure; ECS is simpler than EKS when Kubernetes is not needed. An EKS self-managed node group requires managing nodes and learning Kubernetes. Self-managed Docker on EC2 is the highest overhead. The ECS EC2 launch type still requires patching and managing EC2 even though a capacity provider helps with scaling.',
  },
  {
    id: 'perf-007',
    domain: 'performance',
    lesson: 'containers-compute',
    stem: 'A company runs a nightly data processing job as an AWS Lambda function. As data volume has grown, the job now needs about 45 minutes to finish and fails with timeouts. The job is packaged as a container image. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Run the job as an Amazon ECS task on AWS Fargate, scheduled by an Amazon EventBridge rule.',
      'Increase the Lambda function timeout to 60 minutes.',
      'Split the job into Lambda functions invoked in sequence by EC2 instances.',
      'Launch an EC2 instance each night with a cron job and terminate it manually after the job finishes.',
    ],
    answer: [0],
    explanation:
      'Fargate runs containers with no time limit and no server management; an EventBridge Scheduler/rule triggers the task every night. Lambda is limited to 15 minutes, so it cannot be set to 60 minutes. Using EC2 to invoke Lambda sequentially is complex and still leaves EC2 to manage. EC2 with cron and manual shutdown costs operational effort.',
  },
  {
    id: 'perf-008',
    domain: 'performance',
    lesson: 'containers-compute',
    stem: 'A company runs dozens of microservices on a self-managed Kubernetes cluster in its data center. The company uses Helm charts and Kubernetes operators and wants to move to AWS without rewriting deployment manifests while reducing control plane management. Which solution should a solutions architect recommend?',
    options: [
      'Migrate the services to Amazon ECS and convert the Helm charts to ECS task definitions.',
      'Migrate the services to AWS Elastic Beanstalk multi-container Docker environments.',
      'Rewrite each microservice as an AWS Lambda function behind Amazon API Gateway.',
      'Migrate the services to Amazon EKS with managed node groups.',
    ],
    answer: [3],
    explanation:
      'EKS is standard Kubernetes with an AWS-managed control plane, preserving Helm charts and operators; a managed node group reduces node management effort. ECS and Elastic Beanstalk require converting manifests. Rewriting for Lambda is a major change, contradicting the no-rewrite requirement.',
  },
  {
    id: 'perf-009',
    domain: 'performance',
    lesson: 'containers-compute',
    stem: 'A company uses AWS Lambda functions behind Amazon API Gateway for a mobile backend. Every weekday at 9:00 AM, traffic increases sharply and users report slow responses for the first requests because of function initialization. The traffic pattern is predictable. What should a solutions architect do to improve response time?',
    options: [
      'Increase the reserved concurrency of the functions.',
      'Configure provisioned concurrency for the functions and use Application Auto Scaling to schedule it before 9:00 AM.',
      'Increase the function timeout and add retries in the mobile client.',
      'Move the functions into a VPC to reduce network latency.',
    ],
    answer: [1],
    explanation:
      'Provisioned concurrency keeps initialized environments ready, eliminating cold starts; because the load is predictable, it can be scheduled with Application Auto Scaling. Reserved concurrency only caps/guarantees concurrency and does not pre-initialize environments. Increasing the timeout and retries does not reduce latency. Putting the function in a VPC does not reduce cold starts and may add complexity.',
  },
  {
    id: 'perf-010',
    domain: 'performance',
    lesson: 'containers-compute',
    stem: 'A startup wants to deploy a containerized REST API from its source code repository. The developers have no experience with load balancers, VPC design, or container orchestration. The service must scale automatically with traffic and be served over HTTPS. Which AWS service meets these requirements with the LEAST operational overhead?',
    options: [
      'Amazon EKS with the AWS Load Balancer Controller',
      'Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer',
      'AWS App Runner',
      'AWS Batch with Fargate compute environments',
    ],
    answer: [2],
    explanation:
      'App Runner takes source code or a container image and automatically builds, deploys, provides an HTTPS endpoint, load balancing, and auto scaling, with no infrastructure knowledge needed. EKS and EC2 + ALB require managing many components. AWS Batch is for batch jobs, not an API serving requests.',
  },
  {
    id: 'perf-011',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'A company is migrating a mission-critical Oracle database to a single large EC2 instance. The database requires 120,000 IOPS with consistent sub-millisecond latency and high durability for a 20 TiB data volume. Which EBS volume type should a solutions architect choose?',
    options: [
      'General Purpose SSD (gp3)',
      'Throughput Optimized HDD (st1)',
      'Provisioned IOPS SSD (io1)',
      'Provisioned IOPS SSD (io2 Block Express)',
    ],
    answer: [3],
    explanation:
      'io2 Block Express supports up to 256,000 IOPS, sub-millisecond latency, and 99.999% durability, which suits a critical database needing 120,000 IOPS. gp3 cannot reach this IOPS level on a single volume. st1 is an HDD for sequential reads with low IOPS. io1 maxes out at 64,000 IOPS and has lower durability than io2.',
  },
  {
    id: 'perf-012',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'An application runs on an EC2 instance with a 500 GiB General Purpose SSD (gp2) volume, which provides a baseline of 1,500 IOPS. The application now needs a consistent 6,000 IOPS, but the data size will not grow. Which solution meets this requirement MOST cost-effectively?',
    options: [
      'Modify the volume to gp3 and provision 6,000 IOPS.',
      'Increase the gp2 volume size to 2,000 GiB.',
      'Modify the volume to io2 and provision 6,000 IOPS.',
      'Create a RAID 0 array of four gp2 volumes of 500 GiB each.',
    ],
    answer: [0],
    explanation:
      'gp3 lets you tune IOPS independently of size (baseline 3,000, up to 16,000) and is cheaper than gp2, so switching to gp3 and setting 6,000 IOPS is the cheapest option (it can be done online with Elastic Volumes). gp2 would need 2,000 GiB (3 IOPS/GiB) to reach 6,000 IOPS, paying for unused capacity. io2 is much more expensive for this IOPS level. RAID 0 across four volumes still pays for 2,000 GiB and is more complex.',
  },
  {
    id: 'perf-013',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'A content management system runs on Linux EC2 instances in an Auto Scaling group across three Availability Zones. All instances must read and write the same set of files. Throughput demand is spiky and difficult to predict. Which storage solution meets these requirements with the LEAST operational overhead?',
    options: [
      'An EBS io2 volume with Multi-Attach enabled and attached to all instances',
      'Amazon EFS with the Elastic throughput mode',
      'Amazon FSx for Windows File Server with a Multi-AZ deployment',
      'An S3 bucket mounted on each instance with a custom synchronization script',
    ],
    answer: [1],
    explanation:
      'EFS is managed NFS for Linux, mounted concurrently by many instances across multiple AZs; Elastic throughput scales automatically with hard-to-predict load and charges by usage. EBS Multi-Attach works only in 1 AZ and needs a cluster-aware file system. FSx for Windows uses SMB, which suits Windows and is not a natural choice for Linux. Syncing S3 with scripts costs effort and does not guarantee file system semantics.',
  },
  {
    id: 'perf-014',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'A company is migrating Windows-based file servers to AWS. Users access shares through SMB, and permissions are managed with the company\'s Microsoft Active Directory. The solution must remain available if an Availability Zone fails. Which solution should a solutions architect recommend?',
    options: [
      'Amazon EFS with One Zone storage and a backup policy',
      'Amazon S3 with an S3 File Gateway deployed on an EC2 instance',
      'Amazon FSx for Windows File Server with a Multi-AZ deployment joined to Active Directory',
      'Amazon FSx for Lustre with a persistent deployment type',
    ],
    answer: [2],
    explanation:
      'FSx for Windows File Server supports SMB, NTFS ACLs, Active Directory integration, and has Multi-AZ to survive an AZ failure. EFS does not support Windows/SMB, and One Zone does not survive an AZ failure. S3 File Gateway on a single EC2 creates a single point of failure and is not a true Windows file server. FSx for Lustre is for HPC on Linux.',
  },
  {
    id: 'perf-015',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'A machine learning team stores a 50 TB training dataset in Amazon S3. Training jobs run for a few days on a GPU cluster and require a POSIX file system with hundreds of GB/s of throughput. The file system is needed only while the job runs, and the results must be written back to S3. Which solution is MOST cost-effective?',
    options: [
      'Copy the dataset to an Amazon EFS file system with Provisioned throughput.',
      'Attach an EBS io2 volume to each GPU instance and copy the dataset to every volume.',
      'Create an Amazon FSx for NetApp ONTAP file system and replicate the S3 data with SnapMirror.',
      'Create an Amazon FSx for Lustre scratch file system linked to the S3 bucket, and export results back to S3.',
    ],
    answer: [3],
    explanation:
      'FSx for Lustre delivers hundreds of GB/s of throughput; S3 integration lets it lazy-load data and export results back to S3; the scratch deployment is cheap and suits short-term processing that does not need replication. EFS does not reach this throughput and incurs copy costs. Copying the dataset onto many io2 volumes is very expensive and slow. SnapMirror is used between ONTAP systems and does not replicate from S3.',
  },
  {
    id: 'perf-016',
    domain: 'performance',
    lesson: 'block-file-storage',
    stem: 'A company runs a cluster-aware application that requires shared block storage with high IOPS. Several EC2 instances must write to the same volume concurrently, and the application coordinates the writes. Which actions must a solutions architect take to meet these requirements? (Choose TWO.)',
    options: [
      'Use a Provisioned IOPS SSD (io2) volume and enable Multi-Attach.',
      'Use a General Purpose SSD (gp3) volume and enable Multi-Attach.',
      'Use an Amazon EFS file system mounted on all instances.',
      'Launch all the Nitro-based instances in the same Availability Zone as the volume.',
      'Use a Throughput Optimized HDD (st1) volume shared across Availability Zones.',
    ],
    answer: [0, 3],
    explanation:
      'EBS Multi-Attach supports only io1/io2 and only Nitro instances in the same AZ as the volume (up to 16 instances). gp3 does not support Multi-Attach. EFS is file storage, not shared block storage as required. st1 does not support Multi-Attach, and EBS cannot be shared across multiple AZs.',
  },
  {
    id: 'perf-017',
    domain: 'performance',
    lesson: 's3-performance',
    stem: 'An application stores millions of images in a single S3 bucket under the prefix images/. During peak hours, the application issues about 20,000 GET requests per second and receives HTTP 503 Slow Down errors. Which solution will improve performance with the LEAST changes to the architecture?',
    options: [
      'Enable S3 Transfer Acceleration on the bucket.',
      'Distribute the objects across multiple prefixes, such as images/0/ through images/7/, based on a hash of the object name.',
      'Enable S3 Versioning to create more copies of each object.',
      'Move the objects to the S3 Standard-Infrequent Access storage class.',
    ],
    answer: [1],
    explanation:
      'S3 supports at least 5,500 GET/s per prefix; spreading objects across multiple prefixes lets S3 scale in parallel, reaching 20,000 GET/s. Transfer Acceleration optimizes geographic distance and does not raise the per-prefix request rate. Versioning does not increase throughput. Standard-IA also charges retrieval fees and does not improve performance.',
  },
  {
    id: 'perf-018',
    domain: 'performance',
    lesson: 's3-performance',
    stem: 'A media company has users in Asia, Europe, and South America who upload video files of 2-10 GB to an S3 bucket in us-east-1. Uploads are slow and often fail partway through. Which combination of features should a solutions architect recommend to improve upload speed and reliability?',
    options: [
      'Enable S3 Transfer Acceleration and use multipart upload.',
      'Create a CloudFront distribution with a cache policy that caches PUT requests.',
      'Use byte-range fetches and S3 Select.',
      'Enable Cross-Region Replication to buckets in each continent and use single PUT requests.',
    ],
    answer: [0],
    explanation:
      'Transfer Acceleration brings uploads into an edge location near the user and then over the AWS backbone; multipart upload splits the file into parts uploaded in parallel, and a failed part only needs to be resent (and it is required for files over 5 GB). CloudFront does not cache PUT. Byte-range fetch and S3 Select are for reading data. A single PUT cannot exceed 5 GB, and CRR does not help the initial upload.',
  },
  {
    id: 'perf-019',
    domain: 'performance',
    lesson: 's3-performance',
    stem: 'A company trains machine learning models on EC2 instances in a single Availability Zone. The training job reads millions of small objects and requires consistent single-digit millisecond latency with very high request rates. The dataset can be re-created if it is lost. Which storage option provides the BEST performance?',
    options: [
      'S3 Standard with S3 Transfer Acceleration enabled',
      'S3 Intelligent-Tiering with the Archive Instant Access tier',
      'S3 Express One Zone in a directory bucket in the same Availability Zone as the instances',
      'S3 One Zone-Infrequent Access',
    ],
    answer: [2],
    explanation:
      'S3 Express One Zone gives single-digit millisecond latency and a very high request rate, placed in the same AZ as compute; the data can be recreated, so storing it in 1 AZ is acceptable. Transfer Acceleration only optimizes long-distance transfer. Intelligent-Tiering optimizes cost, not latency. One Zone-IA is for infrequently accessed data, has retrieval fees, and is not faster than Standard.',
  },
  {
    id: 'perf-020',
    domain: 'performance',
    lesson: 's3-performance',
    stem: 'A company allows users to upload profile photos to an S3 bucket. Each uploaded photo must be resized into three thumbnail sizes within seconds. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Run a cron job on an EC2 instance every minute to list new objects and resize them.',
      'Use an S3 Lifecycle rule to transition new objects to a thumbnail storage class.',
      'Use AWS Batch to process the bucket contents every hour.',
      'Configure an S3 event notification for ObjectCreated events that invokes an AWS Lambda function to create the thumbnails.',
    ],
    answer: [3],
    explanation:
      'An S3 Event Notification invokes Lambda as soon as the object is created, serverless and processing within seconds. Cron on EC2 means managing servers, and continuous LISTs are inefficient. A lifecycle rule only transitions storage classes or deletes objects and does not process images. An hourly batch does not meet the within-seconds requirement.',
  },
  {
    id: 'perf-021',
    domain: 'performance',
    lesson: 's3-performance',
    stem: 'A company hosts a static single-page application in an S3 bucket. The site must be served globally over HTTPS with low latency, and the bucket must not be publicly accessible. Which combination of steps meets these requirements? (Choose TWO.)',
    options: [
      'Enable static website hosting and add a bucket policy that allows public s3:GetObject.',
      'Place an Application Load Balancer in front of the bucket with an HTTPS listener.',
      'Create an Amazon CloudFront distribution with the bucket as the origin and an ACM certificate for the custom domain.',
      'Enable S3 Transfer Acceleration on the bucket.',
      'Configure Origin Access Control (OAC) and update the bucket policy to allow access only from the CloudFront distribution.',
    ],
    answer: [2, 4],
    explanation:
      'CloudFront delivers content globally over HTTPS with an ACM certificate; OAC lets the bucket stay private and readable only by CloudFront. A public bucket policy violates the no-public requirement, and the website endpoint does not support HTTPS. ALB does not use an S3 bucket as a target. Transfer Acceleration is for long-distance upload/download and does not serve an HTTPS website.',
  },
  {
    id: 'perf-022',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'An e-commerce application uses an Amazon RDS for MySQL DB instance. Business analysts run read-only reporting queries during business hours, which increases CPU utilization on the database and slows down customer transactions. What should a solutions architect do to improve application performance?',
    options: [
      'Create a read replica and direct the reporting queries to the read replica endpoint.',
      'Enable Multi-AZ and direct the reporting queries to the standby instance.',
      'Enable RDS storage autoscaling.',
      'Increase the backup retention period and run reports from automated backups.',
    ],
    answer: [0],
    explanation:
      'A read replica (asynchronous replication) accepts read queries, offloading the primary. The standby of a Multi-AZ instance deployment does not serve reads and is used only for failover. Storage autoscaling only increases storage and does not reduce CPU. A backup is not a place to run queries directly.',
  },
  {
    id: 'perf-023',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'A serverless application uses AWS Lambda functions that connect to an Amazon Aurora PostgreSQL cluster. During traffic spikes, thousands of concurrent function invocations open new database connections, and the database returns "too many connections" errors. Which solution resolves this issue with the LEAST code changes?',
    options: [
      'Increase the instance size of the Aurora writer to raise the max_connections parameter.',
      'Create an Amazon RDS Proxy for the cluster and update the Lambda functions to connect to the proxy endpoint.',
      'Add Aurora Replicas and connect the functions to the reader endpoint.',
      'Configure reserved concurrency of 1 for the Lambda functions.',
    ],
    answer: [1],
    explanation:
      'RDS Proxy pools and reuses connections (connection pooling), handling the many short-lived connections from Lambda well; you only need to change the endpoint. A larger instance is costly and can still run out of connections during spikes. The reader endpoint cannot handle write queries and still opens many connections. Reserved concurrency of 1 slows the application severely.',
  },
  {
    id: 'perf-024',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'A company has an Amazon Aurora MySQL cluster with one writer and five Aurora Replicas. Two of the replicas use a larger instance class and should serve only long-running analytics queries, while the other three replicas serve application reads. Which solution meets these requirements?',
    options: [
      'Use the cluster endpoint for analytics and the reader endpoint for application reads.',
      'Create a second Aurora cluster for analytics and replicate with binary logs.',
      'Use the reader endpoint for both workloads and set a lower failover priority on the large replicas.',
      'Create a custom endpoint that includes the two large replicas for analytics, and a second custom endpoint for the other three replicas for application reads.',
    ],
    answer: [3],
    explanation:
      'A custom endpoint lets you group a specific set of instances, separating the analytics workload from the application workload. The cluster endpoint points to the writer, and running analytics on it slows writes. Creating a second cluster adds cost and operations. The reader endpoint balances across all replicas, and failover priority does not control how queries are distributed.',
  },
  {
    id: 'perf-025',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'A SaaS company runs an internal reporting database that is idle most of the day but experiences unpredictable bursts of heavy activity lasting a few minutes. The company wants a MySQL-compatible database that scales capacity automatically and quickly to match demand without manual intervention. Which solution meets these requirements?',
    options: [
      'Amazon RDS for MySQL with storage autoscaling enabled',
      'Amazon RDS for MySQL with a scheduled scaling action that changes the instance class',
      'Amazon Aurora MySQL with Aurora Serverless v2 instances',
      'Amazon Redshift Serverless',
    ],
    answer: [2],
    explanation:
      'Aurora Serverless v2 scales compute (ACUs) almost instantly and at fine granularity with load, which suits erratic workloads. Storage autoscaling only increases storage, not compute. Changing the instance class on a schedule cannot handle unpredictable bursts and causes disruption. Redshift is not MySQL-compatible and is a data warehouse.',
  },
  {
    id: 'perf-026',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'A global gaming company runs its player profile database on Amazon Aurora PostgreSQL in us-east-1. Players in Europe and Asia experience high read latency. The company also needs disaster recovery in another Region with an RPO of about 1 second. Which solution meets these requirements?',
    options: [
      'Configure Aurora Global Database with secondary Regions in Europe and Asia and route local reads to the secondary clusters.',
      'Create cross-Region read replicas using native PostgreSQL logical replication on EC2 instances.',
      'Enable Multi-AZ on the Aurora cluster and add Aurora Replicas in us-east-1.',
      'Take hourly snapshots and copy them to Europe and Asia.',
    ],
    answer: [0],
    explanation:
      'Aurora Global Database replicates at the storage level to another Region, usually in under 1 second, enabling low-latency reads in the secondary Region and DR with an RPO of about 1 second and an RTO under 1 minute. Self-managed logical replication on EC2 costs operational effort. A replica in the same Region does not reduce latency for distant users and gives no cross-Region DR. Hourly snapshots have an RPO of up to 1 hour.',
  },
  {
    id: 'perf-027',
    domain: 'performance',
    lesson: 'relational-databases',
    stem: 'A company is moving an application from Microsoft SQL Server to Amazon Aurora PostgreSQL to reduce licensing costs. The development team wants to keep most existing T-SQL queries unchanged. After migration, the workload is expected to be very I/O intensive, with I/O charges forecast to exceed 30% of the Aurora bill. Which actions should a solutions architect recommend? (Choose TWO.)',
    options: [
      'Migrate to Aurora MySQL instead, because it supports T-SQL natively.',
      'Enable Babelfish for Aurora PostgreSQL.',
      'Deploy Amazon Redshift to handle the T-SQL queries.',
      'Configure the Aurora cluster to use the Aurora I/O-Optimized storage configuration.',
      'Enable Multi-AZ on the cluster to eliminate I/O charges.',
    ],
    answer: [1, 3],
    explanation:
      'Babelfish lets Aurora PostgreSQL understand T-SQL and the SQL Server protocol, reducing code changes. Aurora I/O-Optimized has no I/O charges, saving money when I/O is more than about 25% of the cost. Aurora MySQL does not support T-SQL. Redshift is a data warehouse, not an OLTP target for the app. Multi-AZ does not affect I/O charges.',
  },
  {
    id: 'perf-028',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'A retail application uses Amazon DynamoDB to store product catalog data. During flash sales, read traffic for popular items increases dramatically, and the business requires response times in microseconds. The company wants to minimize application code changes. What should a solutions architect recommend?',
    options: [
      'Switch the table to on-demand capacity mode.',
      'Add a global secondary index on the product category attribute.',
      'Place an Amazon ElastiCache for Memcached cluster in front of the table and implement lazy loading in the application.',
      'Deploy DynamoDB Accelerator (DAX) and point the application to the DAX cluster endpoint.',
    ],
    answer: [3],
    explanation:
      'DAX is an in-memory cache compatible with the DynamoDB API, reducing read latency from milliseconds to microseconds and requiring only a client/endpoint change. On-demand helps handle load, but latency stays in the millisecond range. A GSI serves new query patterns and does not reduce latency. ElastiCache requires rewriting cache logic in code, so it means more change.',
  },
  {
    id: 'perf-029',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'A company stores order events in a DynamoDB table that uses order_status (PENDING, SHIPPED, DELIVERED) as the partition key. Even though the table has enough provisioned capacity in total, write requests are throttled during peak hours. What should a solutions architect do to resolve the throttling?',
    options: [
      'Enable DynamoDB Streams on the table.',
      'Add a local secondary index on order_status.',
      'Redesign the table to use a high-cardinality partition key such as order_id.',
      'Enable TTL so that old orders are deleted automatically.',
    ],
    answer: [2],
    explanation:
      'The partition key has only 3 values, so writes concentrate on a few partitions (a hot partition); using a high-cardinality key such as order_id spreads the load evenly. Streams only record changes. An LSI uses the same partition key, so it does not solve this, and it can only be created at table creation. TTL deletes old data and does not spread writes.',
  },
  {
    id: 'perf-030',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'An existing DynamoDB table uses customer_id as the partition key and order_date as the sort key. The application now needs to efficiently query orders by product_id. The table is already in production. What should a solutions architect do?',
    options: [
      'Create a local secondary index with product_id as the sort key.',
      'Create a global secondary index with product_id as the partition key.',
      'Use a Scan operation with a filter expression on product_id.',
      'Create a new table and copy all items with product_id as the sort key.',
    ],
    answer: [1],
    explanation:
      'A GSI can be created at any time with a partition key different from the table, enabling efficient queries by product_id. An LSI can only be created at table creation and must still use customer_id as the partition key. A Scan reads the whole table, consuming RCU and slow. Creating a new table is complex and unnecessary.',
  },
  {
    id: 'perf-031',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'A web application runs on EC2 instances behind an Application Load Balancer and stores user session data in local memory. Users are logged out when Auto Scaling terminates instances. The company wants the web tier to be stateless and the session store to be highly available with sub-millisecond latency. Which solution meets these requirements?',
    options: [
      'Store session data in Amazon ElastiCache for Redis OSS (or Valkey) with Multi-AZ and automatic failover enabled.',
      'Store session data in Amazon ElastiCache for Memcached with multiple nodes.',
      'Enable sticky sessions on the Application Load Balancer.',
      'Store session data on an EBS volume attached to each instance.',
    ],
    answer: [0],
    explanation:
      'ElastiCache Redis OSS/Valkey supports replication, Multi-AZ, auto failover, and sub-millisecond latency, which suits an HA session store. Memcached has no replication, so sessions are lost when a node fails. Sticky sessions still lose the session when the instance is terminated and the web tier is not stateless. EBS is attached to individual instances and cannot be shared.',
  },
  {
    id: 'perf-032',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'A financial services company wants to detect fraud rings by analyzing relationships among accounts, devices, IP addresses, and transactions. Queries need to traverse many levels of connections with low latency. Which database should a solutions architect recommend?',
    options: [
      'Amazon DynamoDB with global secondary indexes',
      'Amazon Timestream',
      'Amazon Redshift with materialized views',
      'Amazon Neptune',
    ],
    answer: [3],
    explanation:
      'Neptune is a graph database, optimized for queries traversing multi-level relationships such as fraud ring detection and social networks. DynamoDB is not efficient at traversing multi-hop relationships. Timestream is for time series data. Redshift serves aggregate analytics, not low-latency graph traversal.',
  },
  {
    id: 'perf-033',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'An application needs to perform 20 strongly consistent reads per second on a DynamoDB table using provisioned capacity. Each item is 6 KB. How many read capacity units (RCUs) must be provisioned?',
    options: ['20 RCUs', '30 RCUs', '40 RCUs', '60 RCUs'],
    answer: [2],
    explanation:
      '1 RCU = 1 strongly consistent read/second for an item up to 4 KB. A 6 KB item rounds up to 8 KB, so each read needs 2 RCU; 20 reads x 2 = 40 RCU. 20 RCU is the figure for items up to 4 KB. 30 RCU comes from the 6/4 ratio without rounding up. 60 RCU is an incorrect calculation (for example multiplying by 3).',
  },
  {
    id: 'perf-034',
    domain: 'performance',
    lesson: 'edge-networking',
    stem: 'A gaming company runs a multiplayer game server on EC2 instances behind Network Load Balancers in two AWS Regions. The game uses UDP. Players worldwide need low latency, and the company\'s partners require a fixed set of IP addresses to allowlist. If one Region fails, traffic must fail over within seconds. Which solution meets these requirements?',
    options: [
      'Amazon CloudFront with both NLBs configured as an origin group',
      'AWS Global Accelerator with endpoint groups for the NLBs in both Regions',
      'Amazon Route 53 latency-based routing with health checks and a low TTL',
      'Elastic IP addresses attached to each EC2 instance with a DNS round-robin record',
    ],
    answer: [1],
    explanation:
      'Global Accelerator provides 2 static anycast IPs, supports UDP, brings traffic onto the AWS backbone from the nearest edge, and fails over between Regions within seconds thanks to health checks, independent of DNS caching. CloudFront does not support UDP. Route 53 depends on DNS TTL/client caching and does not provide fixed IPs. An Elastic IP on each instance is not HA and does not optimize latency.',
  },
  {
    id: 'perf-035',
    domain: 'performance',
    lesson: 'edge-networking',
    stem: 'A news website runs on EC2 instances behind an Application Load Balancer in a single Region. Most traffic consists of images, CSS, and JavaScript files that rarely change. Users on other continents report slow page loads, and the EC2 instances are heavily loaded. Which solution will MOST improve performance?',
    options: [
      'Add more EC2 instances to the Auto Scaling group.',
      'Deploy the application to a second Region and use Route 53 weighted routing.',
      'Enable cross-zone load balancing on the Application Load Balancer.',
      'Create an Amazon CloudFront distribution in front of the ALB and cache static content at edge locations.',
    ],
    answer: [3],
    explanation:
      'CloudFront caches static content at the edge near users, reducing latency and offloading the ALB/EC2. Adding EC2 reduces load but does not solve geographic latency. Deploying a second Region is costly, and weighted routing is not based on user location. Cross-zone load balancing does not affect latency for distant users.',
  },
  {
    id: 'perf-036',
    domain: 'performance',
    lesson: 'edge-networking',
    stem: 'A company serves a website through Amazon CloudFront with an S3 bucket in us-east-1 as the origin. The company wants CloudFront to automatically retrieve content from a replica bucket in us-west-2 if the primary bucket returns 5xx errors. What should a solutions architect configure?',
    options: [
      'Create an origin group with the us-east-1 bucket as the primary origin and the us-west-2 bucket as the secondary origin, and set failover criteria for 5xx status codes.',
      'Configure Route 53 failover routing between the two buckets and use the record as the CloudFront origin.',
      'Create two CloudFront distributions and use Global Accelerator to switch between them.',
      'Enable S3 Transfer Acceleration on both buckets.',
    ],
    answer: [0],
    explanation:
      'A CloudFront origin group supports origin failover: when the primary returns a configured error code (5xx), CloudFront automatically sends the request to the secondary origin; combine with S3 Cross-Region Replication to have the data in the secondary bucket. Route 53 failover with an S3 REST endpoint is not the standard approach. Global Accelerator does not use CloudFront as an endpoint. Transfer Acceleration does not provide failover.',
  },
  {
    id: 'perf-037',
    domain: 'performance',
    lesson: 'edge-networking',
    stem: 'An online payment form is served through Amazon CloudFront. The company requires that the credit card number field be encrypted at the edge and remain encrypted as it passes through the web servers, so that only a specific backend payment service can decrypt it. Which feature should a solutions architect use?',
    options: [
      'Origin Access Control',
      'HTTPS between viewers and CloudFront only',
      'CloudFront field-level encryption',
      'CloudFront signed cookies',
    ],
    answer: [2],
    explanation:
      'Field-level encryption encrypts specific fields in a POST at the edge with a public key; the data stays encrypted as it passes through intermediate tiers, and only the service holding the private key can decrypt it. OAC restricts access to the S3 origin. HTTPS only protects data in transit, and the web server still sees plaintext. Signed cookies control access to content and do not encrypt data.',
  },
  {
    id: 'perf-038',
    domain: 'performance',
    lesson: 'edge-networking',
    stem: 'A company uses Amazon CloudFront in front of an API that returns product pages. The cache hit ratio is below 10% because the distribution forwards all headers, cookies, and query strings to the origin and includes them in the cache key. The origin needs a tracking cookie for logging, but the response does not vary by that cookie. How can a solutions architect improve the cache hit ratio?',
    options: [
      'Create an invalidation for all paths every 5 minutes.',
      'Use a cache policy that includes only the query strings that change the response, and use an origin request policy to forward the tracking cookie to the origin without adding it to the cache key.',
      'Increase the minimum TTL to one year and keep forwarding all values in the cache key.',
      'Replace CloudFront with AWS Global Accelerator.',
    ],
    answer: [1],
    explanation:
      'The fewer components in the cache key, the higher the hit ratio. A cache policy should include only values that change the response; an origin request policy sends additional cookies to the origin without putting them in the cache key. Invalidation lowers the hit ratio and costs money. Increasing the TTL does not help when every request has a different cache key. Global Accelerator does not cache.',
  },
  {
    id: 'perf-039',
    domain: 'performance',
    lesson: 'data-analytics',
    stem: 'A company collects clickstream data from its website. Three different applications must process the same data in real time: a fraud detector, a recommendation engine, and an archiving job. The company must be able to reprocess the last 3 days of data if a bug is found. Which service should be used to ingest the data?',
    options: [
      'Amazon Kinesis Data Streams with the retention period increased to 3 days',
      'Amazon Data Firehose delivering to Amazon S3',
      'Amazon SQS standard queue',
      'Amazon SNS standard topic with three subscriptions',
    ],
    answer: [0],
    explanation:
      'Kinesis Data Streams lets multiple consumers read the same data in real time and replay within the retention period (extendable up to 365 days). Firehose is near real-time, only delivers to destinations, and does not support multiple custom consumers or replay. SQS deletes messages after processing, and a message is handled by only one consumer. SNS does not store data for replay.',
  },
  {
    id: 'perf-040',
    domain: 'performance',
    lesson: 'data-analytics',
    stem: 'A company wants to deliver application logs from thousands of servers to Amazon S3 in Apache Parquet format so that analysts can query them with Amazon Athena. A delay of a few minutes is acceptable. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Send the logs to Kinesis Data Streams and write a custom consumer on EC2 that converts the records to Parquet.',
      'Write the logs to S3 as JSON and run an Amazon EMR cluster every hour to convert them to Parquet.',
      'Send the logs to an Amazon SQS queue and use a Lambda function to batch and convert the records.',
      'Send the logs to Amazon Data Firehose with record format conversion to Parquet and Amazon S3 as the destination.',
    ],
    answer: [3],
    explanation:
      'Amazon Data Firehose is fully managed, buffers automatically, converts the format to Parquet/ORC (using the schema in the Glue Data Catalog), and writes to S3; a delay of a few minutes is acceptable. A self-written consumer on EC2, an EMR cluster, or Lambda that batches on its own all add operational effort.',
  },
  {
    id: 'perf-041',
    domain: 'performance',
    lesson: 'data-analytics',
    stem: 'Analysts use Amazon Athena to query several terabytes of uncompressed CSV log files stored in S3. Most queries filter by date and select only a few columns. Queries are slow and expensive. Which solution will improve query performance and reduce cost the MOST?',
    options: [
      'Move the files to S3 Glacier Instant Retrieval.',
      'Increase the Athena workgroup query timeout.',
      'Convert the data to compressed Apache Parquet and partition it by date in S3.',
      'Load the data into Amazon RDS for PostgreSQL and run the queries there.',
    ],
    answer: [2],
    explanation:
      'Athena charges by data scanned. Parquet is a columnar format (reads only the needed columns) and compresses well; partitioning by day lets it skip irrelevant partitions. Glacier Instant Retrieval does not reduce data scanned and has retrieval fees. Increasing the timeout does not improve performance. RDS is not suited to analyzing many TB of logs.',
  },
  {
    id: 'perf-042',
    domain: 'performance',
    lesson: 'data-analytics',
    stem: 'A company has built a data lake on Amazon S3 that is cataloged in the AWS Glue Data Catalog. Different teams query the data with Athena and Redshift Spectrum. The company must restrict access so that the marketing team cannot see specific columns containing personal data, and must manage these permissions centrally. Which solution meets these requirements?',
    options: [
      'Create separate S3 buckets for each team and copy the allowed columns into each bucket.',
      'Use AWS Lake Formation to grant column-level permissions on the Data Catalog tables.',
      'Use S3 bucket policies with conditions on the column names.',
      'Encrypt the personal data columns with a separate AWS KMS key.',
    ],
    answer: [1],
    explanation:
      'Lake Formation manages permissions centrally on the Data Catalog, supports fine-grained access down to columns, rows, and cells, and applies to Athena, Redshift Spectrum, and EMR. Copying data per team costs effort and creates duplication. A bucket policy works only at the object level and does not understand columns. KMS encryption is not a column-level permission mechanism for queries.',
  },
  {
    id: 'perf-043',
    domain: 'performance',
    lesson: 'data-analytics',
    stem: 'A company stores 5 years of historical sales data as Parquet files in Amazon S3 and keeps the most recent 3 months in an Amazon Redshift cluster. Analysts want to run SQL queries that join recent data in Redshift with historical data in S3 without loading the historical data into the cluster. Which steps should a solutions architect take? (Choose TWO.)',
    options: [
      'Create external tables in Redshift and query the S3 data with Redshift Spectrum.',
      'Use the COPY command to load all historical data into the Redshift cluster.',
      'Run an AWS Glue crawler to catalog the historical data in the AWS Glue Data Catalog.',
      'Stream the historical data into Redshift with Amazon Kinesis Data Streams.',
      'Store the historical data in Amazon EMR with Apache HBase.',
    ],
    answer: [0, 2],
    explanation:
      'Redshift Spectrum queries data directly on S3 through external tables and can join with tables in Redshift; a Glue crawler creates the schema in the Data Catalog to serve as the external schema. COPY means loading into the cluster, contrary to the requirement. Kinesis is a streaming service, not for historical data. EMR HBase adds unnecessary infrastructure and cannot join directly with Redshift.',
  },
  {
    id: 'perf-044',
    domain: 'performance',
    lesson: 'data-migration',
    stem: 'A company needs to migrate 50 TB of data from an on-premises NFS server to Amazon EFS over an existing AWS Direct Connect connection. The transfer must be automated, verify data integrity, preserve file metadata, and run on a schedule until cutover. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Mount the EFS file system on-premises and use rsync with a cron job.',
      'Deploy an S3 File Gateway and copy the data to S3, then copy it from S3 to EFS.',
      'Order multiple Snowball Edge devices and import the data into EFS.',
      'Deploy an AWS DataSync agent on premises and create a scheduled DataSync task with an EFS location.',
    ],
    answer: [3],
    explanation:
      'DataSync automatically transfers NFS/SMB data to EFS, S3, FSx, with integrity checks, metadata preservation, scheduling, and runs over Direct Connect. rsync and cron must be managed and error-checked by yourself. A File Gateway followed by a copy is a complex two-step process. Snowball is not suitable when Direct Connect is already in place and periodic sync is needed until cutover.',
  },
  {
    id: 'perf-045',
    domain: 'performance',
    lesson: 'data-migration',
    stem: 'A company wants to migrate an on-premises Oracle database to Amazon Aurora PostgreSQL. The database must stay online during the migration, and downtime at cutover must be minimal. Which approach should a solutions architect recommend?',
    options: [
      'Use AWS SCT (or DMS Schema Conversion) to convert the schema, then use AWS DMS with full load and change data capture (CDC) to migrate and replicate the data until cutover.',
      'Export the database with Oracle Data Pump and import the dump file into Aurora PostgreSQL.',
      'Use AWS DMS with full load only, without converting the schema.',
      'Use AWS Application Migration Service to replicate the database server to EC2, then promote it to Aurora.',
    ],
    answer: [0],
    explanation:
      'A heterogeneous migration (different engine types) needs SCT/DMS Schema Conversion to convert the schema and code; DMS full load + CDC keeps the source online and syncs continuously, with downtime only at cutover. Data Pump cannot import into PostgreSQL. DMS does not convert schemas between different engines on its own, and a full load without CDC causes long downtime. Application Migration Service rehosts servers to EC2 and does not migrate to Aurora.',
  },
  {
    id: 'perf-046',
    domain: 'performance',
    lesson: 'data-migration',
    stem: 'A company uses backup software that writes to a physical tape library in its data center. The company wants to stop managing physical tapes and store backups durably in AWS with low-cost long-term archiving, without changing its backup software or processes. Which solution should a solutions architect recommend?',
    options: [
      'Deploy an S3 File Gateway and point the backup software to an SMB share.',
      'Use AWS DataSync to copy the tapes to Amazon S3 Glacier Deep Archive.',
      'Deploy AWS Storage Gateway Tape Gateway and archive virtual tapes to S3 Glacier Deep Archive.',
      'Deploy a Volume Gateway in stored mode and back up the volumes with EBS snapshots.',
    ],
    answer: [2],
    explanation:
      'Tape Gateway emulates a tape library (VTL over iSCSI), so the backup software stays unchanged; virtual tapes are stored in S3 and can be archived to Glacier Flexible Retrieval/Deep Archive. File Gateway requires changing the backup target to a file share. DataSync does not read physical tapes. Volume Gateway is block storage, not a tape interface.',
  },
  {
    id: 'perf-047',
    domain: 'performance',
    lesson: 'data-migration',
    stem: 'A logistics company receives daily inventory files from hundreds of external partners over SFTP. The company is moving to AWS and wants the files to land in Amazon S3. Partners must not change their existing SFTP clients or workflows. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Run an SFTP server on an EC2 instance and use a cron job to copy uploaded files to S3.',
      'Create an AWS Transfer Family SFTP server with Amazon S3 as the storage backend.',
      'Ask partners to upload files directly to S3 with presigned URLs.',
      'Deploy an S3 File Gateway and expose it to partners over the internet.',
    ],
    answer: [1],
    explanation:
      'AWS Transfer Family provides a fully managed SFTP endpoint that stores directly into S3, and partners keep their existing clients. SFTP on EC2 requires self-managed operation, patching, and HA. Presigned URLs force partners to change their process. File Gateway uses NFS/SMB, not SFTP, and is not designed to be exposed to outsiders over the internet.',
  },
  {
    id: 'perf-048',
    domain: 'performance',
    lesson: 'data-migration',
    stem: 'A company must migrate 40 TB of file data from its data center to Amazon S3 within 10 days. The data center has a 1 Gbps internet connection, and about 80% of the bandwidth can be dedicated to the migration. Which solution meets the deadline with the LEAST effort?',
    options: [
      'Order a new 10 Gbps AWS Direct Connect dedicated connection and transfer the data over it.',
      'Use AWS DataSync over the existing internet connection to transfer the data to S3.',
      'Compress the data and upload it with a custom script that uses single PUT requests.',
      'Wait until the data center bandwidth is upgraded to 10 Gbps and then use the AWS CLI.',
    ],
    answer: [1],
    explanation:
      '1 Gbps is about 125 MB/s, or about 10.8 TB/day; at 80% utilization it is about 8.6 TB/day, so 40 TB takes about 5 days, meeting the 10-day deadline. DataSync is automated, optimizes bandwidth, and verifies integrity. A new Direct Connect usually takes several weeks to set up. A self-written script with a single PUT is limited to 5 GB per object and costs effort. Waiting for a bandwidth upgrade does not guarantee the deadline.',
  },
  {
    id: 'perf-049',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A company receives thousands of scanned loan application forms as PDF files in an Amazon S3 bucket each day. The company needs to extract the applicant names, addresses, and the values from tables in each form, and store the results in Amazon DynamoDB. The company has no machine learning expertise. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Use Amazon Rekognition text detection on each page and parse the output with an AWS Lambda function.',
      'Train a custom document extraction model with Amazon SageMaker AI and deploy it to a real-time endpoint.',
      'Configure an S3 event notification to invoke an AWS Lambda function that calls Amazon Textract to analyze forms and tables, and write the results to DynamoDB.',
      'Use Amazon Comprehend to detect entities in the PDF files and write the entities to DynamoDB.',
    ],
    answer: [2],
    explanation:
      'Textract extracts text, forms (key-value pairs), and tables from scanned documents, and it is a ready-made service, so no ML expertise is needed; S3 events + Lambda create a serverless pipeline. Rekognition text detection only finds short text in images and does not understand form/table structure. SageMaker requires training and operating your own endpoint, which is much more effort. Comprehend analyzes plain text, cannot read scanned PDFs, and does not extract tables.',
  },
  {
    id: 'perf-050',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A social media company allows users to upload images and videos. The company must automatically detect and flag explicit or violent content before it is published. The solution must scale with demand and require minimal development effort. Which AWS service should a solutions architect use?',
    options: [
      'Amazon Rekognition content moderation',
      'Amazon Comprehend custom classification',
      'Amazon Textract',
      'A custom computer vision model trained with Amazon SageMaker AI',
    ],
    answer: [0],
    explanation:
      'Rekognition content moderation detects inappropriate content (explicit, violent...) in images and video through a ready-made API that scales automatically. Comprehend only analyzes text. Textract extracts text from documents. A custom model trained on SageMaker requires significant development and operational effort, which contradicts the requirement.',
  },
  {
    id: 'perf-051',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A company stores thousands of internal documents, including policies, manuals, and FAQs, in Amazon S3 and Microsoft SharePoint. Employees want to ask questions in natural language, such as "How many vacation days do new employees get?", and receive precise answers from the documents. Which service meets these requirements?',
    options: [
      'Amazon Comprehend',
      'Amazon Lex',
      'Amazon Athena',
      'Amazon Kendra',
    ],
    answer: [3],
    explanation:
      'Kendra is an intelligent enterprise search service: it accepts natural-language questions and returns answers from documents, with connectors for S3 and SharePoint. Comprehend analyzes sentiment/entities and does not search documents. Lex builds chatbots but does not index and search documents by itself. Athena runs SQL queries on structured data in S3 and does not understand natural-language questions over text.',
  },
  {
    id: 'perf-052',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A news website wants to offer an audio version of every article so that users can listen instead of read. New articles are published every few minutes. The solution must generate natural-sounding speech with minimal operational overhead. Which solution should a solutions architect recommend?',
    options: [
      'Use Amazon Transcribe to convert each article into an audio file and store it in Amazon S3.',
      'Use Amazon Polly to synthesize speech from each article and store the audio file in Amazon S3.',
      'Use Amazon Lex to read each article aloud when a user opens it.',
      'Deploy an open source text-to-speech model on Amazon EC2 instances in an Auto Scaling group.',
    ],
    answer: [1],
    explanation:
      'Polly converts text into natural-sounding speech (neural voices) and can store the output in S3. Transcribe does the opposite (speech to text). Lex is for building chatbots, not for reading articles aloud. Self-hosting a model on EC2 increases operational overhead.',
  },
  {
    id: 'perf-053',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A call center records all customer calls and stores the audio files in Amazon S3. The company wants to determine whether each customer was satisfied or dissatisfied during the call, and must remove credit card numbers and other PII from any stored text. Which combination of services should a solutions architect use with the LEAST development effort? (Choose TWO.)',
    options: [
      'Amazon Transcribe to convert the audio to text with PII redaction enabled',
      'Amazon Polly to convert the audio to text',
      'Amazon Rekognition to detect PII in the audio files',
      'Amazon Comprehend to analyze the sentiment of the transcripts',
      'Amazon Translate to classify the sentiment of the transcripts',
    ],
    answer: [0, 3],
    explanation:
      'Transcribe converts recordings to text and can redact PII in the transcript; Comprehend analyzes the sentiment (positive/negative/neutral/mixed) of the transcript. Polly converts text to speech, the opposite direction. Rekognition analyzes images/video and does not process audio. Translate only translates languages and does not analyze sentiment.',
  },
  {
    id: 'perf-054',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A company wants to build a generative AI assistant that summarizes internal reports and answers employee questions grounded in documents stored in Amazon S3. The company does not want to manage any infrastructure or train a model from scratch. Which solution meets these requirements?',
    options: [
      'Train a large language model with Amazon SageMaker AI training jobs on GPU instances and host it on a real-time endpoint.',
      'Use Amazon Comprehend custom classification to answer questions about the reports.',
      'Use Amazon Bedrock with a foundation model and a Bedrock knowledge base that uses the S3 documents as its data source.',
      'Deploy an open source large language model on Amazon EC2 GPU instances behind an Application Load Balancer.',
    ],
    answer: [2],
    explanation:
      'Bedrock provides foundation models through a serverless API; Knowledge Bases perform RAG over the S3 documents so answers are grounded in company data, with no infrastructure to manage and no model training. Training an LLM on SageMaker is expensive and complex. Comprehend custom classification only classifies text and does not generate answers. Self-hosting an LLM on EC2 requires managing infrastructure.',
  },
  {
    id: 'perf-055',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'An e-commerce company wants to show each user a personalized list of recommended products based on the user\'s browsing and purchase history. Recommendations must update in real time as users interact with the website. The company has no data scientists. Which AWS service should the company use?',
    options: [
      'Amazon Kendra',
      'Amazon Personalize',
      'Amazon SageMaker AI',
      'Amazon Comprehend',
    ],
    answer: [1],
    explanation:
      'Personalize is a managed recommendation service that ingests interaction data (views, purchases) and updates recommendations in real time, with no ML experience required. Kendra is document search. SageMaker AI could do it but requires data scientists to build the model. Comprehend analyzes text.',
  },
  {
    id: 'perf-056',
    domain: 'performance',
    lesson: 'ai-ml-services',
    stem: 'A data science team needs to train a model with a proprietary algorithm on 5 TB of data stored in Amazon S3. The team wants managed Jupyter notebooks for experimentation, managed training on GPU instances, and a fully managed HTTPS endpoint for low-latency real-time predictions. Which solution meets these requirements?',
    options: [
      'Use Amazon Rekognition Custom Labels to train and host the model.',
      'Use Amazon Bedrock to fine-tune a foundation model and invoke it through the Bedrock API.',
      'Launch Amazon EC2 GPU instances, install Jupyter manually, and run a Flask application to serve predictions.',
      'Use Amazon SageMaker AI notebooks for experimentation, SageMaker AI training jobs on GPU instances, and a SageMaker AI real-time endpoint for inference.',
    ],
    answer: [3],
    explanation:
      'SageMaker AI covers the whole ML lifecycle: managed notebooks, GPU training jobs that read data from S3, and real-time endpoints for low-latency inference; it supports proprietary algorithms through custom containers/scripts. Rekognition Custom Labels is only for image labels. Bedrock uses existing foundation models and is not for training a proprietary algorithm. A do-it-yourself EC2 setup increases operational overhead and is not fully managed.',
  },
];
