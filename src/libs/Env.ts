import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const Env = createEnv({
  server: {
    // Builds a static site into `out/` (e.g. for GitHub Pages)
    STATIC_EXPORT: z.enum(['true', 'false']).optional(),
    // Sub-path the site is served from, e.g. `/repo-name` for GitHub project pages
    BASE_PATH: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    STATIC_EXPORT: process.env.STATIC_EXPORT,
    BASE_PATH: process.env.BASE_PATH,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
});
