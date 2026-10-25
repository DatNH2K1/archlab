import { makeBoard } from '../board';
import type { Track } from '../rounds';

const cdnOnly = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 500, 240],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
  ],
);

const withApi = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240],
    ['files', 's3', 500, 100],
    ['api', 'apiGateway', 500, 320],
    ['fn', 'lambda', 700, 320],
    ['table', 'dynamodb', 900, 320],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'table'],
  ],
);

const cachedApi = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 280, 240, { cacheApi: true }],
    ['files', 's3', 500, 100],
    ['api', 'apiGateway', 500, 320],
    ['fn', 'lambda', 700, 320],
    ['table', 'dynamodb', 900, 320],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'table'],
  ],
);

const shielded = (table: { encrypted?: boolean; provisioned?: boolean } = {}) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['shield', 'waf', 260, 240],
      ['cdn', 'cloudfront', 440, 240, { cacheApi: true }],
      ['files', 's3', 660, 100],
      ['api', 'apiGateway', 660, 320],
      ['fn', 'lambda', 860, 320],
      ['table', 'dynamodb', 1060, 320, table],
    ],
    [
      ['users', 'shield'],
      ['shield', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'api'],
      ['api', 'fn'],
      ['fn', 'table'],
    ],
  );

export const staticWebsite: Track = {
  id: 'static-website',
  difficulty: 'easy',
  text: {
    vi: {
      title: 'Website giới thiệu',
      pitch: 'Một trang marketing lớn dần: từ vài file tĩnh tới form liên hệ, khách toàn cầu và bot.',
      tags: ['S3 + CloudFront', 'Serverless', 'WAF', 'Mã hoá', 'Chi phí'],
    },
    en: {
      title: 'Marketing website',
      pitch: 'A marketing site that grows: from a few static files to a contact form, global visitors and bots.',
      tags: ['S3 + CloudFront', 'Serverless', 'WAF', 'Encryption', 'Cost'],
    },
  },
  rounds: [
    {
      id: 'site-1-launch',
      text: {
        vi: {
          title: 'Ra mắt trang',
          story: 'Trang chỉ có HTML, CSS và ảnh: 300 yêu cầu/giây, 30% khách ở nước ngoài. Ngân sách $8/tháng, mục tiêu dưới 60 ms.',
          concept: 'Nội dung tĩnh không cần máy chủ: lưu trên S3 và phát qua CloudFront để cache gần người dùng.',
          nudge: 'Người dùng → CloudFront → S3. Một EC2 nhỏ đã tốn $15.',
        },
        en: {
          title: 'Launch day',
          story: 'The site is only HTML, CSS and images: 300 requests/s, 30% of visitors abroad. Budget $8/month, target under 60 ms.',
          concept: 'Static content needs no servers: store it in S3 and serve it through CloudFront, cached close to users.',
          nudge: 'Users → CloudFront → S3. A single small EC2 already costs $15.',
        },
      },
      scenario: { traffic: 300, mix: { static: 1 }, audience: { 'us-east-1': 0.7, 'eu-west-1': 0.3 }, latencyTarget: 60, budget: 8, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 's3-storage-classes'],
      solution: cdnOnly,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['web', 'ec2', 320, 240],
        ],
        [['users', 'web']],
      ),
    },
    {
      id: 'site-2-contact',
      text: {
        vi: {
          title: 'Form liên hệ',
          story: 'Marketing muốn thêm form liên hệ và danh sách bài viết: 400 yêu cầu/giây, 15% là đọc API, 5% là gửi form. Ngân sách $24.',
          concept: 'Phần động nhỏ và thất thường hợp với serverless: API Gateway + Lambda + DynamoDB, trả theo từng yêu cầu.',
          nudge: 'Giữ CloudFront → S3, thêm CloudFront → API Gateway → Lambda → DynamoDB.',
        },
        en: {
          title: 'Contact form',
          story: 'Marketing wants a contact form and a post list: 400 requests/s, 15% API reads and 5% form posts. Budget $24.',
          concept: 'A small, bursty dynamic part suits serverless: API Gateway + Lambda + DynamoDB, paid per request.',
          nudge: 'Keep CloudFront → S3 and add CloudFront → API Gateway → Lambda → DynamoDB.',
        },
      },
      scenario: {
        traffic: 400,
        mix: { static: 0.8, read: 0.15, write: 0.05 },
        audience: { 'us-east-1': 0.7, 'eu-west-1': 0.3 },
        latencyTarget: 80,
        budget: 24,
        requirements: [],
      },
      unlocks: [],
      lessons: ['serverless-workflows', 'nosql-caching'],
      solution: withApi,
      naive: makeBoard(
        [
          ['users', 'users', 80, 240],
          ['cdn', 'cloudfront', 280, 240],
          ['files', 's3', 500, 100],
          ['web', 'ec2', 500, 320],
          ['db', 'rds', 700, 320],
        ],
        [
          ['users', 'cdn'],
          ['cdn', 'files'],
          ['cdn', 'web'],
          ['web', 'db'],
        ],
      ),
    },
    {
      id: 'site-3-global',
      text: {
        vi: {
          title: 'Khách khắp thế giới',
          story: 'Chiến dịch quốc tế: 800 yêu cầu/giây, 70% khách ở châu Âu, xa us-east-1. Danh sách bài viết giống nhau cho mọi người. Mục tiêu dưới 55 ms.',
          concept: 'CloudFront cache được cả phản hồi API đọc nhiều: một nửa lượt đọc được trả ở edge, không phải đi về Region.',
          nudge: 'Bật "Cache cả phản hồi API" trên CloudFront.',
        },
        en: {
          title: 'Visitors worldwide',
          story: 'An international campaign: 800 requests/s, 70% of visitors in Europe, far from us-east-1. The post list is the same for everyone. Target under 55 ms.',
          concept: 'CloudFront can also cache read-heavy API responses: half the reads are answered at the edge instead of the Region.',
          nudge: 'Turn on "Cache API responses" on CloudFront.',
        },
      },
      scenario: {
        traffic: 800,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 55,
        budget: 36,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking'],
      solution: cachedApi,
      naive: withApi,
    },
    {
      id: 'site-4-bots',
      text: {
        vi: {
          title: 'Bot spam form',
          story: 'Một botnet bơm yêu cầu rác gấp 6 lần lưu lượng thật vào form. Lambda quá tải và API Gateway tính tiền từng yêu cầu rác.',
          concept: 'AWS WAF với rate-based rule chặn bot ở vòng ngoài, trước khi chúng tới (và được tính tiền ở) các dịch vụ trả theo yêu cầu.',
          nudge: 'Đặt WAF ngay sau Người dùng, trước CloudFront.',
        },
        en: {
          title: 'Form spam bots',
          story: 'A botnet pumps junk requests at 6× real traffic into the form. Lambda overloads and API Gateway bills every junk request.',
          concept: 'AWS WAF rate-based rules stop bots at the edge, before they reach (and get billed by) pay-per-request services.',
          nudge: 'Put WAF right after Users, in front of CloudFront.',
        },
      },
      scenario: {
        traffic: 800,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        twist: 'ddos',
        latencyTarget: 60,
        budget: 45,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded(),
      naive: cachedApi,
    },
    {
      id: 'site-5-encrypt',
      text: {
        vi: {
          title: 'Dữ liệu khách hàng',
          story: 'Form giờ lưu email và số điện thoại; bộ phận pháp lý yêu cầu mọi dữ liệu phải được mã hoá khi lưu và chỉ code mới được đọc database. 1.000 yêu cầu/giây.',
          concept: 'Mã hoá at rest bằng KMS: S3 mặc định đã mã hoá, nhưng bảng DynamoDB cũng phải bật. Database chỉ nằm sau Lambda.',
          nudge: 'Bật mã hoá trên DynamoDB; giữ DynamoDB chỉ nối từ Lambda.',
        },
        en: {
          title: 'Customer data',
          story: 'The form now stores emails and phone numbers; legal requires all data encrypted at rest and only code may reach the database. 1,000 requests/s.',
          concept: 'Encryption at rest with KMS: S3 is encrypted by default, but the DynamoDB table must be too. The database stays behind Lambda.',
          nudge: 'Turn on encryption on DynamoDB; keep DynamoDB connected only from Lambda.',
        },
      },
      scenario: {
        traffic: 1000,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 60,
        budget: 45,
        requirements: ['encryptData', 'privateData'],
      },
      unlocks: [],
      lessons: ['data-encryption-kms'],
      solution: shielded({ encrypted: true }),
      naive: shielded(),
    },
    {
      id: 'site-6-squeeze',
      text: {
        vi: {
          title: 'Cắt chi phí',
          story: 'Lưu lượng đã ổn định ở 1.600 yêu cầu/giây, nhiều lượt đăng ký nhận tin (ghi). Sếp cắt ngân sách xuống $68.',
          concept: 'Lưu lượng đều và dự đoán được thì DynamoDB provisioned capacity rẻ hơn on-demand, vốn tính tiền từng yêu cầu.',
          nudge: 'Bật provisioned capacity trên DynamoDB, kích cỡ Nhỏ là đủ.',
        },
        en: {
          title: 'Cost squeeze',
          story: 'Traffic has settled at 1,600 requests/s with lots of newsletter sign-ups (writes). The boss cuts the budget to $68.',
          concept: 'Steady, predictable traffic is cheaper on DynamoDB provisioned capacity than on-demand, which bills every request.',
          nudge: 'Turn on provisioned capacity on DynamoDB; size Small is enough.',
        },
      },
      scenario: {
        traffic: 1600,
        mix: { static: 0.7, read: 0.22, write: 0.08 },
        audience: { 'us-east-1': 0.3, 'eu-west-1': 0.7 },
        latencyTarget: 65,
        budget: 68,
        requirements: ['encryptData', 'privateData'],
      },
      unlocks: [],
      lessons: ['cost-database-storage-choices', 'nosql-caching'],
      solution: shielded({ encrypted: true, provisioned: true }),
      naive: shielded({ encrypted: true }),
    },
  ],
};
