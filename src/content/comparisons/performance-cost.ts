import type { Comparison } from '@/content/types';

export const performanceCostComparisons: Comparison[] = [
  {
    id: 'block-file-object',
    domain: 'performance',
    title: 'Block vs file vs object storage',
    summary:
      'Cả năm đều "lưu dữ liệu cho EC2", nhưng khác nhau về giao thức truy cập, số instance dùng chung được, và dữ liệu có còn sau khi stop hay không.',
    services: ['EBS', 'Instance store', 'EFS', 'FSx', 'S3'],
    rows: [
      { aspect: 'Loại storage', values: ['Block', 'Block (tạm thời)', 'File (NFS)', 'File (SMB, NFS, Lustre, iSCSI)', 'Object (HTTPS API)'] },
      { aspect: 'Độ bền dữ liệu', values: ['Bền vững, độc lập với instance', 'Mất khi stop, terminate hoặc hỏng host', 'Bền vững', 'Bền vững', 'Bền vững'] },
      { aspect: 'Phạm vi', values: ['Một AZ', 'Host vật lý của instance', 'Regional (Multi-AZ) hoặc One Zone', 'Single-AZ hoặc Multi-AZ (tùy loại)', 'Regional, ít nhất 3 AZ (trừ One Zone-IA)'] },
      { aspect: 'Dùng chung', values: ['Một instance (Multi-Attach io1/io2, cùng AZ)', 'Chỉ instance trên host đó', 'Hàng nghìn client Linux cùng lúc', 'Nhiều client qua SMB/NFS', 'Không giới hạn client qua API'] },
      { aspect: 'OS / giao thức', values: ['Mọi OS, gắn như ổ đĩa', 'Mọi OS, ổ đĩa local', 'Linux, NFS, POSIX', 'Windows, Linux, macOS tùy loại', 'Mọi client qua HTTP(S)'] },
      { aspect: 'Hiệu năng', values: ['Tùy volume type (gp3, io2...)', 'IOPS cao nhất, latency thấp nhất', 'Throughput co giãn, scale theo client', 'Rất cao (Lustre cho HPC)', 'Throughput song song cực lớn, scale theo prefix'] },
      { aspect: 'Dung lượng', values: ['Provision theo volume', 'Cố định theo instance type', 'Co giãn, dùng bao nhiêu trả bấy nhiêu', 'Provision (đa số)', 'Không giới hạn'] },
    ],
    pick: [
      'EBS: boot volume và database trên một EC2 cần block storage bền vững.',
      'Instance store: dữ liệu tạm, cache, buffer hoặc dữ liệu đã được replicate, cần IOPS cao nhất.',
      'EFS: file system Linux dùng chung cho nhiều instance, nhiều AZ, tự tăng dung lượng.',
      'FSx: file share Windows SMB, HPC (Lustre), hoặc chuyển file server NetApp/ZFS lên AWS.',
      'S3: object, file tĩnh, backup, data lake, dung lượng không giới hạn truy cập qua API.',
    ],
    diagram: `~~~groups
# Ba kiểu truy cập storage
Block (gắn vào instance): *EBS (bền), Instance store (tạm)
File (nhiều client mount): *EFS (Linux NFS), FSx (SMB/Lustre/ONTAP/ZFS)
Object (qua HTTPS API): *S3 (không giới hạn)
~~~

~~~decide
# Đề nói gì thì chọn storage nào
Dữ liệu tạm, IOPS cao nhất, mất cũng được => Instance store
Database trên một EC2, cần bền => EBS
Nhiều instance Linux chia sẻ file qua nhiều AZ => EFS
Windows SMB hoặc HPC Lustre => FSx
Dung lượng không giới hạn, truy cập qua API => S3
~~~`,
    keywords: [
      { trigger: 'temporary data, highest IOPS, data loss acceptable', answer: 'Instance store' },
      { trigger: 'shared file system for Linux instances across AZs', answer: 'Amazon EFS' },
      { trigger: 'Windows file share, SMB, Active Directory', answer: 'FSx for Windows File Server' },
      { trigger: 'persistent block storage for a database on one EC2 instance', answer: 'Amazon EBS' },
      { trigger: 'unlimited storage, static content, data lake', answer: 'Amazon S3' },
    ],
    lessons: ['block-file-storage', 's3-performance'],
  },
  {
    id: 'fsx-family',
    domain: 'performance',
    title: 'Bốn loại FSx',
    summary:
      'Cả bốn đều là "FSx managed", nên câu hỏi phân biệt bằng giao thức, OS của client và hệ thống nguồn cần migrate.',
    services: ['FSx for Windows File Server', 'FSx for Lustre', 'FSx for NetApp ONTAP', 'FSx for OpenZFS'],
    rows: [
      { aspect: 'Giao thức', values: ['SMB', 'Lustre (POSIX client)', 'NFS, SMB, iSCSI (multi-protocol)', 'NFS'] },
      { aspect: 'Client chính', values: ['Windows (và SMB trên Linux)', 'Cụm compute Linux', 'Windows, Linux, macOS', 'Linux, macOS (NFS client)'] },
      { aspect: 'Điểm mạnh', values: ['Active Directory, NTFS ACL, DFS', 'Hàng trăm GB/s, latency dưới ms', 'Tính năng NetApp: SnapMirror, FlexClone, dedup', 'Snapshot và clone ZFS, latency thấp'] },
      { aspect: 'Tích hợp S3', values: ['Không (backup qua AWS Backup)', 'Liên kết S3 bucket, lazy load và export', 'Tự tiering sang capacity pool', 'Không trực tiếp'] },
      { aspect: 'Triển khai', values: ['Single-AZ hoặc Multi-AZ', 'Scratch (tạm thời) hoặc Persistent', 'Single-AZ hoặc Multi-AZ', 'Single-AZ hoặc Multi-AZ'] },
      { aspect: 'Nguồn migrate điển hình', values: ['Windows file server', 'File system HPC on-prem', 'NetApp ONTAP on-prem', 'ZFS hoặc Linux NFS server on-prem'] },
    ],
    pick: [
      'FSx for Windows File Server: ứng dụng Windows cần SMB, tích hợp AD và Windows ACL.',
      'FSx for Lustre: HPC, ML training, render video cần throughput cực cao, thường xử lý dữ liệu từ S3.',
      'FSx for NetApp ONTAP: cần truy cập multi-protocol hoặc chuyển workload NetApp mà không đổi công cụ.',
      'FSx for OpenZFS: chuyển file server ZFS hoặc Linux NFS, cần snapshot và clone.',
    ],
    diagram: `~~~decide
# Đề nhắc giao thức hay workload nào
Windows, SMB, Active Directory => FSx for Windows File Server
HPC, ML training, dữ liệu ở S3 => FSx for Lustre
NFS + SMB + iSCSI hoặc đang dùng NetApp => FSx for NetApp ONTAP
Chuyển ZFS hoặc Linux NFS, cần snapshot và clone => FSx for OpenZFS
~~~

~~~groups
# Kiểu triển khai và tích hợp
Windows File Server: Single-AZ, *Multi-AZ, backup qua AWS Backup
Lustre: Scratch, Persistent, *liên kết S3 bucket
NetApp ONTAP: Single-AZ, *Multi-AZ, tiering sang capacity pool
OpenZFS: Single-AZ, *Multi-AZ, snapshot và clone
~~~`,
    keywords: [
      { trigger: 'HPC, ML training, process data from S3 at high speed', answer: 'FSx for Lustre' },
      { trigger: 'SMB, Active Directory, Windows ACLs', answer: 'FSx for Windows File Server' },
      { trigger: 'NFS and SMB and iSCSI on the same data', answer: 'FSx for NetApp ONTAP' },
      { trigger: 'migrate on-premises ZFS file servers', answer: 'FSx for OpenZFS' },
      { trigger: 'temporary short-term processing, lowest cost Lustre', answer: 'FSx for Lustre Scratch deployment' },
    ],
    lessons: ['block-file-storage'],
  },
  {
    id: 'ebs-volume-types',
    domain: 'performance',
    title: 'Các loại EBS volume',
    summary:
      'Hai loại SSD và hai loại HDD: đề hỏi IOPS hay throughput, giới hạn boot volume và lựa chọn rẻ nhất phù hợp.',
    services: ['gp3', 'io2 Block Express', 'st1', 'sc1'],
    rows: [
      { aspect: 'Loại ổ', values: ['SSD', 'SSD', 'HDD', 'HDD'] },
      { aspect: 'Tối ưu cho', values: ['Cân bằng giá và hiệu năng', 'IOPS cao nhất, latency dưới ms', 'Throughput tuần tự', 'Giá mỗi GB thấp nhất'] },
      { aspect: 'Mô hình hiệu năng', values: ['Baseline 3,000 IOPS, 125 MiB/s; tăng độc lập với dung lượng', 'Provisioned IOPS, tới 256,000 IOPS', 'Theo throughput, burst theo dung lượng', 'Throughput thấp hơn st1'] },
      { aspect: 'Làm boot volume', values: ['Có', 'Có', 'Không', 'Không'] },
      { aspect: 'Multi-Attach', values: ['Không', 'Có (cùng AZ)', 'Không', 'Không'] },
      { aspect: 'Durability', values: ['99.8-99.9%', '99.999%', '99.8-99.9%', '99.8-99.9%'] },
      { aspect: 'Workload', values: ['Boot, dev/test, đa số app và DB', 'OLTP quan trọng (Oracle, SQL Server)', 'Big data, log, data warehouse, Kafka', 'Dữ liệu lạnh, đọc tuần tự ít'] },
    ],
    pick: [
      'gp3: mặc định cho hầu hết trường hợp; tăng IOPS mà không cần tăng dung lượng.',
      'io2 Block Express: database tối quan trọng cần IOPS rất cao ổn định hoặc Multi-Attach.',
      'st1: đọc ghi tuần tự lớn như xử lý log hoặc big data.',
      'sc1: dữ liệu tuần tự hiếm khi truy cập, giá EBS thấp nhất.',
    ],
    diagram: `~~~ladder
# Từ nhanh nhất tới rẻ nhất
io2 Block Express | SSD provisioned IOPS, Multi-Attach | 256k IOPS
gp3 | SSD mặc định, IOPS chỉnh độc lập dung lượng | 3k IOPS base
st1 | HDD throughput tuần tự, không làm boot | 500 MiB/s
sc1 | HDD lạnh, giá mỗi GB thấp nhất | 250 MiB/s
~~~

~~~decide
# Đề nhắc gì thì chọn volume nào
Tăng IOPS mà không tăng dung lượng => gp3
IOPS rất cao ổn định cho OLTP quan trọng hoặc Multi-Attach => io2 Block Express
Log, big data đọc tuần tự, giá thấp => st1
Dữ liệu lạnh ít truy cập, rẻ nhất => sc1
Boot volume => SSD: gp3 hoặc io2 (không HDD)
~~~`,
    keywords: [
      { trigger: 'increase IOPS without increasing volume size', answer: 'gp3' },
      { trigger: 'more than 64,000 IOPS, sub-millisecond latency, critical database', answer: 'io2 Block Express' },
      { trigger: 'big data, log processing, high throughput, low cost', answer: 'st1' },
      { trigger: 'infrequently accessed data, lowest cost EBS', answer: 'sc1' },
      { trigger: 'HDD volume as boot volume', answer: 'Không được: boot cần SSD (gp2/gp3/io1/io2)' },
    ],
    lessons: ['block-file-storage', 'cost-database-storage-choices'],
  },
  {
    id: 'compute-options',
    domain: 'performance',
    title: 'Chạy code ở đâu',
    summary:
      'Đánh đổi giữa quyền kiểm soát và công vận hành: càng ít phải quản lý thì càng chịu nhiều giới hạn (thời gian chạy, quyền truy cập OS).',
    services: ['EC2', 'ECS on EC2', 'Fargate', 'Lambda', 'App Runner'],
    rows: [
      { aspect: 'Đơn vị', values: ['Máy ảo', 'Container trên EC2 của bạn', 'Container, không quản lý server', 'Function', 'Web service từ code hoặc image'] },
      { aspect: 'Bạn quản lý', values: ['OS, patch, scaling, capacity', 'Instance của cluster và capacity', 'Chỉ task definition', 'Chỉ code', 'Chỉ code hoặc image'] },
      { aspect: 'Thời gian chạy', values: ['Không giới hạn', 'Không giới hạn', 'Không giới hạn', 'Tối đa 15 phút', 'Service chạy liên tục'] },
      { aspect: 'Scaling', values: ['Auto Scaling group', 'Service auto scaling + capacity provider', 'Service auto scaling theo task', 'Tự động theo request', 'Tự động theo concurrency'] },
      { aspect: 'Tính tiền', values: ['Theo giây/giờ của instance', 'Theo EC2 bên dưới', 'vCPU và memory mỗi task', 'Số request và thời gian (GB-s)', 'vCPU và memory của instance đang chạy'] },
      { aspect: 'Phần cứng đặc biệt', values: ['GPU, mọi instance type', 'GPU, custom AMI', 'Không GPU', 'Không GPU, memory tới 10 GB', 'Không GPU'] },
    ],
    pick: [
      'EC2: cần toàn quyền OS, license, GPU, hoặc app legacy không container hóa được.',
      'ECS on EC2: container cần GPU, instance cụ thể, hoặc capacity ổn định rẻ hơn với RI/Spot.',
      'Fargate: chạy container mà không quản lý server hay cluster (dùng với ECS và EKS).',
      'Lambda: tác vụ ngắn, event-driven, traffic thất thường hoặc khó dự đoán.',
      'App Runner: cách đơn giản nhất để chạy web app hoặc API từ source code hoặc container image.',
    ],
    diagram: `~~~ladder
# Từ nhiều quyền kiểm soát tới ít vận hành nhất
EC2 | bạn quản lý OS, patch và scale | nhiều nhất
ECS on EC2 | bạn quản lý cluster EC2 bên dưới | nhiều
Fargate | chỉ khai báo vCPU và RAM cho task | ít
App Runner | từ source hoặc image ra URL HTTPS | rất ít
Lambda | chỉ viết function, tối đa 15 phút | ít nhất
~~~

~~~decide
# Giới hạn quyết định lựa chọn
Cần GPU hoặc toàn quyền OS => EC2 (hoặc ECS on EC2)
Container, không quản lý server => Fargate
Event-driven, mỗi lần chạy dưới 15 phút => Lambda
Job dài hơn 15 phút, serverless => Fargate
Web app từ source code, ít cấu hình nhất => App Runner
~~~`,
    keywords: [
      { trigger: 'serverless containers, no EC2 management', answer: 'AWS Fargate' },
      { trigger: 'event-driven, runs under 15 minutes, pay per request', answer: 'AWS Lambda' },
      { trigger: 'job runs longer than 15 minutes, serverless', answer: 'Fargate (không phải Lambda)' },
      { trigger: 'deploy web app from source code, no infrastructure knowledge', answer: 'AWS App Runner' },
      { trigger: 'needs GPU or full OS access', answer: 'Amazon EC2 (hoặc ECS on EC2)' },
    ],
    lessons: ['ec2-compute', 'containers-compute'],
  },
  {
    id: 'databases',
    domain: 'performance',
    title: 'Chọn database',
    summary:
      'Cả năm đều lưu dữ liệu nhưng nhắm tới access pattern khác nhau: OLTP quan hệ, key-value quy mô lớn, phân tích, hay cache in-memory.',
    services: ['RDS', 'Aurora', 'DynamoDB', 'Redshift', 'ElastiCache'],
    rows: [
      { aspect: 'Mô hình', values: ['Quan hệ (OLTP)', 'Quan hệ (OLTP), cloud-native', 'Key-value và document (NoSQL)', 'Data warehouse dạng cột (OLAP)', 'Key-value in-memory'] },
      { aspect: 'Engine', values: ['MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2', 'Tương thích MySQL và PostgreSQL', 'Riêng của AWS, NoSQL API', 'SQL nền PostgreSQL', 'Valkey, Redis OSS, Memcached'] },
      { aspect: 'Latency', values: ['Mili giây', 'Mili giây', 'Vài ms (micro giây với DAX)', 'Vài giây cho query phức tạp', 'Dưới mili giây'] },
      { aspect: 'Scale đọc', values: ['Read replica', 'Tới 15 replica, dùng chung storage', 'Tự động, gần như không giới hạn', 'Thêm node hoặc Serverless, concurrency scaling', 'Replica và shard'] },
      { aspect: 'HA / đa Region', values: ['Multi-AZ; cross-Region read replica', '6 bản sao trên 3 AZ; Global Database', 'Multi-AZ sẵn; Global Tables', 'Tùy chọn Multi-AZ (RA3); snapshot', 'Multi-AZ với replica (Valkey/Redis)'] },
      { aspect: 'Serverless', values: ['Không', 'Aurora Serverless v2', 'Có, chế độ on-demand', 'Redshift Serverless', 'ElastiCache Serverless'] },
      { aspect: 'Dùng điển hình', values: ['Lift-and-shift app quan hệ', 'Quan hệ hiệu năng cao, app toàn cầu', 'Quy mô cực lớn, truy cập theo key', 'BI, báo cáo trên dữ liệu lớn', 'Cache, session, leaderboard'] },
    ],
    pick: [
      'RDS: engine quan hệ chuẩn (kể cả Oracle/SQL Server) với backup và Multi-AZ được quản lý.',
      'Aurora: app MySQL/PostgreSQL cần hiệu năng cao hơn, failover nhanh hoặc replicate toàn cầu.',
      'DynamoDB: truy cập key-value ở mọi quy mô, latency thấp ổn định, không quản lý server.',
      'Redshift: SQL phân tích và dashboard BI trên hàng TB tới PB dữ liệu.',
      'ElastiCache: giảm tải đọc lặp lại hoặc lưu session với latency dưới mili giây.',
    ],
    diagram: `~~~decide
# Chọn database theo kiểu truy cập
Quan hệ chuẩn, cần Oracle hoặc SQL Server => RDS
MySQL/PostgreSQL cần nhanh hơn, failover nhanh => Aurora
Key-value ở mọi quy mô, latency ổn định => DynamoDB
SQL phân tích trên TB tới PB => Redshift
Đọc lặp lại hoặc session dưới mili giây => ElastiCache
~~~

~~~ladder
# Latency điển hình, nhanh nhất trước
DynamoDB + DAX | đọc qua cache in-memory | micro giây
ElastiCache | key-value in-memory | dưới ms
DynamoDB | key-value ở mọi quy mô | vài ms
RDS / Aurora | OLTP quan hệ | ms
Redshift | query phân tích phức tạp | giây
~~~`,
    keywords: [
      { trigger: 'complex joins, transactions, existing MySQL app', answer: 'Amazon RDS hoặc Aurora' },
      { trigger: 'global relational database, Region failover under a minute', answer: 'Aurora Global Database' },
      { trigger: 'millions of requests per second, key-value, serverless', answer: 'Amazon DynamoDB' },
      { trigger: 'data warehouse, OLAP, BI reporting', answer: 'Amazon Redshift' },
      { trigger: 'sub-millisecond latency, session store', answer: 'Amazon ElastiCache' },
    ],
    lessons: ['relational-databases', 'nosql-caching'],
  },
  {
    id: 'caching',
    domain: 'performance',
    title: 'Các lựa chọn caching',
    summary:
      'Mỗi loại cache nằm ở một lớp khác nhau: trước mọi database, chỉ trước DynamoDB, hay ở edge gần người dùng.',
    services: ['ElastiCache Redis/Valkey', 'ElastiCache Memcached', 'DAX', 'CloudFront'],
    rows: [
      { aspect: 'Cache gì', values: ['Mọi dữ liệu app đưa vào', 'Mọi dữ liệu app đưa vào', 'Chỉ lượt đọc DynamoDB', 'Nội dung HTTP(S) tại edge location'] },
      { aspect: 'Sửa app', values: ['Có, logic cache trong code', 'Có, logic cache trong code', 'Rất ít, API tương thích DynamoDB', 'Không, đặt trước origin'] },
      { aspect: 'Replication / HA', values: ['Replica, Multi-AZ tự failover', 'Không replication', 'Cluster nhiều node trên nhiều AZ', 'Mạng edge toàn cầu'] },
      { aspect: 'Persistence', values: ['Snapshot và backup', 'Không', 'Không (chỉ cache)', 'Không (cache theo TTL)'] },
      { aspect: 'Cấu trúc dữ liệu', values: ['Phong phú: sorted set, list, pub/sub', 'Key-value string đơn giản', 'Item và query DynamoDB', 'File và response'] },
      { aspect: 'Latency', values: ['Dưới mili giây', 'Dưới mili giây', 'Micro giây', 'Thấp, gần người dùng'] },
    ],
    pick: [
      'ElastiCache Redis/Valkey: cache hoặc session cần HA, persistence, leaderboard hay pub/sub.',
      'ElastiCache Memcached: cache đơn giản, đa luồng, chấp nhận mất dữ liệu.',
      'DAX: bảng DynamoDB đọc nhiều cần đọc micro giây mà gần như không sửa code.',
      'CloudFront: cache nội dung web tĩnh và động gần người dùng toàn cầu.',
    ],
    diagram: `~~~flow
# Mỗi lớp cache đứng ở đâu
Users -> CloudFront (edge) -> ALB -> EC2 -> ElastiCache (Redis/Valkey hoặc Memcached)
EC2 -> DAX (micro giây) -> DynamoDB
~~~

~~~decide
# Chọn lớp cache
Bảng DynamoDB đọc nhiều, gần như không sửa code => DAX
Leaderboard hoặc session cần HA và persistence => ElastiCache Redis/Valkey
Cache key-value đơn giản, đa luồng => ElastiCache Memcached
Nội dung web gần người dùng toàn cầu => CloudFront
~~~`,
    keywords: [
      { trigger: 'DynamoDB microsecond read latency', answer: 'DynamoDB Accelerator (DAX)' },
      { trigger: 'leaderboard, sorted sets, pub/sub', answer: 'ElastiCache for Redis/Valkey' },
      { trigger: 'simple cache, multithreaded, no persistence needed', answer: 'ElastiCache for Memcached' },
      { trigger: 'reduce RDS read load for repeated queries', answer: 'ElastiCache (hoặc read replica)' },
      { trigger: 'cache static content for global users', answer: 'Amazon CloudFront' },
    ],
    lessons: ['nosql-caching', 'edge-networking'],
  },
  {
    id: 'cloudfront-vs-ga',
    domain: 'performance',
    title: 'CloudFront vs Global Accelerator vs S3 Transfer Acceleration',
    summary:
      'Cả ba dùng mạng edge của AWS để tăng tốc traffic toàn cầu, nhưng chỉ CloudFront cache, và chỉ Global Accelerator xử lý traffic không phải HTTP với IP tĩnh.',
    services: ['CloudFront', 'Global Accelerator', 'S3 Transfer Acceleration'],
    rows: [
      { aspect: 'Mục đích', values: ['CDN: cache và phân phối nội dung', 'Định tuyến traffic qua backbone AWS', 'Upload đường xa vào S3 nhanh hơn'] },
      { aspect: 'Giao thức', values: ['HTTP, HTTPS, WebSocket', 'TCP và UDP', 'HTTPS tới S3 bucket'] },
      { aspect: 'Caching', values: ['Có', 'Không', 'Không'] },
      { aspect: 'Điểm vào', values: ['DNS name (IP thay đổi)', 'Hai anycast IP tĩnh', 'Accelerate endpoint của bucket'] },
      { aspect: 'Failover', values: ['Origin failover qua origin group', 'Failover giữa Region nhanh nhờ health check', 'Không áp dụng'] },
      { aspect: 'Endpoint / origin', values: ['S3, ALB, EC2, mọi HTTP origin', 'ALB, NLB, EC2, Elastic IP', 'Chỉ S3 bucket'] },
      { aspect: 'Bảo mật đi kèm', values: ['AWS WAF, Shield, OAC, signed URL', 'Shield, giữ client IP', 'Bucket policy'] },
    ],
    pick: [
      'CloudFront: cache website, API, video và file tĩnh gần người dùng.',
      'Global Accelerator: game, IoT, VoIP hoặc app cần IP tĩnh và failover đa Region nhanh.',
      'S3 Transfer Acceleration: người dùng ở xa bucket upload file lớn vào S3.',
    ],
    diagram: `~~~flow
# Cùng vào edge gần nhất, khác ở việc làm gì sau đó
Users -[HTTP/HTTPS]-> CloudFront (cache tại edge) -> ALB
Users -[TCP/UDP]-> Global Accelerator (2 static IP, không cache) -> NLB
Users -[upload]-> Edge location (Transfer Acceleration) -[backbone AWS]-> S3
~~~

~~~decide
# Từ khóa trong đề
Cache nội dung tĩnh, giảm tải origin => CloudFront
UDP, game, IoT, VoIP => Global Accelerator
Cần 2 IP tĩnh để whitelist => Global Accelerator
Người dùng ở xa upload file lớn vào S3 => S3 Transfer Acceleration
~~~`,
    keywords: [
      { trigger: 'static IP addresses, allowlist, TCP/UDP', answer: 'AWS Global Accelerator' },
      { trigger: 'non-HTTP traffic, gaming, VoIP, global users', answer: 'AWS Global Accelerator' },
      { trigger: 'cache content at edge, reduce origin load', answer: 'Amazon CloudFront' },
      { trigger: 'global users upload large files to one S3 bucket', answer: 'S3 Transfer Acceleration' },
      { trigger: 'restrict S3 access to CloudFront only', answer: 'Origin Access Control (OAC)' },
    ],
    lessons: ['edge-networking', 's3-performance'],
  },
  {
    id: 'streaming',
    domain: 'performance',
    title: 'Các dịch vụ streaming',
    summary:
      'Đều nhận dữ liệu stream, nhưng khác ở chỗ có phải tự viết consumer không, dữ liệu có được lưu và replay không, và có cần Kafka không.',
    services: ['Kinesis Data Streams', 'Amazon Data Firehose', 'Managed Service for Apache Flink', 'MSK'],
    rows: [
      { aspect: 'Vai trò', values: ['Nhận và lưu stream', 'Đổ stream vào đích', 'Xử lý và phân tích stream', 'Apache Kafka managed'] },
      { aspect: 'Latency', values: ['Real-time (mili giây)', 'Near real-time (có buffer)', 'Real-time', 'Real-time'] },
      { aspect: 'Lưu trữ / replay', values: ['Mặc định 24 giờ, tới 365 ngày; replay được', 'Không lưu, không replay', 'Đọc từ stream nguồn', 'Retention tùy chỉnh; replay được'] },
      { aspect: 'Consumer', values: ['Code của bạn: Lambda, KCL app, Flink', 'Không cần viết: S3, Redshift, OpenSearch, Splunk, HTTP', 'Flink app (SQL, Java, Python)', 'Kafka client và connector'] },
      { aspect: 'Scaling', values: ['Shard (provisioned) hoặc on-demand', 'Hoàn toàn tự động', 'Tự động (KPU)', 'Broker, hoặc MSK Serverless'] },
      { aspect: 'Biến đổi dữ liệu', values: ['Trong consumer', 'Lambda transform, đổi format', 'Windowing, aggregation, join', 'Trong consumer hoặc Kafka Streams'] },
    ],
    pick: [
      'Kinesis Data Streams: nhận dữ liệu real-time với consumer tự viết, cần thứ tự và replay.',
      'Amazon Data Firehose: đổ dữ liệu stream vào S3, Redshift, OpenSearch... không cần code.',
      'Managed Service for Apache Flink: phân tích và tổng hợp real-time trên stream.',
      'MSK: ứng dụng Kafka sẵn có hoặc cần tính năng riêng của Kafka mà không quản lý broker.',
    ],
    diagram: `~~~flow
# Vị trí của từng dịch vụ trong pipeline
Producers -> Kinesis Data Streams (real-time, replay) -> Managed Service for Apache Flink (phân tích)
Kinesis Data Streams -> Data Firehose (near real-time, buffer) -> S3 / Redshift / OpenSearch
Kafka clients -> MSK (Kafka API) -> Consumers
~~~

~~~groups
# Có lưu và replay được không
Lưu và replay: *Kinesis Data Streams (24 giờ tới 365 ngày), *MSK (retention tùy chỉnh)
Không lưu: Data Firehose (buffer rồi ghi), Managed Service for Apache Flink (đọc từ stream nguồn)
~~~`,
    keywords: [
      { trigger: 'real-time, multiple consumers, replay data', answer: 'Kinesis Data Streams' },
      { trigger: 'load streaming data into S3/Redshift, least operational overhead', answer: 'Amazon Data Firehose' },
      { trigger: 'real-time analytics with SQL on a stream', answer: 'Managed Service for Apache Flink' },
      { trigger: 'migrate existing Apache Kafka', answer: 'Amazon MSK' },
      { trigger: 'near real-time is acceptable, no custom code', answer: 'Amazon Data Firehose' },
    ],
    lessons: ['data-analytics'],
  },
  {
    id: 'analytics',
    domain: 'performance',
    title: 'Các dịch vụ analytics',
    summary:
      'Đều "phân tích dữ liệu", nhưng khác ở serverless hay cluster, ad hoc hay warehouse, và SQL hay search hay ETL.',
    services: ['Athena', 'Redshift (+Spectrum)', 'EMR', 'Glue', 'OpenSearch Service'],
    rows: [
      { aspect: 'Mục đích', values: ['SQL ad hoc trên S3', 'Data warehouse; Spectrum query S3', 'Framework big data (Spark, Hadoop)', 'ETL serverless và Data Catalog', 'Search và phân tích log'] },
      { aspect: 'Hạ tầng', values: ['Serverless', 'Cluster provisioned hoặc Serverless', 'Cluster (có EMR Serverless)', 'Serverless', 'Cluster managed hoặc Serverless'] },
      { aspect: 'Tính tiền', values: ['Theo dữ liệu được scan', 'Theo node hoặc RPU-giờ', 'EC2 instance cộng phí EMR', 'DPU-giờ', 'Instance và storage'] },
      { aspect: 'Vị trí dữ liệu', values: ['Nằm nguyên trong S3', 'Load vào Redshift (hoặc S3 qua Spectrum)', 'S3 (EMRFS) hoặc HDFS', 'Đọc ghi nhiều nguồn', 'Được index vào OpenSearch'] },
      { aspect: 'Điểm mạnh', values: ['Không setup, trả theo query', 'Join phức tạp nhanh, BI quy mô lớn', 'Toàn quyền với framework', 'Crawler, tự nhận schema, job', 'Full-text search, dashboard'] },
      { aspect: 'Mẹo tiết kiệm', values: ['Parquet/ORC, partition, nén', 'RA3, reserved node, Serverless', 'Spot cho task node', 'Chọn đúng số DPU, job bookmark', 'UltraWarm/cold storage cho log cũ'] },
    ],
    pick: [
      'Athena: SQL thỉnh thoảng hoặc ad hoc trên dữ liệu đã có trong S3, không hạ tầng.',
      'Redshift (+Spectrum): query BI phức tạp thường xuyên; Spectrum join dữ liệu warehouse với S3.',
      'EMR: job Spark/Hadoop/Hive lớn hoặc migrate cụm Hadoop on-prem.',
      'Glue: ETL serverless và Data Catalog trung tâm cho data lake.',
      'OpenSearch Service: full-text search, phân tích log và dashboard gần real-time.',
    ],
    diagram: `~~~flow
# Data lake trên S3 và các engine truy vấn
S3 (data lake) -> Glue (crawler, ETL) -> Glue Data Catalog -> Athena (SQL ad hoc)
Glue Data Catalog -> Redshift Spectrum (join với warehouse)
S3 (data lake) -> EMR (Spark, Hadoop)
Logs -> OpenSearch Service (search, dashboard)
~~~

~~~decide
# Từ khóa trong đề
SQL ad hoc trên S3, không hạ tầng => Athena
Dashboard BI phức tạp, nhiều join => Redshift
Join warehouse với dữ liệu trên S3 => Redshift Spectrum
Job Spark hoặc Hadoop lớn => EMR
ETL serverless, tự nhận schema => Glue
Full-text search, phân tích log => OpenSearch Service
~~~`,
    keywords: [
      { trigger: 'query data in S3 with SQL, serverless, ad hoc', answer: 'Amazon Athena' },
      { trigger: 'query S3 data from the data warehouse without loading', answer: 'Redshift Spectrum' },
      { trigger: 'migrate on-premises Hadoop/Spark cluster', answer: 'Amazon EMR' },
      { trigger: 'serverless ETL, discover schema, data catalog', answer: 'AWS Glue' },
      { trigger: 'full-text search, log analytics', answer: 'Amazon OpenSearch Service' },
    ],
    lessons: ['data-analytics'],
  },
  {
    id: 'migration-transfer',
    domain: 'performance',
    title: 'Các dịch vụ migration và transfer',
    summary:
      'Đều đưa dữ liệu vào AWS, nhưng khác ở một lần hay hybrid lâu dài, online hay offline, file hay database, và giao thức đối tác đang dùng.',
    services: ['DataSync', 'Storage Gateway', 'Transfer Family', 'Snowball Edge', 'DMS'],
    rows: [
      { aspect: 'Mô hình', values: ['Copy hoặc sync online (một lần hoặc theo lịch)', 'Truy cập hybrid lâu dài từ on-prem', 'Endpoint SFTP/FTPS/FTP/AS2 managed', 'Thiết bị vật lý offline', 'Migrate và replicate database'] },
      { aspect: 'Nguồn', values: ['NFS, SMB, HDFS, object storage, storage AWS', 'App on-prem qua NFS, SMB, iSCSI, tape', 'Đối tác và client bên ngoài', 'Dữ liệu local chép vào thiết bị', 'DB quan hệ, NoSQL, warehouse'] },
      { aspect: 'Đích', values: ['S3, EFS, FSx', 'S3, EBS snapshot, Glacier (tape)', 'S3 hoặc EFS', 'S3 (sau khi gửi trả thiết bị)', 'RDS, Aurora, DynamoDB, Redshift, S3...'] },
      { aspect: 'Cần mạng?', values: ['Có (agent cho on-prem)', 'Có, cache local on-prem', 'Có (internet)', 'Không: gửi thiết bị', 'Có'] },
      { aspect: 'Tính năng chính', values: ['Kiểm tra toàn vẹn, giới hạn băng thông, lịch', 'Cache local cho truy cập latency thấp', 'Giữ nguyên quy trình truyền file cũ', 'Edge compute; dữ liệu lớn, mạng chậm', 'CDC để downtime tối thiểu'] },
      { aspect: 'Lưu ý', values: ['Truyền online số lượng lớn nhanh nhất', 'FSx File Gateway đã ngừng nhận khách mới', 'Hỗ trợ custom identity provider', 'Không còn mở cho khách hàng mới', 'Dùng Schema Conversion khi khác engine'] },
    ],
    pick: [
      'DataSync: chuyển hoặc đồng bộ tập file lớn sang S3/EFS/FSx qua mạng.',
      'Storage Gateway: app on-prem vẫn dùng giao thức local trong khi dữ liệu nằm trên AWS.',
      'Transfer Family: đối tác buộc phải tiếp tục dùng SFTP/FTPS/FTP/AS2 vào S3 hoặc EFS.',
      'Snowball Edge: dữ liệu rất lớn, băng thông thấp, nếu tài khoản vẫn còn được dùng dịch vụ.',
      'DMS: migrate database với replicate liên tục (CDC) và downtime tối thiểu.',
    ],
    diagram: `~~~decide
# Chọn theo việc cần làm
Chuyển hoặc đồng bộ file qua mạng => DataSync
App on-prem vẫn dùng NFS, SMB hoặc iSCSI, dữ liệu ở AWS => Storage Gateway
Đối tác gửi file qua SFTP => Transfer Family
Hàng trăm TB, băng thông thấp, deadline gấp => Snowball Edge
Migrate database ít downtime => DMS
~~~

~~~groups
# Online, hybrid hay offline
Online một lần hoặc theo lịch: *DataSync (file), *DMS (database)
Hybrid lâu dài: *Storage Gateway, Transfer Family (đối tác SFTP)
Offline: *Snowball Edge (gửi thiết bị)
~~~`,
    keywords: [
      { trigger: 'migrate NFS/SMB data to EFS/S3 online, automate and verify', answer: 'AWS DataSync' },
      { trigger: 'on-prem apps keep accessing files, backed by S3', answer: 'S3 File Gateway (Storage Gateway)' },
      { trigger: 'replace tape backup infrastructure', answer: 'Tape Gateway (Storage Gateway)' },
      { trigger: 'partners upload via SFTP', answer: 'AWS Transfer Family' },
      { trigger: 'migrate database with minimal downtime', answer: 'AWS DMS với CDC' },
      { trigger: 'hundreds of TB, limited bandwidth, one-time', answer: 'Thiết bị offline (Snowball Edge, khách hàng hiện hữu)' },
    ],
    lessons: ['data-migration'],
  },
  {
    id: 'placement-groups',
    domain: 'performance',
    title: 'EC2 placement group',
    summary:
      'Cả ba đều quyết định instance nằm ở đâu trên phần cứng; đánh đổi giữa hiệu năng mạng và cô lập lỗi.',
    services: ['Cluster', 'Spread', 'Partition'],
    rows: [
      { aspect: 'Cách đặt', values: ['Gom sát nhau trong một AZ', 'Mỗi instance trên phần cứng riêng', 'Nhóm instance trên các rack tách biệt'] },
      { aspect: 'Phạm vi AZ', values: ['Một AZ', 'Có thể trải nhiều AZ', 'Có thể trải nhiều AZ'] },
      { aspect: 'Mạng', values: ['Latency thấp nhất, throughput cao nhất', 'Bình thường', 'Bình thường'] },
      { aspect: 'Rủi ro lỗi', values: ['Cao: hỏng rack ảnh hưởng tất cả', 'Thấp nhất: một lỗi chỉ ảnh hưởng một instance', 'Hỏng rack chỉ ảnh hưởng một partition'] },
      { aspect: 'Giới hạn', values: ['Theo capacity của AZ', '7 instance đang chạy mỗi AZ mỗi group', 'Tối đa 7 partition mỗi AZ, nhiều instance'] },
      { aspect: 'Workload', values: ['HPC, job liên kết chặt', 'Ít instance quan trọng', 'HDFS, HBase, Cassandra, Kafka'] },
    ],
    pick: [
      'Cluster: HPC hoặc workload liên kết chặt cần latency thấp giữa các node.',
      'Spread: vài instance quan trọng không được dùng chung phần cứng.',
      'Partition: hệ phân tán lớn có replicate và nhận biết rack.',
    ],
    diagram: `~~~groups
# Cách bố trí instance trên phần cứng
Cluster: *gom sát nhau trong 1 AZ, latency thấp nhất
Spread: *mỗi instance một rack, tối đa 7 mỗi AZ
Partition: *mỗi partition một nhóm rack, tối đa 7 partition mỗi AZ
~~~

~~~decide
# Từ khóa trong đề
Latency thấp nhất giữa các node, HPC => Cluster
Vài instance quan trọng không dùng chung phần cứng => Spread
HDFS, Cassandra, Kafka nhận biết rack => Partition
Cần chịu lỗi qua nhiều AZ => Spread hoặc Partition (không Cluster)
~~~`,
    keywords: [
      { trigger: 'low latency, high network throughput between nodes, HPC', answer: 'Cluster placement group' },
      { trigger: 'critical instances, avoid simultaneous failure, small number', answer: 'Spread placement group' },
      { trigger: 'HDFS, Cassandra, Kafka, rack awareness', answer: 'Partition placement group' },
      { trigger: 'more than 7 instances per AZ isolated', answer: 'Partition (Spread giới hạn 7)' },
    ],
    lessons: ['ec2-compute'],
  },
  {
    id: 'ec2-purchase',
    domain: 'cost',
    title: 'Các lựa chọn mua EC2',
    summary:
      'Tất cả chạy cùng loại instance; đề kiểm tra mức cam kết, độ linh hoạt, khả năng chịu gián đoạn và license.',
    services: ['On-Demand', 'Reserved Instances', 'Savings Plans', 'Spot', 'Dedicated Hosts'],
    rows: [
      { aspect: 'Cam kết', values: ['Không', '1 hoặc 3 năm, thuộc tính instance cụ thể', '1 hoặc 3 năm, mức chi theo giờ', 'Không', 'On-Demand hoặc reserved (1/3 năm)'] },
      { aspect: 'Giảm so với On-Demand', values: ['Không', 'Tới khoảng 72%', 'Tới khoảng 72% (EC2 Instance SP)', 'Tới khoảng 90%', 'Tùy; đắt hơn hạ tầng dùng chung'] },
      { aspect: 'Linh hoạt', values: ['Hoàn toàn', 'Standard: thấp; Convertible: đổi family/OS', 'Compute SP: mọi family, Region, Fargate, Lambda', 'Hoàn toàn, nhưng không đảm bảo capacity', 'Gắn với một server vật lý'] },
      { aspect: 'Bị gián đoạn', values: ['Không', 'Không', 'Không', 'Có, báo trước 2 phút', 'Không'] },
      { aspect: 'Giữ capacity', values: ['Không (dùng On-Demand Capacity Reservations)', 'Chỉ Zonal RI', 'Không', 'Không', 'Có, cả host'] },
      { aspect: 'Dùng điển hình', values: ['Ngắn hạn, khó dự đoán, thử nghiệm', 'Ổn định, biết rõ instance type', 'Chi tiêu ổn định, instance thay đổi', 'Batch, CI, stateless, chịu lỗi', 'BYOL theo socket/core, compliance'] },
    ],
    pick: [
      'On-Demand: workload ngắn hạn hoặc khó dự đoán, không được gián đoạn.',
      'Reserved Instances: workload ổn định trên instance type đã biết; cũng có cho RDS và dịch vụ khác.',
      'Savings Plans: chi tiêu ổn định nhưng cần linh hoạt giữa family, Region, Fargate và Lambda.',
      'Spot: job chịu lỗi, linh hoạt, chấp nhận bị gián đoạn.',
      'Dedicated Hosts: license theo socket/core hoặc compliance cần server riêng.',
    ],
    diagram: `~~~ladder
# Giảm giá tối đa so với On-Demand
Spot | có thể bị thu hồi, báo trước 2 phút | tới 90%
Reserved Instances | cam kết 1 hoặc 3 năm, instance cụ thể | tới 72%
Savings Plans | cam kết mức chi theo giờ 1 hoặc 3 năm | tới 72%
On-Demand | không cam kết, không gián đoạn | 0%
Dedicated Hosts | cả server vật lý cho BYOL | đắt hơn
~~~

~~~decide
# Từ khóa trong đề
Batch chịu gián đoạn, rẻ nhất => Spot
Ổn định 1-3 năm, instance type cố định => Reserved Instances
Cam kết mức chi, đổi family hoặc dùng Fargate và Lambda => Compute Savings Plans
Ngắn hạn, không được gián đoạn => On-Demand
License theo socket hoặc core => Dedicated Hosts
Giữ capacity trong 1 AZ mà không cam kết dài hạn => On-Demand Capacity Reservations
~~~`,
    keywords: [
      { trigger: 'steady 24/7 for 3 years, lowest cost', answer: 'Reserved Instances hoặc Savings Plans (3 năm)' },
      { trigger: 'flexibility across instance families, Regions, Fargate, Lambda', answer: 'Compute Savings Plans' },
      { trigger: 'can be interrupted, batch, lowest cost', answer: 'Spot Instances' },
      { trigger: 'BYOL per-socket or per-core licensing', answer: 'Dedicated Hosts' },
      { trigger: 'guarantee capacity in an AZ without long-term commitment', answer: 'On-Demand Capacity Reservations' },
    ],
    lessons: ['ec2-pricing-models'],
  },
  {
    id: 's3-classes',
    domain: 'cost',
    title: 'Các S3 storage class',
    summary:
      'Bảy class đánh đổi giá lưu trữ với tốc độ truy cập, phí retrieval, thời gian lưu tối thiểu và mức chịu lỗi.',
    services: ['Standard', 'Intelligent-Tiering', 'Standard-IA', 'One Zone-IA', 'Glacier Instant Retrieval', 'Glacier Flexible Retrieval', 'Glacier Deep Archive'],
    rows: [
      { aspect: 'Kiểu truy cập', values: ['Thường xuyên', 'Không rõ hoặc thay đổi', 'Ít, nhưng cần nhanh', 'Ít, dữ liệu tạo lại được', 'Khoảng một lần mỗi quý', 'Một hai lần mỗi năm', 'Hiếm, lưu dài hạn'] },
      { aspect: 'Latency byte đầu', values: ['Mili giây', 'Mili giây (tier archive tùy chọn)', 'Mili giây', 'Mili giây', 'Mili giây', 'Vài phút tới vài giờ', 'Trong 12 giờ (bulk tới 48 giờ)'] },
      { aspect: 'Số AZ', values: ['Từ 3 trở lên', 'Từ 3 trở lên', 'Từ 3 trở lên', '1', 'Từ 3 trở lên', 'Từ 3 trở lên', 'Từ 3 trở lên'] },
      { aspect: 'Thời gian lưu tối thiểu', values: ['Không', 'Không', '30 ngày', '30 ngày', '90 ngày', '90 ngày', '180 ngày'] },
      { aspect: 'Phí retrieval', values: ['Không', 'Không (phí monitoring nhỏ mỗi object)', 'Có, theo GB', 'Có, theo GB', 'Có, theo GB', 'Có, theo tốc độ', 'Có, theo tốc độ'] },
      { aspect: 'Kích thước tính phí tối thiểu', values: ['Không', 'Object dưới 128 KB không tự chuyển tier', '128 KB', '128 KB', '128 KB', 'Không (cộng overhead mỗi object)', 'Không (cộng overhead mỗi object)'] },
      { aspect: 'Dùng điển hình', values: ['Nội dung đang dùng, website', 'Data lake không rõ pattern', 'Backup, bản DR', 'Bản sao phụ, thumbnail', 'Ảnh y tế, kho tin tức', 'Archive, restore trong vài giờ', 'Archive compliance 7-10 năm'] },
    ],
    pick: [
      'Standard: dữ liệu truy cập thường xuyên, không phí retrieval.',
      'Intelligent-Tiering: pattern không rõ hoặc thay đổi, tự tiết kiệm mà không phí retrieval.',
      'Standard-IA: dữ liệu ít đọc nhưng cần có ngay và chịu được mất một AZ.',
      'One Zone-IA: dữ liệu ít truy cập, dễ tạo lại, chấp nhận chỉ nằm ở một AZ.',
      'Glacier Instant Retrieval: archive truy cập khoảng mỗi quý nhưng vẫn cần đọc mili giây.',
      'Glacier Flexible Retrieval: archive chấp nhận restore trong vài phút tới vài giờ.',
      'Glacier Deep Archive: lưu dài hạn rẻ nhất, restore trong 12-48 giờ.',
    ],
    diagram: `~~~ladder
# Từ nóng tới lạnh: giá lưu giảm, phí và thời gian lấy tăng
Standard | truy cập thường xuyên | ms
Intelligent-Tiering | tự chuyển tier theo pattern | ms
Standard-IA | ít đọc, lưu tối thiểu 30 ngày | ms
One Zone-IA | 1 AZ, tạo lại được, tối thiểu 30 ngày | ms
Glacier Instant Retrieval | khoảng mỗi quý, tối thiểu 90 ngày | ms
Glacier Flexible Retrieval | 1-2 lần mỗi năm, tối thiểu 90 ngày | phút tới giờ
Glacier Deep Archive | rẻ nhất, tối thiểu 180 ngày | 12-48 giờ
~~~

~~~decide
# Từ khóa trong đề
Pattern truy cập không rõ hoặc thay đổi => Intelligent-Tiering
Ít đọc nhưng cần ngay, chịu được mất 1 AZ => Standard-IA
Ít đọc, tạo lại được => One Zone-IA
Archive đọc khoảng mỗi quý, cần mili giây => Glacier Instant Retrieval
Archive chấp nhận restore vài phút tới vài giờ => Glacier Flexible Retrieval
Lưu compliance 7-10 năm, rẻ nhất => Glacier Deep Archive
~~~`,
    keywords: [
      { trigger: 'unknown or unpredictable access patterns', answer: 'S3 Intelligent-Tiering' },
      { trigger: 'infrequent access, data can be re-created, lowest cost', answer: 'S3 One Zone-IA' },
      { trigger: 'archive, accessed quarterly, millisecond retrieval', answer: 'S3 Glacier Instant Retrieval' },
      { trigger: 'retain 7-10 years for compliance, rarely accessed, cheapest', answer: 'S3 Glacier Deep Archive' },
      { trigger: 'archive, retrieval in minutes (expedited)', answer: 'S3 Glacier Flexible Retrieval' },
      { trigger: 'move objects to cheaper class after N days', answer: 'S3 Lifecycle rules' },
    ],
    lessons: ['s3-storage-classes'],
  },
  {
    id: 'cost-tools',
    domain: 'cost',
    title: 'Công cụ quản lý chi phí',
    summary:
      'Đều liên quan tới "chi phí", nhưng một cái để xem biểu đồ, một cái để cảnh báo, một cái xuất dữ liệu thô, và hai cái đưa khuyến nghị với phạm vi khác nhau.',
    services: ['Cost Explorer', 'AWS Budgets', 'Cost and Usage Report (Data Exports)', 'Trusted Advisor', 'Compute Optimizer'],
    rows: [
      { aspect: 'Việc chính', values: ['Trực quan hóa và phân tích chi tiêu', 'Cảnh báo khi vượt ngưỡng', 'Dữ liệu billing chi tiết nhất', 'Kiểm tra best practice', 'Khuyến nghị right-sizing'] },
      { aspect: 'Xem xét', values: ['Chi tiêu quá khứ và dự báo', 'Cost, usage, RI/SP thực tế hoặc dự báo', 'Từng line item theo resource, theo giờ', 'Cost, security, resilience, performance, limit', 'Metric sử dụng tài nguyên'] },
      { aspect: 'Đầu ra', values: ['Biểu đồ, báo cáo, khuyến nghị RI/SP', 'Cảnh báo email/SNS, budget action', 'File gửi vào S3', 'Kết quả check và khuyến nghị', 'Khuyến nghị instance/size/cấu hình'] },
      { aspect: 'Kiểm soát chủ động', values: ['Không', 'Có: action áp IAM/SCP hoặc stop EC2/RDS', 'Không', 'Không', 'Không'] },
      { aspect: 'Phân tích bằng', values: ['Console có sẵn', 'Console có sẵn', 'Athena, QuickSight, Redshift', 'Console', 'Console'] },
      { aspect: 'Lưu ý phạm vi', values: ['Lọc theo tag, service, account', 'Theo account hoặc Organizations', 'Hỗ trợ cost allocation tag', 'Đủ check cần gói Business trở lên', 'EC2, ASG, EBS, Lambda, ECS on Fargate...'] },
    ],
    pick: [
      'Cost Explorer: xem tiền đi đâu, xu hướng, dự báo, và khuyến nghị RI/Savings Plans.',
      'AWS Budgets: nhận cảnh báo hoặc tự động hành động khi chi tiêu/usage vượt ngưỡng.',
      'Cost and Usage Report (Data Exports): dữ liệu billing chi tiết để tự phân tích bằng Athena/QuickSight.',
      'Trusted Advisor: kiểm tra tổng quát như resource nhàn rỗi, port mở, service limit.',
      'Compute Optimizer: right-size instance, volume, function dựa trên mức sử dụng thực tế.',
    ],
    diagram: `~~~decide
# Câu hỏi muốn gì
Xem tiền đi đâu, xu hướng và dự báo => Cost Explorer
Cảnh báo hoặc tự hành động khi vượt ngưỡng => AWS Budgets
Dữ liệu billing chi tiết để query bằng Athena => Cost and Usage Report (Data Exports)
Kiểm tra best practice tổng quát => Trusted Advisor
Right-size theo mức dùng thực tế => Compute Optimizer
~~~

~~~groups
# Nhìn lại, cảnh báo hay khuyến nghị
Xem và phân tích: *Cost Explorer, Cost and Usage Report (Data Exports)
Cảnh báo và hành động: *AWS Budgets
Khuyến nghị: *Trusted Advisor (best practice), *Compute Optimizer (right-size)
~~~`,
    keywords: [
      { trigger: 'alert when forecasted cost exceeds a threshold', answer: 'AWS Budgets' },
      { trigger: 'visualize and forecast spending, by service or tag', answer: 'AWS Cost Explorer' },
      { trigger: 'most granular hourly billing data, query with Athena', answer: 'Cost and Usage Report (Data Exports)' },
      { trigger: 'right-size EC2 based on utilization (ML)', answer: 'AWS Compute Optimizer' },
      { trigger: 'detect unusual spend automatically', answer: 'AWS Cost Anomaly Detection' },
    ],
    lessons: ['cost-management-tools'],
  },
  {
    id: 'dynamodb-capacity',
    domain: 'cost',
    title: 'Capacity mode của DynamoDB',
    summary:
      'Cùng một bảng có thể tính tiền theo request hoặc theo capacity đã provision; lựa chọn đúng phụ thuộc traffic dự đoán được tới đâu.',
    services: ['On-demand', 'Provisioned', 'Provisioned + auto scaling', 'Reserved capacity'],
    rows: [
      { aspect: 'Tính tiền', values: ['Theo từng request đọc/ghi', 'Theo RCU/WCU provision mỗi giờ', 'Theo RCU/WCU provision, tự điều chỉnh', 'Trả trước cam kết cộng giá giờ thấp hơn'] },
      { aspect: 'Lên kế hoạch capacity', values: ['Không cần', 'Thủ công', 'Đặt min, max và target utilization', 'Cam kết một mức baseline'] },
      { aspect: 'Traffic phù hợp', values: ['Khó đoán, đột biến, app mới', 'Ổn định, biết rõ', 'Dự đoán được, thay đổi từ từ', 'Baseline ổn định dài hạn'] },
      { aspect: 'Spike đột ngột', values: ['Tự xử lý', 'Bị throttle khi vượt capacity (có burst)', 'Có thể throttle; scale không tức thì', 'Như provisioned'] },
      { aspect: 'Cam kết', values: ['Không', 'Không', 'Không', '1 hoặc 3 năm'] },
      { aspect: 'Chi phí khi dùng cao đều', values: ['Cao hơn', 'Thấp hơn', 'Thấp hơn', 'Thấp nhất'] },
    ],
    pick: [
      'On-demand: traffic không rõ hoặc đột biến, app mới, hoặc không muốn quản lý capacity.',
      'Provisioned: traffic ổn định, dự đoán được, biết rõ throughput cần.',
      'Provisioned + auto scaling: traffic dự đoán được, lên xuống từ từ trong ngày.',
      'Reserved capacity: throughput provisioned ổn định dài hạn với giá thấp nhất.',
    ],
    diagram: `~~~ladder
# Từ linh hoạt nhất tới rẻ nhất khi dùng đều
On-demand | trả theo request, tự xử lý spike | linh hoạt nhất
Provisioned + auto scaling | đặt min, max và target utilization | cân bằng
Provisioned | đặt RCU/WCU thủ công | rẻ hơn
Reserved capacity | cam kết 1 hoặc 3 năm | rẻ nhất
~~~

~~~decide
# Từ khóa trong đề
App mới, traffic không đoán được, spike đột ngột => On-demand
Traffic lên xuống từ từ trong ngày => Provisioned + auto scaling
Throughput ổn định, biết rõ => Provisioned
Baseline ổn định dài hạn, giá thấp nhất => Reserved capacity
~~~`,
    keywords: [
      { trigger: 'unpredictable traffic, no capacity planning', answer: 'DynamoDB on-demand' },
      { trigger: 'predictable traffic, cost-effective', answer: 'Provisioned với auto scaling' },
      { trigger: 'steady usage for years, lowest DynamoDB cost', answer: 'Provisioned + reserved capacity' },
      { trigger: 'ProvisionedThroughputExceededException on sudden spikes', answer: 'On-demand mode (hoặc tăng provisioned capacity)' },
    ],
    lessons: ['nosql-caching', 'cost-database-storage-choices'],
  },
];
