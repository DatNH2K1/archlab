import { makeBoard } from '../board';
import type { Track } from '../rounds';

const single = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['web', 'ec2', 340, 240, { size: 'medium' }],
    ['db', 'rds', 600, 240, { size: 'medium' }],
  ],
  [
    ['users', 'web'],
    ['web', 'db'],
  ],
);

const balanced = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'medium', count: 3 }],
    ['db', 'rds', 700, 240, { size: 'large' }],
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
    ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread', autoScaling: true, maxCount: 4 }],
    ['db', 'rds', 700, 240, { size: 'large', multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const cached = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
    ['cache', 'elasticache', 700, 120],
    ['db', 'rds', 700, 340, { size: 'medium', multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const scaling = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 }],
    ['cache', 'elasticache', 700, 120, { size: 'medium' }],
    ['db', 'rds', 700, 340, { size: 'large', multiAz: true }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const launch = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'xlarge', count: 1, az: 'spread', autoScaling: true, maxCount: 3 }],
    ['cache', 'elasticache', 700, 100, { size: 'medium' }],
    ['db', 'rds', 700, 260, { size: 'large', multiAz: true }],
    ['orders', 'sqs', 480, 420],
    ['worker', 'ec2', 700, 420, { size: 'xlarge' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'orders'],
    ['orders', 'worker'],
  ],
);

export const ecommerce: Track = {
  id: 'ecommerce',
  difficulty: 'medium',
  text: {
    vi: {
      title: 'Cửa hàng online',
      pitch: 'Từ một máy chủ tới ngày ra mắt: xây shop 3 tầng chịu được sự cố AZ, flash sale và cơn mưa đơn hàng.',
      tags: ['3 tầng', 'Multi-AZ', 'Auto Scaling', 'Cache', 'SQS'],
    },
    en: {
      title: 'Online shop',
      pitch: 'From one server to launch day: grow a 3-tier shop that survives an AZ outage, a flash sale and a flood of orders.',
      tags: ['3-tier', 'Multi-AZ', 'Auto Scaling', 'Caching', 'SQS'],
    },
  },
  rounds: [
    {
      id: 'shop-1-mvp',
      text: {
        vi: {
          title: 'Mở cửa hàng',
          story: 'Shop đồ thủ công mở bán: 250 yêu cầu/giây, 80% là xem sản phẩm (đọc), 20% là thêm vào giỏ và đặt hàng (ghi). Ngân sách $70/tháng.',
          concept: 'Kiến trúc cơ bản: máy chủ EC2 chạy code, RDS lưu dữ liệu. Chọn kích cỡ theo tải, và nhớ rằng mỗi lượt ghi tốn RDS gấp 3 lượt đọc.',
          nudge: 'Người dùng → EC2 → RDS. Kích cỡ Nhỏ không đủ cho cả hai: thử kích cỡ Vừa.',
        },
        en: {
          title: 'Open the shop',
          story: 'A handmade-goods shop opens: 250 requests/s, 80% browsing products (reads) and 20% carts and orders (writes). Budget $70/month.',
          concept: 'The basic setup: EC2 servers run the code, RDS stores the data. Size each for its load, and remember a write costs RDS three times as much as a read.',
          nudge: 'Users → EC2 → RDS. Small is too small for both: try Medium.',
        },
      },
      scenario: { traffic: 250, mix: { read: 0.8, write: 0.2 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 70, requirements: [] },
      unlocks: [],
      lessons: ['ec2-compute', 'relational-databases'],
      solution: single,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 340, 240],
          ['db', 'rds', 600, 240],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-2-scale-out',
      text: {
        vi: {
          title: 'Thêm máy chủ',
          story: 'Shop lên báo: 1.200 yêu cầu/giây. Một máy chủ Lớn chịu đúng 1.200 đơn vị/giây, chưa tính lúc lưu lượng dao động. Ngân sách $178/tháng.',
          concept: 'Scale ngang thay vì scale dọc: đặt ALB phía trước và chia tải cho nhiều EC2 nhỏ hơn. Vài máy Vừa rẻ hơn một máy Rất lớn và không còn là một điểm lỗi duy nhất.',
          nudge: 'Người dùng → ALB → EC2 cỡ Vừa (3 máy) → RDS cỡ Lớn.',
        },
        en: {
          title: 'Scale out',
          story: 'The shop gets press: 1,200 requests/s. A Large server handles exactly 1,200 units/s before traffic even wobbles. Budget $178/month.',
          concept: 'Scale out instead of up: put an ALB in front and spread the load over several smaller EC2 instances. A few Medium servers cost less than one XLarge and stop being a single point of failure.',
          nudge: 'Users → ALB → EC2 Medium ×3 → RDS Large.',
        },
      },
      scenario: { traffic: 1200, mix: { read: 0.85, write: 0.15 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 178, requirements: [] },
      unlocks: [],
      lessons: ['elastic-load-balancing', 'ec2-compute'],
      solution: balanced,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 340, 240, { size: 'large' }],
          ['db', 'rds', 600, 240, { size: 'large' }],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-3-az-outage',
      text: {
        vi: {
          title: 'Mất một AZ',
          story: 'Vẫn 1.200 yêu cầu/giây, nhưng hôm nay AZ us-east-1a mất điện gần nửa buổi, mà mọi máy chủ lẫn database đều nằm ở AZ a. Ngân sách $320/tháng.',
          concept: 'Sẵn sàng cao: trải EC2 qua 2 AZ trong một Auto Scaling Group để nhóm tự thay máy chết bằng máy mới ở AZ còn sống, và bật Multi-AZ cho RDS để tự chuyển sang bản dự phòng.',
          nudge: 'EC2 cỡ Vừa, 4 máy, AZ "Cả a và b", bật Auto Scaling Group (tối đa 4). RDS cỡ Lớn bật Multi-AZ.',
        },
        en: {
          title: 'Losing an AZ',
          story: 'Still 1,200 requests/s, but today us-east-1a loses power for almost half the round, and every server and the database live in AZ a. Budget $320/month.',
          concept: 'High availability: spread EC2 over 2 AZs in an Auto Scaling Group so it replaces dead instances in the surviving AZ, and turn on RDS Multi-AZ for automatic failover.',
          nudge: 'EC2 Medium ×4, AZ "AZ a+b", Auto Scaling Group on (max 4). RDS Large with Multi-AZ.',
        },
      },
      scenario: {
        traffic: 1200,
        mix: { read: 0.85, write: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 250,
        budget: 320,
        requirements: [],
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'auto-scaling'],
      solution: multiAz,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'medium', count: 4, az: 'spread' }],
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
      id: 'shop-4-catalog-cache',
      text: {
        vi: {
          title: 'Cache danh mục sản phẩm',
          story: 'Mùa mua sắm: 2.000 yêu cầu/giây, 95% là xem danh mục và trang sản phẩm, những dữ liệu được đọc đi đọc lại. Để RDS gánh hết thì cần cỡ Rất lớn có Multi-AZ, vượt xa ngân sách $230/tháng.',
          concept: 'Dữ liệu đọc nhiều, ít thay đổi nên được cache: ElastiCache trả ~85% lượt đọc chỉ trong vài ms, RDS chỉ còn nhận phần trượt cache và lượt ghi.',
          nudge: 'Nối EC2 → ElastiCache và giữ EC2 → RDS. RDS giờ chỉ cần cỡ Vừa; EC2 dùng 2 máy cỡ Lớn.',
        },
        en: {
          title: 'Cache the catalog',
          story: 'Holiday season: 2,000 requests/s, 95% browsing the catalog and product pages, the same data read over and over. Making RDS carry it all takes XLarge with Multi-AZ, far over the $230/month budget.',
          concept: 'Read-heavy, rarely changing data belongs in a cache: ElastiCache answers ~85% of reads in a few ms, so RDS only sees cache misses and writes.',
          nudge: 'Connect EC2 → ElastiCache and keep EC2 → RDS. RDS can now be Medium; use 2 Large EC2 instances.',
        },
      },
      scenario: { traffic: 2000, mix: { read: 0.95, write: 0.05 }, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 230, requirements: [] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
          ['db', 'rds', 700, 240, { size: 'xlarge', multiAz: true }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-5-flash-sale',
      text: {
        vi: {
          title: 'Flash sale nửa đêm',
          story: 'Bình thường 2.000 yêu cầu/giây; flash sale nửa đêm đẩy lưu lượng lên gấp 3 trong khoảng một phần ba buổi. Giữ đủ máy cho mức đỉnh suốt ngày sẽ vượt ngân sách $480/tháng.',
          concept: 'Auto Scaling Group theo target tracking: thêm máy khi tải vượt ~60%, bớt máy khi sale kết thúc. Cache và database không tự scale nên phải đủ lớn cho giờ cao điểm.',
          nudge: 'EC2 cỡ Lớn, tối thiểu 3, tối đa 8, bật Auto Scaling Group. ElastiCache cỡ Vừa, RDS cỡ Lớn.',
        },
        en: {
          title: 'Midnight flash sale',
          story: 'Normally 2,000 requests/s; the midnight flash sale triples it for about a third of the round. Keeping enough servers for the peak all day blows the $480/month budget.',
          concept: 'An Auto Scaling Group with target tracking adds instances when load passes ~60% and removes them after the sale. The cache and database do not scale by themselves, so size them for the peak.',
          nudge: 'EC2 Large, min 3, max 8, Auto Scaling Group on. ElastiCache Medium, RDS Large.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.95, write: 0.05 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 250,
        budget: 480,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: scaling,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['lb', 'alb', 280, 240],
          ['web', 'ec2', 480, 240, { size: 'large', count: 6, az: 'spread' }],
          ['cache', 'elasticache', 700, 120, { size: 'medium' }],
          ['db', 'rds', 700, 340, { size: 'large', multiAz: true }],
        ],
        [
          ['users', 'lb'],
          ['lb', 'web'],
          ['web', 'cache'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'shop-6-launch-day',
      text: {
        vi: {
          title: 'Ngày ra mắt',
          story: 'Ra mắt bộ sưu tập mới: 2.000 yêu cầu/giây, flash sale gấp 3, và 20% yêu cầu là đặt hàng (thanh toán, trừ kho, gửi email), mỗi đơn mất 400 ms nếu xử lý ngay. Mục tiêu dưới 150 ms, và mọi đơn phải xử lý xong trước khi hết buổi.',
          concept: 'Tách xử lý đơn hàng khỏi luồng web: web đẩy đơn vào SQS rồi trả lời ngay, worker lấy đơn ra xử lý theo nhịp của mình. Hàng đợi hấp thụ đỉnh sale nên worker không cần lớn bằng mức đỉnh.',
          nudge: 'EC2 web → SQS → EC2 worker (một máy cỡ Rất lớn đủ xả hàng đợi sau đợt sale). Web vẫn nối ElastiCache và RDS.',
        },
        en: {
          title: 'Launch day',
          story: 'The new collection launches: 2,000 requests/s, a 3× flash sale, and 20% of requests are orders (payment, stock, emails) that take 400 ms each when done inline. The target is under 150 ms, and every order must be processed before the round ends.',
          concept: 'Take order processing out of the web path: the web tier puts orders on SQS and answers at once, and workers process them at their own pace. The queue absorbs the sale peak, so workers need not be peak-sized.',
          nudge: 'Web EC2 → SQS → worker EC2 (one XLarge is enough to drain the queue after the sale). Keep web → ElastiCache and RDS.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.75, write: 0.05, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 150,
        budget: 620,
        requirements: ['drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'auto-scaling'],
      solution: launch,
      naive: scaling,
    },
  ],
};
