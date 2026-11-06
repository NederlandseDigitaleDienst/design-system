#!/usr/bin/env node
/**
 * Optimizes new icon exports to the house style, on the 96×96 grid:
 *
 *   npm run optimize:icons -- <file.svg> …
 *
 * An export at 0 0 96 96 goes straight to svgo. One at 0 0 24 24 (a regular
 * icon on the old grid) or 0 0 32 32 (a light one) gets a first svgo pass that
 * leaves only paths and keeps every decimal, is scaled to 96, and only then
 * rounds, once, on the new grid. Any other viewBox stops with a message:
 * the script does not guess a scale. Run it once per export; a second run
 * rounds again and shifts the icon.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { optimize } from 'svgo';
import config from './svgo.config.mjs';
import { GRID, canScale, scaleIcon, viewBoxSize } from './lib/icon-grid.js';

const lossless = { ...config, floatPrecision: 6, js2svg: { pretty: false } };

const files = process.argv.slice(2);
if (files.length === 0) {
	console.error('Usage: npm run optimize:icons -- <file.svg> …');
	process.exit(1);
}

let failed = false;
for (const file of files) {
	const source = readFileSync(file, 'utf8');
	const size = viewBoxSize(source);
	if (!canScale(size)) {
		console.error(`${file}: viewBox must be 0 0 ${GRID} ${GRID} (or 0 0 24 24 / 0 0 32 32 from the old grids), skipped`);
		failed = true;
		continue;
	}
	let input = source;
	if (size !== GRID) {
		try {
			input = scaleIcon(optimize(source, { ...lossless, path: file }).data);
		} catch (error) {
			console.error(`${file}: cannot scale to ${GRID}, ${error.message}`);
			failed = true;
			continue;
		}
	}
	const { data } = optimize(input, { ...config, path: file });
	writeFileSync(file, `${data}\n`);
	console.log(`${file}${size === GRID ? '' : ` (scaled from ${size} to ${GRID})`}`);
}
process.exit(failed ? 1 : 0);
