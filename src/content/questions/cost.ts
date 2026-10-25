import type { Question } from '@/content/types';

export const costQuestions: Question[] = [
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
      'Compute Savings Plans áp dụng cho EC2 ở mọi family, Region, OS và cả Fargate, Lambda, nên phù hợp khi sẽ chuyển sang serverless hoặc đổi Region mà vẫn có giảm giá cam kết 3 năm. Standard RI gắn với family/Region và không áp dụng cho Fargate/Lambda. EC2 Instance Savings Plans chỉ áp dụng cho một family trong một Region. On-Demand đắt, còn Spot không phù hợp với web app chạy liên tục cần ổn định.',
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
      'Job có checkpoint, khởi động lại được và thời gian linh hoạt là trường hợp chuẩn cho Spot Instances (rẻ tới 90%); đa dạng instance type giúp giảm rủi ro bị thu hồi. On-Demand chạy được nhưng đắt hơn nhiều. Dedicated Instances đắt hơn và không cần thiết. Reserved Instances cần cam kết chạy liên tục, lãng phí cho job chỉ chạy ban đêm.',
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
      'Dedicated Hosts cho thấy socket và physical core, hỗ trợ BYOL cho license tính theo core/socket và theo dõi license. Dedicated Instances chạy trên phần cứng riêng nhưng không cho thấy socket/core nên không đáp ứng yêu cầu theo dõi license. Default tenancy dùng phần cứng chia sẻ. Spot với AMI license-included nghĩa là mua license mới từ AWS, không dùng license sẵn có, và có thể bị gián đoạn.',
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
      'On-Demand Capacity Reservation giữ capacity trong một AZ cụ thể, không cần cam kết thời hạn và có thể hủy sau sự kiện. Zonal RI có giữ capacity nhưng phải cam kết ít nhất 1 năm. Savings Plans chỉ giảm giá, không đảm bảo capacity. Spot không đảm bảo capacity và có thể bị thu hồi.',
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
      'Mixed instances policy cho phép đặt On-Demand base capacity (4 instance, được Savings Plan che phủ để giảm giá) và dùng Spot cho phần tăng tải, vừa ổn định vừa rẻ. Chỉ dùng Spot không đảm bảo baseline. Mua RI cho 20 instance lãng phí vì phần lớn thời gian chỉ cần 4. Dedicated Instances đắt hơn và không giúp tiết kiệm.',
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
      'Convertible RI cho phép đổi sang instance family, OS, tenancy khác (với giá trị bằng hoặc cao hơn). Standard RI, dù zonal hay regional, không đổi được instance family (regional chỉ linh hoạt về size và AZ). Capacity Reservation không phải cam kết giảm giá.',
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
      'AWS Compute Optimizer dùng ML trên metric CloudWatch để đề xuất right-size; metric bộ nhớ cần CloudWatch agent. Pricing Calculator chỉ ước tính giá, không phân tích utilization. Budgets chỉ theo dõi chi tiêu. Script tự viết tốn công vận hành và chỉ có CPU vì EC2 mặc định không gửi metric memory.',
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
      'Thông báo Spot interruption (trước 2 phút) có thể lấy qua instance metadata (spot/instance-action) và qua sự kiện EventBridge "EC2 Spot Instance Interruption Warning". Trusted Advisor, Cost Anomaly Detection và Budgets là công cụ chi phí/best practice, không phát tín hiệu thu hồi Spot.',
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
      'S3 Intelligent-Tiering tự động chuyển object giữa các tier theo mẫu truy cập, không có phí truy xuất, phù hợp với access pattern không đoán được. Standard-IA và Glacier Instant Retrieval có phí truy xuất, tốn kém với file truy cập thường xuyên. One Zone-IA có phí truy xuất và chỉ lưu ở 1 AZ.',
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
      'Glacier Instant Retrieval cho dữ liệu lưu trữ lâu, ít truy cập nhưng cần lấy trong mili giây, giá lưu rẻ hơn Standard-IA. Deep Archive cần tới 12–48 giờ, Flexible Retrieval cần phút đến giờ, không đáp ứng yêu cầu mili giây. One Zone-IA chỉ ở 1 AZ, rủi ro mất dữ liệu y tế quan trọng và đắt hơn Glacier IR khi lưu lâu.',
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
      'Dữ liệu ít truy cập và tạo lại được là trường hợp chuẩn cho One Zone-IA: rẻ hơn Standard-IA, truy cập mili giây, chấp nhận rủi ro mất 1 AZ. S3 Standard đắt hơn cho dữ liệu ít truy cập. Deep Archive và Flexible Retrieval không cho truy cập mili giây.',
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
      'Glacier Deep Archive là class rẻ nhất, phù hợp lưu trữ compliance 7–10 năm, truy xuất trong 12 giờ (Standard) hoặc 48 giờ (Bulk). Glacier Instant Retrieval và Standard-IA đắt hơn vì hỗ trợ truy cập mili giây không cần thiết. Intelligent-Tiering chỉ với tier Frequent/Infrequent không xuống được mức giá lưu trữ sâu như Deep Archive.',
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
      'Expedited retrieval của Glacier Flexible Retrieval trả dữ liệu trong khoảng 1–5 phút. Standard mất 3–5 giờ, Bulk mất 5–12 giờ. Deep Archive còn chậm hơn (trong 12–48 giờ) và không có Expedited.',
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
      'Lifecycle rule NoncurrentVersionExpiration và AbortIncompleteMultipartUpload tự động dọn version cũ và phần upload dở dang, không cần code. Tắt versioning không xóa version đã có và mất khả năng bảo vệ dữ liệu. Lambda tự viết tăng công vận hành. Intelligent-Tiering chỉ giảm giá lưu, không xóa version thừa hay multipart upload dở dang.',
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
      'Requester Pays khiến bên gửi request (phải là AWS principal đã xác thực) trả phí request và data transfer, chủ bucket chỉ trả phí lưu trữ. Transfer Acceleration tăng tốc nhưng tốn thêm phí cho chủ bucket. CloudFront với signed URL kiểm soát truy cập nhưng chủ vẫn trả phí egress. Truy cập anonymous không dùng được với Requester Pays và chủ bucket trả toàn bộ phí.',
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
      'S3 Storage Lens cung cấp dashboard cấp organization về usage, activity và khuyến nghị tối ưu chi phí. S3 Inventory xuất danh sách object kèm storage class hằng ngày/tuần. Trusted Advisor service limit checks chỉ liên quan quota. Transfer Acceleration tăng tốc upload. Object Lock dùng cho WORM/compliance, không phải phân tích chi phí.',
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
      'Chuyển dần theo mẫu truy cập: Standard 30 ngày (truy vấn thường xuyên), Standard-IA tới ngày 90 (thỉnh thoảng), Glacier Flexible Retrieval (lấy trong vài giờ) rồi expire sau 365 ngày. Giữ Standard cả năm đắt hơn. One Zone-IA sau 1 ngày vi phạm ràng buộc lifecycle (phải ở Standard ít nhất 30 ngày trước khi sang IA) và vẫn bị phí truy xuất khi truy vấn nhiều. Deep Archive sau 1 ngày khiến không truy vấn được trong 30 ngày đầu.',
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
      'AWS Budgets hỗ trợ alert theo chi phí dự báo và Budget actions tự động áp dụng IAM policy/SCP hoặc dừng EC2/RDS khi vượt ngưỡng, không cần code. Cost Explorer cần xem thủ công. Cost Anomaly Detection phát hiện bất thường, không theo ngưỡng cố định và không tự áp policy. CloudWatch billing alarm + Lambda chạy được nhưng phải tự viết, tốn công vận hành hơn.',
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
      'CUR 2.0 qua AWS Data Exports cung cấp dữ liệu billing chi tiết nhất (theo giờ, theo resource, có tag) vào S3, truy vấn bằng Athena và trực quan bằng QuickSight. Cost Explorer không cung cấp dữ liệu resource-level chi tiết cho SQL và tải thủ công tốn công. Trusted Advisor là kiểm tra best practice. Pricing Calculator chỉ ước tính.',
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
      'Tag chỉ xuất hiện trong Cost Explorer/CUR sau khi được activate làm cost allocation tag trong Billing console của management account (dữ liệu tính từ thời điểm activate). AWS Config kiểm tra tuân thủ tag nhưng không làm tag hiện trong báo cáo chi phí. Tạo lại resource không cần thiết. Budget không giúp nhóm chi phí theo tag khi tag chưa được activate.',
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
      'Cost Anomaly Detection dùng machine learning để phát hiện chi tiêu bất thường và phân tích nguyên nhân, không cần đặt ngưỡng, gửi alert qua SNS hoặc email. Budgets cần ngưỡng cố định. Trusted Advisor kiểm tra best practice, không theo dõi biến động chi phí. Compute Optimizer chỉ đề xuất right-size.',
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
      'Consolidated billing trong AWS Organizations gộp hóa đơn, gộp usage để đạt bậc giá thấp hơn và chia sẻ RI/Savings Plans giữa các account. Mua RI riêng từng account không chia sẻ được nếu không cùng organization. Billing Conductor tạo hóa đơn pro forma cho showback/chargeback, không thay thế consolidated billing. Control Tower dựng landing zone, không cần tạo lại account.',
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
      'Trusted Advisor có các check cost optimization như Elastic IP không gắn, load balancer nhàn rỗi, EBS ít dùng; gói Enterprise Support có đầy đủ check. Pricing Calculator chỉ ước tính. Inspector quét lỗ hổng bảo mật. CloudTrail ghi lại API call.',
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
      'Cost Explorer có báo cáo coverage (bao nhiêu usage được che phủ) và utilization (cam kết đã dùng bao nhiêu), cùng khuyến nghị mua Savings Plans dựa trên lịch sử usage. CloudWatch Logs Insights phân tích log ứng dụng. Config conformance packs kiểm tra tuân thủ cấu hình. Service Catalog quản lý sản phẩm IT được phê duyệt.',
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
      'AWS Billing Conductor tạo pro forma bill với billing groups và pricing rules tùy chỉnh, phù hợp cho reseller hoặc showback/chargeback, không ảnh hưởng hóa đơn thật. Cost Anomaly Detection phát hiện chi tiêu bất thường. Budgets theo dõi ngưỡng. Cost Explorer forecasting dự báo chi phí thực, không tạo hóa đơn với giá tùy chỉnh.',
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
      'Gateway VPC endpoint cho S3 miễn phí, traffic tới S3 đi qua endpoint thay vì NAT nên không còn phí xử lý NAT. Interface endpoint có phí theo giờ và theo GB nên không rẻ bằng. NAT instance tăng công vận hành và có giới hạn băng thông. Chuyển sang public subnet làm giảm bảo mật và phát sinh phí public IPv4.',
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
      'CloudFront cache nội dung tại edge, transfer từ S3 tới CloudFront miễn phí và giá egress của CloudFront thường thấp hơn egress trực tiếp từ S3, đồng thời giảm độ trễ. Transfer Acceleration tối ưu upload và tốn thêm phí. Global Accelerator không cache và có thêm phí. Cross-Region Replication tốn phí replication và lưu trữ nhiều bản.',
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
      'Instance Scheduler on AWS tự động start/stop EC2 và RDS theo lịch dựa trên tag, giảm phần lớn chi phí compute ngoài giờ mà không cần thao tác thủ công. RI tính phí 24/7 nên lãng phí cho tài nguyên chỉ chạy khoảng 50 giờ/tuần. Spot không áp dụng cho RDS và có thể bị gián đoạn. Dừng thủ công dễ quên và tốn công.',
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
      'gp3 rẻ hơn gp2 mỗi GB và có baseline 3,000 IOPS, 125 MB/s bất kể dung lượng; volume gp2 100 GB chỉ có khoảng 300 IOPS baseline. Elastic Volumes đổi loại volume không cần downtime. st1 là HDD, không phù hợp với IOPS ngẫu nhiên và không dùng làm boot volume. io2 đắt hơn nhiều. EFS đắt hơn mỗi GB và cần thay đổi ứng dụng.',
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
      'DynamoDB on-demand tính theo request, không cần lập kế hoạch capacity, phù hợp với tải không đoán được và có thời gian nhàn rỗi dài. Reserved capacity cần cam kết dài hạn cho tải ổn định. Auto Scaling với minimum cao vẫn trả tiền khi nhàn rỗi và phản ứng chậm với spike đột ngột. Standard-IA table class giảm giá lưu trữ chứ không giải quyết vấn đề capacity.',
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
      'Aurora Serverless v2 tự scale ACU theo tải, chỉ trả cho capacity dùng thực tế, rất phù hợp với tải dồn vào vài giờ mỗi tháng; thay đổi tối thiểu vì vẫn là Aurora PostgreSQL. RI phù hợp với tải ổn định 24/7, ở đây vẫn trả cho thời gian nhàn rỗi. Thêm replica tăng chi phí. Chuyển sang DynamoDB đòi hỏi thiết kế lại ứng dụng.',
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
      'SQS tách web tier và processing tier, cho phép worker xử lý theo tốc độ riêng thay vì phải provision theo peak. Scale theo backlog per instance và dùng Spot cho worker idempotent giảm mạnh chi phí compute. Tăng size instance làm tăng chi phí. Dedicated Hosts đắt hơn. ALB với sticky sessions không giải quyết vấn đề provision theo peak.',
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
      'Từ tháng 2/2024 AWS tính phí mọi public IPv4, kể cả Elastic IP đang gắn. Chuyển instance vào private subnet, quản trị qua Session Manager (không cần public IP hay bastion) và truy cập S3 qua gateway endpoint miễn phí giúp loại bỏ public IP. Elastic IP đang dùng vẫn bị tính phí. NLB với public IP mỗi instance không giảm số public IP. Global Accelerator có phí riêng và không cần thiết.',
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
      'Lambda cấp CPU tỷ lệ với memory; tăng memory cho tác vụ nặng CPU thường giảm mạnh thời gian chạy và có thể giảm tổng chi phí. Lambda Power Tuning giúp tìm cấu hình tối ưu. Chuyển sang EC2 tốn công vận hành và chưa chắc rẻ hơn. Tăng timeout chỉ kéo dài thời gian tính tiền. Provisioned concurrency giảm cold start nhưng tăng chi phí.',
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
      'Athena tính theo lượng dữ liệu quét. Parquet nén dạng cột chỉ đọc các cột cần thiết, còn partition theo date giúp bỏ qua dữ liệu không liên quan; cả hai giảm mạnh dữ liệu quét. Athena không query trực tiếp object trong Glacier Flexible Retrieval. RDS cho vài TB log tốn chi phí và vận hành hơn. Transfer Acceleration không liên quan tới query.',
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
      'Redshift Serverless tự scale và chỉ tính phí compute khi có query chạy, phù hợp với tải thất thường và không cần quản lý cluster. Provisioned cluster với reserved nodes tính phí liên tục kể cả khi nhàn rỗi. RDS MySQL không phải data warehouse. EMR chạy liên tục tốn phí và vận hành nhiều.',
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
      'ElastiCache cache kết quả truy vấn đọc lặp lại, giảm tải CPU cho RDS và thường cho phép giữ DB nhỏ hơn, rẻ hơn so với scale DB lên rất lớn. Scale instance class tốn kém hơn nhiều. Multi-AZ tăng availability chứ không giảm tải đọc (standby không phục vụ đọc). Migrate sang Aurora tốn công và không giải quyết vấn đề truy vấn lặp.',
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
      '500 TB qua đường 100 Mbps mất hơn một năm kể cả khi dùng toàn bộ băng thông, nên phải chuyển offline bằng Snowball Edge. Direct Connect cần nhiều tuần thiết lập, có phí cố định và vẫn khó xong trong 1 tháng. DataSync hay Transfer Acceleration trên đường truyền hiện tại bị giới hạn bởi băng thông.',
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
      'FSx for Lustre scratch rẻ, hiệu năng cao cho xử lý tạm, liên kết S3 làm data repository và có thể tạo/xóa theo mỗi lần chạy nên chỉ trả trong thời gian dùng. Persistent chạy cả tuần trả phí liên tục cho 50 TB. EFS không đạt hiệu năng HPC như Lustre và đắt mỗi GB. EBS io2 rất đắt và không phải file system dùng chung.',
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
      'FSx for Windows File Server HDD storage rẻ hơn SSD cho file share ít truy cập, và data deduplication giảm dung lượng lưu trữ khi có nhiều file trùng; vẫn giữ SMB và tích hợp Active Directory. EFS là NFS, không hỗ trợ SMB cho Windows. Tự quản lý EBS trên EC2 tăng công vận hành và mất tính năng managed. FSx for Lustre dành cho HPC trên Linux, không phải SMB.',
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
      'Tải thưa, bùng theo đợt, phần lớn thời gian nhàn rỗi và mỗi request ngắn là trường hợp chuẩn cho Lambda + API Gateway: chỉ trả theo request và thời gian chạy, không tốn tiền khi rảnh. EC2 On-Demand và Fargate luôn chạy đều trả tiền cả lúc nhàn rỗi. Reserved Instance cam kết 1 năm cho một instance gần như không dùng là lãng phí.',
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
      'Compute Savings Plans áp dụng tự động cho Fargate, Lambda và EC2, nên vẫn giữ giảm giá khi workload chuyển giữa các loại compute. EC2 Instance Savings Plans và Reserved Instances chỉ áp dụng cho EC2, không giảm giá cho Fargate/Lambda. Fargate Spot có thể bị thu hồi với cảnh báo 2 phút, không phù hợp với ứng dụng không được gián đoạn.',
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
      'Capacity provider strategy cho phép đặt base 2 task luôn chạy trên FARGATE (không bị thu hồi) và chia phần còn lại theo weight, phần lớn sang FARGATE_SPOT rẻ hơn nhiều. Chạy toàn bộ trên Fargate Spot có thể mất cả hai task tối thiểu khi bị thu hồi. Dedicated Instances đắt hơn và không cần thiết. EC2 Instance Savings Plans không áp dụng cho Fargate.',
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
      'AWS Batch hỗ trợ Spot compute environment với allocation strategy SPOT_PRICE_CAPACITY_OPTIMIZED, nhiều instance type để đa dạng pool, và retry strategy để tự chạy lại job bị gián đoạn, nên rẻ mà ít vận hành. Reserved Instances không hợp với tải batch dao động theo tuần. Tự dựng scheduler tăng công vận hành. Lambda giới hạn 15 phút và không phù hợp cho simulation dài.',
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
      'Lấy việc từ SQS và chỉ xóa message khi xong giúp message hiện lại sau visibility timeout để worker khác xử lý nếu instance bị thu hồi; checkpoint ra S3 cho phép tiếp tục từ điểm gần nhất thay vì chạy lại từ đầu. Reserved Instances bỏ lợi ích giá Spot. Instance store mất dữ liệu khi instance bị terminate. Tăng max price không ngăn bị thu hồi vì gián đoạn chủ yếu do AWS cần lại capacity.',
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
      'CPU của Lambda tỷ lệ với memory, nên hàm CPU-bound ở 128 MB thường chạy lâu; tăng memory có thể giảm thời gian đủ để tổng chi phí giảm, và Lambda Power Tuning tìm ra mức rẻ nhất. arm64 (Graviton) có giá GB-giây thấp hơn x86. Giảm timeout làm hàm bị lỗi giữa chừng. Provisioned concurrency thêm phí, chỉ giảm cold start. Chuyển sang EC2 tăng vận hành và không chắc rẻ hơn.',
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
      'Lambda bị tính duration cả khi chỉ ngồi chờ. Step Functions Standard workflow tính theo state transition, Wait state không tốn compute, nên chỉ trả cho các lần gọi Lambda ngắn để kiểm tra trạng thái. Tăng memory làm đắt hơn khi thời gian chủ yếu là chờ. Provisioned concurrency thêm phí. arm64 giảm đơn giá nhưng vẫn trả tiền cho toàn bộ thời gian chờ.',
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
      'Môi trường chỉ dùng khoảng 50 trên 168 giờ mỗi tuần, nên tắt ngoài giờ (scheduled action đưa ASG và ECS service về 0) tiết kiệm nhiều nhất. Reserved Instances và Savings Plans cam kết trả cho cả những giờ không dùng. Dedicated Instances đắt hơn.',
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
      'Gateway VPC endpoint cho S3 miễn phí, chỉ cần thêm route vào route table, nên traffic S3 không đi qua NAT nữa. Interface endpoint cho S3 cũng tránh NAT nhưng có phí theo giờ mỗi AZ và theo GB. NAT instance tăng công vận hành và vẫn tốn tiền. Transfer Acceleration tăng tốc độ và thêm phí, không giảm chi phí.',
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
      'Một NAT Gateway mỗi AZ, mỗi subnet route tới NAT cùng AZ giúp loại bỏ phí cross-AZ và không còn single point of failure. Dồn tất cả vào một AZ mất high availability. Gán public IPv4 cho mọi instance phát sinh phí public IPv4 và làm lộ instance. Thêm NAT trong cùng AZ không giải quyết cả hai vấn đề.',
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
      'CloudFront: data từ origin S3 sang CloudFront miễn phí, cache giảm request về origin, và Price Class 100 chỉ dùng edge ở khu vực rẻ nhất (Bắc Mỹ, châu Âu), phù hợp khi người dùng chủ yếu ở đó. Transfer Acceleration và Global Accelerator tăng tốc nhưng thêm phí. Cross-Region Replication thêm phí inter-Region và lưu trữ nhân bản mà vẫn trả egress.',
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
      'Direct Connect có phí port theo giờ nhưng đơn giá data transfer out rẻ hơn internet, nên với khối lượng lớn và đều đặn thì tổng chi phí thấp hơn, kèm băng thông ổn định. VPN egress tính theo giá internet; thêm tunnel không giảm đơn giá. Transfer Acceleration thêm phí. Transit Gateway thêm phí attachment và xử lý mà không giảm egress.',
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
      'Image ECR gồm API (ecr.api), registry (ecr.dkr) và layer lưu trên S3: interface endpoint cho ECR và CloudWatch Logs cộng gateway endpoint S3 (miễn phí) đưa traffic ra khỏi NAT; phí xử lý interface endpoint thấp hơn NAT. Public subnet với public IP phát sinh phí public IPv4 và giảm bảo mật. Transfer Acceleration không liên quan. Thêm NAT không giảm phí xử lý mỗi GB.',
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
      'VPC peering không có phí giờ và không có phí xử lý mỗi GB (traffic cùng AZ miễn phí), nên thêm peering riêng cho cặp VPC trao đổi nhiều dữ liệu giảm phí Transit Gateway, các VPC khác vẫn dùng TGW. VPN giữa VPC tốn phí và phức tạp. Transit Gateway thứ hai vẫn có phí attachment và xử lý. Đi qua internet tốn phí public IPv4 và egress, kém bảo mật.',
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
      'VPC Flow Logs ghi lại cặp IP nguồn/đích và lưu lượng, truy vấn bằng Athena cho biết instance nào gửi traffic sang AZ khác; Cost Explorer theo usage type (DataTransfer-Regional-Bytes) xác nhận chi phí inter-AZ. Trusted Advisor và Compute Optimizer không phân tích luồng mạng. S3 Storage Lens chỉ dành cho S3.',
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
      'Với NLB, bật cross-zone load balancing làm traffic tới target ở AZ khác bị tính phí inter-AZ. Khi target đã chia đều mỗi AZ, tắt cross-zone giữ traffic trong cùng AZ mà vẫn cân bằng tốt và vẫn multi-AZ. Global Accelerator thêm phí. Dồn target vào một AZ mất HA. Thêm target không giảm phí cross-AZ.',
  },
];
