import type { Lesson } from '@/content/types';

export const resilientLessonsEn: Lesson[] = [
  {
    slug: 'high-availability-multi-az',
    domain: 'resilient',
    title: 'High Availability and Multi-AZ',
    summary:
      'The foundation of fault-tolerant architecture: Regions, AZs, eliminating single points of failure, Multi-AZ for EC2/RDS/Aurora/EFS, and designing stateless applications for horizontal scaling.',
    services: [
      'Amazon EC2',
      'Amazon RDS',
      'Amazon Aurora',
      'Amazon EFS',
      'Amazon ElastiCache',
      'Amazon DynamoDB',
      'AWS Outposts',
      'AWS Local Zones',
      'AWS Wavelength',
    ],
    minutes: 10,
    body: `## AWS global infrastructure

- **Region**: a geographic area (for example ap-southeast-1 Singapore) made up of multiple AZs. Data does not leave a Region unless you configure replication. Choose a Region based on: compliance/data residency, latency to users, service availability, and price.
- **Availability Zone (AZ)**: one or more discrete data centers with separate power, networking, and cooling, connected by a low-latency network. Each Region has at least 3 AZs. This is the basic unit for designing high availability (HA).
- **Local Zones**: extend a Region close to major cities, for workloads needing single-digit millisecond latency (rendering, gaming, media).
- **Wavelength**: AWS infrastructure placed inside carriers' 5G networks, for ultra-low-latency mobile/edge applications.
- **Outposts**: AWS hardware racks placed in your data center, for workloads that must stay on-premises (latency to legacy systems, data residency) but that want to use the same AWS APIs.

## Single point of failure (SPOF)

Exam questions often describe "one EC2 instance running web + database" and ask how to increase availability. The way to think about it:

- 1 instance in 1 AZ is a SPOF. Solution: multiple instances in **at least 2 AZs**, behind **Elastic Load Balancing**, managed by an **Auto Scaling group**.
- A self-managed database on EC2 is a SPOF. Solution: move to **RDS Multi-AZ** or **Aurora**.
- NAT Gateway is a per-AZ resource: for HA, place **one NAT Gateway per AZ** and point each AZ's route table at the NAT in the same AZ.
- An EBS volume lives in only 1 AZ. If you need a file system shared across AZs, use **EFS** (Regional, data stored redundantly across multiple AZs).

## Multi-AZ per service

| Service | HA mechanism | Exam notes |
|---|---|---|
| EC2 | ASG spanning multiple AZs + ELB | An instance is not "Multi-AZ" by itself |
| RDS Multi-AZ instance | 1 primary + 1 synchronous standby in another AZ | The standby **cannot serve reads**, automatic failover via DNS, typically 1-2 minutes |
| RDS Multi-AZ DB cluster | 1 writer + 2 reader standbys across 3 AZs | The standbys **can serve reads**, faster failover (typically under 35 seconds), for MySQL and PostgreSQL |
| Aurora | Storage with 6 copies across 3 AZs, up to 15 Aurora Replicas | Replicas both scale reads and serve as failover targets |
| EFS Standard | Data stored across multiple AZs, a mount target per AZ | EFS One Zone is cheaper but does not survive an AZ failure |
| DynamoDB, S3, SQS, Lambda | Regional, Multi-AZ automatically | No extra configuration needed |
| ElastiCache Redis/Valkey | Multi-AZ replication group + automatic failover | Memcached has no replication |

### RDS: Multi-AZ vs Read Replica

- **Multi-AZ** = high availability, **synchronous** replication, a single endpoint, automatic failover.
- **Read Replica** = read scaling, **asynchronous** replication, its own endpoint, can be cross-Region, can be manually promoted to a standalone DB.
- A question that says "offload reads for reporting" → Read Replica. A question that says "automatic failover when an AZ fails" → Multi-AZ.

## Vertical and horizontal scaling

- **Vertical scaling (scale up)**: change to a larger instance type. Simple but limited and usually requires downtime; it is still a SPOF.
- **Horizontal scaling (scale out)**: add instances. Goes with ELB + ASG, tolerates failure well, and is the default answer for "elastic" and "unpredictable traffic".

## Stateless applications and sessions

To scale horizontally and let the ASG terminate any instance, the application must be **stateless**:

- Store **sessions** outside the instance: **ElastiCache** (Redis/Valkey, sub-millisecond latency) or **DynamoDB** (serverless, with TTL to automatically delete expired sessions).
- Store user-uploaded files in **S3** or **EFS**, not on each instance's EBS volume.
- Sticky sessions on an ALB are a stopgap: they skew load distribution and lose sessions when an instance dies. When the question asks for a durable solution, choose storing sessions externally.

## Elastic IP

- A static public IPv4 address that can be attached to an instance or ENI and remapped to another instance on failure.
- This is a crude form of failover; a better architecture puts an ELB in front. Elastic IPs are charged (AWS charges for every public IPv4).
- If you need a static IP for a load balancer → use **NLB** (one Elastic IP per AZ) or **Global Accelerator** (2 static anycast IPs).

## Quick summary

1. Always spread resources across at least 2 AZs.
2. Database: RDS Multi-AZ or Aurora; add replicas when you need more reads.
3. Stateless applications, sessions in ElastiCache/DynamoDB.
4. Scale horizontally with ELB + ASG instead of upgrading one big machine.
`,
    keywords: [
      { trigger: 'automatic database failover when an AZ has an issue', answer: 'RDS Multi-AZ' },
      { trigger: 'standby can serve reads, failover under 35 seconds', answer: 'RDS Multi-AZ DB cluster' },
      { trigger: 'offload read queries / reporting', answer: 'RDS Read Replica or Aurora Replica' },
      { trigger: 'store user sessions to keep the app stateless', answer: 'ElastiCache or DynamoDB' },
      { trigger: 'shared file system for many EC2 instances across multiple AZs', answer: 'Amazon EFS' },
      { trigger: 'workload must run on-premises but use AWS APIs', answer: 'AWS Outposts' },
      { trigger: '5G application, ultra-low-latency mobile edge', answer: 'AWS Wavelength' },
      { trigger: 'millisecond latency for users in a specific city', answer: 'AWS Local Zones' },
    ],
    traps: [
      'The standby of an RDS Multi-AZ instance does NOT serve reads; to read, use a Read Replica or a Multi-AZ DB cluster.',
      'Read Replicas use asynchronous replication and are not an automatic-failover HA solution.',
      'One NAT Gateway shared across multiple AZs is a single point of failure; you need one NAT Gateway per AZ.',
      'An EBS volume lives in a single AZ; it cannot be attached across AZs (you must go through a snapshot).',
      'Sticky sessions do not make an app stateless; losing the instance means losing the session.',
      'Scaling up (a larger instance) does not remove a single point of failure.',
    ],
  },
  {
    slug: 'elastic-load-balancing',
    domain: 'resilient',
    title: 'Elastic Load Balancing: ALB, NLB, GWLB',
    summary:
      'Choose the right load balancer by layer and protocol, and understand listeners, target groups, health checks, cross-zone, sticky sessions, SSL offload, and static IPs.',
    services: [
      'Elastic Load Balancing',
      'Application Load Balancer',
      'Network Load Balancer',
      'Gateway Load Balancer',
      'AWS Certificate Manager',
      'AWS Lambda',
    ],
    minutes: 11,
    body: `## Types of load balancers

| Criteria | ALB | NLB | GWLB | CLB |
|---|---|---|---|---|
| Layer | 7 (HTTP/HTTPS, gRPC, WebSocket) | 4 (TCP, UDP, TLS) | 3 (IP packets, GENEVE port 6081) | 4 and 7 (legacy) |
| Routing | Path, host, header, query string, method, source IP | By port/protocol | Forwards traffic through appliances | Basic |
| Target | Instance, IP, Lambda, (an ALB cannot be a target of an ALB) | Instance, IP, ALB | Appliance instance, IP | Instance |
| Static IP | No (DNS name) | Yes, 1 static IP/Elastic IP per AZ | No | No |
| Performance | Good | Millions of requests/second, ultra-low latency | | |
| Use case | Microservices, containers, web | Gaming, IoT, TCP/UDP, static IP needs, PrivateLink | Firewalls, third-party IDS/IPS | Not for new designs |

Quick selection rules:
- HTTP/HTTPS, need routing by URL or host → **ALB**.
- TCP/UDP, need static IP, need extreme performance, or acting as an endpoint service for **PrivateLink** → **NLB**.
- Need to transparently insert a **virtual appliance** (third-party firewall) into the traffic path → **GWLB**.

## Listeners, rules, and target groups

- **Listener**: listens on a protocol + port (for example HTTPS:443).
- **Rule** (ALB): condition (path /api/*, host api.example.com, header...) → action (forward, redirect, fixed-response, authenticate via Cognito/OIDC).
- **Target group**: a group of targets sharing a health check. One ALB can route to multiple target groups → one ALB serves multiple microservices.
- **Weighted target groups**: split a % of traffic between two target groups, used for blue/green or canary.
- HTTP → HTTPS redirect is done directly on the ALB listener.

## Health checks

- ELB only sends traffic to **healthy** targets. Configure the path (for example /health), interval, and healthy/unhealthy thresholds.
- When an ASG uses **ELB health checks**, an instance marked unhealthy by the ELB is replaced by the ASG (see the Auto Scaling lesson).

## Cross-zone load balancing

- On: each LB node distributes traffic evenly across **all** targets in every AZ. Off: each node only distributes to targets in its own AZ.
- **ALB**: on by default, no inter-AZ data charge.
- **NLB and GWLB**: off by default; enabling it incurs inter-AZ data transfer charges.
- A question that says "uneven number of instances per AZ, load is skewed" → enable cross-zone load balancing.

## Sticky sessions (session affinity)

- ALB uses cookies (a duration-based cookie generated by the LB, or an application-based cookie) to keep a client on the same target.
- Drawbacks: uneven load, and sessions are lost when the target dies. A better solution is storing sessions in ElastiCache/DynamoDB.

## Deregistration delay (connection draining)

- When a target is removed (scale in, deployment), the LB stops sending new requests but lets in-flight requests complete during the **deregistration delay** (default 300 seconds, configurable 0-3,600 seconds).
- On a CLB this is called **connection draining**.
- Short requests → reduce the value to scale in faster.

## SSL/TLS offload, ACM, and SNI

- Attach a certificate from **AWS Certificate Manager (ACM)** to an HTTPS listener (ALB) or TLS listener (NLB) → the LB decrypts, reducing CPU load on the backend. ACM automatically renews public certificates.
- **SNI (Server Name Indication)**: one listener holds multiple certificates and the LB picks the certificate based on the hostname the client requests → host multiple domains on **one** ALB/NLB. CLB does not support SNI.
- Need end-to-end encryption all the way to the instance: use HTTPS from the LB to the target, or NLB TCP passthrough (does not terminate TLS).

## Static IP and whitelisting

- ALB has no static IP. When a customer requires a fixed IP to whitelist:
  - **NLB** with an Elastic IP per AZ; you can place an ALB as the NLB's target to get both a static IP and layer 7 routing.
  - Or **Global Accelerator** (2 static anycast IPs) in front of the ALB.

## ALB with Lambda

- An ALB can use a **Lambda function as a target**: the HTTP request is converted to a JSON event. Suitable when you want to route /api to Lambda and other routes to EC2 on the same ALB.
- If you need API management features (usage plans, API keys, per-client throttling), API Gateway is a better fit.

## Security

- Both ALB and NLB support **security groups**. A common setup is for the EC2 security group to allow traffic only from the LB's security group.
- ALB integrates with **AWS WAF** to block SQL injection, XSS, and rate-based rules. NLB cannot attach WAF directly.
- The **X-Forwarded-For** header on an ALB contains the client's real IP. NLB preserves the client's source IP (with instance target type).
`,
    keywords: [
      { trigger: 'routing by path /api or by hostname', answer: 'Application Load Balancer' },
      { trigger: 'TCP/UDP, millions of requests/second, ultra-low latency', answer: 'Network Load Balancer' },
      { trigger: 'partner needs to whitelist a static IP of the load balancer', answer: 'NLB with Elastic IP or Global Accelerator' },
      { trigger: 'transparently insert a third-party firewall/IDS into the traffic flow', answer: 'Gateway Load Balancer' },
      { trigger: 'multiple HTTPS domains on one load balancer', answer: 'SNI with multiple ACM certificates' },
      { trigger: 'let in-flight requests finish before removing an instance', answer: 'Deregistration delay (connection draining)' },
      { trigger: 'traffic distributed unevenly because AZs have different numbers of instances', answer: 'Enable cross-zone load balancing' },
      { trigger: 'block SQL injection in front of the ALB', answer: 'AWS WAF attached to the ALB' },
    ],
    traps: [
      'ALB has no static IP; do not choose "attach an Elastic IP to the ALB".',
      'CLB does not support SNI; to host multiple certificates, use ALB or NLB.',
      'Cross-zone load balancing on NLB is off by default and incurs inter-AZ charges, unlike ALB.',
      'Sticky sessions are not an HA solution for sessions; store sessions in ElastiCache/DynamoDB.',
      'WAF can be attached to ALB, API Gateway, and CloudFront, but not directly to NLB.',
    ],
  },
  {
    slug: 'auto-scaling',
    domain: 'resilient',
    title: 'EC2 Auto Scaling',
    summary:
      'An Auto Scaling group automatically replaces failed instances and scales with load. Know the scaling policy types, health checks, lifecycle hooks, warm pools, and how to scale on SQS backlog.',
    services: ['Amazon EC2 Auto Scaling', 'Amazon CloudWatch', 'Amazon SQS', 'Elastic Load Balancing'],
    minutes: 11,
    body: `## Components of an Auto Scaling group (ASG)

- **Launch template**: AMI, instance type, key pair, security group, user data, IAM instance profile. Launch templates support versioning, multiple instance types, and Spot + On-Demand; **launch configurations are legacy** and should not be used in new designs.
- **Min / Desired / Max capacity**: the ASG always keeps the instance count equal to desired, within the range [min, max].
- **Subnets in multiple AZs**: the ASG balances instances across AZs; when an AZ fails, the ASG launches replacement instances in the remaining AZs.
- **Mixed instances policy**: combine an On-Demand base + Spot, with multiple instance types to improve the chance of getting Spot capacity.

## Scaling policy types

| Type | How it works | When to choose |
|---|---|---|
| Target tracking | Keeps a metric around a target value (for example CPU 50%, RequestCountPerTarget 1000) | The default, simplest, least operational effort |
| Step scaling | Adds/removes different numbers of instances depending on how far the alarm threshold is breached | Need a stronger reaction when the threshold is exceeded by a wide margin |
| Simple scaling | One action per alarm, waits for the cooldown to finish before scaling again | Legacy, rarely used |
| Scheduled scaling | Sets min/desired/max on a schedule (cron) | Predictable load increases by time (for example 9 AM on Monday) |
| Predictive scaling | Uses ML on historical data to forecast and launch ahead | Load with a daily/weekly recurring cycle, where capacity must be ready before the load arrives |

You can combine multiple policies; when they conflict, the ASG picks the result giving the **largest capacity**.

## Cooldown and instance warm-up

- **Cooldown** (default 300 seconds) applies to simple scaling: after a scaling action, the ASG waits before scaling again.
- **Instance warm-up** (target tracking/step): the time during which a new instance is not yet counted in the aggregated metric, preventing over-scaling while the instance is still starting up.
- **Health check grace period**: the period after launch during which the ASG does not check health, so the app has time to start.

## Health checks: EC2 or ELB

- By default the ASG uses **EC2 status checks**: they only detect hardware/operating system failures.
- Enable **ELB health checks** on the ASG: an instance that is still "running" but whose application returns errors (HTTP health check fails) will be **terminated and replaced** by the ASG.
- A question like "the app hangs but the instance is still running and the ASG does not replace it" → enable ELB health checks for the ASG.

## Lifecycle hooks

- Pause an instance in the **Pending:Wait** state (on launch) or **Terminating:Wait** state (on terminate).
- Used to: install/configure before receiving traffic, or **collect logs/flush data** before the instance is deleted.
- Combine with EventBridge or SNS/SQS to trigger Lambda/scripts; call complete-lifecycle-action when done. Default timeout is 1 hour.

## Warm pools

- Keep a pool of pre-initialized instances in the **Stopped**, **Running**, or **Hibernated** state.
- Reduces scale-out latency for applications with long startup (for example needing several minutes to load data). Stopped instances only incur EBS charges.

## Termination policy

- Default: pick the AZ with the most instances to rebalance, then prefer the instance using the oldest launch template/configuration, then the instance closest to the next billing hour.
- Customizable: OldestInstance, NewestInstance, OldestLaunchTemplate, AllocationStrategy...
- **Instance scale-in protection** protects an instance processing a long job from being scaled in.
- **Instance refresh** gradually replaces all instances when you update the AMI/launch template.

## Scaling on SQS backlog per instance

For workers processing an SQS queue, the CPU metric does not reflect the real load. The recommended approach:

1. Calculate **backlog per instance** = ApproximateNumberOfMessagesVisible / number of InService instances.
2. Determine the acceptable value = acceptable latency / average processing time per message (for example 10 seconds / 0.1 seconds = 100 messages/instance).
3. Publish a custom metric to CloudWatch and use **target tracking** with that target.

## Exam notes

- ASG has no separate charge; you only pay for the resources.
- ASG + ALB across multiple AZs is the standard answer for a "highly available, scalable web tier".
- Want desired = 0 outside working hours to save money → scheduled scaling.
- When a Spot instance is reclaimed: the ASG automatically launches a replacement; enable **Capacity Rebalancing** to proactively replace instances at risk of reclamation.
`,
    keywords: [
      { trigger: 'keep average CPU at 50%', answer: 'Target tracking scaling policy' },
      { trigger: 'load increases at the same time every day, known in advance', answer: 'Scheduled scaling or predictive scaling' },
      { trigger: 'application is unresponsive but the instance is still running and is not replaced', answer: 'Enable ELB health checks for the ASG' },
      { trigger: 'collect logs before an instance is terminated', answer: 'Lifecycle hook Terminating:Wait' },
      { trigger: 'application takes several minutes to start, needs fast scale out', answer: 'Warm pools' },
      { trigger: 'scale workers by the number of messages in the queue', answer: 'Target tracking on backlog per instance (custom metric)' },
      { trigger: 'update the AMI for all instances in the ASG', answer: 'Instance refresh with the new launch template version' },
    ],
    traps: [
      'By default the ASG only uses EC2 status checks and does not detect failures at the application layer.',
      'Launch configurations are legacy; new answers should use launch templates.',
      'Scaling on CPU for SQS workers is usually wrong; use backlog per instance.',
      'Simple scaling is blocked by the cooldown; target tracking is the lower-operations choice.',
      'Scheduled scaling does not react to unexpected load; combine it with dynamic scaling.',
    ],
  },
  {
    slug: 'decoupling-messaging',
    domain: 'resilient',
    title: 'Decoupling: SQS, SNS, EventBridge, Kinesis, Amazon MQ',
    summary:
      'Decouple components so the system tolerates failure and scales independently. Distinguish SQS Standard/FIFO, SNS fan-out, EventBridge, Kinesis Data Streams, and Amazon MQ.',
    services: ['Amazon SQS', 'Amazon SNS', 'Amazon EventBridge', 'Amazon Kinesis Data Streams', 'Amazon MQ'],
    minutes: 12,
    body: `## Why decoupling is needed

When the web tier calls a slow backend directly, a traffic surge can bring down the whole system. Putting a queue in between helps: absorb spikes, retry on failure, and scale producers and consumers independently. Exam keywords: "decouple", "loosely coupled", "orders must not be lost when the backend fails".

## Amazon SQS

| Attribute | Standard | FIFO |
|---|---|---|
| Ordering | Best-effort | Guaranteed ordering within the same **message group ID** |
| Delivery | At-least-once (duplicates possible) | **Exactly-once processing** (deduplication within 5 minutes) |
| Throughput | Nearly unlimited | 300 msg/s per API action, 3,000 msg/s with batching; high-throughput mode is much higher |
| Queue name | Any | Must end with .fifo |

Commonly tested parameters:
- **Retention**: default 4 days, from 1 minute up to **14 days**.
- **Visibility timeout**: default 30 seconds, maximum 12 hours. If the consumer has not deleted the message before the timeout expires, the message reappears and is processed again. For long processing → increase the visibility timeout or call ChangeMessageVisibility.
- **Long polling**: ReceiveMessageWaitTimeSeconds up to 20 seconds, reducing empty API calls → lower cost and latency.
- **Delay queue**: delay a message 0-15 minutes before consumers see it.
- **Dead-letter queue (DLQ)**: a message received more than **maxReceiveCount** times is moved to the DLQ for analysis; it can be **redriven** back to the source queue. The DLQ of a FIFO queue must be FIFO.
- **Message size**: the classic limit in exam questions is 256 KB (AWS raised it to 1 MiB in 2025). Larger payloads → **SQS Extended Client Library** stores the payload in **S3**, and the message only contains a pointer.
- Security: SSE with an SQS-managed key or KMS, queue access policy, VPC endpoint.

## Amazon SNS

- Pub/sub: one **topic**, many subscribers (SQS, Lambda, HTTP/S, email, SMS, mobile push, Firehose).
- **Fan-out SNS → multiple SQS**: one event must be processed in parallel by multiple independent systems (for example order → warehouse, payment, analytics). Each system has its own durable queue and its own retries. You must grant permission in the SQS access policy for SNS to send to it.
- **Message filtering**: a filter policy on the subscription so a subscriber only receives matching messages (for example only orders with country = VN), without creating multiple topics.
- **SNS FIFO topic** combines with SQS FIFO when you need ordered, deduplicated fan-out.
- SNS does not store messages long-term: offline subscribers may lose messages, so put SQS behind it for durability.

## Amazon EventBridge

- Serverless event bus: **default bus** (events from AWS services), **custom bus** (your applications), **partner bus** (SaaS such as Zendesk, Datadog).
- **Rules** filter events by event pattern and then send them to targets (Lambda, SQS, Step Functions, SNS, API destinations...). Supports event **archive and replay**.
- **EventBridge Scheduler**: scheduling (cron/rate/one-time) that invokes thousands of target types, replacing cron on EC2.
- **EventBridge Pipes**: point-to-point connections from a source (SQS, Kinesis, DynamoDB Streams...) to a target, with filtering and enrichment, reducing glue code.
- Choose EventBridge when: reacting to AWS events (for example EC2 state change), integrating SaaS, routing with many complex rules. Choose SNS when you need simple fan-out, high throughput, push to SMS/email/mobile.

## Kinesis Data Streams vs SQS

| Criteria | Kinesis Data Streams | SQS |
|---|---|---|
| Model | Stream, multiple consumers read the same data | Queue, messages are deleted after processing |
| Replay | Yes, default retention 24 hours, up to 365 days | No |
| Ordering | Per shard (partition key) | FIFO per message group |
| Use case | Real-time analytics, clickstream, IoT, logs | Decoupling tasks, job queues |
| Capacity | Provisioned (shard: 1 MB/s write, 2 MB/s read) or On-demand | Automatic |

Keywords "real-time", "multiple applications read the same data stream", "replay" → Kinesis. To push a stream into S3/Redshift/OpenSearch without code → **Amazon Data Firehose** (near real-time).

## Amazon MQ

- Managed message broker for **Apache ActiveMQ** and **RabbitMQ**, supporting standard protocols: **AMQP, MQTT, STOMP, OpenWire, JMS**.
- Choose it when you **migrate an existing application** that uses an on-premises broker and you do not want to change code to the SQS/SNS APIs.
- HA: active/standby brokers across 2 AZs (ActiveMQ) or a 3-node cluster (RabbitMQ). It does not scale "infinitely" like SQS/SNS.

## Quick selection

- Job queue, decoupling, tolerate spikes → SQS Standard.
- Need ordering + no duplicates → SQS FIFO.
- One event, many systems process it → SNS fan-out to multiple SQS.
- Events from AWS services/SaaS, content-based routing → EventBridge.
- Real-time streaming, replay, multiple consumers → Kinesis Data Streams.
- Lift-and-shift an app using AMQP/MQTT/JMS → Amazon MQ.
`,
    keywords: [
      { trigger: 'processing order is required and no duplicate processing', answer: 'SQS FIFO' },
      { trigger: 'one event needs multiple independent systems to process it in parallel', answer: 'SNS fan-out to multiple SQS queues' },
      { trigger: 'messages that repeatedly fail processing need to be set aside for analysis', answer: 'Dead-letter queue' },
      { trigger: 'message processed twice because processing takes long', answer: 'Increase the visibility timeout' },
      { trigger: 'reduce the number of ReceiveMessage calls that return empty', answer: 'Long polling (WaitTimeSeconds up to 20)' },
      { trigger: 'payload larger than the SQS message limit', answer: 'SQS Extended Client Library + S3' },
      { trigger: 'migrate an app using AMQP/MQTT/JMS without code changes', answer: 'Amazon MQ' },
      { trigger: 'real-time, multiple consumers, replay data', answer: 'Kinesis Data Streams' },
      { trigger: 'react to SaaS events or AWS service state changes', answer: 'Amazon EventBridge rule' },
      { trigger: 'subscriber only receives part of the messages on a topic', answer: 'SNS message filtering (filter policy)' },
    ],
    traps: [
      'SQS Standard can deliver duplicates and out of order; do not choose it when the question requires exactly-once.',
      'SQS does not let multiple consumers each read the same message independently; you need SNS fan-out or Kinesis.',
      'SNS does not store messages; for durability, put SQS behind SNS.',
      'Amazon MQ is not the choice for new applications that need large scale; use SQS/SNS.',
      'A delay queue (delay before the message becomes visible) differs from the visibility timeout (hidden after being received).',
      'Data Firehose is near real-time and has no replay; Kinesis Data Streams is the real-time + replay option.',
    ],
  },
  {
    slug: 'serverless-workflows',
    domain: 'resilient',
    title: 'Serverless: Lambda, API Gateway, Step Functions, AppSync',
    summary:
      'The Lambda limits that often appear on the exam, how to choose an API Gateway type, when to use Step Functions Standard or Express, and Lambda@Edge vs CloudFront Functions.',
    services: ['AWS Lambda', 'Amazon API Gateway', 'AWS Step Functions', 'AWS AppSync', 'Amazon CloudFront'],
    minutes: 11,
    body: `## AWS Lambda: numbers to remember

| Limit | Value |
|---|---|
| Maximum run time | **15 minutes** (900 seconds) |
| Memory | 128 MB to **10,240 MB** (CPU increases with memory) |
| Ephemeral storage /tmp | 512 MB default, up to 10 GB |
| Default concurrency | 1,000 per Region (soft limit, can be increased) |
| Deployment package | 50 MB zipped upload, 250 MB unzipped; container image up to 10 GB |
| Synchronous invocation payload | 6 MB |

- A job running longer than 15 minutes → do not use Lambda; choose **ECS/Fargate**, **AWS Batch**, or break it up with **Step Functions**.
- Lambda scales automatically with the number of requests; each concurrent request uses one execution environment.

### Concurrency

- **Reserved concurrency**: dedicates and **caps** concurrency for a function. Used to protect downstream resources (for example a database that cannot handle more than 100 connections) or to ensure a critical function always has capacity. Set to 0 to pause the function.
- **Provisioned concurrency**: keeps initialized execution environments ready → eliminates **cold starts**. Has a charge. Can be combined with Application Auto Scaling to adjust on a schedule.
- **SnapStart** (Java, Python, .NET): reduces cold starts using snapshots.
- Lambda connecting to RDS with many concurrent connections → use **RDS Proxy** to pool connections.

### Lambda in a VPC

- Attach Lambda to private subnets to access RDS and ElastiCache in the VPC (Lambda uses Hyperplane ENIs).
- Lambda in a VPC has **no Internet access** unless routed through a **NAT Gateway**; use a **VPC endpoint** to reach S3/DynamoDB.

### Invoking Lambda and error handling

- Synchronous (API Gateway, ALB), asynchronous (S3, SNS, EventBridge: automatic 2 retries, can configure a **destination** or DLQ), and **event source mapping** (SQS, Kinesis, DynamoDB Streams: Lambda polls).

## Lambda@Edge and CloudFront Functions

| Criteria | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Language | JavaScript | Node.js, Python |
| Trigger | Viewer request/response | Viewer + origin request/response |
| Run time | Under 1 ms | Up to 5 seconds (viewer), 30 seconds (origin) |
| Network/body access | No | Yes |
| Use case | Rewrite URLs, headers, redirects, simple token checks, massive scale, cheap | Complex logic, calling external services, processing the body |

## Amazon API Gateway

| Type | Characteristics |
|---|---|
| REST API | Full-featured: **API keys, usage plans**, caching, request validation, WAF, private endpoints, edge-optimized |
| HTTP API | Cheaper, lower latency, JWT/OIDC authorizer, fewer features |
| WebSocket API | Long-lived two-way connections: chat, real-time dashboards |

- **Endpoint types**: Edge-optimized (via CloudFront), Regional, Private (accessible only from a VPC via an interface endpoint).
- **Throttling**: default 10,000 requests/second and burst of 5,000 per account per Region; exceeding it returns **429 Too Many Requests**. You can set throttling per stage/method.
- **Usage plans + API keys**: limit rate and quota per customer (for example a Free plan of 1,000 requests/day).
- **Caching** (REST API): cache responses at the stage, default TTL 300 seconds, maximum 3,600 seconds → reduces backend load.
- **Integration timeout** default is 29 seconds.
- Authorizers: IAM, Cognito user pool, Lambda authorizer.
- Put **SQS** behind API Gateway (service integration) to absorb write spikes.

## AWS Step Functions

- Orchestrate multiple steps (Lambda, ECS, Glue, SageMaker, direct calls to more than 200 AWS services via SDK integrations) with a state machine: retry, catch, parallel, map, wait, choice.
- Supports **human approval** (callback with a task token).

| | Standard | Express |
|---|---|---|
| Maximum run time | 1 year | 5 minutes |
| Semantics | Exactly-once | At-least-once (async) / at-most-once (sync) |
| Pricing | Per state transition | Per number of executions + duration + memory |
| Use case | Long workflows, need audit history, approvals | High-volume event processing, IoT, streaming |

## AWS AppSync

- Managed **GraphQL** (and Pub/Sub API): clients fetch exactly the data they need from multiple sources (DynamoDB, Lambda, RDS, HTTP) in a single request.
- Supports **real-time subscriptions** over WebSocket and offline sync for mobile.
- Keywords "GraphQL", "real-time updates for a mobile/web app" → AppSync.
`,
    keywords: [
      { trigger: 'job runs longer than 15 minutes', answer: 'ECS/Fargate or AWS Batch, not Lambda' },
      { trigger: 'eliminate cold starts for a latency-sensitive API', answer: 'Lambda provisioned concurrency' },
      { trigger: 'limit the number of connections Lambda creates to the database', answer: 'Reserved concurrency and/or RDS Proxy' },
      { trigger: 'limit requests per customer using API keys', answer: 'API Gateway usage plans' },
      { trigger: 'multi-step workflow, runs for days, needs manual approval', answer: 'Step Functions Standard' },
      { trigger: 'high-volume event processing, each workflow takes a few seconds', answer: 'Step Functions Express' },
      { trigger: 'rewrite URL/header at the edge, simple, very cheap', answer: 'CloudFront Functions' },
      { trigger: 'GraphQL API with real-time subscriptions', answer: 'AWS AppSync' },
      { trigger: 'real-time two-way chat over an API', answer: 'API Gateway WebSocket API' },
    ],
    traps: [
      'Lambda in a private subnet cannot reach the Internet without a NAT Gateway.',
      'Reserved concurrency does not eliminate cold starts; provisioned concurrency does.',
      'Usage plans and API keys exist only in REST API, not in HTTP API.',
      'Step Functions Express runs at most 5 minutes; long workflows must use Standard.',
      'CloudFront Functions have no network access and do not run on origin request/response.',
      'API Gateway caching is available only in REST API.',
    ],
  },
  {
    slug: 'route53-routing',
    domain: 'resilient',
    title: 'Route 53: DNS, routing policies, and health checks',
    summary:
      'Record types, Alias vs CNAME, the eight routing policies, health checks for failover, Route 53 Resolver for hybrid DNS, and when to use Global Accelerator instead of DNS.',
    services: ['Amazon Route 53', 'Route 53 Resolver', 'AWS Global Accelerator', 'Amazon CloudWatch'],
    minutes: 11,
    body: `## Important record types

- **A**: name → IPv4. **AAAA**: name → IPv6.
- **CNAME**: name → another name. **Cannot be used at the zone apex** (example.com), only for subdomains.
- **NS**: name servers of the hosted zone. **MX**: mail server. **TXT**: domain verification, SPF.
- **Alias** (a Route 53-specific feature): points a name at an AWS resource.

## Alias vs CNAME

| | Alias | CNAME |
|---|---|---|
| Zone apex (example.com) | Yes | No |
| Target | ELB, CloudFront, API Gateway, S3 website, Global Accelerator, VPC interface endpoint, another record in the same hosted zone... | Any hostname |
| Query charge | Free when pointing at AWS resources | Charged |
| TTL | Managed by Route 53 | Set by you |
| Automatically follows IP changes | Yes | Depends on the target's DNS |

- Alias **cannot** point to the DNS name of an EC2 instance.
- A question that says "point example.com to an ALB" → Alias A record.

## Routing policies

| Policy | Behavior | Use case |
|---|---|---|
| Simple | Returns one or more values, the client picks randomly; **no health checks** | A single resource |
| Weighted | Splits by weight (for example 90/10) | Canary, blue/green, A/B testing |
| Latency | Returns the Region with the lowest network latency to the user | Multi-Region applications, optimizing speed |
| Failover | Primary/secondary, switches when the primary is unhealthy | Active-passive DR |
| Geolocation | By user location (continent, country, US state); should have a **Default** record | Language-specific content, copyright restrictions, compliance |
| Geoproximity | By geographic distance to resources, adjusted with a **bias** | Gradually shifting traffic between regions |
| Multivalue answer | Returns up to 8 **healthy** records | Simple client-side "load balancing", not a replacement for ELB |
| IP-based | By the client's CIDR range | Optimizing for known ISPs or source networks |

- Geolocation is based on **location** (law, language), Latency is based on **measured latency**. A question that says "users in Germany must be served from eu-central-1 because of regulations" → Geolocation.

## Health checks

- Three types: **endpoint** (HTTP/HTTPS/TCP to an IP or domain), **calculated** (combines multiple child health checks with AND/OR/threshold), and **CloudWatch alarm** based.
- Route 53 health checkers are outside the VPC → they cannot reach private resources. For private resources, create a **CloudWatch alarm** on a metric and then create a health check based on that alarm.
- Attach a health check to a record so Route 53 skips unhealthy endpoints (failover, weighted, latency, geolocation, multivalue).
- For an Alias pointing at an ELB, enable **Evaluate Target Health** instead of creating a separate health check.
- You can send notifications through CloudWatch alarm + SNS.

## TTL

- High TTL: fewer DNS queries (cheaper), but changes propagate slowly.
- Low TTL: fast switchover during migration/failover, more queries.
- Migration tip: lower the TTL a few days before changing the record, then raise it again.

## Hosted zones and hybrid DNS

- **Public hosted zone**: domain names on the Internet. **Private hosted zone**: resolves only within the associated VPCs (requires enableDnsHostnames and enableDnsSupport to be on).
- **Route 53 Resolver** (AmazonProvidedDNS at the VPC CIDR base address +2):
  - **Inbound endpoint**: on-premises DNS servers forward queries **into** AWS to resolve private hosted zones.
  - **Outbound endpoint + forwarding rules**: resources in the VPC resolve **on-premises** domain names (for example corp.local).
  - Rules can be shared across multiple accounts with **AWS RAM**.
- **Route 53 Resolver DNS Firewall**: blocks queries to malicious domains from the VPC.

## Route 53 or Global Accelerator

| | Route 53 | Global Accelerator |
|---|---|---|
| Mechanism | DNS, depends on TTL and client caching | 2 **static anycast IPs**, traffic goes over the AWS backbone network |
| Failover | Per TTL, can be slow due to client caching | Fast (under 1 minute), independent of DNS caching |
| Protocols | Anything that uses DNS | TCP, UDP (gaming, VoIP, IoT) |
| Static IP | No | Yes |

- Global Accelerator differs from CloudFront: CloudFront **caches** HTTP content at the edge; Global Accelerator **does not cache**, it only accelerates the network path and provides static IPs for TCP/UDP.
`,
    keywords: [
      { trigger: 'point the zone apex example.com to an ALB/CloudFront', answer: 'Route 53 Alias record' },
      { trigger: 'shift 10% of traffic to a new version', answer: 'Weighted routing' },
      { trigger: 'users are sent to the Region with the lowest latency', answer: 'Latency-based routing' },
      { trigger: 'country-specific content, legal requirements by location', answer: 'Geolocation routing' },
      { trigger: 'active-passive, switch to the standby site when the primary fails', answer: 'Failover routing + health check' },
      { trigger: 'health check for a resource in a private subnet', answer: 'Health check based on a CloudWatch alarm' },
      { trigger: 'VPC resolves on-premises domain names', answer: 'Route 53 Resolver outbound endpoint + forwarding rule' },
      { trigger: 'on-premises resolves a private hosted zone', answer: 'Route 53 Resolver inbound endpoint' },
      { trigger: 'global static IP, fast failover, UDP gaming', answer: 'AWS Global Accelerator' },
    ],
    traps: [
      'CNAME cannot be used at the zone apex; use Alias.',
      'Alias cannot point to the DNS name of an EC2 instance.',
      'Simple routing does not support health checks.',
      'Multivalue answer cannot replace an ELB (no deep application-layer health checks, no per-connection load distribution).',
      'Route 53 health checkers cannot reach a private subnet; use a CloudWatch alarm health check.',
      'Geolocation without a Default record returns "no answer" for users outside the configured regions.',
    ],
  },
  {
    slug: 'disaster-recovery',
    domain: 'resilient',
    title: 'Disaster Recovery: RPO, RTO, and the 4 strategies',
    summary:
      'Understand RPO/RTO, and choose the right strategy among backup & restore, pilot light, warm standby, or multi-site active/active based on requirements and cost, plus AWS Elastic Disaster Recovery.',
    services: [
      'AWS Elastic Disaster Recovery',
      'AWS Backup',
      'Amazon Route 53',
      'Amazon Aurora',
      'Amazon S3',
      'Amazon EBS',
    ],
    minutes: 10,
    body: `## RPO and RTO

- **RPO (Recovery Point Objective)**: the maximum amount of data you accept losing, measured in time. RPO of 1 hour = you may lose at most 1 hour of data → you must back up/replicate at least every hour.
- **RTO (Recovery Time Objective)**: the maximum time from the incident until the system is running again.
- The smaller the RPO/RTO → the higher the cost. Exam questions usually give RPO/RTO numbers + "MOST cost-effective" and you choose the **cheapest strategy that still meets the requirements**.

## The four DR strategies

| Strategy | What exists in the DR Region | Typical RPO / RTO | Cost |
|---|---|---|---|
| Backup & restore | Only backups (snapshots, AMIs, S3) | Hours / many hours to days | Lowest |
| Pilot light | Data continuously replicated (DB replica), minimal core infrastructure; app servers are **off** or not yet created | Minutes / tens of minutes | Low |
| Warm standby | A scaled-down copy of the entire system that is **running** | Seconds-minutes / minutes | Medium |
| Multi-site active/active | The full system runs and receives traffic in multiple Regions | Near 0 / near 0 | Highest |

### Backup & restore

- Periodic backups, cross-Region copies (EBS snapshots, RDS snapshots, AWS Backup cross-Region copy, S3 CRR).
- During an incident: use **CloudFormation/IaC** to rebuild the infrastructure and restore the data.
- Suitable when RTO is measured in hours and the workload is not critical.

### Pilot light

- Like the "pilot flame": the core (database) is always replicated, for example an **RDS cross-Region read replica** or **Aurora Global Database**.
- The app tier only has an AMI and launch template ready; during an incident you launch, scale up, promote the database, and switch DNS.

### Warm standby

- The whole stack runs at small scale (for example ASG min 1), and can receive a bit of traffic or be used for testing.
- During an incident: increase ASG capacity, promote the DB, Route 53 failover.
- It differs from pilot light in that the app servers are **already running**, so RTO is shorter.

### Multi-site active/active

- Multiple Regions serve at the same time (Route 53 latency/weighted routing), with data synchronized using **DynamoDB global tables** or **Aurora Global Database** (write forwarding).
- RTO is nearly 0, cost is highest, and it is the most complex with respect to write conflicts.

## AWS Elastic Disaster Recovery (AWS DRS)

- **Continuously replicates at block level** from on-premises servers, servers in another cloud, or EC2 in another Region into a low-cost **staging area** in AWS (EBS volumes + small replication instances).
- RPO in **seconds**, RTO in **minutes**; on failover, DRS launches converted EC2 instances.
- Supports **drills** (test launches without affecting replication) and **failback** to the source.
- Keywords: "on-premises servers", "reduce the cost of the DR site", "RPO seconds, RTO minutes" → AWS Elastic Disaster Recovery. It replaces CloudEndure Disaster Recovery.
- Differs from **AWS Application Migration Service (MGN)**: MGN is for one-time migration (lift-and-shift), DRS is for continuous DR.

## Cross-Region snapshot copy

- **EBS snapshots** and **AMIs**: copy to another Region (can be re-encrypted with a KMS key in the destination Region). An AMI is a Region-scoped resource.
- **RDS snapshots**: copy manually or enable **cross-Region automated backups** replication.
- Automation: **AWS Backup** copy rules or **Amazon Data Lifecycle Manager** cross-Region copy.
- Encrypted snapshots: the destination Region needs a KMS key in that Region (or a multi-Region key).

## Tips for choosing the answer

1. Read the RPO/RTO first. Hours → backup & restore. Tens of minutes → pilot light. A few minutes → warm standby. Near 0 → active/active.
2. If two strategies both qualify, choose the **cheaper** one when the question says cost-effective.
3. The database is always the hard part: pay attention to cross-Region replication (Aurora Global Database for RPO of about 1 second, RTO under 1 minute).
4. DNS failover with Route 53 failover routing + health check is the common piece of every multi-Region strategy.
5. Infrastructure as code (CloudFormation, CDK) helps reduce RTO when you have to rebuild.
`,
    keywords: [
      { trigger: 'RPO/RTO measured in hours, lowest cost', answer: 'Backup and restore' },
      { trigger: 'database replicated continuously, app servers only launched during an incident', answer: 'Pilot light' },
      { trigger: 'a scaled-down copy of production always running in another Region', answer: 'Warm standby' },
      { trigger: 'RTO near 0, both Regions serve traffic', answer: 'Multi-site active/active' },
      { trigger: 'DR for on-premises servers, RPO seconds, RTO minutes', answer: 'AWS Elastic Disaster Recovery' },
      { trigger: 'quickly rebuild infrastructure in another Region', answer: 'AWS CloudFormation (IaC)' },
      { trigger: 'switch DNS to the DR Region when the primary fails', answer: 'Route 53 failover routing + health check' },
    ],
    traps: [
      'Confusing pilot light (app servers off) with warm standby (app servers running at small scale).',
      'Choosing active/active when the question only needs an RTO of a few hours is wasteful, not cost-effective.',
      'Multi-AZ is not cross-Region DR; it only tolerates an AZ failure.',
      'AMIs and snapshots are Region-scoped resources and must be copied to the DR Region.',
      'AWS MGN is a migration tool, not a continuous DR tool.',
    ],
  },
  {
    slug: 'backup-replication',
    domain: 'resilient',
    title: 'Backup and Replication: AWS Backup, RDS, Aurora, DynamoDB, S3, EBS, EFS',
    summary:
      'How to back up and replicate data for each service: centralized AWS Backup, PITR, cross-Region read replicas, Aurora Global Database, DynamoDB global tables, S3 replication, EBS snapshots.',
    services: [
      'AWS Backup',
      'Amazon RDS',
      'Amazon Aurora',
      'Amazon DynamoDB',
      'Amazon S3',
      'Amazon EBS',
      'Amazon EFS',
      'Amazon Data Lifecycle Manager',
    ],
    minutes: 12,
    body: `## AWS Backup

- A **centralized, policy-based** backup service for EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, DocumentDB, Neptune...
- **Backup plan**: schedule (cron), backup window, lifecycle (move to cold storage, expire), **copy rules** to another Region/account. Assign resources by **tag** or resource ID.
- **Backup vault**: where recovery points are stored, encrypted with KMS.
- **Cross-account backup**: combine with AWS Organizations and copy backups to a separate account to protect against deletion if the production account is compromised.
- **AWS Backup Vault Lock**: **WORM** mode, prevents deleting/changing backup lifecycle, even by the root user.
  - **Governance mode**: users with special permissions can still remove the lock.
  - **Compliance mode**: after the grace period, **no one** can remove it, not even AWS.
- **Logically air-gapped vault**: an isolated vault that can be shared to another account for recovery during ransomware.
- **Backup Audit Manager** to check compliance with backup policies.

## Amazon RDS

| | Automated backups | Manual snapshot |
|---|---|---|
| Trigger | Automatic daily + transaction logs | Created by the user |
| Retention | 0-35 days (0 = disabled) | Kept until deleted |
| PITR | Yes, restore to any second within retention (typically up to about the last 5 minutes) | No |
| When the DB is deleted | Deleted (unless retained) | Remains |

- A restore always creates a **new DB instance** with a new endpoint.
- Keeping backups longer than 35 days → manual snapshots or AWS Backup.
- **Read replica**: asynchronous replication, can be **cross-Region** (for DR and reads close to users). Promote the replica to a standalone DB when the primary Region fails (a manual action, RPO equals the replication lag).

## Amazon Aurora

- Continuous backup to S3, PITR within a 1-35 day retention; **Backtrack** (Aurora MySQL) rewinds the DB in place without a restore.
- **Aurora Replicas**: up to 15 in the same Region, automatic failover.
- **Aurora Global Database**:
  - One primary Region (read/write), secondary Regions are read-only, replication at the storage layer, latency typically **under 1 second**.
  - DR: RPO about 1 second, RTO under 1 minute; supports **switchover** (planned, no data loss) and **failover**.
  - **Write forwarding**: secondaries forward write statements to the primary.
  - Low-latency reads for global users.

## Amazon DynamoDB

- **On-demand backup**: full backup with no performance impact, kept until deleted.
- **PITR**: restore to any second within the last **35 days** at most; a restore creates a **new table**.
- **Global tables**: multi-Region, **multi-active** (write in any Region), replication typically under 1 second, last-writer-wins conflict resolution. Requires DynamoDB Streams (enabled automatically).
- Export to S3 uses PITR for analytics without consuming read capacity.

## Amazon S3

- **Versioning**: keeps all object versions, protects against accidental deletes/overwrites. Combine with **MFA Delete** and **Object Lock** (WORM).
- **Replication** (versioning must be enabled on **both the source and destination buckets**, replication is asynchronous):
  - **CRR (Cross-Region Replication)**: compliance, DR, reducing latency for users in another Region.
  - **SRR (Same-Region Replication)**: aggregating logs, syncing prod and test accounts.
  - Only **new** objects after enabling are replicated; existing objects use **S3 Batch Replication**.
  - Delete markers can be replicated (optional); deletes by version ID are **not** replicated.
  - No chained replication (A → B → C does not happen automatically).
- **S3 Replication Time Control (RTC)**: an SLA to replicate **99.99% of objects within 15 minutes**, with metrics and notifications. Keywords "require replication within a predictable time / compliance".

## Amazon EBS

- **Snapshot**: incremental, stored in S3 (managed by AWS), can be copied cross-Region/cross-account, and used to create a volume in any AZ in the Region.
- **Amazon Data Lifecycle Manager (DLM)**: automatically creates, retains, and deletes EBS snapshots and AMIs by schedule and tag; supports cross-Region copy.
- **Fast Snapshot Restore (FSR)**: volumes created from a snapshot get full performance immediately, without the "first touch" latency when reading blocks for the first time. Charged hourly per AZ.
- **Recycle Bin**: retains deleted EBS snapshots and AMIs for the retention period so you can recover from accidental deletion.
- **EBS Snapshot Archive**: a cheaper storage tier for rarely used snapshots (90-day minimum, restore takes 24-72 hours).

## Amazon EFS

- **EFS Replication**: replicate the file system to another Region (or the same Region), RPO measured in minutes (typically a 15-minute target). The destination file system is read-only until failover.
- Back up EFS with **AWS Backup** (enabled automatically by default when created through the console).

## Quick selection summary

| Requirement | Answer |
|---|---|
| Centralized backup management across multiple services and accounts | AWS Backup |
| Backups that cannot be deleted, even by root | Backup Vault Lock compliance mode |
| Global database, RPO seconds, RTO minutes | Aurora Global Database |
| Writes in multiple Regions at once | DynamoDB global tables |
| S3 replication with a 15-minute SLA | S3 Replication Time Control |
| Recover accidentally deleted snapshots | Recycle Bin |
`,
    keywords: [
      { trigger: 'centrally manage backups for multiple services and accounts', answer: 'AWS Backup with backup plan + Organizations' },
      { trigger: 'backups that cannot be deleted, even by the root user', answer: 'AWS Backup Vault Lock (compliance mode)' },
      { trigger: 'restore a database to the moment right before data was accidentally deleted', answer: 'Point-in-time recovery (PITR)' },
      { trigger: 'global relational database, RPO 1 second, RTO under 1 minute', answer: 'Aurora Global Database' },
      { trigger: 'write data in multiple Regions, multi-active', answer: 'DynamoDB global tables' },
      { trigger: 'replicate S3 objects to another Region within 15 minutes with an SLA', answer: 'S3 CRR with Replication Time Control' },
      { trigger: 'replicate S3 objects that existed before replication was enabled', answer: 'S3 Batch Replication' },
      { trigger: 'volume from a snapshot needs full performance immediately', answer: 'EBS Fast Snapshot Restore' },
      { trigger: 'automatically create and delete EBS snapshots on a schedule', answer: 'Amazon Data Lifecycle Manager' },
      { trigger: 'recover an accidentally deleted EBS snapshot or AMI', answer: 'Recycle Bin' },
    ],
    traps: [
      'RDS automated backups last at most 35 days; for longer, use manual snapshots or AWS Backup.',
      'Restoring RDS/DynamoDB always creates a new instance/table, never overwrites in place.',
      'S3 replication requires versioning on both buckets and does not automatically replicate existing objects.',
      'Aurora Global Database secondaries are read-only (except write forwarding); true multi-active writes is DynamoDB global tables.',
      'Vault Lock governance mode can still be removed by a user with permissions; only compliance mode is immutable.',
      'A cross-Region read replica does not fail over automatically; you must promote it.',
    ],
  },
  {
    slug: 'management-iac',
    domain: 'resilient',
    title: 'Infrastructure as Code and operations: CloudFormation, Beanstalk, Systems Manager, CloudWatch',
    summary:
      'Build repeatable infrastructure with CloudFormation/CDK/SAM, deploy safely with Elastic Beanstalk, operate fleets with Systems Manager, and observe systems with CloudWatch, X-Ray, and the Health Dashboard.',
    services: [
      'AWS CloudFormation',
      'AWS CDK',
      'AWS SAM',
      'AWS Elastic Beanstalk',
      'AWS Systems Manager',
      'Amazon CloudWatch',
      'AWS X-Ray',
      'AWS Health Dashboard',
      'AWS Service Catalog',
    ],
    minutes: 12,
    body: `## AWS CloudFormation

You declare infrastructure in a **template** (JSON/YAML) → CloudFormation creates a **stack** in dependency order and **rolls back** on failure. Reuse the template to build an identical environment in another Region (lower RTO for DR).

### Main template sections

- **Parameters**, **Mappings** (for example AMI per Region), **Conditions**, **Resources** (required), **Outputs**.
- **Cross-stack reference**: Outputs with **Export**, another stack uses **Fn::ImportValue**.
- **Dynamic references** fetch values from Parameter Store/Secrets Manager at deploy time, so secrets stay out of the template.

### Safe changes

- **Change set**: preview which resources will be added, modified, or **replaced** before executing an update. Question says "review changes before applying to production" → change set.
- **Drift detection**: detects resources modified manually outside CloudFormation compared with the template.
- **Stack policy** blocks updates to critical resources; **termination protection** blocks stack deletion.

### DeletionPolicy

| Value | When the stack or resource is deleted |
|---|---|
| Delete | Deletes the resource (default for most resources) |
| Retain | Keeps the resource, detached from the stack |
| Snapshot | Takes a final snapshot then deletes; for EBS volumes, RDS, ElastiCache, Redshift... |

**UpdateReplacePolicy** applies the same way when an update replaces a resource.

### Nested stacks and StackSets

- **Nested stacks**: an AWS::CloudFormation::Stack resource calls a child template, reusing common components inside **one** parent stack.
- **StackSets**: deploy **the same template to many accounts and many Regions** in one operation. With **service-managed permissions** (AWS Organizations), turn on **automatic deployment** so new accounts added to an OU are deployed automatically.

### Bootstrapping EC2

- **cfn-init** reads AWS::CloudFormation::Init metadata to install packages, create files, and start services.
- **cfn-signal** + **CreationPolicy**: the stack reaches CREATE_COMPLETE only when the instance signals success; on timeout it rolls back.

### AWS CDK and AWS SAM

- **CDK**: write infrastructure in TypeScript, Python, Java...; it **synthesizes** a CloudFormation template.
- **SAM**: shorthand syntax for serverless that expands into CloudFormation; gradual Lambda deployments (canary/linear) through CodeDeploy.

## Elastic Beanstalk: deployment policies

| Policy | Capacity during deploy | Downtime | Rollback | Extra cost |
|---|---|---|---|---|
| All at once | Fully lost during deploy | Yes | Redeploy old version | None |
| Rolling | Reduced batch by batch | No | Redeploy | None |
| Rolling with additional batch | **Full** capacity kept | No | Redeploy | One temporary batch |
| Immutable | Full, new version runs on **new instances** in a temporary ASG | No | Fast: just terminate new instances | Double during deploy |
| Traffic splitting | Sends a % of traffic to new instances (canary) | No | Fast | New instances |

**Blue/green**: create a second environment, then **swap environment URLs** (CNAME) or shift gradually with Route 53 weighted routing.

## AWS Systems Manager (SSM)

Manages **managed nodes** (EC2 and on-premises servers via **hybrid activations**) that run the SSM Agent with an appropriate IAM role.

- **Session Manager**: shell without SSH (see the VPC lesson).
- **Run Command**: run commands on hundreds of nodes by tag, with rate control, no SSH needed.
- **Patch Manager**: patch baselines, patch groups, runs in a **Maintenance Window**, reports compliance.
- **Automation**: multi-step runbooks (build an AMI, restart instances); the remediation mechanism for AWS Config.
- **State Manager**: associations keep nodes in a desired state.
- **OpsCenter**: aggregates OpsItems from CloudWatch alarms and EventBridge for central handling. **Parameter Store**: see the Secrets lesson.

## Amazon CloudWatch

- **Metrics**: EC2 basic monitoring 5 minutes, detailed monitoring 1 minute. **Memory and disk usage are not available by default** → install the **CloudWatch agent**. Custom metrics via PutMetricData, high-resolution down to 1 second.
- **Alarms** → actions: SNS, Auto Scaling, **EC2 actions** (stop, terminate, reboot, **recover**), SSM OpsItem. **Composite alarms** reduce alarm noise.
- **Logs**: log groups, retention; **metric filters** turn log patterns into metrics; **subscription filters** stream in real time to Lambda, Kinesis, Firehose; export to S3 is not real time. **Logs Insights** queries logs.
- **Dashboards** across Regions and accounts; **cross-account observability**: one monitoring account views the metrics, logs, and traces of source accounts.

## X-Ray, Health Dashboard, and Service Catalog

- **AWS X-Ray**: distributed tracing, **service map**, finds the service causing latency or errors in microservices (active tracing for Lambda, API Gateway).
- **AWS Health Dashboard**: AWS events **affecting your account** (maintenance, EC2 retirement); they flow into EventBridge for automated handling.
- **AWS Service Catalog**: admins create a **portfolio** of approved products (CloudFormation templates); users self-launch through a **launch constraint** (the product IAM role) without needing broad permissions.
- **Trusted Advisor** and **Compute Optimizer**: see the cost management lesson.

## Requirement → tool

| Requirement | Tool |
|---|---|
| Preview stack changes | CloudFormation change set |
| Detect manual changes outside IaC | Drift detection |
| Same baseline for every account/Region | CloudFormation StackSets |
| Keep a DB snapshot when deleting the stack | DeletionPolicy: Snapshot |
| Patch a fleet on a schedule | SSM Patch Manager + Maintenance Window |
| Alert on the number of errors in logs | Metric filter + alarm |
| Find the bottleneck between microservices | AWS X-Ray |
| Developers self-provision standardized resources | AWS Service Catalog |
`,
    keywords: [
      { trigger: 'preview changes before updating a production stack', answer: 'CloudFormation change set' },
      { trigger: 'resources modified manually and differ from the template', answer: 'CloudFormation drift detection' },
      { trigger: 'deploy the same template to every account and Region, including new accounts', answer: 'CloudFormation StackSets (service-managed, automatic deployment)' },
      { trigger: 'keep a copy of the database when deleting the stack', answer: 'DeletionPolicy: Snapshot (or Retain)' },
      { trigger: 'stack completes only after software on EC2 is installed', answer: 'CreationPolicy + cfn-signal' },
      { trigger: 'Beanstalk keeps full capacity, fast rollback, new version on new instances', answer: 'Immutable deployment' },
      { trigger: 'patch hundreds of EC2 and on-premises servers on a schedule', answer: 'SSM Patch Manager + Maintenance Window' },
      { trigger: 'monitor EC2 memory/disk', answer: 'CloudWatch agent' },
      { trigger: 'find the service causing latency in a microservice chain', answer: 'AWS X-Ray' },
      { trigger: 'users may only launch approved products', answer: 'AWS Service Catalog' },
    ],
    traps: [
      'EC2 does not send memory metrics by default; detailed monitoring only increases frequency to 1 minute and adds no RAM metric.',
      'Nested stacks reuse templates within one stack; multi-account/multi-Region deployment is StackSets.',
      'For most resources, deleting the stack also deletes the resource; to keep data, explicitly set DeletionPolicy to Retain or Snapshot.',
      'Beanstalk All at once causes downtime; Rolling reduces capacity during the deploy.',
      'CloudTrail records who called an API, CloudWatch measures metrics/logs, X-Ray traces requests; do not mix up the three.',
      'Exporting CloudWatch Logs to S3 is not real time; for real time use a subscription filter.',
    ],
  },
  {
    slug: 'application-integration',
    domain: 'resilient',
    title: 'Advanced application integration: EventBridge, Step Functions, AppFlow, AppSync, MQ, SES, IoT Core',
    summary:
      'A deep dive into EventBridge (cross-account, archive/replay, Scheduler, Pipes, API destinations), Step Functions patterns (Retry/Catch, task tokens, Distributed Map, saga), and specialized integration services.',
    services: [
      'Amazon EventBridge',
      'AWS Step Functions',
      'Amazon AppFlow',
      'AWS AppSync',
      'Amazon MQ',
      'Amazon SES',
      'AWS IoT Core',
    ],
    minutes: 12,
    body: `## Amazon EventBridge in depth

### Event buses

- **Default bus**: events from AWS services (EC2 state change, AWS Health, CodePipeline...).
- **Custom bus**: your application events (PutEvents).
- **Partner event source**: SaaS (Zendesk, Datadog...) pushes events straight into your account, no webhook/poller.
- **Cross-account**: a rule in the source account targets the event bus of a central account; the target bus needs a **resource-based policy** allowing the source account (or the whole organization) to send to it. A target can also be a bus in another Region.

### Rules and event patterns

- Patterns filter on source, detail-type, and detail (prefix, suffix, anything-but, numeric...).
- Each rule has at most 5 targets; an **input transformer** reshapes the payload before sending.
- Each target has a **retry policy** (by default retries for up to 24 hours) and a **DLQ** (SQS) for events that could not be delivered.

### Features that often appear on the exam

- **Schema registry**: stores event structures; **schema discovery** infers schemas and generates code bindings.
- **Archive and replay**: stores events (with retention, filtered by pattern) and replays a chosen time window to reprocess after fixing a bug or recovering a consumer.
- **EventBridge Scheduler**: one-time, rate, and cron schedules with time zones, flexible time windows, up to millions of schedules, directly calls hundreds of AWS APIs. Replaces cron on EC2.
- **EventBridge Pipes**: point-to-point **source → filter → enrichment → target**. Sources: SQS, Kinesis, DynamoDB Streams, MSK/Kafka, Amazon MQ. Enrichment: Lambda, Step Functions Express, API Gateway, API destination. Reduces "glue" Lambda code.
- **API destinations**: call external HTTP endpoints (SaaS, webhooks) as targets, with a **connection** that manages authentication (Basic, API key, OAuth) and an invocation rate limit.
- **Global endpoints**: fail over event ingestion to a second Region when the primary Region has an issue.

## Step Functions: patterns

Recap: **Standard** (up to 1 year, exactly-once, execution history) for long workflows; **Express** (up to 5 minutes, priced per execution) for high volume. Express does **not** support the .sync and callback patterns.

### Error handling

- **Retry**: by ErrorEquals (for example States.Timeout, States.TaskFailed, custom errors), IntervalSeconds, MaxAttempts, **BackoffRate** (exponential backoff), optionally with jitter.
- **Catch**: when retries are exhausted, transition to a fallback state; ResultPath keeps the original input together with error information.

### Integration patterns

| Pattern | Suffix | Behavior |
|---|---|---|
| Request Response | (default) | Calls the API and moves on immediately |
| Run a Job | .sync | Waits for the job (ECS task, Glue, Batch) to complete |
| Wait for Callback | .waitForTaskToken | Pauses until an external system calls SendTaskSuccess/SendTaskFailure with the task token; supports HeartbeatSeconds |

### Map and saga

- **Map (inline)**: iterates in parallel over an array in the input, maximum concurrency 40.
- **Distributed Map**: runs **up to 10,000 parallel child executions**, reading items directly from S3 (CSV, JSON, object listings) → processes millions of files.
- **Saga**: each step (reserve, charge, ship) has a Catch leading to a **compensating step** (release reservation, refund) that runs in reverse order, instead of a distributed transaction.

## Specialized integration services

### Amazon AppFlow

- **Bidirectional** data flows between SaaS (Salesforce, SAP, ServiceNow, Zendesk, Slack, Google Analytics...) and AWS (S3, Redshift...).
- Runs on demand, on a schedule, or on events; filter, map, mask fields, validate; KMS encryption, PrivateLink with some SaaS. **No code** to call SaaS APIs.

### AWS AppSync

- Managed GraphQL: **resolvers** to DynamoDB, Lambda, Aurora, OpenSearch, HTTP; real-time **subscriptions** over WebSocket; server-side caching.
- Auth: API key, IAM, Cognito user pool, OIDC, Lambda (modes can be combined).

### Amazon MQ

- Managed **ActiveMQ/RabbitMQ** running on broker instances: keeps JMS, AMQP, MQTT, STOMP, OpenWire for **lift-and-shift**.
- Not serverless like SQS/SNS: you choose an instance size, and throughput is limited by the broker. Often migrate to MQ first, refactor to SQS/SNS later.

### Amazon SES

- Sends email and **receives email** (receipt rules → S3, SNS, Lambda).
- New accounts start in the **sandbox** (send only to verified addresses) → request production access. Verify domains with DKIM/SPF; a **configuration set** publishes bounce and complaint events to SNS, Firehose, CloudWatch, EventBridge.

### AWS IoT Core

- Devices connect via **MQTT** (also HTTPS, MQTT over WebSocket), authenticated with **X.509** certificates.
- **Device Shadow** stores desired/reported state while a device is offline.
- **Rules engine**: SQL-like statements filter messages by topic and route them to Lambda, DynamoDB, S3, Kinesis, Firehose, SQS, SNS... with no intermediate server.

## Which integration service

| Scenario | Service |
|---|---|
| Job queue, absorb spikes | SQS |
| Fan-out push to many subscribers | SNS |
| Content-based event routing, AWS/SaaS events, cross-account | EventBridge |
| Connect a source to a target with filter/enrich, little code | EventBridge Pipes |
| Invoke tasks on a schedule, millions of schedules | EventBridge Scheduler |
| Multi-step workflow, retries, waiting for callbacks | Step Functions |
| Sync SaaS data ↔ S3/Redshift without code | AppFlow |
| GraphQL, real time for web/mobile | AppSync |
| Keep an existing JMS/AMQP broker when migrating | Amazon MQ |
| Send/receive email | SES |
| Thousands of MQTT devices | IoT Core |
`,
    keywords: [
      { trigger: 'receive events from SaaS (Zendesk, Datadog) without writing a webhook', answer: 'EventBridge partner event source' },
      { trigger: 'collect events from many accounts into a central account', answer: 'EventBridge cross-account event bus + resource-based policy' },
      { trigger: 'reprocess past events after fixing a bug', answer: 'EventBridge archive and replay' },
      { trigger: 'SQS/Kinesis → filter → enrich → target without glue Lambda', answer: 'EventBridge Pipes' },
      { trigger: 'workflow pauses until an external system responds', answer: 'Step Functions .waitForTaskToken' },
      { trigger: 'process millions of S3 objects in parallel in a workflow', answer: 'Step Functions Distributed Map' },
      { trigger: 'undo completed steps when a later step fails', answer: 'Saga pattern with Catch + compensating steps' },
      { trigger: 'sync Salesforce data into S3 without writing code', answer: 'Amazon AppFlow' },
      { trigger: 'sensors send data over MQTT, route it to DynamoDB', answer: 'AWS IoT Core rules engine' },
      { trigger: 'send transactional email, track bounces/complaints', answer: 'Amazon SES with a configuration set' },
    ],
    traps: [
      'Express workflows do not support .sync and .waitForTaskToken; long callback waits require Standard.',
      'A cross-account target bus needs a resource-based policy; creating a rule in the source account alone is not enough.',
      'SNS has no archive and replay; to replay events use EventBridge archive or Kinesis.',
      'AppFlow is for SaaS ↔ AWS; moving files from on-premises uses DataSync or Transfer Family.',
      'Amazon MQ does not scale automatically like SQS/SNS; choose it only to keep an existing broker protocol.',
      'A new SES account is in the sandbox and can send only to verified addresses.',
    ],
  },
];
