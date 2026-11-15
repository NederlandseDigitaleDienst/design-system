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
// A new entry that only runs in a browser goes here, or this check fails on it.
const BROWSER_ONLY = new Set(['./bundle']);

const failures = [];
let checked = 0;
const skipped = { 'not a script': 0, 'a wildcard': 0, 'browser only': 0, 'only types': 0 };
for (const [subpath, target] of Object.entries(exports)) {
	const file = typeof target === 'string' ? target : (target.import ?? target.default);
	// Conditions without a script would slip past the check unseen, unless they only carry types.
	if (typeof target !== 'string' && !file) {
		if (Object.keys(target).every((condition) => condition === 'types')) skipped['only types']++;
		else failures.push(`${subpath}: no "import" or "default" condition to import`);
		continue;
	}
	const reason = !file?.endsWith('.js') ? 'not a script' : file.includes('*') ? 'a wildcard' : BROWSER_ONLY.has(subpath) ? 'browser only' : null;
	if (reason) {
		skipped[reason]++;
		continue;
	}
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
const left = Object.entries(skipped).filter(([, count]) => count > 0).map(([reason, count]) => `${count} ${reason}`);
console.log(`All ${checked} exports import on a server. Left out: ${left.join(', ')}.`);
