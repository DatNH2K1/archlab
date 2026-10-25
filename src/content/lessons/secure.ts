import type { Lesson } from '@/content/types';

export const secureLessons: Lesson[] = [
  {
    slug: 'iam-fundamentals',
    domain: 'secure',
    title: 'IAM căn bản: User, Group, Role và Policy',
    summary:
      'Nền tảng của mọi câu hỏi bảo mật: ai được làm gì trên tài nguyên nào. Nắm chắc logic đánh giá policy, permission boundary và cách dùng role thay cho access key.',
    services: ['AWS IAM', 'AWS STS', 'Amazon EC2'],
    minutes: 10,
    body: `## IAM là gì

AWS Identity and Access Management (IAM) là service global (không thuộc Region) dùng để quản lý danh tính (identity) và quyền truy cập (permission) vào tài nguyên AWS. IAM miễn phí.

### Các thành phần chính

- **Root user**: danh tính tạo ra khi mở account, có toàn quyền và không thể bị giới hạn bởi IAM policy trong chính account đó.
- **IAM user**: một người hoặc ứng dụng, có thể có mật khẩu console và/hoặc access key (credentials dài hạn).
- **IAM group**: tập hợp user để gán policy chung. Group chỉ chứa user, **không lồng group trong group**, và group không phải là principal (không thể đặt group vào Principal của resource-based policy).
- **IAM role**: danh tính không có credentials dài hạn. Ai được phép (theo trust policy) sẽ assume role và nhận **temporary credentials** từ AWS STS.
- **Policy**: tài liệu JSON gồm Effect (Allow/Deny), Action, Resource, Condition.

### Các loại policy

| Loại | Gắn vào | Ghi chú thi |
|---|---|---|
| AWS managed policy | User/Group/Role | Do AWS duy trì, tiện nhưng thường rộng quyền |
| Customer managed policy | User/Group/Role | Tái sử dụng, có versioning, nên dùng cho least privilege |
| Inline policy | Một identity duy nhất | Gắn chặt 1-1, bị xóa cùng identity |
| Resource-based policy | Tài nguyên (S3 bucket, SQS, KMS key...) | Có trường Principal, cho phép cross-account |
| Permission boundary | User/Role | Giới hạn quyền **tối đa**, không tự cấp quyền |
| SCP (Organizations) | OU/Account | Giới hạn quyền tối đa cho cả account |
| Session policy | Khi assume role | Thu hẹp quyền của phiên |

## Logic đánh giá policy (Policy evaluation)

1. Mặc định mọi request bị **implicit deny**.
2. Nếu có bất kỳ **explicit Deny** nào áp dụng → từ chối ngay. Explicit Deny luôn thắng.
3. SCP, permission boundary, session policy phải **cho phép** (chúng là "bộ lọc", không cấp quyền).
4. Identity-based policy hoặc resource-based policy phải có **Allow**.

Ghi nhớ: **quyền hiệu lực = giao (intersection)** của identity policy với boundary và SCP. Ví dụ policy cho phép s3:* nhưng permission boundary chỉ cho s3:GetObject → user chỉ đọc được object.

Với truy cập **cross-account**, cả hai phía phải cho phép: identity policy ở account gọi và resource-based policy (hoặc trust policy của role) ở account sở hữu tài nguyên.

### Permission boundary dùng khi nào

Tình huống kinh điển: cho phép developer tự tạo IAM role cho Lambda của họ nhưng không được leo thang đặc quyền (privilege escalation). Giải pháp: yêu cầu mọi role do developer tạo phải gắn một permission boundary nhất định (dùng Condition iam:PermissionsBoundary).

## Root user – best practices

- Bật **MFA** cho root user, không tạo access key cho root (xóa nếu có).
- Dùng root chỉ cho các tác vụ bắt buộc: đổi thông tin account, đóng account, đổi gói Support, khôi phục quyền khi IAM bị khóa nhầm, một số thao tác billing.
- Tạo admin riêng (tốt nhất qua IAM Identity Center) cho công việc hằng ngày.

## MFA và password policy

- MFA hỗ trợ: virtual MFA app, FIDO2 passkey/security key, hardware TOTP token.
- Có thể yêu cầu MFA trong policy bằng Condition aws:MultiFactorAuthPresent.
- Password policy của account: độ dài tối thiểu, ký tự bắt buộc, thời hạn mật khẩu, chống dùng lại.

## Access key và credentials

- Access key = Access Key ID + Secret Access Key, dùng cho CLI/SDK. Đây là credentials **dài hạn** → rủi ro lộ lọt.
- Mỗi IAM user có tối đa **2 access key** (để xoay vòng).
- Không bao giờ nhúng access key vào code, AMI hay lưu trên EC2. Dùng **IAM role**.
- IAM Credential Report (cấp account) và IAM Access Advisor (cấp user/role, xem service nào được dùng lần cuối) giúp dọn quyền thừa.
- IAM Access Analyzer: phát hiện tài nguyên được chia sẻ ra ngoài account/organization, kiểm tra policy, sinh policy least-privilege từ CloudTrail.

## Role cho service và Instance profile

- EC2 dùng role thông qua **instance profile** (container chứa role). Ứng dụng trên EC2 lấy temporary credentials từ Instance Metadata Service (nên dùng IMDSv2).
- Lambda dùng **execution role**; ECS task dùng **task role** (khác task execution role dùng để pull image và ghi log).
- Có thể thay role cho EC2 đang chạy mà không cần stop instance.

## So sánh nhanh

| Nhu cầu | Chọn |
|---|---|
| Ứng dụng trên EC2 cần gọi S3 | IAM role + instance profile |
| Nhân viên đăng nhập nhiều account | IAM Identity Center |
| Giới hạn quyền tối đa developer có thể tự cấp | Permission boundary |
| Cấm một hành động cho toàn bộ account | SCP |
| Cho account khác đọc bucket | Bucket policy (resource-based) hoặc role cross-account |
| Ai đã gọi API này? | CloudTrail |

## Mẹo làm bài

- Thấy "access key trên EC2" hay "hard-coded credentials" → đáp án gần như luôn là IAM role.
- "Least privilege" → policy cụ thể theo action/resource, tránh dấu sao.
- Explicit Deny ở bất kỳ đâu (identity, resource, SCP, boundary) đều thắng Allow.
`,
    keywords: [
      { trigger: 'ứng dụng trên EC2 cần truy cập S3/DynamoDB an toàn', answer: 'IAM role gắn qua instance profile, không dùng access key' },
      { trigger: 'giới hạn quyền tối đa mà developer có thể tự gán cho role họ tạo', answer: 'Permission boundary' },
      { trigger: 'một policy Allow và một policy Deny cùng áp dụng', answer: 'Explicit Deny luôn thắng' },
      { trigger: 'bảo vệ root user', answer: 'Bật MFA, xóa access key của root, dùng admin riêng' },
      { trigger: 'tìm quyền không dùng tới để dọn dẹp', answer: 'IAM Access Advisor / IAM Access Analyzer' },
      { trigger: 'liệt kê trạng thái credentials của mọi user trong account', answer: 'IAM Credential Report' },
      { trigger: 'yêu cầu MFA trước khi thực hiện hành động nhạy cảm', answer: 'Condition aws:MultiFactorAuthPresent trong policy' },
      { trigger: 'phát hiện tài nguyên được chia sẻ ra ngoài account', answer: 'IAM Access Analyzer' },
    ],
    traps: [
      'Permission boundary và SCP không tự cấp quyền; vẫn cần identity policy có Allow.',
      'Không thể lồng group trong group và không thể dùng group làm Principal trong resource-based policy.',
      'Lưu access key trong file cấu hình trên EC2 hoặc trong AMI là sai, dù có mã hóa; đáp án đúng là IAM role.',
      'IAM là service global; không cần tạo user/role riêng cho từng Region.',
      'Gắn AdministratorAccess cho tiện là vi phạm least privilege, thường là distractor.',
    ],
  },
  {
    slug: 'iam-organizations-scp',
    domain: 'secure',
    title: 'AWS Organizations, SCP và truy cập cross-account',
    summary:
      'Quản trị nhiều account: OU, SCP, Control Tower, IAM Identity Center, chia sẻ tài nguyên bằng RAM và truy cập cross-account với STS AssumeRole.',
    services: ['AWS Organizations', 'AWS Control Tower', 'AWS IAM Identity Center', 'AWS STS', 'AWS Resource Access Manager'],
    minutes: 10,
    body: `## AWS Organizations

AWS Organizations gom nhiều account vào một tổ chức có **management account** (trước gọi là master) và các **member account**.

- **Organizational Unit (OU)**: nhóm account theo phân cấp (ví dụ Prod, Dev, Security, Sandbox). Policy gắn ở OU được kế thừa xuống account con.
- **Consolidated billing**: một hóa đơn, gộp usage để hưởng volume discount; Reserved Instances và Savings Plans có thể chia sẻ giữa các account.
- Hai chế độ: chỉ consolidated billing, hoặc **all features** (cần thiết để dùng SCP).
- Tạo account mới bằng API, tự có role OrganizationAccountAccessRole để management account quản trị.

## Service Control Policy (SCP)

SCP đặt **giới hạn quyền tối đa** cho mọi IAM user và role trong member account, **kể cả root user của member account**.

- SCP **không cấp quyền**. Vẫn cần IAM policy Allow.
- SCP **không áp dụng cho management account**. Vì vậy best practice là không chạy workload trong management account.
- SCP không ảnh hưởng service-linked role.
- Hai chiến lược: **deny list** (giữ FullAWSAccess, thêm Deny cụ thể) hoặc **allow list** (bỏ FullAWSAccess, chỉ Allow những gì cần).
- Ví dụ điển hình: chặn tắt CloudTrail, chặn rời Organization, chỉ cho phép một số Region (dùng Condition aws:RequestedRegion), bắt buộc tag, cấm tạo IAM user.

Ngoài SCP còn có **Resource Control Policy (RCP)** giới hạn quyền tối đa trên tài nguyên (như S3, KMS, SQS, STS, Secrets Manager) trong organization, và các policy quản trị như tag policy, backup policy.

Muốn chặn truy cập tài nguyên từ ngoài tổ chức: dùng Condition **aws:PrincipalOrgID** trong resource-based policy (ví dụ bucket policy chỉ cho principal thuộc organization của mình).

## AWS Control Tower

Control Tower dựng **landing zone** đa account theo best practice chỉ với vài thao tác, chạy trên Organizations.

- Tự tạo các account Log Archive và Audit, cấu hình IAM Identity Center, CloudTrail và AWS Config tập trung.
- **Controls** (trước gọi là guardrails): preventive (thực thi bằng SCP), detective (thực thi bằng AWS Config rules), proactive (kiểm tra bằng CloudFormation hooks trước khi tạo tài nguyên).
- **Account Factory**: tạo account mới đã chuẩn hóa.
- Dashboard thấy account nào không tuân thủ.

Từ khóa đề: "set up and govern a secure multi-account environment quickly", "landing zone" → Control Tower.

## IAM Identity Center

Tên mới của AWS Single Sign-On. Một nơi đăng nhập cho nhiều AWS account trong Organization và các ứng dụng SAML (Salesforce, Microsoft 365...).

- Identity source: thư mục có sẵn của Identity Center, Active Directory (qua AWS Managed Microsoft AD hoặc AD Connector), hoặc IdP bên ngoài (Microsoft Entra ID, Okta...) qua SAML 2.0 + SCIM.
- **Permission set**: tập policy được gán cho user/group trên từng account, Identity Center tự tạo role tương ứng trong account.
- Là lựa chọn được AWS khuyến nghị cho truy cập của con người (workforce), thay vì tạo IAM user ở từng account.

## Identity-based vs Resource-based policy

| Tiêu chí | Identity-based | Resource-based |
|---|---|---|
| Gắn vào | User, group, role | Tài nguyên: S3, SQS, SNS, KMS key, Lambda, ECR... |
| Có Principal? | Không | Có |
| Cross-account | Cần assume role ở account đích | Principal ngoài account gọi trực tiếp, không cần bỏ quyền của mình |
| Ví dụ | Policy cho role của EC2 | Bucket policy, key policy, trust policy của role |

Điểm thi: khi assume role, bạn **mất quyền của danh tính gốc** và chỉ có quyền của role. Với resource-based policy thì principal vẫn giữ quyền của mình (hữu ích khi cần đọc từ bucket A và ghi vào bucket B ở hai account khác nhau).

## Truy cập cross-account bằng STS AssumeRole

1. Account B (sở hữu tài nguyên) tạo role với **trust policy** cho phép account A (hoặc role cụ thể) assume.
2. Account A cấp cho user/role quyền sts:AssumeRole trên ARN của role đó.
3. Ứng dụng gọi AssumeRole, nhận temporary credentials (mặc định 1 giờ, tối đa theo cấu hình max session duration của role, có thể tới 12 giờ).

Cho **bên thứ ba** (vendor) truy cập: dùng role cross-account với **External ID** trong Condition để chống "confused deputy". Không bao giờ chia sẻ access key.

Các API STS cần nhớ: AssumeRole, AssumeRoleWithSAML, AssumeRoleWithWebIdentity, GetSessionToken (dùng với MFA), GetCallerIdentity.

## AWS Resource Access Manager (RAM)

RAM chia sẻ tài nguyên giữa các account (trong hoặc ngoài Organization) mà không phải sao chép:

- **VPC subnet** (VPC sharing): nhiều account tạo tài nguyên trong cùng subnet do account trung tâm quản lý.
- Transit Gateway, Route 53 Resolver rules, License Manager configurations, AWS Network Firewall policy, Aurora DB cluster (để clone) và nhiều loại khác.

VPC sharing giúp giảm số VPC, không cần peering, nhưng mỗi account chỉ quản lý tài nguyên của mình.

## Mẹo làm bài

- "Prevent all accounts, including root of member accounts, from doing X" → SCP.
- "Restrict to approved Regions" → SCP với aws:RequestedRegion.
- "Only principals in our organization can access the bucket" → aws:PrincipalOrgID.
- "Third party needs access" → cross-account role + External ID.
- "Centralized login for employees across accounts" → IAM Identity Center.
`,
    keywords: [
      { trigger: 'ngăn mọi account (kể cả root của member account) thực hiện hành động', answer: 'Service Control Policy (SCP)' },
      { trigger: 'chỉ cho phép dùng một số Region được phê duyệt', answer: 'SCP với điều kiện aws:RequestedRegion' },
      { trigger: 'thiết lập nhanh môi trường đa account theo best practice, landing zone', answer: 'AWS Control Tower' },
      { trigger: 'nhân viên đăng nhập một lần vào nhiều account', answer: 'IAM Identity Center với permission set' },
      { trigger: 'chỉ principal thuộc organization được truy cập bucket', answer: 'Bucket policy với aws:PrincipalOrgID' },
      { trigger: 'bên thứ ba cần truy cập tài nguyên trong account', answer: 'Cross-account IAM role kèm External ID' },
      { trigger: 'chia sẻ subnet/Transit Gateway giữa các account', answer: 'AWS Resource Access Manager (RAM)' },
      { trigger: 'gộp hóa đơn, chia sẻ RI/Savings Plans', answer: 'AWS Organizations consolidated billing' },
    ],
    traps: [
      'SCP không áp dụng cho management account; đừng chọn SCP để giới hạn management account.',
      'SCP không cấp quyền: account có SCP Allow nhưng IAM policy không Allow vẫn bị từ chối.',
      'Khi assume role, principal mất quyền gốc; nếu cần giữ quyền ở cả hai phía hãy nghĩ tới resource-based policy.',
      'Chia sẻ access key với vendor là sai; dùng role + External ID.',
      'Control Tower controls dạng preventive dựa trên SCP, dạng detective dựa trên AWS Config; đừng nhầm hai loại.',
    ],
  },
  {
    slug: 'identity-federation-cognito',
    domain: 'secure',
    title: 'Federation, Amazon Cognito và Directory Service',
    summary:
      'Cho người dùng ngoài AWS truy cập: SAML 2.0, OIDC, Cognito User Pools và Identity Pools, cùng ba lựa chọn AWS Directory Service.',
    services: ['Amazon Cognito', 'AWS STS', 'AWS Directory Service', 'AWS IAM Identity Center'],
    minutes: 9,
    body: `## Identity federation là gì

Federation cho phép danh tính được quản lý **bên ngoài AWS** (Active Directory, Okta, Google, Facebook...) truy cập AWS mà không cần tạo IAM user. Kết quả cuối cùng luôn là **temporary credentials** từ STS gắn với một IAM role.

### SAML 2.0 federation

- Dành cho doanh nghiệp có IdP tương thích SAML 2.0 (AD FS, Microsoft Entra ID, Okta...).
- Luồng: user đăng nhập IdP → IdP trả SAML assertion → gọi **AssumeRoleWithSAML** (hoặc dùng endpoint đăng nhập console) → nhận credentials tạm.
- Ngày nay AWS khuyến nghị dùng **IAM Identity Center** làm lớp trung gian khi có nhiều account.

### OIDC / Web identity federation

- Dành cho ứng dụng web/mobile với IdP như Google, Facebook, Amazon, Apple hoặc IdP OIDC bất kỳ.
- API: **AssumeRoleWithWebIdentity**. Với ứng dụng mobile, AWS khuyến nghị dùng **Cognito Identity Pools** thay vì gọi trực tiếp.
- Còn dùng cho workload: GitHub Actions, EKS (IRSA) assume role qua OIDC mà không cần access key.

## Amazon Cognito

### User Pools – xác thực (authentication)

- Thư mục người dùng được quản lý: sign-up, sign-in, xác minh email/SĐT, quên mật khẩu, MFA, hosted UI.
- Liên kết đăng nhập mạng xã hội (Google, Facebook, Apple, Amazon) và IdP doanh nghiệp (SAML, OIDC).
- Trả về **JWT** (ID token, access token, refresh token).
- Tích hợp trực tiếp: **API Gateway** (Cognito authorizer), **Application Load Balancer** (listener rule authenticate-cognito).
- Lambda triggers để tùy biến luồng (pre sign-up, post confirmation...).

### Identity Pools – phân quyền (authorization tới AWS)

- Đổi token (từ User Pool, social IdP, SAML, OIDC hoặc developer-authenticated) lấy **temporary AWS credentials**.
- Hỗ trợ **guest (unauthenticated) access** với role riêng có quyền hạn chế.
- Có thể dùng policy variable như cognito-identity.amazonaws.com:sub để mỗi user chỉ truy cập prefix S3 riêng của mình hoặc item DynamoDB của mình (fine-grained access control).

| Tiêu chí | User Pool | Identity Pool |
|---|---|---|
| Mục đích | Xác thực người dùng ứng dụng | Cấp AWS credentials tạm thời |
| Đầu ra | JWT tokens | Access key/secret/session token (STS) |
| Truy cập trực tiếp S3/DynamoDB từ app | Không | Có |
| Guest access | Không | Có |
| Tích hợp ALB/API Gateway | Có | Không trực tiếp |

Kết hợp phổ biến: user đăng nhập qua User Pool, rồi đổi JWT ở Identity Pool để upload ảnh thẳng lên S3.

## AWS Directory Service

| Lựa chọn | Bản chất | Khi nào chọn |
|---|---|---|
| AWS Managed Microsoft AD | Active Directory thật do AWS quản lý (multi-AZ) | Cần AD đầy đủ trên AWS, ứng dụng AD-aware, cần **trust** với AD on-premises, MFA, hàng nghìn user |
| AD Connector | Proxy chuyển request về AD on-premises, không lưu cache dữ liệu thư mục | Muốn dùng AD on-prem sẵn có cho các service AWS (WorkSpaces, IAM Identity Center, console), không muốn đồng bộ dữ liệu lên cloud; cần VPN/Direct Connect |
| Simple AD | Thư mục tương thích AD dựa trên Samba | Nhu cầu nhỏ, chi phí thấp, không cần trust, không cần tính năng AD nâng cao |

Điểm thi:

- "Trust relationship với on-prem AD" hoặc "chạy SQL Server/SharePoint cần AD trên AWS" → **AWS Managed Microsoft AD**.
- "Không muốn lưu thông tin thư mục trên cloud", "proxy" → **AD Connector**. AD Connector phụ thuộc kết nối tới on-prem; nếu đường truyền đứt thì xác thực lỗi.
- "Low cost, basic AD features, standalone" → **Simple AD**.

## Chọn giải pháp nào?

| Tình huống | Đáp án |
|---|---|
| Nhân viên dùng AD on-prem, cần đăng nhập console nhiều account | IAM Identity Center + AD Connector hoặc Managed Microsoft AD |
| Ứng dụng mobile có hàng triệu user, đăng nhập Google/Facebook | Cognito User Pool |
| App mobile upload trực tiếp lên S3 | Cognito Identity Pool |
| Có IdP SAML, chỉ một account | SAML federation với IAM role |
| Bảo vệ ứng dụng sau ALB bằng đăng nhập | ALB + Cognito User Pool hoặc OIDC IdP |

## Mẹo làm bài

- Cognito là đáp án mặc định cho "users of a mobile/web application" (customer identity). IAM Identity Center là đáp án cho workforce (nhân viên).
- Đừng tạo IAM user cho người dùng cuối của ứng dụng: không mở rộng được và vi phạm best practice.
`,
    keywords: [
      { trigger: 'hàng triệu người dùng mobile/web cần đăng ký, đăng nhập', answer: 'Amazon Cognito User Pool' },
      { trigger: 'người dùng ứng dụng cần credentials tạm thời để ghi trực tiếp vào S3', answer: 'Amazon Cognito Identity Pool' },
      { trigger: 'cho phép guest/unauthenticated access giới hạn', answer: 'Cognito Identity Pool với unauthenticated role' },
      { trigger: 'IdP doanh nghiệp tương thích SAML 2.0', answer: 'SAML federation (AssumeRoleWithSAML) hoặc IAM Identity Center' },
      { trigger: 'cần trust relationship giữa AD trên AWS và AD on-premises', answer: 'AWS Managed Microsoft AD' },
      { trigger: 'dùng AD on-prem mà không lưu dữ liệu thư mục trên cloud', answer: 'AD Connector' },
      { trigger: 'thư mục rẻ, đơn giản, không cần trust', answer: 'Simple AD' },
      { trigger: 'xác thực người dùng ngay tại load balancer', answer: 'ALB tích hợp Cognito User Pool / OIDC' },
    ],
    traps: [
      'User Pool chỉ trả JWT, không cấp AWS credentials; muốn gọi S3 trực tiếp cần Identity Pool.',
      'AD Connector không lưu cache, không chạy độc lập; mất kết nối on-prem là mất xác thực.',
      'Simple AD không hỗ trợ trust với AD khác.',
      'Tạo IAM user cho từng khách hàng của ứng dụng là sai thiết kế.',
      'Web identity federation trực tiếp vẫn đúng về kỹ thuật nhưng đề thường mong chọn Cognito.',
    ],
  },
  {
    slug: 'vpc-networking-security',
    domain: 'secure',
    title: 'Bảo mật VPC: Subnet, Security Group, NACL và NAT',
    summary:
      'Thiết kế VPC an toàn: public/private subnet, IGW, NAT Gateway, route table, Security Group vs NACL, truy cập quản trị không cần bastion và giám sát bằng Flow Logs.',
    services: ['Amazon VPC', 'NAT Gateway', 'AWS Systems Manager Session Manager', 'VPC Flow Logs', 'AWS Network Firewall'],
    minutes: 12,
    body: `## Thành phần cơ bản của VPC

- **VPC**: mạng ảo riêng trong một Region. CIDR IPv4 từ /16 đến /28, có thể thêm CIDR phụ và IPv6.
- **Subnet**: nằm trong **một AZ**. AWS giữ lại **5 địa chỉ IP** mỗi subnet (4 đầu và 1 cuối).
- **Internet Gateway (IGW)**: cho phép VPC ra/vào Internet, scale tự động, mỗi VPC gắn 1 IGW.
- **Route table**: quyết định traffic đi đâu. Subnet là **public** nếu route table có route 0.0.0.0/0 tới IGW. Subnet **private** không có route tới IGW.
- **Egress-only Internet Gateway**: cho IPv6 đi ra Internet mà không cho chiều vào (tương đương NAT cho IPv6).
- Địa chỉ **public IPv4 bị tính phí** theo giờ (kể cả Elastic IP đang dùng), nên hạn chế gán public IP không cần thiết.

## NAT Gateway vs NAT instance

Instance trong private subnet cần ra Internet (cập nhật patch, gọi API bên ngoài) nhưng không cho Internet khởi tạo kết nối vào → dùng NAT.

| Tiêu chí | NAT Gateway | NAT instance |
|---|---|---|
| Quản lý | AWS managed | Bạn tự quản lý EC2 |
| Sẵn sàng cao | Dự phòng trong một AZ; tạo một NAT GW mỗi AZ để chịu lỗi AZ | Phải tự làm failover bằng script |
| Băng thông | Tự scale tới 100 Gbps | Phụ thuộc loại instance |
| Security Group | Không gắn được | Gắn được |
| Bastion | Không dùng làm bastion được | Có thể kiêm bastion |
| Cấu hình đặc biệt | Đặt trong public subnet, có Elastic IP | Phải **tắt source/destination check** |

Kiến trúc chuẩn HA: mỗi AZ có một NAT Gateway trong public subnet, route table của private subnet cùng AZ trỏ tới NAT GW cùng AZ (tránh phí cross-AZ và tránh điểm lỗi đơn).

## Security Group vs Network ACL

| Tiêu chí | Security Group | Network ACL |
|---|---|---|
| Cấp áp dụng | ENI / instance | Subnet |
| Trạng thái | **Stateful**: response tự động được phép | **Stateless**: phải mở cả chiều về (ephemeral ports 1024-65535) |
| Loại rule | **Chỉ Allow** | **Allow và Deny** |
| Thứ tự đánh giá | Đánh giá tất cả rule | Theo số thứ tự, rule khớp đầu tiên thắng |
| Mặc định | Inbound chặn hết, outbound cho phép hết | Default NACL cho phép hết; custom NACL mới tạo chặn hết |
| Tham chiếu | Có thể tham chiếu Security Group khác | Chỉ dùng CIDR |

Điểm thi quan trọng:

- **Chặn một IP cụ thể** đang tấn công → thêm rule **Deny trong NACL** (Security Group không có Deny). Nếu ở trước là ALB/CloudFront thì dùng **AWS WAF**.
- Kiến trúc 3 tầng: SG của app chỉ cho phép inbound từ **SG của ALB**; SG của DB chỉ cho phép port DB từ **SG của app**. Tham chiếu SG an toàn hơn CIDR vì tự cập nhật khi scale.
- NACL quên mở ephemeral port outbound → client không nhận được phản hồi.

## Truy cập quản trị instance

- **Bastion host**: EC2 trong public subnet, SG chỉ mở SSH từ IP công ty; từ đó SSH vào private instance. Phải tự vá lỗi, quản lý key.
- **AWS Systems Manager Session Manager**: truy cập shell/RDP mà **không cần mở port inbound, không cần bastion, không cần SSH key**. Quyền kiểm soát bằng IAM, ghi log session vào S3/CloudWatch Logs, có audit trong CloudTrail. Instance cần SSM Agent, instance role phù hợp và đường ra endpoint SSM (qua NAT hoặc VPC interface endpoint).
- **EC2 Instance Connect**: đẩy SSH key tạm thời qua API; Instance Connect Endpoint cho phép SSH vào instance private không cần public IP.

Đề hỏi "most secure, least operational overhead to access private instances" → **Session Manager**.

## VPC Flow Logs

- Ghi metadata traffic IP (nguồn, đích, port, protocol, ACCEPT/REJECT) ở cấp VPC, subnet hoặc ENI.
- Đích: CloudWatch Logs, S3, Kinesis Data Firehose.
- Không ghi nội dung gói tin (payload). Muốn bắt gói tin → **Traffic Mirroring**.
- Dùng để chẩn đoán SG/NACL chặn traffic, phân tích bằng Athena; GuardDuty cũng phân tích Flow Logs.

## AWS Network Firewall

- Firewall managed, stateful, cấp VPC: lọc theo domain (FQDN), IP/port, IPS/IDS dùng rule tương thích Suricata.
- Triển khai trong subnet firewall riêng, chỉnh route table để traffic đi qua firewall endpoint.
- Kiến trúc tập trung: inspection VPC gắn với Transit Gateway để lọc traffic East-West và egress cho nhiều VPC.
- Quản lý chính sách đa account qua Firewall Manager.

| Nhu cầu | Chọn |
|---|---|
| Lọc HTTP layer 7 (SQLi, XSS) trước ALB/CloudFront | AWS WAF |
| Chặn outbound tới domain không được phép, IPS cho toàn VPC | AWS Network Firewall |
| Chặn truy vấn DNS tới domain độc hại | Route 53 Resolver DNS Firewall |
| Chặn IP ở cấp subnet | NACL |
| Cho phép traffic giữa các tầng ứng dụng | Security Group |

## Mẹo làm bài

- Private subnet + cần ra Internet → NAT Gateway trong **public** subnet.
- Private subnet + chỉ cần S3/DynamoDB → **gateway endpoint** (rẻ hơn NAT).
- "Stateless", "deny rule", "subnet level" → NACL; "stateful", "instance level" → Security Group.
`,
    keywords: [
      { trigger: 'chặn một địa chỉ IP cụ thể ở cấp subnet', answer: 'Network ACL với rule Deny' },
      { trigger: 'instance private cần tải bản vá từ Internet, managed, HA', answer: 'NAT Gateway trong public subnet ở mỗi AZ' },
      { trigger: 'truy cập shell instance private không mở port 22, không bastion', answer: 'AWS Systems Manager Session Manager' },
      { trigger: 'chỉ cho tầng app nhận traffic từ load balancer', answer: 'Security Group của app tham chiếu Security Group của ALB' },
      { trigger: 'ghi lại traffic bị REJECT để điều tra', answer: 'VPC Flow Logs' },
      { trigger: 'kiểm tra sâu gói tin, lọc domain outbound, IPS cho VPC', answer: 'AWS Network Firewall' },
      { trigger: 'IPv6 chỉ đi ra, không cho Internet khởi tạo vào', answer: 'Egress-only Internet Gateway' },
      { trigger: 'NAT instance không chuyển tiếp được traffic', answer: 'Tắt source/destination check' },
      { trigger: 'cần bắt nội dung gói tin để phân tích', answer: 'VPC Traffic Mirroring' },
    ],
    traps: [
      'Security Group không có rule Deny; để chặn IP phải dùng NACL hoặc WAF.',
      'NACL stateless: quên mở ephemeral ports chiều ngược lại khiến kết nối thất bại.',
      'NAT Gateway phải nằm ở public subnet, không phải private subnet; và không gắn Security Group được.',
      'Một NAT Gateway dùng chung cho mọi AZ là điểm lỗi đơn khi AZ đó sập.',
      'VPC Flow Logs không chứa payload gói tin.',
      'Custom NACL mới tạo mặc định Deny tất cả, còn default NACL thì Allow tất cả.',
    ],
  },
  {
    slug: 'vpc-connectivity',
    domain: 'secure',
    title: 'Kết nối VPC: Peering, Transit Gateway, Endpoint, VPN và Direct Connect',
    summary:
      'Kết nối giữa các VPC, tới dịch vụ AWS một cách riêng tư và tới data center on-premises: chọn đúng giải pháp theo độ phức tạp, băng thông, bảo mật và chi phí.',
    services: ['VPC Peering', 'AWS Transit Gateway', 'VPC Endpoints', 'AWS PrivateLink', 'AWS Site-to-Site VPN', 'AWS Client VPN', 'AWS Direct Connect'],
    minutes: 12,
    body: `## VPC Peering

- Kết nối riêng giữa **hai** VPC (cùng hoặc khác account, cùng hoặc khác Region), traffic đi trên mạng backbone AWS.
- **Không transitive**: A peer B, B peer C thì A không nói chuyện được với C.
- CIDR **không được chồng lấn**.
- Phải cập nhật route table ở cả hai phía; SG có thể tham chiếu SG của VPC peer (cùng Region).
- Không có phí cố định, chỉ trả phí data transfer. Phù hợp khi số VPC ít.

## AWS Transit Gateway

- Mô hình **hub-and-spoke**: hàng nghìn VPC và kết nối on-prem nối vào một gateway trung tâm, **hỗ trợ transitive routing**.
- Gắn được: VPC, Site-to-Site VPN, Direct Connect (qua Direct Connect Gateway và transit VIF), peering TGW khác Region.
- Route table của TGW cho phép phân đoạn mạng (ví dụ Dev không nói chuyện với Prod).
- Hỗ trợ **ECMP** với VPN để cộng gộp băng thông nhiều tunnel; hỗ trợ IP multicast.
- Chia sẻ TGW giữa các account bằng **RAM**.

| Tiêu chí | VPC Peering | Transit Gateway |
|---|---|---|
| Transitive | Không | Có |
| Quy mô | Vài VPC (mesh n*(n-1)/2 kết nối) | Hàng nghìn VPC |
| Chi phí | Chỉ data transfer | Phí mỗi attachment theo giờ + data processing |
| Quản lý | Phức tạp khi nhiều VPC | Tập trung |

## VPC Endpoints

Cho phép tài nguyên trong VPC truy cập dịch vụ AWS **không đi qua Internet, IGW hay NAT**.

| Tiêu chí | Gateway endpoint | Interface endpoint (PrivateLink) |
|---|---|---|
| Dịch vụ | **Chỉ S3 và DynamoDB** | Hầu hết dịch vụ AWS (gồm cả S3), dịch vụ SaaS, dịch vụ của bạn |
| Cơ chế | Mục tiêu trong route table (prefix list) | ENI có IP private trong subnet |
| Chi phí | **Miễn phí** | Tính theo giờ + theo GB |
| Truy cập từ on-prem qua VPN/DX | Không | Có |
| Bảo mật | Endpoint policy | Endpoint policy + Security Group |

- Endpoint policy giới hạn bucket nào được truy cập; bucket policy có thể yêu cầu aws:SourceVpce hoặc aws:SourceVpc để chỉ cho truy cập từ endpoint.
- Khi đề nói "private subnet truy cập S3, giảm chi phí NAT" → **gateway endpoint**.
- Interface endpoint cần bật private DNS để SDK dùng tên mặc định của service.

## AWS PrivateLink

- Công nghệ đằng sau interface endpoint. Cho phép **cung cấp dịch vụ của bạn** (đặt sau **Network Load Balancer** hoặc Gateway Load Balancer) cho VPC khác/account khác/khách hàng mà **không cần peering, không lộ cả VPC**, không quan tâm CIDR chồng lấn.
- Chỉ hướng một chiều: consumer khởi tạo kết nối tới service.
- Đề: "expose a service to hundreds of customer VPCs, overlapping CIDRs, private" → **PrivateLink**.

## Site-to-Site VPN

- Kết nối IPsec mã hóa qua Internet giữa on-prem (**Customer Gateway**) và AWS (**Virtual Private Gateway** gắn VPC, hoặc **Transit Gateway**).
- Mỗi kết nối có **2 tunnel** ở 2 endpoint khác nhau để HA; mỗi tunnel tối đa khoảng **1,25 Gbps**.
- Thiết lập nhanh (vài phút đến vài giờ), rẻ, nhưng độ trễ phụ thuộc Internet.
- Routing tĩnh hoặc động (BGP).

## AWS VPN CloudHub

- Nhiều văn phòng chi nhánh (nhiều Customer Gateway) kết nối tới **cùng một Virtual Private Gateway**, các chi nhánh nói chuyện với nhau qua AWS theo mô hình hub-and-spoke, dùng BGP với ASN khác nhau.
- Chi phí thấp, đi qua Internet có mã hóa.

## AWS Client VPN

- VPN do AWS quản lý dựa trên **OpenVPN** cho **từng người dùng** (laptop) truy cập VPC và mạng on-prem.
- Xác thực bằng Active Directory, SAML hoặc certificate (mutual authentication).

## AWS Direct Connect (DX)

- Đường kết nối vật lý **riêng** từ data center tới AWS qua DX location: băng thông ổn định, độ trễ thấp, phí data transfer out rẻ hơn Internet.
- **Dedicated connection**: 1, 10, 100 Gbps (cổng vật lý riêng). **Hosted connection**: qua đối tác, dung lượng nhỏ linh hoạt hơn.
- Thời gian triển khai thường **hơn một tháng** → không phải đáp án nếu cần kết nối ngay.
- **Virtual interfaces (VIF)**: private VIF (tới VPC qua VGW/DX Gateway), public VIF (tới endpoint public của AWS như S3), transit VIF (tới Transit Gateway).
- **Không mã hóa mặc định**. Muốn mã hóa: **Site-to-Site VPN chạy trên DX** (qua public VIF hoặc private IP VPN) hoặc **MACsec** (layer 2) trên các kết nối hỗ trợ.
- **Direct Connect Gateway**: một kết nối DX tới **nhiều VPC ở nhiều Region** (và nhiều account).

### Độ bền (resiliency)

| Mức | Thiết kế |
|---|---|
| Tiết kiệm chi phí | DX chính + **Site-to-Site VPN làm backup** |
| High resiliency | 2 kết nối DX ở **2 DX location khác nhau** |
| Maximum resiliency | 2 kết nối riêng biệt trên các thiết bị riêng ở **mỗi** trong 2 DX location |

## Chọn giải pháp

| Tình huống | Đáp án |
|---|---|
| Cần kết nối on-prem ngay hôm nay, mã hóa | Site-to-Site VPN |
| Băng thông lớn, ổn định, lâu dài | Direct Connect |
| DX nhưng cần mã hóa | VPN over DX hoặc MACsec |
| Kết nối 1 DX tới VPC ở nhiều Region | Direct Connect Gateway |
| Hàng trăm VPC + on-prem, transitive | Transit Gateway |
| Nhân viên làm việc từ xa | Client VPN |
| Nhiều chi nhánh liên lạc với nhau | VPN CloudHub |
`,
    keywords: [
      { trigger: 'kết nối hàng trăm VPC và on-prem, cần transitive routing', answer: 'AWS Transit Gateway' },
      { trigger: 'instance private truy cập S3/DynamoDB, không qua Internet, rẻ nhất', answer: 'Gateway VPC endpoint' },
      { trigger: 'cung cấp dịch vụ cho VPC khách hàng có CIDR chồng lấn', answer: 'AWS PrivateLink (endpoint service sau NLB)' },
      { trigger: 'cần kết nối mã hóa tới on-prem nhanh chóng', answer: 'AWS Site-to-Site VPN' },
      { trigger: 'băng thông lớn, độ trễ ổn định, kết nối riêng', answer: 'AWS Direct Connect' },
      { trigger: 'Direct Connect nhưng yêu cầu mã hóa', answer: 'IPsec VPN over Direct Connect hoặc MACsec' },
      { trigger: 'một kết nối DX tới VPC ở nhiều Region', answer: 'Direct Connect Gateway' },
      { trigger: 'backup rẻ cho Direct Connect', answer: 'Site-to-Site VPN làm đường dự phòng' },
      { trigger: 'nhiều chi nhánh kết nối với nhau qua AWS', answer: 'AWS VPN CloudHub' },
      { trigger: 'nhân viên từ xa truy cập VPC', answer: 'AWS Client VPN' },
    ],
    traps: [
      'VPC Peering không transitive và không cho phép CIDR chồng lấn.',
      'Gateway endpoint chỉ hỗ trợ S3 và DynamoDB, và không truy cập được từ on-prem.',
      'Direct Connect không mã hóa mặc định và mất nhiều tuần để triển khai.',
      'PrivateLink yêu cầu Network Load Balancer (hoặc GWLB) phía provider, không phải ALB làm đích trực tiếp.',
      'NAT Gateway để truy cập S3 tốn phí data processing; gateway endpoint miễn phí.',
    ],
  },
  {
    slug: 'data-encryption-kms',
    domain: 'secure',
    title: 'Mã hóa dữ liệu: KMS, CloudHSM và bảo vệ S3/EBS/RDS',
    summary:
      'Mã hóa at rest và in transit, các loại KMS key, envelope encryption, các kiểu mã hóa S3, mã hóa EBS/RDS sẵn có và các cơ chế bảo vệ S3 như Block Public Access, Object Lock.',
    services: ['AWS KMS', 'AWS CloudHSM', 'Amazon S3', 'Amazon EBS', 'Amazon RDS', 'Amazon S3 Glacier'],
    minutes: 12,
    body: `## Mã hóa at rest và in transit

- **In transit**: TLS/HTTPS. Bắt buộc HTTPS cho S3 bằng bucket policy Deny khi aws:SecureTransport là false.
- **At rest**: dữ liệu lưu trên đĩa được mã hóa bằng key, phần lớn qua AWS KMS.

## AWS KMS

| Loại key | Ai quản lý | Rotation | Ghi chú |
|---|---|---|---|
| AWS owned key | AWS, dùng chung nhiều account | AWS lo | Không thấy trong account, miễn phí |
| AWS managed key (aws/s3, aws/ebs...) | AWS tạo trong account bạn | Tự động mỗi năm | Không sửa key policy, không chia sẻ cross-account |
| Customer managed key (CMK) | Bạn | Tự chọn bật, chu kỳ cấu hình được, hoặc on-demand | Toàn quyền key policy, grants, cross-account, disable, xóa (chờ 7-30 ngày) |

- **Key policy** là resource-based policy bắt buộc của mọi KMS key. Muốn account khác dùng key → thêm account đó vào key policy **và** cấp IAM policy ở account kia.
- Muốn chia sẻ snapshot EBS/RDS mã hóa cross-account → phải dùng **customer managed key** (không chia sẻ được snapshot mã hóa bằng AWS managed key).
- KMS key là theo **Region**. **Multi-Region keys**: các key ở nhiều Region có cùng key ID và key material, giải mã được ở Region khác mà không cần gọi chéo Region (dùng cho DynamoDB global tables, client-side encryption đa Region). Mỗi key vẫn quản lý độc lập, không phải global.
- Giới hạn API: Encrypt trực tiếp tối đa **4 KB** dữ liệu. Có quota số request/giây; SSE-KMS với lưu lượng lớn có thể bị throttling → bật **S3 Bucket Keys** để giảm request tới KMS (và giảm chi phí).
- Mọi lần dùng key được ghi lại trong **CloudTrail**.

### Envelope encryption

1. Gọi GenerateDataKey → KMS trả data key dạng plaintext và dạng mã hóa.
2. Dùng data key plaintext mã hóa dữ liệu lớn ở phía client, xóa plaintext khỏi bộ nhớ.
3. Lưu data key mã hóa cùng dữ liệu. Khi giải mã: gọi Decrypt để lấy lại data key.

Lợi ích: dữ liệu lớn không phải gửi tới KMS, chỉ gửi data key nhỏ.

## AWS CloudHSM

- HSM **single-tenant** chuyên dụng trong VPC của bạn, chứng nhận FIPS 140 Level 3.
- **Bạn quản lý key và user hoàn toàn**; AWS không truy cập được key. Mất credentials là mất key.
- Dùng khi đề yêu cầu: kiểm soát độc quyền key, HSM chuyên dụng, SSL offloading, Oracle TDE, PKCS#11/JCE.
- Có thể làm **custom key store** cho KMS để vừa tích hợp KMS vừa giữ key trong HSM của mình.

## Mã hóa S3

Từ tháng 1/2023 mọi object mới được **mã hóa mặc định bằng SSE-S3**.

| Kiểu | Ai quản lý key | Khi nào chọn |
|---|---|---|
| SSE-S3 | S3 (AES-256) | Mặc định, không cần quản lý key |
| SSE-KMS | KMS key | Cần audit trong CloudTrail, kiểm soát quyền dùng key, tách quyền |
| DSSE-KMS | KMS, mã hóa hai lớp | Tuân thủ yêu cầu dual-layer encryption |
| SSE-C | Khách hàng cung cấp key mỗi request | Muốn tự giữ key nhưng để S3 mã hóa; bắt buộc HTTPS, AWS không lưu key |
| Client-side | Khách hàng mã hóa trước khi upload | Dữ liệu không bao giờ tới AWS ở dạng plaintext |

Có thể ép kiểu mã hóa bằng bucket policy (Deny PutObject nếu header s3:x-amz-server-side-encryption không phải aws:kms). Lưu ý: bucket policy được đánh giá trước default encryption.

## Bảo vệ S3

- **Bucket policy**: resource-based, cho phép cross-account, ép HTTPS, giới hạn theo VPC endpoint, IP, aws:PrincipalOrgID.
- **Block Public Access**: 4 thiết lập ở cấp bucket và account; **bật mặc định cho bucket mới** (từ 2023). Ghi đè mọi policy/ACL public. ACL cũng bị tắt mặc định (Object Ownership = Bucket owner enforced).
- **Versioning + MFA Delete**: chống xóa nhầm; MFA Delete chỉ root user bật được qua CLI/API.
- **S3 Object Lock** (WORM, cần versioning):
  - **Governance mode**: user có quyền đặc biệt (s3:BypassGovernanceRetention) có thể ghi đè/xóa.
  - **Compliance mode**: **không ai**, kể cả root, xóa/sửa được tới khi hết hạn retention; không rút ngắn được.
  - **Legal hold**: giữ vô thời hạn tới khi gỡ, độc lập với retention period.
- **S3 Glacier Vault Lock**: gắn Vault Lock policy (WORM) cho vault; sau khi xác nhận lock (trong vòng 24 giờ ở trạng thái in-progress) thì policy **không thể thay đổi**.
- **Presigned URL**: cấp quyền tạm thời GET/PUT một object với quyền của người tạo URL; có thời hạn (tối đa 7 ngày khi ký bằng IAM user, ngắn hơn nếu dùng credentials tạm thời).

## Mã hóa EBS

- Mã hóa bằng KMS: dữ liệu at rest, data in transit giữa instance và volume, snapshot, volume tạo từ snapshot đều được mã hóa. Ảnh hưởng hiệu năng tối thiểu.
- Có thể bật **EBS encryption by default** theo Region.
- Không thể mã hóa trực tiếp volume đang có. Cách làm: **tạo snapshot → copy snapshot với tùy chọn encrypt → tạo volume mới từ snapshot mã hóa** → gắn vào instance.

## Mã hóa RDS / Aurora

- Bật mã hóa **khi tạo** DB. Không thể bật mã hóa cho DB instance đang chạy chưa mã hóa.
- Cách mã hóa DB có sẵn: **snapshot → copy snapshot bật encryption (chọn KMS key) → restore DB mới từ snapshot mã hóa** → chuyển ứng dụng sang endpoint mới.
- Read replica có cùng trạng thái mã hóa với primary.
- In transit: dùng SSL/TLS; có thể ép bằng parameter (ví dụ rds.force_ssl).
- RDS và Aurora hỗ trợ IAM database authentication cho MySQL/PostgreSQL.

## Mẹo làm bài

- "Audit who used the key", "separation of duties" → SSE-KMS với customer managed key.
- "Company must manage its own keys in dedicated hardware" → CloudHSM.
- "Prevent deletion for 7 years, even by root" → Object Lock compliance mode.
- "Share encrypted snapshot with another account" → re-encrypt bằng customer managed key và chia sẻ key.
`,
    keywords: [
      { trigger: 'audit việc sử dụng key, kiểm soát ai được giải mã', answer: 'SSE-KMS với customer managed key + CloudTrail' },
      { trigger: 'HSM single-tenant, khách hàng toàn quyền kiểm soát key', answer: 'AWS CloudHSM' },
      { trigger: 'không ai, kể cả root, xóa được object trong thời gian lưu trữ', answer: 'S3 Object Lock compliance mode' },
      { trigger: 'mã hóa RDS đang chạy chưa mã hóa', answer: 'Snapshot → copy snapshot có encryption → restore DB mới' },
      { trigger: 'chia sẻ snapshot mã hóa sang account khác', answer: 'Dùng customer managed KMS key và cấp quyền trong key policy' },
      { trigger: 'SSE-KMS bị throttling hoặc chi phí KMS cao', answer: 'Bật S3 Bucket Keys' },
      { trigger: 'giải mã cùng dữ liệu ở nhiều Region với cùng key', answer: 'KMS multi-Region keys' },
      { trigger: 'người dùng tạm thời tải/ghi một object riêng tư', answer: 'S3 presigned URL' },
      { trigger: 'khách hàng tự cung cấp key nhưng để S3 mã hóa', answer: 'SSE-C (bắt buộc HTTPS)' },
      { trigger: 'chính sách WORM cho archive không thể thay đổi', answer: 'S3 Glacier Vault Lock' },
    ],
    traps: [
      'Không thể bật mã hóa trực tiếp cho RDS hoặc EBS volume đang tồn tại; phải qua snapshot copy.',
      'AWS managed key không chia sẻ cross-account được; snapshot mã hóa bằng nó không share được.',
      'Governance mode cho phép user có quyền bypass xóa object; chỉ compliance mode chặn tuyệt đối.',
      'S3 đã mã hóa mặc định SSE-S3; câu hỏi yêu cầu audit key hoặc kiểm soát key thì SSE-S3 không đủ.',
      'KMS key thường là theo Region; multi-Region key vẫn là các key riêng có cùng key material, không phải key global.',
      'SSE-C không hoạt động qua HTTP và AWS không lưu key; mất key là mất dữ liệu.',
    ],
  },
  {
    slug: 'secrets-certificates',
    domain: 'secure',
    title: 'Secrets, Parameter Store, ACM và bảo vệ nội dung CloudFront',
    summary:
      'Lưu và xoay vòng secrets an toàn, quản lý chứng chỉ TLS bằng ACM, bảo vệ origin S3 bằng CloudFront OAC và phân phối nội dung riêng tư bằng signed URL/cookie.',
    services: ['AWS Secrets Manager', 'AWS Systems Manager Parameter Store', 'AWS Certificate Manager', 'Amazon CloudFront', 'Elastic Load Balancing'],
    minutes: 9,
    body: `## AWS Secrets Manager

- Lưu secrets (mật khẩu DB, API key, OAuth token), mã hóa bằng KMS.
- **Automatic rotation** theo lịch bằng Lambda; tích hợp sẵn cho Amazon RDS, Aurora, Redshift, DocumentDB (AWS cung cấp Lambda rotation mẫu).
- RDS/Aurora có thể để **RDS quản lý master password trong Secrets Manager** tự động.
- **Replicate secrets** sang Region khác cho DR và ứng dụng multi-Region.
- Resource-based policy cho phép truy cập cross-account.
- Tính phí theo số secret mỗi tháng và theo số API call.

## SSM Parameter Store

- Lưu cấu hình và secrets dạng phân cấp (ví dụ /prod/app/db-url).
- Kiểu: String, StringList, **SecureString** (mã hóa bằng KMS).
- **Standard tier**: miễn phí, giá trị tối đa 4 KB. **Advanced tier**: tối đa 8 KB, hỗ trợ parameter policies (ví dụ hết hạn, thông báo), có phí.
- **Không có rotation tự động tích hợp**; phải tự viết Lambda + EventBridge.
- Có thể tham chiếu secret trong Secrets Manager qua Parameter Store.

| Tiêu chí | Secrets Manager | Parameter Store |
|---|---|---|
| Rotation tự động | Có, tích hợp RDS/Aurora/Redshift | Không có sẵn |
| Chi phí | Trả theo secret + API call | Standard miễn phí |
| Cross-Region replication | Có | Không |
| Kích thước | Tới 64 KB | 4 KB (standard) / 8 KB (advanced) |
| Use case thi | Mật khẩu DB cần xoay vòng | Cấu hình, secret đơn giản, chi phí thấp |

Đề: "rotate database credentials automatically with least operational overhead" → **Secrets Manager**. "Store configuration values, low cost" → **Parameter Store**.

## AWS Certificate Manager (ACM)

- Cấp **chứng chỉ TLS public miễn phí** cho service tích hợp, **tự động gia hạn** (với domain validation qua DNS thì gia hạn hoàn toàn tự động).
- Tích hợp: **Elastic Load Balancing (ALB, NLB)**, **CloudFront**, **API Gateway**, App Runner, Elastic Beanstalk...
- Validation: DNS (khuyến nghị, dùng CNAME, hỗ trợ tự gia hạn) hoặc email.
- Có thể **import** chứng chỉ của bên thứ ba, nhưng **ACM không tự gia hạn chứng chỉ import** → dùng EventBridge/AWS Config để cảnh báo sắp hết hạn.
- Chứng chỉ dùng cho **CloudFront phải ở us-east-1**. Chứng chỉ cho ALB/API Gateway regional phải cùng Region với tài nguyên.
- Trong ngữ cảnh đề thi, chứng chỉ public của ACM được gắn vào service tích hợp chứ không cài tay lên EC2. AWS Private CA dùng để cấp chứng chỉ private nội bộ.

### TLS trên ALB và CloudFront

- **TLS termination tại ALB**: ALB giải mã, giảm tải CPU cho EC2; dùng SNI để phục vụ nhiều chứng chỉ trên một listener.
- Yêu cầu end-to-end encryption: ALB re-encrypt tới target bằng HTTPS (target dùng chứng chỉ riêng), hoặc dùng **NLB TCP passthrough** để target tự terminate TLS.
- CloudFront: Viewer Protocol Policy = Redirect HTTP to HTTPS hoặc HTTPS only; Origin Protocol Policy để mã hóa tới origin. Có **field-level encryption** để mã hóa trường nhạy cảm (số thẻ) từ edge.

## CloudFront Origin Access Control (OAC)

- Mục tiêu: **chỉ cho CloudFront đọc S3 bucket**, người dùng không truy cập trực tiếp URL S3.
- **OAC thay thế OAI** (legacy). OAC hỗ trợ SSE-KMS, mọi Region, các method PUT/DELETE, ký request bằng SigV4.
- Cấu hình: bucket để private (Block Public Access bật), bucket policy cho phép principal cloudfront.amazonaws.com với Condition AWS:SourceArn là ARN distribution.
- Với origin là ALB/EC2 (custom origin): không có OAC kiểu S3; dùng **custom header bí mật** do CloudFront thêm vào và ALB kiểm tra, kết hợp SG chỉ cho phép **managed prefix list của CloudFront**. CloudFront cũng hỗ trợ VPC origins cho ALB/EC2 trong private subnet.

## Signed URL vs Signed Cookie

| Tiêu chí | Signed URL | Signed Cookie |
|---|---|---|
| Phạm vi | Một file | Nhiều file (cả thư mục, toàn site premium) |
| Thay đổi URL | Có (thêm tham số) | Không |
| Ví dụ | Link tải một bản cài đặt | Người dùng trả phí xem toàn bộ video |

- Ký bằng key pair; best practice dùng **trusted key groups** (không cần root user như CloudFront key pair cũ).
- Policy: canned (đơn giản, thời gian hết hạn) hoặc custom (thêm IP, thời gian bắt đầu, wildcard).

### CloudFront signed URL vs S3 presigned URL

| CloudFront signed URL | S3 presigned URL |
|---|---|
| Truy cập qua edge, có cache | Truy cập trực tiếp S3 |
| Origin có thể là S3 hoặc custom | Chỉ S3 |
| Hạn chế theo IP, thời gian (custom policy) | Dùng quyền của IAM principal ký URL |

## Mẹo làm bài

- "Hard-coded DB password in code" → Secrets Manager + rotation.
- "Users bypass CloudFront and hit S3 directly" → OAC + bucket policy.
- "Certificate for CloudFront" → ACM ở us-east-1.
- "Premium members access many files" → signed cookies.
`,
    keywords: [
      { trigger: 'tự động xoay vòng mật khẩu RDS ít vận hành nhất', answer: 'AWS Secrets Manager với rotation' },
      { trigger: 'lưu cấu hình phân cấp, chi phí thấp, có thể mã hóa', answer: 'SSM Parameter Store (SecureString)' },
      { trigger: 'chứng chỉ TLS miễn phí, tự gia hạn cho ALB/CloudFront', answer: 'AWS Certificate Manager' },
      { trigger: 'chứng chỉ ACM cho CloudFront', answer: 'Phải tạo/import ở us-east-1' },
      { trigger: 'chỉ cho CloudFront truy cập bucket S3', answer: 'Origin Access Control (OAC) + bucket policy' },
      { trigger: 'người dùng trả phí truy cập nhiều file riêng tư qua CloudFront', answer: 'CloudFront signed cookies' },
      { trigger: 'cho phép tải một file riêng tư qua CloudFront có thời hạn', answer: 'CloudFront signed URL' },
      { trigger: 'chứng chỉ import sắp hết hạn', answer: 'ACM không tự gia hạn cert import; cảnh báo bằng EventBridge/AWS Config' },
    ],
    traps: [
      'Parameter Store không có rotation tự động tích hợp như Secrets Manager.',
      'OAI là cơ chế cũ; đề mới chọn OAC, đặc biệt khi bucket dùng SSE-KMS.',
      'Chứng chỉ ACM cho CloudFront ở Region khác us-east-1 sẽ không chọn được.',
      'ACM không tự gia hạn chứng chỉ được import từ bên ngoài.',
      'Signed URL cho nhiều file cùng lúc là kém tiện; nhiều file → signed cookies.',
    ],
  },
  {
    slug: 'threat-detection-waf-shield',
    domain: 'secure',
    title: 'Phát hiện mối đe dọa: WAF, Shield, GuardDuty và giám sát',
    summary:
      'Bộ công cụ bảo vệ và phát hiện: WAF, Shield, Firewall Manager, GuardDuty, Inspector, Macie, Security Hub, Detective, cùng CloudTrail, AWS Config, CloudWatch và EventBridge để tự động khắc phục.',
    services: ['AWS WAF', 'AWS Shield', 'AWS Firewall Manager', 'Amazon GuardDuty', 'Amazon Inspector', 'Amazon Macie', 'AWS Security Hub', 'Amazon Detective', 'AWS CloudTrail', 'AWS Config', 'Amazon CloudWatch', 'Amazon EventBridge'],
    minutes: 12,
    body: `## AWS WAF

- Web Application Firewall **layer 7** (HTTP/HTTPS).
- Gắn vào: **CloudFront, Application Load Balancer, API Gateway (REST), AppSync, Cognito User Pool**, App Runner, Verified Access. **Không gắn vào NLB hay EC2 trực tiếp**.
- Web ACL gồm rules:
  - IP set (cho phép/chặn IP), **geo match** (chặn quốc gia).
  - **Rate-based rule**: chặn IP gửi quá nhiều request trong khoảng thời gian (chống HTTP flood, brute force).
  - Chặn **SQL injection, cross-site scripting (XSS)**, kiểm tra header, body, kích thước.
  - **AWS Managed Rules** và rule từ AWS Marketplace; Bot Control, Account Takeover Prevention.
- Log tới CloudWatch Logs, S3 hoặc Firehose.

## AWS Shield

| Tiêu chí | Shield Standard | Shield Advanced |
|---|---|---|
| Chi phí | Miễn phí, tự động cho mọi account | Khoảng 3.000 USD/tháng mỗi organization + phí data |
| Bảo vệ | DDoS layer 3/4 phổ biến (SYN flood, UDP reflection) | DDoS tinh vi hơn cho EC2, ELB, CloudFront, Global Accelerator, Route 53 |
| Hỗ trợ | Không | **Shield Response Team (SRT)** 24/7 |
| Bảo vệ chi phí | Không | **Cost protection**: hoàn phí scaling do DDoS |
| Khác | | Phát hiện và giảm thiểu DDoS layer 7 tự động bằng WAF, phí WAF cho tài nguyên được bảo vệ đã gồm |

Đề: "protect against DDoS, need 24/7 DDoS experts and cost protection" → **Shield Advanced**.

## AWS Firewall Manager

- Quản lý **tập trung** chính sách bảo mật trên nhiều account trong **AWS Organizations** (bắt buộc dùng Organizations và AWS Config).
- Quản lý: WAF rules, Shield Advanced, Security Groups, Network Firewall, Route 53 Resolver DNS Firewall, các policy firewall bên thứ ba.
- Tự áp chính sách cho tài nguyên **mới tạo** (ví dụ mọi ALB mới đều được gắn WAF).

## Nhóm phát hiện và đánh giá

| Service | Làm gì | Từ khóa đề |
|---|---|---|
| **GuardDuty** | Phát hiện mối đe dọa bằng ML/threat intel từ CloudTrail management events, VPC Flow Logs, DNS logs; tùy chọn S3, EKS, RDS login, Lambda, malware protection | "Phát hiện hoạt động độc hại, đào coin (cryptocurrency mining), credentials bị lộ, gọi API bất thường" |
| **Inspector** | Quét lỗ hổng (CVE) và network reachability tự động cho EC2, container image trong ECR, Lambda | "Vulnerability scanning", "software vulnerabilities", "CVE" |
| **Macie** | Dùng ML phát hiện **dữ liệu nhạy cảm (PII)** trong S3 | "Find PII / sensitive data in S3" |
| **Security Hub** | Tổng hợp findings từ GuardDuty, Inspector, Macie, Config...; kiểm tra theo chuẩn (CIS, AWS Foundational Security Best Practices); đa account | "Single dashboard / centralized view of security findings" |
| **Detective** | Điều tra nguyên nhân gốc, trực quan hóa mối liên hệ từ log | "Investigate root cause of findings" |
| **Trusted Advisor** | Khuyến nghị best practice (chi phí, bảo mật, hiệu năng...) | "Check for open security groups, MFA on root" |

GuardDuty bật chỉ với một thao tác, **không cần bật Flow Logs hay CloudTrail trail riêng** (nó đọc nguồn dữ liệu độc lập).

## Ghi log và tuân thủ

### AWS CloudTrail

- Ghi lại **API call** (ai, khi nào, từ đâu, làm gì). Event history 90 ngày cho management events có sẵn.
- Tạo **trail** để lưu lâu dài vào S3 (và CloudWatch Logs); **organization trail** ghi cho mọi account.
- **Data events** (S3 object-level, Lambda invoke) mặc định không ghi, phải bật (có phí).
- **Log file integrity validation** để chứng minh log không bị sửa. Bảo vệ thêm bằng bucket riêng, Object Lock, SCP chặn StopLogging.
- CloudTrail Insights phát hiện lưu lượng API bất thường; CloudTrail Lake để truy vấn SQL.

### AWS Config

- Ghi lại **cấu hình tài nguyên và lịch sử thay đổi**, đánh giá **tuân thủ** bằng Config rules (managed hoặc custom Lambda).
- Ví dụ: S3 bucket có public không, EBS có mã hóa không, SG có mở 22 tới 0.0.0.0/0 không.
- **Remediation** tự động bằng SSM Automation documents.
- Conformance packs; aggregator đa account/Region.
- Config là **detective** (phát hiện sau khi xảy ra), không chặn hành động trước. Muốn chặn trước → SCP/IAM.

| Câu hỏi | Service |
|---|---|
| Ai đã xóa security group này? | CloudTrail |
| Security group này trông thế nào tuần trước? Có tuân thủ không? | AWS Config |
| CPU vượt 80% thì cảnh báo | CloudWatch alarm |

### CloudWatch

- **CloudWatch Logs**: tập trung log ứng dụng, VPC Flow Logs, CloudTrail; **metric filter** tạo metric từ log (ví dụ đếm số lần đăng nhập console thất bại hoặc root login) → **alarm** → SNS.
- Logs Insights để truy vấn; mã hóa log group bằng KMS; đặt retention.
- CloudWatch agent để thu log và metric bộ nhớ/đĩa từ EC2.

### EventBridge cho tự động khắc phục

- Bắt sự kiện từ GuardDuty finding, Config compliance change, CloudTrail API call, Security Hub, ACM sắp hết hạn...
- Đích: **Lambda**, SSM Automation, SNS, Step Functions để tự động xử lý (cách ly instance, thu hồi key, đóng port).
- Mẫu kinh điển: GuardDuty finding → EventBridge rule → Lambda đổi Security Group của EC2 bị nhiễm sang SG cách ly + SNS thông báo.

## Mẹo làm bài

- SQL injection/XSS → WAF; DDoS L3/L4 → Shield; mối đe dọa trong account → GuardDuty; lỗ hổng phần mềm → Inspector; PII trong S3 → Macie.
- Áp WAF/SG chuẩn cho mọi account kể cả tài nguyên mới → Firewall Manager.
- "Automatically remediate" → EventBridge + Lambda hoặc Config rule + SSM Automation.
`,
    keywords: [
      { trigger: 'chặn SQL injection, XSS trước ALB/CloudFront', answer: 'AWS WAF' },
      { trigger: 'chặn IP gửi quá nhiều request (HTTP flood)', answer: 'WAF rate-based rule' },
      { trigger: 'DDoS, cần đội phản ứng 24/7 và bảo vệ chi phí', answer: 'AWS Shield Advanced' },
      { trigger: 'áp WAF rule cho mọi account và tài nguyên mới trong organization', answer: 'AWS Firewall Manager' },
      { trigger: 'phát hiện đào coin, gọi API bất thường, credentials bị lộ', answer: 'Amazon GuardDuty' },
      { trigger: 'quét lỗ hổng phần mềm trên EC2, ECR, Lambda', answer: 'Amazon Inspector' },
      { trigger: 'tìm PII trong S3', answer: 'Amazon Macie' },
      { trigger: 'dashboard tập trung findings bảo mật đa account', answer: 'AWS Security Hub' },
      { trigger: 'ai đã thực hiện API call', answer: 'AWS CloudTrail' },
      { trigger: 'đánh giá tuân thủ cấu hình tài nguyên theo thời gian', answer: 'AWS Config rules' },
    ],
    traps: [
      'WAF không gắn được vào Network Load Balancer.',
      'Shield Standard đã miễn phí và tự động; chỉ chọn Advanced khi đề cần SRT, cost protection hoặc bảo vệ nâng cao.',
      'AWS Config phát hiện và khắc phục sau sự việc, không chặn được hành động trước khi xảy ra.',
      'CloudTrail không ghi data events (S3 object-level) mặc định.',
      'Inspector quét lỗ hổng phần mềm, GuardDuty phát hiện hành vi đe dọa; đừng nhầm hai service.',
      'Firewall Manager yêu cầu AWS Organizations.',
    ],
  },
];
