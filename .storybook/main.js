/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/docs/**/*.mdx',
    '../src/docs/**/*.stories.ts',
    '../src/patterns/**/*.mdx',
    '../src/patterns/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes'
  ],
  framework: '@storybook/web-components-vite',
  staticDirs: ['../dist', '../public'],
  // dist is een staticDir, dus dit is het bestand dat consumers ook krijgen.
  managerHead: (head) =>
    `${head}<link rel="icon" type="image/svg+xml" sizes="any" href="./favicon.svg"><link rel="apple-touch-icon" href="./touch-icon.png">`,
  // Below these versions the minifier rewrites light-dark() into variables set
  // only where a stylesheet declares color-scheme, so an inline color-scheme
  // (the light and dark columns on Docs/Thema's) no longer switches anything.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    build: {
      ...viteConfig.build,
      cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'],
    },
  }),
};

export default config;
