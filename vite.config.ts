import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/components/index.ts'),
			formats: ['es'],
			fileName: () => 'components.js',
		},
		outDir: 'dist/components',
		emptyOutDir: false,
		// public/ holds the sample images of the Storybook stories; they do not
		// belong in the package.
		copyPublicDir: false,
		target: 'es2020',
		minify: false,
		rollupOptions: {
			external: ['lit', /^lit\//, /^@lit\//, '@floating-ui/dom'],
		},
	},
});
