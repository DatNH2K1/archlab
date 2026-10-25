import type { RoundText } from './rounds';

/** Texts of the Learn rounds, by round id. */
export const LEARN_TEXT: Record<string, { vi: RoundText; en: RoundText }> = {
  'first-users': {
    vi: {
      title: 'Bản beta kín',
      story: 'Bản beta kín vừa mở cho nhóm người dùng đầu tiên: khoảng 50 yêu cầu mỗi giây, chủ yếu xem trang và lưu dữ liệu.',
      concept: 'Yêu cầu nào cũng cần một máy chủ (EC2) để chạy code và một database (RDS) để đọc/ghi dữ liệu.',
      nudge: 'Kéo EC2 và RDS vào, rồi nối Người dùng → EC2 → RDS.',
    },
    en: {
      title: 'Closed beta',
      story: 'The closed beta just opened to the first testers: about 50 requests per second, mostly page views and saved data.',
      concept: 'Every request needs a server (EC2) to run code and a database (RDS) to read and write.',
      nudge: 'Drag in EC2 and RDS, then connect Users → EC2 → RDS.',
    },
  },
  'scale-up': {
    vi: {
      title: 'Lên báo địa phương',
      story: 'Một tờ báo nhắc tới ứng dụng của bạn. Lưu lượng tăng lên 350 yêu cầu/giây.',
      concept: 'Scale dọc (vertical scaling): đổi sang máy mạnh hơn. Nhanh, nhưng có giới hạn và vẫn là điểm chết duy nhất.',
      nudge: 'Chọn EC2, đổi kích cỡ sang Vừa. RDS cũng cần cỡ Vừa.',
    },
    en: {
      title: 'In the local news',
      story: 'A newspaper mentioned your app. Traffic is up to 350 req/s.',
      concept: 'Vertical scaling: move to a bigger instance. Quick, but it has a ceiling and is still a single point of failure.',
      nudge: 'Select EC2 and set Size to Medium. RDS needs Medium too.',
    },
  },
  'scale-out': {
    vi: {
      title: 'Lên top App Store',
      story: '1.300 yêu cầu/giây. Đến máy mạnh nhất cũng vượt ngân sách.',
      concept: 'Scale ngang (horizontal scaling): nhiều máy nhỏ đứng sau Application Load Balancer vừa rẻ hơn vừa bền hơn một máy to.',
      nudge: 'Người dùng → ALB → 3 EC2 cỡ Vừa → RDS cỡ Lớn.',
    },
    en: {
      title: 'Top of the App Store',
      story: '1,300 req/s. Even the biggest single machine blows the budget.',
      concept: 'Horizontal scaling: several small servers behind an Application Load Balancer are cheaper and sturdier than one big box.',
      nudge: 'Users → ALB → EC2 Medium ×3 → RDS Large.',
    },
  },
  'az-outage': {
    vi: {
      title: 'Một AZ mất điện',
      story: 'Mọi thứ đang chạy ổn ở AZ us-east-1a… cho tới hôm nay.',
      concept: 'Sẵn sàng cao (high availability): trải máy chủ qua ít nhất 2 AZ và bật RDS Multi-AZ để tự chuyển sang bản dự phòng.',
      nudge: '2 EC2 đặt ở "Cả a và b" sau ALB; bật Multi-AZ cho RDS.',
    },
    en: {
      title: 'An AZ loses power',
      story: 'Everything runs nicely in us-east-1a… until today.',
      concept: 'High availability: spread servers across 2+ AZs and turn on RDS Multi-AZ for automatic failover.',
      nudge: 'EC2 ×2 with AZ "a+b" behind the ALB; turn on Multi-AZ for RDS.',
    },
  },
  'flash-sale': {
    vi: {
      title: 'Flash sale 12 giờ trưa',
      story: 'Bình thường chỉ 220 yêu cầu/giây, nhưng flash sale đẩy lên gấp 3. Trả tiền cho mức đỉnh cả ngày thì lỗ.',
      concept: 'Auto Scaling Group: tự thêm máy khi tải tăng, bớt máy khi tải giảm. Chỉ trả tiền cho máy đang chạy.',
      nudge: 'Bật Auto Scaling cho EC2 cỡ Vừa (tối thiểu 1, tối đa 3). RDS cỡ Lớn để chịu giờ cao điểm.',
    },
    en: {
      title: 'Noon flash sale',
      story: 'Normally 220 req/s, but the flash sale triples it. Paying for the peak all day loses money.',
      concept: 'Auto Scaling Group: add instances when load rises, remove them when it falls. Pay only for what runs.',
      nudge: 'Turn on Auto Scaling for EC2 Medium (min 1, max 3). RDS Large handles the peak.',
    },
  },
  'region-down': {
    vi: {
      title: 'Cả Region sập',
      story: 'Sếp hỏi: "Nếu cả us-east-1 sập thì sao?" Hôm nay là lúc kiểm chứng câu trả lời.',
      concept: 'Khôi phục sau thảm hoạ (DR): dựng sẵn một bản ở Region khác (warm standby) và để Route 53 chuyển sang khi health check báo lỗi.',
      nudge: 'Người dùng → Route 53 → hai bộ ALB → EC2 → Aurora; bộ thứ hai đặt ở eu-west-1.',
    },
    en: {
      title: 'The whole Region goes down',
      story: 'Your boss asks: "What if all of us-east-1 goes down?" Today you find out.',
      concept: 'Disaster recovery: run a copy in another Region (warm standby) and let Route 53 fail over when health checks fail.',
      nudge: 'Users → Route 53 → two ALB → EC2 → Aurora stacks; put the second stack in eu-west-1.',
    },
  },
  'cache-it': {
    vi: {
      title: 'Đọc nhiều, ghi ít',
      story: '95% yêu cầu chỉ đọc đi đọc lại cùng một nhóm dữ liệu. Database đang phải gồng mình.',
      concept: 'Dùng cache: ElastiCache trả phần lớn yêu cầu đọc trong 1–2 ms để database nhỏ lại.',
      nudge: 'Nối EC2 tới cả ElastiCache và RDS. Cache gánh 85% yêu cầu đọc nên RDS cỡ Vừa là đủ.',
    },
    en: {
      title: 'Lots of reads, few writes',
      story: '95% of requests read the same hot data. The database is straining.',
      concept: 'Caching: ElastiCache answers most reads in 1–2 ms so the database can shrink.',
      nudge: 'Connect EC2 to both ElastiCache and RDS. The cache answers 85% of reads, so RDS Medium is enough.',
    },
  },
  'cache-crash': {
    vi: {
      title: 'Cache sập',
      story: 'Cache giúp tiết kiệm rất nhiều, nhưng nếu nó chết thì sao?',
      concept: 'Cache cũng cần sẵn sàng cao: bật bản sao Multi-AZ, hoặc để database đủ sức chịu khi mất cache.',
      nudge: 'Bật Multi-AZ cho ElastiCache (hoặc thêm Read Replica để gánh yêu cầu đọc).',
    },
    en: {
      title: 'The cache crashes',
      story: 'The cache saves a lot, but what if it dies?',
      concept: 'Caches need HA too: use a Multi-AZ replica, or keep a database that survives without the cache.',
      nudge: 'Turn on Multi-AZ for ElastiCache (or add read replicas to take reads).',
    },
  },
  'static-files': {
    vi: {
      title: 'Toàn là ảnh',
      story: 'Ứng dụng giờ toàn ảnh: 85% trong 4.000 yêu cầu/giây là tải file tĩnh.',
      concept: 'Đừng bắt máy chủ trả file tĩnh: để S3 lưu trữ và CloudFront phát từ edge.',
      nudge: 'Người dùng → CloudFront; CloudFront → S3 (file tĩnh) và → ALB → EC2 → RDS (phần động).',
    },
    en: {
      title: 'Images, images, images',
      story: 'The app is now all images: 85% of 4,000 req/s are static files.',
      concept: 'Do not make servers send static files: store them in S3 and serve them from CloudFront edges.',
      nudge: 'Users → CloudFront; CloudFront → S3 (static) and → ALB → EC2 → RDS (dynamic).',
    },
  },
  'global-users': {
    vi: {
      title: 'Người dùng khắp thế giới',
      story: '70% người dùng ở châu Âu, trong khi hệ thống đặt ở us-east-1. Mục tiêu: không quá 140 ms.',
      concept: 'Xa thì chậm: đưa nội dung tới edge (CloudFront) và đi đường backbone của AWS (Global Accelerator).',
      nudge: 'Đặt CloudFront trước mọi thứ, bật "Cache cả phản hồi API", dùng S3 cho file tĩnh.',
    },
    en: {
      title: 'Users all over the world',
      story: '70% of users are in Europe, but the system lives in us-east-1. Target: 140 ms or less.',
      concept: 'Distance means latency: bring content to the edge (CloudFront) and ride the AWS backbone (Global Accelerator).',
      nudge: 'Put CloudFront in front of everything, turn on "Cache API responses", use S3 for static files.',
    },
  },
  'background-jobs': {
    vi: {
      title: 'Gửi email và xuất PDF',
      story: '30% yêu cầu là việc nặng: gửi email, xuất hoá đơn PDF. Người dùng phải chờ 400 ms mỗi lần.',
      concept: 'Xử lý bất đồng bộ: đẩy việc nặng vào SQS, trả lời người dùng ngay, để worker làm sau.',
      nudge: 'EC2 web → SQS → EC2 worker → RDS. EC2 web vẫn nối RDS để đọc/ghi.',
    },
    en: {
      title: 'Emails and PDF exports',
      story: '30% of requests are heavy jobs: emails and PDF invoices. Users wait 400 ms each time.',
      concept: 'Decoupling: push heavy work onto SQS, answer the user right away, let workers do it later.',
      nudge: 'Web EC2 → SQS → worker EC2 → RDS. The web tier still talks to RDS for reads and writes.',
    },
  },
  'fan-out': {
    vi: {
      title: 'Một đơn hàng, nhiều hệ thống',
      story: 'Mỗi đơn hàng phải tới cả hệ thống email lẫn hệ thống phân tích, và hệ này hỏng không được kéo theo hệ kia.',
      concept: 'Fan-out: SNS đẩy một message tới nhiều hàng đợi SQS, mỗi hàng đợi có worker riêng.',
      nudge: 'EC2 → SNS → 2 hàng đợi SQS → mỗi hàng đợi một EC2 worker cỡ Vừa.',
    },
    en: {
      title: 'One order, many systems',
      story: 'Every order must reach both email and analytics, and one failing must not take down the other.',
      concept: 'Fan-out: SNS pushes one message to many SQS queues, each with its own worker.',
      nudge: 'EC2 → SNS → 2 SQS queues → one EC2 Medium worker each.',
    },
  },
  'lock-it-down': {
    vi: {
      title: 'Kiểm toán bảo mật',
      story: 'Kiểm toán viên mở thiết kế của bạn và nhíu mày: database nối thẳng ra Internet, lại không mã hoá.',
      concept: 'Phòng thủ nhiều lớp: database trong private subnet, máy chủ đứng sau load balancer, dữ liệu mã hoá bằng KMS.',
      nudge: 'Xoá đường nối Người dùng → RDS, đặt ALB trước EC2, bật mã hoá cho RDS.',
    },
    en: {
      title: 'Security audit',
      story: 'The auditor opens your board and frowns: the database faces the internet, unencrypted.',
      concept: 'Defense in depth: databases in private subnets, servers behind a load balancer, data encrypted with KMS.',
      nudge: 'Delete the Users → RDS wire, put an ALB in front of EC2, turn on encryption for RDS.',
    },
  },
  'bot-attack': {
    vi: {
      title: 'Bot tấn công',
      story: 'Một botnet bắn yêu cầu rác nhiều gấp 6 lần lưu lượng thật.',
      concept: 'Chặn từ vòng ngoài: WAF lọc bot và chặn theo tần suất trước khi tới máy chủ. Mua thêm máy chỉ là trả tiền cho kẻ tấn công.',
      nudge: 'Người dùng → WAF → ALB → EC2 → RDS.',
    },
    en: {
      title: 'Bot attack',
      story: 'A botnet fires junk requests at 6× your real traffic.',
      concept: 'Block at the edge: WAF filters bots and floods before they reach servers. Buying more servers just pays the attacker.',
      nudge: 'Users → WAF → ALB → EC2 → RDS.',
    },
  },
  'serverless': {
    vi: {
      title: 'Dự án phụ, ví mỏng',
      story: 'Chỉ 20 yêu cầu/giây và ngân sách $12/tháng. Riêng một EC2 + RDS đã vượt.',
      concept: 'Serverless: API Gateway + Lambda + DynamoDB on-demand, trả theo từng yêu cầu, gần như $0 khi vắng khách.',
      nudge: 'Người dùng → API Gateway → Lambda → DynamoDB.',
    },
    en: {
      title: 'Side project, thin wallet',
      story: 'Only 20 req/s and a $12/month budget. One EC2 + RDS is already over.',
      concept: 'Serverless: API Gateway + Lambda + DynamoDB on-demand, pay per request, almost $0 when idle.',
      nudge: 'Users → API Gateway → Lambda → DynamoDB.',
    },
  },
  'spot-workers': {
    vi: {
      title: 'Worker giá rẻ',
      story: '60% lưu lượng là tác vụ xử lý ảnh. Worker On-Demand vượt ngân sách.',
      concept: 'Spot rẻ tới 90% nhưng có thể bị thu hồi. Kết hợp SQS: việc nằm chờ trong hàng đợi và được xử lý bù sau.',
      nudge: '2 EC2 worker cỡ Lớn, tính giá Spot, nhận việc từ SQS.',
    },
    en: {
      title: 'Cheap workers',
      story: '60% of traffic is image processing. On-Demand workers blow the budget.',
      concept: 'Spot is up to 90% cheaper but can be taken back. With SQS, jobs wait in the queue and catch up later.',
      nudge: 'Worker EC2 Large ×2 on Spot pricing, fed by SQS.',
    },
  },
  'steady-table': {
    vi: {
      title: 'Lưu lượng đều đặn',
      story: '2.000 yêu cầu/giây suốt ngày đêm, gần như không đổi. DynamoDB on-demand tính tiền từng yêu cầu.',
      concept: 'Lưu lượng dễ đoán → provisioned capacity rẻ hơn on-demand. Lưu lượng khó đoán → on-demand.',
      nudge: 'Bật Provisioned capacity cho DynamoDB, kích cỡ Lớn.',
    },
    en: {
      title: 'Steady traffic',
      story: '2,000 req/s day and night, barely changing. DynamoDB on-demand bills every request.',
      concept: 'Predictable traffic → provisioned capacity beats on-demand. Unpredictable traffic → on-demand.',
      nudge: 'Turn on provisioned capacity for DynamoDB, size Large.',
    },
  },
  'reserved': {
    vi: {
      title: 'Chạy 24/7 cả năm',
      story: 'Tải ổn định 1.000 yêu cầu/giây và sẽ chạy suốt năm. Ngân sách vừa bị cắt.',
      concept: 'Cam kết 1–3 năm (Reserved Instances / Savings Plans) giảm tới ~72% cho phần tải nền ổn định.',
      nudge: '3 EC2 cỡ Vừa tính giá Reserved; thêm ElastiCache để RDS chỉ cần cỡ Vừa.',
    },
    en: {
      title: 'Running 24/7 all year',
      story: 'A steady 1,000 req/s that will run all year. The budget got cut.',
      concept: 'A 1–3 year commitment (Reserved Instances / Savings Plans) saves up to ~72% on steady base load.',
      nudge: 'EC2 Medium ×3 on Reserved pricing; add ElastiCache so RDS can stay Medium.',
    },
  },
  'final-boss': {
    vi: {
      title: 'Ngày ra mắt toàn cầu',
      story: 'Mọi thứ cùng lúc: người dùng khắp thế giới, ảnh, tác vụ nền, kiểm toán bảo mật, và một AZ sắp sập.',
      concept: 'Kết hợp tất cả: edge, sẵn sàng cao nhiều AZ, cache, xử lý bất đồng bộ, mã hoá và chi phí hợp lý.',
      nudge: 'CloudFront (+S3, cache API) → ALB → EC2 (cả a và b, Auto Scaling) → ElastiCache + RDS (Multi-AZ, mã hoá); EC2 → SQS → worker.',
    },
    en: {
      title: 'Global launch day',
      story: 'Everything at once: global users, images, background jobs, a security audit, and an AZ about to fail.',
      concept: 'Combine it all: edge, multi-AZ HA, caching, decoupling, encryption and sensible cost.',
      nudge: 'CloudFront (+S3, API cache) → ALB → EC2 (AZ a+b, ASG) → ElastiCache + RDS (Multi-AZ, encrypted); EC2 → SQS → worker.',
    },
  },
};
