import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;
type NodeSpec = Parameters<typeof makeBoard>[0][number];
type EdgeSpec = [string, string];

const api = (table: Cfg = {}): NodeSpec[] => [
  ['users', 'users', 80, 240],
  ['api', 'apiGateway', 280, 240],
  ['fn', 'lambda', 480, 240],
  ['table', 'dynamodb', 700, 100, table],
];

const apiEdges: EdgeSpec[] = [
  ['users', 'api'],
  ['api', 'fn'],
  ['fn', 'table'],
];

const inline = makeBoard(api(), apiEdges);

const queued = makeBoard(
  [...api(), ['queue', 'sqs', 700, 380], ['sender', 'ec2', 920, 380, { size: 'medium' }]],
  [...apiEdges, ['fn', 'queue'], ['queue', 'sender']],
);

const CHANNELS: [name: string, y: number][] = [
  ['Push', 380],
  ['Email', 540],
  ['Sms', 700],
];

const fanOut = (worker: 'ec2' | 'lambda', workerConfig: Cfg = {}, encrypted = false) =>
  makeBoard(
    [
      ...api({ encrypted }),
      ['topic', 'sns', 700, 380],
      ...CHANNELS.flatMap(([name, y]): NodeSpec[] => [
        [`q${name}`, 'sqs', 920, y, { encrypted }],
        [`w${name}`, worker, 1140, y, workerConfig],
      ]),
    ],
    [
      ...apiEdges,
      ['fn', 'topic'],
      ...CHANNELS.flatMap(([name]): EdgeSpec[] => [
        ['topic', `q${name}`],
        [`q${name}`, `w${name}`],
      ]),
    ],
  );

const MIX = { read: 0.5, write: 0.2, job: 0.3 };

export const notifications: Track = {
  id: 'notifications',
  difficulty: 'easy',
  text: {
    vi: {
      title: 'Dịch vụ thông báo',
      pitch: 'Gửi push, email và SMS cho khách hàng mà không bắt ai phải chờ, kể cả trong ngày flash sale.',
      tags: ['SQS', 'SNS fan-out', 'Lambda vs EC2', 'Mã hoá'],
    },
    en: {
      title: 'Notification service',
      pitch: 'Send push, email and SMS to customers without making anyone wait, even on flash sale day.',
      tags: ['SQS', 'SNS fan-out', 'Lambda vs EC2', 'Encryption'],
    },
  },
  rounds: [
    {
      id: 'notif-1-mvp',
      text: {
        vi: {
          title: 'Bản chạy thử',
          story: '40 yêu cầu/giây: xem lịch sử thông báo (đọc), lưu cài đặt (ghi) và 30% là lệnh gửi thông báo. Ngân sách $7, chấp nhận chờ tới 250 ms.',
          concept: 'Lưu lượng nhỏ thì serverless rẻ nhất: API Gateway + Lambda + DynamoDB, chưa cần máy chủ nào chạy suốt ngày.',
          nudge: 'Người dùng → API Gateway → Lambda → DynamoDB. Lambda tự gửi thông báo luôn cũng được.',
        },
        en: {
          title: 'Pilot',
          story: '40 requests/s: notification history (reads), settings (writes) and 30% send commands. Budget $7; waiting up to 250 ms is fine.',
          concept: 'At low traffic serverless is cheapest: API Gateway + Lambda + DynamoDB, no server running all day.',
          nudge: 'Users → API Gateway → Lambda → DynamoDB. Lambda can send the notifications itself for now.',
        },
      },
      scenario: { traffic: 40, mix: MIX, audience: { 'us-east-1': 1 }, latencyTarget: 250, budget: 7, requirements: [] },
      unlocks: [],
      lessons: ['serverless-workflows'],
      solution: inline,
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
      id: 'notif-2-queue',
      text: {
        vi: {
          title: 'Gửi chậm quá',
          story: 'Các team khác bắt đầu gọi API: 250 yêu cầu/giây. Gửi ngay trong yêu cầu làm mỗi lệnh chờ thêm 400 ms; giờ mục tiêu là dưới 100 ms.',
          concept: 'Tách việc gửi khỏi yêu cầu: Lambda bỏ lệnh vào SQS rồi trả lời ngay, một worker đọc hàng đợi và gửi sau.',
          nudge: 'Nối Lambda → SQS → một EC2 worker kích cỡ Vừa.',
        },
        en: {
          title: 'Sending is slow',
          story: 'Other teams start calling the API: 250 requests/s. Sending inside the request adds 400 ms to every command; the target is now under 100 ms.',
          concept: 'Take sending out of the request: Lambda drops the command into SQS and answers at once; a worker reads the queue and sends later.',
          nudge: 'Connect Lambda → SQS → a Medium EC2 worker.',
        },
      },
      scenario: { traffic: 250, mix: MIX, audience: { 'us-east-1': 1 }, latencyTarget: 100, budget: 85, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: queued,
      naive: inline,
    },
    {
      id: 'notif-3-fanout',
      text: {
        vi: {
          title: 'Ba kênh gửi',
          story: 'Mỗi lệnh giờ phải gửi qua cả push, email và SMS. Một kênh chậm không được làm chậm kênh khác, và không lệnh nào được bỏ sót. 300 yêu cầu/giây.',
          concept: 'SNS fan-out: Lambda gửi một tin tới topic, SNS sao chép vào ba hàng đợi SQS, mỗi kênh một worker riêng.',
          nudge: 'Lambda → SNS → ba SQS (Push, Email, SMS), mỗi SQS một EC2 worker kích cỡ Vừa.',
        },
        en: {
          title: 'Three channels',
          story: 'Every command must now go out as push, email and SMS. A slow channel must not hold up the others, and no command may be lost. 300 requests/s.',
          concept: 'SNS fan-out: Lambda publishes one message to a topic; SNS copies it into three SQS queues, one worker per channel.',
          nudge: 'Lambda → SNS → three SQS queues (Push, Email, SMS), each with a Medium EC2 worker.',
        },
      },
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 100,
        budget: 160,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'application-integration'],
      solution: fanOut('ec2', { size: 'medium' }),
      naive: makeBoard(
        [...api(), ['queue', 'sqs', 700, 380], ['sender', 'ec2', 920, 380, { size: 'xlarge' }]],
        [...apiEdges, ['fn', 'queue'], ['queue', 'sender']],
      ),
    },
    {
      id: 'notif-4-sale',
      text: {
        vi: {
          title: 'Flash sale',
          story: 'Một khách hàng lớn chạy flash sale: lưu lượng gấp 3 trong gần một phần ba ngày. Mọi thông báo vẫn phải được gửi hết trước cuối ngày.',
          concept: 'SQS hấp thụ đợt tăng đột biến; Auto Scaling cho nhóm worker thêm máy khi bận để xả kịp hàng đợi.',
          nudge: 'Bật Auto Scaling cho cả ba EC2 worker.',
        },
        en: {
          title: 'Flash sale',
          story: 'A big customer runs a flash sale: 3× traffic for almost a third of the day. Every notification must still be sent by the end of the day.',
          concept: 'SQS absorbs the burst; Auto Scaling adds workers while they are busy so the queues drain in time.',
          nudge: 'Turn on Auto Scaling for all three EC2 workers.',
        },
      },
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 120,
        budget: 260,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'decoupling-messaging'],
      solution: fanOut('ec2', { size: 'medium', autoScaling: true }),
      naive: fanOut('ec2', { size: 'medium' }),
    },
    {
      id: 'notif-5-lambda',
      text: {
        vi: {
          title: 'Trả theo lượt gửi',
          story: 'Ngoài flash sale, worker EC2 ngồi chơi phần lớn thời gian. Ngân sách bị cắt còn $95.',
          concept: 'Worker chỉ bận theo đợt hợp với Lambda: SQS kích hoạt Lambda, tự co giãn và chỉ trả tiền cho từng tin được xử lý.',
          nudge: 'Thay ba EC2 worker bằng ba Lambda đọc từ ba hàng đợi SQS.',
        },
        en: {
          title: 'Pay per message',
          story: 'Outside the flash sale, the EC2 workers sit idle most of the time. The budget is cut to $95.',
          concept: 'Bursty workers suit Lambda: SQS triggers Lambda, which scales on its own and bills only for the messages it processes.',
          nudge: 'Replace the three EC2 workers with three Lambdas reading the three SQS queues.',
        },
      },
      scenario: {
        traffic: 300,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        twist: 'flashSale',
        latencyTarget: 120,
        budget: 95,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['cost-compute-serverless-containers', 'serverless-workflows'],
      solution: fanOut('lambda'),
      naive: fanOut('ec2', { size: 'small', autoScaling: true }),
    },
    {
      id: 'notif-6-encrypt',
      text: {
        vi: {
          title: 'Email và số điện thoại',
          story: 'Tin nhắn trong hàng đợi chứa email và số điện thoại của khách; kiểm toán yêu cầu mọi dữ liệu phải được mã hoá khi lưu. Lưu lượng lên 450 yêu cầu/giây.',
          concept: 'Mã hoá at rest bằng KMS cho mọi nơi lưu dữ liệu: cả hàng đợi SQS lẫn bảng DynamoDB.',
          nudge: 'Bật mã hoá trên DynamoDB và cả ba SQS.',
        },
        en: {
          title: 'Emails and phone numbers',
          story: 'Queued messages hold customer emails and phone numbers; the auditor requires all data encrypted at rest. Traffic grows to 450 requests/s.',
          concept: 'Encryption at rest with KMS everywhere data is stored: the SQS queues as well as the DynamoDB table.',
          nudge: 'Turn on encryption on DynamoDB and all three SQS queues.',
        },
      },
      scenario: {
        traffic: 450,
        mix: MIX,
        audience: { 'us-east-1': 1 },
        latencyTarget: 100,
        budget: 95,
        requirements: ['fanOut', 'drainQueue', 'encryptData'],
      },
      unlocks: [],
      lessons: ['data-encryption-kms'],
      solution: fanOut('lambda', {}, true),
      naive: fanOut('lambda'),
    },
  ],
};
