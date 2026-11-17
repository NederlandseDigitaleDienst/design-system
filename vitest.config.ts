import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // The stories import two helpers that came from Storybook; the site
      // supplies them (see www/vite.config.ts), and the story tests need the
      // same ones.
      'storybook/actions': resolve(import.meta.dirname, 'www/client/shims/actions.ts'),
      'storybook/preview-api': resolve(import.meta.dirname, 'www/client/shims/preview-api.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'www/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
