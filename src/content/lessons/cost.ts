import type { Lesson } from '@/content/types';

export const costLessons: Lesson[] = [
  {
    slug: 'ec2-pricing-models',
    domain: 'cost',
    title: 'Các mô hình giá EC2: On-Demand, RI, Savings Plans, Spot, Dedicated',
    summary:
      'Chọn đúng mô hình mua EC2 là cách tiết kiệm lớn nhất trong đề thi: Savings Plans/RI cho tải ổn định, Spot cho tải chịu được gián đoạn, Dedicated Host cho license BYOL.',
    services: [
      'Amazon EC2',
      'Savings Plans',
      'Reserved Instances',
      'Spot Instances',
      'EC2 Auto Scaling',
      'AWS Compute Optimizer',
      'AWS Graviton',
    ],
    minutes: 12,
    body: `## Tổng quan

Đề SAA-C03 gần như luôn có câu hỏi kiểu "workload chạy 24/7 trong 3 năm", "batch job có thể bị gián đoạn", "license phần mềm tính theo socket/core". Mỗi cụm từ này trỏ thẳng tới một mô hình giá. Hãy học theo cặp **đặc điểm workload → mô hình giá**.

## On-Demand

- Trả theo giây (Linux/Windows, tối thiểu 60 giây) hoặc theo giờ với một số OS khác.
- Không cam kết, không trả trước, giá cao nhất.
- Phù hợp: workload ngắn hạn, không dự đoán được, môi trường thử nghiệm, phần "vượt mức" trên baseline đã cam kết.

## Reserved Instances (RI)

- Cam kết **1 năm hoặc 3 năm**; trả trước All Upfront / Partial Upfront / No Upfront (trả trước càng nhiều, giảm càng sâu).
- **Standard RI**: giảm tới khoảng 72%. Có thể đổi AZ, kích thước trong cùng family (Linux, regional RI), nhưng **không đổi được instance family, OS, tenancy**. Có thể bán lại trên **Reserved Instance Marketplace**.
- **Convertible RI**: giảm ít hơn Standard, nhưng **đổi được family, OS, tenancy** (đổi sang RI có giá trị bằng hoặc cao hơn). Không bán trên Marketplace.
- **Regional RI** áp dụng giảm giá cho mọi AZ trong Region nhưng **không giữ capacity**. **Zonal RI** gắn với một AZ và **có reserve capacity**.
- RI cũng có cho RDS, ElastiCache, OpenSearch, Redshift (reserved nodes), DynamoDB (reserved capacity).

## Savings Plans

Cam kết **mức chi tiêu theo giờ** (ví dụ cam kết X USD/giờ) trong 1 hoặc 3 năm.

| Loại | Giảm tới | Áp dụng cho | Linh hoạt |
|---|---|---|---|
| Compute Savings Plans | ~66% | EC2 (mọi family, size, OS, tenancy, Region), AWS Fargate, AWS Lambda | Cao nhất |
| EC2 Instance Savings Plans | ~72% | Một instance family trong một Region (vd M7g ở us-east-1) | Đổi size, OS, tenancy trong family |
| SageMaker Savings Plans | (thấp hơn Compute SP) | SageMaker AI instance usage | Mọi instance family/Region của SageMaker |

- Cần chuyển Region, chuyển từ EC2 sang Fargate/Lambda, hoặc chưa chắc family → **Compute Savings Plans**.
- Chắc chắn dùng một family trong một Region và muốn giảm sâu nhất → **EC2 Instance Savings Plans** (hoặc Standard RI).
- AWS khuyến nghị Savings Plans thay cho RI với EC2 vì ít phải quản lý hơn.

## Spot Instances

- Dùng capacity dư của AWS, **rẻ tới 90%** so với On-Demand.
- Có thể bị thu hồi khi AWS cần lại capacity, với **thông báo trước 2 phút** (qua instance metadata và sự kiện EventBridge "EC2 Spot Instance Interruption Warning"). Ngoài ra có **EC2 Instance Rebalance Recommendation** báo sớm khi instance có rủi ro bị thu hồi cao.
- Hành vi khi bị gián đoạn: terminate (mặc định), stop hoặc hibernate.
- Phù hợp: batch processing, big data, CI/CD, render, HPC, stateless web có thể chịu lỗi, container workers. **Không** phù hợp: database chính, job phải hoàn thành trong thời hạn cứng mà không có checkpoint.

### Spot Fleet và Auto Scaling mixed instances

- **Spot Fleet / EC2 Fleet**: tập hợp Spot (và tùy chọn On-Demand) để đạt target capacity. Chiến lược phân bổ: lowestPrice, diversified, capacityOptimized, **priceCapacityOptimized** (khuyến nghị: ưu tiên pool ít bị gián đoạn nhưng giá thấp).
- **Auto Scaling group với mixed instances policy**: đặt một **On-Demand base capacity** (vd 2 instance luôn On-Demand), phần còn lại theo tỷ lệ On-Demand/Spot, khai báo nhiều instance type để đa dạng hóa pool. Đây là đáp án điển hình cho "giữ một baseline ổn định nhưng tối ưu chi phí cho phần tăng tải".
- Capacity Rebalancing trong ASG chủ động thay instance Spot sắp bị thu hồi.

## Dedicated Hosts vs Dedicated Instances

| Tiêu chí | Dedicated Host | Dedicated Instance |
|---|---|---|
| Phần cứng riêng cho account | Có | Có |
| Thấy socket, core, host ID | Có | Không |
| BYOL theo socket/core/VM (Windows Server, SQL Server, Oracle) | Có (đáp án chuẩn) | Không phù hợp |
| Kiểm soát đặt instance lên host (host affinity) | Có | Không |
| Tính tiền | Theo host | Theo instance + phí theo Region |

- Từ khóa "server-bound software licenses", "compliance yêu cầu phần cứng vật lý riêng và theo dõi license" → **Dedicated Host**.
- Chỉ cần "không chia sẻ phần cứng với account khác" → Dedicated Instance là đủ và thường rẻ hơn.
- Dedicated Host cũng có On-Demand và Reservation (giảm giá tương tự RI).

## On-Demand Capacity Reservations

- Giữ capacity trong **một AZ cụ thể**, không cần cam kết thời hạn, hủy bất cứ lúc nào.
- Bị tính phí On-Demand **dù có chạy instance hay không**.
- Kết hợp với **Regional RI hoặc Savings Plans** để vừa có capacity vừa có giảm giá.
- Đề hay hỏi: "cần đảm bảo capacity cho sự kiện ngắn hạn (vd Black Friday) trong một AZ" → Capacity Reservation (không phải RI 1 năm).

## Graviton và right-sizing

- **AWS Graviton** (ARM): price/performance tốt hơn tới khoảng 40% so với x86 cùng thế hệ; dùng được cho EC2, Lambda (arm64), Fargate, RDS, Aurora, ElastiCache, OpenSearch. Cần ứng dụng tương thích ARM.
- **AWS Compute Optimizer**: dùng machine learning trên metric CloudWatch để đề xuất right-size cho EC2, Auto Scaling groups, EBS volumes, Lambda, ECS trên Fargate, RDS. Metric bộ nhớ cần **CloudWatch agent**.
- Right-size **trước**, rồi mới mua Savings Plans/RI, để không cam kết cho tài nguyên thừa.

## Cây quyết định nhanh

- Ổn định 24/7, biết trước 1–3 năm → Savings Plans / RI.
- Có thể gián đoạn, linh hoạt thời gian → Spot.
- Ngắn hạn, không đoán được → On-Demand.
- Cần chắc chắn có capacity trong AZ → Capacity Reservation (hoặc Zonal RI).
- License theo core/socket → Dedicated Host.
- Baseline + spike → ASG mixed instances (On-Demand/SP cho base, Spot cho phần tăng).`,
    keywords: [
      { trigger: 'steady-state workload for 1 or 3 years', answer: 'Savings Plans hoặc Reserved Instances' },
      { trigger: 'can change instance family, Region, or move to Fargate/Lambda', answer: 'Compute Savings Plans' },
      { trigger: 'fault-tolerant, can be interrupted, flexible start time', answer: 'Spot Instances' },
      { trigger: 'bring your own license per socket/per core', answer: 'Dedicated Hosts' },
      { trigger: 'guarantee capacity in a specific AZ for a short event', answer: 'On-Demand Capacity Reservation' },
      { trigger: 'baseline must always run, burst should be cheap', answer: 'Auto Scaling mixed instances policy (On-Demand base + Spot)' },
      { trigger: 'need to change instance family during the term with an RI', answer: 'Convertible Reserved Instances' },
      { trigger: 'over-provisioned instances, recommend right size', answer: 'AWS Compute Optimizer' },
      { trigger: 'better price performance, ARM-compatible app', answer: 'AWS Graviton instances' },
    ],
    traps: [
      'Spot không dành cho database chính hay job không chịu được gián đoạn, dù rẻ nhất.',
      'Regional RI và Savings Plans KHÔNG giữ capacity; muốn đảm bảo capacity phải dùng Zonal RI hoặc Capacity Reservation.',
      'Standard RI không đổi được instance family; nếu đề nói "có thể đổi family" thì chọn Convertible RI hoặc Compute Savings Plans.',
      'Dedicated Instance không cho thấy socket/core nên không đáp ứng BYOL theo socket; phải chọn Dedicated Host.',
      'Capacity Reservation bị tính tiền kể cả khi không chạy instance.',
      'EC2 Instance Savings Plans không áp dụng cho Fargate hay Lambda; chỉ Compute Savings Plans mới áp dụng.',
    ],
  },
  {
    slug: 's3-storage-classes',
    domain: 'cost',
    title: 'S3 Storage Classes, Lifecycle và công cụ phân tích chi phí S3',
    summary:
      'Chọn storage class theo tần suất truy cập và thời gian lấy lại dữ liệu, tự động chuyển lớp bằng lifecycle rules hoặc Intelligent-Tiering, chú ý thời gian lưu tối thiểu và phí truy xuất.',
    services: [
      'Amazon S3',
      'S3 Intelligent-Tiering',
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Flexible Retrieval',
      'S3 Glacier Deep Archive',
      'S3 Storage Lens',
      'S3 Inventory',
    ],
    minutes: 12,
    body: `## Nguyên tắc chung

- Mọi storage class đều có **durability 99.999999999% (11 số 9)**. Khác nhau ở **availability, số AZ, giá lưu trữ, phí truy xuất, thời gian lưu tối thiểu và thời gian lấy dữ liệu**.
- Lưu càng rẻ thì truy xuất càng đắt/chậm và thời gian lưu tối thiểu càng dài.
- Xóa object trước thời gian lưu tối thiểu vẫn bị tính tiền cho đủ thời gian đó.

## Các storage class

### S3 Standard
- Dữ liệu truy cập thường xuyên, độ trễ mili giây, ít nhất 3 AZ, không phí truy xuất, không thời gian lưu tối thiểu.

### S3 Intelligent-Tiering
- Tự động chuyển object giữa các tier theo mẫu truy cập: Frequent Access → Infrequent Access (sau 30 ngày không truy cập) → Archive Instant Access (sau 90 ngày). Có thể bật thêm Archive Access và Deep Archive Access (tùy chọn, truy xuất không tức thì).
- **Không có phí truy xuất**, không thời gian lưu tối thiểu; có **phí monitoring nhỏ theo object**. Object nhỏ hơn 128 KB không được monitor và luôn tính giá Frequent tier.
- Đáp án chuẩn khi đề nói **"unknown or changing access patterns"**.

### S3 Standard-IA
- Truy cập ít nhưng cần lấy ngay (mili giây). Nhiều AZ, availability 99.9%.
- Tối thiểu **30 ngày**, tính tối thiểu 128 KB/object, có **phí truy xuất theo GB**.

### S3 One Zone-IA
- Như Standard-IA nhưng chỉ **1 AZ**, rẻ hơn khoảng 20%, availability 99.5%.
- Dùng cho dữ liệu **có thể tạo lại** hoặc bản sao thứ cấp (vd bản replica cross-Region, thumbnail tạo lại được). Mất AZ là mất dữ liệu.

### S3 Glacier Instant Retrieval
- Dữ liệu lưu trữ lâu dài, truy cập khoảng **một lần mỗi quý**, nhưng khi cần phải lấy trong **mili giây** (vd ảnh y tế, tin tức lưu trữ).
- Tối thiểu **90 ngày**, phí truy xuất cao hơn Standard-IA nhưng giá lưu rẻ hơn.

### S3 Glacier Flexible Retrieval
- Lưu trữ, truy cập 1–2 lần/năm, không cần lấy ngay. Tối thiểu **90 ngày**.
- Tùy chọn truy xuất: **Expedited 1–5 phút**, **Standard 3–5 giờ**, **Bulk 5–12 giờ** (Bulk miễn phí truy xuất). Có thể mua Provisioned capacity để đảm bảo Expedited.

### S3 Glacier Deep Archive
- Rẻ nhất, cho dữ liệu giữ 7–10 năm vì compliance. Tối thiểu **180 ngày**.
- Standard **trong 12 giờ**, Bulk **trong 48 giờ**. Không có Expedited.

## Bảng so sánh

| Class | Availability (thiết kế) | AZ | Thời gian lưu tối thiểu | Phí truy xuất | Thời gian lấy dữ liệu |
|---|---|---|---|---|---|
| Standard | 99.99% | ≥3 | Không | Không | mili giây |
| Intelligent-Tiering | 99.9% | ≥3 | Không | Không (có phí monitoring) | mili giây (trừ tier Archive tùy chọn) |
| Standard-IA | 99.9% | ≥3 | 30 ngày | Có | mili giây |
| One Zone-IA | 99.5% | 1 | 30 ngày | Có | mili giây |
| Glacier Instant Retrieval | 99.9% | ≥3 | 90 ngày | Có | mili giây |
| Glacier Flexible Retrieval | 99.99% | ≥3 | 90 ngày | Có (Bulk miễn phí) | 1–5 phút / 3–5 giờ / 5–12 giờ |
| Glacier Deep Archive | 99.99% | ≥3 | 180 ngày | Có | trong 12 giờ / trong 48 giờ |

## Lifecycle rules

- **Transition actions**: chuyển object sang class rẻ hơn sau N ngày kể từ lúc tạo (vd Standard → Standard-IA sau 30 ngày → Glacier Flexible Retrieval sau 90 ngày → Deep Archive sau 365 ngày).
- **Expiration actions**: tự xóa object sau N ngày (vd log xóa sau 1 năm).
- Áp dụng theo prefix hoặc tag; có rule riêng cho **noncurrent versions** khi bật Versioning (rất hay bị quên, khiến bucket phình to).
- Rule **AbortIncompleteMultipartUpload** để dọn các phần upload dở dang (vẫn tính tiền lưu trữ).
- Ràng buộc: object phải ở Standard tối thiểu 30 ngày trước khi lifecycle chuyển sang Standard-IA hoặc One Zone-IA. Mặc định object nhỏ hơn 128 KB không được chuyển lớp vì không lợi về chi phí.
- **Storage Class Analysis** quan sát mẫu truy cập để gợi ý thời điểm chuyển sang Standard-IA.

## Công cụ khác

- **S3 Storage Lens**: dashboard cấp organization/account/bucket về dung lượng, hoạt động, khuyến nghị tối ưu chi phí và bảo vệ dữ liệu (vd bucket có nhiều noncurrent version, multipart upload chưa hoàn tất). Có free metrics và advanced metrics (trả phí).
- **S3 Inventory**: xuất danh sách object và metadata (storage class, encryption, replication status) định kỳ hằng ngày/tuần ra CSV, ORC hoặc Parquet; truy vấn bằng Athena. Thay thế cho việc gọi LIST API trên hàng tỷ object.
- **Requester Pays**: người gửi request trả phí request và data transfer, chủ bucket chỉ trả phí lưu trữ. Requester phải được xác thực (không anonymous). Dùng khi chia sẻ dataset lớn cho đối tác/bên ngoài.
- **S3 Batch Operations**: thay đổi storage class hàng loạt cho object có sẵn (kết hợp với S3 Inventory).

## Mẹo làm bài

- "Truy cập không đoán được" → Intelligent-Tiering.
- "Ít truy cập nhưng cần ngay khi truy cập, dữ liệu quan trọng" → Standard-IA.
- "Ít truy cập, tạo lại được" → One Zone-IA.
- "Lưu trữ, truy cập vài lần/năm, cần mili giây" → Glacier Instant Retrieval.
- "Lấy trong vài giờ được" → Glacier Flexible Retrieval; "trong 12–48 giờ, rẻ nhất" → Deep Archive.`,
    keywords: [
      { trigger: 'unknown or changing access patterns', answer: 'S3 Intelligent-Tiering' },
      { trigger: 'infrequently accessed but requires millisecond access, must survive AZ loss', answer: 'S3 Standard-IA' },
      { trigger: 'infrequently accessed and easily reproducible data', answer: 'S3 One Zone-IA' },
      { trigger: 'archive accessed once a quarter, retrieval in milliseconds', answer: 'S3 Glacier Instant Retrieval' },
      { trigger: 'retrieve archive within minutes occasionally', answer: 'Glacier Flexible Retrieval với Expedited retrieval' },
      { trigger: 'retain 7–10 years for compliance, retrieval within 48 hours acceptable', answer: 'S3 Glacier Deep Archive' },
      { trigger: 'organization-wide visibility into S3 usage and cost recommendations', answer: 'S3 Storage Lens' },
      { trigger: 'share large dataset, consumers pay for download', answer: 'S3 Requester Pays' },
      { trigger: 'list billions of objects and their storage class daily', answer: 'S3 Inventory' },
    ],
    traps: [
      'One Zone-IA chỉ ở 1 AZ; không dùng cho dữ liệu duy nhất không thể tạo lại.',
      'Standard-IA và Glacier có phí truy xuất; dữ liệu bị đọc thường xuyên để ở IA có thể đắt hơn Standard.',
      'Glacier Deep Archive không có Expedited retrieval; nếu cần dữ liệu trong vài phút thì Deep Archive sai.',
      'Xóa hoặc chuyển object trước thời gian lưu tối thiểu (30/90/180 ngày) vẫn bị tính đủ phí.',
      'Intelligent-Tiering không có phí truy xuất nhưng có phí monitoring theo object; với hàng tỷ object rất nhỏ thì không lợi.',
      'Bật Versioning mà không có lifecycle rule cho noncurrent versions làm chi phí tăng âm thầm.',
    ],
  },
  {
    slug: 'cost-management-tools',
    domain: 'cost',
    title: 'Công cụ quản lý chi phí: Cost Explorer, Budgets, CUR, Tags, Anomaly Detection',
    summary:
      'Biết công cụ nào để xem, dự báo, cảnh báo, phân bổ và tự động phản ứng với chi phí AWS; đề thường hỏi chọn đúng công cụ với ít công sức vận hành nhất.',
    services: [
      'AWS Cost Explorer',
      'AWS Budgets',
      'AWS Cost and Usage Report',
      'AWS Data Exports',
      'AWS Cost Anomaly Detection',
      'AWS Trusted Advisor',
      'AWS Compute Optimizer',
      'AWS Pricing Calculator',
      'AWS Organizations',
      'AWS Billing Conductor',
    ],
    minutes: 10,
    body: `## Bản đồ công cụ

| Nhu cầu | Công cụ |
|---|---|
| Xem, lọc, nhóm chi phí theo service/account/tag; dự báo | AWS Cost Explorer |
| Đặt ngưỡng và nhận cảnh báo, tự động hành động khi vượt | AWS Budgets (+ Budget actions) |
| Dữ liệu chi tiết nhất (từng resource, từng giờ) để phân tích bằng SQL/BI | Cost and Usage Report / AWS Data Exports (CUR 2.0) |
| Phát hiện chi tiêu bất thường bằng ML | AWS Cost Anomaly Detection |
| Kiểm tra best practice: tài nguyên nhàn rỗi, EIP không dùng | AWS Trusted Advisor |
| Gợi ý right-size dựa trên metric | AWS Compute Optimizer |
| Ước tính chi phí trước khi triển khai | AWS Pricing Calculator |
| Một hóa đơn cho nhiều account, chia sẻ giảm giá | Consolidated billing (AWS Organizations) |
| Hóa đơn tùy chỉnh (showback/chargeback, reseller) | AWS Billing Conductor |

## AWS Cost Explorer

- Giao diện trực quan xem chi phí và usage theo ngày/tháng (có granularity theo giờ nếu bật), lọc theo service, linked account, Region, tag, cost category.
- **Forecast** chi phí tương lai dựa trên lịch sử.
- Có **khuyến nghị mua Savings Plans và RI**, báo cáo **utilization** (đã dùng hết cam kết chưa) và **coverage** (bao nhiêu % usage được cam kết che phủ).
- Có khuyến nghị right-sizing EC2 cơ bản.

## AWS Budgets

- Loại budget: **cost**, **usage**, **RI utilization/coverage**, **Savings Plans utilization/coverage**.
- Cảnh báo theo **chi phí thực tế hoặc dự báo** (forecasted) qua email hoặc **Amazon SNS** (từ đó tới Chatbot/Slack, Lambda).
- **Budget actions**: khi vượt ngưỡng có thể tự động **áp dụng IAM policy**, **áp dụng SCP** (trong Organizations) hoặc **dừng EC2/RDS instance** cụ thể; có thể chạy tự động hoặc chờ phê duyệt.
- Đề hỏi "ngăn developer tạo thêm tài nguyên khi vượt budget với ít công sức nhất" → Budgets + Budget action áp dụng IAM policy/SCP deny.

## Cost and Usage Report / Data Exports

- Bộ dữ liệu billing **chi tiết nhất** (theo giờ, theo resource ID, kèm tag), giao vào **S3 bucket**.
- **AWS Data Exports** là cách tạo export hiện nay: **CUR 2.0** (chọn cột bằng câu lệnh kiểu SQL, schema ổn định), ngoài ra có export theo chuẩn **FOCUS** và export cho Cost Optimization Recommendations.
- Phân tích bằng **Amazon Athena**, trực quan bằng **Amazon QuickSight** (giải pháp Cloud Intelligence Dashboards).
- Đề nói "cần dữ liệu chi phí chi tiết từng resource để truy vấn SQL" → CUR/Data Exports + Athena.

## Cost allocation tags

- Hai loại: **AWS-generated** (vd aws:createdBy) và **user-defined** (vd CostCenter, Project, Environment).
- Phải **kích hoạt (activate)** trong Billing console của **management account** thì tag mới xuất hiện trong Cost Explorer/CUR. Không có hiệu lực hồi tố cho dữ liệu trước khi kích hoạt.
- Dùng **Tag Policies** (Organizations) để chuẩn hóa tên/giá trị tag, và SCP/IAM với điều kiện aws:RequestTag để bắt buộc gắn tag khi tạo resource.
- **Cost Categories** nhóm chi phí theo quy tắc (account, tag, service) thành đơn vị kinh doanh.

## AWS Cost Anomaly Detection

- Dùng **machine learning** học mẫu chi tiêu, phát hiện bất thường và **root cause** (service, account, Region, usage type).
- Tạo **cost monitor** (theo service, linked account, cost category, tag) và **alert subscription** (gửi ngay qua SNS hoặc tóm tắt hằng ngày/tuần qua email).
- Khác với Budgets: Budgets dùng **ngưỡng cố định do bạn đặt**; Anomaly Detection **không cần đặt ngưỡng**, tự phát hiện mức tăng bất thường.

## AWS Trusted Advisor

- Kiểm tra theo các nhóm: cost optimization, performance, security, fault tolerance, service limits, operational excellence.
- Check cost điển hình: EC2 utilization thấp, load balancer nhàn rỗi, **Elastic IP không gắn**, EBS volume ít dùng, RDS nhàn rỗi, RI sắp hết hạn.
- **Toàn bộ check** chỉ có với gói **Business Support trở lên** (Enterprise On-Ramp/Enterprise); Basic/Developer chỉ có các check cốt lõi.

## Compute Optimizer vs Trusted Advisor vs Cost Explorer

- **Compute Optimizer**: right-sizing sâu bằng ML trên CloudWatch metrics (EC2, ASG, EBS, Lambda, ECS Fargate, RDS), cho biết over-/under-provisioned.
- **Trusted Advisor**: danh sách kiểm tra rộng, phát hiện tài nguyên nhàn rỗi.
- **Cost Explorer**: phân tích chi phí và khuyến nghị mua SP/RI.

## Pricing Calculator

- Ước tính chi phí kiến trúc **trước khi xây**; xuất và chia sẻ estimate. Không đọc dữ liệu thực tế của account (trừ tính năng bill estimate mới trong console).

## Consolidated billing trong AWS Organizations

- Một hóa đơn duy nhất ở **management account** cho tất cả member accounts.
- **Gộp usage để đạt mức giá theo bậc (volume tiers)**, ví dụ S3 hay data transfer.
- **RI và Savings Plans được chia sẻ** giữa các account trong organization (có thể tắt chia sẻ cho từng account).
- Không tốn phí thêm.

## AWS Billing Conductor

- Tạo **pro forma bill** với giá tùy chỉnh (pricing rules, billing groups) cho mục đích **showback/chargeback** hoặc cho reseller/AWS Partner tính lại tiền cho khách hàng.
- Không thay đổi hóa đơn thật mà AWS gửi cho bạn.`,
    keywords: [
      { trigger: 'visualize and forecast costs, filter by service or tag', answer: 'AWS Cost Explorer' },
      { trigger: 'alert when forecasted spend exceeds a threshold', answer: 'AWS Budgets (forecasted alert)' },
      { trigger: 'automatically stop instances or apply policy when budget exceeded', answer: 'AWS Budgets actions' },
      { trigger: 'most granular hourly, resource-level billing data queried with SQL', answer: 'CUR 2.0 qua AWS Data Exports + Amazon Athena' },
      { trigger: 'detect unusual spend without setting thresholds, using ML', answer: 'AWS Cost Anomaly Detection' },
      { trigger: 'allocate costs per department/project', answer: 'Cost allocation tags (activate trong management account)' },
      { trigger: 'unassociated Elastic IPs, idle load balancers', answer: 'AWS Trusted Advisor' },
      { trigger: 'share Reserved Instance discounts across accounts, single bill', answer: 'Consolidated billing trong AWS Organizations' },
      { trigger: 'custom rates for showback/chargeback or reseller billing', answer: 'AWS Billing Conductor' },
    ],
    traps: [
      'Tag tạo xong chưa xuất hiện trong Cost Explorer nếu chưa activate cost allocation tag trong management account.',
      'Budgets chỉ cảnh báo nếu không cấu hình Budget actions; Budgets không tự xóa tài nguyên.',
      'Cost Explorer không phải nơi lấy dữ liệu từng resource theo giờ để truy vấn SQL; đó là CUR/Data Exports.',
      'Trusted Advisor đầy đủ check cost cần Business Support trở lên.',
      'Pricing Calculator chỉ ước tính trước; không giám sát chi phí thực tế.',
    ],
  },
  {
    slug: 'cost-optimized-architectures',
    domain: 'cost',
    title: 'Kiến trúc tối ưu chi phí: data transfer, network, serverless, scheduling',
    summary:
      'Các mẫu kiến trúc giảm chi phí thường gặp: tránh phí NAT và egress bằng VPC endpoint và CloudFront, chọn đúng capacity mode, tắt môi trường dev ngoài giờ, gp3 thay gp2, SQS để chạy fleet nhỏ hơn.',
    services: [
      'Amazon VPC',
      'NAT Gateway',
      'VPC Endpoints',
      'Amazon CloudFront',
      'AWS Lambda',
      'Amazon DynamoDB',
      'Amazon Aurora Serverless v2',
      'Amazon RDS',
      'Amazon EBS',
      'Amazon EFS',
      'Amazon SQS',
      'Instance Scheduler on AWS',
      'Amazon CloudWatch Logs',
    ],
    minutes: 12,
    body: `## Chi phí data transfer

| Luồng dữ liệu | Tính phí? |
|---|---|
| Internet → AWS (inbound) | Miễn phí |
| Trong cùng AZ qua private IP | Miễn phí |
| Giữa các AZ trong cùng Region | Có tính phí (theo GB, cả hai chiều) |
| Giữa các Region (inter-Region) | Có tính phí, thường cao hơn cross-AZ |
| AWS → Internet (egress) | Tính phí, đắt nhất, giảm theo bậc |
| Origin AWS (S3, EC2, ALB) → CloudFront | Miễn phí |
| CloudFront → người dùng | Tính phí nhưng thường rẻ hơn egress trực tiếp, có thêm caching |

Mẹo:
- Gửi dữ liệu giữa các instance qua **private IP** thay vì public IP/Elastic IP (đi qua public IP bị tính như cross-AZ hoặc hơn).
- Workload trao đổi dữ liệu rất lớn và không cần HA (vd cluster tính toán tạm) có thể đặt trong **một AZ** để tránh phí cross-AZ; đánh đổi availability.
- **CloudFront** giảm egress từ origin, giảm tải origin nhờ cache. Đề nói "giảm chi phí data transfer ra internet cho nội dung tĩnh/video" → CloudFront.
- S3 Transfer Acceleration tăng tốc upload nhưng **tốn thêm phí**, không phải giải pháp giảm chi phí.

## NAT Gateway vs VPC Endpoints

- **NAT Gateway** tính phí **theo giờ + theo GB dữ liệu xử lý**. Instance private gọi S3/DynamoDB qua NAT thì mỗi GB đều bị tính phí xử lý.
- **Gateway VPC endpoint** cho **S3 và DynamoDB**: **miễn phí**, chỉ cần thêm route vào route table. Đây là đáp án kinh điển cho "giảm chi phí NAT khi EC2 private đọc/ghi S3 nhiều".
- **Interface VPC endpoint (PrivateLink)** cho các service khác (SQS, ECR, Secrets Manager, ...): tính phí theo giờ mỗi AZ + theo GB, nhưng phí xử lý thường rẻ hơn NAT.
- Một NAT Gateway mỗi AZ để HA; dùng chung một NAT cho nhiều AZ rẻ hơn nhưng phát sinh phí cross-AZ và mất HA.

## Phí public IPv4

- Từ **1/2/2024**, AWS tính phí theo giờ cho **mọi địa chỉ public IPv4**, kể cả đang gắn vào resource và Elastic IP đang dùng (trước đây chỉ EIP không gắn mới bị tính).
- Giảm chi phí: bỏ public IP khi không cần (dùng ALB/NAT/endpoint), dùng **IPv6**, dùng **EC2 Instance Connect Endpoint** hoặc **Session Manager** thay cho bastion có public IP. **Public IP Insights** trong Amazon VPC IP Address Manager giúp tìm địa chỉ đang dùng.

## Serverless vs EC2

- **Lambda/Fargate/API Gateway**: trả theo request và thời gian chạy, không tốn tiền khi nhàn rỗi. Rẻ cho tải **không đều, gián đoạn, nhiều thời gian rảnh**.
- **EC2 (+ Savings Plans)**: rẻ hơn cho tải **cao và ổn định 24/7**.
- **Lambda memory tuning**: CPU tỷ lệ với memory; tăng memory có thể giảm thời gian chạy và **giảm tổng chi phí**. Dùng **AWS Lambda Power Tuning** hoặc Compute Optimizer. Lambda trên **arm64 (Graviton)** có giá theo GB-giây thấp hơn x86.

## Database capacity mode

### DynamoDB
| Mode | Khi nào chọn |
|---|---|
| On-demand | Tải không đoán được, mới ra mắt, có thời gian nhàn rỗi dài; trả theo request |
| Provisioned + Auto Scaling | Tải ổn định hoặc tăng dần dự đoán được; rẻ hơn khi dùng đều |
| Provisioned + Reserved capacity | Tải ổn định lâu dài, cam kết 1 hoặc 3 năm |

- **Table class Standard-IA** cho bảng lưu trữ nhiều mà ít truy cập (giảm giá lưu trữ, tăng giá đọc/ghi).
- TTL để tự xóa item hết hạn miễn phí.

### Aurora Serverless v2 và RDS
- **Aurora Serverless v2** tự scale theo ACU với bước nhỏ, phù hợp tải biến động, dev/test, nhiều database ít dùng. Hiện có thể cấu hình **min 0 ACU (auto-pause)** để không trả compute khi nhàn rỗi.
- Tải ổn định 24/7 → **RDS/Aurora provisioned + Reserved Instances** (giảm sâu nhất).
- Aurora I/O-Optimized phù hợp khi chi phí I/O chiếm phần lớn (khoảng hơn 25%) tổng chi phí Aurora.

## Tắt môi trường không dùng

- **Instance Scheduler on AWS** (giải pháp của AWS, dùng Lambda + DynamoDB + tag) tự động start/stop EC2 và RDS theo lịch, ví dụ chỉ chạy giờ hành chính → giảm khoảng 2/3 chi phí compute dev.
- Có thể dùng EventBridge Scheduler + Lambda/SSM Automation cho trường hợp đơn giản.
- Lưu ý: RDS bị stop tự khởi động lại sau 7 ngày.
- EBS volume vẫn bị tính tiền khi instance stop.

## Lưu trữ

- **EBS gp2 → gp3**: gp3 rẻ hơn khoảng 20% mỗi GB, baseline **3,000 IOPS và 125 MB/s** không phụ thuộc dung lượng, có thể tăng IOPS/throughput độc lập. Chuyển đổi bằng **Elastic Volumes** không cần downtime.
- Xóa EBS volume không gắn, snapshot cũ; dùng **EBS Snapshots Archive** cho snapshot giữ lâu.
- **EFS**: bật **lifecycle management** để chuyển file ít dùng sang **EFS Infrequent Access** và **EFS Archive**; dùng **EFS One Zone** cho dữ liệu không cần multi-AZ.
- **Log**: đặt **retention** cho CloudWatch Logs (mặc định giữ vĩnh viễn), dùng **Infrequent Access log class** cho log ít truy vấn, export/stream log sang S3 rồi lifecycle sang Glacier.

## Decoupling để chạy fleet nhỏ hơn

- Đặt **SQS** giữa frontend và worker: worker xử lý theo tốc độ của mình, không cần provision theo peak. Scale worker ASG theo **số message tồn đọng mỗi instance** (backlog per instance).
- Worker xử lý message idempotent có thể chạy trên **Spot**.

## Checklist nhanh

- Private subnet đọc S3/DynamoDB → Gateway endpoint.
- Egress nội dung lớn → CloudFront.
- Dev/test ngoài giờ → Instance Scheduler.
- gp2 → gp3.
- Tải spiky → serverless/on-demand; tải ổn định → provisioned + cam kết.`,
    keywords: [
      { trigger: 'private instances access S3, NAT gateway charges are high', answer: 'Gateway VPC endpoint cho S3 (miễn phí)' },
      { trigger: 'reduce data transfer out costs for global users', answer: 'Amazon CloudFront' },
      { trigger: 'unpredictable traffic, pay per request for NoSQL', answer: 'DynamoDB on-demand capacity' },
      { trigger: 'predictable steady DynamoDB traffic', answer: 'DynamoDB provisioned + Auto Scaling (+ reserved capacity)' },
      { trigger: 'variable or intermittent relational database usage', answer: 'Aurora Serverless v2' },
      { trigger: 'dev/test instances only used during business hours', answer: 'Instance Scheduler on AWS' },
      { trigger: 'reduce EBS cost without performance loss', answer: 'Chuyển gp2 sang gp3 bằng Elastic Volumes' },
      { trigger: 'files rarely accessed after 30 days on shared file system', answer: 'EFS lifecycle management sang EFS IA/Archive' },
      { trigger: 'workers sized for peak, load is bursty', answer: 'SQS queue + scale theo backlog per instance' },
      { trigger: 'unexpected charges for public IPv4 addresses', answer: 'Bỏ public IP không cần thiết, dùng IPv6/endpoint/Session Manager' },
    ],
    traps: [
      'Interface endpoint không miễn phí; chỉ Gateway endpoint (S3, DynamoDB) là miễn phí.',
      'Cross-AZ traffic có tính phí; đặt tất cả vào một AZ rẻ hơn nhưng mất high availability, đề yêu cầu HA thì không chọn.',
      'S3 Transfer Acceleration và Global Accelerator làm tăng tốc độ, không làm giảm chi phí.',
      'Instance bị stop vẫn tốn tiền EBS và public IPv4/Elastic IP.',
      'DynamoDB on-demand không phải lúc nào cũng rẻ; với tải ổn định cao thì provisioned rẻ hơn.',
      'Tăng memory Lambda không chắc làm tăng chi phí; thời gian chạy giảm có thể làm tổng chi phí giảm.',
    ],
  },
  {
    slug: 'cost-database-storage-choices',
    domain: 'cost',
    title: 'Chọn storage và database rẻ hơn: EBS/EFS/S3, FSx, Redshift, Athena, ElastiCache, Snow',
    summary:
      'So sánh cấu trúc chi phí của các lựa chọn lưu trữ và phân tích dữ liệu: trả theo dung lượng cấp phát hay dùng thực tế, trả theo query hay theo cluster, khi nào cache để giảm database, khi nào chuyển dữ liệu bằng thiết bị Snow.',
    services: [
      'Amazon EBS',
      'Amazon EFS',
      'Amazon S3',
      'Amazon FSx',
      'Amazon Redshift',
      'Amazon Athena',
      'Amazon ElastiCache',
      'AWS Backup',
      'AWS Snowball',
      'AWS DataSync',
    ],
    minutes: 11,
    body: `## EBS vs EFS vs S3: cấu trúc chi phí

| Tiêu chí | Amazon EBS | Amazon EFS | Amazon S3 |
|---|---|---|---|
| Kiểu | Block, gắn vào instance (thường 1 instance, cùng AZ) | File NFS dùng chung nhiều instance, nhiều AZ | Object, truy cập qua API/HTTP |
| Cách tính | Theo **dung lượng cấp phát** (provisioned), dùng hay không cũng trả | Theo **dung lượng thực dùng**, tự co giãn | Theo dung lượng thực dùng + request + data transfer |
| Giá mỗi GB (tương đối) | Trung bình | Cao nhất (Standard), giảm mạnh với IA/Archive | Thấp nhất, rất rẻ với Glacier |
| Tối ưu chi phí | gp3, sc1/st1 cho dữ liệu tuần tự lạnh, xóa volume thừa | Lifecycle sang IA/Archive, One Zone, Elastic throughput | Storage class + lifecycle, Intelligent-Tiering |

- Dữ liệu chỉ cần đọc/ghi qua ứng dụng (ảnh, video, backup, log) → **S3** gần như luôn rẻ nhất.
- Cần file system dùng chung POSIX cho Linux → EFS; tối ưu bằng lifecycle.
- **st1** (throughput optimized HDD) cho big data/log tuần tự; **sc1** (cold HDD) rẻ nhất cho dữ liệu ít truy cập. Không dùng HDD làm boot volume.

## Amazon FSx: các tùy chọn tiết kiệm

| FSx | Tùy chọn giảm chi phí |
|---|---|
| FSx for Windows File Server | Chọn **HDD storage** thay SSD cho share ít tải; **Single-AZ** cho dev/test; bật **data deduplication** |
| FSx for Lustre | **Scratch** file system (rẻ, không replicate, cho xử lý tạm) vs **Persistent** (lâu dài); liên kết **S3 data repository** để chỉ giữ dữ liệu nóng trên Lustre |
| FSx for NetApp ONTAP | Dedup, compression, compaction; **tự động tier dữ liệu lạnh sang capacity pool** giá rẻ |
| FSx for OpenZFS | Compression, snapshot, clone không tốn thêm dung lượng |

- Đề nói "HPC xử lý dữ liệu từ S3 trong vài giờ rồi bỏ" → **FSx for Lustre scratch** liên kết S3.

## Redshift Serverless vs provisioned

- **Redshift Serverless**: tự scale, tính theo **RPU-giờ khi có query chạy**, không tốn compute khi nhàn rỗi. Hợp với analytics **thất thường, không đoán được**, nhóm nhỏ.
- **Redshift provisioned (RA3)** + **Reserved nodes**: rẻ hơn cho warehouse chạy liên tục, tải ổn định. RA3 tách compute và managed storage. Có thể **pause/resume** cluster provisioned.
- **Redshift Spectrum**: query dữ liệu nằm trên S3 mà không phải nạp hết vào cluster.

## Amazon Athena: pay-per-query

- Serverless, tính theo **lượng dữ liệu quét** của mỗi query (có thêm tùy chọn provisioned capacity).
- Giảm chi phí bằng cách giảm dữ liệu quét:
  - **Partition** dữ liệu (vd theo year/month/day) và lọc theo partition trong WHERE; dùng **partition projection** cho nhiều partition.
  - Chuyển sang định dạng **cột (Apache Parquet, ORC)** và **nén** (Snappy, GZIP): chỉ đọc cột cần thiết, thường giảm dữ liệu quét rất lớn.
  - Gộp file nhỏ thành file lớn hơn; dùng **CTAS** hoặc AWS Glue ETL để chuyển CSV/JSON sang Parquet.
- Ad-hoc query trên log S3 (CloudTrail, ALB, VPC Flow Logs) → Athena rẻ hơn dựng cluster.

## ElastiCache để giảm chi phí database

- Đặt **ElastiCache (Redis OSS/Valkey hoặc Memcached)** trước database cho truy vấn đọc lặp lại → giảm tải đọc, có thể **dùng instance DB nhỏ hơn hoặc bớt read replica**.
- So với tăng size RDS hoặc thêm nhiều read replica, cache thường rẻ hơn với tải đọc nặng, lặp lại.
- **DynamoDB Accelerator (DAX)** là cache cho DynamoDB, giảm RCU tiêu thụ cho tải đọc lặp.
- ElastiCache có **reserved nodes** và **ElastiCache Serverless** (trả theo dữ liệu lưu và ECPU).

## Chi phí backup

- **RDS automated backups**: retention 1–35 ngày; dung lượng backup bằng kích thước DB được miễn phí trong Region, vượt hơn bị tính phí. Manual snapshot giữ đến khi xóa.
- **EBS snapshots** là incremental; dùng **Amazon Data Lifecycle Manager** để tự tạo và xóa theo retention. **EBS Snapshots Archive** rẻ hơn nhiều cho snapshot giữ lâu (tối thiểu 90 ngày, khôi phục mất nhiều giờ).
- **AWS Backup**: backup plan với lifecycle chuyển recovery point sang **cold storage** (cho resource hỗ trợ, tối thiểu 90 ngày ở cold) và tự xóa sau thời hạn.
- Giữ backup đúng thời gian compliance yêu cầu, không giữ vĩnh viễn.

## Snow family vs truyền qua mạng

- Ước tính thời gian truyền: dung lượng / băng thông thực tế. Nếu truyền qua mạng mất **hơn khoảng một tuần** hoặc làm nghẽn đường truyền hiện tại → cân nhắc **AWS Snowball Edge** (thiết bị vật lý, dữ liệu import vào S3).
- Với nhiều TB đến PB và băng thông hạn chế → Snowball rẻ và nhanh hơn kéo thêm đường truyền.
- Băng thông đủ, cần đồng bộ liên tục hoặc nhiều lần → **AWS DataSync** (qua internet hoặc Direct Connect).
- **AWS Direct Connect** tốn thời gian thiết lập (thường nhiều tuần) và phí cố định, không phải lựa chọn cho migration một lần gấp.
- Snowmobile và Snowcone đã ngừng; đề cũ vẫn có thể nhắc tới nhưng kiến thức cốt lõi là Snowball Edge cho offline transfer.

## Tóm tắt lựa chọn

- Warehouse dùng thất thường → Redshift Serverless; dùng liên tục → provisioned + reserved nodes.
- Query ad-hoc trên S3 → Athena + Parquet + partition.
- Đọc lặp nhiều → ElastiCache/DAX thay vì scale DB.
- Dữ liệu lớn, mạng chậm, một lần → Snowball Edge.`,
    keywords: [
      { trigger: 'pay only for storage used, shared Linux file system', answer: 'Amazon EFS (+ lifecycle sang IA)' },
      { trigger: 'reduce Athena query cost', answer: 'Partition dữ liệu + chuyển sang Parquet/ORC nén' },
      { trigger: 'intermittent, unpredictable data warehouse queries', answer: 'Amazon Redshift Serverless' },
      { trigger: 'read-heavy repeated queries overload RDS, reduce cost', answer: 'Amazon ElastiCache trước database' },
      { trigger: 'temporary HPC processing of data in S3', answer: 'FSx for Lustre scratch liên kết S3' },
      { trigger: 'Windows file share with low performance needs, lowest cost', answer: 'FSx for Windows File Server HDD + data deduplication' },
      { trigger: 'hundreds of TB, limited bandwidth, one-time migration', answer: 'AWS Snowball Edge' },
      { trigger: 'keep EBS snapshots for years rarely restored', answer: 'EBS Snapshots Archive' },
      { trigger: 'cold data in ONTAP file system', answer: 'FSx for NetApp ONTAP capacity pool tiering' },
    ],
    traps: [
      'EBS tính theo dung lượng cấp phát, không phải dung lượng dùng; volume 1 TB chỉ chứa 100 GB vẫn trả 1 TB.',
      'EFS Standard đắt hơn S3 nhiều mỗi GB; đừng chọn EFS chỉ để lưu object như ảnh/video.',
      'Athena tính theo dữ liệu quét: query CSV không partition rất tốn; LIMIT không giảm dữ liệu quét trong nhiều trường hợp.',
      'Direct Connect không phải đáp án cho migration một lần cần xong trong vài tuần (thiết lập lâu).',
      'FSx for Lustre scratch không replicate dữ liệu, không dùng cho dữ liệu lâu dài duy nhất.',
    ],
  },
  {
    slug: 'cost-compute-serverless-containers',
    domain: 'cost',
    title: 'Chọn compute rẻ nhất: EC2, ECS, Fargate, Lambda, Spot và Graviton',
    summary:
      'So sánh cấu trúc chi phí của EC2, ECS on EC2, Fargate và Lambda theo utilization và hình dạng traffic, rồi dùng Compute Savings Plans, Fargate Spot, EC2 Spot, Graviton và tối ưu Lambda để giảm tiếp.',
    services: [
      'Amazon EC2',
      'Amazon ECS',
      'AWS Fargate',
      'AWS Lambda',
      'Savings Plans',
      'Spot Instances',
      'AWS Graviton',
      'AWS Batch',
      'AWS Step Functions',
      'AWS Compute Optimizer',
    ],
    minutes: 11,
    body: `## Mỗi mô hình compute trả tiền cho cái gì

| Mô hình | Trả tiền cho | Rẻ khi | Đắt khi |
|---|---|---|---|
| EC2 | Instance đang chạy (Linux tính theo giây), dùng hết hay không | Utilization cao, ổn định, có Savings Plans/RI | Instance nhàn rỗi, provision theo peak |
| ECS on EC2 | Các EC2 instance trong cluster (control plane ECS không tính phí) | Nhiều container xếp dày (bin packing) trên instance | Cluster thừa capacity |
| Fargate | vCPU và memory mà task yêu cầu, theo giây (tối thiểu 1 phút) | Tải biến động, task chạy theo lịch, không muốn quản lý node | Tải 24/7 mật độ cao, đơn giá mỗi vCPU cao hơn EC2 dùng tốt |
| Lambda | Số request + thời gian chạy theo GB-giây (làm tròn tới ms) | Tải thưa, spiky, nhiều thời gian rảnh, sự kiện ngắn | Lưu lượng cao liên tục, hàm chạy lâu hoặc ngồi chờ |

Ý chính: **utilization quyết định**. Serverless không tốn tiền khi rảnh nhưng đơn giá cao hơn; khi tải cao và đều, EC2 hoặc ECS on EC2 kèm cam kết thường rẻ hơn. Amazon EKS có thêm phí control plane theo giờ cho mỗi cluster, ECS thì không.

## Workload → lựa chọn rẻ nhất

| Workload | Lựa chọn rẻ nhất thường gặp |
|---|---|
| API ít request, có lúc vài phút không ai gọi | Lambda + API Gateway |
| Web/API ổn định 24/7, lưu lượng cao | EC2 hoặc ECS on EC2 + Savings Plans + Graviton |
| Container tải biến động, team nhỏ không muốn quản lý node | Fargate + Compute Savings Plans cho baseline |
| Container worker chịu gián đoạn | Fargate Spot hoặc ECS capacity provider dùng EC2 Spot |
| Batch lớn, HPC, render có checkpoint | AWS Batch với Spot compute environment |
| Job chạy hơn 15 phút | Không phải Lambda: Fargate, AWS Batch hoặc EC2 |

## Compute Savings Plans cho cả ba loại compute

- Một cam kết USD/giờ tự áp dụng cho **EC2, Fargate và Lambda**, kể cả khi workload chuyển qua lại giữa chúng.
- Mức giảm cho Fargate và Lambda thấp hơn mức giảm cho EC2, nhưng vẫn đáng kể với baseline ổn định.
- EC2 Instance Savings Plans và Reserved Instances **không** áp dụng cho Fargate/Lambda.
- Cam kết bằng mức baseline thấp nhất; phần dao động để On-Demand hoặc Spot.

## Spot cho container

### Fargate Spot
- Chạy task Fargate trên capacity dư, rẻ tới khoảng 70%; khi bị thu hồi, task nhận **cảnh báo 2 phút** (SIGTERM).
- Dùng **capacity provider strategy** với FARGATE và FARGATE_SPOT: **base** là số task tối thiểu luôn chạy trên provider đó, **weight** chia phần còn lại (vd FARGATE base 2, rồi FARGATE:FARGATE_SPOT = 1:3).
- Fargate Spot không hỗ trợ task Windows và task ARM64.

### ECS capacity providers trên EC2
- **Auto Scaling group capacity provider** với managed scaling: ECS tự scale ASG theo số task cần chạy; kết hợp một provider On-Demand (baseline) và một provider Spot trong cùng strategy.
- Bật **Spot instance draining** của ECS agent để task được dời khỏi instance sắp bị thu hồi.

## EC2 Spot: làm đúng cách

- **Đa dạng hóa**: nhiều instance type (family, thế hệ, kích cỡ tương đương) trên nhiều AZ, hoặc **attribute-based instance type selection**.
- Allocation strategy **price-capacity-optimized** hoặc **capacity-optimized** để chọn pool ít bị thu hồi; tránh lowest-price với ít pool.
- Mặc định trả giá Spot hiện tại, tối đa bằng On-Demand; tăng max price không giúp tránh bị thu hồi.
- **Xử lý gián đoạn**: bắt cảnh báo 2 phút và rebalance recommendation qua EventBridge; bật **Capacity Rebalancing** trong ASG.
- **Thiết kế stateless**: worker lấy việc từ **SQS** và chỉ xóa message khi xong; nếu instance mất, message hiện lại sau visibility timeout. **Checkpoint** tiến độ ra S3/DynamoDB để tiếp tục thay vì chạy lại.

## AWS Batch với Spot

- AWS Batch không tính phí riêng; bạn trả cho EC2/Fargate bên dưới.
- Compute environment loại **SPOT** với allocation strategy **SPOT_PRICE_CAPACITY_OPTIMIZED** (hoặc SPOT_CAPACITY_OPTIMIZED), hoặc dùng Fargate Spot.
- Cấu hình **retry strategy** để job bị gián đoạn tự chạy lại; job queue có thể gắn nhiều compute environment theo thứ tự (Spot trước, On-Demand sau).

## Graviton ở khắp nơi

- Có cho EC2 (family có chữ g như M7g, C7g, R8g), Lambda arm64, Fargate ARM64, RDS/Aurora, ElastiCache, OpenSearch.
- Price/performance tốt hơn x86 cùng thế hệ; managed database thường chỉ cần đổi instance class, EC2/container cần binary hoặc multi-arch image cho ARM64.
- Lambda arm64 có đơn giá GB-giây thấp hơn x86; thường chỉ cần đổi architecture nếu code không phụ thuộc thư viện native x86.

## Đòn bẩy chi phí Lambda

- Chi phí = request + memory × thời gian chạy. CPU tỷ lệ với memory, nên tăng memory có thể rút ngắn thời gian đủ để tổng tiền giảm.
- **AWS Lambda Power Tuning** (mã nguồn mở, chạy trên Step Functions) thử nhiều mức memory và chỉ ra cấu hình rẻ nhất hoặc nhanh nhất; Compute Optimizer cũng gợi ý memory.
- **Không ngồi chờ trong Lambda**: hàm đợi API chậm hoặc polling vẫn bị tính duration. Chuyển việc chờ sang **Step Functions** (Wait state, callback với task token); Standard workflow tính theo state transition, không tính thời gian chờ.

## Right-sizing và tắt non-production

- Thứ tự: tắt cái không dùng → right-size → chuyển Graviton → rồi mới mua Savings Plans.
- Non-production: ASG scheduled action đặt desired capacity về 0 ngoài giờ, ECS service desired count về 0, Instance Scheduler on AWS cho EC2/RDS.`,
    keywords: [
      { trigger: 'infrequent, spiky requests with long idle periods', answer: 'AWS Lambda (+ API Gateway)' },
      { trigger: 'steady high-utilization containers running 24/7', answer: 'ECS on EC2 (hoặc EC2) + Savings Plans + Graviton' },
      { trigger: 'one commitment covering EC2, Fargate and Lambda', answer: 'Compute Savings Plans' },
      { trigger: 'interruption-tolerant ECS tasks, keep a minimum always running', answer: 'Capacity provider strategy FARGATE (base) + FARGATE_SPOT (weight)' },
      { trigger: 'Spot interruptions too frequent with one instance type', answer: 'Đa dạng instance type/AZ + price-capacity-optimized' },
      { trigger: 'Spot workers lose work when interrupted', answer: 'SQS (xóa message sau khi xong) + checkpoint ra S3/DynamoDB' },
      { trigger: 'large retriable batch jobs, lowest cost, managed scheduling', answer: 'AWS Batch với Spot compute environment' },
      { trigger: 'Lambda billed while waiting for an external job', answer: 'Step Functions Wait state hoặc callback task token' },
      { trigger: 'find the cheapest Lambda memory setting', answer: 'AWS Lambda Power Tuning / Compute Optimizer' },
    ],
    traps: [
      'Lambda không phải lúc nào cũng rẻ nhất: với lưu lượng cao, đều đặn, EC2/ECS on EC2 có Savings Plans thường rẻ hơn.',
      'EC2 Instance Savings Plans và RI không áp dụng cho Fargate hay Lambda; chỉ Compute Savings Plans áp dụng.',
      'Fargate Spot không hỗ trợ task Windows và ARM64; muốn vừa Graviton vừa rẻ thì dùng Fargate ARM64 thường + Savings Plans.',
      'Tăng Spot max price không làm giảm số lần bị thu hồi; phải đa dạng hóa pool và dùng capacity-aware allocation strategy.',
      'Lambda chờ hoặc polling vẫn bị tính duration; job dài hơn 15 phút không chạy được trên Lambda.',
      'Provisioned Concurrency tính phí kể cả khi không có request; không phải công cụ giảm chi phí.',
    ],
  },
  {
    slug: 'cost-network-transfer',
    domain: 'cost',
    title: 'Chi phí mạng và data transfer chuyên sâu: AZ, Region, NAT, endpoint, hybrid, Transit Gateway',
    summary:
      'Hiểu tiền data transfer đi theo hướng nào và qua thành phần nào: inter-AZ, inter-Region, NAT Gateway, VPC endpoint, CloudFront, Direct Connect, VPN, Transit Gateway, public IPv4, và cách tìm ra luồng đang tốn tiền.',
    services: [
      'Amazon VPC',
      'NAT Gateway',
      'VPC Endpoints',
      'AWS PrivateLink',
      'Amazon CloudFront',
      'AWS Direct Connect',
      'AWS Site-to-Site VPN',
      'AWS Transit Gateway',
      'Elastic Load Balancing',
      'VPC Flow Logs',
      'AWS Cost Explorer',
    ],
    minutes: 12,
    body: `## Nguyên tắc: tiền đi theo hướng và khoảng cách

- **Từ internet vào AWS (inbound)**: miễn phí.
- **Ra internet (egress)**: tính theo GB, giá giảm theo bậc khi dùng nhiều.
- **Giữa các AZ trong cùng Region**: tính theo GB ở **cả hai chiều** (bên gửi và bên nhận).
- **Giữa các Region**: tính theo GB ở phía gửi, thường đắt hơn cross-AZ.
- **Trong cùng AZ qua private IP**: miễn phí.
- EC2 ↔ S3/DynamoDB trong cùng Region: không tính data transfer, nhưng nếu đi qua NAT Gateway thì vẫn trả phí xử lý của NAT.

## Bảng so sánh chi phí các thành phần mạng

| Thành phần | Phí theo giờ | Phí theo GB | Ghi chú |
|---|---|---|---|
| Internet Gateway | Không | Chỉ egress internet thông thường | Không có phí xử lý riêng |
| NAT Gateway | Có, mỗi NAT | Có (data processing) + data transfer | Đắt khi lưu lượng lớn |
| Gateway VPC endpoint (S3, DynamoDB) | Không | Không | Chỉ trong cùng Region |
| Interface VPC endpoint | Có, mỗi AZ | Có, thấp hơn NAT | Cho hầu hết service khác |
| VPC peering | Không | Cùng AZ miễn phí; cross-AZ, inter-Region tính phí | Không transitive |
| Transit Gateway | Có, mỗi attachment | Có (data processing) | Hub-and-spoke, dễ quản trị |
| Site-to-Site VPN | Có, mỗi connection | Egress theo giá internet | Dựng trong vài phút |
| Direct Connect | Có (port-hour) | Egress rẻ hơn internet; inbound miễn phí | Thiết lập lâu, băng thông ổn định |
| CloudFront | Không | Egress tới viewer; origin AWS → CloudFront miễn phí | Cache giảm tải origin |
| Public IPv4 | Có, mỗi địa chỉ | Không | Địa chỉ IPv6 không tính phí |

## Inter-AZ: chi phí ẩn của high availability

- Replication của **RDS/Aurora Multi-AZ** do AWS quản lý: không tính phí data transfer giữa primary và standby. Tự chạy database, Kafka hay Elasticsearch trên EC2 thì replication qua AZ **bị tính phí**.
- App ở AZ A gọi cache/database ở AZ B: mỗi request đều trả phí cross-AZ. Ưu tiên routing theo AZ, đọc từ replica cùng AZ.
- **Cross-zone load balancing**: với **NLB và GWLB** (mặc định tắt), bật lên sẽ phát sinh phí inter-AZ. ALB luôn bật cross-zone và không tính phí inter-AZ cho phần này.
- Không hy sinh HA của production chỉ để tránh phí cross-AZ; single-AZ chỉ hợp với batch, dev hoặc cluster tạm.

## NAT Gateway: nguồn hóa đơn bất ngờ

- NAT tính **theo giờ + theo GB xử lý**, cộng thêm data transfer thông thường.
- Traffic tới S3/DynamoDB → **Gateway endpoint** (miễn phí, thêm route vào route table).
- Traffic tới ECR, CloudWatch Logs, SQS, STS... → **interface endpoint** khi lượng GB đủ lớn để bù phí theo giờ mỗi AZ.
- Container kéo image lớn từ ECR qua NAT → interface endpoint cho ECR (ecr.api, ecr.dkr) cộng gateway endpoint S3, vì layer image nằm trên S3.
- **Một NAT mỗi AZ**: HA, không phát sinh cross-AZ, nhưng trả phí giờ cho nhiều NAT. **Một NAT dùng chung**: rẻ phí giờ nhưng subnet ở AZ khác trả thêm cross-AZ và mất kết nối ra ngoài khi AZ chứa NAT gặp sự cố. Production → một NAT mỗi AZ; dev/test → dùng chung chấp nhận được.

## Inter-Region

- S3 Cross-Region Replication, DynamoDB global tables, Aurora Global Database, copy snapshot/AMI sang Region khác đều phát sinh phí inter-Region. Chỉ replicate dữ liệu thật sự cần cho DR hoặc latency.

## CloudFront

- Dữ liệu từ origin AWS (S3, ALB, EC2) sang CloudFront **miễn phí**; bạn trả egress từ edge tới người dùng, và cache hit giảm request về origin.
- **Price class**: All, 200, 100. **Price Class 100** chỉ dùng edge ở các khu vực rẻ nhất (Bắc Mỹ, châu Âu) → rẻ hơn, đổi lại người dùng ở khu vực khác có latency cao hơn.

## S3 Transfer Acceleration

- Thêm phí theo GB ngoài phí data transfer; chỉ tính khi việc tăng tốc thực sự nhanh hơn. Đây là tính năng **tốc độ**, không phải tiết kiệm.

## Kết nối hybrid

- **Site-to-Site VPN**: phí theo giờ mỗi connection + egress theo giá internet. Rẻ cho lưu lượng thấp hoặc vừa, dựng nhanh.
- **Direct Connect**: phí port-hour cố định + egress (DTO) rẻ hơn internet. Với khối lượng lớn đều đặn từ AWS về on-premises, phần tiết kiệm egress bù được phí port, kèm băng thông ổn định.

## Transit Gateway vs VPC peering

- **VPC peering**: không phí giờ, không phí xử lý; traffic cùng AZ miễn phí. Nhưng không transitive, full-mesh khó quản khi nhiều VPC.
- **Transit Gateway**: phí mỗi attachment theo giờ + phí xử lý mỗi GB. Trả tiền để đổi lấy quản trị đơn giản.
- Hai VPC trao đổi khối lượng rất lớn → thêm peering trực tiếp cho riêng cặp đó, các VPC khác vẫn qua TGW.

## Public IPv4 và IPv6

- Mỗi public IPv4 (kể cả Elastic IP đang gắn) tính phí theo giờ. Gom traffic qua ALB/NAT, bỏ public IP không cần, chuyển sang **IPv6** (egress-only internet gateway cho outbound); địa chỉ IPv6 không tính phí.

## Tìm luồng đang tốn tiền

- **Cost Explorer**: nhóm theo **Usage Type**, tìm các loại như DataTransfer-Regional-Bytes (inter-AZ), NatGateway-Bytes, DataTransfer-Out-Bytes.
- **CUR/Data Exports + Athena** để biết resource nào phát sinh.
- **VPC Flow Logs** (truy vấn bằng Athena hoặc CloudWatch Logs Insights) để biết cặp nguồn/đích cụ thể, luồng nào đi qua NAT hay qua AZ khác.`,
    keywords: [
      { trigger: 'private instances pull large data from S3 or DynamoDB through NAT', answer: 'Gateway VPC endpoint (miễn phí)' },
      { trigger: 'high NAT charges for ECR image pulls and CloudWatch Logs', answer: 'Interface VPC endpoints (+ gateway endpoint S3 cho layer ECR)' },
      { trigger: 'single NAT gateway, inter-AZ charges and AZ failure risk', answer: 'Một NAT Gateway mỗi AZ, route subnet tới NAT cùng AZ' },
      { trigger: 'reduce egress for global downloads, users mostly in North America and Europe', answer: 'CloudFront với Price Class 100' },
      { trigger: 'large steady data transfer from AWS to on-premises', answer: 'AWS Direct Connect' },
      { trigger: 'two VPCs exchange huge traffic through Transit Gateway', answer: 'VPC peering trực tiếp (không phí giờ, không phí xử lý)' },
      { trigger: 'NLB cross-zone enabled, high inter-AZ cost, targets balanced per AZ', answer: 'Tắt cross-zone load balancing trên NLB' },
      { trigger: 'identify which instances generate inter-AZ traffic', answer: 'VPC Flow Logs + Athena, Cost Explorer theo usage type' },
      { trigger: 'charges for public IPv4 addresses', answer: 'Bỏ public IP không cần, dùng IPv6 / ALB / NAT' },
    ],
    traps: [
      'Interface endpoint có phí theo giờ mỗi AZ và theo GB; chỉ gateway endpoint cho S3/DynamoDB là miễn phí.',
      'Gateway endpoint chỉ dùng trong cùng Region, không dùng được từ on-premises; từ on-premises cần interface endpoint.',
      'Một NAT dùng chung cho nhiều AZ rẻ phí giờ nhưng thêm phí cross-AZ và tạo single point of failure.',
      'S3 Transfer Acceleration và Global Accelerator tăng tốc, không giảm chi phí.',
      'Transit Gateway có phí xử lý mỗi GB; VPC peering không có phí giờ hay phí xử lý.',
      'Replication RDS/Aurora Multi-AZ không tính phí transfer, nhưng database tự quản trên EC2 replicate qua AZ thì có.',
    ],
  },
];
