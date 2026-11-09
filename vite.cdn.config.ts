import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * The autoloader for a page without a bundler: dist/cdn/autoloader.js plus a
 * chunk per component, with lit and Floating UI inside, so a plain
 * <script type="module"> works without an import map. A page loads only the
 * chunks of the components it shows.
 *
 * Unlike the standalone bundle (vite.bundle.config.ts), which is everything in
 * one file, and the package itself, where lit stays a dependency for the
 * consumer's bundler.
 */
export default defineConfig({
	define: {
		'import.meta.env.DEV': 'import.meta.env?.DEV',
		'import.meta.env.MODE': 'import.meta.env?.MODE',
	},
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/utilities/autoloader.ts'),
			formats: ['es'],
			fileName: () => 'autoloader.js',
		},
		outDir: 'dist/cdn',
		emptyOutDir: true,
		// public/ holds the sample images of the Storybook stories; they do not
		// belong in the package.
		copyPublicDir: false,
		target: 'es2020',
		minify: true,
		rollupOptions: {
			output: {
				chunkFileNames: 'chunks/[name]-[hash].js',
			},
		},
	},
});
