import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig, RequirementId } from '../types';

/** Rules for company documents that hold in every round. */
const RULES: RequirementId[] = ['encryptData', 'privateData', 'privateBucket'];

const DB = { encrypted: true } satisfies Partial<NodeConfig>;

const shared = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 480, 80],
    ['api', 'apiGateway', 480, 240],
    ['fn', 'lambda', 680, 240],
    ['db', 'dynamodb', 880, 240, DB],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'db'],
  ],
);

const scanned = (o: { waf: boolean; queue: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ...(o.waf ? [['shield', 'waf', 220, 240] as const] : []),
      ['cdn', 'cloudfront', 380, 240],
      ['files', 's3', 580, 80],
      ['api', 'apiGateway', 580, 240],
      ['fn', 'lambda', 780, 240],
      ['db', 'dynamodb', 980, 240, DB],
      ['queue', 'sqs', 780, 420, o.queue],
      ['scanner', 'lambda', 980, 420],
    ] as Parameters<typeof makeBoard>[0],
    [
      ...(o.waf
        ? ([
            ['users', 'shield'],
            ['shield', 'cdn'],
          ] as [string, string][])
        : ([['users', 'cdn']] as [string, string][])),
      ['cdn', 'files'],
      ['cdn', 'api'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scanner'],
    ],
  );

const twoRegions = (o: { replicaBucket: Partial<NodeConfig> }) =>
  makeBoard(
    [
      ['users', 'users', 80, 300],
      ['shield', 'waf', 220, 300],
      ['cdn', 'cloudfront', 380, 300],
      ['files', 's3', 580, 40],
      ['files2', 's3', 580, 560, { ...o.replicaBucket, region: 'eu-west-1' }],
      ['dns', 'route53', 560, 300],
      ['api', 'apiGateway', 740, 180],
      ['fn', 'lambda', 920, 180],
      ['api2', 'apiGateway', 740, 420, { region: 'eu-west-1' }],
      ['fn2', 'lambda', 920, 420, { region: 'eu-west-1' }],
      // DynamoDB global table: one table with a managed copy in eu-west-1.
      ['db', 'dynamodb', 1120, 300, { ...DB, globalDb: true }],
      ['queue', 'sqs', 1120, 120, { encrypted: true }],
      ['scanner', 'lambda', 1300, 120],
      ['queue2', 'sqs', 1120, 480, { encrypted: true, region: 'eu-west-1' }],
      ['scanner2', 'lambda', 1300, 480, { region: 'eu-west-1' }],
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'files2'],
      ['cdn', 'dns'],
      ['dns', 'api'],
      ['dns', 'api2'],
      ['api', 'fn'],
      ['fn', 'db'],
      ['fn', 'queue'],
      ['queue', 'scanner'],
      ['api2', 'fn2'],
      ['fn2', 'db'],
      ['fn2', 'queue2'],
      ['queue2', 'scanner2'],
    ],
  );

export const documentVault: Track = {
  id: 'document-vault',
  difficulty: 'easy',
  text: {
    vi: {
      title: 'Kho tài liệu doanh nghiệp',
      pitch:
        'Xây nơi chia sẻ tài liệu nội bộ: tệp không bao giờ public, tệp tải lên được quét virus, và bot không lấy trộm được.',
      tags: ['Bảo mật', 'S3 private', 'Serverless', 'WAF', 'Đa Region'],
    },
    en: {
      title: 'Company document vault',
      pitch:
        'Build an internal document sharing service: files are never public, uploads are scanned for viruses, and bots cannot scrape them.',
      tags: ['Security', 'Private S3', 'Serverless', 'WAF', 'Multi-Region'],
    },
  },
  rounds: [
    {
      id: 'vault-share',
      text: {
        vi: {
          title: 'Chia sẻ mà không public',
          story:
            'Công ty cần nơi chia sẻ hợp đồng và báo cáo: 400 yêu cầu/giây, 70% là tải tệp, phần còn lại xem danh sách và quyền truy cập. Năm ngoái một bucket để public làm lộ hợp đồng khách hàng: lần này không bucket nào được mở ra Internet.',
          concept:
            'S3 bật Block Public Access ở cấp tài khoản, mã hoá SSE-KMS. CloudFront đọc bucket qua Origin Access Control; API Gateway + Lambda kiểm tra quyền rồi cấp signed URL ngắn hạn. Nhân viên đăng nhập qua Cognito hoặc IAM Identity Center thay vì chia sẻ khoá.',
          nudge:
            'Người dùng → CloudFront; CloudFront → S3 cho tệp và CloudFront → API Gateway → Lambda → DynamoDB (bật mã hoá).',
        },
        en: {
          title: 'Share without going public',
          story:
            'The company needs a place to share contracts and reports: 400 requests/s, 70% file downloads, the rest listing files and permissions. Last year a public bucket leaked customer contracts: this time no bucket may be open to the internet.',
          concept:
            'Turn on S3 Block Public Access for the account and encrypt with SSE-KMS. CloudFront reads the bucket through Origin Access Control; API Gateway + Lambda checks permissions and issues short-lived signed URLs. Staff sign in through Cognito or IAM Identity Center instead of sharing keys.',
          nudge:
            'Users → CloudFront; CloudFront → S3 for files and CloudFront → API Gateway → Lambda → DynamoDB (encrypted).',
        },
      },
      scenario: {
        traffic: 400,
        mix: { static: 0.7, read: 0.2, write: 0.1 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 80,
        budget: 35,
        requirements: RULES,
      },
      unlocks: [],
      lessons: ['identity-federation-cognito', 'edge-networking'],
      solution: shared,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['files', 's3', 280, 80],
          ['api', 'apiGateway', 280, 240],
          ['fn', 'lambda', 480, 240],
          ['db', 'dynamodb', 680, 240, DB],
        ],
        [
          ['users', 'files'],
          ['users', 'api'],
          ['api', 'fn'],
          ['fn', 'db'],
        ],
      ),
    },
    {
      id: 'vault-scan',
      text: {
        vi: {
          title: 'Quét virus tệp tải lên',
          story:
            'Nhân viên bắt đầu tải tệp lên: 15% yêu cầu là tệp mới cần quét virus, mỗi lần quét mất vài trăm ms. Quét ngay trong yêu cầu làm cả trang chậm, mà tệp chưa quét thì không được chia sẻ.',
          concept:
            'Lambda lưu tệp ở trạng thái chờ và đẩy job vào SQS bật mã hoá; một Lambda khác quét rồi đánh dấu sạch. Trên AWS còn có GuardDuty Malware Protection for S3 tự quét tệp mới mà không cần tự viết.',
          nudge: 'Thêm SQS (bật mã hoá) nối từ Lambda, và một Lambda thứ hai đọc từ SQS.',
        },
        en: {
          title: 'Scan uploads for viruses',
          story:
            'Staff start uploading files: 15% of requests are new files that need a virus scan, and each scan takes a few hundred ms. Scanning inside the request slows the whole app, and unscanned files may not be shared.',
          concept:
            'Lambda stores the file as pending and sends a job to an encrypted SQS; another Lambda scans it and marks it clean. On AWS, GuardDuty Malware Protection for S3 can also scan new files without custom code.',
          nudge: 'Add an encrypted SQS fed by Lambda, and a second Lambda reading from it.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        latencyTarget: 80,
        budget: 45,
        requirements: [...RULES, 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'threat-detection-waf-shield'],
      solution: scanned({ waf: false, queue: { encrypted: true } }),
      naive: scanned({ waf: false, queue: {} }),
    },
    {
      id: 'vault-scrape',
      text: {
        vi: {
          title: 'Bot cào tài liệu',
          story:
            'Một botnet dùng tài khoản bị lộ để cào tài liệu hàng loạt, gửi yêu cầu gấp 6 lần lưu lượng thật. Lambda bị chiếm hết, nhân viên thật không mở được tệp. Bảo mật yêu cầu mọi yêu cầu phải qua WAF.',
          concept:
            'WAF gắn vào CloudFront chặn ở edge, trước khi tới API: rate-based rule, Bot Control, và geo match nếu công ty chỉ làm việc ở vài nước. GuardDuty phát hiện thông tin đăng nhập bị dùng bất thường để khoá tài khoản kịp thời.',
          nudge: 'Đặt WAF giữa Người dùng và CloudFront.',
        },
        en: {
          title: 'Scraping bots',
          story:
            'A botnet uses leaked accounts to scrape documents in bulk at 6× real traffic. Lambda is swamped and real staff cannot open files. Security requires every request to pass through WAF.',
          concept:
            'WAF on CloudFront blocks at the edge, before the API: rate-based rules, Bot Control, and geo match if the company only works in a few countries. GuardDuty spots credentials used in unusual ways so the account can be locked in time.',
          nudge: 'Put WAF between Users and CloudFront.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 1 },
        twist: 'ddos',
        latencyTarget: 80,
        budget: 55,
        requirements: [...RULES, 'drainQueue', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: scanned({ waf: true, queue: { encrypted: true } }),
      naive: scanned({ waf: false, queue: { encrypted: true } }),
    },
    {
      id: 'vault-region',
      text: {
        vi: {
          title: 'Cả Region gặp sự cố',
          story:
            'us-east-1 gặp sự cố lớn vài giờ. Hợp đồng vẫn phải mở được, và văn phòng châu Âu (40% người dùng) cần nhanh. Bản sao ở Region khác cũng phải giữ đúng các quy tắc bảo mật như bản gốc.',
          concept:
            'S3 Cross-Region Replication sang eu-west-1, bucket đích cũng bật mã hoá và Block Public Access; dùng KMS multi-Region key để hai Region giải mã bằng cùng một khoá. DynamoDB global table giữ dữ liệu ở cả hai Region; Route 53 đưa yêu cầu sang Region còn sống.',
          nudge:
            'Thêm S3 thứ hai ở eu-west-1 sau CloudFront; CloudFront → Route 53 → API Gateway + Lambda + SQS ở mỗi Region, và bật Global cho DynamoDB.',
        },
        en: {
          title: 'A whole Region fails',
          story:
            'us-east-1 has a major outage for a few hours. Contracts must still open, and the European office (40% of users) needs speed. Copies in another Region must follow the same security rules as the original.',
          concept:
            'S3 Cross-Region Replication to eu-west-1, with the target bucket encrypted and Block Public Access on; a KMS multi-Region key lets both Regions decrypt with the same key. A DynamoDB global table keeps data in both Regions, and Route 53 sends requests to the Region still alive.',
          nudge:
            'Add a second S3 in eu-west-1 behind CloudFront; CloudFront → Route 53 → API Gateway + Lambda + SQS in each Region, and turn on Global for DynamoDB.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { static: 0.6, read: 0.15, write: 0.1, job: 0.15 },
        audience: { 'us-east-1': 0.6, 'eu-west-1': 0.4 },
        twist: 'regionOutage',
        outageRegion: 'us-east-1',
        latencyTarget: 80,
        budget: 70,
        requirements: [...RULES, 'drainQueue', 'webFirewall'],
      },
      unlocks: [],
      lessons: ['disaster-recovery', 'data-encryption-kms'],
      solution: twoRegions({ replicaBucket: {} }),
      naive: twoRegions({ replicaBucket: { encrypted: false } }),
    },
  ],
};
