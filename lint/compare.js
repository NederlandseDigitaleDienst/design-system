/**
 * `nldd compare`: two versions of the same site, side by side.
 *
 * An upgrade breaks without an error. An attribute that is gone renders
 * nothing, and a value that was renamed falls back to a default. The linter
 * finds what it can read; this shows the rest. It opens every page in both
 * versions and writes one image per page that differs, before and after next
 * to each other, with an outline around each design system element that
 * changed. What counts as a change is in compare-core.js.
 *
 * A version is a directory with a built site, or the address of a running
 * one: two dev servers of an app with a backend compare the same way as two
 * builds of a static site.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isUrl, launchBrowser, openSettled, pagesOf, serveDirectory } from './browser.js';

/** Wide enough for the layout of a desk, and the width of a phone. */
export const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };

/** compare-core.js as the page gets it: the same text, without the exports. */
const coreForPage = () => readFileSync(new URL('./compare-core.js', import.meta.url), 'utf8').replace(/^export /gm, '');

/** Runs in the page that is photographed: every design system element in document order, with its box on the page. */
function boxesInPage() {
	return [...document.querySelectorAll('*')]
		.filter((element) => element.localName.startsWith('nldd-'))
		.map((element) => {
			const rect = element.getBoundingClientRect();
			let depth = 0;
			for (let parent = element.parentElement; parent; parent = parent.parentElement) depth++;
			return { tag: element.localName, depth, x: Math.round(rect.x + scrollX), y: Math.round(rect.y + scrollY), w: Math.round(rect.width), h: Math.round(rect.height) };
		});
}

/**
 * Runs in a page of its own, which has compare-core.js: reads the pixels of
 * both screenshots, asks the core what changed, and draws the image.
 */
async function drawInPage({ before, after, labels }) {
	/* global comparePages, isDrawn */
	const load = (data) => new Promise((done) => {
		const image = new Image();
		image.onload = () => done(image);
		image.src = `data:image/png;base64,${data}`;
	});
	const [a, b] = await Promise.all([load(before.png), load(after.png)]);
	const pixels = (image) => {
		const context = new OffscreenCanvas(image.width, image.height).getContext('2d', { willReadFrequently: true });
		context.drawImage(image, 0, 0);
		return context.getImageData(0, 0, image.width, image.height);
	};
	const { identical, marks, replaced } = comparePages(pixels(a), before.boxes, pixels(b), after.boxes);

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
	context.font = '14px system-ui, sans-serif';
	let legendX = GAP;
	for (const kind of Object.keys(COLORS)) {
		const number = marks.filter((mark) => mark.kind === kind).length;
		if (number === 0) continue;
		context.fillStyle = COLORS[kind];
		context.fillRect(legendX, 46, 12, 12);
		context.fillStyle = '#111';
		const text = `${labels.kinds[kind]} (${number})`;
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
			if (!isDrawn(box)) continue;
			const rect = [left + box.x * SCALE, TOP + box.y * SCALE, box.w * SCALE, box.h * SCALE];
			context.fillRect(...rect);
			context.strokeRect(...rect);
		}
	}
	const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return { png: btoa(binary), identical, replaced, heightBefore: a.height, heightAfter: b.height, marks: marks.map(({ tag, kind }) => ({ tag, kind })) };
}

/** What a kind of mark is called in the image. The people who look at it read Dutch. */
const KINDS = { size: 'andere maat', look: 'ziet er anders uit', gone: 'niet meer getekend', new: 'nieuw getekend', pixels: 'andere pixels, buiten een element' };

async function capture(context, url) {
	const page = await openSettled(context, url);
	const messages = [];
	page.on('console', (message) => {
		if (['error', 'warning'].includes(message.type())) messages.push(`${message.type()}: ${message.text().slice(0, 200)}`);
	});
	const png = (await page.screenshot({ fullPage: true })).toString('base64');
	const boxes = await page.evaluate(boxesInPage);
	await page.close();
	return { png, boxes, messages };
}

/** `/over/ons/` on a phone as a file name: `over_ons-mobile.png`. */
const imageName = (path, viewport) => `${path.replace(/[^\w.-]+/g, '_').replace(/^_|_$/g, '') || 'home'}-${viewport}.png`;

/** The pages that show most come first: the most marks, and the desk before the phone. */
const byMarks = (a, b) => b.marks - a.marks || Number(b.viewport === 'desktop') - Number(a.viewport === 'desktop') || a.path.localeCompare(b.path);

/**
 * What a comparison found, as Markdown for under a pull request: the counts,
 * the images that show most, and the pages that differ without an image here.
 * In Dutch, as the report of `nldd upgrade`. The images are named relative to
 * the directory they are in.
 * @param {object[]} results - from compareSites()
 * @param {number} [max] - how many images the text shows
 */
export function formatComparison(results, max = 6) {
	const plural = (count, one, more) => `${count} ${count === 1 ? one : more}`;
	const failed = results.filter((result) => result.error);
	const differing = results.filter((result) => result.file).sort(byMarks);
	const identical = results.filter((result) => result.identical).length;
	const lines = ['## In beeld', '', `${plural(results.length, 'vergelijking', 'vergelijkingen')} van de gebouwde site, voor en na de upgrade, op de breedte van een bureau en van een telefoon. ${identical === results.length ? 'Ze zijn alle pixel voor pixel gelijk.' : `${identical === 0 ? 'Geen' : identical} ${identical === 1 ? 'is' : identical === 0 ? 'is' : 'zijn'} pixel voor pixel gelijk, ${differing.length} ${differing.length === 1 ? 'verschilt' : 'verschillen'}.`}`];
	// One image per page: the viewport that shows most. The other one is in the list below.
	const shown = [];
	for (const result of differing) if (shown.length < max && !shown.some(({ path }) => path === result.path)) shown.push(result);
	for (const { path, viewport, file, marks } of shown) lines.push('', `### \`${path}\` (${viewport === 'desktop' ? 'bureau' : 'telefoon'}, ${plural(marks, 'verschil', 'verschillen')})`, '', `![${path}, voor en na](./${file})`);
	const rest = differing.filter((result) => !shown.includes(result));
	if (rest.length > 0) lines.push('', '<details>', `<summary>Verschilt ook (${rest.length})</summary>`, '', ...rest.map(({ path, viewport, marks }) => `- \`${path}\` (${viewport === 'desktop' ? 'bureau' : 'telefoon'}): ${plural(marks, 'verschil', 'verschillen')}`), '', '</details>');
	if (failed.length > 0) lines.push('', 'Niet vergeleken:', '', ...failed.map(({ path, viewport, error }) => `- \`${path}\` (${viewport === 'desktop' ? 'bureau' : 'telefoon'}): ${error}`));
	return `${lines.join('\n')}\n`;
}

/**
 * @param {object} options
 * @param {string} options.root - the project
 * @param {string} options.before - a directory with a built site, or the address of a running one
 * @param {string} options.after - the same, for the new version
 * @param {string[]} [options.paths] - the pages; every page of the new build without, or `/` for a running site
 * @param {string} options.out - where the images and results.json go
 * @param {{ before: string, after: string }} [options.labels] - the titles above the two halves
 * @param {string} [options.storageState] - a Playwright storage state, for a site behind a login
 * @param {string} [options.playwright] - a playwright module, instead of the project's
 * @param {(line: string) => void} [options.onPage] - called with one line per page as it is done
 * @returns {Promise<object[]>} one entry per page and viewport
 */
export async function compareSites({ root, before, after, paths = [], out, labels = { before: 'Voor', after: 'Na' }, storageState, playwright, onPage = () => {} }) {
	const outDir = resolve(root, out);
	mkdirSync(outDir, { recursive: true });
	const servers = [];
	const originOf = async (place) => {
		if (isUrl(place)) return new URL(place).origin;
		const server = await serveDirectory(resolve(root, place));
		servers.push(server);
		return server.origin;
	};
	const pages = paths.length > 0 ? paths : isUrl(after) ? [new URL(after).pathname] : pagesOf(resolve(root, after));
	const browser = await launchBrowser({ root, module: playwright });
	const results = [];
	try {
		const origins = { before: await originOf(before), after: await originOf(after) };
		const composer = await (await browser.newContext()).newPage();
		await composer.addScriptTag({ content: coreForPage() });
		for (const path of pages) {
			for (const [viewport, size] of Object.entries(VIEWPORTS)) {
				const context = await browser.newContext({
					viewport: size,
					reducedMotion: 'reduce',
					colorScheme: 'light',
					...(storageState ? { storageState: resolve(root, storageState) } : {}),
				});
				let result;
				try {
					const shots = { before: await capture(context, origins.before + path), after: await capture(context, origins.after + path) };
					const drawn = await composer.evaluate(drawInPage, { before: shots.before, after: shots.after, labels: { ...labels, kinds: KINDS } });
					const file = drawn.identical ? null : imageName(path, viewport);
					if (file) writeFileSync(join(outDir, file), Buffer.from(drawn.png, 'base64'));
					const counts = {};
					for (const { tag, kind } of drawn.marks) {
						const key = kind === 'pixels' ? 'pixels' : `${tag} ${kind}`;
						counts[key] = (counts[key] ?? 0) + 1;
					}
					result = { path, viewport, identical: drawn.identical, file, marks: drawn.marks.length, counts, replaced: drawn.replaced, heightBefore: drawn.heightBefore, heightAfter: drawn.heightAfter, consoleBefore: shots.before.messages, consoleAfter: shots.after.messages };
					onPage(`${path} ${viewport}: ${drawn.identical ? 'identical' : `${drawn.marks.length} marked`}, height ${drawn.heightBefore} -> ${drawn.heightAfter}${drawn.marks.length > 0 ? ` ${JSON.stringify(counts)}` : ''}`);
				} catch (error) {
					result = { path, viewport, error: String(error).split('\n')[0] };
					onPage(`${path} ${viewport}: could not be compared: ${result.error}`);
				}
				results.push(result);
				await context.close();
			}
		}
	} finally {
		await browser.close();
		for (const server of servers) server.close();
	}
	writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, null, '\t'));
	return results;
}
