import { makeBoard } from '../board';
import type { Track } from '../rounds';

type NodeSpecs = Parameters<typeof makeBoard>[0];
type NodeConfig = NonNullable<NodeSpecs[number][4]>;

const firstFeed = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const replicated = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 720, 160, { size: 'medium', multiAz: true }],
    ['replica', 'readReplica', 720, 340, { size: 'medium', az: 'b' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
    ['web', 'replica'],
  ],
);

/** The feed with a timeline cache in front of the database and its replica. */
const cachedFeed = (options: {
  web: NodeConfig;
  cache?: NodeConfig;
  db?: NodeConfig;
  edge?: boolean;
}) => {
  const x = options.edge ? 180 : 0;
  const nodes: NodeSpecs = [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280 + x, 240],
    ['web', 'ec2', 480 + x, 240, options.web],
    ['cache', 'elasticache', 720 + x, 80, options.cache ?? {}],
    ['db', 'rds', 720 + x, 240, options.db ?? { size: 'medium', multiAz: true }],
    ['replica', 'readReplica', 720 + x, 400, { size: 'medium', az: 'b' }],
  ];
  const edges: [string, string][] = [
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'replica'],
  ];

  if (options.edge) {
    nodes.push(['cdn', 'cloudfront', 280, 240, { cacheApi: true }]);
    edges.push(['users', 'cdn'], ['cdn', 'lb']);
  } else {
    edges.push(['users', 'lb']);
  }

  return makeBoard(nodes, edges);
};

const bigWeb: NodeConfig = { size: 'large', count: 3, az: 'spread' };
const elasticWeb: NodeConfig = { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 };

const cached = cachedFeed({ web: bigWeb });
const crashProof = cachedFeed({ web: bigWeb, cache: { multiAz: true } });
const grown = { web: elasticWeb, cache: { size: 'medium', multiAz: true }, db: { size: 'large', multiAz: true } } as const;
const viral = cachedFeed(grown);
const edgeCached = cachedFeed({ ...grown, edge: true });

export const newsFeed: Track = {
  id: 'news-feed',
  difficulty: 'medium',
  text: {
    vi: {
      title: 'News feed mạng xã hội',
      pitch: 'Một dòng tin được đọc nhiều hơn ghi cả chục lần: cache, read replica và edge giúp ai cũng lướt mượt.',
      tags: ['Đọc nhiều', 'Read Replica', 'ElastiCache', 'CloudFront'],
    },
    en: {
      title: 'Social news feed',
      pitch: 'A feed that is read far more than it is written: caches, read replicas and the edge keep scrolling smooth for everyone.',
      tags: ['Read-heavy', 'Read replicas', 'ElastiCache', 'CloudFront'],
    },
  },
  rounds: [
    {
      id: 'feed-1-launch',
      text: {
        vi: {
          title: 'Ra mắt dòng tin',
          story: '800 yêu cầu/giây: 90% là lướt dòng tin (đọc), 10% là đăng bài và thả tim (ghi). Ngân sách $150/tháng.',
          concept: 'Ứng dụng đọc nhiều: tầng web scale ngang sau ALB, còn database phải đủ sức cho cả lượt đọc lẫn lượt ghi (mỗi lượt ghi tốn RDS gấp 3 lượt đọc).',
          nudge: 'Người dùng → ALB → EC2 cỡ Vừa (2 máy) → RDS cỡ Lớn.',
        },
        en: {
          title: 'Feed launch',
          story: '800 requests/s: 90% scrolling the feed (reads), 10% posting and liking (writes). Budget $150/month.',
          concept: 'A read-heavy app: scale the web tier out behind an ALB, and size the database for reads plus writes (a write costs RDS three reads).',
          nudge: 'Users → ALB → EC2 Medium ×2 → RDS Large.',
        },
      },
      scenario: { traffic: 800, mix: { read: 0.9, write: 0.1 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 150, requirements: [] },
      unlocks: [],
      lessons: ['elastic-load-balancing', 'relational-databases'],
      solution: firstFeed,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 2 }],
          ['db', 'rds', 700, 240, { size: 'medium' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'feed-2-read-replica',
      text: {
        vi: {
          title: 'Read replica gánh lượt đọc',
          story: 'Vẫn 800 yêu cầu/giây, nhưng một AZ sắp mất điện gần nửa buổi. Bật Multi-AZ cho RDS cỡ Lớn thì giá ×2, vượt ngân sách $275/tháng, mà bản dự phòng Multi-AZ không phục vụ lượt đọc nào.',
          concept: 'Multi-AZ để sống sót, read replica để scale đọc: giữ RDS chính cỡ Vừa có Multi-AZ và thêm một Read Replica ở AZ b gánh bớt lượt đọc. Replica không nhân đôi giá như Multi-AZ.',
          nudge: 'EC2 cỡ Vừa, 4 máy, "Cả a và b", bật Auto Scaling Group (tối đa 4). RDS cỡ Vừa bật Multi-AZ, thêm Read Replica cỡ Vừa ở AZ b; nối EC2 tới cả hai.',
        },
        en: {
          title: 'Replicas for reads',
          story: 'Still 800 requests/s, but one AZ is about to lose power for almost half the round. Multi-AZ on a Large RDS doubles its price and breaks the $275/month budget, and the Multi-AZ standby serves no reads.',
          concept: 'Multi-AZ to survive, read replicas to scale reads: keep a Medium primary with Multi-AZ and add a Read Replica in AZ b to take part of the reads. A replica does not double the price like Multi-AZ does.',
          nudge: 'EC2 Medium ×4, "AZ a+b", Auto Scaling Group on (max 4). RDS Medium with Multi-AZ plus a Medium Read Replica in AZ b; connect EC2 to both.',
        },
      },
      scenario: {
        traffic: 800,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 250,
        budget: 275,
        requirements: [],
      },
      unlocks: [],
      lessons: ['relational-databases', 'high-availability-multi-az'],
      solution: replicated,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
          ['db', 'rds', 700, 240, { size: 'large', multiAz: true }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'feed-3-cache',
      text: {
        vi: {
          title: 'Cache dòng tin',
          story: 'Ứng dụng nổi lên: 2.500 yêu cầu/giây, 95% là đọc. Thêm replica cỡ Lớn để gánh hết lượt đọc sẽ vượt ngân sách $330/tháng.',
          concept: 'Dòng tin của mỗi người được đọc lại rất nhiều lần: ElastiCache trả ~85% lượt đọc, database và replica chỉ nhận phần trượt cache và lượt ghi. Cache rẻ hơn nhiều so với thêm replica.',
          nudge: 'Thêm ElastiCache cỡ Nhỏ, nối EC2 → ElastiCache. EC2 đổi sang cỡ Lớn, 3 máy.',
        },
        en: {
          title: 'Cache the feed',
          story: 'The app takes off: 2,500 requests/s, 95% reads. Adding Large replicas to carry every read blows the $330/month budget.',
          concept: "Each person's feed is read again and again: ElastiCache answers ~85% of reads, so the database and replica only see misses and writes. A cache is far cheaper than more replicas.",
          nudge: 'Add a Small ElastiCache and connect EC2 → ElastiCache. Switch EC2 to Large ×3.',
        },
      },
      scenario: { traffic: 2500, mix: { read: 0.95, write: 0.05 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 330, requirements: [] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, bigWeb],
          ['db', 'rds', 720, 160, { size: 'large', multiAz: true }],
          ['replica', 'readReplica', 720, 340, { size: 'large', az: 'b' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
          ['web', 'replica'],
        ],
      ),
    },
    {
      id: 'feed-4-cache-crash',
      text: {
        vi: {
          title: 'Cache sập',
          story: 'Node ElastiCache duy nhất chết giữa buổi. Toàn bộ 2.500 yêu cầu/giây đổ thẳng xuống database và replica, vốn chỉ được tính cho phần trượt cache.',
          concept: 'Cache cũng là một điểm lỗi. ElastiCache Multi-AZ giữ một bản sao ở AZ khác để thay thế ngay khi node chính chết, rẻ hơn nhiều so với một database đủ lớn để gánh mọi lượt đọc.',
          nudge: 'Bật Multi-AZ cho ElastiCache.',
        },
        en: {
          title: 'The cache crashes',
          story: 'The only ElastiCache node dies mid-round. All 2,500 requests/s land on the database and replica, which were sized for cache misses only.',
          concept: 'A cache is a point of failure too. ElastiCache Multi-AZ keeps a replica in another AZ that takes over at once, much cheaper than a database big enough to serve every read.',
          nudge: 'Turn on Multi-AZ for ElastiCache.',
        },
      },
      scenario: {
        traffic: 2500,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'cacheCrash',
        latencyTarget: 250,
        budget: 340,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: crashProof,
      naive: cached,
    },
    {
      id: 'feed-5-viral',
      text: {
        vi: {
          title: 'Một bài đăng lan truyền',
          story: 'Một bài đăng lan truyền: lưu lượng tăng đều từ 1.500 lên 6.000 yêu cầu/giây trong suốt buổi. Đội máy cố định không theo kịp, còn chuẩn bị sẵn cho mức cuối buổi thì quá phí. Ngân sách $680/tháng.',
          concept: 'Auto Scaling giúp tầng web theo kịp lưu lượng tăng dần. Cache và database không tự scale: nâng ElastiCache lên cỡ Vừa và RDS chính lên cỡ Lớn để chịu được mức cuối buổi.',
          nudge: 'EC2 cỡ Lớn, tối thiểu 2, tối đa 8, bật Auto Scaling Group. ElastiCache cỡ Vừa (Multi-AZ), RDS cỡ Lớn (Multi-AZ).',
        },
        en: {
          title: 'A post goes viral',
          story: 'A post goes viral: traffic climbs steadily from 1,500 to 6,000 requests/s over the round. A fixed fleet cannot keep up, and sizing for the end of the round is wasteful. Budget $680/month.',
          concept: 'Auto Scaling lets the web tier follow growing traffic. The cache and database do not scale by themselves: move ElastiCache to Medium and the RDS primary to Large to cope with the end of the round.',
          nudge: 'EC2 Large, min 2, max 8, Auto Scaling Group on. ElastiCache Medium (Multi-AZ), RDS Large (Multi-AZ).',
        },
      },
      scenario: {
        traffic: 1500,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'viral',
        latencyTarget: 250,
        budget: 680,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: viral,
      naive: crashProof,
    },
    {
      id: 'feed-6-global',
      text: {
        vi: {
          title: 'Người đọc khắp thế giới',
          story: 'Ứng dụng ra quốc tế: 3.000 yêu cầu/giây, 60% người dùng ở châu Âu. Họ phải chờ quá lâu: mục tiêu giờ là dưới 120 ms, và ngân sách chỉ còn $550/tháng.',
          concept: 'CloudFront cache cả phản hồi API: dòng tin nóng được trả ngay ở edge gần người đọc, phần còn lại đi về origin qua mạng AWS. Nhanh hơn cho người ở xa, và EC2 bớt tải nên cần ít máy hơn.',
          nudge: 'Đặt CloudFront giữa Người dùng và ALB, bật "Cache cả phản hồi API".',
        },
        en: {
          title: 'Readers worldwide',
          story: 'The app goes international: 3,000 requests/s, 60% of users in Europe. They wait too long: the target is now under 120 ms, and the budget is down to $550/month.',
          concept: 'CloudFront can cache API responses too: hot feeds are served at an edge near the reader, and the rest travels to the origin over the AWS network. Faster for far-away users, and less load on EC2, so fewer servers.',
          nudge: 'Put CloudFront between Users and the ALB and turn on "Cache API responses".',
        },
      },
      scenario: {
        traffic: 3000,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        latencyTarget: 120,
        budget: 550,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking', 'cost-network-transfer'],
      solution: edgeCached,
      naive: viral,
    },
  ],
};
