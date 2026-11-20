#!/usr/bin/env node
/**
 * Compares two builds of the same static site, page by page, and writes one
 * image per page that differs: before and after side by side, with an outline
 * around each design system element that changed.
 *
 * An upgrade breaks without an error: an attribute that is gone renders
 * nothing, a renamed value falls back to a default. The linter finds what it
 * can read. This finds the rest, by looking.
 *
 * An element counts as changed when its box changed size, when it is no longer
 * drawn (or newly drawn), or when it kept its size and looks different. Its
 * pixels are compared at its own place in each screenshot, so content that
 * only moved down the page does not count, and lines of text that each moved
 * a pixel or two inside an element do not count either. Of nested changes
 * only the innermost is marked: that is where the change starts.
 *
 * A page is identical only when the two full screenshots are equal pixel for
 * pixel. On pages of equal size, pixels that differ outside every marked
 * element get an outline of their own.
 *
 * Usage, from the project that is upgraded:
 *   node compare-builds.mjs <before dir> <after dir> <out dir>
 *     [--label-before <text>] [--label-after <text>]
 *     [--only <path>]          one page, such as /over/
 *     [--playwright <module>]  when the project has no playwright of its own
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`). Writes
 * the images and a results.json, and prints one line per page.
 */

import { Buffer } from 'node:buffer';
import process from 'node:process';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const { values: options, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		'label-before': { type: 'string', default: 'Voor' },
		'label-after': { type: 'string', default: 'Na' },
		only: { type: 'string' },
		playwright: { type: 'string' },
	},
});
if (positionals.length !== 3) {
	console.error('Usage: compare-builds.mjs <before dir> <after dir> <out dir> [--label-before <text>] [--label-after <text>] [--only <path>] [--playwright <module>]');
	process.exit(2);
}
const [beforeDir, afterDir, outDir] = positionals.map((path) => resolve(path));
const print = (line) => process.stdout.write(`${line}\n`);

/** Playwright comes from the project, not from where this script is installed. */
async function loadChromium() {
	try {
		const path = options.playwright ? resolve(options.playwright) : createRequire(join(process.cwd(), 'package.json')).resolve('playwright');
		const module = await import(pathToFileURL(path).href);
		return (module.default ?? module).chromium ?? module.chromium;
	} catch {
		console.error('Playwright was not found. Install it in this project (`npm install --no-save playwright && npx playwright install chromium`), or point at one with --playwright <module>.');
		process.exit(2);
	}
}

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.json': 'application/json',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ico': 'image/x-icon',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
};

function serve(root) {
	return new Promise((done) => {
		const server = createServer((request, response) => {
			let path = join(root, decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
			if (!path.startsWith(root)) { response.writeHead(403); response.end(); return; }
			if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
			if (!existsSync(path)) { response.writeHead(404); response.end(); return; }
			response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
			response.end(readFileSync(path));
		});
		server.listen(0, '127.0.0.1', () => done(server));
	});
}

/** Every directory with an index.html, as the path a browser asks for. */
function pages(root, directory = root, found = []) {
	for (const name of readdirSync(directory)) {
		const path = join(directory, name);
		if (statSync(path).isDirectory()) pages(root, path, found);
		else if (name === 'index.html') found.push(`${directory.slice(root.length)}/`);
	}
	return found.sort();
}

const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };

async function capture(browser, origin, path, viewport) {
	const context = await browser.newContext({ viewport, reducedMotion: 'reduce', colorScheme: 'light' });
	const page = await context.newPage();
	const messages = [];
	page.on('console', (message) => {
		if (['error', 'warning'].includes(message.type())) messages.push(`${message.type()}: ${message.text().slice(0, 200)}`);
	});
	page.on('pageerror', (error) => messages.push(`pageerror: ${String(error).slice(0, 200)}`));
	await page.goto(origin + path, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(400);
	const png = (await page.screenshot({ fullPage: true })).toString('base64');
	// Every design system element in document order, with its box on the page.
	const boxes = await page.evaluate(() =>
		[...document.querySelectorAll('*')]
			.filter((element) => element.localName.startsWith('nldd-'))
			.map((element) => {
				const rect = element.getBoundingClientRect();
				let depth = 0;
				for (let parent = element.parentElement; parent; parent = parent.parentElement) depth++;
				return { tag: element.localName, depth, x: Math.round(rect.x + scrollX), y: Math.round(rect.y + scrollY), w: Math.round(rect.width), h: Math.round(rect.height) };
			}));
	await context.close();
	return { png, boxes, messages };
}

/**
 * Runs in a page of its own, where a canvas decodes and draws the images.
 * Self-contained: nothing from this file is in scope there.
 */
async function compareInPage({ before, after, labels }) {
	const load = (data) => new Promise((done) => {
		const image = new Image();
		image.onload = () => done(image);
		image.src = `data:image/png;base64,${data}`;
	});
	const [a, b] = await Promise.all([load(before.png), load(after.png)]);
	const read = (image) => {
		const context = new OffscreenCanvas(image.width, image.height).getContext('2d', { willReadFrequently: true });
		context.drawImage(image, 0, 0);
		return context.getImageData(0, 0, image.width, image.height);
	};
	const pa = read(a);
	const pb = read(b);
	const TOLERANCE = 24;
	const differs = (i, j) =>
		Math.abs(pa.data[i] - pb.data[j]) > TOLERANCE || Math.abs(pa.data[i + 1] - pb.data[j + 1]) > TOLERANCE || Math.abs(pa.data[i + 2] - pb.data[j + 2]) > TOLERANCE;

	// The whole page, pixel for pixel: the only proof that nothing changed.
	let pagePixels = a.width === b.width && a.height === b.height ? 0 : -1;
	if (pagePixels === 0) for (let i = 0; i < pa.data.length; i += 4) if (differs(i, i)) pagePixels++;

	// The two pages need not hold the same elements: a fix may replace one or
	// wrap another. Align the two lists on their tags (longest common
	// subsequence), compare what lines up, and report the rest as gone or new.
	const A = before.boxes;
	const B = after.boxes;
	const table = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
	for (let i = A.length - 1; i >= 0; i--) {
		for (let j = B.length - 1; j >= 0; j--) table[i][j] = A[i].tag === B[j].tag ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
	}
	const NONE = { x: 0, y: 0, w: 0, h: 0 };
	const drawn = (box) => box.w > 0 && box.h > 0;
	const pairs = [];
	const marks = [];
	for (let i = 0, j = 0; i < A.length || j < B.length;) {
		if (i < A.length && j < B.length && A[i].tag === B[j].tag) {
			pairs.push([A[i], B[j]]);
			i++;
			j++;
		} else if (j >= B.length || (i < A.length && table[i + 1][j] >= table[i][j + 1])) {
			if (drawn(A[i])) marks.push({ tag: A[i].tag, kind: 'gone', before: A[i], after: NONE });
			i++;
		} else {
			if (drawn(B[j])) marks.push({ tag: B[j].tag, kind: 'new', before: NONE, after: B[j] });
			j++;
		}
	}

	// Do two boxes show the same thing over the part they share? Lines of text
	// inside an element may each sit a pixel or two higher or lower after an
	// upgrade, and not all by the same amount. That is not a different look, so
	// every row of pixels looks for its match a few rows up or down. A color
	// that changed has no match at any row.
	const sameLook = (box, other) => {
		const w = Math.min(box.w, other.w, a.width - box.x, b.width - other.x);
		const h = Math.min(box.h, other.h, a.height - box.y, b.height - other.y);
		if (w <= 2 || h <= 4 || box.x < 0 || other.x < 0 || box.y < 0 || other.y < 0) return true;
		const rowLimit = Math.max(3, w * 0.015);
		let unmatched = 0;
		for (let y = 2; y < h - 2; y++) {
			let found = false;
			for (const shift of [0, 1, -1, 2, -2, 3, -3, 4, -4]) {
				const row = other.y + y + shift;
				if (row < other.y || row >= other.y + h) continue;
				let count = 0;
				let i = ((box.y + y) * a.width + box.x + 1) * 4;
				let j = (row * b.width + other.x + 1) * 4;
				for (let x = 1; x < w - 1 && count <= rowLimit; x++, i += 4, j += 4) if (differs(i, j)) count++;
				if (count <= rowLimit) {
					found = true;
					break;
				}
			}
			if (!found) unmatched++;
		}
		return unmatched <= Math.max(3, h * 0.04);
	};

	// Is the part of a box beyond w by h one flat color? Then a box that only
	// lost that part shows the same thing as before.
	const flatBeyond = (image, box, w, h) => {
		const at = (x, y) => (y * image.width + x) * 4;
		const flat = (x0, y0, x1, y1) => {
			if (x1 <= x0 || y1 <= y0) return true;
			const first = at(x0, y0);
			for (let y = y0; y < y1; y++) {
				for (let x = x0; x < x1; x++) {
					const i = at(x, y);
					if (Math.abs(image.data[i] - image.data[first]) > TOLERANCE || Math.abs(image.data[i + 1] - image.data[first + 1]) > TOLERANCE || Math.abs(image.data[i + 2] - image.data[first + 2]) > TOLERANCE) return false;
				}
			}
			return true;
		};
		const right = Math.min(box.x + box.w, image.width);
		const bottom = Math.min(box.y + box.h, image.height);
		// A few pixels in, past the soft edge of what is drawn.
		return flat(box.x + w + 3, box.y, right, bottom) && flat(box.x, box.y + h + 3, right, bottom);
	};

	const kind = pairs.map(([box, other]) => {
		if (!drawn(box) && !drawn(other)) return '';
		if (drawn(box) && !drawn(other)) return 'gone';
		if (!drawn(box) && drawn(other)) return 'new';
		if (Math.abs(box.w - other.w) > 1 || Math.abs(box.h - other.h) > 1) {
			// A box that changed size and still shows the same thing, such as a
			// badge whose box no longer spans its row, is no visible change.
			const w = Math.min(box.w, other.w);
			const h = Math.min(box.h, other.h);
			return sameLook(box, other) && flatBeyond(pa, box, w, h) && flatBeyond(pb, other, w, h) ? '' : 'size';
		}
		return sameLook(box, other) ? '' : 'look';
	});

	// An element that made way for another that shows the same thing in the same
	// box, such as nldd-title for nldd-text, is no visible change either.
	let replaced = 0;
	for (const gone of marks.filter((mark) => mark.kind === 'gone')) {
		const twin = marks.find((mark) =>
			mark.kind === 'new' && !mark.drop
			&& Math.abs(mark.after.w - gone.before.w) <= 2 && Math.abs(mark.after.h - gone.before.h) <= 2 && Math.abs(mark.after.x - gone.before.x) <= 2
			&& sameLook(gone.before, mark.after));
		if (!twin) continue;
		twin.drop = true;
		gone.drop = true;
		replaced++;
	}
	for (let index = marks.length - 1; index >= 0; index--) if (marks[index].drop) marks.splice(index, 1);

	// Of nested changes, the innermost.
	for (let index = 0; index < kind.length; index++) {
		if (!kind[index]) continue;
		let inner = false;
		for (let next = index + 1; next < kind.length && pairs[next][0].depth > pairs[index][0].depth; next++) {
			if (kind[next]) {
				inner = true;
				break;
			}
		}
		if (!inner) marks.push({ tag: pairs[index][0].tag, kind: kind[index], before: pairs[index][0], after: pairs[index][1] });
	}

	// What no marked element accounts for. Only on pages of equal size, where a
	// pixel is at the same place in both: differing pixels are grouped into
	// blocks, and a block outside every marked element gets its own outline.
	if (pagePixels > 0) {
		const CELL = 16;
		const columns = Math.ceil(a.width / CELL);
		const rows = Math.ceil(a.height / CELL);
		const cells = new Uint8Array(columns * rows);
		const covered = (x, y) => marks.some((mark) => [mark.before, mark.after].some((box) => drawn(box) && x >= box.x - 2 && x <= box.x + box.w + 2 && y >= box.y - 2 && y <= box.y + box.h + 2));
		for (let y = 0; y < a.height; y++) {
			for (let x = 0; x < a.width; x++) {
				const i = (y * a.width + x) * 4;
				if (differs(i, i) && !covered(x, y)) cells[Math.floor(y / CELL) * columns + Math.floor(x / CELL)] = 1;
			}
		}
		for (let start = 0; start < cells.length; start++) {
			if (cells[start] !== 1) continue;
			let minX = columns;
			let maxX = 0;
			let minY = rows;
			let maxY = 0;
			const queue = [start];
			cells[start] = 2;
			while (queue.length) {
				const cell = queue.pop();
				const cx = cell % columns;
				const cy = Math.floor(cell / columns);
				minX = Math.min(minX, cx);
				maxX = Math.max(maxX, cx);
				minY = Math.min(minY, cy);
				maxY = Math.max(maxY, cy);
				for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
					const nx = cx + dx;
					const ny = cy + dy;
					if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || cells[ny * columns + nx] !== 1) continue;
					cells[ny * columns + nx] = 2;
					queue.push(ny * columns + nx);
				}
			}
			const box = { x: minX * CELL, y: minY * CELL, w: (maxX - minX + 1) * CELL, h: (maxY - minY + 1) * CELL };
			marks.push({ tag: '(pixels)', kind: 'pixels', before: box, after: box });
		}
	}

	// The image: both screenshots, a legend, and the outlines.
	const SCALE = 0.6;
	const GAP = 20;
	const TOP = 76;
	const width = Math.round(Math.max(a.width, b.width) * SCALE);
	const height = Math.round(Math.max(a.height, b.height) * SCALE);
	const canvas = new OffscreenCanvas(width * 2 + GAP * 3, height + TOP + GAP);
	const context = canvas.getContext('2d');
	context.fillStyle = '#f3f4f6';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.font = '600 18px system-ui, sans-serif';
	context.fillStyle = '#111';
	context.fillText(labels.before, GAP, 30);
	context.fillText(labels.after, GAP * 2 + width, 30);
	const COLORS = { size: '#d6006e', look: '#0b6bcb', gone: '#b42318', new: '#157f3b', pixels: '#6b7280' };
	const NAMES = { size: 'andere maat', look: 'ziet er anders uit', gone: 'niet meer getekend', new: 'nieuw getekend', pixels: 'andere pixels, buiten een element' };
	context.font = '14px system-ui, sans-serif';
	let legendX = GAP;
	for (const key of Object.keys(COLORS)) {
		const number = marks.filter((mark) => mark.kind === key).length;
		if (!number) continue;
		context.fillStyle = COLORS[key];
		context.fillRect(legendX, 46, 12, 12);
		context.fillStyle = '#111';
		const text = `${NAMES[key]} (${number})`;
		context.fillText(text, legendX + 18, 57);
		legendX += context.measureText(text).width + 44;
	}
	context.drawImage(a, GAP, TOP, Math.round(a.width * SCALE), Math.round(a.height * SCALE));
	context.drawImage(b, GAP * 2 + width, TOP, Math.round(b.width * SCALE), Math.round(b.height * SCALE));
	context.lineWidth = 2;
	for (const mark of marks) {
		context.strokeStyle = COLORS[mark.kind];
		context.fillStyle = `${COLORS[mark.kind]}1f`;
		for (const [box, left] of [[mark.before, GAP], [mark.after, GAP * 2 + width]]) {
			if (!drawn(box)) continue;
			const rect = [left + box.x * SCALE, TOP + box.y * SCALE, box.w * SCALE, box.h * SCALE];
			context.fillRect(...rect);
			context.strokeRect(...rect);
		}
	}
	const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return {
		png: btoa(binary),
		heightBefore: a.height,
		heightAfter: b.height,
		pagePixels,
		replaced,
		marks: marks.map((mark) => ({ tag: mark.tag, kind: mark.kind })),
	};
}

const chromium = await loadChromium();
mkdirSync(outDir, { recursive: true });
const servers = { before: await serve(beforeDir), after: await serve(afterDir) };
const origin = (which) => `http://127.0.0.1:${servers[which].address().port}`;
const browser = await chromium.launch();
const composer = await (await browser.newContext()).newPage();
const labels = { before: options['label-before'], after: options['label-after'] };
const results = [];

for (const path of pages(afterDir).filter((page) => !options.only || page === options.only)) {
	for (const [name, viewport] of Object.entries(VIEWPORTS)) {
		if (!existsSync(join(beforeDir, path, 'index.html'))) {
			results.push({ path, viewport: name, note: 'new page' });
			print(`${path} ${name}: new page`);
			continue;
		}
		const before = await capture(browser, origin('before'), path, viewport);
		const after = await capture(browser, origin('after'), path, viewport);
		const diff = await composer.evaluate(compareInPage, { before, after, labels });
		const identical = diff.pagePixels === 0;
		const file = identical ? null : `${path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home'}-${name}.png`;
		if (file) writeFileSync(join(outDir, file), Buffer.from(diff.png, 'base64'));
		const counts = {};
		for (const mark of diff.marks) counts[`${mark.tag} ${mark.kind}`] = (counts[`${mark.tag} ${mark.kind}`] ?? 0) + 1;
		results.push({
			path,
			viewport: name,
			identical,
			file,
			marks: diff.marks.length,
			counts,
			replaced: diff.replaced,
			heightBefore: diff.heightBefore,
			heightAfter: diff.heightAfter,
			consoleBefore: before.messages,
			consoleAfter: after.messages,
		});
		print(`${path} ${name}: ${identical ? 'identical' : `${diff.marks.length} marked`}, height ${diff.heightBefore} -> ${diff.heightAfter} ${JSON.stringify(counts)}`);
	}
}

writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, '\t'));
await browser.close();
servers.before.close();
servers.after.close();

const differing = results.filter((result) => result.file);
print(`\n${results.length} comparisons, ${results.length - differing.length} identical, ${differing.length} with an image in ${outDir}`);
