import type { Question } from '@/content/types';

export const secureQuestions: Question[] = [
  // iam-fundamentals
  {
    id: 'sec-001',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'An application running on Amazon EC2 instances needs to read objects from an Amazon S3 bucket. A developer has stored an IAM user\'s access key and secret key in a configuration file on each instance. A security review flags this as a risk. Which solution is the MOST secure?',
    options: [
      'Encrypt the configuration file with AWS KMS and decrypt it when the application starts.',
      'Create an IAM role with read access to the bucket and attach it to the instances through an instance profile.',
      'Store the access key in AWS Systems Manager Parameter Store as a SecureString and rotate it every 90 days.',
      'Make the bucket public but restrict access with a bucket policy that allows only the instances\' public IP addresses.',
    ],
    answer: [1],
    explanation:
      'IAM role gắn qua instance profile cung cấp temporary credentials tự động xoay vòng, không phải lưu credentials dài hạn trên máy. Mã hóa file cấu hình vẫn là lưu access key dài hạn. Lưu access key trong Parameter Store tốt hơn file nhưng vẫn là credentials dài hạn, không an toàn bằng role. Mở bucket public dựa trên IP là sai thiết kế và dễ lộ dữ liệu.',
  },
  {
    id: 'sec-002',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company wants developers to create IAM roles for their AWS Lambda functions without a central team approving each role. The security team must ensure that developers can never grant a role more permissions than a predefined set, preventing privilege escalation. What should a solutions architect recommend?',
    options: [
      'Attach the AdministratorAccess policy to developers and review the roles weekly with IAM Access Analyzer.',
      'Use a service control policy to deny iam:CreateRole for all developers.',
      'Create an IAM group for developers with an inline policy listing every allowed Lambda action.',
      'Allow developers to create roles only if a specific permissions boundary is attached, using the iam:PermissionsBoundary condition key.',
    ],
    answer: [3],
    explanation:
      'Permission boundary đặt quyền tối đa cho role; điều kiện iam:PermissionsBoundary buộc developer phải gắn boundary khi tạo role, nên không thể leo thang đặc quyền. AdministratorAccess kèm review định kỳ chỉ phát hiện sau, không ngăn chặn. SCP chặn iam:CreateRole làm developer không tạo được role, trái yêu cầu. Inline policy cho group chỉ kiểm soát quyền của developer, không giới hạn quyền của role họ tạo ra.',
  },
  {
    id: 'sec-003',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'An IAM user belongs to a group whose policy allows s3:* on all resources. A second managed policy attached directly to the user explicitly denies s3:DeleteObject on the bucket prod-data. What happens when the user tries to delete an object in prod-data?',
    options: [
      'The request is denied because an explicit deny overrides any allow.',
      'The request is allowed because the group policy grants s3:* on all resources.',
      'The request is allowed because policies attached to groups take precedence over policies attached to users.',
      'The request is denied only if the bucket policy also denies the action.',
    ],
    answer: [0],
    explanation:
      'Trong logic đánh giá policy của IAM, explicit Deny luôn thắng mọi Allow, bất kể Deny nằm ở policy nào. Không có quy tắc group ưu tiên hơn user. Bucket policy không cần Deny vì explicit Deny trong identity policy đã đủ để từ chối.',
  },
  {
    id: 'sec-004',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A new AWS account was created for a startup. The founder has been using the root user with an access key for daily CLI work. Which set of actions follows AWS best practices for securing the root user?',
    options: [
      'Rotate the root access key every 30 days and store it in AWS Secrets Manager.',
      'Rename the root user and remove its console password.',
      'Enable MFA on the root user, delete the root access keys, and create an administrative identity for daily tasks.',
      'Attach a permissions boundary to the root user that limits it to read-only actions.',
    ],
    answer: [2],
    explanation:
      'Best practice: bật MFA cho root, xóa access key của root và dùng một danh tính quản trị riêng (IAM Identity Center hoặc IAM) cho công việc hằng ngày. Xoay vòng access key của root vẫn giữ credentials rủi ro cao. Không thể đổi tên root user. Không thể gắn permission boundary cho root user.',
  },
  {
    id: 'sec-005',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A security team wants to identify which AWS services each IAM role in an account has actually used in the last 90 days so they can remove unused permissions. Which feature provides this information with the LEAST effort?',
    options: [
      'AWS Config resource timeline for each IAM role.',
      'IAM last accessed information (Access Advisor) for each role.',
      'Amazon GuardDuty findings filtered by IAM role.',
      'Amazon Inspector reports for IAM roles.',
    ],
    answer: [1],
    explanation:
      'IAM Access Advisor (last accessed information) cho biết service nào được role dùng lần cuối khi nào, phục vụ dọn quyền thừa. AWS Config ghi thay đổi cấu hình của role, không ghi việc sử dụng quyền. GuardDuty phát hiện mối đe dọa, không liệt kê service được dùng. Inspector quét lỗ hổng phần mềm, không phân tích IAM.',
  },
  {
    id: 'sec-006',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company requires that IAM users can stop or terminate production EC2 instances only when they have authenticated with multi-factor authentication. How should a solutions architect enforce this requirement?',
    options: [
      'Add a condition using aws:MultiFactorAuthPresent to the IAM policy that allows ec2:StopInstances and ec2:TerminateInstances.',
      'Enable termination protection on all production instances.',
      'Configure an AWS Config rule that checks whether MFA is enabled for each IAM user.',
      'Require MFA in the account password policy.',
    ],
    answer: [0],
    explanation:
      'Điều kiện aws:MultiFactorAuthPresent trong policy chỉ cho phép hành động khi phiên đã xác thực MFA. Termination protection không liên quan MFA và không chặn stop. Config rule chỉ kiểm tra user có bật MFA hay không, không ép buộc khi gọi API. Password policy không có tùy chọn bắt buộc MFA.',
  },
  {
    id: 'sec-007',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company runs containers on Amazon ECS with the AWS Fargate launch type. The application inside one task must write items to an Amazon DynamoDB table. Which configuration grants the required permissions following least privilege?',
    options: [
      'Add DynamoDB write permissions to the task execution role.',
      'Attach a DynamoDB write policy to the IAM role of the ECS cluster\'s container instances.',
      'Pass an IAM user\'s access key to the container as environment variables in the task definition.',
      'Create a task role with a policy that allows writes to the specific table and reference it in the task definition.',
    ],
    answer: [3],
    explanation:
      'Task role cấp quyền cho code chạy trong container; policy giới hạn đúng bảng cần ghi là least privilege. Task execution role dùng để ECS pull image và ghi log, không dành cho ứng dụng. Fargate không có container instance do bạn quản lý, và gắn quyền ở cấp instance làm mọi task có quyền. Truyền access key qua biến môi trường là credentials dài hạn, không an toàn.',
  },
  {
    id: 'sec-008',
    domain: 'secure',
    lesson: 'iam-fundamentals',
    stem: 'A company is auditing its AWS account. Which TWO actions improve security according to IAM best practices? (Choose TWO.)',
    options: [
      'Use IAM roles and temporary credentials for workloads instead of long-term access keys.',
      'Share one IAM user among team members to reduce the number of credentials to manage.',
      'Grant AWS managed full-access policies to all developers to reduce support tickets.',
      'Use IAM Access Analyzer to identify resources shared with external principals.',
      'Create access keys for the root user so that automation can recover from IAM misconfigurations.',
    ],
    answer: [0, 3],
    explanation:
      'Dùng role với temporary credentials và dùng IAM Access Analyzer để phát hiện tài nguyên chia sẻ ra ngoài là best practice. Dùng chung một IAM user làm mất khả năng truy vết từng người. Cấp full-access cho mọi developer vi phạm least privilege. Tạo access key cho root là điều AWS khuyến cáo tránh tuyệt đối.',
  },
  // iam-organizations-scp
  {
    id: 'sec-009',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company uses AWS Organizations with dozens of member accounts. The compliance team requires that no user in any member account, including the root user, can disable AWS CloudTrail or delete trails. Which solution meets this requirement?',
    options: [
      'Attach an IAM policy that denies cloudtrail:StopLogging to every IAM user in each account.',
      'Enable AWS Config in every account with a rule that detects when CloudTrail is disabled.',
      'Create a service control policy that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail and attach it to the organization root.',
      'Use IAM Identity Center permission sets that do not include CloudTrail permissions.',
    ],
    answer: [2],
    explanation:
      'SCP gắn ở root của organization giới hạn quyền của mọi principal trong member account, kể cả root user, nên chặn được hành động này. IAM policy không áp dụng cho root user và dễ bị bỏ sót user mới. AWS Config chỉ phát hiện sau khi sự việc xảy ra. Permission set chỉ áp dụng cho người dùng Identity Center, không ảnh hưởng root hay IAM user khác.',
  },
  {
    id: 'sec-010',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has an Amazon S3 bucket that stores shared reports. The bucket must be accessible to IAM principals from every account in the company\'s organization in AWS Organizations, including accounts added in the future, and to no one else. Which solution requires the LEAST ongoing maintenance?',
    options: [
      'List every account ID in the bucket policy Principal element and update it when accounts are added.',
      'Add a bucket policy statement that allows access when the aws:PrincipalOrgID condition matches the organization ID.',
      'Create an IAM role in the bucket account and require every account to assume it.',
      'Use AWS Resource Access Manager to share the bucket with the organization.',
    ],
    answer: [1],
    explanation:
      'Điều kiện aws:PrincipalOrgID trong bucket policy tự động bao gồm mọi account hiện tại và tương lai của organization, không cần cập nhật. Liệt kê account ID phải sửa policy mỗi khi thêm account. Role cross-account chạy được nhưng mỗi ứng dụng phải assume role, vận hành phức tạp hơn. RAM không hỗ trợ chia sẻ S3 bucket.',
  },
  {
    id: 'sec-011',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company wants to quickly set up a new multi-account AWS environment that follows AWS best practices, with centralized logging, an audit account, single sign-on, and preventive and detective rules applied automatically to new accounts. Which service should the company use?',
    options: [
      'AWS Organizations with manually created SCPs.',
      'AWS Config conformance packs.',
      'AWS Security Hub.',
      'AWS Control Tower.',
    ],
    answer: [3],
    explanation:
      'Control Tower dựng landing zone theo best practice: tạo account Log Archive và Audit, cấu hình IAM Identity Center, áp controls preventive (SCP) và detective (Config) cho account mới qua Account Factory. Organizations với SCP thủ công tốn nhiều công sức. Conformance packs chỉ là tập Config rules. Security Hub tổng hợp findings, không dựng môi trường đa account.',
  },
  {
    id: 'sec-012',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A software vendor needs to access resources in a customer\'s AWS account to provide a monitoring service. The customer wants to avoid sharing long-term credentials and to protect against the confused deputy problem. What should the customer do?',
    options: [
      'Create an IAM role that trusts the vendor\'s AWS account and require a unique external ID in the trust policy condition.',
      'Create an IAM user for the vendor and share its access keys through an encrypted email.',
      'Add the vendor\'s account to the customer\'s organization in AWS Organizations.',
      'Create a resource-based policy on every resource that allows the vendor\'s root user.',
    ],
    answer: [0],
    explanation:
      'Role cross-account với External ID trong trust policy là cách AWS khuyến nghị cho bên thứ ba, vừa dùng temporary credentials vừa chống confused deputy. Chia sẻ access key IAM user là credentials dài hạn. Đưa account vendor vào organization của mình là không phù hợp và không cấp quyền. Không phải tài nguyên nào cũng hỗ trợ resource-based policy, và cách này khó quản lý.',
  },
  {
    id: 'sec-013',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company wants to restrict all member accounts in its organization so that resources can be created only in the eu-west-1 and eu-central-1 Regions. Global services such as IAM must continue to work. Which approach should a solutions architect use?',
    options: [
      'Disable all other Regions in the account settings of each member account.',
      'Create an AWS Config rule that deletes resources created in other Regions.',
      'Attach an SCP that denies actions when aws:RequestedRegion is not one of the approved Regions, with exceptions for global services.',
      'Use IAM permission boundaries on every role that list the allowed Regions.',
    ],
    answer: [2],
    explanation:
      'SCP với điều kiện aws:RequestedRegion (kèm NotAction ngoại lệ cho service global như IAM, CloudFront, Route 53) là cách chuẩn để giới hạn Region trên toàn organization. Các Region mặc định không thể tắt qua account settings. Config rule xóa tài nguyên chỉ khắc phục sau và rủi ro. Permission boundary phải gắn từng role và không áp dụng root user.',
  },
  {
    id: 'sec-014',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has 40 AWS accounts in AWS Organizations. Employees authenticate with the corporate Microsoft Entra ID identity provider. The company wants employees to sign in once and access the accounts they are assigned to with role-based permissions. Which solution requires the LEAST operational overhead?',
    options: [
      'Create IAM users in each account and synchronize passwords with a script.',
      'Enable IAM Identity Center, connect Microsoft Entra ID as the external identity provider with SCIM provisioning, and assign permission sets to groups.',
      'Configure a separate SAML identity provider and IAM roles in each of the 40 accounts.',
      'Deploy AWS Managed Microsoft AD and create a forest trust with each account.',
    ],
    answer: [1],
    explanation:
      'IAM Identity Center kết nối IdP bên ngoài qua SAML 2.0 và SCIM, gán permission set cho group trên nhiều account từ một nơi, ít vận hành nhất. Tạo IAM user ở từng account vừa tốn công vừa kém an toàn. Cấu hình SAML riêng cho 40 account chạy được nhưng vận hành nặng. Managed Microsoft AD không tạo trust với AWS account; trust là giữa các domain AD.',
  },
  {
    id: 'sec-015',
    domain: 'secure',
    lesson: 'iam-organizations-scp',
    stem: 'A company has a central networking account that owns a VPC. Application teams in other accounts in the same organization need to launch EC2 instances into subnets of this VPC, while the networking team keeps control of routing and network ACLs. Which solution meets these requirements?',
    options: [
      'Share the subnets with the application accounts by using AWS Resource Access Manager.',
      'Create VPC peering connections from each application account to the central VPC.',
      'Create cross-account IAM roles so that application teams launch instances directly in the networking account.',
      'Use AWS Transit Gateway to attach application VPCs to the central VPC.',
    ],
    answer: [0],
    explanation:
      'VPC sharing qua RAM cho phép account khác tạo tài nguyên trong subnet dùng chung, còn account sở hữu VPC giữ quyền quản lý route table, NACL. Peering và Transit Gateway yêu cầu mỗi account có VPC riêng, không đáp ứng việc launch vào subnet trung tâm. Launch trực tiếp trong account networking làm mất ranh giới billing và quyền sở hữu tài nguyên của team.',
  },
  // identity-federation-cognito
  {
    id: 'sec-016',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company is building a mobile application. Users must be able to sign up and sign in with an email address or with their Google accounts. After signing in, the app must upload photos directly to a user-specific prefix in an Amazon S3 bucket. Which TWO components should a solutions architect use? (Choose TWO.)',
    options: [
      'IAM users created for each application user.',
      'An Amazon Cognito user pool configured with Google as a federated identity provider.',
      'AWS IAM Identity Center with Google as the identity source.',
      'An AWS Directory Service Simple AD directory.',
      'An Amazon Cognito identity pool that exchanges tokens for temporary AWS credentials scoped to the user\'s prefix.',
    ],
    answer: [1, 4],
    explanation:
      'Cognito User Pool xử lý sign-up/sign-in với email và Google; Cognito Identity Pool đổi token lấy temporary credentials, dùng policy variable để giới hạn prefix S3 của từng user. Tạo IAM user cho người dùng cuối không mở rộng được. IAM Identity Center dành cho nhân viên (workforce), không phải khách hàng ứng dụng mobile. Simple AD là thư mục cho doanh nghiệp, không phục vụ đăng nhập ứng dụng mobile.',
  },
  {
    id: 'sec-017',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company has an on-premises Active Directory. It wants employees to use their existing AD credentials to sign in to Amazon WorkSpaces. Company policy states that no directory data may be stored or cached in the cloud. Which solution meets these requirements?',
    options: [
      'Deploy AWS Managed Microsoft AD and create a two-way trust with the on-premises domain.',
      'Deploy Simple AD and import users from the on-premises directory.',
      'Create a Cognito user pool and migrate users with a Lambda trigger.',
      'Deploy AD Connector and connect it to the on-premises Active Directory over a VPN or AWS Direct Connect.',
    ],
    answer: [3],
    explanation:
      'AD Connector là proxy chuyển yêu cầu xác thực về AD on-prem, không lưu hay cache dữ liệu thư mục trên cloud. Managed Microsoft AD là một directory chạy trên AWS và lưu dữ liệu thư mục trên cloud. Simple AD cũng lưu dữ liệu trên AWS và không đồng bộ với AD on-prem. Cognito không dùng để đăng nhập WorkSpaces bằng AD và di chuyển user lên cloud trái chính sách.',
  },
  {
    id: 'sec-018',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company is migrating Microsoft SharePoint and SQL Server workloads that require Active Directory to AWS. The company also needs users from its on-premises AD domain to access the migrated workloads by using a trust relationship. Which directory service should the company use?',
    options: [
      'Simple AD',
      'AD Connector',
      'AWS Managed Microsoft AD',
      'Amazon Cognito user pool',
    ],
    answer: [2],
    explanation:
      'AWS Managed Microsoft AD là Active Directory thật do AWS quản lý, hỗ trợ ứng dụng AD-aware như SharePoint, SQL Server và tạo trust với AD on-prem. Simple AD không hỗ trợ trust và thiếu nhiều tính năng AD. AD Connector chỉ là proxy, không làm directory cho workload trên AWS khi không có on-prem. Cognito không phải Active Directory.',
  },
  {
    id: 'sec-019',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company runs an internal web application behind an Application Load Balancer. The company wants users to authenticate before any request reaches the application servers, without changing application code. Which solution meets this requirement?',
    options: [
      'Configure an ALB listener rule with an authenticate action that uses an Amazon Cognito user pool or an OIDC identity provider.',
      'Attach AWS WAF to the ALB with a rule that requires an Authorization header.',
      'Place the application in a private subnet and use security groups to allow only authenticated users.',
      'Use an Amazon Cognito identity pool attached directly to the target group.',
    ],
    answer: [0],
    explanation:
      'ALB hỗ trợ action authenticate-cognito hoặc authenticate-oidc ngay trên listener rule, xác thực người dùng trước khi chuyển request tới target, không cần sửa code. WAF chỉ kiểm tra header có tồn tại, không xác thực danh tính. Security Group lọc theo IP/port, không biết người dùng đã xác thực hay chưa. Identity pool cấp AWS credentials, không gắn vào target group.',
  },
  {
    id: 'sec-020',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company uses an on-premises identity provider that supports SAML 2.0. The company has a single AWS account and wants employees to access the AWS Management Console with their corporate credentials without creating IAM users. What should a solutions architect configure?',
    options: [
      'An Amazon Cognito user pool with a SAML app client.',
      'A SAML identity provider in IAM and IAM roles whose trust policies allow federated users to call sts:AssumeRoleWithSAML.',
      'An IAM user for each employee with a password that matches the corporate password.',
      'AWS Directory Service Simple AD with a one-way trust to the identity provider.',
    ],
    answer: [1],
    explanation:
      'Tạo SAML identity provider trong IAM và role tin cậy provider đó cho phép nhân viên đăng nhập console bằng tài khoản công ty qua AssumeRoleWithSAML. Cognito user pool dành cho người dùng ứng dụng, không dùng để đăng nhập console. Tạo IAM user cho từng nhân viên trái yêu cầu. Simple AD không hỗ trợ trust.',
  },
  {
    id: 'sec-021',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A gaming company wants players to try a limited version of its mobile game without creating an account. Anonymous players must be able to read leaderboard data from an Amazon DynamoDB table but not write to it. Which solution meets these requirements?',
    options: [
      'Embed read-only IAM user credentials in the mobile application.',
      'Create a Cognito user pool and allow unauthenticated sign-in.',
      'Expose the DynamoDB table through a public VPC endpoint.',
      'Enable unauthenticated identities in an Amazon Cognito identity pool and attach a read-only role for guest users.',
    ],
    answer: [3],
    explanation:
      'Cognito Identity Pool hỗ trợ guest (unauthenticated) identities với IAM role riêng có quyền chỉ đọc, cấp temporary credentials. Nhúng credentials IAM user vào app là lộ credentials dài hạn. User pool không cấp AWS credentials và không có khái niệm sign-in ẩn danh. VPC endpoint không phải public và không thay thế xác thực.',
  },
  {
    id: 'sec-022',
    domain: 'secure',
    lesson: 'identity-federation-cognito',
    stem: 'A company runs a REST API on Amazon API Gateway. Only users who have signed in to the company\'s web application through an Amazon Cognito user pool should be able to call the API. Which solution requires the LEAST development effort?',
    options: [
      'Write a Lambda authorizer that validates usernames and passwords against a DynamoDB table.',
      'Use an API key and usage plan for every user.',
      'Configure a Cognito user pool authorizer on the API methods.',
      'Use IAM authorization and create an IAM user for each web application user.',
    ],
    answer: [2],
    explanation:
      'API Gateway có Cognito user pool authorizer tích hợp sẵn, tự kiểm tra JWT mà không cần viết code. Lambda authorizer tự kiểm tra mật khẩu tốn công và kém an toàn. API key dùng để định danh/throttling, không phải cơ chế xác thực người dùng. Tạo IAM user cho từng người dùng web không mở rộng được.',
  },
  // vpc-networking-security
  {
    id: 'sec-023',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A web application runs on EC2 instances in a public subnet. The security team notices malicious traffic from a single IP address and needs to block it immediately at the subnet level. What should a solutions architect do?',
    options: [
      'Add an inbound deny rule for the IP address to the network ACL associated with the subnet.',
      'Add an inbound deny rule for the IP address to the security group of the instances.',
      'Remove the route to the internet gateway from the subnet route table.',
      'Enable VPC Flow Logs and filter the IP address.',
    ],
    answer: [0],
    explanation:
      'NACL hoạt động ở cấp subnet và hỗ trợ rule Deny, nên chặn được một IP cụ thể. Security Group chỉ có rule Allow, không thể Deny. Xóa route tới IGW làm sập toàn bộ ứng dụng. Flow Logs chỉ ghi lại traffic, không chặn.',
  },
  {
    id: 'sec-024',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company has a three-tier application with web servers behind an Application Load Balancer, application servers, and an Amazon RDS for MySQL database. The security team requires that the database accepts connections only from the application tier, and that the application tier accepts traffic only from the load balancer. Which TWO configurations meet these requirements? (Choose TWO.)',
    options: [
      'Configure the database network ACL to allow port 3306 from 0.0.0.0/0.',
      'Place the RDS instance in a public subnet with a security group that allows the application servers\' public IP addresses.',
      'Configure the application tier security group to allow inbound traffic only from the ALB security group.',
      'Configure the application servers to use a NAT gateway to reach the database.',
      'Configure the database security group to allow inbound port 3306 only from the application tier security group.',
    ],
    answer: [2, 4],
    explanation:
      'Tham chiếu Security Group: SG tầng app chỉ cho phép từ SG của ALB, SG của DB chỉ cho phép port 3306 từ SG tầng app; cách này tự động cập nhật khi Auto Scaling thêm instance. NACL mở 3306 cho 0.0.0.0/0 nới lỏng bảo mật. Đặt RDS ở public subnet là sai thiết kế. NAT Gateway dùng để ra Internet, không liên quan truy cập DB nội bộ.',
  },
  {
    id: 'sec-025',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'EC2 instances in private subnets across three Availability Zones need to download software updates from the internet. The solution must be highly available and require minimal management. What should a solutions architect do?',
    options: [
      'Launch a NAT instance in one public subnet and update all private route tables to use it.',
      'Create a NAT gateway in a public subnet in each Availability Zone and route each private subnet to the NAT gateway in the same AZ.',
      'Create one NAT gateway in a private subnet and route all private subnets to it.',
      'Attach an egress-only internet gateway to the VPC and route private subnets to it.',
    ],
    answer: [1],
    explanation:
      'NAT Gateway là managed service; đặt một NAT Gateway ở public subnet của mỗi AZ tránh điểm lỗi đơn và phí cross-AZ. NAT instance phải tự quản lý và một instance là điểm lỗi đơn. NAT Gateway phải nằm ở public subnet, và một NAT duy nhất không HA khi AZ lỗi. Egress-only IGW chỉ dành cho IPv6.',
  },
  {
    id: 'sec-026',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company\'s administrators currently connect to Linux EC2 instances in private subnets through a bastion host that allows SSH from the corporate network. The company wants to remove the bastion host, close all inbound ports, and keep an audit log of all session activity. Which solution meets these requirements with the LEAST operational overhead?',
    options: [
      'Replace the bastion host with an AWS Client VPN endpoint and use SSH keys.',
      'Move the instances to public subnets and restrict SSH to the corporate IP range.',
      'Use a Network Load Balancer to forward SSH traffic to the instances.',
      'Use AWS Systems Manager Session Manager with an instance profile that allows SSM, and send session logs to Amazon S3 or CloudWatch Logs.',
    ],
    answer: [3],
    explanation:
      'Session Manager cho truy cập shell không cần mở port inbound, không cần bastion hay SSH key, quyền kiểm soát bằng IAM và ghi log session vào S3/CloudWatch Logs. Client VPN vẫn cần mở port 22 trên SG và quản lý key. Chuyển instance sang public subnet làm tăng bề mặt tấn công. NLB chuyển SSH vẫn cần mở port và không có audit session.',
  },
  {
    id: 'sec-027',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company created a custom network ACL for a public subnet that hosts web servers. The NACL allows inbound TCP 443 from 0.0.0.0/0 and outbound TCP 443 to 0.0.0.0/0. Users report that HTTPS connections to the web servers time out. The security groups are configured correctly. What is the MOST likely cause?',
    options: [
      'Security groups must also explicitly allow outbound responses on port 443.',
      'The internet gateway does not support HTTPS traffic.',
      'The NACL does not allow outbound traffic on ephemeral ports 1024-65535 for return traffic to clients.',
      'Network ACLs evaluate deny rules before allow rules.',
    ],
    answer: [2],
    explanation:
      'NACL là stateless nên phản hồi tới client đi ra bằng ephemeral port (1024-65535) phải được cho phép riêng ở outbound. Security Group là stateful, phản hồi tự được phép. IGW không lọc giao thức. NACL đánh giá theo số thứ tự rule, không phải Deny trước Allow.',
  },
  {
    id: 'sec-028',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company needs to inspect all outbound traffic from its VPCs and block connections to domain names that are not on an approved list. The company also needs intrusion prevention capabilities with Suricata-compatible rules. Which AWS service should be used?',
    options: [
      'AWS Network Firewall',
      'AWS WAF',
      'Security groups with outbound rules',
      'Amazon GuardDuty',
    ],
    answer: [0],
    explanation:
      'AWS Network Firewall là firewall managed cấp VPC, lọc theo domain (FQDN), hỗ trợ IPS với rule tương thích Suricata. WAF lọc HTTP layer 7 cho ALB/CloudFront/API Gateway, không lọc egress của VPC. Security Group chỉ lọc theo IP/port, không theo domain. GuardDuty phát hiện mối đe dọa nhưng không chặn traffic.',
  },
  {
    id: 'sec-029',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A solutions architect needs to troubleshoot why connections from an on-premises network to an EC2 instance are being rejected. The architect wants to see whether traffic is accepted or rejected at the network interface, without capturing packet contents. What should the architect enable?',
    options: [
      'AWS CloudTrail data events for Amazon EC2.',
      'VPC Flow Logs on the instance\'s network interface.',
      'VPC Traffic Mirroring on the instance.',
      'Amazon Inspector network reachability analysis.',
    ],
    answer: [1],
    explanation:
      'VPC Flow Logs ghi metadata traffic ở cấp ENI kèm trạng thái ACCEPT/REJECT, đúng nhu cầu chẩn đoán SG/NACL. CloudTrail ghi API call, không ghi traffic mạng. Traffic Mirroring bắt cả nội dung gói tin, vượt yêu cầu và phức tạp hơn. Inspector đánh giá khả năng tiếp cận mạng theo cấu hình, không cho thấy traffic thực tế bị từ chối.',
  },
  {
    id: 'sec-030',
    domain: 'secure',
    lesson: 'vpc-networking-security',
    stem: 'A company deploys a NAT instance to save costs. Instances in the private subnet still cannot reach the internet, even though the private route table points 0.0.0.0/0 to the NAT instance and its security group allows the traffic. What should the solutions architect do?',
    options: [
      'Attach an Elastic IP address to each private instance.',
      'Move the NAT instance to the private subnet.',
      'Add a route to the internet gateway in the private route table.',
      'Disable the source/destination check on the NAT instance.',
    ],
    answer: [3],
    explanation:
      'NAT instance phải tắt source/destination check vì nó chuyển tiếp traffic không có nguồn/đích là chính nó. Gán Elastic IP cho instance private không giúp ra Internet vì không có route tới IGW. NAT instance phải ở public subnet. Thêm route IGW cho private subnet biến nó thành public subnet, trái thiết kế.',
  },
  // vpc-connectivity
  {
    id: 'sec-031',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'EC2 instances in private subnets upload several terabytes of data to Amazon S3 each day through a NAT gateway. The company wants to reduce data transfer costs and keep traffic off the internet. What should a solutions architect do?',
    options: [
      'Create an interface VPC endpoint for Amazon S3 in each subnet.',
      'Replace the NAT gateway with a NAT instance.',
      'Create a gateway VPC endpoint for Amazon S3 and add it to the private subnet route tables.',
      'Enable S3 Transfer Acceleration on the bucket.',
    ],
    answer: [2],
    explanation:
      'Gateway endpoint cho S3 miễn phí, traffic đi trong mạng AWS và loại bỏ phí data processing của NAT Gateway. Interface endpoint cũng riêng tư nhưng tính phí theo giờ và theo GB, nên không rẻ nhất. NAT instance vẫn đi qua Internet và tốn công quản lý. Transfer Acceleration tăng tốc qua edge, tốn thêm phí và vẫn đi Internet.',
  },
  {
    id: 'sec-032',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company has a 10 Gbps AWS Direct Connect connection to a single AWS Region. Security policy requires that all data in transit between the data center and the VPCs is encrypted. The company also wants a cost-effective backup path if the Direct Connect connection fails. Which TWO actions should a solutions architect take? (Choose TWO.)',
    options: [
      'Establish an IPsec Site-to-Site VPN connection over the Direct Connect connection.',
      'Enable default encryption on the Direct Connect connection in the console.',
      'Configure a Site-to-Site VPN connection over the internet as a backup to Direct Connect.',
      'Replace Direct Connect with VPC peering to the data center.',
      'Order a second Direct Connect connection at the same location for encryption.',
    ],
    answer: [0, 2],
    explanation:
      'Direct Connect không mã hóa mặc định; chạy IPsec VPN trên DX đáp ứng yêu cầu mã hóa. Site-to-Site VPN qua Internet là đường dự phòng rẻ cho DX. Không có tùy chọn "default encryption" bật trong console cho DX. VPC peering chỉ kết nối VPC với VPC. Thêm một DX cùng location tăng độ bền nhưng không mã hóa và tốn kém hơn VPN.',
  },
  {
    id: 'sec-033',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company has 150 VPCs across multiple accounts and an on-premises data center connected by VPN. All VPCs must communicate with each other and with the data center. The current full mesh of VPC peering connections is difficult to manage. Which solution simplifies the network with the LEAST operational overhead?',
    options: [
      'Create an AWS Transit Gateway, attach all VPCs and the VPN, and share the transit gateway across accounts with AWS RAM.',
      'Replace VPC peering with AWS PrivateLink endpoints between every pair of VPCs.',
      'Use a VPN CloudHub on a virtual private gateway in one VPC.',
      'Deploy EC2-based transit routers in a hub VPC.',
    ],
    answer: [0],
    explanation:
      'Transit Gateway theo mô hình hub-and-spoke, hỗ trợ transitive routing cho hàng nghìn VPC và VPN, chia sẻ cross-account qua RAM. PrivateLink cung cấp dịch vụ một chiều, không thay thế được kết nối toàn mạng. VPN CloudHub dành cho các chi nhánh kết nối tới một VGW, không định tuyến giữa 150 VPC. Router tự dựng trên EC2 tốn nhiều công vận hành.',
  },
  {
    id: 'sec-034',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A SaaS provider wants to offer its application, running behind a Network Load Balancer in its VPC, to hundreds of customers. Customers must connect privately from their own VPCs. Many customer VPCs use CIDR ranges that overlap with the provider\'s VPC. Which solution should the provider use?',
    options: [
      'VPC peering with each customer VPC.',
      'AWS Transit Gateway shared with all customers.',
      'A public Application Load Balancer with security group rules for each customer.',
      'A VPC endpoint service powered by AWS PrivateLink that customers connect to with interface endpoints.',
    ],
    answer: [3],
    explanation:
      'PrivateLink cho phép provider đặt dịch vụ sau NLB và khách hàng truy cập riêng tư qua interface endpoint, không cần quan tâm CIDR chồng lấn và không lộ cả VPC. VPC peering không cho phép CIDR chồng lấn và không mở rộng tới hàng trăm khách hàng. Transit Gateway cũng gặp vấn đề CIDR chồng lấn và lộ mạng. ALB public đi qua Internet, không riêng tư.',
  },
  {
    id: 'sec-035',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company needs to connect its data center to AWS within the next week. The connection must be encrypted. Long-term, the company may need more bandwidth. Which solution should the company implement NOW?',
    options: [
      'AWS Direct Connect dedicated connection.',
      'AWS Site-to-Site VPN connection to a virtual private gateway.',
      'VPC peering between the data center and the VPC.',
      'AWS Client VPN for every server in the data center.',
    ],
    answer: [1],
    explanation:
      'Site-to-Site VPN dùng IPsec mã hóa, thiết lập nhanh trong vài giờ. Direct Connect thường mất hơn một tháng để triển khai và không mã hóa mặc định. VPC peering không dùng cho mạng on-prem. Client VPN dành cho người dùng cá nhân, không phải kết nối site-to-site cho cả data center.',
  },
  {
    id: 'sec-036',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company uses AWS Direct Connect from its data center in Frankfurt. It now needs private connectivity from the same Direct Connect connection to VPCs in eu-central-1, us-east-1, and ap-southeast-1. Which solution meets this requirement with the LEAST cost?',
    options: [
      'Order new Direct Connect connections in each Region.',
      'Create VPC peering connections from the eu-central-1 VPC to the other Regions.',
      'Create a Direct Connect gateway and associate the virtual private gateways of the VPCs in each Region.',
      'Set up Site-to-Site VPN connections from the data center to each Region.',
    ],
    answer: [2],
    explanation:
      'Direct Connect Gateway cho phép một kết nối DX tới VPC ở nhiều Region mà không cần đặt thêm đường truyền. Đặt DX mới ở từng Region tốn kém và chậm. VPC peering không transitive nên traffic từ on-prem không đi tiếp sang VPC peer. VPN qua Internet không phải kết nối riêng như yêu cầu.',
  },
  {
    id: 'sec-037',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'A company stores sensitive data in an Amazon S3 bucket. The company wants to ensure that the bucket can be accessed only from EC2 instances in a specific VPC through a VPC endpoint. Which solution meets this requirement?',
    options: [
      'Add a bucket policy that denies all access unless the request comes from the specific VPC endpoint by using the aws:SourceVpce condition.',
      'Add a security group to the gateway endpoint that allows only the EC2 instances.',
      'Enable S3 Block Public Access on the bucket.',
      'Configure a network ACL that allows only the S3 prefix list.',
    ],
    answer: [0],
    explanation:
      'Bucket policy Deny với điều kiện aws:SourceVpce khác endpoint chỉ định bảo đảm bucket chỉ truy cập được qua endpoint đó. Gateway endpoint không gắn Security Group. Block Public Access ngăn truy cập public nhưng không giới hạn theo VPC. NACL kiểm soát traffic subnet, không ngăn người khác truy cập bucket từ nơi khác.',
  },
  {
    id: 'sec-038',
    domain: 'secure',
    lesson: 'vpc-connectivity',
    stem: 'An on-premises application connects to AWS over AWS Direct Connect with a private virtual interface. The application must call the Amazon SQS API privately without traversing the public internet. Which solution meets this requirement?',
    options: [
      'Create a gateway VPC endpoint for Amazon SQS.',
      'Create an interface VPC endpoint for Amazon SQS in the VPC and resolve its private DNS name from on premises.',
      'Route SQS traffic through a NAT gateway in the VPC.',
      'Enable VPC peering between the on-premises network and SQS.',
    ],
    answer: [1],
    explanation:
      'Interface endpoint tạo ENI có IP private trong VPC, truy cập được từ on-prem qua Direct Connect/VPN. Gateway endpoint chỉ hỗ trợ S3 và DynamoDB và không truy cập được từ on-prem. NAT Gateway đưa traffic ra endpoint public qua Internet. Không thể peering với một dịch vụ AWS.',
  },
  // data-encryption-kms
  {
    id: 'sec-039',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company has an unencrypted Amazon RDS for PostgreSQL DB instance in production. A new compliance requirement states that the database must be encrypted at rest. What should a solutions architect do?',
    options: [
      'Modify the DB instance and enable encryption with an AWS KMS key.',
      'Create an encrypted read replica of the DB instance and promote it.',
      'Enable EBS encryption by default in the Region and reboot the DB instance.',
      'Take a snapshot, copy the snapshot with encryption enabled, restore a new DB instance from the encrypted snapshot, and switch the application to it.',
    ],
    answer: [3],
    explanation:
      'Không thể bật mã hóa cho RDS đang chạy; cách chuẩn là snapshot, copy snapshot có bật encryption, restore DB mới và chuyển ứng dụng. Modify DB không cho bật encryption cho instance chưa mã hóa. Read replica phải có cùng trạng thái mã hóa với primary nên không tạo được replica mã hóa từ DB chưa mã hóa. EBS encryption by default không ảnh hưởng RDS hiện có.',
  },
  {
    id: 'sec-040',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company stores financial records in Amazon S3. Regulations require that records cannot be overwritten or deleted by any user, including the root user, for 7 years. The company also needs an audit trail of every use of the encryption key. Which TWO actions meet these requirements? (Choose TWO.)',
    options: [
      'Enable S3 Object Lock in governance mode with a 7-year retention period.',
      'Enable S3 Object Lock in compliance mode with a 7-year retention period.',
      'Use SSE-C encryption so that the company controls the keys.',
      'Use SSE-KMS with a customer managed key and record key usage with AWS CloudTrail.',
      'Enable MFA Delete and give the MFA device to the compliance officer.',
    ],
    answer: [1, 3],
    explanation:
      'Object Lock compliance mode ngăn mọi người, kể cả root, xóa hay ghi đè object tới hết hạn retention. SSE-KMS với customer managed key ghi lại mọi lần dùng key trong CloudTrail. Governance mode cho phép user có quyền bypass xóa object. SSE-C không có audit sử dụng key trong KMS. MFA Delete chỉ thêm bước xác thực, người có thiết bị MFA vẫn xóa được.',
  },
  {
    id: 'sec-041',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company must store encryption keys in single-tenant hardware security modules that it controls exclusively. AWS must not have access to the key material. The company wants to use the keys with Oracle Transparent Data Encryption on EC2. Which service should the company use?',
    options: [
      'AWS KMS with AWS managed keys.',
      'AWS KMS with customer managed keys and automatic rotation.',
      'AWS CloudHSM.',
      'AWS Secrets Manager.',
    ],
    answer: [2],
    explanation:
      'CloudHSM cung cấp HSM single-tenant, khách hàng toàn quyền quản lý key và user, AWS không truy cập được key, hỗ trợ Oracle TDE. KMS (cả AWS managed lẫn customer managed) là dịch vụ multi-tenant do AWS vận hành HSM. Secrets Manager lưu secrets, không phải HSM.',
  },
  {
    id: 'sec-042',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company needs to share an encrypted Amazon EBS snapshot with a partner\'s AWS account. The snapshot is currently encrypted with the AWS managed key aws/ebs. What must the company do?',
    options: [
      'Copy the snapshot and re-encrypt it with a customer managed KMS key, share that key with the partner account through the key policy, and then share the snapshot.',
      'Share the snapshot directly and grant the partner access to the aws/ebs key.',
      'Make the snapshot public so the partner can copy it.',
      'Export the AWS managed key and send it to the partner securely.',
    ],
    answer: [0],
    explanation:
      'Snapshot mã hóa bằng AWS managed key không chia sẻ được; phải copy và mã hóa lại bằng customer managed key, cấp quyền key cho account đối tác, rồi chia sẻ snapshot. Không thể sửa key policy của aws/ebs. Snapshot mã hóa không thể public, và làm public dữ liệu nhạy cảm là sai. KMS key material không export được.',
  },
  {
    id: 'sec-043',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company uses SSE-KMS for an Amazon S3 bucket that receives millions of small objects every hour. The application has started receiving KMS throttling errors and KMS costs have increased significantly. Which solution resolves these issues with the LEAST effort?',
    options: [
      'Switch to client-side encryption with the AWS Encryption SDK.',
      'Enable S3 Bucket Keys for the bucket.',
      'Request a KMS quota increase and keep the current configuration.',
      'Use a different KMS key for each prefix.',
    ],
    answer: [1],
    explanation:
      'S3 Bucket Keys tạo key cấp bucket để giảm mạnh số request tới KMS, vừa giảm throttling vừa giảm chi phí, chỉ cần bật một tùy chọn. Client-side encryption đòi sửa ứng dụng. Tăng quota giảm throttling nhưng không giảm chi phí. Dùng nhiều key không giảm số request vì quota tính theo account/Region.',
  },
  {
    id: 'sec-044',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company wants to guarantee that every object uploaded to an S3 bucket is encrypted with a specific AWS KMS key, and that all requests to the bucket use TLS. What should a solutions architect configure?',
    options: [
      'Enable default encryption with SSE-S3 and enable S3 Block Public Access.',
      'Enable S3 Object Lock and require MFA Delete.',
      'Configure an S3 Lifecycle rule to re-encrypt objects that are not encrypted with the KMS key.',
      'Set default encryption to SSE-KMS with the key, and add a bucket policy that denies requests where aws:SecureTransport is false and denies PutObject requests that specify a different encryption key.',
    ],
    answer: [3],
    explanation:
      'Default encryption SSE-KMS với key chỉ định kết hợp bucket policy Deny khi aws:SecureTransport là false và Deny PutObject dùng key khác bảo đảm cả hai yêu cầu. SSE-S3 không dùng KMS key chỉ định, Block Public Access không ép TLS. Object Lock và MFA Delete là chống xóa, không liên quan mã hóa. Lifecycle không re-encrypt object.',
  },
  {
    id: 'sec-045',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company runs a DynamoDB global table in two Regions and encrypts sensitive attributes on the client side before writing them. The application in either Region must be able to decrypt data written in the other Region, even if KMS in the other Region is unreachable. Which solution meets these requirements?',
    options: [
      'Use AWS KMS multi-Region keys with a replica key in each Region.',
      'Create separate customer managed keys in each Region and copy the ciphertext between Regions.',
      'Use the AWS managed key aws/dynamodb in both Regions.',
      'Store a symmetric key in AWS Secrets Manager and replicate the secret.',
    ],
    answer: [0],
    explanation:
      'Multi-Region keys có cùng key ID và key material ở các Region, nên dữ liệu mã hóa ở Region này giải mã được ở Region kia bằng replica key cục bộ. Key riêng ở mỗi Region có key material khác nhau nên không giải mã chéo được. AWS managed key ở mỗi Region là key khác nhau và dùng cho mã hóa phía server. Tự lưu key trong Secrets Manager là tự quản lý key thủ công, không được kiểm soát và audit như KMS.',
  },
  {
    id: 'sec-046',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company has a private S3 bucket. A mobile application needs to let a specific user download one object for the next 15 minutes without making the object public and without giving the user AWS credentials. What is the simplest solution?',
    options: [
      'Enable S3 static website hosting on the bucket.',
      'Create an IAM user for the mobile user and share the access key.',
      'Generate an S3 presigned URL for the object with a 15-minute expiration.',
      'Temporarily disable S3 Block Public Access on the bucket.',
    ],
    answer: [2],
    explanation:
      'Presigned URL cho phép tải một object riêng tư trong thời gian giới hạn bằng quyền của người tạo URL, không cần cấp credentials cho người dùng. Static website hosting yêu cầu object public. Tạo IAM user và chia sẻ key là credentials dài hạn. Tắt Block Public Access làm lộ dữ liệu.',
  },
  {
    id: 'sec-047',
    domain: 'secure',
    lesson: 'data-encryption-kms',
    stem: 'A company runs EC2 instances with unencrypted EBS data volumes. The security team now requires all EBS volumes to be encrypted, including any new volumes created in the future. Which combination of actions meets these requirements?',
    options: [
      'Enable encryption on each existing volume from the EC2 console, and use a tag policy for new volumes.',
      'Create snapshots of existing volumes, copy them with encryption enabled, create new volumes from the encrypted snapshots, and enable EBS encryption by default for the Region.',
      'Use AWS Backup to back up the volumes, which automatically encrypts the original volumes.',
      'Attach an IAM policy that requires encryption to the instance profile.',
    ],
    answer: [1],
    explanation:
      'Volume hiện có không mã hóa trực tiếp được; phải qua snapshot copy có encryption rồi tạo volume mới. Bật EBS encryption by default bảo đảm volume mới trong Region luôn được mã hóa. Không có tùy chọn bật mã hóa trên volume có sẵn, và tag policy không ép mã hóa. AWS Backup không mã hóa volume gốc. Policy trên instance profile không ảnh hưởng việc tạo volume.',
  },
  // secrets-certificates
  {
    id: 'sec-048',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company\'s Lambda functions connect to an Amazon Aurora MySQL database using a password that is hard-coded in the function code. The security team requires that the password is removed from code and rotated automatically every 30 days. Which TWO steps should a solutions architect take? (Choose TWO.)',
    options: [
      'Store the password in an SSM Parameter Store String parameter.',
      'Store the password as a Lambda environment variable encrypted with the default key.',
      'Create a cron job on an EC2 instance that changes the password monthly.',
      'Store the credentials in AWS Secrets Manager and enable automatic rotation with a 30-day schedule.',
      'Update the Lambda functions to retrieve the secret from AWS Secrets Manager at runtime and grant the execution role permission to read the secret.',
    ],
    answer: [3, 4],
    explanation:
      'Secrets Manager hỗ trợ rotation tự động tích hợp với Aurora; Lambda đọc secret lúc chạy bằng quyền trong execution role. Parameter Store String không mã hóa và không có rotation tích hợp. Biến môi trường không giải quyết rotation. Cron job trên EC2 tăng vận hành và không đồng bộ được với ứng dụng.',
  },
  {
    id: 'sec-049',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company serves static content from an Amazon S3 bucket through Amazon CloudFront. Users have discovered that they can access the objects directly through the S3 URL, bypassing CloudFront. The bucket uses SSE-KMS encryption. Which solution prevents direct access to the bucket?',
    options: [
      'Configure an origin access control (OAC) on the distribution, update the bucket policy to allow only the CloudFront service principal for that distribution, and keep the bucket private.',
      'Configure an origin access identity (OAI) and enable S3 static website hosting.',
      'Enable S3 Transfer Acceleration and block the S3 regional endpoint.',
      'Use CloudFront signed URLs for all objects.',
    ],
    answer: [0],
    explanation:
      'OAC là cơ chế hiện tại thay thế OAI, hỗ trợ SSE-KMS; bucket policy chỉ cho phép cloudfront.amazonaws.com với AWS:SourceArn là distribution, bucket giữ private. OAI là cơ chế cũ, không hỗ trợ SSE-KMS, và website endpoint của S3 không dùng được với OAI/OAC. Transfer Acceleration không chặn truy cập. Signed URL kiểm soát người xem qua CloudFront nhưng không chặn truy cập trực tiếp S3.',
  },
  {
    id: 'sec-050',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company is deploying a website on Amazon CloudFront with a custom domain name. The company wants a free public TLS certificate that renews automatically. The rest of the infrastructure runs in eu-west-1. Where should the certificate be requested?',
    options: [
      'In AWS Certificate Manager in eu-west-1.',
      'In AWS Private Certificate Authority in eu-west-1.',
      'In AWS Certificate Manager in us-east-1.',
      'In IAM by uploading a self-signed certificate.',
    ],
    answer: [2],
    explanation:
      'CloudFront chỉ dùng chứng chỉ ACM được tạo hoặc import ở us-east-1; ACM cấp chứng chỉ public miễn phí và tự gia hạn. Chứng chỉ ở eu-west-1 không gắn được vào CloudFront. Private CA cấp chứng chỉ private, có phí, trình duyệt không tin cậy. Chứng chỉ self-signed không được trình duyệt tin cậy và không tự gia hạn.',
  },
  {
    id: 'sec-051',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A video streaming company distributes premium content through Amazon CloudFront. Subscribers must be able to access hundreds of video segment files for a movie without changing the URLs used by the existing player. Which solution meets these requirements?',
    options: [
      'CloudFront signed URLs for each segment file.',
      'S3 presigned URLs for each segment file.',
      'AWS WAF geo match rules on the distribution.',
      'CloudFront signed cookies issued to authenticated subscribers.',
    ],
    answer: [3],
    explanation:
      'Signed cookies cấp quyền truy cập nhiều file mà không phải thay đổi URL, phù hợp cho nội dung premium gồm nhiều segment. Signed URL phải tạo cho từng file và làm thay đổi URL. S3 presigned URL bỏ qua CloudFront và cũng thay đổi URL. Geo match chỉ lọc theo quốc gia, không xác định thuê bao.',
  },
  {
    id: 'sec-052',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'An application stores dozens of configuration values, such as feature flags and endpoint URLs, plus a few API keys that do not need rotation. The company wants a low-cost, hierarchical store with encryption for the sensitive values. Which solution is MOST cost-effective?',
    options: [
      'Store all values in AWS Secrets Manager.',
      'Use AWS Systems Manager Parameter Store standard parameters, with SecureString parameters for the API keys.',
      'Store the values in a DynamoDB table encrypted with a customer managed key.',
      'Store the values in an S3 object encrypted with SSE-C.',
    ],
    answer: [1],
    explanation:
      'Parameter Store standard tier miễn phí, hỗ trợ cấu trúc phân cấp và SecureString mã hóa bằng KMS, đủ cho secret không cần rotation. Secrets Manager tính phí theo secret, tốn kém hơn khi không cần rotation. DynamoDB và S3 đòi tự xây cơ chế quản lý cấu hình, và SSE-C phải tự quản lý key.',
  },
  {
    id: 'sec-053',
    domain: 'secure',
    lesson: 'secrets-certificates',
    stem: 'A company has a web application behind an Application Load Balancer. It wants to offload TLS processing from the EC2 instances while using certificates that renew automatically. Which solution requires the LEAST operational overhead?',
    options: [
      'Request a public certificate in AWS Certificate Manager and attach it to an HTTPS listener on the ALB.',
      'Install a third-party certificate on each EC2 instance and use a TCP listener on a Network Load Balancer.',
      'Import a third-party certificate into ACM and attach it to the ALB.',
      'Store the certificate in Secrets Manager and load it on the instances at boot.',
    ],
    answer: [0],
    explanation:
      'Chứng chỉ public của ACM gắn vào HTTPS listener của ALB vừa giảm tải TLS khỏi EC2 vừa tự gia hạn. Cài cert trên từng EC2 không giảm tải TLS và phải tự gia hạn. ACM không tự gia hạn chứng chỉ import. Lưu cert trong Secrets Manager vẫn để EC2 xử lý TLS và phải tự quản lý gia hạn.',
  },
  // threat-detection-waf-shield
  {
    id: 'sec-054',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company\'s e-commerce website runs behind an Application Load Balancer. The website is experiencing SQL injection attempts and an HTTP flood from a small set of IP addresses. Which solution addresses both issues?',
    options: [
      'Enable AWS Shield Standard on the ALB.',
      'Add network ACL deny rules for every attacking IP address.',
      'Associate an AWS WAF web ACL with the ALB that includes the SQL injection managed rule group and a rate-based rule.',
      'Enable Amazon GuardDuty and Amazon Inspector.',
    ],
    answer: [2],
    explanation:
      'WAF gắn vào ALB với managed rule chống SQL injection và rate-based rule chặn IP gửi quá nhiều request giải quyết cả hai vấn đề. Shield Standard đã tự bật và chỉ bảo vệ DDoS layer 3/4, không chặn SQLi. NACL không chặn SQLi và phải cập nhật thủ công khi IP thay đổi. GuardDuty phát hiện, Inspector quét lỗ hổng; cả hai không chặn request.',
  },
  {
    id: 'sec-055',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A financial services company is concerned about large, sophisticated DDoS attacks against its applications on CloudFront, Route 53, and Elastic Load Balancing. The company wants access to a 24/7 DDoS response team and protection against scaling charges caused by attacks. Which service should the company use?',
    options: [
      'AWS Shield Standard',
      'AWS WAF with rate-based rules',
      'Amazon GuardDuty',
      'AWS Shield Advanced',
    ],
    answer: [3],
    explanation:
      'Shield Advanced cung cấp bảo vệ DDoS nâng cao cho CloudFront, Route 53, ELB, Global Accelerator, EC2, có Shield Response Team 24/7 và cost protection. Shield Standard miễn phí nhưng không có SRT và cost protection. WAF lọc layer 7 nhưng không có đội phản ứng hay bảo vệ chi phí. GuardDuty phát hiện mối đe dọa trong account, không chống DDoS.',
  },
  {
    id: 'sec-056',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A security team wants to automatically detect cryptocurrency mining activity on EC2 instances and immediately isolate any affected instance by replacing its security group. Which TWO services should be combined to achieve this with the LEAST custom infrastructure? (Choose TWO.)',
    options: [
      'Amazon GuardDuty to detect the threat.',
      'Amazon Macie to classify instance data.',
      'AWS Trusted Advisor to scan instances.',
      'Amazon Inspector to monitor network traffic.',
      'Amazon EventBridge with an AWS Lambda function that modifies the instance security group when a finding is published.',
    ],
    answer: [0, 4],
    explanation:
      'GuardDuty phát hiện đào coin dựa trên Flow Logs, DNS logs và threat intelligence; EventBridge bắt finding và gọi Lambda đổi Security Group để cách ly instance. Macie tìm dữ liệu nhạy cảm trong S3. Trusted Advisor đưa khuyến nghị best practice, không phát hiện mối đe dọa thời gian thực. Inspector quét lỗ hổng phần mềm, không giám sát traffic.',
  },
  {
    id: 'sec-057',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company stores millions of documents in Amazon S3 across many buckets. The compliance team needs to discover which objects contain personally identifiable information (PII) such as passport numbers and credit card numbers. Which service should be used?',
    options: [
      'Amazon GuardDuty S3 Protection',
      'Amazon Macie',
      'AWS Config',
      'Amazon Detective',
    ],
    answer: [1],
    explanation:
      'Macie dùng machine learning và pattern matching để phát hiện dữ liệu nhạy cảm (PII) trong S3. GuardDuty S3 Protection phát hiện hoạt động truy cập đáng ngờ, không phân loại nội dung. AWS Config đánh giá cấu hình bucket, không quét nội dung. Detective dùng để điều tra nguyên nhân gốc của findings.',
  },
  {
    id: 'sec-058',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company with 60 accounts in AWS Organizations must ensure that every Application Load Balancer and CloudFront distribution, including resources created in the future, is protected by a standard set of AWS WAF rules. Which solution requires the LEAST operational overhead?',
    options: [
      'Create a CloudFormation StackSet that deploys a web ACL to each account and ask teams to associate it.',
      'Use an AWS Config rule in each account to detect unprotected resources and notify teams.',
      'Use AWS Firewall Manager with a WAF security policy that applies the rules across the organization automatically.',
      'Write a Lambda function in each account that attaches the web ACL when resources are created.',
    ],
    answer: [2],
    explanation:
      'Firewall Manager quản lý tập trung WAF policy trên mọi account trong Organizations và tự áp dụng cho tài nguyên mới. StackSet chỉ triển khai web ACL, việc gắn vẫn thủ công. Config rule chỉ phát hiện và thông báo. Lambda tự viết ở mỗi account tốn công phát triển và bảo trì.',
  },
  {
    id: 'sec-059',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'An auditor asks a company to show who deleted a security group in production last month and from which IP address the request was made. Which service provides this information?',
    options: [
      'AWS Config configuration history.',
      'VPC Flow Logs.',
      'Amazon CloudWatch metrics.',
      'AWS CloudTrail.',
    ],
    answer: [3],
    explanation:
      'CloudTrail ghi lại mọi API call gồm danh tính người gọi, thời điểm và địa chỉ IP nguồn, nên trả lời được câu hỏi "ai đã xóa". AWS Config cho thấy cấu hình thay đổi thế nào nhưng câu hỏi "ai" và "từ IP nào" thuộc về CloudTrail. Flow Logs ghi traffic mạng, không ghi API call. CloudWatch metrics là số liệu hiệu năng.',
  },
  {
    id: 'sec-060',
    domain: 'secure',
    lesson: 'threat-detection-waf-shield',
    stem: 'A company must continuously verify that all Amazon S3 buckets have server access logging enabled and that no security group allows unrestricted SSH access. Noncompliant resources should be remediated automatically. Which solution meets these requirements?',
    options: [
      'Use AWS Config managed rules with automatic remediation through AWS Systems Manager Automation documents.',
      'Enable Amazon GuardDuty and review its findings weekly.',
      'Use Amazon Inspector to scan S3 buckets and security groups.',
      'Create CloudTrail trails and query them with Amazon Athena each day.',
    ],
    answer: [0],
    explanation:
      'AWS Config rules liên tục đánh giá cấu hình tài nguyên và hỗ trợ remediation tự động bằng SSM Automation. GuardDuty phát hiện mối đe dọa, không kiểm tra cấu hình tuân thủ. Inspector quét lỗ hổng phần mềm trên EC2/ECR/Lambda, không đánh giá S3 hay SG theo quy tắc. Truy vấn CloudTrail bằng Athena là thủ công và không tự khắc phục.',
  },
];
