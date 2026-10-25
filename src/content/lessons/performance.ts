import type { Lesson } from '@/content/types';

export const performanceLessons: Lesson[] = [
  {
    slug: 'ec2-compute',
    domain: 'performance',
    title: 'EC2: instance family, placement group và hiệu năng compute',
    summary:
      'Chọn đúng instance family, Graviton, placement group, enhanced networking và loại storage gắn với EC2 để đạt hiệu năng tối ưu.',
    services: ['Amazon EC2', 'AWS Graviton', 'Amazon EBS', 'EC2 Image Builder', 'Elastic Fabric Adapter'],
    minutes: 10,
    body: `## Tổng quan

Amazon EC2 là dịch vụ máy ảo cơ bản nhất. Trong Domain 3, câu hỏi thường xoay quanh việc **chọn đúng loại instance** cho workload, **đặt instance ở đâu** (placement group) và **storage nào** đi kèm.

## Instance families

Tên instance có dạng m7g.2xlarge: **m** = family, **7** = thế hệ, **g** = thuộc tính (g = Graviton, a = AMD, i = Intel, n = network nâng cao, d = có instance store), **2xlarge** = kích thước.

| Family | Ví dụ | Dùng khi |
|---|---|---|
| General purpose | M, T (burstable) | Web server, app server, workload cân bằng CPU/RAM. T dùng CPU credits, phù hợp tải thấp có burst |
| Compute optimized | C | Batch xử lý nặng CPU, media transcoding, HPC, game server, ML inference trên CPU |
| Memory optimized | R, X, z, High Memory (u) | In-memory database, cache lớn, SAP HANA, xử lý big data real-time |
| Storage optimized | I, D, H | IOPS cao trên instance store (NVMe), NoSQL, data warehouse, HDFS |
| Accelerated computing | P, G, Inf, Trn, F | GPU training (P), graphics/inference (G), Inferentia (Inf), Trainium (Trn), FPGA (F) |

### Graviton

- CPU ARM do AWS thiết kế, giá/hiệu năng tốt hơn tới khoảng 40% so với x86 cùng thế hệ.
- Có ở nhiều dịch vụ: EC2, Lambda, Fargate, RDS, Aurora, ElastiCache, OpenSearch.
- Điều kiện: ứng dụng phải chạy được trên ARM64 (Java, Python, Node.js, container multi-arch thường ổn).

## Placement groups

| Loại | Cách bố trí | Ưu điểm | Nhược điểm / giới hạn |
|---|---|---|---|
| Cluster | Gom instance sát nhau trong **1 AZ** | Latency thấp nhất, băng thông cao giữa các node (HPC, MPI) | Một sự cố phần cứng/AZ ảnh hưởng toàn bộ |
| Spread | Mỗi instance trên rack riêng | Giảm rủi ro lỗi đồng thời, dùng cho app quan trọng ít node | Tối đa **7 instance đang chạy mỗi AZ** mỗi group |
| Partition | Chia thành partition, mỗi partition là nhóm rack riêng | Scale hàng trăm instance, nhận biết topology (HDFS, HBase, Cassandra, Kafka) | Tối đa 7 partition mỗi AZ |

Mẹo: "lowest latency, highest throughput between nodes" là Cluster; "critical instances must not share hardware" là Spread; "big data distributed, rack-aware" là Partition.

## Enhanced networking: ENA và EFA

- **ENA (Elastic Network Adapter)**: dùng SR-IOV, băng thông cao (tới 100 Gbps trở lên tùy instance), PPS cao, latency thấp. Hầu hết instance hiện đại đã bật sẵn.
- **EFA (Elastic Fabric Adapter)**: ENA + khả năng **OS-bypass** cho ứng dụng HPC/ML phân tán dùng MPI hoặc NCCL. Chỉ hỗ trợ Linux. Kết hợp với cluster placement group.
- Câu hỏi nhắc "tightly coupled HPC, MPI, inter-node communication" thì nghĩ tới EFA + cluster placement group.

## Instance store vs EBS

| Tiêu chí | Instance store | EBS |
|---|---|---|
| Vị trí | Đĩa gắn vật lý trên host | Ổ mạng, nằm trong 1 AZ |
| Hiệu năng | IOPS rất cao (hàng trăm nghìn tới hàng triệu với NVMe) | Phụ thuộc loại volume (gp3, io2...) |
| Độ bền | Mất dữ liệu khi stop, hibernate hoặc terminate, hoặc khi host lỗi | Tồn tại độc lập với instance, có snapshot |
| Dùng cho | Buffer, cache, scratch, dữ liệu đã được replicate ở tầng app | Root volume, database, dữ liệu cần bền |

Reboot thì instance store vẫn giữ dữ liệu; stop/terminate thì mất.

## EC2 Hibernate

- Lưu nội dung RAM xuống **EBS root volume (phải được mã hóa)**, khi start lại thì khôi phục RAM, app khởi động nhanh hơn (không phải warm-up lại cache, không phải boot lại OS).
- Yêu cầu: root là EBS, đủ dung lượng chứa RAM, RAM giới hạn (ví dụ dưới 150 GB), không hibernate quá 60 ngày, chỉ hỗ trợ một số family và On-Demand/Spot.
- Câu hỏi: "long initialization time, preserve in-memory state" thì chọn Hibernate.

## User data, AMI và EC2 Image Builder

- **User data**: script chạy **một lần khi boot lần đầu** (mặc định) với quyền root; dùng để cài package, kéo code. Nhược điểm: làm boot chậm hơn nếu cài nhiều.
- **AMI**: image để launch instance. AMI thuộc **một Region**; muốn dùng Region khác thì copy AMI. **Golden AMI** (cài sẵn mọi thứ) giúp giảm thời gian khởi động khi Auto Scaling scale out.
- **EC2 Image Builder**: pipeline tự động build, test, patch và phân phối AMI (và container image) theo lịch, có thể share sang nhiều Region/account. Câu hỏi "automate creation and patching of AMIs" thì chọn Image Builder.

## Mẹo chọn nhanh trong đề

- Boot nhanh khi scale out: golden AMI thay vì user data dài, hoặc warm pool của Auto Scaling.
- Workload ổn định có thể chạy ARM, muốn giảm chi phí và tăng hiệu năng: Graviton.
- Cần IOPS cực cao, dữ liệu tạm: instance store (storage optimized I family).
`,
    keywords: [
      { trigger: 'lowest network latency between instances, HPC tightly coupled', answer: 'Cluster placement group + EFA' },
      { trigger: 'critical instances must be on distinct hardware', answer: 'Spread placement group' },
      { trigger: 'Hadoop/Cassandra/Kafka rack-aware, hundreds of instances', answer: 'Partition placement group' },
      { trigger: 'preserve in-memory state, faster startup after stop', answer: 'EC2 Hibernate' },
      { trigger: 'very high random IOPS, temporary data, data replicated elsewhere', answer: 'Instance store (storage optimized)' },
      { trigger: 'better price performance, ARM-compatible workload', answer: 'AWS Graviton instances' },
      { trigger: 'automate building and patching AMIs', answer: 'EC2 Image Builder' },
      { trigger: 'reduce boot time when scaling out', answer: 'Golden AMI / Auto Scaling warm pool' },
    ],
    traps: [
      'Cluster placement group chỉ nằm trong 1 AZ, không phải lựa chọn cho high availability.',
      'Spread placement group giới hạn 7 instance đang chạy mỗi AZ, không dùng cho fleet lớn.',
      'Instance store mất dữ liệu khi stop/terminate, đừng chọn cho database cần bền vững.',
      'Hibernate cần root EBS được mã hóa; instance store-backed instance không hibernate được.',
      'AMI là tài nguyên theo Region, phải copy AMI trước khi launch ở Region khác.',
      'EFA chỉ hỗ trợ Linux và cần ứng dụng dùng MPI/NCCL; ENA mới là enhanced networking thông thường.',
    ],
  },
  {
    slug: 'containers-compute',
    domain: 'performance',
    title: 'Container và serverless compute: ECS, EKS, Fargate, Lambda, Batch',
    summary:
      'Phân biệt ECS và EKS, EC2 launch type và Fargate, cùng App Runner, AWS Batch, Elastic Beanstalk và cách chọn giữa Lambda, container và EC2.',
    services: ['Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'Amazon ECR', 'AWS App Runner', 'AWS Batch', 'AWS Elastic Beanstalk', 'AWS Lambda'],
    minutes: 9,
    body: `## Bức tranh tổng quát

AWS có nhiều cách chạy code. Đề thi thường cho một tình huống rồi hỏi cách nào **ít vận hành nhất** (least operational overhead) hoặc **phù hợp nhất về hiệu năng**.

## ECS vs EKS

| Tiêu chí | Amazon ECS | Amazon EKS |
|---|---|---|
| Orchestrator | Của AWS, đơn giản, tích hợp sâu IAM, ALB, CloudWatch | Kubernetes chuẩn (CNCF), managed control plane |
| Khi chọn | Muốn chạy container nhanh, ít học thêm | Đã dùng Kubernetes, cần portability, hệ sinh thái Helm/operator, hybrid (EKS Anywhere) |
| Đơn vị | Task definition, task, service | Pod, deployment, service |
| Chi phí control plane | Không tính phí riêng | Tính phí theo giờ cho mỗi cluster |

Từ khóa "already uses Kubernetes, migrate without changing manifests" thì chọn EKS.

## EC2 launch type vs Fargate

| | EC2 launch type / node group | Fargate |
|---|---|---|
| Hạ tầng | Bạn quản lý EC2 (AMI, patch, scale cluster) | Serverless, không thấy EC2 |
| Tùy biến | Chọn GPU, instance lớn, Spot, daemon | Chỉ khai báo vCPU/RAM cho task/pod |
| Chi phí | Rẻ hơn nếu tận dụng cao, có Reserved/Savings Plans/Spot | Trả theo vCPU và RAM của task, có Fargate Spot |
| Overhead | Cao hơn | Thấp nhất |

- ECS và EKS đều chạy được trên Fargate.
- **ECS task role** gán IAM cho từng task; **EC2 instance profile** là quyền của host.
- ECS service auto scaling dùng target tracking (CPU, RAM, ALB request count). Trên EC2 launch type, dùng **capacity provider** để cluster tự scale EC2 theo nhu cầu task.

## Amazon ECR

- Registry Docker/OCI private (và public), tích hợp IAM, image scanning, lifecycle policy, cross-Region và cross-account replication.
- Câu hỏi "store container images securely, scan for vulnerabilities" thì chọn ECR.

## AWS App Runner

- Đưa source code hoặc container image lên, App Runner tự build, deploy, gắn HTTPS, load balancing và auto scaling.
- Dành cho web app/API đơn giản, team không muốn quản lý cluster, load balancer hay VPC phức tạp.

## AWS Batch

- Chạy **batch job** quy mô lớn: tự quản lý hàng đợi job, lập lịch, chọn compute (EC2, Spot, Fargate).
- Không giới hạn thời gian chạy như Lambda; phù hợp job vài giờ, xử lý gen, render, mô phỏng.
- Từ khóa "hundreds of thousands of batch computing jobs, job queues, dependencies" thì chọn Batch.

## AWS Elastic Beanstalk

- PaaS: upload code (Java, .NET, Node.js, Python, PHP, Go, Ruby, Docker), Beanstalk tạo EC2, Auto Scaling, ELB, giám sát.
- Vẫn truy cập được tài nguyên bên dưới. Hợp với lift-and-shift web app truyền thống, developer muốn tập trung code.
- Deployment policies: all at once, rolling, rolling with additional batch, immutable, traffic splitting, blue/green (swap URL).

## Lambda vs container vs EC2

| Tiêu chí | Lambda | Container (ECS/EKS/Fargate) | EC2 |
|---|---|---|---|
| Thời gian chạy | Tối đa 15 phút mỗi lần gọi | Không giới hạn | Không giới hạn |
| Tài nguyên | Tới 10,240 MB RAM, vCPU tỷ lệ theo RAM, /tmp tới 10 GB | Linh hoạt theo task | Mọi kích cỡ, GPU |
| Mô hình | Event-driven, scale theo request | Long-running service, microservices | Toàn quyền OS, license, phần mềm legacy |
| Cold start | Có (giảm bằng Provisioned Concurrency hoặc SnapStart cho một số runtime) | Thời gian khởi động task | Thời gian boot |
| Overhead | Thấp nhất | Trung bình (Fargate thấp) | Cao nhất |

Quy tắc nhanh:
- Event-driven, ngắn, lưu lượng thất thường: Lambda.
- Job dài hơn 15 phút hoặc cần runtime tùy biến/microservice chạy liên tục: container trên Fargate.
- Cần GPU đặc thù, quyền kernel, license gắn host: EC2 (hoặc Dedicated Host).

### Hiệu năng Lambda cần nhớ

- Tăng memory cũng tăng CPU tương ứng; function nặng CPU nên tăng memory.
- **Provisioned Concurrency** giữ môi trường đã khởi tạo sẵn để loại bỏ cold start cho tải dự đoán được.
- **Reserved concurrency** giới hạn/đảm bảo concurrency cho một function.
- Lambda kết nối RDS với nhiều kết nối đồng thời: đặt **RDS Proxy** ở giữa.
`,
    keywords: [
      { trigger: 'run containers without managing servers or clusters', answer: 'Fargate (ECS hoặc EKS)' },
      { trigger: 'existing Kubernetes workloads, open-source tooling', answer: 'Amazon EKS' },
      { trigger: 'job runs longer than 15 minutes', answer: 'ECS/Fargate hoặc AWS Batch thay vì Lambda' },
      { trigger: 'large-scale batch jobs with queues and Spot', answer: 'AWS Batch' },
      { trigger: 'deploy web app from source code, no infrastructure knowledge', answer: 'AWS App Runner / Elastic Beanstalk' },
      { trigger: 'eliminate Lambda cold start latency', answer: 'Provisioned Concurrency' },
      { trigger: 'private container registry with vulnerability scanning', answer: 'Amazon ECR' },
    ],
    traps: [
      'Lambda giới hạn 15 phút; job dài hơn phải dùng Fargate, Batch hoặc EC2.',
      'Fargate không hỗ trợ GPU trong ECS; workload GPU cần EC2 launch type.',
      'ECS task role khác EC2 instance profile: quyền cho container nên gán ở task role.',
      'Elastic Beanstalk không phải serverless, vẫn chạy EC2 bên dưới.',
      'Chọn EKS chỉ khi đề nhắc Kubernetes; nếu không, ECS thường ít overhead hơn.',
    ],
  },
  {
    slug: 'block-file-storage',
    domain: 'performance',
    title: 'Block và file storage: EBS, EFS, FSx',
    summary:
      'So sánh các loại EBS volume với số IOPS/throughput, EFS với các mode hiệu năng và storage class, và bốn dòng FSx cho Windows, Lustre, ONTAP, OpenZFS.',
    services: ['Amazon EBS', 'Amazon EFS', 'Amazon FSx for Windows File Server', 'Amazon FSx for Lustre', 'Amazon FSx for NetApp ONTAP', 'Amazon FSx for OpenZFS'],
    minutes: 12,
    body: `## Amazon EBS

EBS là block storage qua mạng, gắn vào EC2 trong **cùng một AZ**. Snapshot lưu trên S3 (do AWS quản lý), có thể copy sang Region khác.

### Các loại volume (số liệu thường gặp trong đề SAA-C03)

| Loại | Kiểu | IOPS | Throughput | Ghi chú |
|---|---|---|---|---|
| gp3 | SSD general | Baseline 3,000, tăng tới 16,000 | Baseline 125 MiB/s, tới 1,000 MiB/s | IOPS và throughput **chỉnh độc lập với dung lượng**, rẻ hơn gp2 khoảng 20% |
| gp2 | SSD general | 3 IOPS/GiB, tối thiểu 100, tối đa 16,000; volume nhỏ burst tới 3,000 | Tới 250 MiB/s | IOPS gắn với dung lượng, muốn thêm IOPS phải tăng size |
| io2 Block Express | SSD provisioned IOPS | Tới 256,000 | Tới 4,000 MiB/s | Latency dưới mili giây, durability 99.999%, volume tới 64 TiB |
| io1 | SSD provisioned IOPS | Tới 64,000 (trên Nitro) | Tới 1,000 MiB/s | Thế hệ trước, io2 tốt hơn và giá tương đương |
| st1 | HDD throughput optimized | Tới 500 | Tới 500 MiB/s | Big data, log, data warehouse, đọc tuần tự |
| sc1 | HDD cold | Tới 250 | Tới 250 MiB/s | Dữ liệu ít truy cập, rẻ nhất |

- **Boot volume** chỉ dùng được SSD (gp2/gp3/io1/io2), **không dùng st1/sc1**.
- Muốn database cần IOPS ổn định, latency thấp, trên 16,000 IOPS: io2 Block Express.
- Instance cũng có giới hạn băng thông EBS: chọn instance **EBS-optimized** đủ lớn, nếu không volume nhanh vẫn bị nghẽn.

### Multi-Attach

- Chỉ **io1/io2**, gắn một volume cho tối đa **16 instance Nitro trong cùng AZ**.
- Ứng dụng phải tự quản lý ghi đồng thời (cluster-aware file system), không dùng ext4/XFS thông thường.

### Snapshots

- Incremental; có thể copy cross-Region, chia sẻ cross-account.
- **Fast Snapshot Restore (FSR)**: loại bỏ độ trễ khởi tạo khi tạo volume từ snapshot (không cần pre-warm).
- **Snapshot Archive**: rẻ hơn tới 75%, restore mất 24 đến 72 giờ. **Recycle Bin** chống xóa nhầm.
- **Data Lifecycle Manager (DLM)** tự động tạo/xóa snapshot theo lịch.

## Amazon EFS

- File system **NFS (NFSv4.1)** cho **Linux**, managed, tự co giãn dung lượng, nhiều instance (hàng nghìn) mount đồng thời qua **nhiều AZ**. Hỗ trợ EC2, ECS, EKS, Lambda.
- **Performance mode**: General Purpose (mặc định, latency thấp, dùng cho hầu hết trường hợp) và Max I/O (thế hệ cũ, throughput tổng cao hơn nhưng latency cao hơn; AWS khuyến nghị dùng General Purpose + Elastic throughput).
- **Throughput mode**:
  - **Elastic** (khuyến nghị): tự scale throughput theo tải, trả tiền theo lượng dùng, phù hợp tải khó dự đoán.
  - **Provisioned**: đặt trước throughput cố định, độc lập dung lượng.
  - **Bursting**: throughput tăng theo dung lượng lưu trữ, dùng burst credits.
- **Storage classes**: Standard, Infrequent Access (IA), Archive; **One Zone** và One Zone-IA cho dữ liệu không cần multi-AZ (rẻ hơn). **Lifecycle management** tự chuyển file ít dùng sang IA/Archive.

### EFS vs EBS

| | EBS | EFS |
|---|---|---|
| Kiểu | Block | File (NFS) |
| Phạm vi | 1 AZ, thường gắn 1 instance (trừ Multi-Attach) | Multi-AZ, nhiều instance cùng lúc |
| Dung lượng | Tự cấp phát trước | Tự co giãn, trả theo dùng |
| OS | Mọi OS | Linux (POSIX) |
| Giá | Rẻ hơn mỗi GB | Đắt hơn mỗi GB nhưng có IA/Archive |

## Amazon FSx

| Dòng | Giao thức | Dùng khi |
|---|---|---|
| FSx for Windows File Server | SMB, NTFS, tích hợp Active Directory, DFS | Ứng dụng Windows, home directory, SharePoint, SQL Server; có Multi-AZ |
| FSx for Lustre | Lustre (Linux), POSIX | HPC, ML training, mô phỏng, xử lý video: hàng trăm GB/s, hàng triệu IOPS, latency dưới mili giây |
| FSx for NetApp ONTAP | NFS, SMB, iSCSI (đa giao thức) | Di chuyển NetApp on-prem, cần snapshot, clone, dedup, compression, SnapMirror; truy cập từ Linux, Windows, macOS |
| FSx for OpenZFS | NFS | Di chuyển ZFS on-prem, latency rất thấp, snapshot và clone tức thời |

### FSx for Lustre chi tiết

- **Scratch**: lưu trữ tạm, không replicate, throughput burst cao, rẻ; dùng cho xử lý ngắn hạn.
- **Persistent**: dữ liệu được replicate trong cùng AZ, dùng cho xử lý dài hạn, dữ liệu nhạy cảm.
- **Tích hợp S3** (data repository association): S3 bucket hiển thị như file trong Lustre, dữ liệu lazy load khi đọc lần đầu, kết quả có thể export ngược về S3. Đây là đáp án kinh điển cho "process data stored in S3 with a high-performance file system".

## Chọn nhanh

- Nhiều EC2 Linux cần chia sẻ file, multi-AZ: EFS.
- Windows, SMB, Active Directory: FSx for Windows File Server.
- HPC/ML cần throughput cực lớn, dữ liệu ở S3: FSx for Lustre.
- Cần NFS + SMB + iSCSI cùng lúc, hoặc đang dùng NetApp: FSx for NetApp ONTAP.
- Database trên một EC2 cần IOPS cao: EBS io2 Block Express.
`,
    keywords: [
      { trigger: 'increase IOPS without increasing volume size', answer: 'EBS gp3' },
      { trigger: 'more than 64,000 IOPS, sub-millisecond latency, single volume', answer: 'EBS io2 Block Express' },
      { trigger: 'same block volume attached to multiple instances in one AZ', answer: 'EBS Multi-Attach (io1/io2)' },
      { trigger: 'sequential throughput, big data, log processing, low cost HDD', answer: 'EBS st1' },
      { trigger: 'shared file system for Linux instances across multiple AZs', answer: 'Amazon EFS' },
      { trigger: 'SMB, Windows, Active Directory integration', answer: 'FSx for Windows File Server' },
      { trigger: 'HPC, ML training, data in S3, hundreds of GB/s', answer: 'FSx for Lustre' },
      { trigger: 'NFS, SMB and iSCSI multi-protocol, NetApp migration', answer: 'FSx for NetApp ONTAP' },
      { trigger: 'unpredictable file throughput, pay per use', answer: 'EFS Elastic throughput' },
    ],
    traps: [
      'st1/sc1 không thể làm boot volume.',
      'gp2 muốn tăng IOPS phải tăng dung lượng; gp3 thì không cần.',
      'Multi-Attach chỉ trong 1 AZ và chỉ io1/io2, không phải cách chia sẻ file thông thường (dùng EFS).',
      'EFS không hỗ trợ Windows; Windows cần FSx for Windows File Server.',
      'FSx for Lustre scratch không replicate dữ liệu, không dùng cho dữ liệu cần bền lâu dài.',
      'Volume nhanh vẫn bị giới hạn bởi băng thông EBS của instance.',
    ],
  },
  {
    slug: 's3-performance',
    domain: 'performance',
    title: 'Hiệu năng Amazon S3',
    summary:
      'Consistency model, request rate theo prefix, multipart upload, Transfer Acceleration, byte-range fetch, S3 Express One Zone và các tính năng như event notifications, static website, CORS.',
    services: ['Amazon S3', 'S3 Transfer Acceleration', 'S3 Express One Zone', 'S3 Object Lambda', 'Amazon CloudFront'],
    minutes: 9,
    body: `## Consistency model

- Từ cuối 2020, S3 cung cấp **strong read-after-write consistency** cho mọi thao tác PUT, DELETE, LIST, không tính thêm phí.
- Sau khi ghi thành công, lần đọc kế tiếp luôn trả về phiên bản mới nhất. Không còn cần thiết kế quanh "eventual consistency".

## Request rate và prefix

- Mỗi **prefix** hỗ trợ ít nhất **3,500 PUT/COPY/POST/DELETE** và **5,500 GET/HEAD** request mỗi giây.
- Không giới hạn số prefix trong bucket. Muốn tăng throughput: **phân tán object qua nhiều prefix** (ví dụ chia theo ngày, theo hash). 4 prefix có thể đạt 22,000 GET/s.
- S3 tự động scale; khi tăng tải đột ngột có thể gặp lỗi 503 Slow Down tạm thời, client nên retry với exponential backoff.

## Tăng tốc upload và download

| Kỹ thuật | Khi dùng |
|---|---|
| **Multipart upload** | Khuyến nghị cho file trên 100 MB, **bắt buộc** khi file trên 5 GB (một PUT tối đa 5 GB). Upload song song từng phần, part lỗi chỉ cần gửi lại phần đó |
| **Transfer Acceleration** | Upload/download qua edge location của CloudFront rồi đi trên backbone AWS tới bucket ở xa. Dùng cho người dùng phân tán toàn cầu upload vào một bucket. Endpoint dạng bucket.s3-accelerate.amazonaws.com |
| **Byte-range fetches** | Tải song song nhiều đoạn của một object bằng header Range; cũng dùng để chỉ lấy phần đầu file (header) |
| **CloudFront** | Cache nội dung đọc nhiều gần người dùng, giảm request tới S3 |

## S3 Select

- Dùng SQL đơn giản để lọc dữ liệu **bên trong một object** (CSV, JSON, Parquet), giảm dữ liệu truyền về.
- Lưu ý: AWS đã ngừng mở S3 Select cho khách hàng mới (từ 2024), khuyến nghị dùng Athena hoặc lọc phía client. Đề thi cũ vẫn có thể nhắc S3 Select; với truy vấn nhiều object, Athena luôn là lựa chọn chuẩn.

## S3 Express One Zone

- Storage class hiệu năng cao nhất: latency **một chữ số mili giây**, nhanh hơn tới khoảng 10 lần S3 Standard, hàng trăm nghìn request mỗi giây.
- Dữ liệu chỉ ở **một AZ**, dùng **directory bucket** (khác general purpose bucket).
- Dùng cho ML training, analytics tương tác, đặt cùng AZ với compute để giảm latency.
- Đánh đổi: độ sẵn sàng thấp hơn vì chỉ 1 AZ.

## Event notifications

- Khi có sự kiện (ObjectCreated, ObjectRemoved, Restore, Replication...) S3 gửi tới **SNS, SQS, Lambda**, hoặc gửi tất cả sự kiện sang **Amazon EventBridge** để lọc nâng cao, nhiều đích, archive và replay.
- Mẫu kinh điển: upload ảnh vào S3 thì kích hoạt Lambda tạo thumbnail.

## Static website hosting

- Bucket phục vụ HTML/CSS/JS tĩnh qua website endpoint (HTTP). Cần tắt Block Public Access và có bucket policy cho phép đọc công khai, **hoặc** tốt hơn: dùng **CloudFront + Origin Access Control (OAC)** để giữ bucket private và có HTTPS.
- Nội dung động (server-side) không chạy được trên S3.

## CORS

- Khi trang web ở domain A gọi JavaScript tải tài nguyên từ bucket ở domain B, trình duyệt cần bucket B trả header CORS.
- Cấu hình **CORS rules trên bucket được gọi tới** (không phải bucket chứa trang).

## S3 Object Lambda

- Gắn Lambda vào luồng GET để **biến đổi dữ liệu khi đọc** (ẩn PII, resize ảnh, đổi định dạng) mà không lưu nhiều bản copy.
- Đi qua S3 Access Point + Object Lambda Access Point.

## Bảng chọn nhanh

| Yêu cầu | Đáp án |
|---|---|
| Upload file lớn nhanh và chịu lỗi mạng | Multipart upload |
| Người dùng ở nhiều châu lục upload vào 1 bucket | Transfer Acceleration |
| Tăng GET/s vượt 5,500 | Thêm prefix, hoặc CloudFront cache |
| Latency một chữ số ms cho ML | S3 Express One Zone |
| Mỗi app cần một view khác nhau của cùng dữ liệu | S3 Object Lambda |
| Truy vấn SQL nhiều file trong S3 | Athena |
`,
    keywords: [
      { trigger: 'upload large files faster, resume failed uploads', answer: 'Multipart upload' },
      { trigger: 'global users upload to a single bucket in one Region', answer: 'S3 Transfer Acceleration' },
      { trigger: 'more than 5,500 GET requests per second', answer: 'Distribute objects across multiple prefixes / CloudFront' },
      { trigger: 'download only part of a large object, parallel download', answer: 'Byte-range fetches' },
      { trigger: 'single-digit millisecond latency, colocate with compute in one AZ', answer: 'S3 Express One Zone' },
      { trigger: 'trigger processing when object is uploaded', answer: 'S3 Event Notifications (Lambda/SQS/SNS/EventBridge)' },
      { trigger: 'redact data on retrieval without storing copies', answer: 'S3 Object Lambda' },
      { trigger: 'browser blocked loading assets from another bucket', answer: 'Configure CORS on target bucket' },
    ],
    traps: [
      'Giới hạn 3,500/5,500 là mỗi prefix, không phải mỗi bucket.',
      'Một PUT đơn tối đa 5 GB; file lớn hơn bắt buộc multipart upload.',
      'Transfer Acceleration giúp khi khoảng cách địa lý xa; không cải thiện khi client ở cùng Region.',
      'S3 Express One Zone chỉ ở 1 AZ, không phù hợp dữ liệu cần chịu được mất AZ.',
      'S3 website endpoint không hỗ trợ HTTPS trực tiếp; cần CloudFront.',
      'CORS cấu hình trên bucket chứa tài nguyên được gọi, không phải bucket gọi.',
    ],
  },
  {
    slug: 'relational-databases',
    domain: 'performance',
    title: 'Relational database: RDS, Aurora và Redshift',
    summary:
      'Cách scale RDS bằng read replica, RDS Proxy, storage autoscaling; kiến trúc Aurora, endpoints, Serverless v2, I/O-Optimized; và khi nào dùng Redshift thay vì RDS.',
    services: ['Amazon RDS', 'Amazon Aurora', 'Amazon RDS Proxy', 'Aurora Serverless v2', 'Amazon Redshift'],
    minutes: 11,
    body: `## Amazon RDS

- Managed relational database: **MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2** (Aurora là engine riêng).
- AWS lo patch, backup tự động (retention tới 35 ngày), point-in-time restore. Bạn chọn instance class và storage.
- **Instance sizing**: scale up (đổi instance class lớn hơn) có downtime ngắn; memory optimized (R) cho DB lớn.
- **Storage autoscaling**: tự tăng dung lượng khi gần đầy, đặt maximum storage threshold. Dùng cho workload khó dự đoán dung lượng.
- **RDS Custom**: dành cho Oracle và SQL Server khi cần quyền truy cập OS/DB để tùy biến.

## Read replica vs Multi-AZ

| | Read Replica | Multi-AZ (instance) | Multi-AZ DB cluster |
|---|---|---|---|
| Mục đích | **Scale đọc** (performance) | **High availability** | HA + đọc |
| Replication | Asynchronous | Synchronous | Synchronous (semi-sync) |
| Đọc từ bản phụ | Có | **Không** (standby không nhận traffic) | Có, 2 readable standby |
| Vị trí | Cùng AZ, khác AZ, khác Region | AZ khác cùng Region | 3 AZ |
| Failover | Promote thủ công thành DB độc lập | Tự động, DNS endpoint không đổi | Tự động, nhanh hơn |

- RDS MySQL, MariaDB, PostgreSQL hỗ trợ tới **15 read replica**.
- App phải tự gửi query đọc tới endpoint của replica (connection string riêng).
- Replication cross-Region tính phí data transfer.

## RDS Proxy

- Connection pooling được quản lý, nằm giữa app và RDS/Aurora.
- Giải quyết **quá nhiều kết nối** (đặc biệt từ Lambda), giảm thời gian failover (tới khoảng 66%), giữ kết nối khi failover.
- Hỗ trợ IAM authentication và lấy credential từ Secrets Manager; chỉ truy cập được trong VPC.

## Amazon Aurora

### Kiến trúc

- Tương thích **MySQL** và **PostgreSQL**, hiệu năng cao hơn RDS cùng engine (AWS công bố tới 5 lần MySQL, 3 lần PostgreSQL).
- Storage cluster volume tự tăng, lưu **6 bản copy trên 3 AZ**; ghi cần 4/6, đọc cần 3/6; tự sửa lỗi.
- Tới **15 Aurora Replica** dùng chung storage nên replica lag rất thấp (thường dưới 100 ms). Failover sang replica thường dưới 30 giây.

### Endpoints

| Endpoint | Chức năng |
|---|---|
| Cluster (writer) endpoint | Luôn trỏ tới primary, dùng cho ghi |
| Reader endpoint | Cân bằng tải kết nối qua các replica |
| Custom endpoint | Nhóm một tập replica cụ thể (ví dụ replica lớn cho analytics) |
| Instance endpoint | Kết nối trực tiếp một instance |

### Các tính năng hiệu năng

- **Aurora Auto Scaling**: tự thêm/bớt Aurora Replica theo CPU hoặc số kết nối.
- **Aurora Serverless v2**: capacity scale theo ACU gần như tức thời, chi tiết, cho workload biến động, multi-tenant, dev/test. Có thể trộn instance provisioned và serverless trong cùng cluster.
- **Aurora Global Database**: replication cross-Region thường dưới 1 giây, tới nhiều Region phụ chỉ đọc, dùng cho đọc toàn cầu latency thấp và DR (RPO khoảng 1 giây, RTO dưới 1 phút).
- **Aurora I/O-Optimized**: không tính phí I/O, giá instance và storage cao hơn; tiết kiệm khi chi phí I/O chiếm hơn khoảng 25% tổng chi phí Aurora.
- **Babelfish for Aurora PostgreSQL**: hiểu T-SQL và giao thức SQL Server, giúp app SQL Server chuyển sang Aurora PostgreSQL với ít thay đổi code.
- **Parallel Query**, **Backtrack** (MySQL), **Database cloning** nhanh dùng cho test.

## Redshift vs RDS

| | RDS / Aurora | Amazon Redshift |
|---|---|---|
| Loại | OLTP (giao dịch, nhiều truy vấn nhỏ) | OLAP / data warehouse (truy vấn phân tích lớn) |
| Lưu trữ | Theo hàng (row) | Theo cột (columnar), nén cao, MPP |
| Dữ liệu | GB tới vài chục TB | TB tới PB |
| Tình huống | Đơn hàng, user, giỏ hàng | Báo cáo BI, aggregate trên dữ liệu lịch sử |

- Báo cáo nặng chạy trên DB OLTP làm chậm production: giải pháp thường là **read replica** (nếu báo cáo đơn giản) hoặc **đưa dữ liệu sang Redshift** (nếu là analytics phức tạp, khối lượng lớn).
- Redshift Serverless cho tải phân tích không đều, không muốn quản lý cluster.

## Mẹo đề thi

- "Read-heavy, reduce load on primary": read replica / Aurora Replica.
- "Too many connections, Lambda": RDS Proxy.
- "Unpredictable, intermittent workload": Aurora Serverless v2.
- "Global users, low-latency reads, cross-Region DR": Aurora Global Database.
- "Migrate SQL Server with minimal code changes to open-source": Babelfish.
`,
    keywords: [
      { trigger: 'read-heavy workload, offload reads from primary', answer: 'Read replicas / Aurora Replicas' },
      { trigger: 'Lambda exhausts database connections', answer: 'Amazon RDS Proxy' },
      { trigger: 'unpredictable or intermittent database workload', answer: 'Aurora Serverless v2' },
      { trigger: 'storage fills up unpredictably', answer: 'RDS storage autoscaling' },
      { trigger: 'reporting queries on specific replicas only', answer: 'Aurora custom endpoint' },
      { trigger: 'I/O charges are a large part of Aurora bill', answer: 'Aurora I/O-Optimized' },
      { trigger: 'SQL Server app to PostgreSQL with minimal code change', answer: 'Babelfish for Aurora PostgreSQL' },
      { trigger: 'complex analytics on petabytes, columnar', answer: 'Amazon Redshift' },
      { trigger: 'low-latency global reads with sub-second replication', answer: 'Aurora Global Database' },
    ],
    traps: [
      'Multi-AZ standby (instance) không phục vụ đọc; muốn scale đọc phải dùng read replica.',
      'Read replica replicate bất đồng bộ, có thể đọc dữ liệu cũ.',
      'Aurora Replica tối đa 15; RDS read replica cũng tối đa 15 với MySQL/MariaDB/PostgreSQL.',
      'Redshift không dùng cho OLTP; RDS không phải data warehouse cho PB dữ liệu.',
      'RDS Proxy không có public endpoint, chỉ dùng trong VPC.',
    ],
  },
  {
    slug: 'nosql-caching',
    domain: 'performance',
    title: 'NoSQL và caching: DynamoDB, ElastiCache, purpose-built databases',
    summary:
      'Thiết kế DynamoDB (partition key, RCU/WCU, GSI/LSI, DAX), chiến lược caching với ElastiCache, MemoryDB và chọn purpose-built database phù hợp.',
    services: ['Amazon DynamoDB', 'DynamoDB Accelerator (DAX)', 'Amazon ElastiCache', 'Amazon MemoryDB', 'Amazon DocumentDB', 'Amazon Neptune', 'Amazon Keyspaces', 'Amazon Timestream', 'Amazon OpenSearch Service'],
    minutes: 12,
    body: `## Amazon DynamoDB

NoSQL key-value và document, serverless, latency một chữ số mili giây ở mọi quy mô. Item tối đa **400 KB**.

### Partition key design

- Dữ liệu được chia theo hash của **partition key**. Key có **cardinality cao, phân bố đều** (userId, orderId) tránh **hot partition**.
- Key kém: status, ngày hiện tại, giá trị ít lựa chọn. Có thể thêm hậu tố ngẫu nhiên (write sharding) để rải ghi.
- **Composite key** = partition key + sort key, cho phép query theo khoảng trên sort key.

### Capacity

- **1 RCU** = 1 strongly consistent read/giây cho item tới **4 KB**, hoặc 2 eventually consistent read/giây. Transactional read tốn gấp đôi.
- **1 WCU** = 1 write/giây cho item tới **1 KB**. Transactional write tốn gấp đôi.
- Ví dụ: đọc strongly consistent 10 item 6 KB/giây: mỗi item làm tròn lên 8 KB = 2 RCU, tổng 20 RCU.

| Mode | Khi dùng |
|---|---|
| **On-demand** | Tải không dự đoán được, ứng dụng mới, spike đột ngột; trả theo request, không cần lập kế hoạch |
| **Provisioned + Auto Scaling** | Tải ổn định hoặc tăng dần dự đoán được; rẻ hơn khi sử dụng đều, có thể mua reserved capacity |

### GSI vs LSI

| | GSI | LSI |
|---|---|---|
| Key | Partition key và sort key **khác** bảng | **Cùng** partition key, sort key khác |
| Tạo khi nào | Bất kỳ lúc nào | **Chỉ khi tạo bảng** |
| Consistency | Chỉ eventually consistent | Có thể strongly consistent |
| Capacity | Riêng của index | Dùng chung với bảng |
| Giới hạn | Tối đa 20 mỗi bảng (mặc định) | Tối đa 5; giới hạn 10 GB mỗi giá trị partition key |

Lưu ý: GSI bị throttle ghi có thể làm throttle ghi trên bảng chính, nên cấp đủ capacity cho GSI.

### Các tính năng khác

- **DAX**: cache in-memory cho DynamoDB, đọc từ **mili giây xuống micro giây**, API tương thích (ít thay đổi code). Chỉ giúp đọc (eventually consistent), không giúp ghi.
- **DynamoDB Streams**: ghi lại thay đổi item theo thứ tự, lưu 24 giờ; kích hoạt Lambda để xử lý event, replicate, cập nhật aggregate.
- **TTL**: tự xóa item hết hạn, không tốn WCU; dùng cho session, dữ liệu tạm.
- **Transactions**: TransactWriteItems/TransactGetItems, ACID trên nhiều item/bảng.
- **Global Tables**: multi-Region, multi-active, latency thấp cho người dùng toàn cầu.
- **Export to S3** (point-in-time) để phân tích bằng Athena mà không tốn RCU.

## Amazon ElastiCache

| | Redis OSS / Valkey | Memcached |
|---|---|---|
| Cấu trúc dữ liệu | Phong phú: string, hash, list, set, **sorted set** (leaderboard), pub/sub, geo | Key-value đơn giản |
| HA | Replication, Multi-AZ, auto failover | Không replication |
| Persistence | Snapshot/backup | Không |
| Scale | Cluster mode (sharding) | Multi-threaded, sharding phía client |

- **Valkey** là fork mã nguồn mở của Redis, được ElastiCache hỗ trợ với giá thấp hơn; với câu hỏi, hãy xem như họ Redis.
- ElastiCache cũng có bản **Serverless**.
- Dùng: cache kết quả query DB, **session store** (ứng dụng stateless), leaderboard, rate limiting.

### Chiến lược caching

| Chiến lược | Cách làm | Ưu | Nhược |
|---|---|---|---|
| **Lazy loading (cache-aside)** | Đọc cache; miss thì đọc DB rồi ghi vào cache | Chỉ cache dữ liệu được dùng; cache lỗi không làm hỏng app | Cache miss tốn 3 bước; dữ liệu có thể cũ |
| **Write-through** | Mỗi lần ghi DB thì ghi luôn vào cache | Dữ liệu cache luôn mới | Ghi chậm hơn; cache chứa dữ liệu không bao giờ đọc |
| **TTL** | Đặt thời gian hết hạn cho key | Cân bằng độ mới và hit rate | Chọn TTL quá ngắn làm giảm hit rate |

Thường kết hợp lazy loading + write-through + TTL.

## Amazon MemoryDB

- Redis/Valkey-compatible nhưng là **database chính bền vững** (transaction log Multi-AZ), đọc micro giây, ghi mili giây một chữ số.
- Chọn khi cần tốc độ in-memory **và** không được mất dữ liệu. ElastiCache chủ yếu là cache.

## Purpose-built databases

| Dịch vụ | Kiểu | Từ khóa |
|---|---|---|
| DocumentDB | Document, tương thích MongoDB | "MongoDB workload, JSON documents" |
| Neptune | Graph | "social network, relationships, fraud detection, knowledge graph" |
| Keyspaces | Wide-column, tương thích Apache Cassandra (CQL) | "Cassandra migration, serverless" |
| Timestream | Time series | "IoT sensor data, metrics over time" |
| OpenSearch Service | Search và log analytics | "full-text search, log analytics, dashboards" |
| QLDB | Ledger | Đã ngừng hỗ trợ (end of support 2025), không chọn cho thiết kế mới |
`,
    keywords: [
      { trigger: 'microsecond read latency for DynamoDB', answer: 'DynamoDB Accelerator (DAX)' },
      { trigger: 'unpredictable traffic, new application, no capacity planning', answer: 'DynamoDB on-demand' },
      { trigger: 'query by a different attribute after table creation', answer: 'Global Secondary Index (GSI)' },
      { trigger: 'automatically delete expired items', answer: 'DynamoDB TTL' },
      { trigger: 'react to item changes, trigger Lambda', answer: 'DynamoDB Streams' },
      { trigger: 'leaderboard, sorted sets, HA cache', answer: 'ElastiCache for Redis OSS / Valkey' },
      { trigger: 'durable in-memory primary database, Redis compatible', answer: 'Amazon MemoryDB' },
      { trigger: 'graph relationships, fraud detection', answer: 'Amazon Neptune' },
      { trigger: 'MongoDB compatible managed database', answer: 'Amazon DocumentDB' },
      { trigger: 'Cassandra workload, CQL, serverless', answer: 'Amazon Keyspaces' },
    ],
    traps: [
      'LSI chỉ tạo được khi tạo bảng; cần index mới cho bảng có sẵn thì dùng GSI.',
      'GSI không hỗ trợ strongly consistent read.',
      'DAX chỉ tăng tốc đọc, không giúp throttle ghi; ghi nhiều cần chia partition key tốt hơn hoặc thêm WCU.',
      'Memcached không có replication và persistence; cần HA thì chọn Redis OSS/Valkey.',
      'ElastiCache là cache, không phải database chính bền vững; cần bền dùng MemoryDB.',
      'Partition key ít giá trị (status, country) gây hot partition.',
    ],
  },
  {
    slug: 'edge-networking',
    domain: 'performance',
    title: 'Edge và mạng hiệu năng cao: CloudFront, Global Accelerator, Direct Connect',
    summary:
      'Tối ưu latency toàn cầu với CloudFront và Global Accelerator, enhanced networking, băng thông Direct Connect và S3 Transfer Acceleration.',
    services: ['Amazon CloudFront', 'AWS Global Accelerator', 'AWS Direct Connect', 'S3 Transfer Acceleration', 'Lambda@Edge', 'CloudFront Functions'],
    minutes: 10,
    body: `## Amazon CloudFront

CDN với hàng trăm edge location. Cache nội dung gần người dùng, giảm latency và giảm tải origin. Hỗ trợ HTTP/HTTPS, WebSocket.

### Origins

- **S3 bucket**: dùng **Origin Access Control (OAC)** để chỉ CloudFront đọc được bucket (OAI là cách cũ).
- **Custom origin**: ALB, EC2, API Gateway, bất kỳ HTTP server nào (kể cả on-premises). Với ALB/EC2, origin phải truy cập được qua internet (hoặc dùng **VPC origins** cho ALB/EC2 trong private subnet).
- **S3 website endpoint** được xem là custom origin.

### Behaviors và cache

- **Cache behavior**: định tuyến theo path pattern (ví dụ /api/* tới ALB, /static/* tới S3), mỗi behavior có cache policy, viewer protocol policy, allowed methods riêng.
- **Cache policy**: xác định cache key (header, cookie, query string nào) và TTL (min/default/max). Cache key càng ít thành phần thì cache hit ratio càng cao.
- **Origin request policy**: gửi thêm header/cookie/query string tới origin mà **không** đưa vào cache key.
- **TTL**: origin có thể điều khiển bằng Cache-Control/Expires trong giới hạn min/max TTL.
- **Invalidation**: xóa object khỏi cache trước khi hết TTL (có phí khi vượt mức miễn phí). Cách tốt hơn cho deploy thường xuyên: **versioned file name** (app.v2.js).

### Tính sẵn sàng và bảo mật

- **Origin failover (origin group)**: primary và secondary origin; khi primary trả mã lỗi cấu hình (ví dụ 500, 502, 503, 504) hoặc timeout, CloudFront thử secondary. Áp dụng cho request GET, HEAD, OPTIONS.
- **Geo restriction**: allowlist/blocklist theo quốc gia.
- **Field-level encryption**: mã hóa các trường cụ thể trong POST (ví dụ số thẻ) tại edge bằng public key, chỉ backend có private key mới giải mã.
- **Signed URL / signed cookies** cho nội dung riêng tư; tích hợp AWS WAF và Shield.

### Compute tại edge

| | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Runtime | JavaScript nhẹ | Node.js, Python |
| Thời gian | Dưới 1 ms | Tới vài giây |
| Dùng cho | Rewrite URL, header, cache key, redirect đơn giản | Logic phức tạp, gọi network, xử lý body |

## AWS Global Accelerator

- Cung cấp **2 static anycast IP** toàn cầu. Traffic vào edge gần nhất rồi đi trên **mạng backbone AWS** tới endpoint (ALB, NLB, EC2, Elastic IP) ở một hoặc nhiều Region.
- Health check và **failover giữa Region rất nhanh** (không phụ thuộc DNS cache). Traffic dial và endpoint weight để điều phối.
- Hỗ trợ **TCP và UDP**: gaming, IoT, VoIP, ứng dụng cần IP cố định để whitelist.

### CloudFront vs Global Accelerator

| | CloudFront | Global Accelerator |
|---|---|---|
| Cơ chế | Cache nội dung ở edge | Proxy packet, không cache |
| Giao thức | HTTP/HTTPS (WebSocket) | TCP, UDP |
| IP | Nhiều IP động (dùng DNS) | 2 static anycast IP |
| Tình huống | Nội dung tĩnh/động web, video | Non-HTTP, IP cố định, failover đa Region nhanh |

## Enhanced networking trên EC2

- **ENA**: tới 100 Gbps trở lên tùy instance, PPS cao, latency thấp.
- **EFA**: cho HPC/ML với MPI, OS-bypass.
- Kết hợp **cluster placement group** để có băng thông cao nhất giữa các node. Lưu lượng một flow đơn lẻ bị giới hạn thấp hơn tổng băng thông instance.

## AWS Direct Connect

- Kết nối mạng **riêng, chuyên dụng** từ data center tới AWS qua Direct Connect location. Latency ổn định, băng thông đảm bảo hơn internet.
- **Dedicated connection**: 1, 10, 100 Gbps (và 400 Gbps ở một số location), cổng vật lý riêng.
- **Hosted connection**: qua AWS Partner, từ 50 Mbps tới 10 Gbps (một số partner hỗ trợ cao hơn).
- Thời gian thiết lập thường **nhiều tuần**: không phù hợp nhu cầu gấp.
- Mặc định **không mã hóa**: dùng MACsec (trên cổng dedicated hỗ trợ) hoặc VPN chạy trên Direct Connect.
- **LAG** gộp nhiều kết nối để tăng băng thông. **Direct Connect Gateway** kết nối tới nhiều VPC/Region.
- HA: 2 kết nối ở 2 location khác nhau, hoặc Site-to-Site VPN làm backup.

## S3 Transfer Acceleration

- Upload qua edge location CloudFront, đi tiếp trên backbone AWS tới bucket. Chỉ tính phí khi thực sự tăng tốc.
- So với Global Accelerator: Transfer Acceleration chỉ cho S3; Global Accelerator cho endpoint ứng dụng.

## Chọn nhanh

- Website toàn cầu, nội dung tĩnh, giảm tải origin: CloudFront.
- Game UDP, IP cố định, failover đa Region trong vài giây: Global Accelerator.
- Băng thông ổn định, private, truyền dữ liệu lớn liên tục từ on-prem: Direct Connect.
`,
    keywords: [
      { trigger: 'cache static content globally, reduce origin load', answer: 'Amazon CloudFront' },
      { trigger: 'static IP addresses, TCP/UDP, multi-Region failover', answer: 'AWS Global Accelerator' },
      { trigger: 'restrict S3 access to CloudFront only', answer: 'Origin Access Control (OAC)' },
      { trigger: 'automatic failover to secondary origin on 5xx', answer: 'CloudFront origin group' },
      { trigger: 'protect specific form fields end-to-end', answer: 'CloudFront field-level encryption' },
      { trigger: 'block content in specific countries', answer: 'CloudFront geo restriction' },
      { trigger: 'lightweight header rewrite at edge, sub-millisecond', answer: 'CloudFront Functions' },
      { trigger: 'consistent network performance, private dedicated link to on-premises', answer: 'AWS Direct Connect' },
    ],
    traps: [
      'Global Accelerator không cache nội dung; cần cache thì CloudFront.',
      'CloudFront không hỗ trợ UDP; game UDP cần Global Accelerator.',
      'Direct Connect mất nhiều tuần để thiết lập, không phải giải pháp cho yêu cầu ngay lập tức.',
      'Direct Connect không mã hóa mặc định; cần VPN hoặc MACsec.',
      'Invalidation thường xuyên tốn phí; nên dùng versioned file name.',
      'Thêm nhiều header/cookie vào cache key làm giảm cache hit ratio.',
    ],
  },
  {
    slug: 'data-analytics',
    domain: 'performance',
    title: 'Streaming và analytics: Kinesis, Firehose, Athena, Glue, EMR, Redshift',
    summary:
      'Chọn dịch vụ ingest streaming, xử lý ETL, truy vấn data lake và data warehouse; tối ưu bằng định dạng cột và partitioning.',
    services: ['Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'Amazon Managed Service for Apache Flink', 'Amazon MSK', 'Amazon Athena', 'AWS Glue', 'Amazon EMR', 'Amazon Redshift', 'AWS Lake Formation', 'Amazon QuickSight', 'Amazon OpenSearch Service'],
    minutes: 12,
    body: `## Streaming ingest

| Dịch vụ | Bản chất | Khi chọn |
|---|---|---|
| **Kinesis Data Streams** | Stream real-time, bạn viết consumer | Cần xử lý tùy biến, nhiều consumer, replay, latency dưới 1 giây |
| **Amazon Data Firehose** (trước đây Kinesis Data Firehose) | Delivery stream fully managed, gần real-time | Chỉ cần đẩy dữ liệu vào S3, Redshift, OpenSearch, Splunk, HTTP endpoint, Snowflake, Apache Iceberg tables mà không viết code |
| **Managed Service for Apache Flink** (trước đây Kinesis Data Analytics) | Xử lý stream bằng Apache Flink (SQL, Java, Python) | Phân tích real-time: windowing, aggregate, phát hiện bất thường trên stream |
| **Amazon MSK** | Apache Kafka managed (có MSK Serverless) | Đã dùng Kafka, cần tương thích Kafka API |

### Kinesis Data Streams chi tiết

- Provisioned mode: mỗi **shard** nhận **1 MB/s hoặc 1,000 record/s** ghi, **2 MB/s** đọc (chia sẻ giữa các consumer).
- **Enhanced fan-out**: mỗi consumer có 2 MB/s riêng mỗi shard, latency thấp hơn.
- **On-demand mode**: tự scale, không quản lý shard.
- Retention mặc định 24 giờ, tăng được tới 365 ngày. Dữ liệu có thứ tự trong một shard theo partition key.
- Consumer: Lambda, KCL app trên EC2/ECS, Managed Service for Apache Flink, Firehose.

### Amazon Data Firehose chi tiết

- Tự scale, không có shard. **Buffer** theo kích thước/thời gian rồi ghi batch, nên là **near real-time**.
- Có thể **transform bằng Lambda**, **chuyển đổi sang Parquet/ORC**, nén, phân vùng động (dynamic partitioning) khi ghi S3.
- Không lưu trữ để replay; không có nhiều consumer tùy biến.

## Truy vấn và xử lý

### Amazon Athena

- **Serverless SQL** (Trino/Presto) trực tiếp trên S3, trả tiền theo **lượng dữ liệu quét**.
- Dùng Glue Data Catalog làm metastore. **Federated query** truy vấn nguồn khác (RDS, DynamoDB...) qua connector.
- Giảm chi phí và tăng tốc: **định dạng cột (Parquet/ORC)**, **nén**, **partition** (theo year/month/day), file lớn vừa phải (tránh hàng triệu file nhỏ).

### AWS Glue

- **Crawler**: quét S3/DB, suy ra schema, tạo bảng trong **Glue Data Catalog**.
- **Data Catalog**: metastore trung tâm cho Athena, EMR, Redshift Spectrum.
- **Glue ETL jobs**: Apache Spark serverless để transform (ví dụ chuyển CSV sang Parquet). **Job bookmarks** tránh xử lý lại dữ liệu cũ.
- **Glue DataBrew**: làm sạch, chuẩn hóa dữ liệu bằng giao diện trực quan, không cần code.

### Amazon EMR

- Cluster Hadoop/Spark/Hive/Presto/HBase managed, chạy trên EC2, EKS hoặc **EMR Serverless**.
- Chọn khi cần kiểm soát framework big data, job Spark lớn, tận dụng Spot instance cho task node.

### Amazon Redshift

- Data warehouse **columnar, MPP**, truy vấn SQL phân tích trên TB tới PB.
- **RA3** tách compute và storage (managed storage). **Redshift Serverless** không cần quản lý cluster.
- **Concurrency scaling** thêm capacity khi nhiều truy vấn đồng thời. **Materialized views** tăng tốc truy vấn lặp lại.
- **Redshift Spectrum**: truy vấn dữ liệu trên S3 trực tiếp từ Redshift, join với bảng trong warehouse mà không cần load.
- Zero-ETL integration từ Aurora/RDS/DynamoDB sang Redshift để phân tích gần real-time.

### Athena vs Redshift vs EMR

| | Athena | Redshift | EMR |
|---|---|---|---|
| Mô hình | Serverless, ad hoc | Warehouse, truy vấn thường xuyên, BI | Cluster big data tùy biến |
| Dữ liệu | Trên S3 | Load vào Redshift (hoặc Spectrum) | S3/HDFS |
| Phù hợp | Truy vấn thỉnh thoảng, ít overhead | Dashboard phức tạp, nhiều join, hiệu năng ổn định | Spark/Hadoop, ML pipeline tùy chỉnh |

## Governance và hiển thị

- **AWS Lake Formation**: xây data lake trên S3 nhanh, quản lý quyền tập trung **chi tiết tới cột, hàng, cell** (fine-grained), tag-based access control, chia sẻ cross-account. Dựa trên Glue Data Catalog.
- **Amazon QuickSight**: BI serverless, dashboard, engine in-memory SPICE, tính năng ML insights.
- **Amazon OpenSearch Service**: search full-text, log analytics, dashboards (OpenSearch Dashboards). Có bản Serverless. Hay đi cùng Firehose để ingest log.

## Định dạng cột và partitioning

| | CSV/JSON (row) | Parquet/ORC (columnar) |
|---|---|---|
| Đọc vài cột | Phải đọc cả dòng | Chỉ đọc cột cần |
| Nén | Kém | Tốt (dữ liệu cùng kiểu) |
| Chi phí Athena | Cao | Thấp hơn nhiều |

- **Partition** theo cột hay lọc (ví dụ s3://bucket/logs/year=2026/month=10/) để Athena chỉ quét partition liên quan (partition pruning).

## Chọn nhanh

- Clickstream real-time, nhiều consumer: Kinesis Data Streams.
- Đưa log vào S3 với ít vận hành nhất, đổi sang Parquet: Data Firehose.
- SQL ad hoc trên S3: Athena.
- Phân quyền chi tiết cho data lake: Lake Formation.
`,
    keywords: [
      { trigger: 'real-time streaming, multiple consumers, replay data', answer: 'Kinesis Data Streams' },
      { trigger: 'load streaming data into S3/Redshift/OpenSearch with no code', answer: 'Amazon Data Firehose' },
      { trigger: 'real-time analytics on streams with SQL/Flink', answer: 'Managed Service for Apache Flink' },
      { trigger: 'existing Apache Kafka workloads', answer: 'Amazon MSK' },
      { trigger: 'ad hoc SQL queries on data in S3, serverless', answer: 'Amazon Athena' },
      { trigger: 'discover schema and populate data catalog', answer: 'AWS Glue crawler + Data Catalog' },
      { trigger: 'query S3 data from data warehouse without loading', answer: 'Redshift Spectrum' },
      { trigger: 'fine-grained column/row-level permissions on data lake', answer: 'AWS Lake Formation' },
      { trigger: 'reduce Athena cost and improve performance', answer: 'Parquet/ORC + compression + partitioning' },
      { trigger: 'visual data preparation without code', answer: 'AWS Glue DataBrew' },
    ],
    traps: [
      'Firehose là near real-time (có buffer), không phải real-time dưới 1 giây và không hỗ trợ replay.',
      'Firehose không ghi trực tiếp vào DynamoDB hay RDS.',
      'Athena tính tiền theo dữ liệu quét; CSV không nén làm tăng chi phí.',
      'Kinesis Data Streams provisioned cần tăng shard khi bị throttle (ProvisionedThroughputExceeded); hoặc chuyển on-demand.',
      'Dùng tên mới: Amazon Data Firehose và Managed Service for Apache Flink; Kinesis Data Analytics là tên cũ.',
    ],
  },
  {
    slug: 'data-migration',
    domain: 'performance',
    title: 'Di chuyển dữ liệu và workload lên AWS',
    summary:
      'DataSync, Storage Gateway, Transfer Family, Snow Family, DMS + SCT, Application Migration Service và cách tính thời gian truyền dữ liệu qua mạng.',
    services: ['AWS DataSync', 'AWS Storage Gateway', 'AWS Transfer Family', 'AWS Snowball Edge', 'AWS Database Migration Service', 'AWS Schema Conversion Tool', 'AWS Application Migration Service'],
    minutes: 10,
    body: `## AWS DataSync

- Dịch vụ **truyền dữ liệu online** tự động, nhanh: từ NFS, SMB, HDFS, object storage tương thích S3 (và giữa các dịch vụ AWS) tới **S3, EFS, FSx**.
- On-premises cần cài **DataSync agent** (VM). Tự mã hóa khi truyền, kiểm tra toàn vẹn dữ liệu, lập lịch, giới hạn băng thông, giữ metadata/permission.
- Chạy qua internet hoặc Direct Connect. Phù hợp **migration một lần** hoặc **đồng bộ định kỳ**.

## AWS Storage Gateway

Hybrid storage: on-premises dùng giao thức quen thuộc, dữ liệu nằm ở AWS, có cache cục bộ cho latency thấp.

| Loại | Giao thức | Lưu ở AWS | Dùng khi |
|---|---|---|---|
| **S3 File Gateway** | NFS, SMB | Object trong S3 | File share on-prem nhưng dữ liệu nằm ở S3, áp dụng lifecycle |
| **Volume Gateway - Cached** | iSCSI | S3 (dạng EBS snapshot), dữ liệu nóng cache local | Mở rộng dung lượng block mà không mua thêm storage |
| **Volume Gateway - Stored** | iSCSI | Toàn bộ dữ liệu local, backup bất đồng bộ lên AWS | Cần latency thấp cho toàn bộ dataset, backup lên cloud |
| **Tape Gateway** | iSCSI VTL | S3, S3 Glacier Flexible Retrieval/Deep Archive | Thay thế tape vật lý, giữ nguyên phần mềm backup |

Lưu ý: Amazon FSx File Gateway đã ngừng nhận khách hàng mới; với Windows file share, ưu tiên FSx for Windows File Server truy cập trực tiếp.

## AWS Transfer Family

- Endpoint **SFTP, FTPS, FTP, AS2** fully managed, lưu dữ liệu vào **S3 hoặc EFS**.
- Dùng khi đối tác bên ngoài vẫn gửi file qua SFTP, không muốn thay đổi client. Xác thực qua service-managed user, AD, hoặc identity provider tùy chỉnh.

## Snow Family (offline transfer)

- **Snowball Edge**: thiết bị vật lý (Storage Optimized, Compute Optimized) để chuyển hàng chục tới hàng trăm TB khi mạng chậm hoặc không có mạng, và edge computing.
- Trạng thái hiện nay: **Snowmobile đã ngừng**, **Snowcone đã ngừng**, và AWS đã thu hẹp Snowball Edge (không còn mở cho khách hàng mới). AWS khuyến nghị DataSync qua mạng, Direct Connect, hoặc AWS Data Transfer Terminal (điểm truyền dữ liệu vật lý). Trong đề SAA-C03, Snowball Edge vẫn có thể là đáp án cho "hàng trăm TB, băng thông hạn chế, cần xong trong vài tuần".

## Database migration: DMS + SCT

- **AWS DMS**: di chuyển database với **downtime tối thiểu**; DB nguồn vẫn hoạt động trong lúc migrate. **Full load + CDC** (change data capture) để đồng bộ liên tục tới lúc cutover.
- **Homogeneous** (Oracle sang Oracle, MySQL sang Aurora MySQL): không cần chuyển schema.
- **Heterogeneous** (Oracle sang Aurora PostgreSQL, SQL Server sang MySQL): dùng **AWS SCT** hoặc **DMS Schema Conversion** để chuyển schema, stored procedure; sau đó DMS chuyển dữ liệu.
- DMS cần **replication instance** (hoặc DMS Serverless). Target có thể là RDS, Aurora, Redshift, DynamoDB, S3, OpenSearch, Kinesis...
- DB rất lớn: kết hợp Snowball Edge + DMS (nếu khả dụng) hoặc dùng native backup/restore.

## AWS Application Migration Service (MGN)

- **Lift-and-shift (rehost)** server vật lý, VMware, Hyper-V, hoặc cloud khác sang EC2.
- Replication block-level liên tục, test launch không gián đoạn, cutover với downtime vài phút.
- Thay thế CloudEndure Migration và Server Migration Service (SMS).
- **Migration Hub** theo dõi tiến độ; **Application Discovery Service** thu thập thông tin server trước khi migrate.

## Tính thời gian truyền dữ liệu

Công thức: thời gian = dung lượng / băng thông thực tế.

- 1 Gbps = 125 MB/s, khoảng 10.8 TB/ngày nếu dùng 100% (thực tế thấp hơn, thường tính khoảng 80%).
- 100 Mbps: khoảng 1.08 TB/ngày.

| Dữ liệu | 100 Mbps | 1 Gbps | 10 Gbps |
|---|---|---|---|
| 10 TB | khoảng 9-10 ngày | khoảng 1 ngày | khoảng 2-3 giờ |
| 100 TB | khoảng 3 tháng | khoảng 9-10 ngày | khoảng 1 ngày |
| 1 PB | khoảng 2.5 năm | khoảng 3 tháng | khoảng 9-10 ngày |

Cách làm bài: nếu thời gian truyền qua mạng vượt quá deadline (và Direct Connect mất nhiều tuần để lắp), chọn thiết bị offline. Nếu đủ thời gian và có băng thông, chọn DataSync.

## Chọn nhanh

| Tình huống | Dịch vụ |
|---|---|
| Chuyển NFS/SMB lên S3/EFS/FSx, có lịch, kiểm tra toàn vẹn | DataSync |
| App on-prem vẫn cần NFS/SMB, dữ liệu nằm ở S3 | S3 File Gateway |
| Thay tape backup | Tape Gateway |
| Đối tác gửi file qua SFTP | Transfer Family |
| Migrate DB ít downtime | DMS (+ SCT nếu khác engine) |
| Rehost hàng trăm server | Application Migration Service |
`,
    keywords: [
      { trigger: 'online transfer from NFS/SMB to S3/EFS/FSx, scheduled, integrity verification', answer: 'AWS DataSync' },
      { trigger: 'on-premises apps access S3 via NFS/SMB with local cache', answer: 'S3 File Gateway' },
      { trigger: 'replace physical tape library, keep backup software', answer: 'Tape Gateway' },
      { trigger: 'iSCSI block storage backed by AWS, cache frequently accessed data', answer: 'Volume Gateway cached' },
      { trigger: 'partners upload via SFTP to S3', answer: 'AWS Transfer Family' },
      { trigger: 'migrate database with minimal downtime, CDC', answer: 'AWS DMS' },
      { trigger: 'convert schema between different database engines', answer: 'AWS SCT / DMS Schema Conversion' },
      { trigger: 'lift-and-shift servers to EC2 with minimal downtime', answer: 'AWS Application Migration Service' },
      { trigger: 'hundreds of TB, limited bandwidth, tight deadline', answer: 'Offline device (Snowball Edge)' },
    ],
    traps: [
      'DataSync dùng cho di chuyển/đồng bộ dữ liệu; Storage Gateway dùng khi app on-prem cần truy cập lâu dài.',
      'DMS không tự chuyển schema giữa engine khác nhau; cần SCT hoặc DMS Schema Conversion.',
      'Direct Connect mất nhiều tuần để thiết lập, không giúp được migration có deadline gấp.',
      'Snowmobile và Snowcone đã ngừng; không chọn cho thiết kế mới.',
      '1 Gbps không phải 1 GB/s: chỉ khoảng 125 MB/s.',
    ],
  },
  {
    slug: 'ai-ml-services',
    domain: 'performance',
    title: 'Dịch vụ AI/ML: chọn đúng dịch vụ theo use case',
    summary:
      'SageMaker AI, Bedrock, Rekognition, Textract, Comprehend, Transcribe, Translate, Polly, Lex, Kendra, Personalize, Amazon Q và cách phân biệt các cặp dễ nhầm.',
    services: ['Amazon SageMaker AI', 'Amazon Bedrock', 'Amazon Rekognition', 'Amazon Textract', 'Amazon Comprehend', 'Amazon Transcribe', 'Amazon Translate', 'Amazon Polly', 'Amazon Lex', 'Amazon Kendra', 'Amazon Personalize', 'Amazon Q'],
    minutes: 10,
    body: `## Hai tầng dịch vụ AI/ML

Đề SAA-C03 không hỏi sâu về thuật toán; đề hỏi **chọn dịch vụ nào cho use case nào**, thường kèm "LEAST operational overhead".

- **AI service được quản lý sẵn** (Rekognition, Textract, Comprehend...): gọi API, model đã được AWS huấn luyện, không cần kiến thức ML.
- **Amazon Bedrock**: dùng **foundation model (FM)** có sẵn qua API cho generative AI.
- **Amazon SageMaker AI**: tự xây, huấn luyện, triển khai **model tùy chỉnh** khi dịch vụ có sẵn không đáp ứng.

## Amazon SageMaker AI

- Nền tảng ML đầy đủ (tên mới của Amazon SageMaker; tên "SageMaker" giờ chỉ cả nền tảng dữ liệu và AI với Unified Studio).
- **Notebook / SageMaker Studio**: môi trường Jupyter để khám phá dữ liệu và viết code.
- **Training job**: huấn luyện trên instance được quản lý (kể cả GPU), dữ liệu đọc từ S3, model artifact lưu vào S3.
- **Ground Truth**: gán nhãn dữ liệu (con người + tự động).
- **Triển khai**: **real-time endpoint** (latency thấp, có auto scaling), **serverless inference** (traffic thất thường), **asynchronous inference** (payload lớn, xử lý lâu), **batch transform** (dự đoán theo lô, không cần endpoint thường trực).
- **JumpStart**: model và giải pháp dựng sẵn để bắt đầu nhanh.

## Amazon Bedrock

- Fully managed, **serverless**: truy cập FM của nhiều nhà cung cấp (Anthropic, Meta, Mistral, Amazon Nova...) qua một API, không quản lý hạ tầng.
- **Knowledge Bases**: RAG, trả lời dựa trên tài liệu của công ty (ví dụ trong S3).
- **Agents**: FM gọi API/Lambda để thực hiện tác vụ nhiều bước.
- **Guardrails**: lọc nội dung có hại, chặn chủ đề, ẩn PII.
- Hỗ trợ **fine-tuning** với dữ liệu riêng. Dữ liệu của khách hàng không được dùng để huấn luyện model gốc.

## Dịch vụ AI chuyên biệt

### Thị giác và tài liệu

- **Rekognition**: phân tích **ảnh và video**: nhận diện vật thể, cảnh, **khuôn mặt** (so khớp, tìm trong collection), người nổi tiếng, **content moderation** (nội dung không phù hợp), phát hiện PPE, text trong ảnh (biển hiệu, biển số). **Custom Labels** cho nhãn riêng.
- **Textract**: trích xuất **text, form (key-value), table** từ tài liệu scan, PDF. Có API chuyên cho hóa đơn/biên lai (AnalyzeExpense) và giấy tờ tùy thân (AnalyzeID). Khác OCR thuần ở chỗ hiểu **cấu trúc** tài liệu.

### Ngôn ngữ và giọng nói

- **Comprehend**: NLP trên text: **sentiment**, entity, key phrase, phát hiện ngôn ngữ, **phát hiện và ẩn PII**, custom classification. **Comprehend Medical**: trích xuất thông tin y khoa và PHI từ ghi chú lâm sàng.
- **Transcribe**: **giọng nói sang text**; custom vocabulary, phân biệt người nói, ẩn PII; Call Analytics cho cuộc gọi tổng đài; Transcribe Medical.
- **Translate**: dịch máy giữa các ngôn ngữ, real-time hoặc batch; custom terminology.
- **Polly**: **text sang giọng nói**; giọng neural, SSML, lexicon.
- **Lex**: xây **chatbot** giọng nói/text (ASR + NLU, cùng công nghệ Alexa); intent, slot, gọi Lambda.

### Tìm kiếm, gợi ý, trợ lý

- **Kendra**: **intelligent enterprise search**: người dùng hỏi bằng ngôn ngữ tự nhiên, tìm câu trả lời trong tài liệu nội bộ; connector tới S3, SharePoint, database...
- **Personalize**: **recommendation** real-time (gợi ý sản phẩm, xếp hạng cá nhân hóa) không cần kinh nghiệm ML.
- **Amazon Q**: trợ lý generative AI. **Q Business** trả lời câu hỏi dựa trên dữ liệu doanh nghiệp, tôn trọng quyền truy cập; **Q Developer** hỗ trợ viết code, nâng cấp code, thao tác AWS.

## Bảng chọn nhanh

| Use case | Dịch vụ |
|---|---|
| Huấn luyện model riêng với dữ liệu riêng, notebook, endpoint | SageMaker AI |
| Generative AI (tóm tắt, chatbot hỏi đáp tài liệu) không quản lý hạ tầng | Bedrock |
| Phát hiện khuôn mặt, vật thể, nội dung không phù hợp trong ảnh/video | Rekognition |
| Trích xuất form, table từ tài liệu scan, hóa đơn | Textract |
| Phân tích sentiment review, tìm PII trong text | Comprehend |
| Trích xuất thuốc, chẩn đoán từ ghi chú bác sĩ | Comprehend Medical |
| Chuyển ghi âm cuộc gọi thành text | Transcribe |
| Dịch nội dung website | Translate |
| Đọc bài viết thành audio | Polly |
| Chatbot đặt lịch, hỏi trạng thái đơn hàng | Lex |
| Nhân viên hỏi bằng ngôn ngữ tự nhiên trên tài liệu nội bộ | Kendra (hoặc Q Business) |
| Gợi ý sản phẩm "có thể bạn thích" | Personalize |
| Trợ lý code trong IDE | Q Developer |

## Managed AI service hay SageMaker?

- Bài toán **phổ biến** (OCR form, sentiment, dịch, nhận diện khuôn mặt) và yêu cầu **ít vận hành, không có chuyên gia ML**: chọn AI service có sẵn.
- Cần **thuật toán riêng**, kiểm soát training, hoặc bài toán đặc thù không dịch vụ nào phủ: chọn **SageMaker AI**.
- Cần **generative AI** với FM có sẵn: chọn **Bedrock** trước, không tự host LLM trên EC2/SageMaker trừ khi đề yêu cầu.
- Pipeline điển hình: S3 event kích hoạt Lambda, Lambda gọi Textract/Rekognition/Comprehend, lưu kết quả vào DynamoDB hoặc S3.

## Các cặp dễ nhầm

| Cặp | Phân biệt |
|---|---|
| Textract vs Rekognition (text) | Textract: tài liệu, form, table. Rekognition: text ngắn trong ảnh tự nhiên (biển báo, biển số) |
| Comprehend vs Kendra | Comprehend phân tích text (sentiment, entity). Kendra tìm kiếm và trả lời câu hỏi trên kho tài liệu |
| Transcribe vs Polly | Transcribe: speech sang text. Polly: text sang speech |
| Lex vs Connect | Lex: engine chatbot. Amazon Connect: contact center trên cloud, có thể tích hợp Lex |
| Comprehend vs Translate | Comprehend phát hiện ngôn ngữ, không dịch; Translate dịch |

Lưu ý: Amazon Forecast và Amazon Fraud Detector đã ngừng nhận khách hàng mới; không chọn chúng làm đáp án cho thiết kế mới.
`,
    keywords: [
      { trigger: 'build, train, and deploy custom ML models, notebooks, endpoints', answer: 'Amazon SageMaker AI' },
      { trigger: 'generative AI with foundation models, no infrastructure to manage', answer: 'Amazon Bedrock' },
      { trigger: 'detect faces, objects, inappropriate content in images or videos', answer: 'Amazon Rekognition' },
      { trigger: 'extract text, forms, and tables from scanned documents', answer: 'Amazon Textract' },
      { trigger: 'sentiment analysis, entities, detect PII in text', answer: 'Amazon Comprehend' },
      { trigger: 'convert speech or call recordings to text', answer: 'Amazon Transcribe' },
      { trigger: 'convert text to lifelike speech', answer: 'Amazon Polly' },
      { trigger: 'conversational chatbot with voice and text', answer: 'Amazon Lex' },
      { trigger: 'natural language search across internal documents', answer: 'Amazon Kendra' },
      { trigger: 'real-time personalized product recommendations', answer: 'Amazon Personalize' },
    ],
    traps: [
      'Rekognition phát hiện được text trong ảnh nhưng không trích xuất form/table; tài liệu thì chọn Textract.',
      'Transcribe và Polly ngược chiều nhau: Transcribe nghe, Polly nói.',
      'Comprehend phân tích text, không phải công cụ tìm kiếm tài liệu; hỏi đáp trên kho tài liệu là Kendra hoặc Q Business.',
      'Không chọn SageMaker khi có AI service sẵn đáp ứng và đề yêu cầu ít vận hành.',
      'Lex chỉ là chatbot; contact center hoàn chỉnh là Amazon Connect.',
      'Forecast và Fraud Detector đã đóng với khách hàng mới; không chọn cho thiết kế mới.',
    ],
  },
];
