'use client';

import NextError from 'next/error';
import { routing } from '@/libs/I18nRouting';

export default function GlobalError() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        {/* `NextError` requires a `statusCode` prop, but the App Router does not expose it. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
