import { makeBoard } from '../board';
import type { Track } from '../rounds';

type NodeSpecs = Parameters<typeof makeBoard>[0];

const onSale = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const writeBehind = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 700, 100],
    ['orders', 'sqs', 480, 420],
    ['worker', 'ec2', 700, 420, { size: 'medium', count: 3, az: 'spread' }],
    ['db', 'rds', 920, 260, { size: 'xlarge' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'db'],
    ['orders', 'worker'],
    ['worker', 'db'],
  ],
);

const scalingWorkers: NodeSpecs[number][4] = { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 4 };

/** The ticketing board from round 3 on: DynamoDB behind the order queue, with a few knobs. */
const stadium = (options: { waf?: boolean; scalingWorkers?: boolean; onDemand?: boolean }) => {
  const shield = options.waf ?? false;
  const x = shield ? 160 : 0;
  const nodes: NodeSpecs = [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280 + x, 240],
    ['web', 'ec2', 480 + x, 240, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 700 + x, 100],
    ['orders', 'sqs', 480 + x, 420],
    ['worker', 'ec2', 700 + x, 420, options.scalingWorkers ? scalingWorkers : { size: 'xlarge' }],
    ['tickets', 'dynamodb', 920 + x, 260, options.onDemand ? {} : { provisioned: true, size: 'large' }],
  ];
  const edges: [string, string][] = [
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'tickets'],
    ['orders', 'worker'],
    ['worker', 'tickets'],
  ];

  if (shield) {
    nodes.push(['shield', 'waf', 240, 240]);
    edges.push(['users', 'shield'], ['shield', 'lb']);
  } else {
    edges.push(['users', 'lb']);
  }

  return makeBoard(nodes, edges);
};

const worldTour = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240],
    ['seatmaps', 's3', 600, 80],
    ['lb', 'alb', 600, 240],
    ['web', 'ec2', 800, 240, { size: 'large', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
    ['cache', 'elasticache', 1020, 100],
    ['orders', 'sqs', 800, 420],
    ['worker', 'ec2', 1020, 420, scalingWorkers],
    ['tickets', 'dynamodb', 1240, 260, { provisioned: true, size: 'large' }],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'seatmaps'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'orders'],
    ['cache', 'tickets'],
    ['orders', 'worker'],
    ['worker', 'tickets'],
  ],
);

export const ticketing: Track = {
  id: 'ticketing',
  difficulty: 'medium',
  text: {
    vi: {
      title: 'Bán vé concert',
      pitch: 'Hàng chục nghìn fan cùng bấm "Mua" đúng giây mở bán: giữ cho hệ thống bán vé đứng vững.',
      tags: ['Flash sale', 'SQS', 'DynamoDB', 'WAF'],
    },
    en: {
      title: 'Concert tickets',
      pitch: 'Tens of thousands of fans hit "Buy" the second sales open: keep the ticketing system standing.',
      tags: ['Flash sale', 'SQS', 'DynamoDB', 'WAF'],
    },
  },
  rounds: [
    {
      id: 'tix-1-on-sale',
      text: {
        vi: {
          title: 'Mở bán show nhỏ',
          story: 'Một show 2.000 chỗ: bình thường 200 yêu cầu/giây (60% xem chỗ, 40% đặt vé), lúc mở bán tăng gấp 3. Ngân sách $140/tháng.',
          concept: 'Auto Scaling Group giúp tầng web theo kịp đợt mở bán rồi thu lại. Database không tự scale nên phải đủ lớn cho mức đỉnh, nhất là khi mỗi lượt ghi tốn RDS gấp 3 lượt đọc.',
          nudge: 'Người dùng → ALB → EC2 cỡ Vừa (bật Auto Scaling Group, tối đa 4) → RDS cỡ Lớn.',
        },
        en: {
          title: 'A small show goes on sale',
          story: 'A 2,000-seat show: normally 200 requests/s (60% browsing seats, 40% booking), tripling when sales open. Budget $140/month.',
          concept: 'An Auto Scaling Group lets the web tier follow the on-sale rush and shrink afterwards. The database does not scale by itself, so size it for the peak; each write costs RDS three reads.',
          nudge: 'Users → ALB → EC2 Medium (Auto Scaling Group on, max 4) → RDS Large.',
        },
      },
      scenario: {
        traffic: 200,
        mix: { read: 0.6, write: 0.4 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 140,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: onSale,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium' }],
          ['db', 'rds', 700, 240, { size: 'large' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'tix-2-write-behind',
      text: {
        vi: {
          title: 'Xếp hàng lượt đặt vé',
          story: 'Show sân vận động: 900 yêu cầu/giây, 60% là đặt vé. Lúc mở bán, lượt ghi tăng gấp 3 và vượt sức cả RDS cỡ Rất lớn. Nhưng tính trung bình cả buổi thì RDS Rất lớn vẫn ghi kịp. Ngân sách $460/tháng.',
          concept: 'Write-behind: máy chủ web không ghi thẳng vào database mà đẩy lượt đặt vé vào SQS, worker ghi vào RDS với tốc độ đều. Lượt đọc đi qua ElastiCache, chỉ phần trượt cache mới xuống RDS. Hàng đợi biến đỉnh nhọn thành dòng chảy đều.',
          nudge: 'Bỏ cạnh EC2 web → RDS. Nối web → ElastiCache → RDS (đọc) và web → SQS → EC2 worker (cỡ Vừa, 3 máy) → RDS (ghi).',
        },
        en: {
          title: 'Queue the bookings',
          story: 'A stadium show: 900 requests/s, 60% of them bookings. When sales open, writes triple and overwhelm even an XLarge RDS. Averaged over the round, though, XLarge keeps up. Budget $460/month.',
          concept: 'Write-behind: web servers do not write to the database; they put bookings on SQS and workers write them to RDS at a steady pace. Reads go through ElastiCache, and only misses reach RDS. The queue turns a sharp spike into a steady stream.',
          nudge: 'Remove web EC2 → RDS. Connect web → ElastiCache → RDS (reads) and web → SQS → worker EC2 (Medium ×3) → RDS (writes).',
        },
      },
      scenario: {
        traffic: 900,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 460,
        requirements: [],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'nosql-caching'],
      solution: writeBehind,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 2, az: 'spread', autoScaling: true, maxCount: 8 }],
          ['db', 'rds', 700, 240, { size: 'xlarge' }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'tix-3-dynamodb',
      text: {
        vi: {
          title: 'Chuyển sang DynamoDB',
          story: 'Tour diễn toàn quốc: 2.000 yêu cầu/giây, vẫn 60% đặt vé, mở bán gấp 3. Dù có hàng đợi, tốc độ ghi trung bình đã vượt sức RDS lớn nhất. Ngân sách $650/tháng.',
          concept: 'DynamoDB scale ngang gần như không giới hạn. Chọn chế độ capacity theo dạng tải: On-demand cho tải khó đoán, Provisioned rẻ hơn nhiều khi tải đều, và worker đứng sau hàng đợi chính là tải đều.',
          nudge: 'Thay RDS bằng DynamoDB, bật Provisioned capacity cỡ Lớn. Worker: một máy cỡ Rất lớn. EC2 web cỡ Lớn, tối thiểu 2, tối đa 8.',
        },
        en: {
          title: 'Move to DynamoDB',
          story: 'A national tour: 2,000 requests/s, still 60% bookings, 3× when sales open. Even with the queue, the average write rate is more than the biggest RDS can take. Budget $650/month.',
          concept: 'DynamoDB scales out almost without limit. Pick the capacity mode by the shape of the load: on-demand for unpredictable load, provisioned for steady load at a much lower price. Workers behind a queue are exactly that steady load.',
          nudge: 'Replace RDS with DynamoDB and turn on Provisioned capacity, Large. Worker: one XLarge instance. Web EC2 Large, min 2, max 8.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: stadium({}),
      naive: stadium({ onDemand: true }),
    },
    {
      id: 'tix-4-bots',
      text: {
        vi: {
          title: 'Bot gom vé',
          story: 'Phe vé dùng botnet bắn yêu cầu gấp 6 lần lưu lượng thật để gom vé. Máy chủ web bị nhấn chìm và fan thật không mua được.',
          concept: 'AWS WAF với rate-based rule chặn bot ở vòng ngoài, trước khi chúng tới ALB và máy chủ. Rẻ hơn nhiều so với thêm máy để gánh lưu lượng rác.',
          nudge: 'Đặt WAF ngay sau Người dùng, trước ALB.',
        },
        en: {
          title: 'Scalper bots',
          story: 'Scalpers aim a botnet at the sale, sending 6× the real traffic to grab tickets. The web servers drown and real fans cannot buy.',
          concept: 'AWS WAF rate-based rules stop bots at the edge, before they reach the ALB and the servers. Much cheaper than adding servers to absorb junk traffic.',
          nudge: 'Put WAF right after Users, in front of the ALB.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.4, write: 0.6 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 300,
        budget: 650,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: stadium({ waf: true }),
      naive: stadium({}),
    },
    {
      id: 'tix-5-e-tickets',
      text: {
        vi: {
          title: 'Gửi vé điện tử',
          story: 'Mỗi vé bán ra cần tạo vé điện tử có mã QR và gửi email: 40% yêu cầu giờ là việc nặng đi qua hàng đợi. Một worker không xả kịp, mà mọi vé phải được gửi trước khi hết buổi.',
          concept: 'Worker cũng cần scale: mỗi việc nặng tốn worker gấp 3 một lượt ghi. Auto Scaling Group cho worker tự thêm máy khi hàng đợi dồn lại (thực tế thường scale theo số message trong SQS).',
          nudge: 'Đổi worker sang cỡ Lớn, tối thiểu 2, tối đa 4, bật Auto Scaling Group.',
        },
        en: {
          title: 'Sending e-tickets',
          story: 'Every ticket sold needs a QR e-ticket generated and emailed: 40% of requests are now heavy jobs on the queue. One worker cannot keep up, and every ticket must go out before the round ends.',
          concept: 'Workers need to scale too: a heavy job costs a worker three times a write. An Auto Scaling Group for workers adds instances when the queue backs up (in practice, scale on SQS queue depth).',
          nudge: 'Switch the worker to Large, min 2, max 4, with the Auto Scaling Group on.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.2, write: 0.4, job: 0.4 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 720,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'auto-scaling'],
      solution: stadium({ waf: true, scalingWorkers: true }),
      naive: stadium({ waf: true }),
    },
    {
      id: 'tix-6-world-tour',
      text: {
        vi: {
          title: 'World tour',
          story: 'Tour vòng quanh thế giới: 2.000 yêu cầu/giây, 60% fan ở châu Âu, mở bán gấp 3. Một phần tư yêu cầu là tải sơ đồ chỗ ngồi (file tĩnh). Mục tiêu dưới 100 ms.',
          concept: 'CloudFront trả file tĩnh từ S3 ngay ở edge gần fan và đưa phần còn lại về origin qua mạng AWS nhanh hơn. Máy chủ web không phải phục vụ file tĩnh nữa.',
          nudge: 'Thêm CloudFront sau WAF: nối CloudFront → S3 (sơ đồ chỗ ngồi) và CloudFront → ALB.',
        },
        en: {
          title: 'World tour',
          story: 'A world tour: 2,000 requests/s, 60% of fans in Europe, 3× when sales open. A quarter of requests download seat maps (static files). The target is under 100 ms.',
          concept: 'CloudFront serves static files from S3 at an edge near each fan and carries the rest to the origin over the faster AWS network. The web servers no longer serve static files.',
          nudge: 'Add CloudFront after WAF: connect CloudFront → S3 (seat maps) and CloudFront → ALB.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.2, write: 0.3, job: 0.25, static: 0.25 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'flashSale',
        latencyTarget: 100,
        budget: 760,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: ['edge-networking', 'decoupling-messaging'],
      solution: worldTour,
      naive: stadium({ waf: true, scalingWorkers: true }),
    },
  ],
};
