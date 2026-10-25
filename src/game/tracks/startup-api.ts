import { makeBoard } from '../board';
import type { Track } from '../rounds';

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 280, 240],
    ['fn', 'lambda', 480, 240],
    ['db', 'dynamodb', 680, 240],
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'db'],
  ],
);

const servers = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large' }],
    ['db', 'dynamodb', 680, 240, { provisioned: true, size: 'medium' }],
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
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread' }],
    ['db', 'dynamodb', 680, 240, { provisioned: true, size: 'medium' }],
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
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const reserved = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    ['web', 'ec2', 480, 240, { size: 'large', count: 2, az: 'spread', pricing: 'reserved' }],
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

const burst = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 280, 240],
    [
      'web',
      'ec2',
      480,
      240,
      {
        size: 'large',
        count: 2,
        az: 'spread',
        pricing: 'reserved',
        autoScaling: true,
        maxCount: 4,
      },
    ],
    ['cache', 'elasticache', 700, 140],
    ['db', 'dynamodb', 700, 320, { provisioned: true, size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
  ],
);

export const startupApi: Track = {
  id: 'startup-api',
  difficulty: 'easy',
  text: {
    vi: {
      title: 'API của startup',
      pitch:
        'Đi cùng một API từ ngày ra mắt tới khi có hàng nghìn yêu cầu mỗi giây, và giữ hoá đơn trong tầm kiểm soát.',
      tags: ['Serverless', 'EC2 + ALB', 'Multi-AZ', 'Cache', 'Reserved'],
    },
    en: {
      title: 'Startup API',
      pitch: 'Grow one API from launch day to thousands of requests per second, and keep the bill under control.',
      tags: ['Serverless', 'EC2 + ALB', 'Multi-AZ', 'Caching', 'Reserved'],
    },
  },
  rounds: [
    {
      id: 'sapi-launch',
      text: {
        vi: {
          title: 'Ngày ra mắt',
          story: 'API vừa lên sóng: khoảng 80 yêu cầu/giây, 70% đọc và 30% ghi. Tiền còn ít, ngân sách chỉ $15/tháng.',
          concept:
            'Lưu lượng nhỏ và chưa ổn định hợp với serverless: API Gateway + Lambda + DynamoDB on-demand chỉ tính tiền theo yêu cầu, không trả cho máy chủ ngồi chờ.',
          nudge: 'Người dùng → API Gateway → Lambda → DynamoDB. Một EC2 + RDS kích cỡ Nhỏ đã tốn $30.',
        },
        en: {
          title: 'Launch day',
          story: 'The API just went live: about 80 requests/s, 70% reads and 30% writes. Money is tight: $15/month.',
          concept:
            'Small, uneven traffic suits serverless: API Gateway + Lambda + on-demand DynamoDB bill per request, with no idle servers to pay for.',
          nudge: 'Users → API Gateway → Lambda → DynamoDB. A small EC2 + RDS already costs $30.',
        },
      },
      scenario: {
        traffic: 80,
        mix: { read: 0.7, write: 0.3 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 15,
        requirements: [],
      },
      unlocks: [],
      lessons: ['serverless-workflows', 'cost-compute-serverless-containers'],
      solution: serverless,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240],
          ['db', 'rds', 560, 240],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'sapi-growth',
      text: {
        vi: {
          title: 'Lưu lượng ổn định',
          story:
            'Sản phẩm bắt đầu có khách: 900 yêu cầu/giây suốt ngày đêm. Hoá đơn serverless đã vượt $130 trong khi ngân sách là $120.',
          concept:
            'Tiền theo yêu cầu tăng tuyến tính với lưu lượng. Khi tải cao và đều, EC2 sau ALB cùng DynamoDB provisioned (trả cố định) rẻ hơn Lambda và DynamoDB on-demand.',
          nudge:
            'Thay API Gateway + Lambda bằng ALB → một EC2 kích cỡ Lớn, và bật provisioned cho DynamoDB (kích cỡ Vừa).',
        },
        en: {
          title: 'Steady traffic',
          story:
            'Customers arrive: 900 requests/s around the clock. The serverless bill is past $130 and the budget is $120.',
          concept:
            'Per-request pricing grows linearly with traffic. Under high, steady load, EC2 behind an ALB plus provisioned DynamoDB (flat price) beats Lambda and on-demand DynamoDB.',
          nudge: 'Replace API Gateway + Lambda with ALB → one large EC2, and switch DynamoDB to provisioned (medium).',
        },
      },
      scenario: {
        traffic: 900,
        mix: { read: 0.8, write: 0.2 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 120,
        requirements: [],
      },
      unlocks: [],
      lessons: ['cost-compute-serverless-containers', 'cost-database-storage-choices'],
      solution: servers,
      naive: serverless,
    },
    {
      id: 'sapi-az',
      text: {
        vi: {
          title: 'Mất một AZ',
          story:
            'Khách doanh nghiệp đòi cam kết uptime. Đúng tuần đó một AZ gặp sự cố và máy chủ duy nhất nằm trong AZ ấy.',
          concept:
            'Multi-AZ: chạy ít nhất hai máy chủ ở hai AZ sau ALB. Mỗi AZ phải tự gánh được toàn bộ 900 yêu cầu/giây khi AZ kia mất. DynamoDB vốn đã nhân bản qua nhiều AZ.',
          nudge: 'Đặt EC2 thành 2 máy kích cỡ Lớn, AZ "Cả a và b".',
        },
        en: {
          title: 'An AZ goes down',
          story:
            'Business customers want an uptime promise. That same week an AZ fails, and the only server lives in it.',
          concept:
            'Multi-AZ: run at least two servers in two AZs behind the ALB. Each AZ must carry all 900 requests/s alone when the other is gone. DynamoDB already replicates across AZs.',
          nudge: 'Set EC2 to 2 large instances in "AZ a+b".',
        },
      },
      scenario: {
        traffic: 900,
        mix: { read: 0.8, write: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'azOutage',
        latencyTarget: 300,
        budget: 180,
        requirements: [],
      },
      unlocks: [],
      lessons: ['high-availability-multi-az', 'elastic-load-balancing'],
      solution: multiAz,
      naive: servers,
    },
    {
      id: 'sapi-cache',
      text: {
        vi: {
          title: 'Đọc nhiều hơn ghi',
          story:
            'Có thêm ứng dụng di động: 2.000 yêu cầu/giây, 90% là đọc lại cùng dữ liệu. Bảng DynamoDB kích cỡ Vừa quá tải, lên kích cỡ Lớn thì vượt ngân sách $200.',
          concept:
            'ElastiCache trước database giữ dữ liệu nóng trong bộ nhớ: khoảng 85% lượt đọc không chạm tới DynamoDB, nên bảng nhỏ vẫn đủ.',
          nudge:
            'Thêm ElastiCache (kích cỡ Nhỏ) và nối EC2 → ElastiCache, giữ cạnh EC2 → DynamoDB cho lượt ghi và cache miss.',
        },
        en: {
          title: 'More reads than writes',
          story:
            'A mobile app joins: 2,000 requests/s, 90% re-reading the same data. The medium DynamoDB table is overloaded, and a large one blows the $200 budget.',
          concept:
            'ElastiCache in front of the database keeps hot data in memory: about 85% of reads never touch DynamoDB, so a small table is enough.',
          nudge:
            'Add a small ElastiCache and connect EC2 → ElastiCache; keep EC2 → DynamoDB for writes and cache misses.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 300,
        budget: 200,
        requirements: [],
      },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: cached,
      naive: multiAz,
    },
    {
      id: 'sapi-reserved',
      text: {
        vi: {
          title: 'Cắt hoá đơn',
          story:
            'Nhà đầu tư muốn hoá đơn dưới $145/tháng. Tải vẫn 2.000 yêu cầu/giây, đều đặn 24/7. Ai đó đề xuất Spot, nhưng AWS có thể thu hồi Spot bất cứ lúc nào.',
          concept:
            'Tải nền ổn định và chạy lâu dài nên dùng Reserved Instances (hoặc Savings Plans): rẻ hơn khoảng 40% mà không bị thu hồi như Spot. Spot chỉ dành cho việc chịu được gián đoạn.',
          nudge: 'Đổi kiểu giá của EC2 sang Reserved. Đừng dùng Spot cho máy chủ API.',
        },
        en: {
          title: 'Cut the bill',
          story:
            'Investors want the bill under $145/month. Load is still 2,000 requests/s, steady 24/7. Someone suggests Spot, but AWS can reclaim Spot at any moment.',
          concept:
            'Steady, long-running base load belongs on Reserved Instances (or Savings Plans): about 40% cheaper and never reclaimed like Spot. Spot is only for work that tolerates interruption.',
          nudge: 'Switch the EC2 pricing to Reserved. Do not run the API on Spot.',
        },
      },
      scenario: {
        traffic: 2000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'spotInterruption',
        latencyTarget: 300,
        budget: 145,
        requirements: [],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'cost-management-tools'],
      solution: reserved,
      naive: cached,
    },
    {
      id: 'sapi-peak',
      text: {
        vi: {
          title: 'Chiến dịch khuyến mãi',
          story:
            'Ngày thường chỉ 1.000 yêu cầu/giây, nhưng chiến dịch khuyến mãi đẩy lưu lượng lên gấp ba trong vài giờ. Ngân sách $195.',
          concept:
            'Kết hợp mô hình giá: Reserved cho phần tải nền luôn có, Auto Scaling thêm máy on-demand cho đỉnh ngắn. Mua Reserved cho cả đỉnh là trả tiền cho máy ngồi không.',
          nudge:
            'Giữ 2 máy Reserved làm nền và bật Auto Scaling cho EC2 (tối đa 4).',
        },
        en: {
          title: 'Promo campaign',
          story: 'A normal day is 1,000 requests/s, but a promo triples traffic for a few hours. Budget: $195.',
          concept:
            'Mix pricing models: Reserved for the base load that is always there, Auto Scaling adds on-demand instances for short peaks. Reserving for the peak pays for idle servers.',
          nudge:
            'Keep 2 Reserved instances as the base and turn on Auto Scaling for EC2 (max 4).',
        },
      },
      scenario: {
        traffic: 1000,
        mix: { read: 0.9, write: 0.1 },
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 300,
        budget: 195,
        requirements: [],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'ec2-pricing-models'],
      solution: burst,
      naive: reserved,
    },
  ],
};
