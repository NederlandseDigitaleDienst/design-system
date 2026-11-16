#!/usr/bin/env node
/**
 * Copies the stylesheets and fonts the package ships to dist, and writes the
 * entry stylesheets that import them. A new global stylesheet goes in GLOBAL
 * once, and every entry picks it up.
 *
 * `generate-lint-data.js` reads `shippedStylesheets()` to know which CSS is the
 * design system's own.
 */
import { copyFileSync, mkdirSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const styles = 'src/assets/styles';

/** Global stylesheets every page loads, in order, after its fonts and the tokens. */
const GLOBAL = [
	`${styles}/document-reset.css`,
	'src/components/content/rich-text/rich-text.css',
	'src/components/content/title/title.css',
	'src/components/content/text/text.css',
	'src/components/navigation/link/link.css',
	'src/components/inputs/dropdown/dropdown.css',
	'src/components/forms/form-section/form-section.css',
	'src/components/forms/form/form.css',
	`${styles}/fouc.css`,
];

/** Shipped to dist/css on their own, without an entry that imports them. */
const STANDALONE = [
	`${styles}/colors.generated.css`,
	`${styles}/themes.css`,
];

const FONTS = {
	rijksoverheid: `${styles}/rijksoverheid-fonts.css`,
	open: `${styles}/inter-font.css`,
	mono: `${styles}/jetbrains-mono-font.css`,
};
const TOKENS = `${styles}/variables.css`;
const THEMES = `${styles}/themes`;

const ENTRIES = {
	'global.css': [FONTS.rijksoverheid, FONTS.mono, TOKENS, ...GLOBAL],
	'global-open-font.css': [FONTS.open, FONTS.mono, TOKENS, ...GLOBAL],
	'tokens.css': [FONTS.rijksoverheid, FONTS.mono, TOKENS],
};

const cssIn = (directory) => readdirSync(resolve(root, directory)).filter((file) => file.endsWith('.css')).sort().map((file) => `${directory}/${file}`);

/** Every stylesheet the package ships, as absolute paths. */
export function shippedStylesheets() {
	return [TOKENS, ...Object.values(FONTS), ...GLOBAL, ...STANDALONE, ...cssIn(THEMES)].map((path) => resolve(root, path));
}

function build() {
	const css = resolve(root, 'dist/css');
	const fonts = resolve(root, 'dist/fonts');
	rmSync(css, { recursive: true, force: true });
	rmSync(fonts, { recursive: true, force: true });
	mkdirSync(resolve(css, 'themes'), { recursive: true });
	mkdirSync(fonts, { recursive: true });

	for (const path of [TOKENS, ...Object.values(FONTS), ...GLOBAL, ...STANDALONE]) copyFileSync(resolve(root, path), resolve(css, basename(path)));
	for (const path of cssIn(THEMES)) copyFileSync(resolve(root, path), resolve(css, 'themes', basename(path)));
	for (const [entry, imports] of Object.entries(ENTRIES)) {
		writeFileSync(resolve(css, entry), imports.map((path) => `@import "./${basename(path)}";\n`).join(''));
	}

	const fontFiles = resolve(root, 'src/assets/fonts');
	for (const file of readdirSync(fontFiles).filter((name) => name.endsWith('.woff2'))) copyFileSync(resolve(fontFiles, file), resolve(fonts, file));
}

// Node gives this module by its real path, and argv by the path it was called with.
if (process.argv[1] && realpathSync(process.argv[1]) === import.meta.filename) build();
