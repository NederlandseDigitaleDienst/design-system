import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
	// A library build would turn these into constants, which removes every DEV
	// warning from the main export. Left in, the consumer's own build decides. The
	// `?.` has to stay: without a bundler that sets it, import.meta.env is undefined.
	define: {
		'import.meta.env.DEV': 'import.meta.env?.DEV',
		'import.meta.env.MODE': 'import.meta.env?.MODE',
	},
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
