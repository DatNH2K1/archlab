import type { Question } from '@/content/types';

export const resilientQuestions: Question[] = [
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
      'Đáp án đúng: đưa session ra ElastiCache giúp ứng dụng stateless, nên ASG trải nhiều AZ sau ALB có thể scale ngang và thay instance mà không mất session. Scale up + auto recovery vẫn là một instance, một AZ (SPOF). Sticky session vẫn lưu session trong RAM, instance chết là mất session. EBS volume chỉ nằm trong một AZ và (trừ io1/io2 Multi-Attach trong cùng AZ) không gắn được cho nhiều instance.',
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
      'Multi-AZ DB cluster có 1 writer + 2 standby ở 3 AZ, standby đọc được và failover thường dưới 35 giây, đáp ứng cả hai yêu cầu. Standby của Multi-AZ DB instance không phục vụ đọc. Read replica cần promote thủ công nên không phải automatic failover. Restore từ snapshot tốn nhiều thời gian, không đạt RTO dưới 1 phút.',
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
      'NAT gateway là tài nguyên theo AZ; best practice là một NAT gateway mỗi AZ và route table của từng AZ trỏ tới NAT cùng AZ. NAT instance tự quản, nhiều vận hành và vẫn ở một AZ. Một VPC chỉ gắn được một internet gateway. Gán Elastic IP cho instance private không có tác dụng nếu subnet không route ra internet gateway, và phá vỡ thiết kế private subnet.',
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
      'EFS Standard lưu dữ liệu dư thừa trên nhiều AZ, có mount target ở từng AZ và hỗ trợ POSIX, truy cập đồng thời từ nhiều instance. EBS Multi-Attach chỉ trong cùng một AZ. EFS One Zone không chịu được lỗi AZ. Instance store là ephemeral, mất dữ liệu khi instance dừng, đồng bộ bằng cron phức tạp và không nhất quán.',
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
      'Local Zones đặt compute, storage gần các thành phố lớn để đạt độ trễ một chữ số mili-giây cho người dùng tại đó. CloudFront chỉ cache nội dung HTTP, không chạy game server. Outposts đặt tại data center của công ty, không phải gần người chơi. Global Accelerator tối ưu đường mạng nhưng server vẫn ở Region xa.',
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
      'Read replica nhận replication bất đồng bộ và có endpoint riêng, phù hợp để tách tải đọc của báo cáo. Standby của Multi-AZ DB instance không phục vụ đọc. Scale up không cô lập workload và tốn chi phí. Export hằng đêm sang S3 làm dữ liệu cũ và tăng vận hành.',
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
      'ASG trải nhiều AZ sau ALB giúp app tier sống sót khi một AZ lỗi; RDS Multi-AZ replicate đồng bộ nên không mất transaction đã commit và tự động failover. Một instance với Elastic IP là SPOF. Cross-Region read replica bất đồng bộ và phải promote thủ công. Snapshot hằng giờ có thể mất tới 1 giờ dữ liệu và không tự failover.',
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
      'ALB hoạt động ở layer 7, hỗ trợ rule theo path (/orders, /users) forward tới các target group khác nhau trên cùng một load balancer. NLB ở layer 4 không đọc được path URL. GWLB dùng để chèn appliance bảo mật, không phải routing HTTP. Route 53 làm việc ở mức DNS, không thấy path của URL.',
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
      'NLB có một IP tĩnh/Elastic IP mỗi AZ và hỗ trợ ALB làm target, nên vừa có IP cố định vừa giữ routing layer 7 (Global Accelerator cũng là một cách khác). Không thể gắn Elastic IP vào ALB. Tự chạy NGINX trên EC2 tăng vận hành và tạo SPOF. IP của ALB thay đổi bất kỳ lúc nào nên cập nhật hằng tuần không đáng tin cậy.',
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
      'ALB hỗ trợ SNI: một listener HTTPS gắn nhiều certificate từ ACM và tự chọn certificate theo hostname client yêu cầu. Tạo 20 ALB tốn chi phí và vận hành. CLB không hỗ trợ SNI và không thể có nhiều listener cùng port 443. Terminate TLS trên từng instance làm tăng tải CPU và công quản lý certificate.',
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
      'Gateway Load Balancer hoạt động ở layer 3, dùng GENEVE để chuyển traffic qua fleet appliance bên thứ ba một cách trong suốt, có health check và scale. ALB chỉ xử lý HTTP/HTTPS. NLB cân bằng TCP/UDP nhưng không thiết kế để chèn appliance vào đường đi (bump-in-the-wire). Global Accelerator tối ưu đường mạng toàn cầu, không kiểm tra traffic.',
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
      'Deregistration delay (connection draining) cho phép request đang xử lý hoàn tất trước khi target bị gỡ; mặc định 300 giây, đặt được tới 3.600 giây, nên tăng lên hơn 10 phút. Cross-zone chỉ ảnh hưởng phân bổ tải. Sticky session không ngăn instance bị gỡ. Giảm health check interval không liên quan đến scale-in.',
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
      'NLB hoạt động ở layer 4, hỗ trợ UDP, độ trễ cực thấp và xử lý hàng triệu request mỗi giây. ALB chỉ hỗ trợ HTTP/HTTPS/gRPC. CLB là legacy và không hỗ trợ UDP. GWLB dùng cho appliance bảo mật, không phải cân bằng tải ứng dụng game.',
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
      'AWS WAF gắn vào ALB với managed rule chặn SQL injection và XSS. Security group của EC2 tham chiếu security group của ALB đảm bảo chỉ ALB gửi được traffic tới. Shield Advanced chủ yếu chống DDoS, không thay WAF. Network ACL dùng CIDR, không dùng DNS name. Cross-zone load balancing không liên quan tới bảo mật.',
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
      'Mặc định ASG chỉ dùng EC2 status check nên không biết ứng dụng treo. Bật ELB health check thì instance bị ALB đánh dấu unhealthy sẽ bị ASG terminate và thay thế. Detailed monitoring chỉ tăng tần suất metric. Thay instance theo lịch không xử lý đúng nguyên nhân. Alarm CPU không phản ánh tình trạng ứng dụng treo.',
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
      'Scheduled scaling tăng capacity trước giờ cao điểm đã biết, còn target tracking xử lý biến động không đoán trước; kết hợp hai policy là phù hợp (predictive scaling cũng là lựa chọn hợp lý cho mẫu tải lặp lại). Simple scaling phản ứng sau khi tải đã tăng và bị cooldown chặn. Tăng max capacity không làm instance được launch sớm hơn. Scale thủ công tốn vận hành.',
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
      'AWS khuyến nghị tính backlog per instance (số message visible chia số instance InService) và dùng target tracking với giá trị mục tiêu = độ trễ chấp nhận được / thời gian xử lý mỗi message. CPU không phản ánh độ dài hàng đợi. Step scaling với một bước lớn dễ scale quá đà hoặc chậm. Scheduled scaling không phản ứng với tải thực tế.',
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
      'Lifecycle hook Terminating:Wait tạm dừng instance trước khi bị xoá để chạy script (qua EventBridge/Lambda hoặc SSM) đẩy log lên S3, rồi gọi complete-lifecycle-action. Termination protection không ngăn ASG scale in. Cooldown chỉ trì hoãn hoạt động scale tiếp theo. User data chỉ chạy khi khởi động, không chạy lúc terminate.',
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
      'Warm pool giữ sẵn instance đã khởi tạo; ở trạng thái Stopped chỉ trả phí EBS, khi scale out instance chuyển sang InService nhanh hơn nhiều. Tăng grace period chỉ hoãn health check. Instance lớn hơn không chắc rút ngắn thời gian load dữ liệu. Luôn chạy ở max capacity rất tốn kém.',
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
      'Target tracking tự tạo và quản lý CloudWatch alarm, tự điều chỉnh capacity để giữ metric quanh giá trị mục tiêu, nên ít vận hành nhất. Simple và step scaling yêu cầu tự tạo alarm và cấu hình bước. Scheduled scaling không phản ứng theo CPU thực tế.',
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
      'Instance refresh thay thế dần instance theo launch template mới, tôn trọng minimum healthy percentage, không cần thao tác thủ công. Terminate thủ công từng instance tốn công và dễ sai. Tạo ASG mới và chuyển target group là blue/green thủ công, nhiều vận hành hơn. Detach/attach instance không tự cập nhật AMI.',
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
      'SQS lưu message bền vững (tới 14 ngày), hấp thụ spike và cho backend xử lý theo tốc độ riêng; đây là mẫu decoupling chuẩn. Scale up không đảm bảo hết mất đơn khi tải vượt quá. SNS đẩy (push) tới HTTP endpoint, backend quá tải vẫn có thể làm lỗi sau khi hết retry. ALB chỉ phân tải, không đệm request.',
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
      'SQS FIFO đảm bảo thứ tự trong từng message group (đặt group ID = account ID để vẫn xử lý song song giữa các tài khoản) và exactly-once processing nhờ deduplication. SQS standard có thể giao trùng và sai thứ tự. SNS standard không đảm bảo thứ tự. Firehose dùng để nạp dữ liệu vào đích lưu trữ, không phải xử lý giao dịch theo thứ tự.',
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
      'Fan-out SNS tới nhiều SQS: mỗi hệ thống có queue riêng, nhận bản sao đầy đủ, xử lý và retry độc lập. Một SQS queue dùng chung khiến mỗi message chỉ được một consumer xử lý. Liệt kê S3 bucket định kỳ không hiệu quả và dễ bỏ sót. Gọi Lambda đồng bộ làm các hệ thống bị coupling chặt với order service.',
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
      'Amazon MQ là managed broker cho ActiveMQ và RabbitMQ, hỗ trợ JMS, AMQP, MQTT, STOMP, OpenWire nên migrate gần như không sửa code. SQS, Kinesis và EventBridge dùng API riêng của AWS, phải viết lại phần messaging.',
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
      'Visibility timeout mặc định 30 giây; nếu xử lý lâu hơn, message hiện lại và consumer khác nhận nó. Tăng visibility timeout lớn hơn thời gian xử lý tối đa (hoặc gọi ChangeMessageVisibility) sẽ khắc phục. Long polling chỉ giảm số lần nhận rỗng. Delay queue trì hoãn trước khi message hiển thị lần đầu, không giúp gì sau khi đã nhận. Retention không liên quan đến xử lý trùng.',
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
      'Kinesis Data Streams cho nhiều consumer đọc cùng dữ liệu, xử lý real-time và replay trong thời gian retention (mặc định 24 giờ, tăng được tới 365 ngày). SQS xoá message sau khi xử lý và không có replay. SNS không lưu message. Amazon MQ là broker cho ứng dụng truyền thống, không thiết kế cho clickstream và replay.',
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
      'DLQ với maxReceiveCount tách các message lỗi nhiều lần ra để phân tích. Long polling (WaitTimeSeconds tới 20) giảm số lần ReceiveMessage trả về rỗng, giảm chi phí. Chuyển sang FIFO không giải quyết message lỗi. Retention 1 phút làm mất dữ liệu hợp lệ. Delivery delay chỉ làm chậm toàn bộ message.',
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
      'Fargate là compute serverless cho container, không giới hạn 15 phút như Lambda; EventBridge Scheduler kích hoạt theo lịch. Lambda tối đa 15 phút. Lambda@Edge dùng cho CloudFront, thời gian chạy còn ngắn hơn. Step Functions Express tối đa 5 phút và một task Lambda vẫn bị giới hạn 15 phút.',
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
      'RDS Proxy gom và tái sử dụng kết nối database cho các Lambda đồng thời. Reserved concurrency giới hạn số execution đồng thời, bảo vệ database phía sau. Tăng timeout không giảm số kết nối. Đưa Lambda ra khỏi VPC khiến nó không truy cập được RDS private. Caching không áp dụng cho request ghi (POST).',
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
      'Usage plan + API key trong API Gateway REST API cho phép đặt throttle (rate, burst) và quota theo từng khách hàng/gói. Reserved concurrency áp dụng cho cả function, không phân biệt khách hàng. WAF rate-based rule chặn theo IP, không gắn với gói thuê bao. Caching không giới hạn request.',
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
      'Step Functions Standard chạy tới 1 năm, exactly-once, lưu lịch sử thực thi để audit; callback với task token cho phép chờ phê duyệt thủ công. Express tối đa 5 phút. Chuỗi Lambda gọi nhau khó theo dõi, khó xử lý lỗi và không có lịch sử tập trung. SQS FIFO giữa các bước không cung cấp orchestration hay audit.',
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
      'CloudFront Functions chạy JavaScript nhẹ tại edge ở viewer request/response, thời gian dưới 1 ms, scale cực lớn và rẻ hơn Lambda@Edge; phù hợp rewrite URL và thêm header. Lambda@Edge dùng cho logic phức tạp hơn và đắt hơn. Xử lý ở origin bằng ALB/Lambda hoặc API Gateway làm tăng độ trễ và chi phí.',
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
      'Lambda gắn vào VPC không có public IP; muốn ra internet phải đi qua NAT gateway trong public subnet. Không gắn Elastic IP trực tiếp cho Lambda. Đặt Lambda vào public subnet cũng không có internet vì ENI của Lambda không có public IP. Gateway endpoint chỉ hỗ trợ S3 và DynamoDB, không dùng cho API bên thứ ba.',
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
      'Alias record dùng được ở zone apex, trỏ tới ALB, tự cập nhật khi IP thay đổi và không tính phí truy vấn. CNAME không được phép ở zone apex. IP của ALB thay đổi nên A record cố định IP sẽ hỏng. MX dùng cho mail server.',
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
      'Latency-based routing trả Region có độ trễ thấp nhất; gắn health check (hoặc Evaluate Target Health) để loại bỏ Region unhealthy. Geolocation dựa trên vị trí người dùng, không phải độ trễ. Simple routing không hỗ trợ health check. Weighted không tối ưu độ trễ và không có health check thì không failover.',
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
      'Geolocation route theo vị trí người dùng (quốc gia), phù hợp ràng buộc bản quyền/pháp lý; record Default phục vụ các quốc gia còn lại. Latency có thể đưa người Đức sang Region khác nếu độ trễ thấp hơn. Geoproximity dựa trên khoảng cách và bias, không đảm bảo theo ranh giới quốc gia. Weighted chia theo tỷ lệ, không theo vị trí.',
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
      'Weighted routing chia traffic theo trọng số (ví dụ 95/5) và có thể thay đổi dần, phù hợp canary. Failover chỉ có primary/secondary. Multivalue trả nhiều record ngẫu nhiên, không kiểm soát tỷ lệ. IP-based route theo CIDR của client.',
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
      'Outbound endpoint + forwarding rule cho phép truy vấn từ VPC tới domain on-premises được chuyển tới DNS server on-premises. Inbound endpoint dùng cho chiều ngược lại (on-premises phân giải tên trong AWS). Public hosted zone làm lộ tên nội bộ và không chứa bản ghi on-premises. Resolver ở VPC +2 không truy cập được từ bên ngoài VPC.',
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
      'Global Accelerator cung cấp 2 anycast IP tĩnh, hỗ trợ UDP, đi qua mạng backbone AWS và failover nhanh không phụ thuộc DNS cache. Các giải pháp Route 53 vẫn phụ thuộc TTL và cache phía client. CloudFront dành cho HTTP/HTTPS, không hỗ trợ UDP cho game.',
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
      'RPO 24 giờ và RTO 12 giờ đủ rộng để dùng backup & restore: copy backup sang Region khác, khi sự cố dựng lại bằng CloudFormation và restore. Đây là chiến lược rẻ nhất. Active/active, warm standby, pilot light đều đạt yêu cầu nhưng tốn chi phí hơn.',
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
      'Warm standby chạy liên tục bản thu nhỏ của toàn bộ stack với dữ liệu replicate liên tục, khi sự cố chỉ cần scale lên và chuyển DNS, đáp ứng RTO 10 phút. Backup & restore không đạt RPO vài giây. Pilot light phải khởi chạy app server nên RTO thường dài hơn và rủi ro hơn. Active/active full capacity đắt hơn mức cần thiết.',
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
      'AWS Elastic Disaster Recovery replicate liên tục ở mức block vào staging area chi phí thấp, RPO tính bằng giây và RTO tính bằng phút, chỉ launch instance đầy đủ khi failover hoặc drill. Application Migration Service dùng cho migration, không phải DR liên tục. Backup hằng ngày vào Deep Archive có RPO 24 giờ và restore mất nhiều giờ. Chạy đủ 200 server liên tục rất tốn kém.',
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
      'Đây là pilot light: database replicate liên tục bằng cross-Region read replica (promote khi sự cố), còn app server chỉ có AMI và launch template/ASG với capacity 0 sẵn sàng scale. ASG full-size phục vụ 50% traffic là active/active. Multi-AZ chỉ chịu lỗi AZ trong cùng Region. Dump trên EBS ở us-east-1 sẽ mất khi Region đó lỗi.',
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
      'Active/active: mọi Region cùng phục vụ (latency routing tới Region gần nhất), DynamoDB global tables cho ghi multi-Region với replication thường dưới 1 giây, RTO gần 0. Pilot light và backup & restore có RTO dài. Warm standby với database chỉ ở một Region không chịu được lỗi Region đó.',
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
      'Data Lifecycle Manager (hoặc AWS Backup) tự động tạo snapshot theo lịch và cross-Region copy, mã hoá lại bằng KMS key ở Region đích, không cần quản lý server. Cron job trên EC2 tăng vận hành và là SPOF. EBS snapshot lưu ở S3 do AWS quản lý, người dùng không truy cập bucket để bật CRR. Multi-Attach chỉ trong cùng AZ.',
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
      'AWS Backup quản lý tập trung qua Organizations, hỗ trợ nhiều dịch vụ, cross-account copy; Vault Lock compliance mode làm backup bất biến, kể cả root user cũng không xoá được. Lambda tự viết tốn vận hành và không bất biến. RDS backup và DynamoDB PITR không tập trung, không cross-account, không chống xoá. DLM chỉ cho EBS snapshot/AMI và không có compliance lock như mô tả.',
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
      'Aurora Global Database replicate ở tầng storage tới secondary Region với độ trễ thường dưới 1 giây, cho đọc tại chỗ và failover sang Region khác với RPO khoảng 1 giây, RTO dưới 1 phút. Aurora Replicas cùng Region không bảo vệ khỏi lỗi Region. Snapshot hằng giờ có RPO 1 giờ. DMS tăng vận hành và không đạt RTO như yêu cầu.',
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
      'PITR dùng automated backup + transaction log để khôi phục tới thời điểm bất kỳ trong retention, luôn tạo DB instance mới với endpoint mới. Manual snapshot có thể cũ hơn nhiều và restore cũng không ghi đè instance hiện có. Standby Multi-AZ replicate đồng bộ nên cũng đã xoá dữ liệu. Recycle Bin áp dụng cho EBS snapshot và AMI, không khôi phục dòng dữ liệu RDS.',
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
      'CRR yêu cầu versioning ở cả hai bucket; Replication Time Control có SLA replicate 99,99% object trong 15 phút kèm metric và thông báo khi chậm. SRR chỉ trong cùng Region. DataSync theo lịch không có SLA 15 phút cho từng object. Lifecycle rule chỉ chuyển storage class hoặc xoá, không copy sang bucket khác.',
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
      'Fast Snapshot Restore làm volume tạo từ snapshot được khởi tạo đầy đủ ngay, không có độ trễ khi đọc block lần đầu; bật theo từng AZ. Snapshot Archive rẻ hơn nhưng restore mất 24–72 giờ. Multi-Attach không liên quan đến hiệu năng khởi tạo. Recycle Bin dùng để khôi phục snapshot bị xoá nhầm.',
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
      'Versioning giữ mọi phiên bản nên khôi phục được khi ghi đè hoặc xoá nhầm, đồng thời là điều kiện bắt buộc của replication. CRR replicate object mới sang Region khác, còn S3 Batch Replication xử lý object đã tồn tại trước đó. Transfer Acceleration chỉ tăng tốc upload. Xoá noncurrent version sau 1 ngày làm giảm khả năng khôi phục. Intelligent-Tiering chỉ tối ưu chi phí lưu trữ.',
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
      'Change set cho xem trước tài nguyên nào sẽ được thêm, sửa hay bị replace trước khi thực thi; nếu thấy database bị replace thì không execute. Update trực tiếp chỉ rollback khi lỗi, replace thành công thì dữ liệu đã mất. Drift detection so sánh tài nguyên thực tế với template hiện tại, không cho xem trước thay đổi của template mới. Termination protection chỉ chặn xoá stack, không chặn update.',
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
      'StackSets triển khai một template tới nhiều tài khoản và nhiều Region bằng một thao tác; với service-managed permissions (Organizations) và automatic deployment, tài khoản mới vào OU được deploy tự động. Nested stacks chỉ tái sử dụng template trong một stack ở một tài khoản. Script tự viết tốn công vận hành và không tự xử lý tài khoản mới. Chia sẻ template rồi nhờ chủ tài khoản deploy là thủ công, không đảm bảo nhất quán.',
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
      'DeletionPolicy: Snapshot khiến CloudFormation tạo snapshot cuối của DB trước khi xoá tài nguyên, hoàn toàn tự động. Termination protection chặn việc xoá stack chứ không tạo backup. Stack policy chỉ áp dụng khi update stack, không áp dụng khi xoá stack. Automated backup của RDS bị xoá cùng DB instance (trừ khi chọn giữ lại), nên không đảm bảo yêu cầu.',
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
      'Immutable deploy bản mới lên instance mới trong một ASG tạm; instance cũ không bị đụng tới, nếu bản mới lỗi chỉ cần terminate instance mới nên rollback nhanh nhất. All at once gây downtime. Rolling giảm capacity trong lúc deploy. Rolling with additional batch giữ đủ capacity nhưng cập nhật dần instance hiện có, rollback phải deploy lại bản cũ.',
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
      'Systems Manager quản lý cả EC2 và server on-premises (qua hybrid activation) có SSM Agent; Patch Manager áp patch baseline trong Maintenance Window và báo cáo compliance. Lambda SSH vào từng server tốn công, cần mở port và quản lý key. Inspector chỉ quét lỗ hổng, không cài patch. Config remediation dựng lại server từ AMI không áp dụng được cho server on-premises và rất phức tạp.',
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
      'EC2 không gửi metric memory mặc định; CloudWatch agent thu memory và publish thành metric, sau đó CloudWatch alarm với action SNS gửi thông báo khi vượt 85%. Detailed monitoring chỉ tăng tần suất metric có sẵn lên 1 phút, không thêm metric memory. X-Ray trace request, không đo memory của OS. CloudTrail ghi API call, không phải metric hiệu năng.',
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
      'X-Ray theo dõi một request đi qua API Gateway, Lambda tới DynamoDB, hiển thị service map và thời gian từng đoạn nên chỉ ra service gây chậm. CloudTrail data events ghi ai gọi API, không đo độ trễ từng bước. Metric filter đếm lỗi nhưng request chậm chưa chắc có lỗi. Trusted Advisor đưa khuyến nghị best practice chung, không trace request.',
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
      'Service Catalog cho admin publish portfolio sản phẩm đã duyệt; launch constraint chỉ định IAM role dùng để tạo tài nguyên, nên developer tự launch mà không cần quyền trực tiếp trên dịch vụ bên dưới. AdministratorAccess + Config chỉ phát hiện sau khi sai, vi phạm least privilege. Deploy template bằng credentials riêng đòi developer có quyền rộng và có thể sửa template. IAM user dùng chung vi phạm best practice và không giới hạn template.',
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
      'Partner event source đẩy sự kiện từ SaaS thẳng vào partner event bus; rule với event pattern lọc ticket ưu tiên cao rồi gọi Lambda, không cần viết code nhận webhook hay poll. API Gateway + webhook phải tự xây và bảo mật endpoint. AppFlow theo giờ không phải gần real-time. Poll mỗi phút tốn chi phí, tốn code và vẫn có độ trễ.',
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
      'Mẫu chuẩn cross-account của EventBridge: rule ở tài khoản nguồn gửi sự kiện tới event bus trung tâm; bus trung tâm cần resource-based policy cho phép các tài khoản (hoặc cả organization) PutEvents, rồi rule ở đó gọi Lambda. Nhiều SNS topic tạo nhiều điểm quản lý và phải xử lý quyền cross-account cho từng topic. CloudTrail log trên S3 có độ trễ và không phải cơ chế event-driven. Pipes nối source như SQS/Kinesis tới target, không nhận tài khoản làm source.',
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
      'Archive lưu sự kiện của event bus theo retention; replay phát lại sự kiện trong khoảng thời gian chọn để consumer đã sửa xử lý lại. DLQ chỉ chứa sự kiện gửi tới target thất bại, còn các sự kiện này đã gửi thành công. Log + script tự viết tốn công và dễ sai. Retry policy chỉ áp dụng khi gửi lỗi (tối đa 24 giờ), không giúp xử lý lại sự kiện đã giao thành công.',
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
      'EventBridge Pipes nối point-to-point source → filter → enrichment → target: SQS làm source, filter chỉ giữ status NEW, enrichment gọi API (API destination, API Gateway hoặc Lambda), rồi khởi chạy Step Functions, gần như không cần code glue. Lambda tự viết làm được nhưng nhiều code hơn. Step Functions không subscribe trực tiếp vào SQS queue. SNS filter áp dụng cho subscription của topic, không lọc message trong SQS queue.',
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
      'Distributed Map đọc item trực tiếp từ S3 và chạy tới 10.000 child execution song song, theo dõi item lỗi và có thể đặt ngưỡng lỗi chấp nhận, phù hợp hàng triệu object. Inline Map giới hạn concurrency (tối đa 40) và kích thước input của execution không chứa nổi 5 triệu key. Một Lambda lặp tuần tự bị giới hạn 15 phút. SQS FIFO với một consumer không song song.',
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
      'AppFlow là dịch vụ không cần code để chuyển dữ liệu giữa SaaS như Salesforce và AWS (S3, Redshift), chạy theo lịch, có filter, mapping và mask field. DataSync chuyển dữ liệu từ storage (NFS, SMB, HDFS, object storage), không gọi API Salesforce. Firehose nhận stream do producer gửi vào, không tự kéo dữ liệu từ Salesforce. Transfer Family là SFTP/FTPS/FTP endpoint cho file.',
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
      'IoT Core là MQTT broker managed, xác thực thiết bị bằng X.509; rules engine dùng câu lệnh kiểu SQL lọc reading vượt ngưỡng ghi vào DynamoDB và gửi toàn bộ qua Firehose vào S3, không cần server. MQTT broker trên EC2 phải tự vận hành. Amazon MQ chạy trên broker instance, không serverless, không có rules engine và vẫn cần code consumer. Sensor thường dùng MQTT, gọi SQS qua HTTP cần ký request SigV4 và tự viết logic định tuyến.',
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
      'Retry với BackoffRate lớn hơn 1 thực hiện exponential backoff cho lỗi tạm thời; Catch chuyển tới compensating state huỷ giữ chỗ khi hết retry, đúng pattern saga. Express không làm retry nhanh hơn và không phải yêu cầu. Tăng timeout Lambda không giải quyết lỗi tạm thời hay hoàn tác. State machine không có DLQ SQS kiểu này; xử lý lỗi trong workflow dùng Retry/Catch.',
  },
];
