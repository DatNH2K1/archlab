import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { RequirementId } from '../types';

/** Patient-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'noPublicServers'];

const locked = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium' }],
    ['db', 'rds', 680, 240, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const scans = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 80],
    ['lb', 'alb', 460, 240],
    ['web', 'ec2', 660, 240, { size: 'medium' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 80],
    ['lb', 'alb', 460, 240],
    ['web', 'ec2', 660, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 880, 140, { encrypted: true }],
    ['db', 'rds', 880, 320, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 220, 240],
    ['cdn', 'cloudfront', 380, 240],
    ['files', 's3', 560, 80],
    ['lb', 'alb', 560, 240],
    ['web', 'ec2', 760, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 980, 140, { encrypted: true }],
    ['db', 'rds', 980, 320, { size: 'medium', encrypted: true }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const audited = (queue: { encrypted: boolean }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 220, 240],
      ['cdn', 'cloudfront', 380, 240],
      ['files', 's3', 560, 80],
      ['lb', 'alb', 560, 240],
      ['web', 'ec2', 760, 240, { size: 'medium', count: 2, az: 'spread' }],
      ['cache', 'elasticache', 980, 140, { encrypted: true }],
      ['db', 'rds', 980, 320, { size: 'medium', encrypted: true }],
      ['queue', 'sqs', 760, 440, queue],
      ['worker', 'ec2', 980, 480, { size: 'medium' }],
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'lb'],
      ['lb', 'web'],
      ['web', 'cache'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
    ],
  );

export const healthRecords: Track = {
  id: 'health-records',
  difficulty: 'medium',
  text: {
    vi: {
      title: 'Hồ sơ bệnh án điện tử',
      pitch:
        'Xây cổng hồ sơ bệnh án cho chuỗi phòng khám: dữ liệu y tế phải luôn mã hoá, riêng tư và chịu được tấn công.',
      tags: ['Bảo mật', 'KMS', 'S3 private', 'WAF', 'SQS'],
    },
    en: {
      title: 'Electronic health records',
      pitch:
        'Build a health records portal for a clinic chain: medical data must stay encrypted, private and safe from attacks.',
      tags: ['Security', 'KMS', 'Private S3', 'WAF', 'SQS'],
    },
  },
  rounds: [
    {
      id: 'ehr-private',
      text: {
        vi: {
          title: 'Dữ liệu y tế là nhạy cảm',
          story:
            'Chuỗi phòng khám đưa hồ sơ bệnh án lên mạng: 300 yêu cầu/giây, 70% bác sĩ và bệnh nhân xem hồ sơ, 30% cập nhật. Quy định về dữ liệu y tế bắt buộc: mã hoá mọi dữ liệu, database không lộ ra ngoài, không máy chủ nào nhận kết nối thẳng từ Internet.',
          concept:
            'Ba lớp tách biệt trong VPC: ALB ở subnet public, EC2 và RDS ở subnet private. Security group của RDS chỉ nhận cổng 5432 từ security group của EC2. RDS bật mã hoá at rest bằng khoá KMS, và phải bật lúc tạo: không bật thêm được cho database đang chạy.',
          nudge: 'Người dùng → ALB → EC2 (kích cỡ Vừa) → RDS (kích cỡ Vừa), bật mã hoá cho RDS.',
        },
        en: {
          title: 'Medical data is sensitive',
          story:
            'The clinic chain puts health records online: 300 requests/s, 70% doctors and patients reading records, 30% updates. Health data rules demand: encrypt all data, keep the database private, and no server may take connections straight from the internet.',
          concept:
            'Three tiers inside a VPC: the ALB in a public subnet, EC2 and RDS in private subnets. The RDS security group only allows port 5432 from the EC2 security group. RDS encrypts at rest with a KMS key, and it must be turned on at creation: a running database cannot be encrypted in place.',
          nudge: 'Users → ALB → EC2 (medium) → RDS (medium), with encryption on for RDS.',
        },
      },
      scenario: {
        traffic: 300,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 90,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['vpc-networking-security', 'data-encryption-kms'],
      solution: locked,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240, { size: 'medium' }],
          ['db', 'rds', 560, 240, { size: 'medium' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-scans',
      text: {
        vi: {
          title: 'Ảnh chụp X-quang',
          story:
            'Bệnh nhân giờ xem được ảnh X-quang và kết quả xét nghiệm: lưu lượng lên 700 yêu cầu/giây, gần một nửa là tải tệp. Phục vụ tệp từ EC2 làm máy chủ quá tải. Bộ phận bảo mật cấm bucket public: ai có link cũng tải được là lộ dữ liệu bệnh nhân.',
          concept:
            'Lưu tệp trong S3 với Block Public Access bật, rồi phục vụ qua CloudFront dùng Origin Access Control (OAC): bucket policy chỉ cho CloudFront đọc. Muốn chỉ đúng bệnh nhân tải được, ứng dụng cấp signed URL hoặc signed cookie có hạn dùng ngắn.',
          nudge: 'Người dùng → CloudFront; CloudFront → S3 cho tệp và CloudFront → ALB cho phần còn lại.',
        },
        en: {
          title: 'X-ray images',
          story:
            'Patients can now view X-rays and lab results: traffic grows to 700 requests/s, nearly half of them file downloads. Serving files from EC2 overloads the servers. Security bans public buckets: anyone holding a link could download patient data.',
          concept:
            'Store files in S3 with Block Public Access on, and serve them through CloudFront with Origin Access Control (OAC): the bucket policy only lets CloudFront read. To let only the right patient download, the app issues short-lived signed URLs or signed cookies.',
          nudge: 'Users → CloudFront; CloudFront → S3 for files and CloudFront → ALB for the rest.',
        },
      },
      scenario: {
        traffic: 700,
        mix: { static: 0.45, read: 0.4, write: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 200,
        budget: 100,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: ['edge-networking', 'secrets-certificates'],
      solution: scans,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['files', 's3', 280, 80],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium' }],
          ['db', 'rds', 680, 240, { size: 'medium', encrypted: true }],
        ],
        [
          ['users', 'files'],
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-cache',
      text: {
        vi: {
          title: 'Bác sĩ cần tra cứu nhanh',
          story:
            'Trong phòng khám, bác sĩ mở hồ sơ liên tục: 900 yêu cầu/giây, phần lớn là đọc lại cùng một hồ sơ. RDS không theo kịp và mục tiêu độ trễ hạ xuống 70 ms. Dữ liệu y tế nằm trong cache cũng vẫn là dữ liệu y tế.',
          concept:
            'ElastiCache đỡ phần đọc lặp lại cho RDS. Bật encryption at rest và in-transit (TLS) cho cache, thêm AUTH token hoặc user RBAC của Redis, và đặt cache trong subnet private chỉ EC2 kết nối được.',
          nudge: 'Thêm ElastiCache nối từ EC2 và bật mã hoá cho nó.',
        },
        en: {
          title: 'Doctors need fast lookups',
          story:
            'In the clinic, doctors open records all day: 900 requests/s, mostly re-reading the same records. RDS cannot keep up and the latency target drops to 70 ms. Health data in a cache is still health data.',
          concept:
            'ElastiCache takes repeated reads off RDS. Turn on encryption at rest and in transit (TLS) for the cache, add a Redis AUTH token or RBAC users, and keep the cache in a private subnet that only EC2 can reach.',
          nudge: 'Add ElastiCache linked from EC2 and turn on its encryption.',
        },
      },
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.6, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 70,
        budget: 140,
        requirements: [...RULES, 'privateBucket'],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'data-encryption-kms'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['cdn', 'cloudfront', 260, 240],
          ['files', 's3', 460, 80],
          ['lb', 'alb', 460, 240],
          ['web', 'ec2', 660, 240, { size: 'medium', count: 2, az: 'spread' }],
          ['cache', 'elasticache', 880, 140],
          ['db', 'rds', 880, 320, { size: 'medium', encrypted: true }],
        ],
        [
          ['users', 'cdn'],
          ['cdn', 'files'],
          ['cdn', 'lb'],
          ['lb', 'web'],
          ['web', 'cache'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'ehr-stuffing',
      text: {
        vi: {
          title: 'Dò mật khẩu hàng loạt',
          story:
            'Kẻ tấn công thử hàng triệu cặp email/mật khẩu bị lộ từ trang khác (credential stuffing), dội vào cổng gấp 6 lần lưu lượng thật. Kiểm toán cũng yêu cầu mọi yêu cầu phải qua tường lửa ứng dụng trước khi tới máy chủ.',
          concept:
            'Gắn AWS WAF vào CloudFront: rate-based rule giới hạn số lần đăng nhập mỗi IP, managed rule Account Takeover Prevention và Bot Control chặn bot. Shield Standard tự bảo vệ tầng mạng; Shield Advanced thêm đội ứng cứu DDoS và bảo vệ chi phí.',
          nudge: 'Đặt WAF giữa Người dùng và CloudFront.',
        },
        en: {
          title: 'Credential stuffing',
          story:
            'Attackers try millions of email/password pairs leaked from other sites (credential stuffing), hitting the portal at 6× real traffic. Auditors also require every request to pass a web application firewall before it reaches a server.',
          concept:
            'Attach AWS WAF to CloudFront: a rate-based rule caps logins per IP, and the Account Takeover Prevention and Bot Control managed rules stop bots. Shield Standard covers the network layer for free; Shield Advanced adds a DDoS response team and cost protection.',
          nudge: 'Put WAF between Users and CloudFront.',
        },
      },
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.6, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 150,
        requirements: [...RULES, 'privateBucket', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: cached,
    },
    {
      id: 'ehr-audit',
      text: {
        vi: {
          title: 'Nhật ký truy cập hồ sơ',
          story:
            'Luật yêu cầu ghi lại ai đã xem hồ sơ nào và gửi báo cáo truy cập cho bệnh nhân khi họ hỏi: 15% yêu cầu là tạo báo cáo, mỗi báo cáo mất vài trăm ms. Không được mất báo cáo nào, và hàng đợi cũng chứa dữ liệu bệnh nhân.',
          concept:
            'Đẩy việc tạo báo cáo vào SQS bật SSE-KMS, một worker riêng xử lý. CloudTrail ghi lại mọi lời gọi API vào AWS; bật CloudTrail log file validation và lưu log vào S3 có Object Lock để không ai sửa được.',
          nudge: 'Thêm SQS (bật mã hoá) nối từ EC2 web, và một EC2 worker kích cỡ Vừa đọc từ SQS.',
        },
        en: {
          title: 'Record access log',
          story:
            'The law requires logging who viewed which record and sending patients an access report on request: 15% of requests build a report, each taking a few hundred ms. No report may be lost, and the queue holds patient data too.',
          concept:
            'Send report jobs to SQS with SSE-KMS, and let a separate worker build them. CloudTrail records every AWS API call; turn on CloudTrail log file validation and store logs in S3 with Object Lock so nobody can change them.',
          nudge: 'Add an encrypted SQS fed by the web EC2, and a medium EC2 worker reading from it.',
        },
      },
      scenario: {
        traffic: 900,
        mix: { static: 0.3, read: 0.45, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 185,
        requirements: [...RULES, 'privateBucket', 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'threat-detection-waf-shield'],
      solution: audited({ encrypted: true }),
      naive: audited({ encrypted: false }),
    },
  ],
};
