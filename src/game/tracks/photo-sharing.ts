import { makeBoard } from '../board';
import type { Track } from '../rounds';
import type { NodeConfig } from '../types';

type Cfg = Partial<NodeConfig>;
type NodeSpec = Parameters<typeof makeBoard>[0][number];
type EdgeSpec = [string, string];

const front = (cdn: Cfg = {}, app: Cfg = { size: 'medium' }, db: Cfg = {}): NodeSpec[] => [
  ['users', 'users', 80, 260],
  ['cdn', 'cloudfront', 260, 260, cdn],
  ['photos', 's3', 460, 100],
  ['lb', 'alb', 460, 260],
  ['app', 'ec2', 660, 260, app],
  ['db', 'rds', 880, 260, db],
];

const frontEdges: EdgeSpec[] = [
  ['users', 'cdn'],
  ['cdn', 'photos'],
  ['cdn', 'lb'],
  ['lb', 'app'],
  ['app', 'db'],
];

const launch = makeBoard(front(), frontEdges);

const queued = makeBoard(
  [...front(), ['queue', 'sqs', 660, 440], ['thumbs', 'ec2', 880, 440, { size: 'medium' }]],
  [...frontEdges, ['app', 'queue'], ['queue', 'thumbs']],
);

const fanOut = (worker: Cfg, options: { cdn?: Cfg; app?: Cfg; db?: Cfg; cache?: boolean } = {}) =>
  makeBoard(
    [
      ...front(options.cdn, options.app, options.db ?? { size: 'medium' }),
      ...(options.cache ? ([['cache', 'elasticache', 880, 120]] satisfies NodeSpec[]) : []),
      ['topic', 'sns', 660, 440],
      ['qThumbs', 'sqs', 880, 440],
      ['qFeed', 'sqs', 880, 600],
      ['thumbs', 'ec2', 1080, 440, worker],
      ['feed', 'ec2', 1080, 600, worker],
    ],
    [
      ...frontEdges,
      ...(options.cache ? ([['app', 'cache']] satisfies EdgeSpec[]) : []),
      ['app', 'topic'],
      ['topic', 'qThumbs'],
      ['topic', 'qFeed'],
      ['qThumbs', 'thumbs'],
      ['qFeed', 'feed'],
    ],
  );

const mixWithJobs = { static: 0.7, read: 0.15, write: 0.05, job: 0.1 };

export const photoSharing: Track = {
  id: 'photo-sharing',
  difficulty: 'medium',
  text: {
    vi: {
      title: 'Chia sẻ ảnh',
      pitch: 'Người dùng đăng ảnh, bạn bè xem và nhận thông báo, cho tới ngày một tấm ảnh lan truyền khắp mạng.',
      tags: ['S3 + CloudFront', 'SQS', 'SNS fan-out', 'Spot', 'Auto Scaling'],
    },
    en: {
      title: 'Photo sharing',
      pitch: 'People post photos, friends view them and get notified, until the day one photo goes viral.',
      tags: ['S3 + CloudFront', 'SQS', 'SNS fan-out', 'Spot', 'Auto Scaling'],
    },
  },
  rounds: [
    {
      id: 'photo-1-launch',
      text: {
        vi: {
          title: 'Xem ảnh nhanh',
          story: '600 yêu cầu/giây, 75% là tải ảnh, phần còn lại là đọc feed và lưu ảnh mới (ghi). 20% người dùng ở châu Âu. Mục tiêu dưới 80 ms.',
          concept: 'Ảnh là nội dung tĩnh: để trên S3 và phát qua CloudFront. Máy chủ ứng dụng chỉ lo API.',
          nudge: 'CloudFront → S3 cho ảnh, CloudFront → ALB → EC2 → RDS cho API.',
        },
        en: {
          title: 'Fast photo views',
          story: '600 requests/s, 75% are image downloads, the rest are feed reads and new photos (writes). 20% of users are in Europe. Target under 80 ms.',
          concept: 'Images are static content: keep them in S3 and serve them through CloudFront. App servers only handle the API.',
          nudge: 'CloudFront → S3 for images, CloudFront → ALB → EC2 → RDS for the API.',
        },
      },
      scenario: {
        traffic: 600,
        mix: { static: 0.75, read: 0.2, write: 0.05 },
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 80,
        budget: 85,
        requirements: [],
      },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: launch,
      naive: makeBoard(
        [
          ['users', 'users', 80, 260],
          ['lb', 'alb', 280, 260],
          ['app', 'ec2', 480, 260, { size: 'medium' }],
          ['db', 'rds', 700, 260],
        ],
        [
          ['users', 'lb'],
          ['lb', 'app'],
          ['app', 'db'],
        ],
      ),
    },
    {
      id: 'photo-2-thumbs',
      text: {
        vi: {
          title: 'Tạo ảnh thu nhỏ',
          story: 'Mỗi ảnh mới cần tạo ảnh thu nhỏ: 10% yêu cầu là việc nặng. Làm ngay trong máy chủ ứng dụng thì người dùng chờ thêm 400 ms. 800 yêu cầu/giây, mục tiêu dưới 75 ms.',
          concept: 'Tách việc nặng khỏi yêu cầu: máy chủ đẩy việc vào SQS và trả lời ngay, worker riêng xử lý sau.',
          nudge: 'Nối EC2 ứng dụng → SQS → một EC2 worker kích cỡ Vừa.',
        },
        en: {
          title: 'Thumbnails',
          story: 'Every new photo needs thumbnails: 10% of requests are heavy jobs. Done inside the app server, users wait 400 ms more. 800 requests/s, target under 75 ms.',
          concept: 'Move heavy work out of the request: the server drops a job into SQS and answers at once; a separate worker does it later.',
          nudge: 'Connect app EC2 → SQS → a Medium EC2 worker.',
        },
      },
      scenario: { traffic: 800, mix: mixWithJobs, audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 }, latencyTarget: 75, budget: 125, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: queued,
      naive: makeBoard([...front(), ['thumbs', 'ec2', 880, 440, { size: 'medium' }]], [...frontEdges, ['app', 'thumbs']]),
    },
    {
      id: 'photo-3-fanout',
      text: {
        vi: {
          title: 'Báo cho người theo dõi',
          story: 'Khi có ảnh mới, ngoài tạo ảnh thu nhỏ còn phải cập nhật feed của mọi người theo dõi. Hai việc độc lập, không việc nào được chờ việc kia. 1.000 yêu cầu/giây.',
          concept: 'SNS fan-out: một tin nhắn gửi tới topic được sao chép vào nhiều hàng đợi SQS, mỗi hàng đợi có worker riêng.',
          nudge: 'EC2 ứng dụng → SNS → hai SQS (ảnh thu nhỏ, feed), mỗi SQS một EC2 worker.',
        },
        en: {
          title: 'Notify followers',
          story: 'For every new photo, besides thumbnails, every follower’s feed must be updated. Two independent jobs; neither may wait for the other. 1,000 requests/s.',
          concept: 'SNS fan-out: one message published to a topic is copied into several SQS queues, each with its own worker.',
          nudge: 'App EC2 → SNS → two SQS queues (thumbnails, feed), each with an EC2 worker.',
        },
      },
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 75,
        budget: 175,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['decoupling-messaging', 'application-integration'],
      solution: fanOut({ size: 'medium' }),
      naive: makeBoard(
        [...front(), ['queue', 'sqs', 660, 440], ['thumbs', 'ec2', 880, 440, { size: 'large' }]],
        [...frontEdges, ['app', 'queue'], ['queue', 'thumbs']],
      ),
    },
    {
      id: 'photo-4-spot',
      text: {
        vi: {
          title: 'Worker giá rẻ',
          story: 'Lưu lượng giữ nguyên nhưng ngân sách bị cắt còn $130. Worker xử lý việc từ hàng đợi, chậm vài giây cũng không sao.',
          concept: 'Việc chạy nền, chịu được gián đoạn là chỗ lý tưởng cho Spot Instances: rẻ hơn on-demand tới 70%.',
          nudge: 'Đổi cả hai EC2 worker sang giá Spot.',
        },
        en: {
          title: 'Cheap workers',
          story: 'Traffic stays the same but the budget is cut to $130. Workers process queued jobs; a few seconds of delay is fine.',
          concept: 'Background work that tolerates interruption is the ideal fit for Spot Instances: up to 70% cheaper than On-Demand.',
          nudge: 'Switch both EC2 workers to Spot pricing.',
        },
      },
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        latencyTarget: 75,
        budget: 130,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models'],
      solution: fanOut({ size: 'medium', pricing: 'spot' }),
      naive: fanOut({ size: 'small' }),
    },
    {
      id: 'photo-5-interrupt',
      text: {
        vi: {
          title: 'AWS lấy lại Spot',
          story: 'Giữa ngày, AWS thu hồi toàn bộ máy Spot trong một lúc. Việc dồn lại trong hàng đợi và phải xử lý hết trước cuối ngày.',
          concept: 'Spot có thể bị thu hồi bất cứ lúc nào. SQS giữ việc an toàn, nhưng worker cần dư công suất để xả hết phần tồn đọng khi quay lại.',
          nudge: 'Tăng worker Spot lên kích cỡ Lớn để có dư công suất xả hàng đợi.',
        },
        en: {
          title: 'Spot reclaimed',
          story: 'Midday, AWS reclaims every Spot instance for a while. Jobs pile up in the queues and must all be done by the end of the day.',
          concept: 'Spot can be reclaimed at any time. SQS keeps the jobs safe, but workers need spare capacity to drain the backlog once they return.',
          nudge: 'Grow the Spot workers to size Large so they have room to drain the queues.',
        },
      },
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: 'spotInterruption',
        latencyTarget: 75,
        budget: 150,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['ec2-pricing-models', 'decoupling-messaging'],
      solution: fanOut({ size: 'large', pricing: 'spot' }),
      naive: fanOut({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'photo-6-viral',
      text: {
        vi: {
          title: 'Ảnh lan truyền',
          story: 'Một tấm ảnh lan khắp mạng: lưu lượng tăng dần từ 1.000 lên 4.000 yêu cầu/giây trong ngày. Feed đọc nhiều hơn hẳn, việc nền cũng tăng theo.',
          concept: 'Auto Scaling cho cả máy chủ ứng dụng lẫn worker, ElastiCache và CloudFront cache để database không gánh hết lượt đọc.',
          nudge: 'Bật Auto Scaling cho EC2 ứng dụng và worker, thêm ElastiCache sau EC2 ứng dụng, bật "Cache cả phản hồi API".',
        },
        en: {
          title: 'A photo goes viral',
          story: 'One photo spreads everywhere: traffic climbs from 1,000 to 4,000 requests/s during the day. Feed reads surge and background jobs grow with them.',
          concept: 'Auto Scaling for both app servers and workers, plus ElastiCache and CloudFront caching so the database does not take every read.',
          nudge: 'Turn on Auto Scaling for the app EC2 and the workers, add ElastiCache behind the app EC2, and turn on "Cache API responses".',
        },
      },
      scenario: {
        traffic: 1000,
        mix: mixWithJobs,
        audience: { 'us-east-1': 0.8, 'eu-west-1': 0.2 },
        twist: 'viral',
        latencyTarget: 80,
        budget: 270,
        requirements: ['fanOut', 'drainQueue'],
      },
      unlocks: [],
      lessons: ['auto-scaling', 'nosql-caching'],
      solution: fanOut(
        { size: 'large', pricing: 'spot', autoScaling: true },
        { cdn: { cacheApi: true }, app: { size: 'medium', autoScaling: true }, cache: true },
      ),
      naive: fanOut({ size: 'large', pricing: 'spot' }),
    },
  ],
};
