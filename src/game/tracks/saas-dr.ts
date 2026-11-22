import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;

const single = (web: Cfg, db: Cfg) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['lb', 'alb', 300, 240],
      ['web', 'ec2', 520, 240, web],
      ['db', 'rds', 760, 240, db],
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
    ],
  );

const launch = single({ size: 'medium' }, { size: 'medium' });
const multiAz = single({ size: 'medium', count: 2, az: 'spread' }, { size: 'medium', multiAz: true });

const standby = (o: { web: Cfg; db: Cfg; web2: Cfg; cache?: Cfg; dns?: boolean }) => {
  const cached = o.cache !== undefined;

  return makeBoard(
    [
      ['users', 'users', 80, 300],
      ...(o.dns === false ? [] : [['dns', 'route53', 260, 300] as const]),
      ['lb', 'alb', 440, 160],
      ['web', 'ec2', 640, 160, o.web],
      // Aurora Global Database: one cluster with a managed copy in eu-west-1.
      ['db', 'aurora', 860, 300, { ...o.db, globalDb: true }],
      ...(cached ? [['cache', 'elasticache', 860, 20, o.cache] as const, ['cache2', 'elasticache', 860, 590, { ...o.cache, region: 'eu-west-1' }] as const] : []),
      ['lb2', 'alb', 440, 440, { region: 'eu-west-1' }],
      ['web2', 'ec2', 640, 440, { ...o.web2, region: 'eu-west-1' }],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.dns === false
        ? ([
            ['users', 'lb'],
            ['users', 'lb2'],
          ] as [string, string][])
        : ([
            ['users', 'dns'],
            ['dns', 'lb'],
            ['dns', 'lb2'],
          ] as [string, string][])),
      ['lb', 'web'],
      ['web', 'db'],
      ['lb2', 'web2'],
      ['web2', 'db'],
      ...(cached
        ? ([
            ['web', 'cache'],
            ['web2', 'cache2'],
          ] as [string, string][])
        : []),
    ],
  );
};

const warmCfg = {
  web: { size: 'medium', count: 2, az: 'spread' },
  db: { size: 'small' },
  web2: { size: 'medium', count: 1, autoScaling: true, maxCount: 3 },
} satisfies Parameters<typeof standby>[0];
const warm = standby(warmCfg);

const enc = { encrypted: true };
const lockedCfg = {
  ...warmCfg,
  db: { ...warmCfg.db, ...enc },
};
const locked = standby(lockedCfg);

const activeCfg = {
  web: { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 4 },
  db: { size: 'small', encrypted: true },
  web2: { size: 'medium', count: 2, autoScaling: true, maxCount: 4 },
  cache: { encrypted: true },
} satisfies Parameters<typeof standby>[0];
const active = standby(activeCfg);

const reserved = standby({
  ...activeCfg,
  web: { ...activeCfg.web, pricing: 'reserved' },
  web2: { ...activeCfg.web2, pricing: 'reserved' },
});

const compliance = ['encryptData', 'privateData', 'noPublicServers'] as const;

export const saasDr: Track = {
  id: 'saas-dr',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'SaaS không được phép sập',
      pitch: 'Một phần mềm B2B mà khách hàng doanh nghiệp trả tiền để nó luôn chạy, kể cả khi mất một AZ hay cả một Region.',
      tags: ['Multi-AZ', 'Disaster recovery', 'Bảo mật', 'Reserved'],
    },
    en: {
      title: 'SaaS that never goes down',
      pitch: 'A B2B app that enterprise customers pay to always be up, even when an AZ or a whole Region is lost.',
      tags: ['Multi-AZ', 'Disaster recovery', 'Compliance', 'Reserved'],
    },
  },
  rounds: [
    {
      id: 'dr-1-launch',
      text: {
        vi: {
          title: 'Khách hàng đầu tiên',
          story: 'Ba công ty đầu tiên dùng thử: 300 yêu cầu/giây, 80% đọc dashboard, 20% ghi dữ liệu. Ngân sách $90/tháng.',
          concept: 'Kiến trúc ba tầng cơ bản: ALB đứng trước EC2, dữ liệu nằm trong RDS. ALB là điểm vào ổn định để sau này thêm máy phía sau.',
          nudge: 'Người dùng → ALB → EC2 (Vừa) → RDS (Vừa). RDS Nhỏ không chịu nổi phần ghi.',
        },
        en: {
          title: 'First customers',
          story: 'Three companies start a trial: 300 requests/s, 80% dashboard reads, 20% writes. Budget $90/month.',
          concept: 'A basic three-tier design: an ALB in front of EC2, data in RDS. The ALB is a stable entry point you can add servers behind later.',
          nudge: 'Users → ALB → EC2 (Medium) → RDS (Medium). A Small RDS cannot keep up with the writes.',
        },
      },
      scenario: { traffic: 300, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 90, requirements: [] },
      unlocks: [],
      lessons: ['elastic-load-balancing', 'relational-databases'],
      solution: launch,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 360, 240, { size: 'medium' }],
          ['db', 'rds', 640, 240, { size: 'small' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'dr-2-az',
      text: {
        vi: {
          title: 'Hợp đồng có SLA',
          story: 'Khách hàng lớn ký hợp đồng có SLA 99,9%. Lưu lượng 350 yêu cầu/giây, và giữa vòng chơi một AZ sẽ mất điện. Ngân sách $155/tháng.',
          concept: 'High availability trong một Region: EC2 rải ở hai AZ sau ALB, RDS bật Multi-AZ để có bản dự phòng đồng bộ tự chuyển sang khi AZ chính chết.',
          nudge: 'Đặt 2 EC2 ở "Cả a và b" và bật Multi-AZ cho RDS.',
        },
        en: {
          title: 'A contract with an SLA',
          story: 'A big customer signs a 99.9% SLA. Traffic is 350 requests/s, and one AZ loses power mid-round. Budget $155/month.',
          concept: 'High availability inside a Region: EC2 spread over two AZs behind the ALB, and RDS Multi-AZ keeps a synchronous standby that takes over when the primary AZ dies.',
          nudge: 'Run 2 EC2 in "AZ a+b" and turn on Multi-AZ for RDS.',
        },
      },
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'azOutage', latencyTarget: 200, budget: 155, requirements: [] },
      unlocks: [],
      lessons: ['high-availability-multi-az'],
      solution: multiAz,
      naive: single({ size: 'medium', count: 2, az: 'spread' }, { size: 'medium' }),
    },
    {
      id: 'dr-3-region',
      text: {
        vi: {
          title: 'Kế hoạch DR',
          story: 'Kiểm toán hỏi: nếu cả us-east-1 sập thì sao? Vòng này us-east-1 sẽ chết gần nửa thời gian. Ngân sách $250/tháng, mục tiêu dưới 150 ms.',
          concept: 'Warm standby: một bản thu nhỏ của hệ thống luôn chạy ở một Region khác (eu-west-1). Database dùng Aurora Global Database: AWS giữ bản sao ở eu-west-1 (trễ ~1 giây) và tự failover sang đó trong ~1 phút khi mất Region chính, không phải promote bằng tay như bản sao RDS khác Region. Route 53 failover dùng health check để chuyển người dùng sang eu-west-1, rồi Auto Scaling nâng nó lên đủ tải.',
          nudge: 'Người dùng → Route 53 → ALB ở cả hai Region. Ở eu-west-1: ALB → 1 EC2 Vừa có Auto Scaling Group (tối đa 3). Thay RDS bằng Aurora Nhỏ, bật Aurora Global Database, và nối EC2 ở cả hai Region tới Aurora.',
        },
        en: {
          title: 'A DR plan',
          story: 'The auditor asks: what if all of us-east-1 goes down? This round it is dead for almost half the time. Budget $250/month, target under 150 ms.',
          concept: 'Warm standby: a scaled-down copy of the system always runs in another Region (eu-west-1). The database is an Aurora Global Database: AWS keeps a copy in eu-west-1 (~1 s behind) and fails over to it in ~1 minute when the primary Region is lost, with no manual promotion as with a cross-Region RDS replica. Route 53 failover uses health checks to move users to eu-west-1, then Auto Scaling grows it to full size.',
          nudge: 'Users → Route 53 → an ALB in each Region. In eu-west-1: ALB → 1 Medium EC2 with Auto Scaling Group (max 3). Replace RDS with a Small Aurora, turn on Aurora Global Database, and link the EC2 in both Regions to Aurora.',
        },
      },
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 150, budget: 250, requirements: [] },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing'],
      solution: warm,
      naive: standby({ ...warmCfg, dns: false }),
    },
    {
      id: 'dr-4-comply',
      text: {
        vi: {
          title: 'Kiểm tra tuân thủ',
          story: 'Một ngân hàng muốn ký hợp đồng nhưng yêu cầu: mọi dữ liệu phải mã hoá khi lưu trữ, database không lộ ra ngoài, không máy chủ nào nhận yêu cầu trực tiếp từ Internet. us-east-1 vẫn có thể sập.',
          concept: 'Mã hoá khi lưu trữ bằng KMS phải bật ở mọi nơi chứa dữ liệu; với Aurora Global Database, bản sao ở eu-west-1 dùng khoá KMS của Region đó. Database chỉ được nối từ tầng ứng dụng, EC2 nằm sau ALB trong subnet riêng.',
          nudge: 'Bật "Mã hoá khi lưu trữ (KMS)" cho Aurora.',
        },
        en: {
          title: 'Compliance audit',
          story: 'A bank wants to sign, with conditions: all data encrypted at rest, no exposed database, no server taking requests straight from the internet. us-east-1 can still go down.',
          concept: 'KMS encryption at rest must cover every data store; with Aurora Global Database the copy in eu-west-1 uses a KMS key in that Region. Databases are reachable only from the app tier, and EC2 sits behind the ALB in private subnets.',
          nudge: 'Turn on "Encryption at rest (KMS)" for Aurora.',
        },
      },
      scenario: { traffic: 350, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 150, budget: 250, requirements: [...compliance] },
      unlocks: [],
      lessons: ['data-encryption-kms', 'vpc-networking-security'],
      solution: locked,
      naive: warm,
    },
    {
      id: 'dr-5-active',
      text: {
        vi: {
          title: 'Khách hàng châu Âu',
          story: 'Lưu lượng lên 1.000 yêu cầu/giây, 40% đến từ châu Âu và mục tiêu siết còn 120 ms. Route 53 đưa họ về eu-west-1 vì gần hơn, nên bản thu nhỏ ở đó quá tải ngay cả khi không có sự cố.',
          concept: 'Từ warm standby sang active-active: latency routing của Route 53 phục vụ mỗi người dùng từ Region gần nhất, nên cả hai Region đều phải đủ sức. ElastiCache (có mã hoá) ở mỗi Region giảm tải đọc cho database.',
          nudge: 'Cho cả hai Region 2 EC2 Vừa có Auto Scaling Group (tối đa 4), và thêm một ElastiCache có mã hoá ở mỗi Region.',
        },
        en: {
          title: 'European customers',
          story: 'Traffic grows to 1,000 requests/s, 40% from Europe, and the target tightens to 120 ms. Route 53 sends them to eu-west-1, which is closer, so the scaled-down copy is overloaded even without an outage.',
          concept: 'From warm standby to active-active: Route 53 latency routing serves each user from the nearest Region, so both Regions need real capacity. An encrypted ElastiCache in each Region takes reads off the database.',
          nudge: 'Give both Regions 2 Medium EC2 with Auto Scaling Group (max 4), and add an encrypted ElastiCache in each Region.',
        },
      },
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 330, requirements: [...compliance] },
      unlocks: [],
      lessons: ['route53-routing', 'nosql-caching'],
      solution: active,
      naive: locked,
    },
    {
      id: 'dr-6-reserved',
      text: {
        vi: {
          title: 'Tối ưu hoá đơn',
          story: 'Phòng tài chính yêu cầu giảm chi phí xuống $280/tháng mà không bỏ Region nào. Số máy nền chạy đều 24/7 và sẽ còn chạy nhiều năm.',
          concept: 'Phần tải nền ổn định lâu dài nên mua Reserved (rẻ hơn ~40%), còn máy Auto Scaling thêm lúc cao điểm vẫn tính On-Demand. Spot không hợp cho tầng web phục vụ khách hàng vì có thể bị thu hồi bất cứ lúc nào.',
          nudge: 'Đổi hình thức tính giá của EC2 ở cả hai Region sang Reserved.',
        },
        en: {
          title: 'Trim the bill',
          story: 'Finance wants the bill down to $280/month without giving up a Region. The base servers run 24/7 and will for years.',
          concept: 'Steady, long-lived base load should be Reserved (~40% cheaper), while the extra Auto Scaling instances at peak stay On-Demand. Spot does not suit a customer-facing web tier because it can be reclaimed at any time.',
          nudge: 'Switch the EC2 pricing in both Regions to Reserved.',
        },
      },
      scenario: { traffic: 1000, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 280, requirements: [...compliance] },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'cost-management-tools'],
      solution: reserved,
      naive: active,
    },
  ],
};
