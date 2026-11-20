import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * The standalone browser bundle: one minified file you drop on a page with a
 * plain <script src>, with no build step at the other end.
 *
 * Unlike the module build for bundling consumers, which tsc makes (see
 * tsconfig.build.json): there lit, Floating UI and the rest stay imports. Here
 * everything comes along and nothing is split, so there is exactly one URL to
 * point at.
 */
export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/components/index.ts'),
			formats: ['iife'],
			name: 'NLDD',
			fileName: () => 'nldd.min.js',
		},
		outDir: 'dist',
		emptyOutDir: false,
		// public/ holds the sample images of the stories; they do not
		// belong in the package.
		copyPublicDir: false,
		target: 'es2020',
		minify: true,
		rollupOptions: {
			output: {
				// One file: an IIFE cannot split, but this makes it explicit that no
				// separate assets may appear beside it either.
				inlineDynamicImports: true,
			},
		},
	},
});
