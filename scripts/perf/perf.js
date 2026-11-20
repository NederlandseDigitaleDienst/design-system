#!/usr/bin/env node
/**
 * Measures what N copies of a component cost: to load, to insert, to lay out
 * again. In Playwright-WebKit and in real Safari (via safaridriver).
 *
 *   node scripts/perf/perf.js [options]
 *
 *   --browsers webkit,safari   which browsers (default webkit)
 *   --groups stories           scenario groups: stories, list, single, children, full
 *   --scenarios a,b            exact scenario names instead of groups
 *   --match text               only scenarios whose name contains text
 *   --sizes 50,500             copies per page (default 50,500)
 *   --modes parse,insert       parse: the copies are in the HTML; insert: one
 *                              append of all copies after the load, the way a
 *                              framework renders them (default both)
 *   --runs 1                   runs per measurement, the median is kept
 *   --timeout 60               seconds a page may take
 *   --bundle dist/nldd.min.js  the standalone bundle to load
 *   --out file.jsonl           also append every result to this file
 *   --resize 1280,600          window widths to resize between after the load,
 *                              the real window, so media queries and resize
 *                              listeners run too (default 1280,600; none: off)
 *
 * The stories group needs scripts/perf/out/stories.json, from
 *   npx vitest run --config scripts/perf/vitest.config.ts
 * and the bundle from
 *   npm run build:styles && npm run build:components:standalone
 *
 * Safari needs `safaridriver --enable`, "Allow remote automation" in Safari's
 * Developer settings, and Safari closed before the run.
 *
 * Every page also gets an empty run (`empty`): only the bundle, no copies.
 * `cost` is what a page took above that. Between two sizes, `marginal` is the
 * price of one more copy, without the fixed frames every page waits for, and
 * `growth` says how the cost scales: 1 is linear, 2 is quadratic.
 */
import http from 'node:http';
import { appendFile, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { scenarios } from './scenarios.js';

const ROOT = resolve(import.meta.dirname, '../..');
const args = Object.fromEntries(
	process.argv.slice(2).reduce((pairs, arg, i, all) => {
		if (arg.startsWith('--')) pairs.push([arg.slice(2), all[i + 1]]);
		return pairs;
	}, []),
);
const BROWSERS = (args.browsers ?? 'webkit').split(',');
const GROUPS = (args.groups ?? 'stories').split(',');
const SIZES = (args.sizes ?? '50,500').split(',').map(Number);
const MODES = (args.modes ?? 'parse,insert').split(',');
const RUNS = Number(args.runs ?? 1);
const TIMEOUT = Number(args.timeout ?? 60) * 1000;
const BUNDLE = `/${args.bundle ?? 'dist/nldd.min.js'}`;
const OUT = args.out;
const SCENARIOS = (args.scenarios
	? args.scenarios.split(',')
	: Object.keys(scenarios).filter((name) => GROUPS.includes(scenarios[name].group)))
	.filter((name) => !args.match || name.includes(args.match));
const VIEWPORT = { width: 1280, height: 900 };
const RESIZE = args.resize === 'none' ? [] : (args.resize ?? '1280,600').split(',').map(Number);

/* The page measures itself and leaves the result on window.__perf. */
const MEASURE = `
<script>
const frames = (n) => new Promise((done) => {
	const step = () => (--n ? requestAnimationFrame(step) : done());
	requestAnimationFrame(step);
});
/* Every component has done its updates, and two frames have painted. A
   component that keeps updating never settles: it is counted, not waited for. */
const settled = async () => {
	const all = [...document.querySelectorAll('*')].filter((el) => el.updateComplete);
	let pending = all.length;
	const each = all.map((el) => el.updateComplete.then(() => pending--));
	const gaveUp = await Promise.race([
		Promise.all(each).then(() => false),
		new Promise((done) => setTimeout(() => done(true), 10_000)),
	]);
	await frames(2);
	return gaveUp ? pending : 0;
};
/* A window resize: from just before the driver resizes the window until two
   frames after the resize event, so the layout, the resize observers and the
   updates they cause. The browser lays out before it fires the event, so the
   start is set from the driver, and the empty page subtracts its round trip. */
window.__resizes = [];
window.addEventListener('resize', () => {
	frames(2).then(() => window.__resizes.push({ time: performance.now() - window.__resizeStart, width: innerWidth }));
});
window.addEventListener('load', async () => {
	const nav = performance.getEntriesByType('navigation')[0];
	const unsettled = await settled();
	const result = { parsed: nav.domInteractive, ready: performance.now(), unsettled };
	const box = document.getElementById('perf-box');
	const template = document.getElementById('perf-template');
	if (template) {
		const start = performance.now();
		box.append(template.content.cloneNode(true));
		result.unsettled = await settled();
		result.insert = performance.now() - start;
	}
	result.elements = box.querySelectorAll('*').length;
	const sync = [];
	const settle = [];
	for (const width of ['400px', '1200px', '400px', '1200px']) {
		const start = performance.now();
		box.style.width = width;
		void box.offsetHeight;
		sync.push(performance.now() - start);
		await frames(2);
		settle.push(performance.now() - start);
	}
	result.relayout = Math.min(...sync);
	result.relayoutSettle = Math.min(...settle);
	window.__perf = result;
});
</script>`;

function page(scenario, n, mode) {
	const markup = scenario === 'empty' ? '' : scenarios[scenario].body(n);
	const { head = '' } = scenarios[scenario] ?? {};
	return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>perf</title>
<link rel="stylesheet" href="/dist/css/global.css">
<script src="${BUNDLE}"></script>
${head}
${MEASURE}
</head>
<body>
<div id="perf-box" style="width:1200px;max-width:100%">
${mode === 'parse' ? markup : ''}
</div>
${mode === 'insert' ? `<template id="perf-template">${markup}</template>` : ''}
</body>
</html>`;
}

const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

function serve() {
	const server = http.createServer(async (req, res) => {
		const url = new URL(req.url, 'http://localhost');
		if (url.pathname === '/page') {
			res.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'no-store' });
			res.end(page(url.searchParams.get('s'), Number(url.searchParams.get('n')), url.searchParams.get('m')));
			return;
		}
		try {
			// Story images live in public/, and are referenced from the root.
			const file = await readFile(join(ROOT, url.pathname)).catch(() => readFile(join(ROOT, 'public', url.pathname)));
			res.writeHead(200, { 'content-type': TYPES[extname(url.pathname)] ?? 'application/octet-stream', 'cache-control': 'max-age=3600' });
			res.end(file);
		} catch {
			res.writeHead(404).end();
		}
	});
	return new Promise((done) => server.listen(0, () => done(server)));
}

/* ---- Drivers ---- */

async function webkitDriver() {
	const { webkit } = await import('playwright');
	const browser = await webkit.launch();
	const context = await browser.newContext({ viewport: VIEWPORT });
	return {
		name: 'webkit',
		async measure(url) {
			const tab = await context.newPage();
			let errors = 0;
			tab.on('pageerror', () => errors++);
			tab.on('console', (message) => { if (message.type() === 'error') errors++; });
			try {
				await tab.goto(url, { timeout: TIMEOUT });
				await tab.waitForFunction(() => window.__perf, null, { timeout: TIMEOUT, polling: 50 });
				const result = await tab.evaluate(() => window.__perf);
				result.resizes = await resizeAll({
					run: (script) => tab.evaluate(`new Promise((done) => { ${script} })`),
					resize: (width) => tab.setViewportSize({ width, height: VIEWPORT.height }),
				});
				return { ...result, errors };
			} finally {
				await tab.close();
			}
		},
		close: () => browser.close(),
	};
}

async function safariDriver() {
	const port = 4446;
	const proc = spawn('safaridriver', ['-p', String(port)], { stdio: 'ignore' });
	await new Promise((done) => setTimeout(done, 1500));
	const base = `http://localhost:${port}`;
	const call = async (method, path, body) => {
		const res = await fetch(base + path, {
			method,
			headers: { 'content-type': 'application/json' },
			body: body && JSON.stringify(body),
		});
		const json = await res.json();
		if (json.value?.error) throw new Error(`${path}: ${json.value.message}`);
		return json.value;
	};
	let s;
	const open = async () => {
		const { sessionId } = await call('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'safari' } } });
		s = `/session/${sessionId}`;
		await call('POST', `${s}/timeouts`, { script: TIMEOUT, pageLoad: TIMEOUT });
		await call('POST', `${s}/window/rect`, { x: 0, y: 0, ...VIEWPORT });
	};
	await open();
	const run = (script) => call('POST', `${s}/execute/async`, { script: `const done = arguments[0]; ${script}`, args: [] });
	return {
		name: 'safari',
		async measure(url) {
			try {
				await call('POST', `${s}/url`, { url: 'about:blank' });
				await call('POST', `${s}/url`, { url });
				await run('const wait = () => (window.__perf ? done() : setTimeout(wait, 50)); wait();');
				const result = await run('done(window.__perf);');
				result.resizes = await resizeAll({
					run,
					resize: (width) => call('POST', `${s}/window/rect`, { width, height: VIEWPORT.height }),
				});
				return { ...result, errors: 0 };
			} catch (error) {
				// A page that hangs takes the session with it: start a new one.
				await call('DELETE', s).catch(() => {});
				await open();
				throw error;
			}
		},
		async close() {
			await call('DELETE', s).catch(() => {});
			proc.kill();
		},
	};
}

/* Resizes the window between the RESIZE widths, twice, and returns how long
   each resize took to settle. */
async function resizeAll({ run, resize }) {
	const times = [];
	for (const width of [...RESIZE.slice(1), ...RESIZE, ...RESIZE.slice(0, 1)]) {
		await run('window.__resizes = []; window.__resizeStart = performance.now(); done();');
		await resize(width);
		times.push(await run(`const start = performance.now();
			const wait = () => {
				const last = window.__resizes.at(-1);
				if (last && last.width === ${width} && performance.now() - start > 200) done(last.time);
				else if (performance.now() - start > 10000) done(null);
				else setTimeout(wait, 50);
			};
			wait();`));
	}
	return times.filter((t) => t !== null);
}

/* ---- Run ---- */

const median = (values) => {
	const sorted = values.filter((v) => v !== undefined).sort((a, b) => a - b);
	if (!sorted.length) return undefined;
	const mid = sorted.length >> 1;
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const server = await serve();
const origin = `http://localhost:${server.address().port}`;
const rows = [];
const url = (scenario, n, mode) => `${origin}/page?s=${encodeURIComponent(scenario)}&n=${n}&m=${mode}`;

async function measureMany(driver, target) {
	const runs = [];
	for (let i = 0; i < RUNS; i++) runs.push(await driver.measure(target));
	return runs;
}

for (const browserName of BROWSERS) {
	const driver = browserName === 'safari' ? await safariDriver() : await webkitDriver();
	try {
		await driver.measure(url('empty', 0, 'parse'));
		const emptyRuns = await measureMany(driver, url('empty', 0, 'parse'));
		const empty = median(emptyRuns.map((r) => r.ready));
		const emptyResize = median(emptyRuns.flatMap((r) => r.resizes)) ?? 0;
		console.error(`${driver.name}: empty page ${empty.toFixed(0)} ms, resize ${emptyResize.toFixed(0)} ms, ${SCENARIOS.length} scenarios`);
		for (const scenario of SCENARIOS) {
			for (const mode of MODES) {
				let previous;
				for (const n of SIZES) {
					const row = { browser: driver.name, scenario, group: scenarios[scenario].group, mode, n };
					try {
						const runs = await measureMany(driver, url(scenario, n, mode));
						const total = median(runs.map((r) => (mode === 'insert' ? r.insert : r.ready)));
						Object.assign(row, {
							elements: runs[0].elements,
							errors: runs[0].errors,
							unsettled: Math.max(...runs.map((r) => r.unsettled)),
							parsed: median(runs.map((r) => r.parsed)),
							total,
							cost: mode === 'insert' ? total : Math.max(0, total - empty),
							relayout: median(runs.map((r) => r.relayout)),
							relayoutSettle: median(runs.map((r) => r.relayoutSettle)),
						});
						const resizes = runs.flatMap((r) => r.resizes);
						if (resizes.length) {
							// The cheapest resize above an empty page, and the worst.
							row.resize = Math.max(0, Math.min(...resizes) - emptyResize);
							row.resizeMax = Math.max(0, Math.max(...resizes) - emptyResize);
						}
						row.perCopy = row.cost / n;
						if (previous) row.marginal = (row.cost - previous.cost) / (n - previous.n);
						if (previous) row.growth = Math.log(Math.max(row.cost, 1) / Math.max(previous.cost, 1)) / Math.log(n / previous.n);
						previous = row;
					} catch (error) {
						row.failed = error.message.split('\n')[0];
					}
					rows.push(row);
					if (OUT) await appendFile(OUT, `${JSON.stringify(row)}\n`);
					const shown = row.failed
						? `FAILED ${row.failed}`
						: `${row.cost.toFixed(0).padStart(7)} ms  ${row.perCopy.toFixed(2).padStart(7)} ms/copy${row.marginal !== undefined ? `  marginal ${row.marginal.toFixed(2)}` : ''}${row.growth ? `  growth ${row.growth.toFixed(2)}` : ''}${row.resize !== undefined ? `  resize ${row.resize.toFixed(0)}` : ''}${row.unsettled ? `  unsettled ${row.unsettled}` : ''}`;
					console.error(`${driver.name.padEnd(6)} ${mode.padEnd(6)} ${scenario.padEnd(60).slice(0, 60)} ${String(n).padStart(5)} ${shown}`);
					if (row.failed) break;
				}
			}
		}
	} finally {
		await driver.close();
	}
}
server.close();
if (!OUT) console.log(JSON.stringify(rows, null, '\t'));
