import { makeBoard } from '../board';
import type { Track } from '../rounds';

const serverless = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['api', 'apiGateway', 300, 240],
    ['fn', 'lambda', 520, 240],
    ['links', 'dynamodb', 740, 240],
  ],
  [
    ['users', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const edge = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['api', 'apiGateway', 460, 240],
    ['fn', 'lambda', 660, 240],
    ['links', 'dynamodb', 860, 240],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const accelerated = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 440, 240],
    ['api', 'apiGateway', 620, 240],
    ['fn', 'lambda', 800, 240],
    ['links', 'dynamodb', 980, 240],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

const shielded = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['shield', 'waf', 240, 240],
    ['cdn', 'cloudfront', 400, 240, { cacheApi: true }],
    ['ga', 'globalAccelerator', 560, 240],
    ['api', 'apiGateway', 720, 240],
    ['fn', 'lambda', 880, 240],
    ['links', 'dynamodb', 1060, 240],
  ],
  [
    ['users', 'shield'],
    ['shield', 'cdn'],
    ['cdn', 'ga'],
    ['ga', 'api'],
    ['api', 'fn'],
    ['fn', 'links'],
  ],
);

export const urlShortener: Track = {
  id: 'url-shortener',
  difficulty: 'easy',
  text: {
    vi: {
      title: 'Rút gọn link',
      pitch: 'Dịch vụ tạo link gọn cho chiến dịch marketing: tạo ít, bấm cực nhiều, từ khắp nơi.',
      tags: ['Serverless', 'Cache ở edge', 'WAF', 'Chi phí'],
    },
    en: {
      title: 'URL shortener',
      pitch: 'A short-link service for marketing campaigns: few links created, a huge number of clicks from everywhere.',
      tags: ['Serverless', 'Edge caching', 'WAF', 'Cost'],
    },
  },
  rounds: [
    {
      id: 'short-mvp',
      text: {
        vi: {
          title: 'Bản đầu tiên',
          story: 'Vài người bạn dùng thử: 30 lượt/giây, phần lớn là bấm link (đọc), thỉnh thoảng tạo link mới (ghi). Ngân sách chỉ $15/tháng.',
          concept: 'Lưu lượng thấp và thất thường hợp với serverless: API Gateway + Lambda + DynamoDB on-demand, trả theo từng yêu cầu.',
          nudge: 'Người dùng → API Gateway → Lambda → DynamoDB. Một EC2 + RDS đã tốn $30.',
        },
        en: {
          title: 'First version',
          story: 'A few friends try it: 30 requests/s, mostly clicks (reads) and the odd new link (write). The budget is only $15/month.',
          concept: 'Low, bursty traffic suits serverless: API Gateway + Lambda + DynamoDB on-demand, paid per request.',
          nudge: 'Users → API Gateway → Lambda → DynamoDB. One EC2 + RDS already costs $30.',
        },
      },
      scenario: { traffic: 30, mix: { read: 0.9, write: 0.1 }, audience: { 'us-east-1': 1 }, latencyTarget: 300, budget: 15, requirements: [] },
      unlocks: [],
      lessons: ['serverless-workflows', 'nosql-caching'],
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
      id: 'short-viral',
      text: {
        vi: {
          title: 'Một link lên top',
          story: 'Một link được chia sẻ khắp mạng xã hội: 1.200 lượt bấm mỗi giây, mà Lambda trả theo yêu cầu đang đốt tiền. Lượt bấm vào cùng một link trả cùng một kết quả.',
          concept: 'Kết quả chuyển hướng cache được: CloudFront giữ phản hồi ở edge, phần lớn lượt bấm không tới Lambda nữa.',
          nudge: 'Đặt CloudFront trước API Gateway và bật "Cache cả phản hồi API".',
        },
        en: {
          title: 'A link goes viral',
          story: 'One link is shared everywhere: 1,200 clicks per second, and pay-per-request Lambda is burning money. Every click on the same link returns the same answer.',
          concept: 'Redirects are cacheable: CloudFront keeps the response at the edge, so most clicks never reach Lambda.',
          nudge: 'Put CloudFront in front of API Gateway and turn on "Cache API responses".',
        },
      },
      scenario: { traffic: 1200, mix: { read: 0.97, write: 0.03 }, audience: { 'us-east-1': 1 }, latencyTarget: 200, budget: 110, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 'cost-compute-serverless-containers'],
      solution: edge,
      naive: serverless,
    },
    {
      id: 'short-global',
      text: {
        vi: {
          title: 'Bấm từ khắp nơi',
          story: '60% lượt bấm đến từ châu Âu. Người dùng ở xa phải chờ lâu, mục tiêu giờ là dưới 100 ms.',
          concept: 'CloudFront đã trả phần cache được ở edge. Phần còn lại (link mới, link hiếm) cần Global Accelerator để đi trên mạng backbone AWS thay vì Internet công cộng.',
          nudge: 'Chèn Global Accelerator giữa CloudFront và API Gateway.',
        },
        en: {
          title: 'Clicks from everywhere',
          story: '60% of clicks come from Europe. Far-away users wait too long; the target is now under 100 ms.',
          concept: 'CloudFront already answers cacheable clicks at the edge. The rest (new or rare links) needs Global Accelerator to ride the AWS backbone instead of the public internet.',
          nudge: 'Put Global Accelerator between CloudFront and API Gateway.',
        },
      },
      scenario: { traffic: 1500, mix: { read: 0.97, write: 0.03 }, audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 }, latencyTarget: 100, budget: 160, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 'route53-routing'],
      solution: accelerated,
      naive: edge,
    },
    {
      id: 'short-spam',
      text: {
        vi: {
          title: 'Bot tạo link rác',
          story: 'Một botnet bơm yêu cầu rác gấp 6 lần lưu lượng thật. Lambda và DynamoDB trả theo yêu cầu, nên mỗi yêu cầu rác đều tốn tiền.',
          concept: 'Chặn bot ở vòng ngoài bằng WAF (rate-based rule) để không phải trả tiền cho lưu lượng tấn công.',
          nudge: 'Đặt WAF ngay sau Người dùng, trước CloudFront.',
        },
        en: {
          title: 'Spam bots',
          story: 'A botnet pumps junk requests at 6× real traffic. Lambda and DynamoDB charge per request, so every junk request costs money.',
          concept: 'Stop bots at the edge with WAF (rate-based rules) so you never pay for attack traffic.',
          nudge: 'Put WAF right after Users, in front of CloudFront.',
        },
      },
      scenario: {
        traffic: 1500,
        mix: { read: 0.97, write: 0.03 },
        audience: { 'us-east-1': 0.4, 'eu-west-1': 0.6 },
        twist: 'ddos',
        latencyTarget: 120,
        budget: 160,
        requirements: [],
      },
      unlocks: [],
      lessons: ['threat-detection-waf-shield'],
      solution: shielded,
      naive: accelerated,
    },
  ],
};
