import type { Lesson } from '@/content/types';

export const resilientLessons: Lesson[] = [
  {
    slug: 'high-availability-multi-az',
    domain: 'resilient',
    title: 'High Availability và Multi-AZ',
    summary:
      'Nền tảng của kiến trúc chịu lỗi: Region, AZ, loại bỏ single point of failure, Multi-AZ cho EC2/RDS/Aurora/EFS và thiết kế ứng dụng stateless để scale ngang.',
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
    body: `## Hạ tầng toàn cầu của AWS

- **Region**: một khu vực địa lý (ví dụ ap-southeast-1 Singapore), gồm nhiều AZ. Dữ liệu không tự rời Region trừ khi bạn cấu hình replication. Chọn Region dựa trên: compliance/data residency, độ trễ tới người dùng, service có sẵn hay không, và giá.
- **Availability Zone (AZ)**: một hoặc nhiều data center tách biệt về điện, mạng, làm mát, nối với nhau bằng mạng độ trễ thấp. Mỗi Region có tối thiểu 3 AZ. Đây là đơn vị cơ bản để thiết kế high availability (HA).
- **Local Zones**: mở rộng Region tới gần thành phố lớn, cho workload cần độ trễ một chữ số mili-giây (render, game, media).
- **Wavelength**: hạ tầng AWS đặt trong mạng 5G của nhà mạng, dùng cho ứng dụng mobile/edge siêu thấp độ trễ.
- **Outposts**: rack phần cứng AWS đặt tại data center của bạn, cho workload phải ở on-premises (độ trễ tới hệ thống cũ, data residency) nhưng muốn dùng cùng API AWS.

## Single point of failure (SPOF)

Đề thi hay mô tả "một EC2 instance chạy web + database" rồi hỏi cách tăng availability. Cách nghĩ:

- 1 instance trong 1 AZ là SPOF. Giải pháp: nhiều instance trong **ít nhất 2 AZ**, đứng sau **Elastic Load Balancing**, quản lý bởi **Auto Scaling group**.
- Database tự quản trên EC2 là SPOF. Giải pháp: chuyển sang **RDS Multi-AZ** hoặc **Aurora**.
- NAT Gateway là tài nguyên theo AZ: để HA, đặt **một NAT Gateway mỗi AZ** và route table của từng AZ trỏ vào NAT cùng AZ.
- Ổ đĩa EBS chỉ nằm trong 1 AZ. Cần file system dùng chung nhiều AZ thì dùng **EFS** (Regional, dữ liệu lưu dư thừa nhiều AZ).

## Multi-AZ cho từng dịch vụ

| Dịch vụ | Cơ chế HA | Ghi chú thi |
|---|---|---|
| EC2 | ASG trải nhiều AZ + ELB | Instance không tự "Multi-AZ" |
| RDS Multi-AZ instance | 1 primary + 1 standby đồng bộ ở AZ khác | Standby **không đọc được**, failover tự động qua DNS, thường 1–2 phút |
| RDS Multi-AZ DB cluster | 1 writer + 2 reader standby ở 3 AZ | Standby **đọc được**, failover nhanh hơn (thường dưới 35 giây), cho MySQL và PostgreSQL |
| Aurora | Storage 6 bản sao trên 3 AZ, tối đa 15 Aurora Replicas | Replica vừa scale đọc vừa là failover target |
| EFS Standard | Dữ liệu lưu nhiều AZ, mount target mỗi AZ | EFS One Zone rẻ hơn nhưng không chịu lỗi AZ |
| DynamoDB, S3, SQS, Lambda | Regional, tự Multi-AZ | Không cần cấu hình thêm |
| ElastiCache Redis/Valkey | Replication group Multi-AZ + automatic failover | Memcached không có replication |

### RDS: Multi-AZ khác Read Replica

- **Multi-AZ** = high availability, replication **đồng bộ**, một endpoint, tự động failover.
- **Read Replica** = scale đọc, replication **bất đồng bộ**, endpoint riêng, có thể cross-Region, có thể promote thủ công thành DB độc lập.
- Câu hỏi nói "giảm tải đọc cho báo cáo" → Read Replica. Câu hỏi nói "tự động failover khi AZ lỗi" → Multi-AZ.

## Scale dọc và scale ngang

- **Vertical scaling (scale up)**: đổi instance type lớn hơn. Đơn giản nhưng có giới hạn và thường cần downtime; vẫn là SPOF.
- **Horizontal scaling (scale out)**: thêm instance. Đi kèm ELB + ASG, chịu lỗi tốt, là đáp án mặc định cho "elastic", "unpredictable traffic".

## Ứng dụng stateless và session

Để scale ngang và để ASG có thể terminate instance bất kỳ, ứng dụng phải **stateless**:

- Lưu **session** ra ngoài instance: **ElastiCache** (Redis/Valkey, độ trễ sub-millisecond) hoặc **DynamoDB** (serverless, có TTL để tự xoá session hết hạn).
- File người dùng upload lưu vào **S3** hoặc **EFS**, không lưu trên EBS của từng instance.
- Sticky session trên ALB là giải pháp tạm: làm phân bổ tải lệch và mất session khi instance chết. Đề hỏi giải pháp bền vững thì chọn lưu session ra ngoài.

## Elastic IP

- Địa chỉ IPv4 public tĩnh, gắn được vào instance hoặc ENI, có thể remap sang instance khác khi lỗi.
- Đây là cách failover thô sơ; kiến trúc tốt hơn là đặt ELB phía trước. Elastic IP bị tính phí (AWS tính phí cho mọi public IPv4).
- Nếu cần IP tĩnh cho load balancer → dùng **NLB** (mỗi AZ một Elastic IP) hoặc **Global Accelerator** (2 anycast IP tĩnh).

## Tóm tắt nhanh

1. Luôn trải tài nguyên trên ít nhất 2 AZ.
2. Database: RDS Multi-AZ hoặc Aurora; cần đọc nhiều thì thêm replica.
3. Ứng dụng stateless, session ở ElastiCache/DynamoDB.
4. Scale ngang với ELB + ASG thay vì nâng cấp một máy to.
`,
    keywords: [
      { trigger: 'automatic failover database khi một AZ gặp sự cố', answer: 'RDS Multi-AZ' },
      { trigger: 'standby có thể phục vụ đọc, failover dưới 35 giây', answer: 'RDS Multi-AZ DB cluster' },
      { trigger: 'giảm tải truy vấn đọc / reporting', answer: 'RDS Read Replica hoặc Aurora Replica' },
      { trigger: 'lưu session người dùng để app stateless', answer: 'ElastiCache hoặc DynamoDB' },
      { trigger: 'file system dùng chung nhiều EC2 ở nhiều AZ', answer: 'Amazon EFS' },
      { trigger: 'workload phải chạy on-premises nhưng dùng API AWS', answer: 'AWS Outposts' },
      { trigger: 'ứng dụng 5G, mobile edge độ trễ cực thấp', answer: 'AWS Wavelength' },
      { trigger: 'độ trễ mili-giây cho người dùng ở một thành phố cụ thể', answer: 'AWS Local Zones' },
    ],
    traps: [
      'Standby của RDS Multi-AZ instance KHÔNG phục vụ đọc; muốn đọc thì dùng Read Replica hoặc Multi-AZ DB cluster.',
      'Read Replica dùng replication bất đồng bộ, không phải giải pháp HA tự động failover.',
      'Một NAT Gateway dùng chung cho nhiều AZ là single point of failure; cần một NAT Gateway mỗi AZ.',
      'EBS volume chỉ nằm trong một AZ; không attach được sang AZ khác (phải qua snapshot).',
      'Sticky session không làm app stateless; mất instance là mất session.',
      'Scale up (instance lớn hơn) không loại bỏ single point of failure.',
    ],
  },
  {
    slug: 'elastic-load-balancing',
    domain: 'resilient',
    title: 'Elastic Load Balancing: ALB, NLB, GWLB',
    summary:
      'Chọn đúng loại load balancer theo layer và giao thức, hiểu listener, target group, health check, cross-zone, sticky session, SSL offload và IP tĩnh.',
    services: [
      'Elastic Load Balancing',
      'Application Load Balancer',
      'Network Load Balancer',
      'Gateway Load Balancer',
      'AWS Certificate Manager',
      'AWS Lambda',
    ],
    minutes: 11,
    body: `## Các loại load balancer

| Tiêu chí | ALB | NLB | GWLB | CLB |
|---|---|---|---|---|
| Layer | 7 (HTTP/HTTPS, gRPC, WebSocket) | 4 (TCP, UDP, TLS) | 3 (IP packet, GENEVE port 6081) | 4 và 7 (legacy) |
| Routing | Path, host, header, query string, method, source IP | Theo port/protocol | Chuyển traffic qua appliance | Cơ bản |
| Target | Instance, IP, Lambda, (ALB không làm target của ALB) | Instance, IP, ALB | Instance, IP của appliance | Instance |
| IP tĩnh | Không (DNS name) | Có, 1 IP tĩnh/Elastic IP mỗi AZ | Không | Không |
| Hiệu năng | Tốt | Hàng triệu request/giây, độ trễ cực thấp | | |
| Use case | Microservices, container, web | Game, IoT, TCP/UDP, cần IP tĩnh, PrivateLink | Firewall, IDS/IPS bên thứ ba | Không dùng cho thiết kế mới |

Quy tắc chọn nhanh:
- HTTP/HTTPS, cần routing theo URL hoặc host → **ALB**.
- TCP/UDP, cần IP tĩnh, cần hiệu năng cực cao, hoặc làm endpoint service cho **PrivateLink** → **NLB**.
- Cần chèn **virtual appliance** (firewall bên thứ ba) vào đường đi traffic một cách trong suốt → **GWLB**.

## Listener, rule và target group

- **Listener**: lắng nghe trên protocol + port (ví dụ HTTPS:443).
- **Rule** (ALB): điều kiện (path /api/*, host api.example.com, header...) → action (forward, redirect, fixed-response, authenticate qua Cognito/OIDC).
- **Target group**: nhóm target cùng health check. Một ALB có thể route tới nhiều target group → một ALB phục vụ nhiều microservice.
- **Weighted target groups**: chia % traffic giữa hai target group, dùng cho blue/green hoặc canary.
- Redirect HTTP → HTTPS làm ngay trên listener của ALB.

## Health check

- ELB chỉ gửi traffic tới target **healthy**. Cấu hình path (ví dụ /health), interval, healthy/unhealthy threshold.
- Khi ASG dùng **ELB health check**, instance bị ELB đánh dấu unhealthy sẽ bị ASG thay thế (xem bài Auto Scaling).

## Cross-zone load balancing

- Bật: mỗi node của LB chia đều traffic cho **tất cả** target ở mọi AZ. Tắt: mỗi node chỉ chia cho target trong AZ của nó.
- **ALB**: bật mặc định, không tính phí data inter-AZ.
- **NLB và GWLB**: tắt mặc định; bật thì có phí data transfer giữa các AZ.
- Đề hỏi "số instance mỗi AZ không đều, tải bị lệch" → bật cross-zone load balancing.

## Sticky sessions (session affinity)

- ALB dùng cookie (duration-based cookie do LB tạo, hoặc application-based cookie) để giữ client về cùng target.
- Nhược điểm: tải không đều, mất session khi target chết. Giải pháp tốt hơn là lưu session vào ElastiCache/DynamoDB.

## Deregistration delay (connection draining)

- Khi target bị gỡ (scale in, deploy), LB ngừng gửi request mới nhưng cho các request đang chạy hoàn tất trong khoảng thời gian **deregistration delay** (mặc định 300 giây, có thể đặt 0–3600 giây).
- Trên CLB tên gọi là **connection draining**.
- Request ngắn → giảm giá trị để scale in nhanh hơn.

## SSL/TLS offload, ACM và SNI

- Gắn certificate từ **AWS Certificate Manager (ACM)** lên listener HTTPS (ALB) hoặc TLS (NLB) → LB giải mã, giảm tải CPU cho backend. ACM tự động gia hạn certificate public.
- **SNI (Server Name Indication)**: một listener gắn nhiều certificate, LB chọn certificate theo hostname client yêu cầu → host nhiều domain trên **một** ALB/NLB. CLB không hỗ trợ SNI.
- Cần mã hoá end-to-end tới tận instance: dùng HTTPS từ LB tới target, hoặc NLB TCP passthrough (không terminate TLS).

## IP tĩnh và whitelist

- ALB không có IP tĩnh. Khách hàng yêu cầu whitelist IP cố định:
  - **NLB** với Elastic IP mỗi AZ, có thể đặt ALB làm target của NLB để vừa có IP tĩnh vừa có routing layer 7.
  - Hoặc **Global Accelerator** (2 anycast IP tĩnh) phía trước ALB.

## ALB với Lambda

- ALB có thể dùng **Lambda function làm target**: request HTTP được chuyển thành event JSON. Phù hợp khi muốn kết hợp route /api tới Lambda và route khác tới EC2 trên cùng một ALB.
- Nếu cần tính năng API management (usage plan, API key, throttling theo client) thì API Gateway phù hợp hơn.

## Bảo mật

- ALB và NLB đều hỗ trợ **security group**. Thường cấu hình security group của EC2 chỉ cho phép traffic từ security group của LB.
- ALB tích hợp **AWS WAF** để chặn SQL injection, XSS, rate-based rule. NLB không gắn WAF trực tiếp.
- Header **X-Forwarded-For** trên ALB chứa IP thật của client. NLB giữ nguyên source IP của client (với target type instance).
`,
    keywords: [
      { trigger: 'routing theo path /api hoặc theo hostname', answer: 'Application Load Balancer' },
      { trigger: 'TCP/UDP, hàng triệu request/giây, độ trễ cực thấp', answer: 'Network Load Balancer' },
      { trigger: 'đối tác cần whitelist IP tĩnh của load balancer', answer: 'NLB với Elastic IP hoặc Global Accelerator' },
      { trigger: 'chèn firewall/IDS bên thứ ba trong suốt vào luồng traffic', answer: 'Gateway Load Balancer' },
      { trigger: 'nhiều domain HTTPS trên một load balancer', answer: 'SNI với nhiều certificate ACM' },
      { trigger: 'cho request đang xử lý hoàn tất trước khi gỡ instance', answer: 'Deregistration delay (connection draining)' },
      { trigger: 'traffic phân bổ lệch do số instance mỗi AZ khác nhau', answer: 'Bật cross-zone load balancing' },
      { trigger: 'chặn SQL injection trước ALB', answer: 'AWS WAF gắn vào ALB' },
    ],
    traps: [
      'ALB không có IP tĩnh; đừng chọn "gắn Elastic IP vào ALB".',
      'CLB không hỗ trợ SNI; host nhiều certificate thì dùng ALB hoặc NLB.',
      'Cross-zone load balancing trên NLB tắt mặc định và tính phí inter-AZ, khác với ALB.',
      'Sticky session không phải giải pháp HA cho session; lưu session ra ElastiCache/DynamoDB.',
      'WAF gắn được vào ALB, API Gateway, CloudFront, không gắn trực tiếp vào NLB.',
    ],
  },
  {
    slug: 'auto-scaling',
    domain: 'resilient',
    title: 'EC2 Auto Scaling',
    summary:
      'Auto Scaling group tự thay thế instance lỗi và co giãn theo tải. Nắm các loại scaling policy, health check, lifecycle hook, warm pool và cách scale theo SQS backlog.',
    services: ['Amazon EC2 Auto Scaling', 'Amazon CloudWatch', 'Amazon SQS', 'Elastic Load Balancing'],
    minutes: 11,
    body: `## Thành phần của Auto Scaling group (ASG)

- **Launch template**: AMI, instance type, key pair, security group, user data, IAM instance profile. Launch template hỗ trợ versioning, nhiều instance type, Spot + On-Demand; **launch configuration là legacy**, không dùng cho thiết kế mới.
- **Min / Desired / Max capacity**: ASG luôn giữ số instance bằng desired, nằm trong khoảng [min, max].
- **Subnets ở nhiều AZ**: ASG cân bằng instance giữa các AZ; khi một AZ lỗi, ASG launch instance thay thế ở AZ còn lại.
- **Mixed instances policy**: kết hợp On-Demand base + Spot, nhiều instance type để tăng khả năng có Spot capacity.

## Các loại scaling policy

| Loại | Cách hoạt động | Khi nào chọn |
|---|---|---|
| Target tracking | Giữ một metric quanh giá trị mục tiêu (ví dụ CPU 50%, RequestCountPerTarget 1000) | Mặc định, đơn giản nhất, ít vận hành |
| Step scaling | Thêm/bớt số instance khác nhau theo mức độ vượt ngưỡng alarm | Cần phản ứng mạnh hơn khi vượt ngưỡng xa |
| Simple scaling | Một hành động cho một alarm, chờ cooldown xong mới scale tiếp | Legacy, ít dùng |
| Scheduled scaling | Đặt min/desired/max theo lịch (cron) | Tải tăng có thể đoán trước theo giờ (ví dụ 9h sáng thứ Hai) |
| Predictive scaling | Dùng ML phân tích lịch sử để dự báo và launch trước | Tải có chu kỳ lặp lại hằng ngày/tuần, cần capacity sẵn trước khi tải đến |

Có thể kết hợp nhiều policy; khi xung đột, ASG chọn kết quả cho **capacity lớn nhất**.

## Cooldown và instance warm-up

- **Cooldown** (mặc định 300 giây) áp dụng cho simple scaling: sau một lần scale, ASG chờ trước khi scale tiếp.
- **Instance warm-up** (target tracking/step): thời gian instance mới chưa được tính vào metric tổng hợp, tránh scale quá đà khi instance còn đang khởi động.
- **Health check grace period**: khoảng thời gian sau khi launch mà ASG chưa kiểm tra health, để app kịp khởi động.

## Health check: EC2 hay ELB

- Mặc định ASG dùng **EC2 status check**: chỉ phát hiện lỗi phần cứng/hệ điều hành.
- Bật **ELB health check** trên ASG: instance vẫn "running" nhưng ứng dụng trả lỗi (health check HTTP fail) sẽ bị ASG **terminate và thay thế**.
- Câu hỏi kiểu "app treo nhưng instance vẫn chạy, ASG không thay thế" → bật ELB health check cho ASG.

## Lifecycle hooks

- Tạm dừng instance ở trạng thái **Pending:Wait** (khi launch) hoặc **Terminating:Wait** (khi terminate).
- Dùng để: cài đặt/cấu hình trước khi nhận traffic, hoặc **lấy log/flush dữ liệu** trước khi instance bị xoá.
- Kết hợp EventBridge hoặc SNS/SQS để kích hoạt Lambda/script; gọi complete-lifecycle-action khi xong. Timeout mặc định 1 giờ.

## Warm pools

- Giữ sẵn một nhóm instance đã khởi tạo ở trạng thái **Stopped**, **Running** hoặc **Hibernated**.
- Giảm độ trễ scale out với ứng dụng khởi động lâu (ví dụ cần vài phút load dữ liệu). Instance Stopped chỉ trả phí EBS.

## Termination policy

- Mặc định: chọn AZ có nhiều instance nhất để cân bằng, sau đó ưu tiên instance dùng launch template/config cũ nhất, rồi instance gần giờ tính tiền tiếp theo.
- Tuỳ chỉnh: OldestInstance, NewestInstance, OldestLaunchTemplate, AllocationStrategy...
- **Instance scale-in protection** để bảo vệ instance đang xử lý job dài không bị scale in.
- **Instance refresh** để thay dần toàn bộ instance khi cập nhật AMI/launch template.

## Scale theo SQS backlog per instance

Với worker xử lý hàng đợi SQS, metric CPU không phản ánh đúng tải. Cách khuyến nghị:

1. Tính **backlog per instance** = ApproximateNumberOfMessagesVisible / số instance InService.
2. Xác định giá trị chấp nhận được = độ trễ chấp nhận được / thời gian xử lý trung bình một message (ví dụ 10 giây / 0.1 giây = 100 message/instance).
3. Publish custom metric lên CloudWatch và dùng **target tracking** với mục tiêu đó.

## Lưu ý thi

- ASG không tính phí riêng, chỉ trả tiền cho tài nguyên.
- ASG + ALB trên nhiều AZ là đáp án chuẩn cho "highly available, scalable web tier".
- Muốn đặt desired = 0 ngoài giờ làm việc để tiết kiệm → scheduled scaling.
- Spot instance bị thu hồi: ASG tự launch thay thế; bật **Capacity Rebalancing** để chủ động thay instance có nguy cơ bị thu hồi.
`,
    keywords: [
      { trigger: 'giữ CPU trung bình ở mức 50%', answer: 'Target tracking scaling policy' },
      { trigger: 'tải tăng vào cùng giờ mỗi ngày, biết trước', answer: 'Scheduled scaling hoặc predictive scaling' },
      { trigger: 'ứng dụng không phản hồi nhưng instance vẫn running và không bị thay thế', answer: 'Bật ELB health check cho ASG' },
      { trigger: 'lấy log trước khi instance bị terminate', answer: 'Lifecycle hook Terminating:Wait' },
      { trigger: 'ứng dụng khởi động mất nhiều phút, cần scale out nhanh', answer: 'Warm pools' },
      { trigger: 'scale worker theo số message trong hàng đợi', answer: 'Target tracking trên backlog per instance (custom metric)' },
      { trigger: 'cập nhật AMI cho toàn bộ instance trong ASG', answer: 'Instance refresh với launch template version mới' },
    ],
    traps: [
      'Mặc định ASG chỉ dùng EC2 status check, không phát hiện lỗi ở tầng ứng dụng.',
      'Launch configuration là legacy; câu trả lời mới nên dùng launch template.',
      'Scale theo CPU cho SQS worker thường sai; dùng backlog per instance.',
      'Simple scaling bị chặn bởi cooldown; target tracking là lựa chọn ít vận hành hơn.',
      'Scheduled scaling không phản ứng với tải bất ngờ; cần kết hợp với dynamic scaling.',
    ],
  },
  {
    slug: 'decoupling-messaging',
    domain: 'resilient',
    title: 'Decoupling: SQS, SNS, EventBridge, Kinesis, Amazon MQ',
    summary:
      'Tách rời các thành phần để hệ thống chịu lỗi và scale độc lập. Phân biệt SQS Standard/FIFO, SNS fan-out, EventBridge, Kinesis Data Streams và Amazon MQ.',
    services: ['Amazon SQS', 'Amazon SNS', 'Amazon EventBridge', 'Amazon Kinesis Data Streams', 'Amazon MQ'],
    minutes: 12,
    body: `## Vì sao cần decoupling

Khi web tier gọi trực tiếp backend xử lý chậm, một đợt tăng tải có thể làm sập cả hệ thống. Đặt một hàng đợi ở giữa giúp: hấp thụ spike, retry khi lỗi, scale producer và consumer độc lập. Từ khoá đề thi: "decouple", "loosely coupled", "đơn hàng không được mất khi backend lỗi".

## Amazon SQS

| Thuộc tính | Standard | FIFO |
|---|---|---|
| Thứ tự | Best-effort | Đảm bảo thứ tự trong cùng **message group ID** |
| Delivery | At-least-once (có thể trùng) | **Exactly-once processing** (deduplication trong 5 phút) |
| Throughput | Gần như không giới hạn | 300 msg/s mỗi API action, 3.000 msg/s với batching; high-throughput mode cao hơn nhiều |
| Tên queue | Bất kỳ | Phải kết thúc bằng .fifo |

Các thông số hay gặp:
- **Retention**: mặc định 4 ngày, từ 1 phút tới **14 ngày**.
- **Visibility timeout**: mặc định 30 giây, tối đa 12 giờ. Consumer chưa xoá message trước khi hết timeout thì message hiện lại và bị xử lý lần nữa. Xử lý lâu → tăng visibility timeout hoặc gọi ChangeMessageVisibility.
- **Long polling**: ReceiveMessageWaitTimeSeconds tối đa 20 giây, giảm số lần gọi API rỗng → giảm chi phí và độ trễ.
- **Delay queue**: trì hoãn message 0–15 phút trước khi consumer thấy.
- **Dead-letter queue (DLQ)**: message bị nhận quá **maxReceiveCount** lần sẽ chuyển sang DLQ để phân tích; có thể **redrive** về queue gốc. DLQ của FIFO queue phải là FIFO.
- **Kích thước message**: giới hạn kinh điển trong đề là 256 KB (AWS đã nâng lên 1 MiB từ 2025). Payload lớn hơn → **SQS Extended Client Library** lưu payload ở **S3**, message chỉ chứa con trỏ.
- Bảo mật: SSE với SQS-managed key hoặc KMS, queue access policy, VPC endpoint.

## Amazon SNS

- Pub/sub: một **topic**, nhiều subscriber (SQS, Lambda, HTTP/S, email, SMS, mobile push, Firehose).
- **Fan-out SNS → nhiều SQS**: một sự kiện cần xử lý song song bởi nhiều hệ thống độc lập (ví dụ đơn hàng → kho, thanh toán, analytics). Mỗi hệ thống có queue riêng, bền vững, retry riêng. Cần cấp quyền trong SQS access policy cho SNS gửi vào.
- **Message filtering**: filter policy trên subscription để subscriber chỉ nhận message phù hợp (ví dụ chỉ đơn hàng có country = VN), không cần tạo nhiều topic.
- **SNS FIFO topic** kết hợp SQS FIFO khi cần fan-out có thứ tự và dedup.
- SNS không lưu message lâu dài: subscriber offline có thể mất message, nên đặt SQS phía sau để bền vững.

## Amazon EventBridge

- Event bus serverless: **default bus** (sự kiện từ dịch vụ AWS), **custom bus** (ứng dụng của bạn), **partner bus** (SaaS như Zendesk, Datadog).
- **Rule** lọc sự kiện theo event pattern rồi gửi tới target (Lambda, SQS, Step Functions, SNS, API destination...). Có **archive và replay** sự kiện.
- **EventBridge Scheduler**: lập lịch (cron/rate/one-time) gọi hàng nghìn loại target, thay cho cron trên EC2.
- **EventBridge Pipes**: nối point-to-point từ source (SQS, Kinesis, DynamoDB Streams...) tới target, có filter và enrichment, giảm code glue.
- Chọn EventBridge khi: phản ứng với sự kiện AWS (ví dụ EC2 state change), tích hợp SaaS, định tuyến nhiều rule phức tạp. Chọn SNS khi cần fan-out đơn giản, throughput cao, push tới SMS/email/mobile.

## Kinesis Data Streams và SQS

| Tiêu chí | Kinesis Data Streams | SQS |
|---|---|---|
| Mô hình | Stream, nhiều consumer đọc cùng dữ liệu | Queue, message bị xoá sau khi xử lý |
| Replay | Có, retention mặc định 24 giờ, tối đa 365 ngày | Không |
| Thứ tự | Theo shard (partition key) | FIFO theo message group |
| Use case | Real-time analytics, clickstream, IoT, log | Decouple tác vụ, job queue |
| Capacity | Provisioned (shard: 1 MB/s ghi, 2 MB/s đọc) hoặc On-demand | Tự động |

Từ khoá "real-time", "nhiều ứng dụng đọc cùng luồng dữ liệu", "replay" → Kinesis. Muốn đẩy stream vào S3/Redshift/OpenSearch không cần code → **Amazon Data Firehose** (near real-time).

## Amazon MQ

- Managed message broker cho **Apache ActiveMQ** và **RabbitMQ**, hỗ trợ giao thức chuẩn: **AMQP, MQTT, STOMP, OpenWire, JMS**.
- Chọn khi **migrate ứng dụng có sẵn** đang dùng broker on-premises và không muốn sửa code sang API SQS/SNS.
- HA: active/standby broker trên 2 AZ (ActiveMQ) hoặc cluster 3 node (RabbitMQ). Không scale "vô hạn" như SQS/SNS.

## Chọn nhanh

- Job queue, decouple, chịu spike → SQS Standard.
- Cần thứ tự + không trùng → SQS FIFO.
- Một sự kiện, nhiều hệ thống xử lý → SNS fan-out tới nhiều SQS.
- Sự kiện từ dịch vụ AWS/SaaS, routing theo nội dung → EventBridge.
- Streaming real-time, replay, nhiều consumer → Kinesis Data Streams.
- Lift-and-shift app dùng AMQP/MQTT/JMS → Amazon MQ.
`,
    keywords: [
      { trigger: 'thứ tự xử lý và không được xử lý trùng', answer: 'SQS FIFO' },
      { trigger: 'một sự kiện cần nhiều hệ thống xử lý độc lập, song song', answer: 'SNS fan-out tới nhiều SQS queue' },
      { trigger: 'message xử lý lỗi nhiều lần cần tách ra phân tích', answer: 'Dead-letter queue' },
      { trigger: 'message bị xử lý hai lần vì xử lý lâu', answer: 'Tăng visibility timeout' },
      { trigger: 'giảm số lần ReceiveMessage trả về rỗng', answer: 'Long polling (WaitTimeSeconds tới 20)' },
      { trigger: 'payload lớn hơn giới hạn message của SQS', answer: 'SQS Extended Client Library + S3' },
      { trigger: 'migrate app dùng AMQP/MQTT/JMS không sửa code', answer: 'Amazon MQ' },
      { trigger: 'real-time, nhiều consumer, replay dữ liệu', answer: 'Kinesis Data Streams' },
      { trigger: 'phản ứng với sự kiện SaaS hoặc thay đổi trạng thái dịch vụ AWS', answer: 'Amazon EventBridge rule' },
      { trigger: 'subscriber chỉ nhận một phần message của topic', answer: 'SNS message filtering (filter policy)' },
    ],
    traps: [
      'SQS Standard có thể giao trùng và sai thứ tự; đừng chọn nó khi đề yêu cầu exactly-once.',
      'SQS không cho nhiều consumer cùng đọc một message độc lập; cần SNS fan-out hoặc Kinesis.',
      'SNS không lưu trữ message; cần độ bền thì đặt SQS sau SNS.',
      'Amazon MQ không phải lựa chọn cho ứng dụng mới cần scale lớn; dùng SQS/SNS.',
      'Delay queue (trì hoãn trước khi nhìn thấy) khác visibility timeout (ẩn sau khi đã nhận).',
      'Data Firehose là near real-time và không replay; Kinesis Data Streams mới là real-time + replay.',
    ],
  },
  {
    slug: 'serverless-workflows',
    domain: 'resilient',
    title: 'Serverless: Lambda, API Gateway, Step Functions, AppSync',
    summary:
      'Các giới hạn của Lambda hay ra thi, cách chọn loại API Gateway, khi nào dùng Step Functions Standard hay Express, Lambda@Edge so với CloudFront Functions.',
    services: ['AWS Lambda', 'Amazon API Gateway', 'AWS Step Functions', 'AWS AppSync', 'Amazon CloudFront'],
    minutes: 11,
    body: `## AWS Lambda: các con số cần nhớ

| Giới hạn | Giá trị |
|---|---|
| Thời gian chạy tối đa | **15 phút** (900 giây) |
| Memory | 128 MB tới **10.240 MB** (CPU tăng theo memory) |
| Ephemeral storage /tmp | 512 MB mặc định, tối đa 10 GB |
| Concurrency mặc định | 1.000 mỗi Region (soft limit, tăng được) |
| Deployment package | 50 MB zip upload, 250 MB giải nén; container image tới 10 GB |
| Payload invocation đồng bộ | 6 MB |

- Job chạy lâu hơn 15 phút → không dùng Lambda; chọn **ECS/Fargate**, **AWS Batch**, hoặc chia nhỏ bằng **Step Functions**.
- Lambda scale tự động theo số request; mỗi request đồng thời dùng một execution environment.

### Concurrency

- **Reserved concurrency**: dành riêng và **giới hạn tối đa** concurrency cho một function. Dùng để bảo vệ downstream (ví dụ database không chịu nổi quá 100 kết nối) hoặc đảm bảo function quan trọng luôn có capacity. Đặt bằng 0 để tạm dừng function.
- **Provisioned concurrency**: giữ sẵn execution environment đã khởi tạo → loại bỏ **cold start**. Có phí. Có thể kết hợp Application Auto Scaling để điều chỉnh theo lịch.
- **SnapStart** (Java, Python, .NET): giảm cold start bằng snapshot.
- Lambda kết nối RDS với nhiều kết nối đồng thời → dùng **RDS Proxy** để gom kết nối.

### Lambda trong VPC

- Gắn Lambda vào subnet private để truy cập RDS, ElastiCache trong VPC (Lambda dùng Hyperplane ENI).
- Lambda trong VPC **không có Internet** trừ khi route qua **NAT Gateway**; truy cập S3/DynamoDB nên dùng **VPC endpoint**.

### Gọi Lambda và xử lý lỗi

- Đồng bộ (API Gateway, ALB), bất đồng bộ (S3, SNS, EventBridge: tự retry 2 lần, có thể cấu hình **destination** hoặc DLQ), và **event source mapping** (SQS, Kinesis, DynamoDB Streams: Lambda poll).

## Lambda@Edge và CloudFront Functions

| Tiêu chí | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Ngôn ngữ | JavaScript | Node.js, Python |
| Trigger | Viewer request/response | Viewer + origin request/response |
| Thời gian chạy | Dưới 1 ms | Tới 5 giây (viewer), 30 giây (origin) |
| Truy cập mạng/body | Không | Có |
| Use case | Rewrite URL, header, redirect, kiểm tra token đơn giản, quy mô cực lớn, rẻ | Logic phức tạp, gọi dịch vụ bên ngoài, xử lý body |

## Amazon API Gateway

| Loại | Đặc điểm |
|---|---|
| REST API | Đầy đủ tính năng: **API key, usage plan**, caching, request validation, WAF, private endpoint, edge-optimized |
| HTTP API | Rẻ hơn, độ trễ thấp hơn, JWT/OIDC authorizer, ít tính năng hơn |
| WebSocket API | Kết nối hai chiều lâu dài: chat, dashboard real-time |

- **Endpoint types**: Edge-optimized (qua CloudFront), Regional, Private (chỉ truy cập từ VPC qua interface endpoint).
- **Throttling**: mặc định 10.000 request/giây và burst 5.000 mỗi tài khoản mỗi Region; vượt sẽ trả **429 Too Many Requests**. Có thể đặt throttle theo stage/method.
- **Usage plans + API keys**: giới hạn rate và quota theo từng khách hàng (ví dụ gói Free 1.000 request/ngày).
- **Caching** (REST API): cache response tại stage, TTL mặc định 300 giây, tối đa 3.600 giây → giảm tải backend.
- **Integration timeout** mặc định 29 giây.
- Authorizer: IAM, Cognito user pool, Lambda authorizer.
- Đặt **SQS** phía sau API Gateway (service integration) để hấp thụ spike ghi.

## AWS Step Functions

- Orchestrate nhiều bước (Lambda, ECS, Glue, SageMaker, gọi trực tiếp hơn 200 dịch vụ AWS qua SDK integration) bằng state machine: retry, catch, parallel, map, wait, choice.
- Hỗ trợ **human approval** (callback với task token).

| | Standard | Express |
|---|---|---|
| Thời gian chạy tối đa | 1 năm | 5 phút |
| Semantics | Exactly-once | At-least-once (async) / at-most-once (sync) |
| Giá | Theo state transition | Theo số execution + thời gian + memory |
| Use case | Workflow dài, cần audit lịch sử, phê duyệt | Event processing khối lượng lớn, IoT, streaming |

## AWS AppSync

- Managed **GraphQL** (và Pub/Sub API): client lấy đúng dữ liệu cần từ nhiều nguồn (DynamoDB, Lambda, RDS, HTTP) trong một request.
- Hỗ trợ **real-time subscriptions** qua WebSocket và đồng bộ offline cho mobile.
- Từ khoá "GraphQL", "real-time update cho mobile/web app" → AppSync.
`,
    keywords: [
      { trigger: 'job chạy hơn 15 phút', answer: 'ECS/Fargate hoặc AWS Batch, không phải Lambda' },
      { trigger: 'loại bỏ cold start cho API nhạy độ trễ', answer: 'Lambda provisioned concurrency' },
      { trigger: 'giới hạn số kết nối Lambda tạo tới database', answer: 'Reserved concurrency và/hoặc RDS Proxy' },
      { trigger: 'giới hạn số request theo từng khách hàng bằng API key', answer: 'API Gateway usage plans' },
      { trigger: 'workflow nhiều bước, chạy nhiều ngày, cần phê duyệt thủ công', answer: 'Step Functions Standard' },
      { trigger: 'xử lý sự kiện khối lượng lớn, mỗi workflow vài giây', answer: 'Step Functions Express' },
      { trigger: 'rewrite URL/header ở edge, đơn giản, cực rẻ', answer: 'CloudFront Functions' },
      { trigger: 'GraphQL API với real-time subscriptions', answer: 'AWS AppSync' },
      { trigger: 'chat hai chiều real-time qua API', answer: 'API Gateway WebSocket API' },
    ],
    traps: [
      'Lambda trong private subnet không ra được Internet nếu không có NAT Gateway.',
      'Reserved concurrency không loại bỏ cold start; provisioned concurrency mới làm được.',
      'Usage plan và API key chỉ có ở REST API, không có ở HTTP API.',
      'Step Functions Express tối đa 5 phút; workflow dài phải dùng Standard.',
      'CloudFront Functions không có network access và không chạy ở origin request/response.',
      'API Gateway caching chỉ có ở REST API.',
    ],
  },
  {
    slug: 'route53-routing',
    domain: 'resilient',
    title: 'Route 53: DNS, routing policy và health check',
    summary:
      'Record types, Alias so với CNAME, tám routing policy, health check cho failover, Route 53 Resolver cho hybrid DNS và khi nào dùng Global Accelerator thay vì DNS.',
    services: ['Amazon Route 53', 'Route 53 Resolver', 'AWS Global Accelerator', 'Amazon CloudWatch'],
    minutes: 11,
    body: `## Record types quan trọng

- **A**: tên → IPv4. **AAAA**: tên → IPv6.
- **CNAME**: tên → tên khác. **Không dùng ở zone apex** (example.com), chỉ dùng cho subdomain.
- **NS**: name server của hosted zone. **MX**: mail server. **TXT**: xác minh domain, SPF.
- **Alias** (tính năng riêng của Route 53): trỏ tên tới tài nguyên AWS.

## Alias và CNAME

| | Alias | CNAME |
|---|---|---|
| Zone apex (example.com) | Có | Không |
| Target | ELB, CloudFront, API Gateway, S3 website, Global Accelerator, VPC interface endpoint, record khác cùng hosted zone... | Bất kỳ hostname |
| Phí truy vấn | Miễn phí khi trỏ tới tài nguyên AWS | Có phí |
| TTL | Route 53 tự quản | Tự đặt |
| Tự cập nhật IP thay đổi | Có | Theo DNS của target |

- Alias **không** trỏ được tới DNS name của EC2 instance.
- Đề hỏi "trỏ example.com tới ALB" → Alias A record.

## Routing policies

| Policy | Hành vi | Use case |
|---|---|---|
| Simple | Trả một hoặc nhiều giá trị, client chọn ngẫu nhiên; **không health check** | Một tài nguyên |
| Weighted | Chia theo trọng số (ví dụ 90/10) | Canary, blue/green, A/B test |
| Latency | Trả Region có độ trễ mạng thấp nhất tới người dùng | Ứng dụng đa Region, tối ưu tốc độ |
| Failover | Primary/secondary, chuyển khi primary unhealthy | Active-passive DR |
| Geolocation | Theo vị trí người dùng (châu lục, quốc gia, bang Mỹ); nên có record **Default** | Nội dung theo ngôn ngữ, giới hạn bản quyền, compliance |
| Geoproximity | Theo khoảng cách địa lý tới tài nguyên, điều chỉnh bằng **bias** | Dịch chuyển dần lưu lượng giữa các vùng |
| Multivalue answer | Trả tối đa 8 record **healthy** | "Load balancing" phía client đơn giản, không phải thay ELB |
| IP-based | Theo dải CIDR của client | Tối ưu theo ISP hoặc mạng nguồn đã biết |

- Geolocation dựa trên **vị trí** (luật, ngôn ngữ), Latency dựa trên **độ trễ đo được**. Đề nói "người dùng ở Đức phải được phục vụ từ eu-central-1 vì quy định" → Geolocation.

## Health checks

- Ba loại: **endpoint** (HTTP/HTTPS/TCP tới IP hoặc domain), **calculated** (kết hợp nhiều health check con với AND/OR/ngưỡng), **CloudWatch alarm** based.
- Health checker của Route 53 nằm ngoài VPC → không truy cập được tài nguyên private. Với tài nguyên private, tạo **CloudWatch alarm** trên metric rồi tạo health check theo alarm đó.
- Gắn health check vào record để Route 53 bỏ qua endpoint unhealthy (failover, weighted, latency, geolocation, multivalue).
- Với Alias trỏ tới ELB, bật **Evaluate Target Health** thay vì tạo health check riêng.
- Có thể gửi thông báo qua CloudWatch alarm + SNS.

## TTL

- TTL cao: ít truy vấn DNS hơn (rẻ hơn), nhưng thay đổi lan truyền chậm.
- TTL thấp: chuyển đổi nhanh khi migrate/failover, nhiều truy vấn hơn.
- Mẹo migrate: giảm TTL vài ngày trước khi đổi record, sau đó tăng lại.

## Hosted zones và hybrid DNS

- **Public hosted zone**: tên miền trên Internet. **Private hosted zone**: chỉ phân giải trong các VPC đã liên kết (cần bật enableDnsHostnames và enableDnsSupport).
- **Route 53 Resolver** (AmazonProvidedDNS ở địa chỉ VPC CIDR +2):
  - **Inbound endpoint**: DNS server on-premises chuyển truy vấn **vào** AWS để phân giải private hosted zone.
  - **Outbound endpoint + forwarding rules**: tài nguyên trong VPC phân giải tên miền **on-premises** (ví dụ corp.local).
  - Rule có thể chia sẻ giữa nhiều tài khoản bằng **AWS RAM**.
- **Route 53 Resolver DNS Firewall**: chặn truy vấn tới domain độc hại từ VPC.

## Route 53 hay Global Accelerator

| | Route 53 | Global Accelerator |
|---|---|---|
| Cơ chế | DNS, phụ thuộc TTL và cache của client | 2 **anycast IP tĩnh**, đi qua mạng backbone AWS |
| Failover | Theo TTL, có thể chậm do client cache | Nhanh (dưới 1 phút), không phụ thuộc DNS cache |
| Giao thức | Mọi thứ dùng DNS | TCP, UDP (game, VoIP, IoT) |
| IP tĩnh | Không | Có |

- Global Accelerator khác CloudFront: CloudFront **cache** nội dung HTTP tại edge; Global Accelerator **không cache**, chỉ tăng tốc đường mạng và cung cấp IP tĩnh cho TCP/UDP.
`,
    keywords: [
      { trigger: 'trỏ zone apex example.com tới ALB/CloudFront', answer: 'Route 53 Alias record' },
      { trigger: 'chuyển 10% traffic sang phiên bản mới', answer: 'Weighted routing' },
      { trigger: 'người dùng được chuyển tới Region có độ trễ thấp nhất', answer: 'Latency-based routing' },
      { trigger: 'nội dung theo quốc gia, yêu cầu pháp lý theo vị trí', answer: 'Geolocation routing' },
      { trigger: 'active-passive, chuyển sang site dự phòng khi primary lỗi', answer: 'Failover routing + health check' },
      { trigger: 'health check cho tài nguyên trong private subnet', answer: 'Health check dựa trên CloudWatch alarm' },
      { trigger: 'VPC phân giải tên miền on-premises', answer: 'Route 53 Resolver outbound endpoint + forwarding rule' },
      { trigger: 'on-premises phân giải private hosted zone', answer: 'Route 53 Resolver inbound endpoint' },
      { trigger: 'IP tĩnh toàn cầu, failover nhanh, game UDP', answer: 'AWS Global Accelerator' },
    ],
    traps: [
      'CNAME không dùng được ở zone apex; dùng Alias.',
      'Alias không trỏ được tới DNS name của EC2 instance.',
      'Simple routing không hỗ trợ health check.',
      'Multivalue answer không thay thế được ELB (không có health check ở tầng ứng dụng sâu, không phân tải theo connection).',
      'Health checker Route 53 không vào được private subnet; dùng CloudWatch alarm health check.',
      'Geolocation không có record Default sẽ trả "no answer" cho người dùng ngoài các vùng đã cấu hình.',
    ],
  },
  {
    slug: 'disaster-recovery',
    domain: 'resilient',
    title: 'Disaster Recovery: RPO, RTO và 4 chiến lược',
    summary:
      'Hiểu RPO/RTO, chọn đúng chiến lược backup & restore, pilot light, warm standby hay multi-site active/active theo yêu cầu và chi phí, cùng AWS Elastic Disaster Recovery.',
    services: [
      'AWS Elastic Disaster Recovery',
      'AWS Backup',
      'Amazon Route 53',
      'Amazon Aurora',
      'Amazon S3',
      'Amazon EBS',
    ],
    minutes: 10,
    body: `## RPO và RTO

- **RPO (Recovery Point Objective)**: lượng dữ liệu tối đa chấp nhận mất, tính bằng thời gian. RPO 1 giờ = được phép mất tối đa 1 giờ dữ liệu → phải backup/replicate ít nhất mỗi giờ.
- **RTO (Recovery Time Objective)**: thời gian tối đa từ lúc sự cố tới khi hệ thống chạy lại.
- RPO/RTO càng nhỏ → chi phí càng cao. Đề thi thường cho con số RPO/RTO + "MOST cost-effective" và bạn chọn chiến lược **rẻ nhất vẫn đạt yêu cầu**.

## Bốn chiến lược DR

| Chiến lược | Ở Region DR có gì | RPO / RTO điển hình | Chi phí |
|---|---|---|---|
| Backup & restore | Chỉ có backup (snapshot, AMI, S3) | Giờ / nhiều giờ tới ngày | Thấp nhất |
| Pilot light | Dữ liệu được replicate liên tục (DB replica), core infra tối thiểu; app server **tắt** hoặc chưa tạo | Phút / hàng chục phút | Thấp |
| Warm standby | Bản thu nhỏ của toàn bộ hệ thống **đang chạy** | Giây–phút / phút | Trung bình |
| Multi-site active/active | Hệ thống đầy đủ chạy và nhận traffic ở nhiều Region | Gần 0 / gần 0 | Cao nhất |

### Backup & restore

- Sao lưu định kỳ, copy cross-Region (EBS snapshot, RDS snapshot, AWS Backup cross-Region copy, S3 CRR).
- Khi sự cố: dùng **CloudFormation/IaC** dựng lại hạ tầng, restore dữ liệu.
- Phù hợp khi RTO tính bằng giờ, workload không quan trọng.

### Pilot light

- Giống "đốm lửa mồi": phần lõi (database) luôn được replicate, ví dụ **RDS cross-Region read replica** hoặc **Aurora Global Database**.
- App tier chỉ có AMI và launch template sẵn; khi sự cố thì khởi chạy, scale lên, promote database, đổi DNS.

### Warm standby

- Toàn bộ stack chạy ở quy mô nhỏ (ví dụ ASG min 1), có thể nhận một ít traffic hoặc dùng để test.
- Khi sự cố: tăng capacity ASG, promote DB, Route 53 failover.
- Khác pilot light ở chỗ app server **đã chạy**, nên RTO ngắn hơn.

### Multi-site active/active

- Nhiều Region cùng phục vụ (Route 53 latency/weighted routing), dữ liệu đồng bộ bằng **DynamoDB global tables** hoặc **Aurora Global Database** (write forwarding).
- RTO gần như bằng 0, chi phí cao nhất, phức tạp nhất về xung đột ghi dữ liệu.

## AWS Elastic Disaster Recovery (AWS DRS)

- Replicate **liên tục ở mức block** từ server on-premises, máy chủ ở cloud khác hoặc EC2 ở Region khác vào **staging area** chi phí thấp trong AWS (EBS volume + instance replication nhỏ).
- RPO tính bằng **giây**, RTO tính bằng **phút**; khi failover, DRS launch EC2 instance đã được chuyển đổi.
- Hỗ trợ **drill** (khởi chạy thử không ảnh hưởng replication) và **failback** về nguồn.
- Từ khoá: "server on-premises", "giảm chi phí DR site", "RPO giây, RTO phút" → AWS Elastic Disaster Recovery. Thay thế CloudEndure Disaster Recovery.
- Khác **AWS Application Migration Service (MGN)**: MGN dùng cho migrate (lift-and-shift) một lần, DRS dùng cho DR liên tục.

## Cross-Region snapshot copy

- **EBS snapshot** và **AMI**: copy sang Region khác (có thể mã hoá lại với KMS key ở Region đích). AMI là tài nguyên theo Region.
- **RDS snapshot**: copy thủ công hoặc bật **cross-Region automated backups** replication.
- Tự động hoá: **AWS Backup** copy rule hoặc **Amazon Data Lifecycle Manager** cross-Region copy.
- Snapshot mã hoá: Region đích cần KMS key của Region đó (hoặc multi-Region key).

## Mẹo chọn đáp án

1. Đọc RPO/RTO trước. Hàng giờ → backup & restore. Hàng chục phút → pilot light. Vài phút → warm standby. Gần 0 → active/active.
2. Nếu hai chiến lược đều đạt, chọn cái **rẻ hơn** khi đề nói cost-effective.
3. Database luôn là phần khó: chú ý replication cross-Region (Aurora Global Database cho RPO khoảng 1 giây, RTO dưới 1 phút).
4. DNS failover với Route 53 failover routing + health check là mảnh ghép chung của mọi chiến lược đa Region.
5. Hạ tầng bằng code (CloudFormation, CDK) giúp giảm RTO khi phải dựng lại.
`,
    keywords: [
      { trigger: 'RPO/RTO tính bằng giờ, chi phí thấp nhất', answer: 'Backup and restore' },
      { trigger: 'database replicate liên tục, app server chỉ khởi chạy khi sự cố', answer: 'Pilot light' },
      { trigger: 'bản thu nhỏ của production luôn chạy ở Region khác', answer: 'Warm standby' },
      { trigger: 'RTO gần 0, cả hai Region cùng phục vụ', answer: 'Multi-site active/active' },
      { trigger: 'DR cho server on-premises, RPO giây, RTO phút', answer: 'AWS Elastic Disaster Recovery' },
      { trigger: 'dựng lại hạ tầng nhanh ở Region khác', answer: 'AWS CloudFormation (IaC)' },
      { trigger: 'chuyển DNS sang Region DR khi primary lỗi', answer: 'Route 53 failover routing + health check' },
    ],
    traps: [
      'Nhầm pilot light (app server tắt) với warm standby (app server chạy quy mô nhỏ).',
      'Chọn active/active khi đề chỉ cần RTO vài giờ là lãng phí, không phải cost-effective.',
      'Multi-AZ không phải DR cross-Region; nó chỉ chịu lỗi AZ.',
      'AMI và snapshot là tài nguyên theo Region, phải copy sang Region DR.',
      'AWS MGN là công cụ migration, không phải công cụ DR liên tục.',
    ],
  },
  {
    slug: 'backup-replication',
    domain: 'resilient',
    title: 'Backup và Replication: AWS Backup, RDS, Aurora, DynamoDB, S3, EBS, EFS',
    summary:
      'Cách sao lưu và replicate dữ liệu cho từng dịch vụ: AWS Backup tập trung, PITR, read replica cross-Region, Aurora Global Database, DynamoDB global tables, S3 replication, EBS snapshot.',
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

- Dịch vụ backup **tập trung, policy-based** cho EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, DocumentDB, Neptune...
- **Backup plan**: lịch (cron), backup window, lifecycle (chuyển sang cold storage, hết hạn), **copy rule** sang Region/tài khoản khác. Gán tài nguyên bằng **tag** hoặc resource ID.
- **Backup vault**: nơi lưu recovery point, mã hoá bằng KMS.
- **Cross-account backup**: kết hợp AWS Organizations, copy backup sang tài khoản riêng để chống xoá do tài khoản production bị xâm nhập.
- **AWS Backup Vault Lock**: chế độ **WORM**, chặn xoá/sửa lifecycle backup, kể cả root user.
  - **Governance mode**: user có quyền đặc biệt vẫn gỡ được lock.
  - **Compliance mode**: sau thời gian grace, **không ai** gỡ được, kể cả AWS.
- **Logically air-gapped vault**: vault cách ly, chia sẻ được sang tài khoản khác để phục hồi khi bị ransomware.
- **Backup Audit Manager** để kiểm tra tuân thủ chính sách backup.

## Amazon RDS

| | Automated backups | Manual snapshot |
|---|---|---|
| Kích hoạt | Tự động hằng ngày + transaction log | Người dùng tạo |
| Retention | 0–35 ngày (0 = tắt) | Giữ tới khi xoá |
| PITR | Có, khôi phục tới bất kỳ giây nào trong retention (thường tới khoảng 5 phút gần nhất) | Không |
| Khi xoá DB | Bị xoá (trừ khi giữ lại) | Vẫn còn |

- Restore luôn tạo **DB instance mới** với endpoint mới.
- Giữ backup quá 35 ngày → manual snapshot hoặc AWS Backup.
- **Read replica**: replication bất đồng bộ, có thể **cross-Region** (dùng cho DR và đọc gần người dùng). Promote replica thành DB độc lập khi Region chính lỗi (thao tác thủ công, RPO bằng replication lag).

## Amazon Aurora

- Backup liên tục lên S3, PITR trong retention 1–35 ngày; **Backtrack** (Aurora MySQL) tua lại DB tại chỗ không cần restore.
- **Aurora Replicas**: tối đa 15 trong cùng Region, failover tự động.
- **Aurora Global Database**:
  - Một Region primary (đọc/ghi), các secondary Region chỉ đọc, replication ở tầng storage, độ trễ thường **dưới 1 giây**.
  - DR: RPO khoảng 1 giây, RTO dưới 1 phút; hỗ trợ **switchover** (có kế hoạch, không mất dữ liệu) và **failover**.
  - **Write forwarding**: secondary chuyển lệnh ghi về primary.
  - Đọc độ trễ thấp cho người dùng toàn cầu.

## Amazon DynamoDB

- **On-demand backup**: full backup không ảnh hưởng hiệu năng, giữ tới khi xoá.
- **PITR**: khôi phục tới bất kỳ giây nào trong tối đa **35 ngày** gần nhất; restore tạo **bảng mới**.
- **Global tables**: multi-Region, **multi-active** (ghi ở mọi Region), replication thường dưới 1 giây, xử lý xung đột last-writer-wins. Cần DynamoDB Streams (được bật tự động).
- Export sang S3 dùng PITR để phân tích mà không tốn read capacity.

## Amazon S3

- **Versioning**: giữ mọi phiên bản object, chống xoá/ghi đè nhầm. Kết hợp **MFA Delete** và **Object Lock** (WORM).
- **Replication** (bắt buộc bật versioning ở **cả bucket nguồn và đích**, replication bất đồng bộ):
  - **CRR (Cross-Region Replication)**: compliance, DR, giảm độ trễ cho người dùng ở Region khác.
  - **SRR (Same-Region Replication)**: gom log, đồng bộ prod và test account.
  - Chỉ replicate object **mới** sau khi bật; object đã tồn tại dùng **S3 Batch Replication**.
  - Delete marker có thể replicate (tuỳ chọn); xoá theo version ID **không** được replicate.
  - Không replicate theo chuỗi (A → B → C không tự động).
- **S3 Replication Time Control (RTC)**: SLA replicate **99,99% object trong 15 phút**, có metric và thông báo. Từ khoá "yêu cầu replicate trong thời gian có thể dự đoán / compliance".

## Amazon EBS

- **Snapshot**: incremental, lưu trên S3 (do AWS quản lý), có thể copy cross-Region/cross-account, tạo volume ở AZ bất kỳ trong Region.
- **Amazon Data Lifecycle Manager (DLM)**: tự động tạo, giữ, xoá snapshot EBS và AMI theo lịch và tag; hỗ trợ cross-Region copy.
- **Fast Snapshot Restore (FSR)**: volume tạo từ snapshot đạt hiệu năng đầy đủ ngay, không bị độ trễ "first touch" khi đọc block lần đầu. Có phí theo giờ mỗi AZ.
- **Recycle Bin**: giữ snapshot EBS và AMI bị xoá trong thời gian retention để khôi phục khi xoá nhầm.
- **EBS Snapshot Archive**: tier lưu trữ rẻ hơn cho snapshot ít dùng (tối thiểu 90 ngày, khôi phục mất 24–72 giờ).

## Amazon EFS

- **EFS Replication**: replicate file system sang Region khác (hoặc cùng Region), RPO tính bằng phút (thường mục tiêu 15 phút). File system đích chỉ đọc cho tới khi failover.
- Backup EFS bằng **AWS Backup** (tự động bật mặc định khi tạo qua console).

## Tóm tắt chọn nhanh

| Yêu cầu | Đáp án |
|---|---|
| Quản lý backup tập trung nhiều dịch vụ, nhiều tài khoản | AWS Backup |
| Backup không thể bị xoá, kể cả root | Backup Vault Lock compliance mode |
| Database toàn cầu, RPO giây, RTO phút | Aurora Global Database |
| Ghi ở nhiều Region cùng lúc | DynamoDB global tables |
| Replicate S3 có SLA 15 phút | S3 Replication Time Control |
| Khôi phục snapshot bị xoá nhầm | Recycle Bin |
`,
    keywords: [
      { trigger: 'quản lý backup tập trung cho nhiều dịch vụ và tài khoản', answer: 'AWS Backup với backup plan + Organizations' },
      { trigger: 'backup không thể bị xoá, kể cả root user', answer: 'AWS Backup Vault Lock (compliance mode)' },
      { trigger: 'khôi phục database về thời điểm ngay trước khi xoá nhầm dữ liệu', answer: 'Point-in-time recovery (PITR)' },
      { trigger: 'database quan hệ toàn cầu, RPO 1 giây, RTO dưới 1 phút', answer: 'Aurora Global Database' },
      { trigger: 'ghi dữ liệu ở nhiều Region, multi-active', answer: 'DynamoDB global tables' },
      { trigger: 'replicate object S3 sang Region khác trong 15 phút có SLA', answer: 'S3 CRR với Replication Time Control' },
      { trigger: 'replicate object S3 đã tồn tại trước khi bật replication', answer: 'S3 Batch Replication' },
      { trigger: 'volume từ snapshot cần hiệu năng đầy đủ ngay lập tức', answer: 'EBS Fast Snapshot Restore' },
      { trigger: 'tự động tạo và xoá EBS snapshot theo lịch', answer: 'Amazon Data Lifecycle Manager' },
      { trigger: 'khôi phục EBS snapshot hoặc AMI bị xoá nhầm', answer: 'Recycle Bin' },
    ],
    traps: [
      'RDS automated backup tối đa 35 ngày; cần lâu hơn thì dùng manual snapshot hoặc AWS Backup.',
      'Restore RDS/DynamoDB luôn tạo instance/bảng mới, không ghi đè tại chỗ.',
      'S3 replication yêu cầu versioning ở cả hai bucket và không tự replicate object có sẵn.',
      'Aurora Global Database secondary chỉ đọc (trừ write forwarding); multi-active ghi thật sự là DynamoDB global tables.',
      'Vault Lock governance mode vẫn có thể bị gỡ bởi user có quyền; compliance mode mới bất biến.',
      'Read replica cross-Region không tự failover; phải promote.',
    ],
  },
  {
    slug: 'management-iac',
    domain: 'resilient',
    title: 'Infrastructure as Code và vận hành: CloudFormation, Beanstalk, Systems Manager, CloudWatch',
    summary:
      'Dựng hạ tầng lặp lại được bằng CloudFormation/CDK/SAM, triển khai an toàn với Elastic Beanstalk, vận hành fleet bằng Systems Manager và quan sát hệ thống bằng CloudWatch, X-Ray, Health Dashboard.',
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

Khai báo hạ tầng trong **template** (JSON/YAML) → CloudFormation tạo **stack** theo thứ tự phụ thuộc, tự **rollback** nếu lỗi. Dùng lại template để dựng môi trường giống hệt ở Region khác (giảm RTO khi DR).

### Các phần chính của template

- **Parameters**, **Mappings** (ví dụ AMI theo Region), **Conditions**, **Resources** (bắt buộc), **Outputs**.
- **Cross-stack reference**: Outputs với **Export**, stack khác dùng **Fn::ImportValue**.
- **Dynamic reference** lấy giá trị từ Parameter Store/Secrets Manager lúc deploy, không ghi secret vào template.

### Thay đổi an toàn

- **Change set**: xem trước tài nguyên nào được thêm, sửa hay **bị replace** trước khi update. Đề nói "review changes before applying" → change set.
- **Drift detection**: phát hiện tài nguyên bị sửa tay lệch khỏi template.
- **Stack policy** chặn update tài nguyên quan trọng; **termination protection** chặn xoá stack.

### DeletionPolicy

| Giá trị | Khi xoá stack hoặc gỡ tài nguyên |
|---|---|
| Delete | Xoá tài nguyên (mặc định với hầu hết tài nguyên) |
| Retain | Giữ tài nguyên, tách khỏi stack |
| Snapshot | Tạo snapshot cuối rồi xoá; cho EBS volume, RDS, ElastiCache, Redshift... |

**UpdateReplacePolicy** áp dụng tương tự khi update làm tài nguyên bị replace.

### Nested stacks và StackSets

- **Nested stacks**: tài nguyên AWS::CloudFormation::Stack gọi template con, tái sử dụng thành phần chung trong **một** stack cha.
- **StackSets**: triển khai **cùng một template tới nhiều tài khoản và nhiều Region** bằng một thao tác. Với **service-managed permissions** (AWS Organizations), bật **automatic deployment** để tài khoản mới vào OU được deploy tự động.

### Bootstrapping EC2

- **cfn-init** đọc metadata AWS::CloudFormation::Init để cài package, tạo file, chạy service.
- **cfn-signal** + **CreationPolicy**: stack chỉ CREATE_COMPLETE khi instance báo thành công; hết timeout thì rollback.

### AWS CDK và AWS SAM

- **CDK**: viết hạ tầng bằng TypeScript, Python, Java...; **synthesize** ra template CloudFormation.
- **SAM**: cú pháp rút gọn cho serverless, mở rộng thành CloudFormation; deploy Lambda dần dần (canary/linear) qua CodeDeploy.

## Elastic Beanstalk: deployment policies

| Policy | Capacity khi deploy | Downtime | Rollback | Chi phí thêm |
|---|---|---|---|---|
| All at once | Mất toàn bộ trong lúc deploy | Có | Deploy lại bản cũ | Không |
| Rolling | Giảm theo từng batch | Không | Deploy lại | Không |
| Rolling with additional batch | Giữ **đủ** capacity | Không | Deploy lại | Một batch tạm thời |
| Immutable | Đủ, bản mới chạy trên **instance mới** ở ASG tạm | Không | Nhanh: chỉ xoá instance mới | Gấp đôi trong lúc deploy |
| Traffic splitting | Chia % traffic cho instance mới (canary) | Không | Nhanh | Instance mới |

**Blue/green**: tạo môi trường thứ hai rồi **swap environment URL** (CNAME) hoặc chuyển dần bằng Route 53 weighted.

## AWS Systems Manager (SSM)

Quản lý **managed node** (EC2 và server on-premises qua **hybrid activation**) có SSM Agent và IAM role.

- **Session Manager**: shell không cần SSH (xem bài VPC).
- **Run Command**: chạy lệnh trên hàng trăm node theo tag, có rate control, không cần SSH.
- **Patch Manager**: patch baseline, patch group, chạy trong **Maintenance Window**, báo cáo compliance.
- **Automation**: runbook nhiều bước (tạo AMI, restart instance); cơ chế remediation của AWS Config.
- **State Manager**: association giữ node ở trạng thái mong muốn.
- **OpsCenter**: gom OpsItem từ CloudWatch alarm, EventBridge để xử lý tập trung. **Parameter Store**: xem bài Secrets.

## Amazon CloudWatch

- **Metrics**: EC2 basic monitoring 5 phút, detailed 1 phút. **Memory và disk usage không có sẵn** → cài **CloudWatch agent**. Custom metric qua PutMetricData, tới 1 giây.
- **Alarms** → action: SNS, Auto Scaling, **EC2 action** (stop, terminate, reboot, **recover**), SSM OpsItem. **Composite alarm** giảm cảnh báo nhiễu.
- **Logs**: log group, retention; **metric filter** biến pattern log thành metric; **subscription filter** stream real-time tới Lambda, Kinesis, Firehose; export sang S3 không real-time. **Logs Insights** để truy vấn log.
- **Dashboards** đa Region, đa tài khoản; **cross-account observability**: một monitoring account xem metric, log, trace của các source account.

## X-Ray, Health Dashboard và Service Catalog

- **AWS X-Ray**: distributed tracing, **service map**, tìm service gây độ trễ hoặc lỗi trong microservices (active tracing cho Lambda, API Gateway).
- **AWS Health Dashboard**: sự kiện AWS **ảnh hưởng tài khoản của bạn** (bảo trì, EC2 retirement); đi vào EventBridge để tự động xử lý.
- **AWS Service Catalog**: admin tạo **portfolio** sản phẩm đã duyệt (template CloudFormation); người dùng tự launch qua **launch constraint** (IAM role của sản phẩm), không cần quyền rộng.
- **Trusted Advisor** và **Compute Optimizer**: xem bài quản lý chi phí.

## Yêu cầu → công cụ

| Yêu cầu | Công cụ |
|---|---|
| Xem trước thay đổi stack | CloudFormation change set |
| Phát hiện sửa tay ngoài IaC | Drift detection |
| Cùng baseline cho mọi tài khoản/Region | CloudFormation StackSets |
| Giữ snapshot DB khi xoá stack | DeletionPolicy: Snapshot |
| Patch fleet theo lịch | SSM Patch Manager + Maintenance Window |
| Cảnh báo theo số lỗi trong log | Metric filter + alarm |
| Tìm điểm nghẽn giữa các microservice | AWS X-Ray |
| Dev tự tạo tài nguyên đã chuẩn hoá | AWS Service Catalog |
`,
    keywords: [
      { trigger: 'xem trước thay đổi trước khi update stack production', answer: 'CloudFormation change set' },
      { trigger: 'tài nguyên bị sửa tay khác với template', answer: 'CloudFormation drift detection' },
      { trigger: 'triển khai cùng template tới mọi tài khoản và Region, kể cả tài khoản mới', answer: 'CloudFormation StackSets (service-managed, automatic deployment)' },
      { trigger: 'giữ bản sao database khi xoá stack', answer: 'DeletionPolicy: Snapshot (hoặc Retain)' },
      { trigger: 'stack chỉ hoàn tất khi phần mềm trên EC2 cài xong', answer: 'CreationPolicy + cfn-signal' },
      { trigger: 'Beanstalk giữ đủ capacity, rollback nhanh, bản mới trên instance mới', answer: 'Immutable deployment' },
      { trigger: 'patch hàng trăm server EC2 và on-premises theo lịch', answer: 'SSM Patch Manager + Maintenance Window' },
      { trigger: 'giám sát memory/disk của EC2', answer: 'CloudWatch agent' },
      { trigger: 'tìm service gây độ trễ trong chuỗi microservice', answer: 'AWS X-Ray' },
      { trigger: 'người dùng chỉ được launch sản phẩm đã phê duyệt', answer: 'AWS Service Catalog' },
    ],
    traps: [
      'EC2 không gửi metric memory mặc định; detailed monitoring chỉ tăng tần suất lên 1 phút, không thêm metric RAM.',
      'Nested stacks dùng để tái sử dụng template trong một stack; triển khai đa tài khoản/Region là StackSets.',
      'Với hầu hết tài nguyên, xoá stack sẽ xoá luôn tài nguyên; muốn giữ dữ liệu hãy đặt rõ DeletionPolicy Retain hoặc Snapshot.',
      'Beanstalk All at once gây downtime; Rolling giảm capacity trong lúc deploy.',
      'CloudTrail ghi ai gọi API, CloudWatch đo metric/log, X-Ray trace request; đừng nhầm ba service.',
      'Export CloudWatch Logs sang S3 không real-time; cần real-time thì dùng subscription filter.',
    ],
  },
  {
    slug: 'application-integration',
    domain: 'resilient',
    title: 'Tích hợp ứng dụng nâng cao: EventBridge, Step Functions, AppFlow, AppSync, MQ, SES, IoT Core',
    summary:
      'Đi sâu EventBridge (cross-account, archive/replay, Scheduler, Pipes, API destinations), các pattern Step Functions (Retry/Catch, task token, Distributed Map, saga) và các dịch vụ tích hợp chuyên biệt.',
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
    body: `## Amazon EventBridge chuyên sâu

### Event bus

- **Default bus**: sự kiện từ dịch vụ AWS (EC2 state change, AWS Health, CodePipeline...).
- **Custom bus**: sự kiện của ứng dụng (PutEvents).
- **Partner event source**: SaaS (Zendesk, Datadog...) đẩy sự kiện thẳng vào tài khoản, không cần webhook/poller.
- **Cross-account**: rule ở tài khoản nguồn có target là event bus của tài khoản trung tâm; bus đích cần **resource-based policy** cho phép tài khoản nguồn (hoặc cả organization) gửi vào. Cũng gửi được sang bus ở Region khác.

### Rule và event pattern

- Pattern lọc theo source, detail-type, detail (prefix, suffix, anything-but, numeric...).
- Mỗi rule tối đa 5 target; **input transformer** định dạng lại payload trước khi gửi.
- Mỗi target có **retry policy** (mặc định thử lại tới 24 giờ) và **DLQ** (SQS) cho sự kiện gửi không thành công.

### Các tính năng hay ra thi

- **Schema registry**: lưu cấu trúc sự kiện; **schema discovery** tự suy ra schema, sinh code binding.
- **Archive và replay**: lưu sự kiện (có retention, lọc theo pattern), phát lại một khoảng thời gian để xử lý lại sau khi sửa bug.
- **EventBridge Scheduler**: lịch one-time, rate, cron có time zone, flexible time window, tới hàng triệu lịch, gọi trực tiếp hàng trăm API AWS. Thay cron trên EC2.
- **EventBridge Pipes**: point-to-point **source → filter → enrichment → target**. Source: SQS, Kinesis, DynamoDB Streams, MSK/Kafka, Amazon MQ. Enrichment: Lambda, Step Functions Express, API Gateway, API destination. Giảm Lambda "glue".
- **API destinations**: gọi HTTP endpoint bên ngoài (SaaS, webhook) làm target, có **connection** quản lý xác thực (Basic, API key, OAuth) và giới hạn tốc độ gọi.
- **Global endpoints**: failover ingestion sự kiện sang Region thứ hai khi Region chính gặp sự cố.

## Step Functions: các pattern

Nhắc lại: **Standard** (tới 1 năm, exactly-once, lịch sử thực thi) cho workflow dài; **Express** (tới 5 phút, giá theo execution) cho khối lượng lớn. Express **không** hỗ trợ pattern .sync và callback.

### Xử lý lỗi

- **Retry**: theo ErrorEquals (ví dụ States.Timeout, States.TaskFailed, lỗi tự định nghĩa), IntervalSeconds, MaxAttempts, **BackoffRate** (exponential backoff), có thể thêm jitter.
- **Catch**: hết retry thì chuyển sang state fallback; ResultPath giữ input gốc kèm thông tin lỗi.

### Integration patterns

| Pattern | Hậu tố | Hành vi |
|---|---|---|
| Request Response | (mặc định) | Gọi API rồi đi tiếp ngay |
| Run a Job | .sync | Chờ job (ECS task, Glue, Batch) hoàn tất |
| Wait for Callback | .waitForTaskToken | Tạm dừng tới khi hệ thống ngoài gọi SendTaskSuccess/SendTaskFailure kèm task token; có HeartbeatSeconds |

### Map và saga

- **Map (inline)**: lặp song song trên mảng trong input, concurrency tối đa 40.
- **Distributed Map**: chạy **tới 10.000 child execution song song**, đọc item trực tiếp từ S3 (CSV, JSON, danh sách object) → xử lý hàng triệu file.
- **Saga**: mỗi bước (giữ chỗ, thanh toán, giao hàng) có Catch dẫn tới **compensating step** (huỷ giữ chỗ, hoàn tiền) chạy ngược lại, thay cho transaction phân tán.

## Dịch vụ tích hợp chuyên biệt

### Amazon AppFlow

- Luồng dữ liệu **hai chiều** giữa SaaS (Salesforce, SAP, ServiceNow, Zendesk, Slack, Google Analytics...) và AWS (S3, Redshift...).
- Chạy on-demand, theo lịch hoặc theo sự kiện; filter, mapping, mask field, validate; mã hoá KMS, dùng PrivateLink với một số SaaS. **Không cần viết code** gọi API SaaS.

### AWS AppSync

- Managed GraphQL: **resolver** tới DynamoDB, Lambda, Aurora, OpenSearch, HTTP; **subscription** real-time qua WebSocket; caching phía server.
- Auth: API key, IAM, Cognito user pool, OIDC, Lambda (kết hợp được nhiều mode).

### Amazon MQ

- Managed **ActiveMQ/RabbitMQ** chạy trên broker instance: giữ nguyên JMS, AMQP, MQTT, STOMP, OpenWire khi **lift-and-shift**.
- Không serverless như SQS/SNS: chọn instance size, throughput giới hạn bởi broker. Thường migrate lên MQ trước, refactor dần sang SQS/SNS sau.

### Amazon SES

- Gửi email và **nhận email** (receipt rule → S3, SNS, Lambda).
- Tài khoản mới ở **sandbox** (chỉ gửi tới địa chỉ đã xác minh) → yêu cầu production access. Xác minh domain bằng DKIM/SPF; **configuration set** publish sự kiện bounce, complaint tới SNS, Firehose, CloudWatch, EventBridge.

### AWS IoT Core

- Thiết bị kết nối qua **MQTT** (cả HTTPS, MQTT over WebSocket), xác thực bằng chứng chỉ **X.509**.
- **Device Shadow** lưu trạng thái mong muốn/báo cáo khi thiết bị offline.
- **Rules engine**: câu lệnh kiểu SQL lọc message theo topic rồi chuyển tới Lambda, DynamoDB, S3, Kinesis, Firehose, SQS, SNS... không cần server trung gian.

## Chọn dịch vụ tích hợp nào

| Tình huống | Dịch vụ |
|---|---|
| Job queue, hấp thụ spike | SQS |
| Fan-out push tới nhiều subscriber | SNS |
| Định tuyến sự kiện theo nội dung, sự kiện AWS/SaaS, cross-account | EventBridge |
| Nối source tới target có filter/enrich, ít code | EventBridge Pipes |
| Gọi tác vụ theo lịch, hàng triệu lịch | EventBridge Scheduler |
| Workflow nhiều bước, retry, chờ callback | Step Functions |
| Đồng bộ dữ liệu SaaS ↔ S3/Redshift không code | AppFlow |
| GraphQL, real-time cho web/mobile | AppSync |
| Giữ nguyên broker JMS/AMQP khi migrate | Amazon MQ |
| Gửi/nhận email | SES |
| Hàng nghìn thiết bị MQTT | IoT Core |
`,
    keywords: [
      { trigger: 'nhận sự kiện từ SaaS (Zendesk, Datadog) mà không viết webhook', answer: 'EventBridge partner event source' },
      { trigger: 'gom sự kiện từ nhiều tài khoản về tài khoản trung tâm', answer: 'EventBridge cross-account event bus + resource-based policy' },
      { trigger: 'xử lý lại sự kiện cũ sau khi sửa bug', answer: 'EventBridge archive và replay' },
      { trigger: 'SQS/Kinesis → lọc → enrich → target, không viết Lambda glue', answer: 'EventBridge Pipes' },
      { trigger: 'workflow dừng chờ hệ thống bên ngoài phản hồi', answer: 'Step Functions .waitForTaskToken' },
      { trigger: 'xử lý song song hàng triệu object S3 trong workflow', answer: 'Step Functions Distributed Map' },
      { trigger: 'hoàn tác các bước đã làm khi một bước sau lỗi', answer: 'Saga pattern với Catch + compensating steps' },
      { trigger: 'đồng bộ dữ liệu Salesforce vào S3 không viết code', answer: 'Amazon AppFlow' },
      { trigger: 'sensor gửi dữ liệu qua MQTT, định tuyến tới DynamoDB', answer: 'AWS IoT Core rules engine' },
      { trigger: 'gửi email transactional, theo dõi bounce/complaint', answer: 'Amazon SES với configuration set' },
    ],
    traps: [
      'Express workflow không hỗ trợ .sync và .waitForTaskToken; chờ callback dài phải dùng Standard.',
      'Bus đích cross-account cần resource-based policy; chỉ tạo rule ở tài khoản nguồn là chưa đủ.',
      'SNS không có archive và replay; muốn phát lại sự kiện dùng EventBridge archive hoặc Kinesis.',
      'AppFlow dành cho SaaS ↔ AWS; chuyển file từ on-premises dùng DataSync hoặc Transfer Family.',
      'Amazon MQ không tự scale như SQS/SNS; chỉ chọn khi cần giữ giao thức broker có sẵn.',
      'SES mới tạo nằm trong sandbox, chỉ gửi được tới địa chỉ đã xác minh.',
    ],
  },
];
