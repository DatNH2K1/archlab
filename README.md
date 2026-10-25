# ArchLab — phòng thí nghiệm kiến trúc AWS cho SAA-C03

Game mô phỏng kéo-thả để luyện thiết kế kiến trúc AWS cho kỳ thi **AWS Certified Solutions Architect – Associate (SAA-C03)**. Dự án học tập cá nhân.

> Ý tưởng game mô phỏng (kéo-thả thành phần, chạy tải qua từng màn) lấy cảm hứng từ [gonnacrash.com](https://gonnacrash.com/). ArchLab không liên kết với gonnacrash.com hay AWS; mã nguồn, nội dung và giao diện được viết riêng. Dựng trên [Next.js Boilerplate](https://github.com/ixartz/Next-js-Boilerplate) (Next 16, next-intl, Tailwind v4, Vitest, Playwright), đã bỏ Clerk, Drizzle, Sentry và Arcjet. Tiến độ lưu ở localStorage.

## Có gì

- **Learn**: 19 round, 7 chương, bám 4 domain SAA-C03. Mỗi round có traffic, ngân sách, mục tiêu độ trễ, có thể có twist (mất AZ, mất Region, flash sale, Spot bị thu hồi, DDoS, cache sập) và quy định bảo mật.
- **16 dịch vụ AWS** trên board: Route 53, Global Accelerator, WAF, CloudFront, ALB, API Gateway, EC2 (size, số bản sao, AZ, On-Demand/Reserved/Spot, Auto Scaling), Lambda (provisioned concurrency), ElastiCache, RDS (Multi-AZ), Aurora, Read Replica, DynamoDB (on-demand/provisioned), S3, SQS, SNS. Cài đặt thêm: mã hoá KMS, Region dự phòng.
- **Sandbox**: tự chỉnh traffic, tỉ lệ đọc/ghi/file tĩnh/job, người dùng ở xa, twist và quy định.
- **Phần ôn thi** (phụ): 30 bài học, 200 câu hỏi tình huống (luyện từng câu hoặc thi thử 65 câu / 130 phút), 160 flashcard. Có đủ tiếng Việt và tiếng Anh.
- **i18n**: tiếng Việt (mặc định, `/`) và tiếng Anh (`/en`).

## Chạy

Cần Node 20.19+; lint của boilerplate (ultracite/oxlint) cần Node 22.18+, nên dùng Node 24.

```bash
npm install
npm run dev
```

Kiểm tra:

```bash
npm test               # engine mô phỏng + cân bằng 19 round
npx tsc --noEmit       # type-check
npm run build          # production build
npx playwright install && npm run test:e2e
```

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `src/game/simulate.ts` | Engine mô phỏng: định tuyến request, capacity, AZ/Region, Auto Scaling, hàng đợi, chi phí, quy định |
| `src/game/catalog.ts` | Thông số từng dịch vụ (capacity, giá, độ trễ) |
| `src/game/rounds.ts` | 19 round, mỗi round có lời giải mẫu (dùng cho gợi ý và test) |
| `src/game/rounds.test.ts` | Mọi lời giải mẫu phải pass, các thiết kế ngây thơ phải fail |
| `src/components/game/` | Board, node, inspector, palette, kết quả, đề bài |
| `src/content/` | Bài học, câu hỏi, flashcard (`en/` là bản tiếng Anh) |
| `src/locales/{vi,en}.json` | Toàn bộ chuỗi giao diện và nội dung round |

Khi đổi số liệu trong `catalog.ts` hoặc `simulate.ts`, chạy `npm test` để chắc mọi round vẫn giải được.
