import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { sitePages, generatedDir } from './build/pages.js';

const repoRoot = resolve(import.meta.dirname, '..');

/**
 * The website of the design system: the landing page in index.html and, behind
 * it, the documentation. It is built from the components themselves, straight
 * from src/, so every page is a test of the system.
 *
 * The landing page is written by hand. The other pages are generated from the
 * components, the stories and the patterns (see build/site.js) into
 * www/.generated/, which Vite takes as its root and serves and bundles.
 *
 * WWW_BASE is the path the site is published under. Locally it is the root.
 *
 * The repository's public/ holds the sample images the stories show.
 */
export default defineConfig({
	root: generatedDir,
	base: process.env.WWW_BASE ?? '/',
	publicDir: resolve(repoRoot, 'public'),
	appType: 'mpa',
	plugins: [sitePages()],
	resolve: {
		alias: {
			// The stories import two helpers that came from Storybook. The site
			// supplies its own, so the story files stay as they are.
			'storybook/actions': resolve(import.meta.dirname, 'client/shims/actions.ts'),
			'storybook/preview-api': resolve(import.meta.dirname, 'client/shims/preview-api.ts'),
		},
	},
	server: {
		fs: { allow: [repoRoot] },
	},
	build: {
		outDir: resolve(repoRoot, 'www-dist'),
		emptyOutDir: true,
		target: 'es2022',
		// Below these versions the minifier rewrites light-dark() into variables
		// set only where a stylesheet declares color-scheme, so an inline
		// color-scheme (the light and dark columns on the themes page, the
		// canvas of a stage) no longer switches anything.
		cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'],
	},
});
