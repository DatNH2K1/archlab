import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { RequirementId } from '../types';

/** Compliance rules that hold in every round. */
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

const multiAz = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 680, 240, { size: 'medium', encrypted: true, multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 260, 240],
    ['lb', 'alb', 440, 240],
    ['web', 'ec2', 640, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true, multiAz: true }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const statements = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 260, 240],
    ['lb', 'alb', 440, 240],
    ['web', 'ec2', 640, 240, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 860, 240, { size: 'medium', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 640, 420, { encrypted: true }],
    ['worker', 'ec2', 860, 420],
  ],
  [
    ['users', 'shield'],
    ['shield', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

const global = makeBoard(
  [
    ['users', 'users', 80, 280],
    ['shield', 'waf', 240, 280],
    ['cdn', 'cloudfront', 400, 280],
    ['files', 's3', 580, 100],
    ['ga', 'globalAccelerator', 580, 280],
    ['lb', 'alb', 760, 280],
    ['web', 'ec2', 940, 280, { size: 'medium', count: 2, az: 'spread' }],
    ['db', 'rds', 1140, 280, { size: 'medium', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 940, 460, { encrypted: true }],
    ['worker', 'ec2', 1140, 460],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

const payday = makeBoard(
  [
    ['users', 'users', 80, 280],
    ['shield', 'waf', 240, 280],
    ['cdn', 'cloudfront', 400, 280],
    ['files', 's3', 580, 100],
    ['ga', 'globalAccelerator', 580, 280],
    ['lb', 'alb', 760, 280],
    [
      'web',
      'ec2',
      940,
      280,
      {
        size: 'medium',
        count: 2,
        az: 'spread',
        autoScaling: true,
        maxCount: 6,
      },
    ],
    ['db', 'rds', 1140, 280, { size: 'large', encrypted: true, multiAz: true }],
    ['queue', 'sqs', 940, 460, { encrypted: true }],
    ['worker', 'ec2', 1140, 460, { size: 'medium' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);

export const bankingPortal: Track = {
  id: 'banking-portal',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'Cổng ngân hàng trực tuyến',
      pitch: 'Xây cổng ngân hàng vừa tuân thủ quy định bảo mật, vừa chịu được sự cố, tấn công và ngày lương về.',
      tags: ['Bảo mật', 'Multi-AZ', 'WAF', 'SQS', 'Toàn cầu'],
    },
    en: {
      title: 'Online banking portal',
      pitch: 'Build a banking portal that meets strict security rules and survives outages, attacks and payday.',
      tags: ['Security', 'Multi-AZ', 'WAF', 'SQS', 'Global'],
    },
  },
  rounds: [
    {
      id: 'bank-secure',
      text: {
        vi: {
          title: 'Kiểm toán ngày đầu',
          story:
            'Ngân hàng mở cổng giao dịch trực tuyến: 400 yêu cầu/giây, 70% xem số dư và lịch sử, 30% chuyển khoản. Bộ phận tuân thủ yêu cầu ngay từ đầu: mã hoá mọi dữ liệu, database không được lộ ra ngoài, không máy chủ nào nhận kết nối trực tiếp từ Internet.',
          concept:
            'Phòng thủ nhiều lớp: chỉ ALB ở subnet public, EC2 và RDS ở subnet private, chỉ nhận kết nối từ lớp ngay trước nó (security group). RDS bật mã hoá at rest bằng KMS.',
          nudge: 'Người dùng → ALB → EC2 (kích cỡ Vừa) → RDS (kích cỡ Vừa) và bật mã hoá cho RDS.',
        },
        en: {
          title: 'Day-one audit',
          story:
            'The bank opens its online portal: 400 requests/s, 70% checking balances and history, 30% transfers. Compliance demands from day one: encrypt all data, keep the database private, and no server may take connections straight from the internet.',
          concept:
            'Defense in depth: only the ALB sits in a public subnet; EC2 and RDS live in private subnets and accept traffic only from the layer in front (security groups). RDS encrypts at rest with KMS.',
          nudge: 'Users → ALB → EC2 (medium) → RDS (medium), and turn on encryption for RDS.',
        },
      },
      scenario: {
        traffic: 400,
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
      id: 'bank-az',
      text: {
        vi: {
          title: 'Một AZ mất điện',
          story:
            'Một AZ mất điện giữa giờ làm việc. Cổng ngân hàng không được phép ngừng: chỉ một máy chủ và một database trong cùng một AZ là không đủ.',
          concept:
            'Multi-AZ cho cả hai tầng: EC2 trải trên hai AZ sau ALB, RDS Multi-AZ có bản standby đồng bộ ở AZ khác và tự failover.',
          nudge: 'Đặt EC2 thành 2 máy, AZ "Cả a và b", rồi bật Multi-AZ cho RDS.',
        },
        en: {
          title: 'An AZ loses power',
          story:
            'An AZ loses power during business hours. The banking portal must not stop: one server and one database in the same AZ is not enough.',
          concept:
            'Multi-AZ on both tiers: EC2 across two AZs behind the ALB, and RDS Multi-AZ keeps a synchronous standby in another AZ with automatic failover.',
          nudge: 'Set EC2 to 2 instances in "AZ a+b", then turn on Multi-AZ for RDS.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 200,
        budget: 150,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'relational-databases'],
      solution: multiAz,
      naive: locked,
    },
    {
      id: 'bank-attack',
      text: {
        vi: {
          title: 'Tấn công đăng nhập',
          story:
            'Một botnet dội yêu cầu rác gấp 6 lần lưu lượng thật vào trang đăng nhập. ALB chuyển hết tới EC2 và khách hàng thật không vào được.',
          concept:
            'AWS WAF gắn trước ALB lọc lưu lượng tầng ứng dụng: rate-based rule, managed rule chống SQL injection và bot. Yêu cầu bị chặn không bao giờ tới máy chủ.',
          nudge: 'Đặt WAF giữa Người dùng và ALB.',
        },
        en: {
          title: 'Login attack',
          story:
            'A botnet hammers the login page with junk at 6× real traffic. The ALB forwards it all to EC2, and real customers cannot get in.',
          concept:
            'AWS WAF in front of the ALB filters application-layer traffic: rate-based rules plus managed rules against SQL injection and bots. Blocked requests never reach the servers.',
          nudge: 'Put WAF between Users and the ALB.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 200,
        budget: 155,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: multiAz,
    },
    {
      id: 'bank-statements',
      text: {
        vi: {
          title: 'Sao kê PDF',
          story:
            'Khách hàng có thể tải sao kê PDF: 15% yêu cầu là tạo sao kê, mỗi file mất vài trăm ms. Tạo ngay trong yêu cầu làm cả trang chậm quá 120 ms, và không được bỏ sót sao kê nào.',
          concept:
            'Tách việc nặng ra khỏi luồng web: EC2 đẩy job vào SQS (bật mã hoá), một worker riêng lấy job ra xử lý. Web trả lời ngay, hàng đợi giữ job cho tới khi xong.',
          nudge: 'Thêm SQS (bật mã hoá) nối từ EC2, và một EC2 worker kích cỡ Nhỏ đọc từ SQS.',
        },
        en: {
          title: 'PDF statements',
          story:
            'Customers can download PDF statements: 15% of requests create one, and each takes a few hundred ms. Doing it inside the request pushes the whole portal past 120 ms, and no statement may be lost.',
          concept:
            'Move heavy work off the web path: EC2 sends jobs to SQS (encrypted), and a separate worker pulls them. The web tier answers at once while the queue holds jobs until they are done.',
          nudge: 'Add an encrypted SQS fed by EC2, and a small EC2 worker reading from SQS.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { read: 0.6, write: 0.25, job: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 120,
        budget: 175,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: statements,
      naive: shielded,
    },
    {
      id: 'bank-far',
      text: {
        vi: {
          title: 'Khách hàng ở nước ngoài',
          story:
            'Ngân hàng mở chi nhánh quốc tế: 600 yêu cầu/giây, 40% khách ở châu Âu, xa us-east-1. Một phần ba yêu cầu là tệp tĩnh của trang (JS, CSS, logo). Mục tiêu độ trễ là 80 ms.',
          concept:
            'CloudFront phục vụ tệp tĩnh từ S3 ở edge. Dữ liệu tài khoản là riêng tư nên không cache; thay vào đó Global Accelerator đưa các yêu cầu đó vào mạng backbone AWS gần khách nhất.',
          nudge:
            'WAF → CloudFront (không bật cache API) → S3 cho tệp tĩnh, và CloudFront → Global Accelerator → ALB cho phần còn lại.',
        },
        en: {
          title: 'Customers abroad',
          story:
            'The bank opens international branches: 600 requests/s, 40% from customers in Europe, far from us-east-1. A third of requests are static page files (JS, CSS, logos). The latency target is 80 ms.',
          concept:
            'CloudFront serves static files from S3 at the edge. Account data is private, so it is not cached; Global Accelerator instead brings those requests onto the AWS backbone close to the customer.',
          nudge:
            'WAF → CloudFront (API caching off) → S3 for static files, and CloudFront → Global Accelerator → ALB for the rest.',
        },
      },
      scenario: {
        traffic: 600,
        mix: { static: 0.35, read: 0.4, write: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        latencyTarget: 80,
        budget: 210,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: global,
      naive: statements,
    },
    {
      id: 'bank-payday',
      text: {
        vi: {
          title: 'Ngày nhận lương',
          story:
            'Ngày lương về, lưu lượng tăng gấp ba trong vài giờ: ai cũng xem số dư, chuyển khoản và tải sao kê. Ngân sách $320, không đủ để chạy cả tháng với số máy của ngày lương.',
          concept:
            'Auto Scaling thêm máy web khi tải tăng và bớt khi hết đỉnh. Phần không tự co giãn được (RDS, worker) phải đủ lớn cho giờ cao điểm.',
          nudge: 'Bật Auto Scaling cho EC2 web (tối đa 6), nâng RDS lên kích cỡ Lớn và worker lên kích cỡ Vừa.',
        },
        en: {
          title: 'Payday',
          story:
            'On payday, traffic triples for a few hours: everyone checks balances, sends money and downloads statements. The $320 budget cannot run payday capacity all month.',
          concept:
            'Auto Scaling adds web instances as load rises and removes them after the peak. What does not scale on its own (RDS, the worker) must be sized for the peak.',
          nudge: 'Turn on Auto Scaling for the web EC2 (max 6), raise RDS to large and the worker to medium.',
        },
      },
      scenario: {
        traffic: 600,
        mix: { static: 0.35, read: 0.4, write: 0.15, job: 0.1 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        twist: 'flashSale',
        latencyTarget: 90,
        budget: 320,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'relational-databases'],
      solution: payday,
      naive: global,
    },
  ],
};
