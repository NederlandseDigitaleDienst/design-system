#!/usr/bin/env node
/**
 * Opens the pages of a running dev build and collects what the design system
 * reports in the console there.
 *
 * In a dev build the components check the page with the same rules as
 * `nldd lint`, on the elements as they are rendered. That sees what the linter
 * cannot read in the source: text that comes from an expression, a value a
 * variable passes on, markup another file puts together. After an upgrade
 * this is the worklist the source does not give.
 *
 * The checks only run in a dev build, with a bundler that sets
 * `import.meta.env.DEV`, such as Vite. A production build reports nothing.
 *
 * Usage, from the project:
 *   node collect-dev-findings.mjs <base url> [path ...]
 *     [--crawl]                  also follow links to pages of the same origin
 *     [--max <n>]                at most this many pages (default 40)
 *     [--out <file>]             write everything as JSON
 *     [--storage-state <file>]   a Playwright storage state, for an app behind a login
 *     [--playwright <module>]    when the project has no playwright of its own
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`).
 */

import process from 'node:process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const { values: options, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		crawl: { type: 'boolean', default: false },
		max: { type: 'string', default: '40' },
		out: { type: 'string' },
		'storage-state': { type: 'string' },
		playwright: { type: 'string' },
	},
});
const print = (line) => process.stdout.write(`${line}\n`);
if (positionals.length === 0) {
	console.error('Usage: collect-dev-findings.mjs <base url> [path ...] [--crawl] [--max <n>] [--out <file>] [--storage-state <file>] [--playwright <module>]');
	process.exit(2);
}
const [base, ...paths] = positionals;
const origin = new URL(base).origin;
const max = Number(options.max);

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

/**
 * The checks wait for the page to settle, and look again every two seconds for
 * what only a component's state shows. Long enough for both.
 */
const SETTLE_MS = 2600;

/** `[nldd] rule-id: message`, or one of the few that report without a rule. */
function parse(text) {
	// The console prints the element after the message; that one is read separately.
	const body = text.replace(/^\[nldd\]\s*/, '').replace(/\s*JSHandle@\w+$/, '');
	const rule = body.match(/^([a-z0-9-]+(?:\.css)?|setTranslations|translations):\s*(.*)$/s);
	if (rule) return { rule: rule[1], message: rule[2] };
	if (/is not registered/.test(body)) return { rule: 'not-registered', message: body };
	return { rule: 'other', message: body };
}

/** Enough of an element to find it back in the source. */
function describe(element) {
	if (!(element instanceof Element)) return null;
	const open = element.outerHTML.slice(0, element.outerHTML.indexOf('>') + 1);
	const trail = [];
	for (let node = element; node && node !== document.documentElement && trail.length < 5; node = node.parentElement ?? node.getRootNode().host) {
		trail.unshift(node.localName + (node.id ? `#${node.id}` : ''));
	}
	// Which component of the app rendered it, where a dev build of the framework
	// keeps that: the owners in React, the file of the component in Vue.
	const owners = [];
	const fiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
	for (let owner = fiberKey ? element[fiberKey]?._debugOwner : null; owner && owners.length < 3; owner = owner._debugOwner ?? owner.owner) {
		const type = owner.type ?? owner.elementType;
		const name = owner.name ?? type?.displayName ?? type?.name;
		if (typeof name === 'string' && name && !owners.includes(name)) owners.push(name);
	}
	const vue = element.__vueParentComponent?.type;
	if (vue) owners.push(vue.__file ?? vue.__name ?? vue.name ?? '');
	return {
		tag: element.localName,
		owner: owners.filter(Boolean).join(' < '),
		html: open.length > 240 ? `${open.slice(0, 240)}…` : open,
		text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
		within: trail.join(' > '),
	};
}

const chromium = await loadChromium();
const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: { width: 1280, height: 900 },
	...(options['storage-state'] ? { storageState: resolve(options['storage-state']) } : {}),
});

const queue = (paths.length > 0 ? paths : [new URL(base).pathname || '/']).map((path) => new URL(path, origin).href);
const visited = new Set();
const findings = [];
const failed = [];

while (queue.length > 0 && visited.size < max) {
	const url = queue.shift();
	if (visited.has(url)) continue;
	visited.add(url);
	const page = await context.newPage();
	const pending = [];
	page.on('console', (message) => {
		if (!message.text().startsWith('[nldd]')) return;
		const parsed = parse(message.text());
		const handle = message.args()[1];
		pending.push((handle ? handle.evaluate(describe).catch(() => null) : Promise.resolve(null)).then((element) => {
			findings.push({ ...parsed, page: new URL(url).pathname + new URL(url).search, element });
		}));
	});
	try {
		await page.goto(url, { waitUntil: 'networkidle' });
		await page.waitForTimeout(SETTLE_MS);
		await Promise.all(pending);
		if (options.crawl) {
			const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((link) => link.href));
			for (const link of links) {
				const target = new URL(link);
				target.hash = '';
				if (target.origin === origin && !visited.has(target.href) && !queue.includes(target.href)) queue.push(target.href);
			}
		}
	} catch (error) {
		failed.push({ page: url, error: String(error).split('\n')[0] });
	}
	await page.close();
}
await browser.close();

// One line per rule, with where it shows and what it looks like.
const perRule = new Map();
for (const finding of findings) {
	const entry = perRule.get(finding.rule) ?? { rule: finding.rule, message: finding.message, count: 0, pages: new Set(), owners: {}, examples: [] };
	entry.count++;
	entry.pages.add(finding.page);
	if (finding.element?.owner) entry.owners[finding.element.owner] = (entry.owners[finding.element.owner] ?? 0) + 1;
	if (finding.element && entry.examples.length < 5 && !entry.examples.some((example) => example.html === finding.element.html)) entry.examples.push(finding.element);
	perRule.set(finding.rule, entry);
}
const summary = [...perRule.values()].sort((a, b) => b.count - a.count).map((entry) => ({ ...entry, pages: [...entry.pages] }));

print(`${visited.size} pages, ${findings.length} findings in ${summary.length} rules${failed.length ? `, ${failed.length} pages failed to load` : ''}`);
for (const entry of summary) {
	print(`\n${String(entry.count).padStart(4)}  ${entry.rule}  on ${entry.pages.length} page${entry.pages.length === 1 ? '' : 's'}`);
	print(`      ${entry.message}`);
	// Rendered by which components of the app: where to look in the source.
	const owners = Object.entries(entry.owners).sort((a, b) => b[1] - a[1]);
	for (const [owner, count] of owners.slice(0, 12)) print(`      ${String(count).padStart(4)}× in ${owner}`);
	if (owners.length > 12) print(`      and ${owners.length - 12} more components, in the JSON`);
	for (const example of entry.examples) print(`      ${example.html}${example.text ? `  "${example.text}"` : ''}`);
}
for (const failure of failed) print(`\nfailed: ${failure.page}  ${failure.error}`);
if (findings.length === 0) print('\nNothing reported. That is only a result for a dev build: a production build does not contain the checks.');
if (queue.length > 0) print(`\n${queue.length} more pages were found and not opened. Raise --max to open them.`);

if (options.out) {
	writeFileSync(resolve(options.out), JSON.stringify({ pages: [...visited], failed, summary, findings }, null, '\t'));
	print(`\nWritten to ${options.out}`);
}
