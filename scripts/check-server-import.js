#!/usr/bin/env node
/**
 * Imports every script export of the built package in Node, as a framework that
 * renders on the server (Next, Docusaurus, Astro, Remix) does with the modules of a
 * page. Node has no window, document or matchMedia, so a component that reaches for
 * one of them while its module loads stops the whole build there.
 *
 * Run after `npm run build:components`.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const { exports } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

// The standalone bundle is for a plain <script src>, with the browser build of lit inlined.
const BROWSER_ONLY = new Set(['./bundle']);

const failures = [];
let checked = 0;
for (const [subpath, target] of Object.entries(exports)) {
	const file = typeof target === 'string' ? target : target.default;
	if (!file?.endsWith('.js') || file.includes('*') || BROWSER_ONLY.has(subpath)) continue;
	checked++;
	try {
		await import(pathToFileURL(resolve(root, file)).href);
	} catch (error) {
		failures.push(`${subpath}: ${String(error.message).split('\n')[0]}`);
	}
}

if (failures.length > 0) {
	console.error(`${failures.length} of ${checked} exports cannot be imported on a server:\n`);
	for (const failure of failures) console.error(`  ${failure}`);
	process.exit(1);
}
console.log(`All ${checked} exports import on a server.`);
