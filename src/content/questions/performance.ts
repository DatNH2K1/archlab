import type { Question } from '@/content/types';

export const performanceQuestions: Question[] = [
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
      'Cluster placement group đặt các instance sát nhau trong 1 AZ để có latency thấp nhất và băng thông cao nhất; EFA cung cấp OS-bypass cho ứng dụng MPI, đúng với HPC tightly coupled. Spread placement group trải instance qua rack/AZ khác nhau nên tăng latency và tối đa 7 instance mỗi AZ. Partition placement group dành cho workload phân tán rack-aware (Hadoop, Cassandra), thêm ENI không tăng băng thông. NLB và Auto Scaling đa AZ không phục vụ giao tiếp node-to-node trong HPC.',
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
      'Spread placement group đặt mỗi instance trên phần cứng (rack) riêng, phù hợp số lượng nhỏ instance quan trọng (tối đa 7 instance đang chạy mỗi AZ). Cluster gom instance gần nhau nên một lỗi phần cứng có thể ảnh hưởng nhiều instance. Partition với một partition nghĩa là tất cả instance chung một nhóm rack. Dedicated Host phục vụ yêu cầu license/compliance, host affinity còn gắn instance vào cùng host, ngược với yêu cầu.',
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
      'EC2 Hibernate lưu nội dung RAM xuống EBS root (bắt buộc mã hóa) và khôi phục khi start, nên ứng dụng không phải load lại dữ liệu vào memory. Instance store mất dữ liệu khi stop. AMI chỉ chứa dữ liệu đĩa, không chứa trạng thái RAM nên vẫn phải load lại. Instance lớn hơn tốn chi phí và vẫn phải load lại dữ liệu.',
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
      'Golden AMI cài sẵn phần mềm giúp instance khởi động nhanh; EC2 Image Builder tự động build, test, patch AMI theo lịch nên ít vận hành nhất. Tăng grace period chỉ tránh instance bị đánh dấu unhealthy, không làm khởi động nhanh hơn. Tải script từ S3 không giảm thời gian cài đặt. Chạy cố định theo peak tốn chi phí và không xử lý yêu cầu patch.',
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
      'Storage optimized (I family) với NVMe instance store cho IOPS ngẫu nhiên rất cao, latency thấp và không tốn phí EBS; vì Cassandra đã replicate dữ liệu nên việc instance store là ephemeral chấp nhận được. Partition placement group đặt mỗi partition trên nhóm rack riêng, giúp Cassandra nhận biết topology và giảm lỗi đồng thời. io2 đắt hơn nhiều cho cùng mức IOPS. Cluster placement group tăng rủi ro lỗi rack. EFS là file system qua mạng, không phù hợp cho data file Cassandra cần latency thấp.',
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
      'ECS trên Fargate là serverless: không quản lý EC2, AWS lo hạ tầng; ECS đơn giản hơn EKS khi không cần Kubernetes. EKS self-managed node group phải quản lý node và học thêm Kubernetes. Docker trên EC2 tự quản lý là overhead cao nhất. ECS EC2 launch type vẫn phải patch và quản lý EC2 dù capacity provider giúp scale.',
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
      'Fargate chạy container không giới hạn thời gian, không cần quản lý server; EventBridge Scheduler/rule kích hoạt task hằng đêm. Lambda giới hạn tối đa 15 phút nên không thể đặt 60 phút. Dùng EC2 để gọi Lambda tuần tự phức tạp và vẫn có EC2 cần quản lý. EC2 với cron và tắt thủ công tốn công vận hành.',
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
      'EKS là Kubernetes chuẩn với control plane được AWS quản lý, giữ nguyên Helm chart và operator; managed node group giảm công quản lý node. ECS và Elastic Beanstalk yêu cầu chuyển đổi manifest. Viết lại sang Lambda là thay đổi lớn, trái yêu cầu không rewrite.',
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
      'Provisioned concurrency giữ sẵn môi trường đã khởi tạo nên loại bỏ cold start; tải dự đoán được nên có thể lên lịch bằng Application Auto Scaling. Reserved concurrency chỉ giới hạn/đảm bảo số concurrency, không khởi tạo trước môi trường. Tăng timeout và retry không giảm latency. Đưa function vào VPC không giảm cold start, còn có thể thêm phức tạp.',
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
      'App Runner nhận source code hoặc container image, tự build, deploy, cấp HTTPS endpoint, load balancing và auto scaling, không cần kiến thức hạ tầng. EKS và EC2 + ALB đòi hỏi quản lý nhiều thành phần. AWS Batch dành cho batch job, không phải API phục vụ request.',
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
      'io2 Block Express hỗ trợ tới 256,000 IOPS, latency dưới mili giây, durability 99.999%, phù hợp database quan trọng cần 120,000 IOPS. gp3 không đạt mức IOPS này trên một volume. st1 là HDD cho đọc tuần tự, IOPS thấp. io1 tối đa 64,000 IOPS và durability thấp hơn io2.',
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
      'gp3 cho phép chỉnh IOPS độc lập với dung lượng (baseline 3,000, tăng tới 16,000) và rẻ hơn gp2, nên đổi sang gp3 và đặt 6,000 IOPS là rẻ nhất (có thể làm online bằng Elastic Volumes). gp2 cần 2,000 GiB (3 IOPS/GiB) để đạt 6,000 IOPS, trả tiền cho dung lượng không dùng. io2 đắt hơn nhiều cho mức IOPS này. RAID 0 bốn volume cũng phải trả cho 2,000 GiB và phức tạp hơn.',
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
      'EFS là NFS managed cho Linux, nhiều instance ở nhiều AZ mount đồng thời; Elastic throughput tự scale theo tải khó dự đoán và trả theo lượng dùng. EBS Multi-Attach chỉ trong 1 AZ và cần file system cluster-aware. FSx for Windows dùng SMB, phù hợp Windows chứ không phải lựa chọn tự nhiên cho Linux. Đồng bộ S3 bằng script tốn công và không đảm bảo ngữ nghĩa file system.',
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
      'FSx for Windows File Server hỗ trợ SMB, NTFS ACL, tích hợp Active Directory và có Multi-AZ để chịu lỗi AZ. EFS không hỗ trợ Windows/SMB và One Zone không chịu lỗi AZ. S3 File Gateway trên một EC2 tạo điểm lỗi đơn và không phải file server Windows thực thụ. FSx for Lustre dành cho HPC trên Linux.',
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
      'FSx for Lustre cho throughput hàng trăm GB/s; tích hợp S3 cho phép lazy load dữ liệu và export kết quả về S3; deployment scratch rẻ, phù hợp xử lý ngắn hạn không cần replicate. EFS không đạt mức throughput này và tốn chi phí copy. Copy dataset vào nhiều io2 rất đắt và chậm. SnapMirror dùng giữa hệ thống ONTAP, không replicate từ S3.',
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
      'EBS Multi-Attach chỉ hỗ trợ io1/io2 và chỉ cho instance Nitro trong cùng AZ với volume (tối đa 16 instance). gp3 không hỗ trợ Multi-Attach. EFS là file storage, không phải shared block storage như yêu cầu. st1 không hỗ trợ Multi-Attach và EBS không thể chia sẻ qua nhiều AZ.',
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
      'S3 hỗ trợ ít nhất 5,500 GET/s mỗi prefix; chia object qua nhiều prefix giúp S3 scale song song, đạt 20,000 GET/s. Transfer Acceleration tối ưu khoảng cách địa lý, không tăng request rate mỗi prefix. Versioning không tăng throughput. Standard-IA còn tính phí truy xuất và không tăng hiệu năng.',
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
      'Transfer Acceleration đưa upload vào edge location gần người dùng rồi đi trên backbone AWS; multipart upload chia file thành phần upload song song, phần lỗi chỉ cần gửi lại (và bắt buộc với file trên 5 GB). CloudFront không cache PUT. Byte-range fetch và S3 Select dùng cho đọc dữ liệu. Single PUT không thể vượt 5 GB, và CRR không giúp upload ban đầu.',
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
      'S3 Express One Zone cho latency một chữ số mili giây, request rate rất cao, đặt cùng AZ với compute; dữ liệu tạo lại được nên chấp nhận lưu ở 1 AZ. Transfer Acceleration chỉ tối ưu truyền đường dài. Intelligent-Tiering tối ưu chi phí, không phải latency. One Zone-IA dành cho dữ liệu ít truy cập, có phí truy xuất và không nhanh hơn Standard.',
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
      'S3 Event Notification gọi Lambda ngay khi object được tạo, serverless và xử lý trong vài giây. Cron trên EC2 phải quản lý server và LIST liên tục kém hiệu quả. Lifecycle rule chỉ chuyển storage class hoặc xóa object, không xử lý ảnh. Batch mỗi giờ không đáp ứng yêu cầu vài giây.',
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
      'CloudFront phân phối nội dung toàn cầu qua HTTPS với chứng chỉ ACM; OAC cho phép bucket giữ private và chỉ CloudFront đọc được. Bucket policy public vi phạm yêu cầu không public, và website endpoint không hỗ trợ HTTPS. ALB không dùng S3 bucket làm target. Transfer Acceleration dành cho upload/download đường dài, không phục vụ website HTTPS.',
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
      'Read replica (replicate bất đồng bộ) nhận truy vấn đọc, giảm tải cho primary. Standby của Multi-AZ instance deployment không phục vụ đọc, chỉ dùng cho failover. Storage autoscaling chỉ tăng dung lượng, không giảm CPU. Backup không phải nơi chạy truy vấn trực tiếp.',
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
      'RDS Proxy gom và tái sử dụng kết nối (connection pooling), xử lý tốt mô hình nhiều kết nối ngắn từ Lambda; chỉ cần đổi endpoint. Tăng instance tốn kém và vẫn có thể cạn kết nối khi spike. Reader endpoint không xử lý được truy vấn ghi và vẫn mở nhiều kết nối. Reserved concurrency 1 làm application chậm nghiêm trọng.',
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
      'Custom endpoint cho phép nhóm một tập instance cụ thể, tách workload analytics khỏi workload ứng dụng. Cluster endpoint trỏ tới writer, chạy analytics trên đó làm chậm ghi. Tạo cluster thứ hai tốn chi phí và vận hành. Reader endpoint cân bằng qua tất cả replica, failover priority không điều khiển việc phân phối truy vấn.',
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
      'Aurora Serverless v2 tự scale compute (ACU) gần như tức thời và chi tiết theo tải, phù hợp workload thất thường. Storage autoscaling chỉ tăng dung lượng, không tăng compute. Đổi instance class theo lịch không xử lý được burst không dự đoán và gây gián đoạn. Redshift không tương thích MySQL và là data warehouse.',
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
      'Aurora Global Database replicate storage-level sang Region khác thường dưới 1 giây, cho phép đọc latency thấp ở Region phụ và DR với RPO khoảng 1 giây, RTO dưới 1 phút. Logical replication tự quản lý trên EC2 tốn công vận hành. Replica trong cùng Region không giảm latency cho người dùng ở xa và không DR liên Region. Snapshot hằng giờ có RPO tới 1 giờ.',
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
      'Babelfish cho phép Aurora PostgreSQL hiểu T-SQL và giao thức SQL Server, giảm thay đổi code. Aurora I/O-Optimized không tính phí I/O, tiết kiệm khi I/O chiếm hơn khoảng 25% chi phí. Aurora MySQL không hỗ trợ T-SQL. Redshift là data warehouse, không phải đích OLTP cho app. Multi-AZ không ảnh hưởng phí I/O.',
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
      'DAX là cache in-memory tương thích API DynamoDB, giảm latency đọc từ mili giây xuống micro giây và chỉ cần đổi client/endpoint. On-demand giúp chịu tải nhưng latency vẫn ở mức mili giây. GSI phục vụ mẫu truy vấn mới, không giảm latency. ElastiCache cần viết lại logic cache trong code nên thay đổi nhiều hơn.',
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
      'Partition key chỉ có 3 giá trị nên ghi dồn vào vài partition (hot partition); dùng key có cardinality cao như order_id phân tán đều tải. Streams chỉ ghi lại thay đổi. LSI dùng cùng partition key nên không giải quyết, và chỉ tạo được khi tạo bảng. TTL xóa dữ liệu cũ, không phân tán ghi.',
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
      'GSI có thể tạo bất kỳ lúc nào với partition key khác bảng, cho phép query theo product_id hiệu quả. LSI chỉ tạo được lúc tạo bảng và vẫn phải dùng customer_id làm partition key. Scan đọc toàn bộ bảng, tốn RCU và chậm. Tạo bảng mới phức tạp và không cần thiết.',
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
      'ElastiCache Redis OSS/Valkey hỗ trợ replication, Multi-AZ, auto failover và latency dưới mili giây, phù hợp session store HA. Memcached không có replication nên mất session khi node lỗi. Sticky session vẫn mất session khi instance bị terminate và web tier không stateless. EBS gắn với từng instance, không chia sẻ được.',
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
      'Neptune là graph database, tối ưu cho truy vấn duyệt quan hệ nhiều cấp như phát hiện fraud ring, mạng xã hội. DynamoDB không hiệu quả khi duyệt quan hệ nhiều tầng. Timestream dành cho dữ liệu time series. Redshift phục vụ phân tích tổng hợp, không phải duyệt graph latency thấp.',
  },
  {
    id: 'perf-033',
    domain: 'performance',
    lesson: 'nosql-caching',
    stem: 'An application needs to perform 20 strongly consistent reads per second on a DynamoDB table using provisioned capacity. Each item is 6 KB. How many read capacity units (RCUs) must be provisioned?',
    options: ['20 RCUs', '30 RCUs', '40 RCUs', '60 RCUs'],
    answer: [2],
    explanation:
      '1 RCU = 1 strongly consistent read/giây cho item tới 4 KB. Item 6 KB làm tròn lên 8 KB nên cần 2 RCU mỗi lần đọc; 20 lần đọc x 2 = 40 RCU. 20 RCU là số cho item tới 4 KB. 30 RCU là tính theo tỷ lệ 6/4 mà không làm tròn lên. 60 RCU là cách tính sai (ví dụ nhân 3).',
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
      'Global Accelerator cung cấp 2 static anycast IP, hỗ trợ UDP, đưa traffic vào backbone AWS từ edge gần nhất và failover giữa Region trong vài giây nhờ health check, không phụ thuộc DNS cache. CloudFront không hỗ trợ UDP. Route 53 phụ thuộc DNS TTL/cache của client và không cho IP cố định. Elastic IP trên từng instance không HA và không tối ưu latency.',
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
      'CloudFront cache nội dung tĩnh tại edge gần người dùng, giảm latency và giảm tải cho ALB/EC2. Thêm EC2 giảm tải nhưng không giải quyết latency địa lý. Triển khai Region thứ hai tốn kém và weighted routing không dựa trên vị trí người dùng. Cross-zone load balancing không ảnh hưởng latency cho người dùng ở xa.',
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
      'CloudFront origin group hỗ trợ origin failover: khi primary trả mã lỗi đã cấu hình (5xx), CloudFront tự gửi request sang secondary origin; kết hợp S3 Cross-Region Replication để có dữ liệu ở bucket phụ. Route 53 failover với S3 REST endpoint không phải cách chuẩn. Global Accelerator không dùng CloudFront làm endpoint. Transfer Acceleration không cung cấp failover.',
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
      'Field-level encryption mã hóa các trường cụ thể trong POST tại edge bằng public key; dữ liệu vẫn mã hóa khi đi qua các tầng trung gian, chỉ dịch vụ có private key giải mã được. OAC giới hạn truy cập S3 origin. HTTPS chỉ bảo vệ trên đường truyền, web server vẫn thấy plaintext. Signed cookies kiểm soát quyền truy cập nội dung, không mã hóa dữ liệu.',
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
      'Cache key càng ít thành phần thì hit ratio càng cao. Cache policy chỉ giữ các giá trị làm thay đổi response; origin request policy gửi thêm cookie tới origin mà không đưa vào cache key. Invalidation làm giảm hit ratio và tốn phí. Tăng TTL không giúp khi mỗi request có cache key khác nhau. Global Accelerator không cache.',
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
      'Kinesis Data Streams cho phép nhiều consumer đọc cùng dữ liệu real-time và replay trong thời gian retention (tăng được tới 365 ngày). Firehose là near real-time, chỉ giao tới đích, không hỗ trợ nhiều consumer tùy biến hay replay. SQS xóa message sau khi xử lý, một message chỉ một consumer xử lý. SNS không lưu trữ để replay.',
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
      'Amazon Data Firehose fully managed, tự buffer, chuyển đổi định dạng sang Parquet/ORC (dùng schema trong Glue Data Catalog) và ghi vào S3; độ trễ vài phút chấp nhận được. Consumer tự viết trên EC2, cluster EMR, hay Lambda tự batch đều tăng công vận hành.',
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
      'Athena tính tiền theo dữ liệu quét. Parquet là định dạng cột (chỉ đọc cột cần) và nén tốt; partition theo ngày cho phép bỏ qua partition không liên quan. Glacier Instant Retrieval không giảm dữ liệu quét và có phí truy xuất. Tăng timeout không cải thiện hiệu năng. RDS không phù hợp để phân tích nhiều TB log.',
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
      'Lake Formation quản lý quyền tập trung trên Data Catalog, hỗ trợ fine-grained access tới cột, hàng, cell, áp dụng cho Athena, Redshift Spectrum, EMR. Copy dữ liệu theo team tốn công và trùng lặp. Bucket policy chỉ hoạt động ở mức object, không hiểu cột. Mã hóa bằng KMS không phải cơ chế phân quyền theo cột cho truy vấn.',
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
      'Redshift Spectrum truy vấn dữ liệu trực tiếp trên S3 qua external table và join được với bảng trong Redshift; Glue crawler tạo schema trong Data Catalog để làm external schema. COPY nghĩa là load vào cluster, trái yêu cầu. Kinesis là dịch vụ streaming, không dùng cho dữ liệu lịch sử. EMR HBase thêm hạ tầng không cần thiết và không join trực tiếp với Redshift.',
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
      'DataSync tự động truyền dữ liệu NFS/SMB tới EFS, S3, FSx, có kiểm tra toàn vẹn, giữ metadata, lập lịch, chạy qua Direct Connect. rsync và cron phải tự quản lý, tự kiểm tra lỗi. File Gateway rồi copy hai bước phức tạp. Snowball không phù hợp khi đã có Direct Connect và cần đồng bộ định kỳ tới lúc cutover.',
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
      'Chuyển engine khác loại (heterogeneous) cần SCT/DMS Schema Conversion để chuyển schema và code; DMS full load + CDC giữ nguồn online và đồng bộ liên tục, downtime chỉ lúc cutover. Data Pump không import được vào PostgreSQL. DMS không tự chuyển schema giữa engine khác nhau, và full load không có CDC gây downtime dài. Application Migration Service rehost server lên EC2, không chuyển sang Aurora.',
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
      'Tape Gateway giả lập thư viện tape (VTL qua iSCSI) nên phần mềm backup không đổi; virtual tape lưu trên S3 và có thể archive sang Glacier Flexible Retrieval/Deep Archive. File Gateway đòi đổi đích backup sang file share. DataSync không đọc tape vật lý. Volume Gateway là block storage, không phải giao diện tape.',
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
      'AWS Transfer Family cung cấp endpoint SFTP fully managed lưu thẳng vào S3, đối tác giữ nguyên client. SFTP trên EC2 phải tự quản lý, patch, HA. Presigned URL buộc đối tác đổi quy trình. File Gateway dùng NFS/SMB, không phải SFTP và không thiết kế để mở cho bên ngoài qua internet.',
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
      '1 Gbps khoảng 125 MB/s, tức khoảng 10.8 TB/ngày; dùng 80% còn khoảng 8.6 TB/ngày, nên 40 TB mất khoảng 5 ngày, kịp deadline 10 ngày. DataSync tự động, tối ưu băng thông và kiểm tra toàn vẹn. Direct Connect mới thường mất nhiều tuần để thiết lập. Script tự viết với single PUT bị giới hạn 5 GB mỗi object và tốn công. Chờ nâng cấp băng thông không đảm bảo deadline.',
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
      'Textract trích xuất text, form (key-value) và table từ tài liệu scan, là dịch vụ có sẵn nên không cần chuyên gia ML; S3 event + Lambda tạo pipeline serverless. Rekognition text detection chỉ phát hiện đoạn text ngắn trong ảnh, không hiểu cấu trúc form/table. SageMaker cần tự huấn luyện và vận hành endpoint, tốn công hơn nhiều. Comprehend phân tích text thuần, không đọc được PDF scan và không trích xuất table.',
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
      'Rekognition content moderation phát hiện nội dung không phù hợp (khiêu dâm, bạo lực...) trong ảnh và video qua API có sẵn, tự scale. Comprehend chỉ phân tích text. Textract trích xuất text từ tài liệu. Model tự huấn luyện trên SageMaker tốn nhiều công phát triển và vận hành, trái yêu cầu.',
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
      'Kendra là dịch vụ intelligent enterprise search: nhận câu hỏi ngôn ngữ tự nhiên và trả về câu trả lời từ tài liệu, có connector cho S3 và SharePoint. Comprehend phân tích sentiment/entity, không tìm kiếm tài liệu. Lex xây chatbot nhưng tự nó không index và tìm kiếm tài liệu. Athena truy vấn SQL trên dữ liệu có cấu trúc trong S3, không hiểu câu hỏi tự nhiên trên văn bản.',
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
      'Polly chuyển text sang giọng nói tự nhiên (neural voices), có thể lưu kết quả vào S3. Transcribe làm chiều ngược lại (speech sang text). Lex dùng để xây chatbot, không phải dịch vụ đọc bài viết. Tự host model trên EC2 tăng gánh nặng vận hành.',
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
      'Transcribe chuyển ghi âm thành text và có tính năng ẩn PII trong transcript; Comprehend phân tích sentiment (positive/negative/neutral/mixed) của transcript. Polly chuyển text sang speech, ngược chiều. Rekognition phân tích ảnh/video, không xử lý audio. Translate chỉ dịch ngôn ngữ, không phân tích sentiment.',
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
      'Bedrock cung cấp foundation model qua API serverless; Knowledge Bases thực hiện RAG trên tài liệu S3 nên câu trả lời dựa trên dữ liệu công ty, không cần quản lý hạ tầng hay huấn luyện model. Tự huấn luyện LLM trên SageMaker tốn kém và phức tạp. Comprehend custom classification chỉ phân loại text, không tạo câu trả lời. Tự host LLM trên EC2 phải quản lý hạ tầng.',
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
      'Personalize là dịch vụ recommendation được quản lý, nhận dữ liệu tương tác (xem, mua) và cập nhật gợi ý real-time, không cần kinh nghiệm ML. Kendra là tìm kiếm tài liệu. SageMaker AI làm được nhưng cần data scientist tự xây model. Comprehend phân tích text.',
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
      'SageMaker AI phủ toàn bộ vòng đời ML: notebook được quản lý, training job trên GPU đọc dữ liệu từ S3, và real-time endpoint cho inference latency thấp; hỗ trợ thuật toán riêng qua custom container/script. Rekognition Custom Labels chỉ dành cho nhãn ảnh. Bedrock dùng foundation model có sẵn, không phải để huấn luyện thuật toán riêng. Tự dựng trên EC2 tăng gánh nặng vận hành, không phải fully managed.',
  },
];
