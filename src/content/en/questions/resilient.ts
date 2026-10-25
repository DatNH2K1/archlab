import type { Question } from '@/content/types';

export const resilientQuestionsEn: Question[] = [
  // ---------------------------------------------------------------- high-availability-multi-az
  {
    id: 'res-001',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A company runs a web application on a single Amazon EC2 instance in one Availability Zone. The application stores user sessions in memory on the instance. The company wants to make the application highly available and able to scale horizontally without users losing their sessions. Which solution meets these requirements?',
    options: [
      'Move the instance to a larger instance type and enable EC2 auto recovery.',
      'Enable sticky sessions on an Application Load Balancer in front of the existing instance.',
      'Store sessions in Amazon ElastiCache, and run the application in an Auto Scaling group across multiple Availability Zones behind an Application Load Balancer.',
      'Store sessions on an Amazon EBS volume and attach the volume to every instance in the Auto Scaling group.',
    ],
    answer: [2],
    explanation:
      'Correct answer: moving sessions out to ElastiCache makes the application stateless, so an ASG spanning multiple AZs behind an ALB can scale horizontally and replace instances without losing sessions. Scaling up + auto recovery is still one instance in one AZ (a SPOF). Sticky sessions still keep sessions in RAM, so if the instance dies the sessions are lost. An EBS volume lives in only one AZ and (except io1/io2 Multi-Attach within the same AZ) cannot be attached to multiple instances.',
  },
  {
    id: 'res-002',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A company runs a MySQL database on Amazon RDS. The database must automatically fail over to another Availability Zone if the primary AZ fails. The company also wants to offload read traffic from the primary and achieve failover in less than one minute. Which solution meets these requirements?',
    options: [
      'Deploy an RDS Multi-AZ DB cluster with one writer and two readable standby instances.',
      'Deploy an RDS Multi-AZ DB instance and direct read traffic to the standby instance.',
      'Create two RDS read replicas in different Availability Zones and promote one manually if the primary fails.',
      'Take automated snapshots every 5 minutes and restore them in another Availability Zone if needed.',
    ],
    answer: [0],
    explanation:
      'A Multi-AZ DB cluster has 1 writer + 2 standbys across 3 AZs, the standbys can serve reads, and failover is typically under 35 seconds, meeting both requirements. The standby of a Multi-AZ DB instance does not serve reads. Read replicas must be promoted manually, so they are not automatic failover. Restoring from a snapshot takes a long time and does not meet an RTO under 1 minute.',
  },
  {
    id: 'res-003',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A company has a VPC with private subnets in three Availability Zones. All instances reach the internet through a single NAT gateway deployed in the first Availability Zone. During an AZ outage, instances in the other two AZs lost internet access. What should a solutions architect do to make outbound internet access highly available?',
    options: [
      'Replace the NAT gateway with a NAT instance in an Auto Scaling group of one instance.',
      'Add a second internet gateway to the VPC and route private subnets to it.',
      'Assign Elastic IP addresses to all private instances.',
      'Create a NAT gateway in each Availability Zone and configure each private subnet route table to use the NAT gateway in the same AZ.',
    ],
    answer: [3],
    explanation:
      'A NAT gateway is a per-AZ resource; the best practice is one NAT gateway per AZ with each AZ\'s route table pointing to the NAT in the same AZ. A NAT instance is self-managed, needs more operations, and is still in a single AZ. A VPC can attach only one internet gateway. Assigning Elastic IPs to private instances has no effect if the subnet does not route to an internet gateway, and it breaks the private subnet design.',
  },
  {
    id: 'res-004',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A media company runs a content management system on Amazon EC2 instances in an Auto Scaling group across two Availability Zones. The instances must read and write the same set of uploaded files concurrently using a POSIX-compliant file system. The solution must remain available if one AZ fails. Which storage option should be used?',
    options: [
      'An Amazon EBS Provisioned IOPS volume with Multi-Attach enabled',
      'Amazon EFS with the Standard storage class and mount targets in each Availability Zone',
      'Amazon EFS One Zone with a mount target in one Availability Zone',
      'Instance store volumes synchronized with a cron job',
    ],
    answer: [1],
    explanation:
      'EFS Standard stores data redundantly across multiple AZs, has a mount target in each AZ, supports POSIX, and allows concurrent access from many instances. EBS Multi-Attach works only within the same AZ. EFS One Zone does not survive an AZ failure. Instance store is ephemeral and loses data when the instance stops; syncing with cron is complex and inconsistent.',
  },
  {
    id: 'res-005',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A gaming company needs to run latency-sensitive game servers with single-digit millisecond latency for players in a specific large metropolitan area that is far from the nearest AWS Region. The company wants to use familiar AWS services and APIs. Which solution meets these requirements?',
    options: [
      'Deploy the game servers to an AWS Local Zone near the metropolitan area.',
      'Deploy the game servers in the nearest AWS Region and use Amazon CloudFront.',
      'Deploy the game servers on AWS Outposts in the company headquarters.',
      'Use AWS Global Accelerator with endpoints in the nearest AWS Region.',
    ],
    answer: [0],
    explanation:
      'Local Zones place compute and storage close to major cities to achieve single-digit millisecond latency for users there. CloudFront only caches HTTP content and does not run game servers. Outposts is placed in the company\'s data center, not close to the players. Global Accelerator optimizes the network path but the servers would still be in a distant Region.',
  },
  {
    id: 'res-006',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A company runs an Amazon RDS for PostgreSQL Multi-AZ DB instance. The reporting team runs heavy analytical queries that slow down the production workload. The company wants to isolate the reporting queries with the LEAST operational overhead. What should a solutions architect do?',
    options: [
      'Point the reporting queries to the Multi-AZ standby instance endpoint.',
      'Increase the DB instance size to a larger instance class.',
      'Export the database nightly to Amazon S3 and query it with Amazon Athena.',
      'Create an RDS read replica and point the reporting queries to the read replica endpoint.',
    ],
    answer: [3],
    explanation:
      'A read replica receives asynchronous replication and has its own endpoint, making it suitable for separating the read load of reports. The standby of a Multi-AZ DB instance does not serve reads. Scaling up does not isolate the workload and is costly. A nightly export to S3 makes data stale and adds operations.',
  },
  {
    id: 'res-007',
    domain: 'resilient',
    lesson: 'high-availability-multi-az',
    stem: 'A company is migrating a three-tier application to AWS. The application tier must survive the failure of an Availability Zone, and the database tier must fail over automatically with no data loss for committed transactions. Which combination of actions will meet these requirements? (Choose TWO.)',
    options: [
      'Deploy the application tier in an Auto Scaling group that spans at least two Availability Zones behind an Application Load Balancer.',
      'Deploy the application tier on a single large EC2 instance with an Elastic IP address.',
      'Use Amazon RDS with Multi-AZ deployment for the database tier.',
      'Use an RDS cross-Region read replica as the only standby for the database.',
      'Run the database on an EC2 instance and take hourly EBS snapshots.',
    ],
    answer: [0, 2],
    explanation:
      'An ASG spanning multiple AZs behind an ALB lets the app tier survive an AZ failure; RDS Multi-AZ replicates synchronously so no committed transactions are lost, and it fails over automatically. A single instance with an Elastic IP is a SPOF. A cross-Region read replica is asynchronous and must be promoted manually. Hourly snapshots can lose up to 1 hour of data and do not fail over automatically.',
  },
  // ---------------------------------------------------------------- elastic-load-balancing
  {
    id: 'res-008',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A company hosts several microservices on Amazon ECS. Requests to example.com/orders must go to the orders service, and requests to example.com/users must go to the users service. The company wants to use a single load balancer. Which solution meets these requirements?',
    options: [
      'Use a Network Load Balancer with one listener per microservice port.',
      'Use an Application Load Balancer with path-based routing rules that forward to separate target groups.',
      'Use a Gateway Load Balancer with a target group for each service.',
      'Use Amazon Route 53 weighted routing to distribute requests to each service.',
    ],
    answer: [1],
    explanation:
      'An ALB operates at layer 7 and supports path-based rules (/orders, /users) that forward to different target groups on the same load balancer. An NLB at layer 4 cannot read the URL path. GWLB is used to insert security appliances, not for HTTP routing. Route 53 works at the DNS level and does not see the URL path.',
  },
  {
    id: 'res-009',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A financial services company exposes an HTTPS API through an Application Load Balancer. A partner requires that the company provide a fixed set of IP addresses so that the partner can allow-list them in its firewall. The company wants to keep the layer 7 routing features of the ALB. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Assign an Elastic IP address to the Application Load Balancer.',
      'Replace the ALB with EC2 instances that have Elastic IP addresses and run NGINX as a reverse proxy.',
      'Place a Network Load Balancer with Elastic IP addresses in front of the ALB, using the ALB as the target.',
      'Publish the current ALB IP addresses to the partner and update them weekly.',
    ],
    answer: [2],
    explanation:
      'An NLB has one static IP/Elastic IP per AZ and supports an ALB as a target, so you get both fixed IPs and layer 7 routing (Global Accelerator is another option). You cannot attach an Elastic IP to an ALB. Running your own NGINX on EC2 adds operations and creates a SPOF. ALB IPs can change at any time, so updating them weekly is not reliable.',
  },
  {
    id: 'res-010',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A company hosts 20 websites with different domain names on the same fleet of EC2 instances behind one Application Load Balancer. Each website must use its own TLS certificate. What is the MOST operationally efficient way to configure HTTPS?',
    options: [
      'Create 20 Application Load Balancers, each with one certificate.',
      'Import the certificates into AWS Certificate Manager and add them to a single HTTPS listener on the ALB, which uses Server Name Indication (SNI).',
      'Use a Classic Load Balancer with multiple HTTPS listeners on port 443.',
      'Terminate TLS on each EC2 instance and use a Network Load Balancer with TCP listeners.',
    ],
    answer: [1],
    explanation:
      'ALB supports SNI: one HTTPS listener holds multiple certificates from ACM and automatically picks the certificate based on the hostname the client requests. Creating 20 ALBs costs more and adds operations. CLB does not support SNI and cannot have multiple listeners on the same port 443. Terminating TLS on each instance increases CPU load and certificate management effort.',
  },
  {
    id: 'res-011',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A company is deploying a fleet of third-party virtual firewall appliances. All traffic entering the VPC from the internet must be inspected by these appliances transparently, and the appliance fleet must scale and be highly available. Which AWS service should the company use?',
    options: [
      'Application Load Balancer',
      'Network Load Balancer',
      'AWS Global Accelerator',
      'Gateway Load Balancer',
    ],
    answer: [3],
    explanation:
      'Gateway Load Balancer operates at layer 3 and uses GENEVE to transparently pass traffic through a fleet of third-party appliances, with health checks and scaling. ALB only handles HTTP/HTTPS. NLB balances TCP/UDP but is not designed to insert appliances into the path (bump-in-the-wire). Global Accelerator optimizes the global network path and does not inspect traffic.',
  },
  {
    id: 'res-012',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'An application behind an Application Load Balancer processes long-running file uploads that can take up to 10 minutes. During scale-in events, users report that uploads fail when instances are removed. What should a solutions architect do to resolve this issue?',
    options: [
      'Increase the deregistration delay on the target group to more than 10 minutes.',
      'Enable cross-zone load balancing on the ALB.',
      'Enable sticky sessions with a duration-based cookie.',
      'Decrease the health check interval on the target group.',
    ],
    answer: [0],
    explanation:
      'Deregistration delay (connection draining) lets in-flight requests complete before a target is removed; the default is 300 seconds and can be set up to 3,600 seconds, so increase it to more than 10 minutes. Cross-zone only affects load distribution. Sticky sessions do not prevent an instance from being removed. Reducing the health check interval is unrelated to scale-in.',
  },
  {
    id: 'res-013',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A company runs an online multiplayer game that uses a custom UDP protocol. The game requires extremely low latency and must handle millions of packets per second. Which load balancer should the company use?',
    options: [
      'Application Load Balancer',
      'Classic Load Balancer',
      'Network Load Balancer',
      'Gateway Load Balancer',
    ],
    answer: [2],
    explanation:
      'NLB operates at layer 4, supports UDP, has ultra-low latency, and handles millions of requests per second. ALB supports only HTTP/HTTPS/gRPC. CLB is legacy and does not support UDP. GWLB is for security appliances, not for load balancing a game application.',
  },
  {
    id: 'res-014',
    domain: 'resilient',
    lesson: 'elastic-load-balancing',
    stem: 'A company is building a web application behind an Application Load Balancer. The company must block common attacks such as SQL injection and cross-site scripting, and must ensure that the EC2 instances accept traffic only from the load balancer. Which combination of steps will meet these requirements? (Choose TWO.)',
    options: [
      'Enable AWS Shield Advanced on the EC2 instances only.',
      'Associate an AWS WAF web ACL with the Application Load Balancer.',
      'Configure a network ACL that allows inbound traffic only from the ALB\'s DNS name.',
      'Enable cross-zone load balancing on the ALB.',
      'Configure the EC2 instances\' security group to allow inbound traffic only from the ALB\'s security group.',
    ],
    answer: [1, 4],
    explanation:
      'AWS WAF attached to the ALB with managed rules blocks SQL injection and XSS. The EC2 security group referencing the ALB\'s security group ensures only the ALB can send traffic. Shield Advanced mainly protects against DDoS and does not replace WAF. Network ACLs use CIDRs, not DNS names. Cross-zone load balancing is unrelated to security.',
  },
  // ---------------------------------------------------------------- auto-scaling
  {
    id: 'res-015',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company runs a web application on EC2 instances in an Auto Scaling group behind an Application Load Balancer. Sometimes the application stops responding, but the instances remain in the running state and are not replaced. The ALB marks these instances as unhealthy. What should a solutions architect do so that the unresponsive instances are replaced automatically?',
    options: [
      'Configure the Auto Scaling group to use Elastic Load Balancing health checks.',
      'Enable detailed monitoring on the EC2 instances.',
      'Add a scheduled scaling action to replace instances every hour.',
      'Create a CloudWatch alarm on CPU utilization that reboots the instances.',
    ],
    answer: [0],
    explanation:
      'By default the ASG only uses EC2 status checks, so it does not know the application is hung. With ELB health checks enabled, an instance marked unhealthy by the ALB is terminated and replaced by the ASG. Detailed monitoring only increases metric frequency. Replacing instances on a schedule does not address the actual cause. A CPU alarm does not reflect an application hang.',
  },
  {
    id: 'res-016',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company\'s application experiences a predictable traffic spike every weekday at 9:00 AM. Instances take several minutes to become ready, and users experience slow responses for the first 15 minutes of the spike. The rest of the day, traffic fluctuates unpredictably. Which scaling approach should the company use?',
    options: [
      'Use only a simple scaling policy based on CPU utilization with a 300-second cooldown.',
      'Increase the maximum capacity of the Auto Scaling group.',
      'Add a scheduled scaling action that increases capacity shortly before 9:00 AM on weekdays, and keep a target tracking policy for unpredictable traffic.',
      'Use manual scaling every morning.',
    ],
    answer: [2],
    explanation:
      'Scheduled scaling increases capacity before the known peak, while target tracking handles unpredictable fluctuations; combining the two policies is appropriate (predictive scaling is also a reasonable choice for a recurring load pattern). Simple scaling reacts after the load has increased and is blocked by cooldown. Increasing max capacity does not make instances launch earlier. Manual scaling adds operations.',
  },
  {
    id: 'res-017',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company runs worker instances in an Auto Scaling group that process messages from an Amazon SQS queue. The time to process each message is consistent. The company wants the number of instances to scale with the workload so that the queue latency stays within an acceptable limit. Which scaling strategy is recommended?',
    options: [
      'Use target tracking on the average CPU utilization of the Auto Scaling group.',
      'Use step scaling on the ApproximateAgeOfOldestMessage metric with a single large step.',
      'Use scheduled scaling based on business hours.',
      'Publish a custom backlog-per-instance metric and use a target tracking policy with a target value based on acceptable latency divided by processing time.',
    ],
    answer: [3],
    explanation:
      'AWS recommends calculating backlog per instance (visible messages divided by InService instances) and using target tracking with a target value = acceptable latency / processing time per message. CPU does not reflect queue length. Step scaling with one large step easily overshoots or is slow. Scheduled scaling does not react to actual load.',
  },
  {
    id: 'res-018',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company must collect application log files from EC2 instances in an Auto Scaling group before the instances are terminated during scale-in. Which solution meets this requirement?',
    options: [
      'Enable termination protection on all instances.',
      'Add a lifecycle hook for the terminating state that triggers a script to copy the logs to Amazon S3, then complete the lifecycle action.',
      'Set the Auto Scaling group cooldown period to 1 hour.',
      'Use a launch template user data script to copy logs to S3.',
    ],
    answer: [1],
    explanation:
      'A Terminating:Wait lifecycle hook pauses the instance before it is deleted so a script (via EventBridge/Lambda or SSM) can push logs to S3, and then calls complete-lifecycle-action. Termination protection does not prevent the ASG from scaling in. Cooldown only delays the next scaling activity. User data only runs at startup, not at termination.',
  },
  {
    id: 'res-019',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'An application running in an Auto Scaling group takes 10 minutes to initialize because it loads a large dataset into memory at startup. During sudden traffic spikes, new instances are not ready quickly enough. The company wants to reduce scale-out latency while keeping costs low. What should a solutions architect recommend?',
    options: [
      'Configure a warm pool for the Auto Scaling group with instances kept in the Stopped state.',
      'Increase the health check grace period to 15 minutes.',
      'Switch to a larger instance type.',
      'Set the desired capacity equal to the maximum capacity at all times.',
    ],
    answer: [0],
    explanation:
      'A warm pool keeps pre-initialized instances ready; in the Stopped state you only pay for EBS, and on scale out instances move to InService much faster. Increasing the grace period only postpones health checks. A larger instance does not necessarily shorten data load time. Always running at max capacity is very expensive.',
  },
  {
    id: 'res-020',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company wants an Auto Scaling group to maintain the average CPU utilization of its instances at around 50% with the LEAST operational effort. Which scaling policy should be used?',
    options: [
      'Simple scaling policy with two CloudWatch alarms',
      'Step scaling policy with multiple step adjustments',
      'Scheduled scaling with hourly actions',
      'Target tracking scaling policy with a target value of 50%',
    ],
    answer: [3],
    explanation:
      'Target tracking automatically creates and manages CloudWatch alarms and adjusts capacity to keep the metric around the target value, so it has the least operations. Simple and step scaling require you to create alarms and configure steps yourself. Scheduled scaling does not react to actual CPU.',
  },
  {
    id: 'res-021',
    domain: 'resilient',
    lesson: 'auto-scaling',
    stem: 'A company has updated the AMI used by its Auto Scaling group and created a new launch template version. The company wants to replace all existing instances with instances that use the new AMI gradually, while keeping a minimum percentage of capacity healthy during the update. Which solution requires the LEAST operational effort?',
    options: [
      'Manually terminate instances one at a time and let the Auto Scaling group replace them.',
      'Create a new Auto Scaling group and switch the load balancer target group manually.',
      'Start an instance refresh on the Auto Scaling group with a minimum healthy percentage.',
      'Detach all instances from the Auto Scaling group and reattach new instances.',
    ],
    answer: [2],
    explanation:
      'Instance refresh gradually replaces instances according to the new launch template, respecting the minimum healthy percentage, with no manual work. Manually terminating instances one by one is laborious and error-prone. Creating a new ASG and switching the target group is a manual blue/green with more operations. Detaching/attaching instances does not update the AMI automatically.',
  },
  // ---------------------------------------------------------------- decoupling-messaging
  {
    id: 'res-022',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'An e-commerce company processes orders with a web tier that calls a backend order-processing service directly. During flash sales, the backend becomes overloaded and orders are lost. The company wants to ensure that no orders are lost and that the backend can process orders at its own pace. Which solution meets these requirements?',
    options: [
      'Increase the instance size of the backend service.',
      'Have the web tier send orders to an Amazon SQS queue, and have the backend poll the queue and process the orders.',
      'Have the web tier publish orders to an Amazon SNS topic with an HTTP subscription to the backend.',
      'Put an Application Load Balancer between the web tier and the backend.',
    ],
    answer: [1],
    explanation:
      'SQS stores messages durably (up to 14 days), absorbs spikes, and lets the backend process at its own pace; this is the standard decoupling pattern. Scaling up does not guarantee no lost orders when load exceeds capacity. SNS pushes to an HTTP endpoint, and an overloaded backend can still fail after retries are exhausted. ALB only distributes load and does not buffer requests.',
  },
  {
    id: 'res-023',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'A company processes financial transactions submitted through an API. Transactions for the same account must be processed in the exact order in which they were received, and each transaction must be processed exactly once. Which solution meets these requirements?',
    options: [
      'Use an Amazon SQS standard queue with long polling.',
      'Use an Amazon SNS standard topic with an AWS Lambda subscription.',
      'Use Amazon Kinesis Data Firehose to deliver transactions to Amazon S3.',
      'Use an Amazon SQS FIFO queue with the account ID as the message group ID.',
    ],
    answer: [3],
    explanation:
      'SQS FIFO guarantees ordering within each message group (set group ID = account ID to still process different accounts in parallel) and exactly-once processing through deduplication. SQS standard can deliver duplicates and out of order. SNS standard does not guarantee ordering. Firehose is used to load data into storage destinations, not to process transactions in order.',
  },
  {
    id: 'res-024',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'When a new order is placed, a company needs to notify three independent systems: inventory, billing, and analytics. Each system must receive every order, process it at its own pace, and retry independently if it fails. Which architecture meets these requirements?',
    options: [
      'Publish each order to an Amazon SNS topic that has three Amazon SQS queues subscribed, one for each system.',
      'Send each order to a single Amazon SQS queue that all three systems poll.',
      'Write each order to an Amazon S3 bucket and have each system list the bucket every minute.',
      'Invoke three AWS Lambda functions synchronously from the order service.',
    ],
    answer: [0],
    explanation:
      'SNS fan-out to multiple SQS queues: each system has its own queue, receives a full copy, and processes and retries independently. A single shared SQS queue means each message is processed by only one consumer. Periodically listing an S3 bucket is inefficient and easy to miss objects. Calling Lambda synchronously tightly couples the systems to the order service.',
  },
  {
    id: 'res-025',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'A company is migrating an on-premises application to AWS. The application uses Apache ActiveMQ with the JMS API and the AMQP protocol. The company wants to minimize code changes and use a managed service. Which service should the company use?',
    options: [
      'Amazon SQS',
      'Amazon Kinesis Data Streams',
      'Amazon MQ',
      'Amazon EventBridge',
    ],
    answer: [2],
    explanation:
      'Amazon MQ is a managed broker for ActiveMQ and RabbitMQ, supporting JMS, AMQP, MQTT, STOMP, and OpenWire, so migration needs almost no code changes. SQS, Kinesis, and EventBridge use AWS-specific APIs, so the messaging code must be rewritten.',
  },
  {
    id: 'res-026',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'A company uses an Amazon SQS standard queue. Some messages take up to 3 minutes to process, and the team notices that these messages are processed more than once by different consumers. The default queue settings are in use. What should the company do to fix this issue?',
    options: [
      'Enable long polling on the queue.',
      'Increase the visibility timeout of the queue to longer than the maximum processing time.',
      'Configure a delay queue of 3 minutes.',
      'Increase the message retention period to 14 days.',
    ],
    answer: [1],
    explanation:
      'The default visibility timeout is 30 seconds; if processing takes longer, the message reappears and another consumer receives it. Increasing the visibility timeout beyond the maximum processing time (or calling ChangeMessageVisibility) fixes this. Long polling only reduces empty receives. A delay queue delays the message before it first becomes visible and does not help after it has been received. Retention is unrelated to duplicate processing.',
  },
  {
    id: 'res-027',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'A company collects clickstream data from its website and needs to process it in real time. Multiple applications must consume the same data independently, and the company must be able to reprocess data from the previous 7 days if a bug is found. Which service meets these requirements?',
    options: [
      'Amazon SQS standard queue',
      'Amazon SNS topic',
      'Amazon MQ',
      'Amazon Kinesis Data Streams with extended data retention',
    ],
    answer: [3],
    explanation:
      'Kinesis Data Streams lets multiple consumers read the same data, process in real time, and replay within the retention period (default 24 hours, extendable up to 365 days). SQS deletes messages after processing and has no replay. SNS does not store messages. Amazon MQ is a broker for traditional applications and is not designed for clickstream and replay.',
  },
  {
    id: 'res-028',
    domain: 'resilient',
    lesson: 'decoupling-messaging',
    stem: 'A company uses an Amazon SQS queue to decouple an order service from a fulfillment service. Some malformed messages cause the consumer to fail repeatedly, which blocks resources and generates errors. The company wants to isolate these messages for later analysis and reduce empty receive calls to lower costs. Which actions should a solutions architect take? (Choose TWO.)',
    options: [
      'Configure a dead-letter queue with a redrive policy and an appropriate maxReceiveCount.',
      'Convert the queue to a FIFO queue.',
      'Set the ReceiveMessageWaitTimeSeconds attribute to 20 seconds to enable long polling.',
      'Reduce the message retention period to 1 minute.',
      'Set the delivery delay of the queue to 15 minutes.',
    ],
    answer: [0, 2],
    explanation:
      'A DLQ with maxReceiveCount sets aside messages that fail repeatedly for analysis. Long polling (WaitTimeSeconds up to 20) reduces ReceiveMessage calls that return empty, lowering cost. Switching to FIFO does not solve failing messages. A 1-minute retention loses valid data. Delivery delay only slows down all messages.',
  },
  // ---------------------------------------------------------------- serverless-workflows
  {
    id: 'res-029',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company wants to run a nightly batch job that transforms files and takes approximately 45 minutes to complete. The company wants a serverless solution with no servers to manage. Which solution meets these requirements?',
    options: [
      'Run the job as an AWS Lambda function with the maximum timeout.',
      'Run the job in a container on Amazon ECS with AWS Fargate, triggered by an Amazon EventBridge Scheduler schedule.',
      'Run the job as an AWS Lambda@Edge function.',
      'Run the job as an AWS Step Functions Express workflow with a single task.',
    ],
    answer: [1],
    explanation:
      'Fargate is serverless compute for containers and has no 15-minute limit like Lambda; EventBridge Scheduler triggers it on a schedule. Lambda is limited to 15 minutes. Lambda@Edge is used with CloudFront and has even shorter run times. Step Functions Express is limited to 5 minutes, and a Lambda task is still limited to 15 minutes.',
  },
  {
    id: 'res-030',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company exposes a Lambda-backed API through Amazon API Gateway. The Lambda function writes to an Amazon RDS for MySQL database. During traffic spikes, the database runs out of connections. Which combination of actions will resolve this issue with the LEAST changes to the application? (Choose TWO.)',
    options: [
      'Increase the Lambda function timeout to 15 minutes.',
      'Move the Lambda function out of the VPC.',
      'Configure Amazon RDS Proxy and point the Lambda function at the proxy endpoint.',
      'Enable API Gateway caching for POST requests.',
      'Set reserved concurrency on the Lambda function to limit the maximum number of concurrent executions.',
    ],
    answer: [2, 4],
    explanation:
      'RDS Proxy pools and reuses database connections for concurrent Lambda functions. Reserved concurrency caps the number of concurrent executions, protecting the database behind it. Increasing the timeout does not reduce connections. Taking Lambda out of the VPC means it cannot reach a private RDS. Caching does not apply to write requests (POST).',
  },
  {
    id: 'res-031',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company offers a public API through Amazon API Gateway REST API. The company wants to sell three subscription tiers, each with a different request rate limit and monthly quota per customer. Which feature should the company use?',
    options: [
      'Usage plans with API keys',
      'Lambda reserved concurrency',
      'AWS WAF rate-based rules',
      'Stage-level caching',
    ],
    answer: [0],
    explanation:
      'Usage plans + API keys in API Gateway REST API let you set throttling (rate, burst) and quota per customer/plan. Reserved concurrency applies to the whole function and does not distinguish customers. A WAF rate-based rule blocks by IP and is not tied to subscription plans. Caching does not limit requests.',
  },
  {
    id: 'res-032',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company is building an order-fulfillment workflow that includes payment, inventory reservation, and shipping steps. Some orders require manual approval by a manager, which can take up to 3 days. The company needs a full execution history for auditing. Which solution meets these requirements?',
    options: [
      'AWS Step Functions Express workflow',
      'A chain of AWS Lambda functions that invoke each other asynchronously',
      'AWS Step Functions Standard workflow using a task token callback for the approval step',
      'Amazon SQS FIFO queue between each step',
    ],
    answer: [2],
    explanation:
      'Step Functions Standard runs up to 1 year, is exactly-once, and keeps execution history for auditing; callbacks with a task token allow waiting for manual approval. Express is limited to 5 minutes. Lambdas chained together are hard to monitor, hard to handle errors for, and have no centralized history. SQS FIFO between steps provides neither orchestration nor auditing.',
  },
  {
    id: 'res-033',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company uses Amazon CloudFront to serve a global website. The company needs to rewrite request URLs and add security headers to responses for every request. The logic is simple, must run at very high scale with sub-millisecond latency, and should be the MOST cost-effective option. Which solution should be used?',
    options: [
      'Lambda@Edge functions on origin request and origin response',
      'An AWS Lambda function behind an Application Load Balancer at the origin',
      'Amazon API Gateway with request and response mapping templates',
      'CloudFront Functions on viewer request and viewer response',
    ],
    answer: [3],
    explanation:
      'CloudFront Functions run lightweight JavaScript at the edge on viewer request/response, in under 1 ms, scale massively, and are cheaper than Lambda@Edge; suitable for URL rewrites and adding headers. Lambda@Edge is for more complex logic and costs more. Processing at the origin with ALB/Lambda or API Gateway increases latency and cost.',
  },
  {
    id: 'res-034',
    domain: 'resilient',
    lesson: 'serverless-workflows',
    stem: 'A company has a Lambda function that is attached to private subnets in a VPC to access an Amazon RDS database. The function now also needs to call a third-party payment API on the internet. The function currently times out when it calls the API. What should a solutions architect do?',
    options: [
      'Attach an Elastic IP address to the Lambda function.',
      'Route the private subnets\' outbound traffic through a NAT gateway in a public subnet.',
      'Move the Lambda function into a public subnet with an internet gateway route.',
      'Create a VPC gateway endpoint for the payment API.',
    ],
    answer: [1],
    explanation:
      'A Lambda attached to a VPC has no public IP; to reach the internet it must go through a NAT gateway in a public subnet. You cannot attach an Elastic IP directly to Lambda. Placing Lambda in a public subnet also gives no internet because Lambda\'s ENI has no public IP. A gateway endpoint supports only S3 and DynamoDB and is not for third-party APIs.',
  },
  // ---------------------------------------------------------------- route53-routing
  {
    id: 'res-035',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A company hosts its website on an Application Load Balancer. The company wants users to access the website at the zone apex example.com, using Amazon Route 53. Which record should the company create?',
    options: [
      'A CNAME record for example.com that points to the ALB DNS name',
      'An A record for example.com that contains the current IP addresses of the ALB',
      'An Alias A record for example.com that targets the ALB',
      'An MX record for example.com that points to the ALB',
    ],
    answer: [2],
    explanation:
      'An Alias record works at the zone apex, points to an ALB, updates automatically when IPs change, and has no query charge. CNAME is not allowed at the zone apex. ALB IPs change, so an A record with fixed IPs would break. MX is for mail servers.',
  },
  {
    id: 'res-036',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A company runs identical copies of its application in us-east-1 and eu-west-1. The company wants users to be routed to the Region that provides the lowest network latency, and to the other Region if one Region becomes unhealthy. Which Route 53 configuration meets these requirements?',
    options: [
      'Latency-based routing records with health checks associated with each record',
      'Geolocation routing records with a default record',
      'Simple routing with both ALB DNS names in one record',
      'Weighted routing with equal weights and no health checks',
    ],
    answer: [0],
    explanation:
      'Latency-based routing returns the Region with the lowest latency; attach health checks (or Evaluate Target Health) to remove unhealthy Regions. Geolocation is based on user location, not latency. Simple routing does not support health checks. Weighted does not optimize latency, and without health checks it does not fail over.',
  },
  {
    id: 'res-037',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A streaming company must serve content to users in Germany only from servers located in the eu-central-1 Region because of licensing restrictions. Users from all other countries should be served from us-east-1. Which routing policy should be used?',
    options: [
      'Latency-based routing',
      'Geoproximity routing with a positive bias for eu-central-1',
      'Weighted routing',
      'Geolocation routing with a record for Germany and a default record',
    ],
    answer: [3],
    explanation:
      'Geolocation routes by user location (country), suitable for copyright/legal constraints; a Default record serves the remaining countries. Latency might send German users to another Region if its latency is lower. Geoproximity is based on distance and bias and does not guarantee country boundaries. Weighted splits by ratio, not by location.',
  },
  {
    id: 'res-038',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A company is deploying a new version of its application. It wants to send 5% of production traffic to the new version and gradually increase the percentage, using DNS. Which Route 53 routing policy should the company use?',
    options: [
      'Failover routing',
      'Weighted routing',
      'Multivalue answer routing',
      'IP-based routing',
    ],
    answer: [1],
    explanation:
      'Weighted routing splits traffic by weight (for example 95/5) and can be changed gradually, suitable for canary. Failover only has primary/secondary. Multivalue returns several records randomly and does not control the ratio. IP-based routes by the client\'s CIDR.',
  },
  {
    id: 'res-039',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A company has a hybrid network with AWS Direct Connect. EC2 instances in a VPC must resolve hostnames in the company\'s on-premises domain corp.example.internal, which is hosted on on-premises DNS servers. Which solution meets this requirement?',
    options: [
      'Create a Route 53 Resolver outbound endpoint and a forwarding rule for corp.example.internal that targets the on-premises DNS servers.',
      'Create a Route 53 Resolver inbound endpoint in the VPC.',
      'Create a public hosted zone for corp.example.internal.',
      'Configure the on-premises DNS servers to forward all queries to the VPC CIDR +2 address over the internet.',
    ],
    answer: [0],
    explanation:
      'An outbound endpoint + forwarding rule lets queries from the VPC to the on-premises domain be forwarded to the on-premises DNS server. An inbound endpoint is for the opposite direction (on-premises resolving names in AWS). A public hosted zone exposes internal names and does not contain on-premises records. The VPC +2 resolver is not reachable from outside the VPC.',
  },
  {
    id: 'res-040',
    domain: 'resilient',
    lesson: 'route53-routing',
    stem: 'A company runs a multiplayer game that uses UDP, with endpoints in three AWS Regions. Players frequently experience long failover times when a Region fails because their devices cache DNS records. The company wants static IP addresses and failover in under a minute. Which solution meets these requirements?',
    options: [
      'Route 53 failover routing with a TTL of 60 seconds',
      'Amazon CloudFront with origin failover',
      'AWS Global Accelerator with endpoint groups in each Region',
      'Route 53 multivalue answer routing with health checks',
    ],
    answer: [2],
    explanation:
      'Global Accelerator provides 2 static anycast IPs, supports UDP, goes over the AWS backbone network, and fails over quickly independent of DNS caching. Route 53 solutions still depend on TTL and client-side caching. CloudFront is for HTTP/HTTPS and does not support UDP for games.',
  },
  // ---------------------------------------------------------------- disaster-recovery
  {
    id: 'res-041',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A company has an application with an RPO of 24 hours and an RTO of 12 hours. The company wants to implement disaster recovery in another AWS Region at the LOWEST cost. Which DR strategy should the company use?',
    options: [
      'Multi-site active/active',
      'Warm standby',
      'Pilot light',
      'Backup and restore with cross-Region backup copies and infrastructure as code',
    ],
    answer: [3],
    explanation:
      'An RPO of 24 hours and RTO of 12 hours are loose enough for backup & restore: copy backups to another Region, and during an incident rebuild with CloudFormation and restore. This is the cheapest strategy. Active/active, warm standby, and pilot light all meet the requirements but cost more.',
  },
  {
    id: 'res-042',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A company requires an RPO of a few seconds and an RTO of 10 minutes for its web application in another Region. The company wants to keep costs as low as possible while ensuring that the application can start serving traffic quickly. A scaled-down version of the full application stack is acceptable to run continuously in the DR Region. Which DR strategy fits these requirements?',
    options: [
      'Warm standby',
      'Backup and restore',
      'Pilot light with application servers created from AMIs only during a disaster',
      'Multi-site active/active with full capacity in both Regions',
    ],
    answer: [0],
    explanation:
      'Warm standby continuously runs a scaled-down copy of the full stack with continuously replicated data; during an incident you only scale up and switch DNS, meeting a 10-minute RTO. Backup & restore does not meet an RPO of a few seconds. Pilot light must launch app servers, so RTO is usually longer and riskier. Full-capacity active/active costs more than necessary.',
  },
  {
    id: 'res-043',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A company runs 200 physical and virtual servers in its on-premises data center. It wants to use AWS as a disaster recovery site with an RPO of seconds and an RTO of minutes, while minimizing the cost of idle resources in AWS. Which solution meets these requirements?',
    options: [
      'Use AWS Application Migration Service to migrate the servers once a week.',
      'Use AWS Elastic Disaster Recovery to continuously replicate the servers to a low-cost staging area in AWS.',
      'Take daily backups with AWS Backup and store them in Amazon S3 Glacier Deep Archive.',
      'Run a full copy of all 200 servers on EC2 instances in a warm standby configuration.',
    ],
    answer: [1],
    explanation:
      'AWS Elastic Disaster Recovery replicates continuously at block level into a low-cost staging area, with RPO in seconds and RTO in minutes, and only launches full instances on failover or drill. Application Migration Service is for migration, not continuous DR. Daily backups to Deep Archive have a 24-hour RPO and restores take many hours. Running all 200 servers continuously is very expensive.',
  },
  {
    id: 'res-044',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A company runs its application on EC2 instances with Amazon RDS for MySQL in us-east-1. For DR, the company wants the database continuously replicated to us-west-2, while application servers in us-west-2 are launched only when a disaster occurs. Which combination of actions implements this strategy? (Choose TWO.)',
    options: [
      'Create an RDS cross-Region read replica in us-west-2 and promote it during a disaster.',
      'Run a full-size Auto Scaling group in us-west-2 that serves 50% of production traffic.',
      'Enable RDS Multi-AZ in us-east-1 as the only DR measure.',
      'Copy the application AMIs to us-west-2 and keep a launch template and Auto Scaling group with zero capacity ready to scale out.',
      'Store database dumps on an EBS volume in us-east-1.',
    ],
    answer: [0, 3],
    explanation:
      'This is pilot light: the database is replicated continuously via a cross-Region read replica (promoted during an incident), while the app servers only have an AMI and launch template/ASG with capacity 0 ready to scale. A full-size ASG serving 50% of traffic is active/active. Multi-AZ only tolerates an AZ failure within the same Region. A dump on EBS in us-east-1 is lost if that Region fails.',
  },
  {
    id: 'res-045',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A global company requires its customer-facing application to continue operating with near-zero downtime and no noticeable data loss even if an entire AWS Region fails. Users in multiple continents should be served from the closest Region at all times. Cost is a secondary concern. Which approach meets these requirements?',
    options: [
      'Pilot light with an Aurora cross-Region replica',
      'Backup and restore with AWS Backup cross-Region copies',
      'Multi-site active/active using Amazon DynamoDB global tables and Route 53 latency-based routing',
      'Warm standby with a single-Region Amazon RDS Multi-AZ database',
    ],
    answer: [2],
    explanation:
      'Active/active: every Region serves traffic (latency routing to the nearest Region), DynamoDB global tables provide multi-Region writes with replication typically under 1 second, and RTO is near 0. Pilot light and backup & restore have long RTO. Warm standby with the database in only one Region cannot survive that Region\'s failure.',
  },
  {
    id: 'res-046',
    domain: 'resilient',
    lesson: 'disaster-recovery',
    stem: 'A company stores encrypted Amazon EBS snapshots of its critical EC2 workloads in eu-west-1. For DR, the snapshots must be available in eu-central-1 automatically every day with the LEAST operational overhead. Which solution meets these requirements?',
    options: [
      'Write a cron job on an EC2 instance that calls the CopySnapshot API daily.',
      'Create an Amazon Data Lifecycle Manager policy that creates daily snapshots and copies them to eu-central-1 using a KMS key in that Region.',
      'Enable S3 Cross-Region Replication on the bucket that stores the EBS snapshots.',
      'Use Amazon EBS Multi-Attach to attach volumes to instances in eu-central-1.',
    ],
    answer: [1],
    explanation:
      'Data Lifecycle Manager (or AWS Backup) automatically creates snapshots on a schedule and copies them cross-Region, re-encrypting with a KMS key in the destination Region, without managing servers. A cron job on EC2 adds operations and is a SPOF. EBS snapshots are stored in AWS-managed S3, so users cannot access the bucket to enable CRR. Multi-Attach works only within the same AZ.',
  },
  // ---------------------------------------------------------------- backup-replication
  {
    id: 'res-047',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A company has hundreds of AWS accounts in AWS Organizations. The security team wants to centrally enforce backup policies for Amazon EC2, Amazon RDS, Amazon DynamoDB, and Amazon EFS, copy backups to a separate account, and ensure that no one, including the root user, can delete the backups before the retention period ends. Which solution meets these requirements?',
    options: [
      'Use AWS Backup with backup policies in AWS Organizations, cross-account copy to a dedicated backup account, and AWS Backup Vault Lock in compliance mode.',
      'Write Lambda functions in each account to create snapshots and copy them to an S3 bucket with versioning.',
      'Enable RDS automated backups and DynamoDB PITR in every account.',
      'Use Amazon Data Lifecycle Manager in every account with a governance-mode retention lock.',
    ],
    answer: [0],
    explanation:
      'AWS Backup manages centrally through Organizations, supports many services, and cross-account copy; Vault Lock compliance mode makes backups immutable, and even the root user cannot delete them. A custom Lambda adds operations and is not immutable. RDS backups and DynamoDB PITR are not centralized, not cross-account, and do not protect against deletion. DLM only covers EBS snapshots/AMIs and has no compliance lock as described.',
  },
  {
    id: 'res-048',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A company runs a global e-commerce application with an Amazon Aurora MySQL database in us-east-1. The company needs low-latency reads for users in Europe and Asia, and a DR solution with an RPO of about 1 second and an RTO of less than 1 minute if us-east-1 fails. Which solution meets these requirements?',
    options: [
      'Create Aurora Replicas in additional Availability Zones in us-east-1.',
      'Take Aurora snapshots every hour and copy them to eu-west-1 and ap-southeast-1.',
      'Use AWS Database Migration Service to replicate to RDS for MySQL in each Region.',
      'Convert the cluster to an Aurora Global Database with secondary Regions in Europe and Asia.',
    ],
    answer: [3],
    explanation:
      'Aurora Global Database replicates at the storage layer to secondary Regions with latency typically under 1 second, allows local reads, and fails over to another Region with an RPO of about 1 second and RTO under 1 minute. Aurora Replicas in the same Region do not protect against a Region failure. Hourly snapshots have a 1-hour RPO. DMS adds operations and does not meet the required RTO.',
  },
  {
    id: 'res-049',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A developer accidentally ran a DELETE statement without a WHERE clause on a production Amazon RDS for PostgreSQL database at 14:32. Automated backups are enabled with a 7-day retention period. What is the fastest way to recover the data as it existed just before the mistake?',
    options: [
      'Restore the most recent manual snapshot over the existing DB instance.',
      'Promote the Multi-AZ standby to recover the deleted rows.',
      'Perform a point-in-time restore to 14:31 to a new DB instance, then switch the application to the new endpoint.',
      'Use the RDS Recycle Bin to recover the deleted rows.',
    ],
    answer: [2],
    explanation:
      'PITR uses automated backups + transaction logs to restore to any point within retention, and always creates a new DB instance with a new endpoint. A manual snapshot may be much older, and a restore also does not overwrite the existing instance. The Multi-AZ standby replicates synchronously, so it has also lost the data. Recycle Bin applies to EBS snapshots and AMIs and does not recover RDS data.',
  },
  {
    id: 'res-050',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A company must replicate new objects in an Amazon S3 bucket in us-east-1 to a bucket in us-west-2 for compliance. The compliance team requires that replication of most objects completes within 15 minutes, backed by an SLA, and that the company is alerted when replication is delayed. Which solution meets these requirements?',
    options: [
      'Configure S3 Same-Region Replication with S3 event notifications.',
      'Enable versioning on both buckets and configure S3 Cross-Region Replication with S3 Replication Time Control.',
      'Use AWS DataSync to copy objects every 15 minutes.',
      'Use an S3 Lifecycle rule to transition objects to the bucket in us-west-2.',
    ],
    answer: [1],
    explanation:
      'CRR requires versioning on both buckets; Replication Time Control has an SLA of replicating 99.99% of objects within 15 minutes, with metrics and notifications when delayed. SRR is only within the same Region. Scheduled DataSync has no 15-minute SLA per object. Lifecycle rules only transition storage classes or delete, and do not copy to another bucket.',
  },
  {
    id: 'res-051',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A company restores Amazon EBS volumes from snapshots to launch database instances during DR tests. The restored volumes perform poorly for the first hour while data is loaded from the snapshot. The company needs restored volumes to deliver full performance immediately. What should the company do?',
    options: [
      'Enable Amazon EBS Fast Snapshot Restore on the snapshots in the target Availability Zones.',
      'Move the snapshots to the EBS Snapshot Archive tier.',
      'Use EBS Multi-Attach on the restored volumes.',
      'Enable Recycle Bin for EBS snapshots.',
    ],
    answer: [0],
    explanation:
      'Fast Snapshot Restore makes a volume created from a snapshot fully initialized immediately, with no latency when reading blocks for the first time; enabled per AZ. Snapshot Archive is cheaper but restores take 24-72 hours. Multi-Attach is unrelated to initialization performance. Recycle Bin is for recovering accidentally deleted snapshots.',
  },
  {
    id: 'res-052',
    domain: 'resilient',
    lesson: 'backup-replication',
    stem: 'A company stores critical documents in an Amazon S3 bucket. The company must protect the documents against accidental overwrites and deletions, and must also keep a copy in another Region for disaster recovery, including objects that existed before replication was configured. Which combination of actions meets these requirements? (Choose TWO.)',
    options: [
      'Enable S3 Transfer Acceleration on the bucket.',
      'Enable S3 Versioning on the source and destination buckets.',
      'Configure an S3 Lifecycle rule to expire noncurrent versions after 1 day.',
      'Configure S3 Cross-Region Replication and use S3 Batch Replication for existing objects.',
      'Enable S3 Intelligent-Tiering on the bucket.',
    ],
    answer: [1, 3],
    explanation:
      'Versioning keeps all versions so you can recover from overwrites or accidental deletes, and it is also a mandatory prerequisite of replication. CRR replicates new objects to another Region, while S3 Batch Replication handles objects that existed before. Transfer Acceleration only speeds up uploads. Deleting noncurrent versions after 1 day reduces recoverability. Intelligent-Tiering only optimizes storage cost.',
  },
  // ---------------------------------------------------------------- management-iac
  {
    id: 'res-053',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company manages its production infrastructure with AWS CloudFormation. Before an update is applied, the operations team must review exactly which resources will be modified or replaced, and must be able to cancel the update if a database would be replaced. Which solution meets these requirements?',
    options: [
      'Update the stack directly and rely on automatic rollback if the database is replaced.',
      'Run drift detection on the stack before each update.',
      'Create a change set for the stack, review it, and execute it only if it is acceptable.',
      'Enable termination protection on the stack.',
    ],
    answer: [2],
    explanation:
      'A change set previews which resources will be added, modified, or replaced before execution; if the database would be replaced, you simply do not execute it. A direct update only rolls back on failure, and a successful replacement has already lost the data. Drift detection compares actual resources with the current template, it does not preview changes from a new template. Termination protection only blocks stack deletion, not updates.',
  },
  {
    id: 'res-054',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company uses AWS Organizations with more than 200 accounts. A security team must deploy the same IAM roles and AWS Config rules to every account in every enabled Region. New accounts that are added to the organization must receive the same resources automatically. Which solution requires the LEAST operational overhead?',
    options: [
      'Use AWS CloudFormation StackSets with service-managed permissions, target the organization OUs, and enable automatic deployment.',
      'Use CloudFormation nested stacks in the management account that reference templates for each member account.',
      'Write a script that assumes a role in each account and creates a CloudFormation stack in each Region.',
      'Share the CloudFormation template with every account through AWS RAM and ask account owners to deploy it.',
    ],
    answer: [0],
    explanation:
      'StackSets deploy one template to many accounts and many Regions in a single operation; with service-managed permissions (Organizations) and automatic deployment, new accounts added to an OU are deployed automatically. Nested stacks only reuse templates within one stack in one account. A custom script is operationally heavy and does not handle new accounts on its own. Sharing the template and asking account owners to deploy it is manual and does not guarantee consistency.',
  },
  {
    id: 'res-055',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company deploys an Amazon RDS for PostgreSQL DB instance as part of an AWS CloudFormation stack. Compliance rules require that a final backup of the database is kept whenever the stack is deleted, without any manual steps. What should a solutions architect do?',
    options: [
      'Enable termination protection on the CloudFormation stack.',
      'Add a stack policy that denies Update:Delete on the DB instance.',
      'Configure automated backups with a retention period of 35 days.',
      'Set the DeletionPolicy attribute of the DB instance resource to Snapshot.',
    ],
    answer: [3],
    explanation:
      'DeletionPolicy: Snapshot makes CloudFormation take a final snapshot of the DB before deleting the resource, fully automatically. Termination protection blocks stack deletion but does not create a backup. A stack policy applies only during stack updates, not stack deletion. RDS automated backups are deleted with the DB instance (unless you choose to retain them), so they do not meet the requirement.',
  },
  {
    id: 'res-056',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company runs a web application on AWS Elastic Beanstalk. Deployments must keep full capacity at all times. If the new version fails health checks, the existing instances must not be affected and rollback must be as fast as possible. Which deployment policy should the company use?',
    options: [
      'All at once',
      'Immutable',
      'Rolling',
      'Rolling with additional batch',
    ],
    answer: [1],
    explanation:
      'Immutable deploys the new version to new instances in a temporary ASG; the existing instances are untouched, and if the new version fails you just terminate the new instances, so rollback is the fastest. All at once causes downtime. Rolling reduces capacity during the deploy. Rolling with additional batch keeps full capacity but updates existing instances in place, so rollback requires redeploying the old version.',
  },
  {
    id: 'res-057',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company has 400 Amazon EC2 instances and 150 on-premises Linux servers. The company must apply operating system security patches to all servers during a weekly maintenance window and report patch compliance, with the LEAST operational overhead. Which solution meets these requirements?',
    options: [
      'Create an AWS Lambda function that connects to each server over SSH and runs the package manager.',
      'Use Amazon Inspector to install missing patches on all servers.',
      'Register the on-premises servers with AWS Systems Manager by using hybrid activations, and use Patch Manager with a patch baseline and a maintenance window.',
      'Use AWS Config remediation to rebuild each server from an updated AMI every week.',
    ],
    answer: [2],
    explanation:
      'Systems Manager manages both EC2 and on-premises servers (through hybrid activations) that run the SSM Agent; Patch Manager applies a patch baseline in a Maintenance Window and reports compliance. A Lambda function using SSH to each server is laborious and requires open ports and key management. Inspector only scans for vulnerabilities, it does not install patches. Rebuilding servers from an AMI with Config remediation does not work for on-premises servers and is very complex.',
  },
  {
    id: 'res-058',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company runs an application on Amazon EC2 instances. The application occasionally fails because the instances run out of memory. The operations team wants to be notified when memory utilization exceeds 85% on any instance. Which combination of steps meets this requirement? (Choose TWO.)',
    options: [
      'Install and configure the Amazon CloudWatch agent on the instances to publish memory utilization metrics.',
      'Enable EC2 detailed monitoring on the instances.',
      'Enable AWS X-Ray active tracing on the application.',
      'Create a CloudWatch alarm on the memory utilization metric with an Amazon SNS topic as the alarm action.',
      'Create an AWS CloudTrail trail that sends events to CloudWatch Logs.',
    ],
    answer: [0, 3],
    explanation:
      'EC2 does not send memory metrics by default; the CloudWatch agent collects memory and publishes it as a metric, then a CloudWatch alarm with an SNS action sends a notification above 85%. Detailed monitoring only increases the frequency of existing metrics to 1 minute and adds no memory metric. X-Ray traces requests and does not measure OS memory. CloudTrail records API calls, not performance metrics.',
  },
  {
    id: 'res-059',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company runs a microservices application that uses Amazon API Gateway, several AWS Lambda functions, and Amazon DynamoDB. Users report that some requests are slow, but the team cannot determine which service causes the latency. Which solution will help the team identify the bottleneck?',
    options: [
      'Enable AWS CloudTrail data events for the Lambda functions.',
      'Enable AWS X-Ray tracing for API Gateway and the Lambda functions, and analyze the service map and traces.',
      'Create Amazon CloudWatch Logs metric filters for the word ERROR in each log group.',
      'Use AWS Trusted Advisor performance checks.',
    ],
    answer: [1],
    explanation:
      'X-Ray follows a request through API Gateway and Lambda to DynamoDB and shows a service map with the time spent in each segment, so it reveals the slow service. CloudTrail data events record who called an API, not per-step latency. A metric filter counts errors, but slow requests are not necessarily errors. Trusted Advisor gives general best practice recommendations and does not trace requests.',
  },
  {
    id: 'res-060',
    domain: 'resilient',
    lesson: 'management-iac',
    stem: 'A company wants developers to provision approved environments, such as a standard three-tier web stack, by themselves. Developers must not receive broad IAM permissions to create the underlying resources directly, and only templates approved by the cloud team can be used. Which solution meets these requirements?',
    options: [
      'Give developers the AdministratorAccess policy and use AWS Config rules to detect noncompliant resources.',
      'Store approved CloudFormation templates in an S3 bucket and let developers deploy them with their own credentials.',
      'Use Elastic Beanstalk with a shared IAM user for all developers.',
      'Create an AWS Service Catalog portfolio with the approved products and a launch constraint that specifies an IAM role used to provision the resources.',
    ],
    answer: [3],
    explanation:
      'Service Catalog lets admins publish a portfolio of approved products; a launch constraint specifies the IAM role used to create resources, so developers self-launch without direct permissions on the underlying services. AdministratorAccess plus Config only detects problems after the fact and violates least privilege. Deploying templates with their own credentials requires broad developer permissions and allows editing templates. A shared IAM user breaks best practices and does not restrict templates.',
  },
  // ---------------------------------------------------------------- application-integration
  {
    id: 'res-061',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A company uses a SaaS help desk application that is an Amazon EventBridge partner. The company wants to invoke an AWS Lambda function whenever a high-priority ticket is created in the SaaS application, with the LEAST development effort. Which solution meets these requirements?',
    options: [
      'Create an Amazon API Gateway endpoint and configure a webhook in the SaaS application.',
      'Use Amazon AppFlow to copy tickets to Amazon S3 every hour and trigger Lambda from S3 events.',
      'Write a Lambda function on an EventBridge Scheduler schedule that polls the SaaS API every minute.',
      'Configure the SaaS partner event source, associate it with a partner event bus, and create a rule with an event pattern that matches high-priority tickets and targets the Lambda function.',
    ],
    answer: [3],
    explanation:
      'A partner event source pushes SaaS events directly into a partner event bus; a rule with an event pattern filters high-priority tickets and invokes Lambda, with no code to receive webhooks or poll. API Gateway plus a webhook requires building and securing an endpoint yourself. Hourly AppFlow runs are not near real time. Polling every minute costs money, requires code, and still adds latency.',
  },
  {
    id: 'res-062',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A company has 30 AWS accounts. A central operations account must receive all Amazon EC2 instance state-change events from every account so that a single AWS Lambda function can process them. Which solution meets these requirements?',
    options: [
      'Create an Amazon SNS topic in each account and subscribe the Lambda function to every topic.',
      'Enable an organization trail in AWS CloudTrail and configure Lambda to read the log files from Amazon S3.',
      'In each account, create an EventBridge rule that sends matching events to an event bus in the central account. Add a resource-based policy on the central event bus that allows the accounts to put events, and create a rule there that targets the Lambda function.',
      'Configure EventBridge Pipes in the central account with each member account as a source.',
    ],
    answer: [2],
    explanation:
      'The standard EventBridge cross-account pattern: a rule in each source account sends events to the central event bus; the central bus needs a resource-based policy that allows the accounts (or the whole organization) to PutEvents, and a rule there invokes Lambda. Many SNS topics create many management points and need cross-account permissions per topic. CloudTrail log files in S3 arrive with delay and are not an event-driven mechanism. Pipes connect sources such as SQS/Kinesis to a target and cannot take an account as a source.',
  },
  {
    id: 'res-063',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'An application publishes order events to a custom Amazon EventBridge event bus. A bug in a consumer caused events from the last 3 days to be processed incorrectly. After the bug is fixed, the company must reprocess those events. The company wants to be able to do this for future incidents as well. What should a solutions architect do?',
    options: [
      'Configure a dead-letter queue on the rule target and redrive the messages.',
      'Create an EventBridge archive for the event bus and start a replay for the affected time window when needed.',
      'Enable Amazon CloudWatch Logs for the event bus and re-publish the events with a script.',
      'Increase the retry policy of the rule target to 72 hours.',
    ],
    answer: [1],
    explanation:
      'An archive stores the event bus events with a retention period; replay re-sends events from a chosen time window so the fixed consumer can reprocess them. A DLQ only holds events that failed delivery to the target, while these events were delivered successfully. Logs plus a custom script are laborious and error-prone. A retry policy applies only to failed deliveries (up to 24 hours) and does not help reprocess events that were delivered.',
  },
  {
    id: 'res-064',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A company receives messages in an Amazon SQS queue. Only messages with a status of NEW must be processed. Each message must be enriched with customer data from a partner\'s public HTTP API before it starts an AWS Step Functions workflow. The company wants to minimize custom integration code. Which solution meets these requirements?',
    options: [
      'Create an Amazon EventBridge Pipe with the SQS queue as the source, a filter on status NEW, an enrichment step that calls the partner API, and the Step Functions state machine as the target.',
      'Create an AWS Lambda function that polls the queue, filters messages, calls the API, and starts the workflow.',
      'Subscribe the Step Functions state machine directly to the SQS queue.',
      'Use Amazon SNS message filtering on the SQS queue and invoke Step Functions from SNS.',
    ],
    answer: [0],
    explanation:
      'EventBridge Pipes connect source → filter → enrichment → target point-to-point: SQS as the source, a filter keeping only status NEW, an enrichment that calls the API (API destination, API Gateway, or Lambda), then starting Step Functions, with almost no glue code. A custom Lambda function works but needs more code. Step Functions cannot subscribe directly to an SQS queue. SNS filtering applies to topic subscriptions and does not filter messages inside an SQS queue.',
  },
  {
    id: 'res-065',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A company stores 5 million image files in an Amazon S3 bucket. Each image must be processed by an AWS Lambda function, and the company wants the processing to run with high parallelism, with built-in tracking of failed items and the ability to retry them. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Use a Step Functions inline Map state that receives the list of all object keys in the execution input.',
      'Run a single Lambda function that lists the bucket and processes each object in a loop.',
      'Copy the object keys to an Amazon SQS FIFO queue and process them with one consumer.',
      'Use a Step Functions Distributed Map state that reads the objects from the S3 bucket and invokes the Lambda function in parallel child workflow executions.',
    ],
    answer: [3],
    explanation:
      'Distributed Map reads items directly from S3 and runs up to 10,000 parallel child executions, tracks failed items, and supports a tolerated failure threshold, which fits millions of objects. Inline Map has limited concurrency (up to 40) and the execution input cannot hold 5 million keys. A single Lambda function looping sequentially is limited to 15 minutes. An SQS FIFO queue with one consumer is not parallel.',
  },
  {
    id: 'res-066',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A sales team uses Salesforce. The analytics team needs Salesforce opportunity records copied into an Amazon S3 data lake every day, with sensitive fields masked. The company does not want to write or maintain integration code. Which AWS service should the company use?',
    options: [
      'AWS DataSync',
      'Amazon Data Firehose',
      'Amazon AppFlow',
      'AWS Transfer Family',
    ],
    answer: [2],
    explanation:
      'AppFlow is a no-code service that moves data between SaaS applications such as Salesforce and AWS (S3, Redshift), runs on a schedule, and supports filtering, mapping, and field masking. DataSync moves data from storage systems (NFS, SMB, HDFS, object storage) and does not call Salesforce APIs. Firehose receives streams pushed by producers and does not pull data from Salesforce. Transfer Family provides SFTP/FTPS/FTP endpoints for files.',
  },
  {
    id: 'res-067',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A manufacturing company has 20,000 sensors that publish temperature readings over MQTT. Each reading above a threshold must be stored in Amazon DynamoDB, and all readings must be delivered to Amazon S3 for analytics. The company wants a fully managed solution without servers. Which solution meets these requirements?',
    options: [
      'Connect the sensors to AWS IoT Core and create IoT rules that write high readings to DynamoDB and send all readings to Amazon Data Firehose for delivery to S3.',
      'Deploy an MQTT broker on Amazon EC2 instances in an Auto Scaling group and write custom code to store the data.',
      'Use Amazon MQ for RabbitMQ as the MQTT endpoint and an AWS Lambda consumer.',
      'Have the sensors call Amazon SQS directly with HTTP and process messages with AWS Lambda.',
    ],
    answer: [0],
    explanation:
      'IoT Core is a managed MQTT broker that authenticates devices with X.509 certificates; its rules engine uses SQL-like statements to write readings above the threshold to DynamoDB and send all readings through Firehose to S3, with no servers. An MQTT broker on EC2 must be self-managed. Amazon MQ runs on broker instances, is not serverless, has no rules engine, and still needs consumer code. Sensors typically speak MQTT; calling SQS over HTTP requires SigV4-signed requests and custom routing logic.',
  },
  {
    id: 'res-068',
    domain: 'resilient',
    lesson: 'application-integration',
    stem: 'A company implements an order workflow in AWS Step Functions with steps to reserve inventory, charge the customer, and arrange shipping, each in a separate service. Transient errors from the payment service must be retried automatically with increasing delays. If payment ultimately fails, the inventory reservation must be released. Which combination of actions meets these requirements? (Choose TWO.)',
    options: [
      'Convert the workflow to an Express workflow to make retries faster.',
      'Add a Retry field to the payment task with an IntervalSeconds, MaxAttempts, and BackoffRate greater than 1.',
      'Add a Catch field to the payment task that transitions to a compensating state that releases the inventory reservation.',
      'Increase the timeout of the payment Lambda function to 15 minutes.',
      'Configure an Amazon SQS dead-letter queue on the state machine to store failed executions.',
    ],
    answer: [1, 2],
    explanation:
      'Retry with a BackoffRate greater than 1 performs exponential backoff for transient errors; Catch moves to a compensating state that releases the reservation once retries are exhausted, which is the saga pattern. Express does not make retries faster and is not required. Increasing the Lambda timeout does not address transient errors or compensation. A state machine has no SQS DLQ of this kind; error handling inside the workflow uses Retry/Catch.',
  },
];
