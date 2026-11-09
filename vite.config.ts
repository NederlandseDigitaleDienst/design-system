import { defineConfig } from 'vite';

// The package itself is built by tsc (see tsconfig.build.json), so the main entry
// and every subpath share the same modules. This config is what Storybook loads.
export default defineConfig({
	// Keeps import.meta.env.DEV for the consumer's own build to decide. The `?.`
	// has to stay: without a bundler that sets it, import.meta.env is undefined.
	define: {
		'import.meta.env.DEV': 'import.meta.env?.DEV',
		'import.meta.env.MODE': 'import.meta.env?.MODE',
	},
});
