/**
 * Vite plugin that writes the site's pages to disk and keeps them current.
 *
 * Vite builds a multi-page site from HTML files, so the pages are generated
 * into site/.generated/ (ignored by git) and Vite takes that directory as its
 * root. In development the sources are watched: a change to a story, a pattern,
 * a Markdown page or the manifest regenerates the pages and reloads the browser.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { buildPages } from './site.js';
import { repoRoot } from './sources.js';

export const generatedDir = resolve(repoRoot, 'site/.generated');

const ENTRIES = {
	'main.ts': "import '../client/main.ts';\n",
	'frame.ts': "import '../client/frame.ts';\n",
};

const WATCHED = [/\.stories\.ts$/, /\.md$/, /custom-elements\.json$/, /site\/pages\//, /site\/build\//, /src\/patterns\/.+\.html$/];

function writeIfChanged(file, content) {
	if (existsSync(file) && readFileSync(file, 'utf8') === content) return false;
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, content);
	return true;
}

function htmlFiles(dir, found = []) {
	if (!existsSync(dir)) return found;
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) htmlFiles(full, found);
		else if (name.endsWith('.html')) found.push(full);
	}
	return found;
}

/** Writes every page and removes the ones whose source is gone. */
export function generate({ base = '/' } = {}) {
	const { pages, counts } = buildPages({ base });
	for (const [path, html] of Object.entries(pages)) writeIfChanged(join(generatedDir, path), html);
	for (const [name, content] of Object.entries(ENTRIES)) writeIfChanged(join(generatedDir, name), content);
	for (const file of htmlFiles(generatedDir)) {
		if (!(relative(generatedDir, file) in pages)) rmSync(file);
	}
	for (const asset of ['favicon.svg', 'touch-icon.png']) {
		copyFileSync(resolve(repoRoot, 'src/assets/favicon', asset), join(generatedDir, asset));
	}
	return { inputs: Object.keys(pages).map((path) => join(generatedDir, path)), counts };
}

export function sitePages() {
	let base = '/';
	return {
		name: 'nldd-site-pages',
		config(config) {
			base = config.base ?? '/';
			const { inputs } = generate({ base });
			return { build: { rollupOptions: { input: inputs } } };
		},
		configureServer(server) {
			server.watcher.add([
				resolve(repoRoot, 'src'),
				resolve(repoRoot, 'site/pages'),
				resolve(repoRoot, 'site/content'),
				resolve(repoRoot, 'site/build'),
				resolve(repoRoot, 'CHANGELOG.md'),
				resolve(repoRoot, 'custom-elements.json'),
			]);
			const regenerate = async (file) => {
				if (file.startsWith(generatedDir) || !WATCHED.some((pattern) => pattern.test(file))) return;
				try {
					// The templates are plain modules; a fresh import picks up an edit.
					const fresh = await import(`./site.js?update=${Date.now()}`);
					const { pages } = fresh.buildPages({ base });
					for (const [path, html] of Object.entries(pages)) writeIfChanged(join(generatedDir, path), html);
					server.ws.send({ type: 'full-reload' });
				} catch (error) {
					server.config.logger.error(`Site niet bijgewerkt: ${error.message}`);
				}
			};
			server.watcher.on('change', regenerate);
			server.watcher.on('add', regenerate);
			server.watcher.on('unlink', regenerate);
		},
	};
}
