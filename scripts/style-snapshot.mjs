/**
 * Records the computed styles of every story, so a refactor that should change
 * nothing can prove it. Walks every element in the story, through shadow roots,
 * plus ::before and ::after, and keeps every property except custom properties:
 * those are what a token refactor renames, the values they resolve to are what
 * has to stay the same.
 *
 *   node scripts/style-snapshot.mjs record <dir> [--filter <text>] [--missing]
 *   node scripts/style-snapshot.mjs compare <before> <after> [--noise <dir>[,<dir>]]
 *
 * Expects Storybook on http://localhost:6006 (or STORYBOOK_URL). Each story is
 * recorded at two widths (lg and sm) and in light and dark. Hover, focus and
 * other interaction states are not covered: only what a story renders at rest.
 *
 * Some values come from measuring rather than from a token: an editor's cursor,
 * a menu as wide as its anchor. They can differ between two recordings of the
 * same code. Geometry set inline by script is left out, and `--noise` takes
 * more recordings of the before state: whatever differs between them and the
 * baseline proves nothing, so it is reported apart instead of failing.
 */

import { chromium } from 'playwright';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6006';
const VIEWPORTS = [{ name: 'lg', width: 1280, height: 800 }, { name: 'sm', width: 375, height: 800 }];
const SCHEMES = ['light', 'dark'];
const CONCURRENCY = 6;

function collect() {
	// Running animations make two recordings of the same code differ, so every
	// animation is stopped at its start: CSS and Web Animations, and SMIL in SVG.
	// document.getAnimations() does not reach into shadow roots, so each element
	// is asked for its own.
	const freeze = root => {
		for (const el of root.querySelectorAll('*')) {
			for (const animation of el.getAnimations()) {
				animation.pause();
				animation.currentTime = 0;
			}
			if (el.localName === 'svg') {
				el.pauseAnimations?.();
				el.setCurrentTime?.(0);
			}
			if (el.shadowRoot) freeze(el.shadowRoot);
		}
	};
	freeze(document);
	const out = {};
	const pseudos = ['::before', '::after'];
	const geometry = /^(top|left|right|bottom|inset(-.*)?|(min-|max-)?(width|height)|(min-|max-)?(block|inline)-size|transform|transform-origin|perspective-origin)$/;
	const placedByScript = el => /(^|;)\s*(top|left|width|height|transform)\s*:/.test(el.getAttribute?.('style') ?? '');
	const record = (key, style, skipGeometry) => {
		const props = {};
		for (let i = 0; i < style.length; i++) {
			const name = style[i];
			if (name.startsWith('--')) continue;
			if (skipGeometry && geometry.test(name)) continue;
			props[name] = style.getPropertyValue(name);
		}
		out[key] = props;
	};
	const walk = (root, prefix) => {
		const counts = {};
		for (const el of root.children) {
			const tag = el.localName;
			counts[tag] = (counts[tag] ?? 0) + 1;
			const key = `${prefix}/${tag}[${counts[tag]}]`;
			record(key, getComputedStyle(el), placedByScript(el));
			for (const pseudo of pseudos) {
				const style = getComputedStyle(el, pseudo);
				if (style.content !== 'none' && style.content !== 'normal') record(key + pseudo, style);
			}
			if (el.shadowRoot) walk(el.shadowRoot, `${key}#shadow`);
			walk(el, key);
		}
	};
	walk(document.body, 'body');
	return out;
}

async function settle(page) {
	await page.waitForFunction(() => document.querySelector('#storybook-root')?.childElementCount > 0, null, { timeout: 15000 }).catch(() => {});
	await page.evaluate(async () => {
		await document.fonts.ready;
		const images = [];
		const findImages = root => {
			for (const el of root.querySelectorAll('*')) {
				if (el.localName === 'img' && !el.complete) images.push(new Promise(resolve => {
					el.addEventListener('load', resolve, { once: true });
					el.addEventListener('error', resolve, { once: true });
				}));
				if (el.shadowRoot) findImages(el.shadowRoot);
			}
		};
		findImages(document);
		await Promise.race([Promise.all(images), new Promise(resolve => setTimeout(resolve, 5000))]);
		const updates = [...document.querySelectorAll('*')].map(el => el.updateComplete).filter(Boolean);
		await Promise.all(updates);
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	});
	await page.waitForTimeout(250);
}

async function record(dir, filter, missingOnly) {
	await mkdir(dir, { recursive: true });
	const index = await (await fetch(`${BASE}/index.json`)).json();
	const ids = Object.values(index.entries)
		.filter(entry => entry.type === 'story' && (!filter || entry.id.includes(filter)))
		.map(entry => entry.id);
	const fileFor = ({ id, viewport, scheme }) => join(dir, `${id}.${viewport.name}.${scheme}.json.gz`);
	let jobs = ids.flatMap(id => VIEWPORTS.flatMap(viewport => SCHEMES.map(scheme => ({ id, viewport, scheme }))));
	if (missingOnly) {
		const exists = await Promise.all(jobs.map(job => access(fileFor(job)).then(() => true, () => false)));
		jobs = jobs.filter((_, i) => !exists[i]);
	}
	console.log(`${ids.length} stories, ${jobs.length} recordings`);

	const browser = await chromium.launch();
	const failures = [];
	const unstable = [];
	let done = 0;
	const worker = async () => {
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		const page = await context.newPage();
		while (jobs.length) {
			const current = jobs.shift();
			const { id, viewport, scheme } = current;
			try {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story&globals=theme:${scheme}`, { waitUntil: 'load' });
				await settle(page);
				// Components that measure themselves (a toolbar filling its overflow
				// menu, an editor placing its cursor) can still be moving: record
				// until two recordings in a row agree.
				let styles = await page.evaluate(collect);
				let previous = '';
				let json = JSON.stringify(styles);
				for (let tries = 0; json !== previous && tries < 8; tries++) {
					previous = json;
					await page.waitForTimeout(300);
					styles = await page.evaluate(collect);
					json = JSON.stringify(styles);
				}
				if (json !== previous) unstable.push(`${id} ${viewport.name} ${scheme}`);
				await writeFile(fileFor(current), gzipSync(JSON.stringify(styles)));
			} catch (error) {
				// A first visit can time out while Vite compiles, or reload when it
				// optimizes a dependency: worth one more try before it counts.
				const job = { id, viewport, scheme, retried: true };
				if (!current.retried) {
					jobs.push(job);
					continue;
				}
				failures.push(`${id} ${viewport.name} ${scheme}: ${error.message.split('\n')[0]}`);
			}
			if (++done % 100 === 0) console.log(`${done} done`);
		}
		await context.close();
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	await browser.close();
	console.log(`${done} recorded, ${failures.length} failed, ${unstable.length} never settled`);
	failures.forEach(line => console.log(`  failed: ${line}`));
	unstable.forEach(line => console.log(`  never settled: ${line}`));
}

async function compare(before, after, noiseDirs) {
	const files = (await readdir(before)).filter(name => name.endsWith('.json.gz'));
	const load = async (dir, name) => JSON.parse(gunzipSync(await readFile(join(dir, name))).toString());
	const differences = (a, b) => {
		const lines = new Map();
		for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
			if (!a[key] || !b[key]) {
				lines.set(key, `  ${key}: ${a[key] ? 'gone' : 'new'}`);
				continue;
			}
			for (const prop of new Set([...Object.keys(a[key]), ...Object.keys(b[key])])) {
				if (a[key][prop] !== b[key][prop]) lines.set(`${key} ${prop}`, `  ${key} ${prop}: ${a[key][prop]} → ${b[key][prop]}`);
			}
		}
		return lines;
	};
	let changed = 0;
	let noisy = 0;
	for (const name of files) {
		let a;
		let b;
		try {
			[a, b] = [await load(before, name), await load(after, name)];
		} catch {
			console.log(`${name}: missing in ${after}`);
			changed++;
			continue;
		}
		const lines = differences(a, b);
		for (const noiseDir of lines.size ? noiseDirs : []) {
			const noise = differences(a, await load(noiseDir, name).catch(() => a));
			for (const id of noise.keys()) {
				if (lines.delete(id)) noisy++;
			}
		}
		if (lines.size) {
			changed++;
			console.log(`${name}: ${lines.size} differences`);
			[...lines.values()].slice(0, 10).forEach(line => console.log(line));
		}
	}
	console.log(`${files.length} recordings compared, ${changed} differ${noiseDirs.length ? `, ${noisy} differences ignored as noise` : ''}`);
	process.exitCode = changed ? 1 : 0;
}

const [mode, first, second] = process.argv.slice(2);
const filterIndex = process.argv.indexOf('--filter');
const filter = filterIndex > -1 ? process.argv[filterIndex + 1] : '';
if (mode === 'record' && first) await record(first, filter, process.argv.includes('--missing'));
else if (mode === 'compare' && first && second) {
	const noiseIndex = process.argv.indexOf('--noise');
	await compare(first, second, noiseIndex > -1 ? process.argv[noiseIndex + 1].split(',') : []);
}
else console.log('Usage: style-snapshot.mjs record <dir> [--filter <text>] [--missing] | compare <before> <after> [--noise <dir>[,<dir>]]');
