import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 300, 240],
    ['fn', 'lambda', 520, 240],
    ['table', 'dynamodb', 740, 240],
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'table'],
  ],
);

const fleet = (web: Cfg, table: Cfg) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['lb', 'alb', 300, 240],
      ['web', 'ec2', 520, 240, web],
      ['table', 'dynamodb', 740, 240, table],
    ],
    [
      ['users', 'lb'],
      ['lb', 'web'],
      ['web', 'table'],
    ],
  );

const steady = fleet({ size: 'large', count: 2 }, { provisioned: true, size: 'large' });

const buffered = (worker: Cfg, table: Cfg) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['api', 'apiGateway', 280, 240],
      ['queue', 'sqs', 480, 240],
      ['worker', 'ec2', 680, 240, worker],
      ['table', 'dynamodb', 880, 240, table],
    ],
    [
      ['users', 'api'],
      ['api', 'queue'],
      ['queue', 'worker'],
      ['worker', 'table'],
    ],
  );

const storm = buffered({ size: 'large', count: 3 }, { provisioned: true, size: 'large' });
const growth = buffered({ size: 'large', count: 2, autoScaling: true, maxCount: 5 }, { provisioned: true, size: 'xlarge' });

const dashboards = (o: { cache?: Cfg; worker: Cfg; table: Cfg }) =>
  makeBoard(
    [
      ['users', 'users', 80, 300],
      ['api', 'apiGateway', 280, 300],
      ['queue', 'sqs', 480, 160],
      ['worker', 'ec2', 680, 160, o.worker],
      ['table', 'dynamodb', 880, 300, o.table],
      ['dash', 'ec2', 480, 440, { size: 'large', count: 2 }],
      ...(o.cache ? [['cache', 'elasticache', 680, 440, o.cache] as const] : []),
    ] as Parameters<typeof makeBoard>[0],
    [
      ['users', 'api'],
      ['api', 'queue'],
      ['api', 'dash'],
      ['dash', 'queue'],
      ['queue', 'worker'],
      ['worker', 'table'],
      ...(o.cache
        ? ([
            ['dash', 'cache'],
            ['cache', 'table'],
          ] as [string, string][])
        : ([['dash', 'table']] as [string, string][])),
    ],
  );

const worker: Cfg = { size: 'large', count: 4 };
const table: Cfg = { provisioned: true, size: 'large' };
const dash = dashboards({ cache: {}, worker, table });
const resilient = dashboards({ cache: { multiAz: true }, worker, table });

export const iotTelemetry: Track = {
  id: 'iot-telemetry',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'Thu thập dữ liệu IoT',
      pitch: 'Hàng nghìn cảm biến gửi số đo mỗi giây; hãy ghi hết vào database và vẽ dashboard mà không đánh rơi dữ liệu nào.',
      tags: ['DynamoDB', 'SQS', 'Auto Scaling', 'ElastiCache'],
    },
    en: {
      title: 'IoT telemetry',
      pitch: 'Thousands of sensors report every second; store every reading and power the dashboards without losing data.',
      tags: ['DynamoDB', 'SQS', 'Auto Scaling', 'ElastiCache'],
    },
  },
  rounds: [
    {
      id: 'iot-1-pilot',
      text: {
        vi: {
          title: 'Thí điểm',
          story: 'Vài trăm cảm biến trong một nhà máy gửi 200 số đo/giây, toàn là ghi. Ngân sách $45/tháng.',
          concept: 'Mỗi số đo là một bản ghi nhỏ theo khoá thiết bị + thời gian: hợp với DynamoDB. Ở mức tải nhỏ, API Gateway + Lambda + DynamoDB on-demand rẻ và không cần quản lý máy chủ.',
          nudge: 'Người dùng → API Gateway → Lambda → DynamoDB. RDS Nhỏ không chịu nổi 200 lượt ghi/giây.',
        },
        en: {
          title: 'Pilot',
          story: 'A few hundred sensors in one factory send 200 readings/s, all writes. Budget $45/month.',
          concept: 'Each reading is a small item keyed by device and time: a natural fit for DynamoDB. At low load, API Gateway + Lambda + on-demand DynamoDB is cheap and serverless.',
          nudge: 'Users → API Gateway → Lambda → DynamoDB. A Small RDS cannot take 200 writes/s.',
        },
      },
      scenario: { traffic: 200, mix: { write: 1 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 45, requirements: [] },
      unlocks: [],
      lessons: ['serverless-workflows'],
      solution: serverless,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 360, 240],
          ['db', 'rds', 640, 240],
        ],
        [
          ['users', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'iot-2-steady',
      text: {
        vi: {
          title: 'Lưu lượng đều đặn',
          story: 'Cả chuỗi nhà máy đã kết nối: 1.500 lượt ghi/giây, đều đặn suốt ngày đêm. Một hàm Lambda không gánh nổi, và trả theo từng yêu cầu trên DynamoDB giờ quá đắt. Ngân sách $250/tháng.',
          concept: 'Lưu lượng đều và dự đoán được thì DynamoDB provisioned capacity (trả cố định theo WCU/RCU) rẻ hơn nhiều so với on-demand.',
          nudge: 'ALB → 2 EC2 Lớn → DynamoDB, bật Provisioned capacity với kích cỡ Lớn.',
        },
        en: {
          title: 'Steady stream',
          story: 'The whole factory chain is online: 1,500 writes/s, steady day and night. One Lambda cannot keep up, and paying per request on DynamoDB is now too expensive. Budget $250/month.',
          concept: 'For steady, predictable traffic, DynamoDB provisioned capacity (a fixed price per WCU/RCU) is much cheaper than on-demand.',
          nudge: 'ALB → 2 Large EC2 → DynamoDB with Provisioned capacity, size Large.',
        },
      },
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, latencyTarget: 150, budget: 250, requirements: [] },
      unlocks: [],
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: steady,
      naive: fleet({ size: 'large', count: 2 }, {}),
    },
    {
      id: 'iot-3-storm',
      text: {
        vi: {
          title: 'Cơn bão kết nối lại',
          story: 'Sau một bản cập nhật firmware, mọi thiết bị kết nối lại cùng lúc và gửi bù dữ liệu: lưu lượng gấp ba trong vài phút. Nâng database cho đỉnh thì vượt ngân sách $400/tháng.',
          concept: 'Đặt SQS làm vùng đệm: API Gateway ghi thẳng vào hàng đợi, worker lấy ra với tốc độ database chịu được. Đỉnh bị dàn đều ra theo thời gian, database giữ nguyên kích cỡ.',
          nudge: 'Người dùng → API Gateway → SQS → 3 EC2 worker Lớn → DynamoDB (Provisioned, Lớn).',
        },
        en: {
          title: 'Reconnect storm',
          story: 'After a firmware update every device reconnects at once and replays its data: traffic triples for a few minutes. Sizing the database for the peak blows the $400/month budget.',
          concept: 'Use SQS as a buffer: API Gateway writes straight into the queue and workers pull at the pace the database can take. The spike is spread out over time and the database keeps its size.',
          nudge: 'Users → API Gateway → SQS → 3 Large EC2 workers → DynamoDB (Provisioned, Large).',
        },
      },
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'flashSale', latencyTarget: 150, budget: 400, requirements: [] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: storm,
      naive: fleet({ size: 'large', count: 2, autoScaling: true, maxCount: 5 }, { provisioned: true, size: 'large' }),
    },
    {
      id: 'iot-4-growth',
      text: {
        vi: {
          title: 'Tăng trưởng nóng',
          story: 'Hợp đồng mới đưa thêm thiết bị lên mỗi ngày: lưu lượng tăng dần từ 1.500 lên 6.000 lượt ghi/giây trong vòng chơi. Hàng đợi phải trống khi hết vòng, không số đo nào được nằm chờ mãi.',
          concept: 'Hàng đợi chỉ hoãn việc, không làm biến mất việc. Khi tải tăng mãi, nhóm worker phải tự lớn theo (Auto Scaling) và database phải đủ chỗ cho tốc độ ghi cuối cùng.',
          nudge: 'Bật Auto Scaling Group cho worker (2 máy, tối đa 5) và nâng DynamoDB lên kích cỡ Rất lớn.',
        },
        en: {
          title: 'Rapid growth',
          story: 'New contracts bring devices online every day: traffic climbs from 1,500 to 6,000 writes/s during the round. The queue must be empty at the end; no reading may wait forever.',
          concept: 'A queue postpones work, it does not remove it. When load keeps growing, the worker fleet must grow with it (Auto Scaling) and the database must fit the final write rate.',
          nudge: 'Turn on Auto Scaling Group for the workers (2 instances, max 5) and size DynamoDB up to XLarge.',
        },
      },
      scenario: { traffic: 1500, mix: { write: 1 }, audience: { 'us-east-1': 1 }, twist: 'viral', latencyTarget: 150, budget: 780, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['auto-scaling', 'decoupling-messaging'],
      solution: growth,
      naive: storm,
    },
    {
      id: 'iot-5-dash',
      text: {
        vi: {
          title: 'Dashboard cho khách hàng',
          story: 'Lưu lượng ổn định ở 5.000 yêu cầu/giây: 60% là số đo, 40% là khách hàng mở dashboard xem số liệu mới nhất. Đọc thẳng từ DynamoDB thì phải nâng bảng lên Rất lớn và vượt ngân sách $720/tháng.',
          concept: 'Dashboard đọc đi đọc lại cùng số liệu: ElastiCache trả phần lớn lượt đọc trong vài ms, DynamoDB chỉ nhận phần trượt cache, nên bảng giữ được kích cỡ nhỏ hơn.',
          nudge: 'API Gateway → 2 EC2 Lớn cho dashboard → ElastiCache → DynamoDB. Máy dashboard cũng nối vào SQS. Worker: 4 EC2 Lớn; DynamoDB Provisioned, Lớn.',
        },
        en: {
          title: 'Customer dashboards',
          story: 'Traffic settles at 5,000 requests/s: 60% sensor readings, 40% customers opening dashboards with the latest numbers. Reading straight from DynamoDB needs an XLarge table and blows the $720/month budget.',
          concept: 'Dashboards read the same numbers again and again: ElastiCache answers most reads in a few ms and DynamoDB only sees the misses, so the table stays smaller.',
          nudge: 'API Gateway → 2 Large EC2 for dashboards → ElastiCache → DynamoDB. Connect the dashboard servers to SQS too. Workers: 4 Large EC2; DynamoDB Provisioned, Large.',
        },
      },
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching'],
      solution: dash,
      naive: dashboards({ worker, table: { provisioned: true, size: 'xlarge' } }),
    },
    {
      id: 'iot-6-cache-crash',
      text: {
        vi: {
          title: 'Cache gặp sự cố',
          story: 'Node ElastiCache sẽ chết giữa vòng chơi. Không có cache, mọi lượt mở dashboard đều thất bại hoặc dồn hết xuống DynamoDB.',
          concept: 'Cache cũng là một điểm lỗi đơn. ElastiCache Multi-AZ giữ một bản sao ở AZ khác, tự thay thế khi node chính chết, nên dashboard vẫn chạy.',
          nudge: 'Bật Multi-AZ (bản sao) cho ElastiCache.',
        },
        en: {
          title: 'The cache fails',
          story: 'The ElastiCache node dies mid-round. Without the cache, every dashboard load either fails or lands on DynamoDB.',
          concept: 'A cache is a single point of failure too. ElastiCache Multi-AZ keeps a replica in another AZ that takes over when the primary node dies, so dashboards keep working.',
          nudge: 'Turn on Multi-AZ (replica) for ElastiCache.',
        },
      },
      scenario: { traffic: 5000, mix: { write: 0.6, read: 0.4 }, audience: { 'us-east-1': 1 }, twist: 'cacheCrash', latencyTarget: 150, budget: 720, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching', 'high-availability-multi-az'],
      solution: resilient,
      naive: dash,
    },
  ],
};
