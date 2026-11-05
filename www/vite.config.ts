import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');

/**
 * The marketing site of the design system. It is built from the components
 * themselves, straight from src/, so every page is a test of the system.
 *
 * WWW_BASE is the path the site is published under. Locally it is the root.
 */
export default defineConfig({
	root: import.meta.dirname,
	base: process.env.WWW_BASE ?? '/',
	publicDir: resolve(repoRoot, 'public'),
	server: {
		fs: { allow: [repoRoot] },
	},
	build: {
		outDir: resolve(repoRoot, 'www-dist'),
		emptyOutDir: true,
		target: 'es2022',
	},
});
