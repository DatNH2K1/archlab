import './src/libs/Env';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const baseConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-left',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: process.env.NODE_ENV === 'production', // Keep the development environment fast
  experimental: {
    // Clean up unused compilation work from memory and disk caches.
    turbopackGc: true,
    // Use the Rust version, instead of the OG Babel one
    turbopackRustReactCompiler: process.env.NODE_ENV === 'production',
  },
  logging: {
    browserToTerminal: process.env.BROWSER_TO_TERMINAL_DISABLED !== 'true',
  },
};

export default createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);
