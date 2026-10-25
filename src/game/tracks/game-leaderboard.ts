import { makeBoard } from '../board';
import type { Track } from '../rounds';

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['game', 'ec2', 480, 240, { size: 'large', count: 3, az: 'spread' }],
    ['board', 'elasticache', 700, 140],
    ['scores', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const global = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 440, 240],
    ['lb', 'alb', 620, 240],
    ['game', 'ec2', 800, 240, { size: 'large', count: 2, az: 'spread' }],
    ['board', 'elasticache', 1020, 140],
    ['scores', 'dynamodb', 1020, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['lb', 'alb', 720, 240],
    ['game', 'ec2', 900, 240, { size: 'large', count: 2, az: 'spread' }],
    ['board', 'elasticache', 1120, 140],
    ['scores', 'dynamodb', 1120, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const replicated = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['lb', 'alb', 720, 240],
    ['game', 'ec2', 900, 240, { size: 'large', count: 3, az: 'spread' }],
    ['board', 'elasticache', 1120, 140, { multiAz: true }],
    ['scores', 'dynamodb', 1120, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'lb'],
    ['lb', 'game'],
    ['game', 'board'],
    ['game', 'scores'],
  ],
);

const twoRegions = makeBoard(
  [
    ['users', 'users', 80, 300],
    ['shield', 'waf', 220, 300],
    ['cdn', 'cloudfront', 360, 300, { cacheApi: true }],
    ['ga', 'globalAccelerator', 500, 300],
    ['dns', 'route53', 640, 300],
    ['lb1', 'alb', 800, 140],
    ['game1', 'ec2', 980, 140, { size: 'large', count: 2, az: 'spread' }],
    ['board1', 'elasticache', 1180, 60, { multiAz: true }],
    ['scores1', 'dynamodb', 1180, 220, { provisioned: true, size: 'medium' }],
    ['lb2', 'alb', 800, 460, { region: 'eu-west-1' }],
    ['game2', 'ec2', 980, 460, { size: 'large', count: 2, az: 'spread', region: 'eu-west-1' }],
    ['board2', 'elasticache', 1180, 380, { multiAz: true, region: 'eu-west-1' }],
    ['scores2', 'dynamodb', 1180, 540, { provisioned: true, size: 'medium', region: 'eu-west-1' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'dns'],
    ['dns', 'lb1'],
    ['dns', 'lb2'],
    ['lb1', 'game1'],
    ['game1', 'board1'],
    ['game1', 'scores1'],
    ['lb2', 'game2'],
    ['game2', 'board2'],
    ['game2', 'scores2'],
  ],
);

const finals = makeBoard(
  [
    ['users', 'users', 80, 300],
    ['shield', 'waf', 220, 300],
    ['cdn', 'cloudfront', 360, 300, { cacheApi: true }],
    ['ga', 'globalAccelerator', 500, 300],
    ['dns', 'route53', 640, 300],
    ['lb1', 'alb', 800, 140],
    ['game1', 'ec2', 980, 140, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 5 }],
    ['board1', 'elasticache', 1180, 60, { multiAz: true }],
    ['scores1', 'dynamodb', 1180, 220, { provisioned: true, size: 'medium' }],
    ['lb2', 'alb', 800, 460, { region: 'eu-west-1' }],
    [
      'game2',
      'ec2',
      980,
      460,
      {
        size: 'large',
        count: 2,
        az: 'spread',
        region: 'eu-west-1',
        autoScaling: true,
        maxCount: 6,
      },
    ],
    ['board2', 'elasticache', 1180, 380, { multiAz: true, region: 'eu-west-1' }],
    ['scores2', 'dynamodb', 1180, 540, { provisioned: true, size: 'medium', region: 'eu-west-1' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'dns'],
    ['dns', 'lb1'],
    ['dns', 'lb2'],
    ['lb1', 'game1'],
    ['game1', 'board1'],
    ['game1', 'scores1'],
    ['lb2', 'game2'],
    ['game2', 'board2'],
    ['game2', 'scores2'],
  ],
);

export const gameLeaderboard: Track = {
  id: 'game-leaderboard',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'Bảng xếp hạng game',
      pitch:
        'Backend cho một game mobile toàn cầu: bảng xếp hạng nóng, người chơi khắp thế giới, bot tấn công và cả một Region sập.',
      tags: ['ElastiCache', 'Toàn cầu', 'WAF', 'Multi-Region', 'Auto Scaling'],
    },
    en: {
      title: 'Game leaderboard',
      pitch:
        'Backend for a global mobile game: hot leaderboards, players everywhere, bot attacks and a whole Region going down.',
      tags: ['ElastiCache', 'Global', 'WAF', 'Multi-Region', 'Auto Scaling'],
    },
  },
  rounds: [
    {
      id: 'lb-hot',
      text: {
        vi: {
          title: 'Bảng xếp hạng nóng',
          story:
            'Game vừa ra mắt: 2.500 yêu cầu/giây, 92% là mở bảng xếp hạng, 8% là gửi điểm. Ai cũng xem cùng một top 100. Ngân sách $260.',
          concept:
            'Dữ liệu được đọc liên tục như bảng xếp hạng nên nằm trong ElastiCache (Redis sorted set). Cache trả phần lớn lượt đọc, DynamoDB chỉ cần nhận lượt ghi và cache miss.',
          nudge:
            'Thêm ElastiCache giữa EC2 và dữ liệu, rồi bật provisioned cho DynamoDB (kích cỡ Vừa) thay vì trả theo yêu cầu.',
        },
        en: {
          title: 'Hot leaderboard',
          story:
            'The game just launched: 2,500 requests/s, 92% opening the leaderboard and 8% posting scores. Everyone looks at the same top 100. Budget: $260.',
          concept:
            'Constantly read data like a leaderboard belongs in ElastiCache (Redis sorted sets). The cache serves most reads, so DynamoDB only takes writes and cache misses.',
          nudge:
            'Add ElastiCache next to EC2, then switch DynamoDB to provisioned (medium) instead of paying per request.',
        },
      },
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'cost-database-storage-choices'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['game', 'ec2', 480, 240, { size: 'large', count: 3, az: 'spread' }],
          ['scores', 'dynamodb', 700, 240],
        ],
        [
          ['users', 'lb'],
          ['lb', 'game'],
          ['game', 'scores'],
        ],
      ),
    },
    {
      id: 'lb-global',
      text: {
        vi: {
          title: 'Người chơi khắp thế giới',
          story:
            'Game lên top ở châu Âu: 60% người chơi ở xa us-east-1. Game thủ chê lag, mục tiêu giờ là dưới 80 ms.',
          concept:
            'CloudFront cache phản hồi API (bảng xếp hạng đổi theo giây, cache ngắn là đủ) ngay ở edge. Phần còn lại, như gửi điểm, đi qua Global Accelerator trên mạng backbone AWS.',
          nudge:
            'Người dùng → CloudFront (bật "Cache cả phản hồi API") → Global Accelerator → ALB. Edge gánh bớt lượt đọc nên 2 EC2 là đủ.',
        },
        en: {
          title: 'Players everywhere',
          story:
            'The game tops the charts in Europe: 60% of players are far from us-east-1. Gamers complain about lag; the target is now under 80 ms.',
          concept:
            'CloudFront caches API responses (a leaderboard that changes every second still caches well for a moment) at the edge. The rest, like score posts, rides the AWS backbone through Global Accelerator.',
          nudge:
            'Users → CloudFront ("Cache API responses" on) → Global Accelerator → ALB. The edge takes reads off the servers, so 2 EC2 instances are enough.',
        },
      },
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        latencyTarget: 80,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking'],
      solution: global,
      naive: cached,
    },
    {
      id: 'lb-ddos',
      text: {
        vi: {
          title: 'Bot phá giải đấu',
          story:
            'Giữa giải đấu, một botnet bơm yêu cầu rác gấp 6 lần lưu lượng thật để đánh sập máy chủ game. CloudFront tính tiền cả lưu lượng rác.',
          concept:
            'AWS WAF với rate-based rule chặn bot ở edge, trước khi chúng tới CloudFront và EC2. Shield Standard đã có sẵn cho tấn công tầng mạng; WAF lo tầng ứng dụng.',
          nudge: 'Đặt WAF ngay sau Người dùng, trước CloudFront.',
        },
        en: {
          title: 'Bots crash the tournament',
          story:
            'Mid-tournament, a botnet floods junk requests at 6× real traffic to take the game servers down. CloudFront bills the junk too.',
          concept:
            'AWS WAF with rate-based rules blocks bots at the edge, before they reach CloudFront and EC2. Shield Standard already covers network-layer floods; WAF handles the application layer.',
          nudge: 'Put WAF right after Users, in front of CloudFront.',
        },
      },
      scenario: {
        traffic: 2500,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 260,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: global,
    },
    {
      id: 'lb-cachecrash',
      text: {
        vi: {
          title: 'Cache sập giữa mùa giải',
          story:
            'Mùa giải mới: 3.600 yêu cầu/giây. Giữa trận, node ElastiCache duy nhất chết. Mọi lượt đọc dồn xuống DynamoDB và bảng quá tải.',
          concept:
            'ElastiCache Multi-AZ có replica ở AZ khác và tự động failover, nên cache không biến mất. Rẻ hơn nhiều so với nâng DynamoDB chỉ để chịu lúc cache sập.',
          nudge: 'Bật Multi-AZ cho ElastiCache và tăng EC2 lên 3 máy kích cỡ Lớn cho lưu lượng mới.',
        },
        en: {
          title: 'Cache dies mid-season',
          story:
            'New season: 3,600 requests/s. Mid-match, the only ElastiCache node dies. Every read falls through to DynamoDB and the table is overloaded.',
          concept:
            'ElastiCache Multi-AZ keeps a replica in another AZ and fails over automatically, so the cache never disappears. Much cheaper than sizing DynamoDB for a cache outage.',
          nudge: 'Turn on Multi-AZ for ElastiCache and raise EC2 to 3 large instances for the new traffic.',
        },
      },
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'cacheCrash',
        latencyTarget: 80,
        budget: 340,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: replicated,
      naive: shielded,
    },
    {
      id: 'lb-region',
      text: {
        vi: {
          title: 'Cả Region sập',
          story:
            'Một sự cố lớn làm cả us-east-1 ngừng hoạt động nhiều giờ. Người chơi ở xa vẫn chiếm 60%, nên một Region thứ hai gần họ còn giúp giảm độ trễ.',
          concept:
            'Multi-Region active-active: một bộ ALB + EC2 + ElastiCache + DynamoDB (Global Tables) ở mỗi Region. Route 53 gửi người chơi tới Region gần nhất và chuyển hết sang Region còn sống khi một Region sập.',
          nudge:
            'Thêm Route 53 sau Global Accelerator, dựng bộ thứ hai ở eu-west-1 (2 EC2 kích cỡ Lớn mỗi bên là đủ) và nối Route 53 tới cả hai ALB.',
        },
        en: {
          title: 'A whole Region fails',
          story:
            'A major incident takes us-east-1 down for hours. 60% of players are still far away, so a second Region near them also cuts latency.',
          concept:
            'Multi-Region active-active: one ALB + EC2 + ElastiCache + DynamoDB (Global Tables) stack per Region. Route 53 sends players to the nearest Region and moves everyone to the surviving one when a Region fails.',
          nudge:
            'Add Route 53 after Global Accelerator, build a second stack in eu-west-1 (2 large EC2 per side is enough) and point Route 53 at both ALBs.',
        },
      },
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'regionOutage',
        outageRegion: 'us-east-1',
        latencyTarget: 85,
        budget: 480,
        requirements: [],
      },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing', 'backup-replication'],
      solution: twoRegions,
      naive: replicated,
    },
    {
      id: 'lb-finals',
      text: {
        vi: {
          title: 'Chung kết thế giới',
          story:
            'Đêm chung kết được livestream: lưu lượng tăng gấp ba trong vài giờ rồi trở lại 3.600 yêu cầu/giây. Ngân sách $650, không đủ để chạy cả đêm với số máy của giờ cao điểm.',
          concept:
            'Auto Scaling ở mỗi Region thêm máy khi tải tăng và bớt máy khi hết đỉnh. eu-west-1 phục vụ 60% người chơi nên được phép mở rộng nhiều hơn.',
          nudge:
            'Bật Auto Scaling cho EC2 ở cả hai Region (tối đa 5 và 6).',
        },
        en: {
          title: 'World finals',
          story:
            'The final is livestreamed: traffic triples for a few hours, then drops back to 3,600 requests/s. The $650 budget cannot run peak capacity all night.',
          concept:
            'Auto Scaling in each Region adds instances as load rises and removes them after the peak. eu-west-1 serves 60% of players, so it gets more room to grow.',
          nudge:
            'Turn on Auto Scaling for EC2 in both Regions (max 5 and 6).',
        },
      },
      scenario: {
        traffic: 3600,
        mix: { read: 0.92, write: 0.08 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'flashSale',
        latencyTarget: 85,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: finals,
      naive: twoRegions,
    },
  ],
};
