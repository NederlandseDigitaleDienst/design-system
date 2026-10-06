import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // The stories import two Storybook helpers; the site supplies them
      // (see site/vite.config.ts), and the story tests need the same ones.
      'storybook/actions': resolve(import.meta.dirname, 'site/client/shims/actions.ts'),
      'storybook/preview-api': resolve(import.meta.dirname, 'site/client/shims/preview-api.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'site/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
