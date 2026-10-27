import { makeBoard } from '../board';
import type { Track } from '../rounds';

const origin = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['lb', 'alb', 300, 240],
    ['web', 'ec2', 500, 240, { size: 'large' }],
    ['files', 's3', 700, 100],
    ['db', 'rds', 700, 300, { size: 'medium' }],
  ],
  [
    ['users', 'lb'],
    ['lb', 'web'],
    ['web', 'files'],
    ['web', 'db'],
  ],
);

const cdn = makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240],
    ['files', 's3', 460, 100],
    ['lb', 'alb', 460, 300],
    ['web', 'ec2', 660, 300, { size: 'medium' }],
    ['db', 'rds', 860, 300, { size: 'medium' }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'db'],
  ],
);

const queued = (worker: Record<string, unknown>) =>
  makeBoard(
    [
      ['users', 'users', 80, 240],
      ['cdn', 'cloudfront', 260, 240],
      ['files', 's3', 460, 100],
      ['lb', 'alb', 460, 300],
      ['web', 'ec2', 660, 300, { size: 'medium' }],
      ['db', 'rds', 860, 300, { size: 'medium' }],
      ['queue', 'sqs', 660, 460],
      ['worker', 'ec2', 860, 460, worker],
    ],
    [
      ['users', 'cdn'],
      ['cdn', 'files'],
      ['cdn', 'lb'],
      ['lb', 'web'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
    ],
  );

const transcode = queued({ size: 'medium' });
const spot = queued({ size: 'large', pricing: 'spot' });

const catalog = (webs: Record<string, unknown>) => makeBoard(
  [
    ['users', 'users', 80, 240],
    ['cdn', 'cloudfront', 260, 240, { cacheApi: true }],
    ['files', 's3', 460, 100],
    ['lb', 'alb', 460, 300],
    ['web', 'ec2', 660, 300, webs],
    ['cache', 'elasticache', 860, 160],
    ['db', 'rds', 860, 300, { size: 'medium' }],
    ['queue', 'sqs', 660, 460],
    ['worker', 'ec2', 860, 460, { size: 'large', pricing: 'spot' }],
  ],
  [
    ['users', 'cdn'],
    ['cdn', 'files'],
    ['cdn', 'lb'],
    ['lb', 'web'],
    ['web', 'cache'],
    ['web', 'db'],
    ['web', 'queue'],
    ['queue', 'worker'],
  ],
);
const browse = catalog({ size: 'medium', count: 2 });

const twoRegions = (web: Record<string, unknown>, web2: Record<string, unknown>, db2: Record<string, unknown> = { size: 'medium' }) =>
  makeBoard(
    [
      ['users', 'users', 80, 340],
      ['cdn', 'cloudfront', 240, 340, { cacheApi: true }],
      ['dns', 'route53', 400, 340],
      ['files', 's3', 600, 60],
      ['lb', 'alb', 600, 200],
      ['web', 'ec2', 800, 200, web],
      ['cache', 'elasticache', 1000, 100],
      ['db', 'rds', 1000, 240, { size: 'medium' }],
      ['queue', 'sqs', 800, 360],
      ['worker', 'ec2', 1000, 380, { size: 'large', pricing: 'spot' }],
      ['files2', 's3', 600, 500, { region: 'eu-west-1' }],
      ['lb2', 'alb', 600, 640, { region: 'eu-west-1' }],
      ['web2', 'ec2', 800, 640, { ...web2, region: 'eu-west-1' }],
      ['db2', 'rds', 1000, 640, { ...db2, region: 'eu-west-1' }],
    ],
    [
      ['users', 'cdn'],
      ['cdn', 'dns'],
      ['dns', 'files'],
      ['dns', 'lb'],
      ['dns', 'files2'],
      ['dns', 'lb2'],
      ['lb', 'web'],
      ['web', 'cache'],
      ['web', 'db'],
      ['web', 'queue'],
      ['queue', 'worker'],
      ['lb2', 'web2'],
      ['web2', 'db2'],
      // db2 is a cross-Region replica of db: eu-west-1 reads it locally and sends writes to the primary.
      ['db', 'db2'],
      ['web2', 'db'],
      // After failover db is stale and db2 is the new primary for both Regions.
      ['web', 'db2'],
    ],
  );
const failover = twoRegions({ size: 'medium', count: 2 }, { size: 'medium', count: 2 });
const sale = twoRegions({ size: 'medium', count: 2, autoScaling: true, maxCount: 5 }, { size: 'medium', count: 2, autoScaling: true, maxCount: 5 }, { size: 'large' });

export const videoStreaming: Track = {
  id: 'video-streaming',
  difficulty: 'hard',
  text: {
    vi: {
      title: 'Nền tảng video khoá học',
      pitch: 'Một nền tảng e-learning: video phát mượt cho học viên ở mọi châu lục, video mới được chuyển mã tự động, và hệ thống vẫn chạy khi một Region gặp sự cố.',
      tags: ['CloudFront', 'SQS + Spot', 'Route 53', 'Multi-Region'],
    },
    en: {
      title: 'Course video platform',
      pitch: 'An e-learning platform: smooth playback on every continent, automatic transcoding of new uploads, and service that continues through a Region failure.',
      tags: ['CloudFront', 'SQS + Spot', 'Route 53', 'Multi-Region'],
    },
  },
  rounds: [
    {
      id: 'vid-1-launch',
      text: {
        vi: {
          title: 'Ra mắt khoá học đầu tiên',
          story: '2.000 yêu cầu/giây, 85% là đoạn video và ảnh tĩnh, 12% xem danh sách bài học, 3% lưu tiến độ. Một nửa học viên ở châu Âu, xa us-east-1. Mục tiêu dưới 110 ms, ngân sách $115/tháng.',
          concept: 'Nội dung tĩnh nằm trên S3 và được CloudFront phát từ edge gần học viên: máy chủ không phải gánh video, người ở xa không phải chờ thêm ~150 ms.',
          nudge: 'Người dùng → CloudFront. CloudFront → S3 cho video, và CloudFront → ALB → EC2 → RDS cho phần còn lại.',
        },
        en: {
          title: 'First course goes live',
          story: '2,000 requests/s: 85% video segments and images, 12% lesson lists, 3% progress saves. Half the students are in Europe, far from us-east-1. Target under 110 ms, budget $115/month.',
          concept: 'Static content lives in S3 and CloudFront serves it from an edge near each student: servers stop carrying video and far users skip the ~150 ms trip.',
          nudge: 'Users → CloudFront. CloudFront → S3 for video, and CloudFront → ALB → EC2 → RDS for the rest.',
        },
      },
      scenario: { traffic: 2000, mix: { static: 0.85, read: 0.12, write: 0.03 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 110, budget: 115, requirements: [] },
      unlocks: [],
      lessons: ['edge-networking', 's3-performance'],
      solution: cdn,
      naive: origin,
    },
    {
      id: 'vid-2-transcode',
      text: {
        vi: {
          title: 'Giảng viên tải video lên',
          story: 'Lưu lượng lên 2.500 yêu cầu/giây và 5% là video mới cần chuyển mã sang nhiều độ phân giải. Chuyển mã ngay trong máy chủ web làm học viên chờ thêm 400 ms và tốn gấp ba sức xử lý. Mọi job phải được xử lý xong trong vòng chơi.',
          concept: 'Tách việc nặng ra khỏi luồng web: máy chủ đẩy job vào SQS rồi trả lời ngay, một nhóm worker riêng lấy job ra chuyển mã.',
          nudge: 'Nối máy chủ web → SQS → một EC2 worker riêng (kích cỡ Vừa là đủ).',
        },
        en: {
          title: 'Instructors upload videos',
          story: 'Traffic grows to 2,500 requests/s and 5% are new videos to transcode into several resolutions. Transcoding inside the web servers adds 400 ms and triples the work. Every job must be done by the end of the round.',
          concept: 'Move heavy work off the request path: the web tier drops a job into SQS and answers at once, a separate worker fleet pulls jobs and transcodes.',
          nudge: 'Connect the web server → SQS → a separate EC2 worker (Medium is enough).',
        },
      },
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 110, budget: 150, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['decoupling-messaging'],
      solution: transcode,
      naive: cdn,
    },
    {
      id: 'vid-3-spot',
      text: {
        vi: {
          title: 'Cắt chi phí chuyển mã',
          story: 'Ngân sách giảm còn $135/tháng. Chuyển mã không gấp, chậm vài phút cũng được, nhưng AWS có thể thu hồi máy Spot giữa chừng. Hàng đợi vẫn phải trống khi hết vòng.',
          concept: 'Worker đọc từ hàng đợi là việc hợp với Spot (rẻ hơn ~70%): khi máy bị thu hồi, job vẫn nằm an toàn trong SQS. Chỉ cần đủ dư sức để xử lý bù phần tồn sau đó.',
          nudge: 'Đổi worker sang Spot và tăng lên kích cỡ Lớn để kịp xử lý phần tồn sau khi bị thu hồi.',
        },
        en: {
          title: 'Cheaper transcoding',
          story: 'The budget drops to $135/month. Transcoding is not urgent, a few minutes late is fine, but AWS can reclaim Spot instances mid-round. The queue must still be empty at the end.',
          concept: 'Queue workers are a perfect fit for Spot (~70% cheaper): when instances are reclaimed, jobs wait safely in SQS. You just need spare capacity to catch up afterwards.',
          nudge: 'Switch the worker to Spot and size it up to Large so it can clear the backlog after the interruption.',
        },
      },
      scenario: { traffic: 2500, mix: { static: 0.8, read: 0.12, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'spotInterruption', latencyTarget: 110, budget: 135, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['ec2-pricing-models'],
      solution: spot,
      naive: queued({ size: 'medium', pricing: 'spot' }),
    },
    {
      id: 'vid-4-catalog',
      text: {
        vi: {
          title: 'Mùa tuyển sinh',
          story: '4.000 yêu cầu/giây và học viên lướt danh mục khoá học nhiều hơn: 20% là yêu cầu đọc. RDS và máy chủ web quá tải, mục tiêu siết xuống 100 ms, ngân sách $200/tháng.',
          concept: 'Danh mục khoá học ai xem cũng giống nhau: cache ở edge bằng CloudFront và cache trong Region bằng ElastiCache để phần lớn yêu cầu đọc không chạm tới database.',
          nudge: 'Bật "Cache cả phản hồi API" trên CloudFront, thêm ElastiCache cạnh RDS, và chạy 2 máy chủ web kích cỡ Vừa.',
        },
        en: {
          title: 'Enrollment season',
          story: '4,000 requests/s and students browse the catalog more: 20% are reads. RDS and the web tier are overloaded, the target tightens to 100 ms, budget $200/month.',
          concept: 'The course catalog looks the same for everyone: cache it at the edge with CloudFront and in the Region with ElastiCache so most reads never reach the database.',
          nudge: 'Turn on "Cache API responses" on CloudFront, add ElastiCache next to RDS, and run 2 Medium web servers.',
        },
      },
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, latencyTarget: 100, budget: 200, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['nosql-caching', 'edge-networking'],
      solution: browse,
      naive: catalog({ size: 'large', count: 2 }),
    },
    {
      id: 'vid-5-region',
      text: {
        vi: {
          title: 'Cả Region sập',
          story: 'us-east-1 mất điện trong gần nửa vòng chơi. S3, ALB, EC2 và RDS ở đó đều chết, CloudFront không còn nơi nào để lấy nội dung. Học viên ở châu Âu vẫn chiếm một nửa. Ngân sách $330/tháng.',
          concept: 'Dựng một stack thứ hai ở eu-west-1 (S3, ALB, EC2, database) và đặt Route 53 sau CloudFront: health check chuyển sang Region còn sống, còn latency routing đưa học viên châu Âu về Region gần họ.',
          nudge: 'CloudFront → Route 53 → S3 + ALB ở cả hai Region. Ở eu-west-1: ALB → 2 EC2 Vừa → RDS Vừa, là bản sao của RDS us-east-1. Nối EC2 mỗi Region tới cả hai RDS: ghi vào bản chính, kể cả khi bản chính đã chuyển sang eu-west-1 sau failover.',
        },
        en: {
          title: 'A whole Region goes down',
          story: 'us-east-1 loses power for almost half the round. Its S3, ALB, EC2 and RDS all die, leaving CloudFront with no origin. Half the students are still in Europe. Budget $330/month.',
          concept: 'Build a second stack in eu-west-1 (S3, ALB, EC2, database) and put Route 53 behind CloudFront: health checks fail over to the live Region and latency routing sends European students to the closer one.',
          nudge: 'CloudFront → Route 53 → S3 + ALB in both Regions. In eu-west-1: ALB → 2 Medium EC2 → Medium RDS, a replica of the us-east-1 RDS. Link the EC2 in each Region to both RDS: writes go to the primary, even after failover moves it to eu-west-1.',
        },
      },
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'regionOutage', outageRegion: 'us-east-1', latencyTarget: 120, budget: 330, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['disaster-recovery', 'route53-routing'],
      solution: failover,
      naive: browse,
    },
    {
      id: 'vid-6-sale',
      text: {
        vi: {
          title: 'Ngày hội giảm giá',
          story: 'Đợt giảm giá cuối năm làm lưu lượng tăng gấp ba trong vài phút giữa vòng chơi, ở cả hai Region. Giữ đủ máy cho đỉnh cả ngày thì vượt ngân sách $440/tháng.',
          concept: 'Auto Scaling Group thêm máy khi tải tăng và bớt máy khi hết đợt, nên chỉ trả cho đỉnh lúc nó xảy ra. Database ở eu-west-1 cũng phải chịu được phần tăng của học viên châu Âu.',
          nudge: 'Bật Auto Scaling Group (tối đa 5 máy) cho máy chủ web ở cả hai Region và nâng RDS dự phòng lên kích cỡ Lớn.',
        },
        en: {
          title: 'Big sale day',
          story: 'The year-end sale triples traffic for a few minutes mid-round, in both Regions. Keeping enough servers for the peak all day blows the $440/month budget.',
          concept: 'An Auto Scaling Group adds instances as load rises and removes them afterwards, so you only pay for the peak while it lasts. The eu-west-1 database must also absorb the European surge.',
          nudge: 'Turn on Auto Scaling Group (max 5) for the web servers in both Regions and size the eu-west-1 RDS up to Large.',
        },
      },
      scenario: { traffic: 4000, mix: { static: 0.72, read: 0.2, write: 0.03, job: 0.05 }, audience: { 'us-east-1': 0.5, 'eu-west-1': 0.5 }, twist: 'flashSale', latencyTarget: 120, budget: 440, requirements: ['drainQueue'] },
      unlocks: [],
      lessons: ['auto-scaling'],
      solution: sale,
      naive: failover,
    },
  ],
};
