import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { sitePages, generatedDir } from './build/pages.js';

const repoRoot = resolve(import.meta.dirname, '..');

/**
 * The documentation site. Its pages are generated from the components, the
 * stories and the patterns (see build/site.js); Vite serves and bundles them.
 *
 * SITE_BASE is the path the site is published under, '/design-system/' on
 * GitHub Pages. Locally it is the root.
 */
export default defineConfig({
	root: generatedDir,
	base: process.env.SITE_BASE ?? '/',
	publicDir: resolve(repoRoot, 'public'),
	appType: 'mpa',
	plugins: [sitePages()],
	resolve: {
		alias: {
			// The stories were written for Storybook and import two of its
			// helpers. The site supplies its own, so the story files stay as they are.
			'storybook/actions': resolve(import.meta.dirname, 'client/shims/actions.ts'),
			'storybook/preview-api': resolve(import.meta.dirname, 'client/shims/preview-api.ts'),
		},
	},
	server: {
		fs: { allow: [repoRoot] },
	},
	build: {
		outDir: resolve(repoRoot, 'site-dist'),
		emptyOutDir: true,
		target: 'es2022',
	},
});
