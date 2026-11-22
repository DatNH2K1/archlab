import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig, RequirementId } from '../types';

/** Card-data rules that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const core = (o: { waf: boolean; db: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ...(o.waf ? [['shield', 'waf', 240, 240] as const] : []),
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, o.db],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.waf
        ? ([
            ['users', 'shield'],
            ['shield', 'api'],
          ] as [string, string][])
        : ([['users', 'api']] as [string, string][])),
      ['api', 'fn'],
      ['fn', 'db'],
    ],
  );

const fraud = (queue: Partial<NodeConfig>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 240, 240],
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, DB],
      ['queue', 'sqs', 600, 420, queue],
      ['scorer', 'lambda', 800, 420],
    ],
    [
      ['users', 'shield'],
      ['shield', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scorer'],
    ],
  );

const fanOut = (mailQueue: Partial<NodeConfig>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 240, 240],
      ['api', 'apiGateway', 400, 240],
      ['fn', 'lambda', 600, 240],
      ['db', 'dynamodb', 800, 240, DB],
      ['topic', 'sns', 600, 420],
      ['queue', 'sqs', 800, 380, { encrypted: true }],
      ['scorer', 'lambda', 1000, 380],
      ['queue2', 'sqs', 800, 520, mailQueue],
      ['mailer', 'lambda', 1000, 520],
    ],
    [
      ['users', 'shield'],
      ['shield', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'topic'],
      ['topic', 'queue'],
      ['queue', 'scorer'],
      ['topic', 'queue2'],
      ['queue2', 'mailer'],
    ],
  );

export const paymentApi: Track = {
  id: 'payment-api',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'API thanh toán thẻ',
      pitch:
        'Xây API thanh toán serverless theo chuẩn PCI DSS: mã hoá dữ liệu thẻ, chặn bot thử thẻ và xử lý gian lận bất đồng bộ.',
      tags: ['Bảo mật', 'Serverless', 'WAF', 'KMS', 'SNS + SQS'],
    },
    en: {
      title: 'Card payment API',
      pitch:
        'Build a serverless payment API for PCI DSS: encrypt card data, stop card-testing bots and check fraud asynchronously.',
      tags: ['Security', 'Serverless', 'WAF', 'KMS', 'SNS + SQS'],
    },
  },
  rounds: [
    {
      id: 'pay-launch',
      text: {
        vi: {
          title: 'Giao dịch đầu tiên',
          story:
            'Một ví điện tử mở API thanh toán cho các cửa hàng: 300 yêu cầu/giây, một nửa tạo giao dịch, một nửa tra trạng thái. Đội muốn serverless để khỏi quản lý máy chủ. Chuẩn PCI DSS bắt buộc mã hoá dữ liệu thẻ khi lưu trữ.',
          concept:
            'API Gateway → Lambda → DynamoDB. Lambda chỉ có quyền tối thiểu qua IAM execution role (chỉ PutItem/GetItem trên đúng bảng). DynamoDB mã hoá bằng khoá KMS; dùng customer managed key khi cần tự xoay khoá và xem ai dùng khoá trong CloudTrail.',
          nudge: 'Người dùng → API Gateway → Lambda → DynamoDB, bật mã hoá cho DynamoDB.',
        },
        en: {
          title: 'First transactions',
          story:
            'A digital wallet opens a payment API to merchants: 300 requests/s, half creating payments and half checking status. The team wants serverless so nobody runs servers. PCI DSS requires card data to be encrypted at rest.',
          concept:
            'API Gateway → Lambda → DynamoDB. Lambda gets least privilege through its IAM execution role (only PutItem/GetItem on that one table). DynamoDB encrypts with a KMS key; use a customer managed key when you need your own rotation and a CloudTrail record of who used the key.',
          nudge: 'Users → API Gateway → Lambda → DynamoDB, with encryption on for DynamoDB.',
        },
      },
      scenario: {
        traffic: 300,
        mix: { read: 0.5, write: 0.5 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 150,
        budget: 70,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['iam-fundamentals', 'data-encryption-kms'],
      solution: core({ waf: false, db: DB }),
      naive: core({ waf: false, db: {} }),
    },
    {
      id: 'pay-card-testing',
      text: {
        vi: {
          title: 'Bot thử thẻ',
          story:
            'Kẻ gian dùng API để thử hàng loạt số thẻ đánh cắp (card testing): yêu cầu rác tăng gấp 6 lần. Lambda bị chiếm hết concurrency, giao dịch thật bị từ chối. PCI DSS cũng yêu cầu tường lửa ứng dụng trước mọi API công khai.',
          concept:
            'Gắn AWS WAF vào API Gateway: rate-based rule theo IP, Bot Control và rule chặn mẫu yêu cầu bất thường. Thêm usage plan với API key và throttling cho từng cửa hàng, và reserved concurrency để một hàm không ăn hết concurrency của tài khoản.',
          nudge: 'Đặt WAF giữa Người dùng và API Gateway.',
        },
        en: {
          title: 'Card-testing bots',
          story:
            'Fraudsters use the API to test stolen card numbers in bulk (card testing): junk requests jump 6×. Lambda concurrency runs out and real payments are declined. PCI DSS also requires a web application firewall in front of every public API.',
          concept:
            'Attach AWS WAF to API Gateway: IP rate-based rules, Bot Control, and rules that block odd request patterns. Add usage plans with API keys and per-merchant throttling, and reserved concurrency so one function cannot eat the whole account limit.',
          nudge: 'Put WAF between Users and API Gateway.',
        },
      },
      scenario: {
        traffic: 300,
        mix: { read: 0.5, write: 0.5 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 80,
        requirements: [...RULES, 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield', 'serverless-workflows'],
      solution: core({ waf: true, db: DB }),
      naive: core({ waf: false, db: DB }),
    },
    {
      id: 'pay-fraud',
      text: {
        vi: {
          title: 'Chấm điểm gian lận',
          story:
            'Mỗi giao dịch giờ phải qua mô hình chấm điểm gian lận mất vài trăm ms: 20% yêu cầu cần chấm điểm. Làm ngay trong yêu cầu thì cửa hàng phải chờ quá lâu, mà không giao dịch nào được bỏ qua bước này.',
          concept:
            'Lambda ghi giao dịch ở trạng thái chờ rồi đẩy job vào SQS bật SSE-KMS; một Lambda khác lấy job ra chấm điểm. Khoá KMS của hàng đợi phải cho phép cả hai hàm dùng qua key policy, nếu không message sẽ không đọc được.',
          nudge: 'Thêm SQS (bật mã hoá) nối từ Lambda, và một Lambda thứ hai đọc từ SQS.',
        },
        en: {
          title: 'Fraud scoring',
          story:
            'Every payment must now pass a fraud model that takes a few hundred ms: 20% of requests need scoring. Doing it inside the request keeps merchants waiting too long, and no payment may skip the check.',
          concept:
            'Lambda stores the payment as pending and sends a job to SQS with SSE-KMS; another Lambda pulls jobs and scores them. The queue KMS key policy must allow both functions, or the messages cannot be read.',
          nudge: 'Add an encrypted SQS fed by Lambda, and a second Lambda reading from it.',
        },
      },
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 90,
        requirements: [...RULES, 'webFirewall', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'data-encryption-kms'],
      solution: fraud({ encrypted: true }),
      naive: fraud({}),
    },
    {
      id: 'pay-receipts',
      text: {
        vi: {
          title: 'Biên lai và đối soát',
          story:
            'Ngoài chấm điểm gian lận, mỗi giao dịch còn phải gửi biên lai cho khách và ghi vào hệ thống đối soát. Hai việc này độc lập, cái này chậm không được làm cái kia chậm theo.',
          concept:
            'Lambda gửi sự kiện tới SNS, SNS chia ra hai hàng đợi SQS, mỗi hàng đợi có Lambda riêng. Bật mã hoá cho cả hai SQS; topic SNS cũng có SSE với KMS, và access policy của hàng đợi chỉ cho đúng topic đó gửi vào.',
          nudge: 'Thay SQS bằng SNS → 2 SQS (bật mã hoá), mỗi SQS một Lambda.',
        },
        en: {
          title: 'Receipts and reconciliation',
          story:
            'Besides fraud scoring, every payment must send the customer a receipt and post to the reconciliation system. The two jobs are independent: one being slow must not slow the other.',
          concept:
            'Lambda publishes to SNS, which fans out to two SQS queues, each with its own Lambda. Encrypt both queues; the SNS topic also supports SSE with KMS, and each queue access policy only lets that one topic send to it.',
          nudge: 'Replace SQS with SNS → 2 SQS (encrypted), each with its own Lambda.',
        },
      },
      scenario: {
        traffic: 300,
        mix: { read: 0.4, write: 0.4, job: 0.2 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 150,
        budget: 100,
        requirements: [...RULES, 'webFirewall', 'drainQueue', 'fanOut'],
      },
      unlocks: [],
      lessons: ['application-integration', 'decoupling-messaging'],
      solution: fanOut({ encrypted: true }),
      naive: fanOut({}),
    },
  ],
};
