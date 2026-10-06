/**
 * Runs axe-core over every page of the site, in a real browser.
 *
 * Storybook had an accessibility panel beside each story. This is what took
 * its place, and it checks more: every page, every example on it, without
 * anyone having to open the panel. It tests against WCAG 2.1 level A and AA.
 *
 * A finding is one of two kinds, and they are treated differently:
 *
 * - On the site itself (the header, the navigation, the stage and its
 *   controls, the prose): always an error. The site is ours to get right.
 * - Inside an example: compared with site/a11y-baseline.json. An example shows
 *   a component, sometimes in a state that is wrong on purpose, and the
 *   components had findings before this check existed. The baseline records
 *   those, so that a NEW finding fails while the known ones are worked off.
 *   A finding that is gone must leave the baseline too, so it cannot return
 *   unnoticed.
 *
 * Usage:
 *   node scripts/check-site-a11y.js            check against the baseline
 *   node scripts/check-site-a11y.js --update   rewrite the baseline
 *   node scripts/check-site-a11y.js /iconen/   only the pages that match
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { buildPages } from '../site/build/site.js';
import { collectComponents, collectPatterns } from '../site/build/sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const baselinePath = resolve(repoRoot, 'site/a11y-baseline.json');
const axeSource = readFileSync(resolve(repoRoot, 'node_modules/axe-core/axe.min.js'), 'utf8');

const update = process.argv.includes('--update');
const filters = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const WORKERS = 6;

/** The pages to visit: every page of the site, and every example that runs in a window of its own. */
function targets() {
	const { pages } = buildPages();
	const paths = Object.keys(pages)
		.filter((path) => path !== 'voorbeeld/index.html')
		.map((path) => `/${path.replace(/index\.html$/, '')}`);
	// A framed example is loaded lazily and lives in an iframe, so its page is
	// visited directly instead of through the stage that shows it.
	for (const file of [...collectComponents(), ...collectPatterns()]) {
		if (!file.fullscreen && !file.slug.match(/^(application|content-page)$/)) continue;
		for (const story of file.stories) {
			paths.push(`/voorbeeld/?file=${encodeURIComponent(file.file)}&story=${story.exportName}`);
		}
	}
	const selected = filters.length
		? paths.filter((path) => filters.some((f) => (f === '/' ? path === '/' : path.includes(f))))
		: paths;
	// The landing page and one page of each kind are checked in dark as well.
	const dark = ['/', '/componenten/button/', '/patronen/form/', '/aan-de-slag/'].filter((path) => selected.includes(path));
	return [...selected.map((path) => ({ path, scheme: 'light' })), ...dark.map((path) => ({ path, scheme: 'dark' }))];
}

async function check(browser, origin, { path, scheme }) {
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
	const page = await context.newPage();
	try {
		await page.goto(origin + path, { waitUntil: 'networkidle' });
		await page.waitForTimeout(400);
		await page.addScriptTag({ content: axeSource });
		const findings = await page.evaluate(async (tags) => {
			const result = await window.axe.run(document, {
				runOnly: { type: 'tag', values: tags },
				iframes: false,
			});
			const inExample = (selector) =>
				location.pathname.endsWith('/voorbeeld/') ||
				selector.some((part) => {
					const first = Array.isArray(part) ? part[0] : part;
					try {
						return !!document.querySelector(first)?.closest('.site-stage__canvas, site-stage[bare]');
					} catch {
						return false;
					}
				});
			return result.violations.flatMap((violation) =>
				violation.nodes.map((node) => ({
					rule: violation.id,
					help: violation.help,
					target: node.target.flat().join(' >> '),
					example: inExample(node.target),
					summary: (node.failureSummary ?? '').split('\n').slice(1, 2).join(' ').trim(),
				})),
			);
		}, TAGS);
		return findings.map((finding) => ({ ...finding, path, scheme }));
	} finally {
		await context.close();
	}
}

/** One line per rule on a page: how often it fires there. Stable across runs, unlike selectors. */
function summarize(findings) {
	const counts = {};
	for (const { path, scheme, rule } of findings) {
		const key = `${scheme === 'dark' ? 'donker ' : ''}${path}`;
		counts[key] ??= {};
		counts[key][rule] = (counts[key][rule] ?? 0) + 1;
	}
	return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

const server = await createServer({
	configFile: resolve(repoRoot, 'site/vite.config.ts'),
	server: { port: 0, strictPort: false },
	logLevel: 'error',
});
await server.listen();
const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch();

const queue = targets();
const total = queue.length;
const all = [];
await Promise.all(
	Array.from({ length: WORKERS }, async () => {
		while (queue.length) {
			const target = queue.shift();
			try {
				all.push(...(await check(browser, origin, target)));
			} catch (error) {
				all.push({ ...target, rule: 'page-failed', help: error.message.split('\n')[0], target: '', example: false, summary: '' });
			}
		}
	}),
);
await browser.close();
await server.close();

const onSite = all.filter((finding) => !finding.example);
const inExamples = summarize(all.filter((finding) => finding.example));

let failed = false;

if (onSite.length) {
	failed = true;
	console.error(`${onSite.length} bevinding(en) op de site zelf:\n`);
	const seen = new Set();
	for (const finding of onSite) {
		const key = `${finding.rule} ${finding.target}`;
		if (seen.has(key)) continue;
		seen.add(key);
		console.error(`  ${finding.rule}: ${finding.help}\n    ${finding.path} (${finding.scheme})\n    ${finding.target}\n    ${finding.summary}\n`);
	}
}

if (update && !filters.length) {
	writeFileSync(baselinePath, `${JSON.stringify(inExamples, null, '\t')}\n`);
	console.log(`Baseline geschreven: ${Object.keys(inExamples).length} pagina's met bekende bevindingen in voorbeelden.`);
} else {
	const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
	const pagesToCompare = filters.length ? Object.keys(inExamples) : [...new Set([...Object.keys(baseline), ...Object.keys(inExamples)])];
	const worse = [];
	const better = [];
	for (const page of pagesToCompare) {
		const rules = new Set([...Object.keys(baseline[page] ?? {}), ...Object.keys(inExamples[page] ?? {})]);
		for (const rule of rules) {
			const before = baseline[page]?.[rule] ?? 0;
			const now = inExamples[page]?.[rule] ?? 0;
			if (now > before) worse.push(`  ${page}: ${rule} ${before} -> ${now}`);
			if (now < before) better.push(`  ${page}: ${rule} ${before} -> ${now}`);
		}
	}
	if (worse.length) {
		failed = true;
		console.error(`Nieuwe bevindingen in voorbeelden:\n${worse.join('\n')}\n`);
		console.error('Los ze op in het component of in de story. Is het voorbeeld met opzet fout, draai dan\n`npm run test:a11y -- --update` en leg in de commit uit waarom.\n');
	}
	if (better.length) {
		failed = true;
		console.error(`Opgeloste bevindingen staan nog in de baseline:\n${better.join('\n')}\n`);
		console.error('Draai `npm run test:a11y -- --update` en commit site/a11y-baseline.json, zodat ze niet ongemerkt terugkomen.\n');
	}
}

if (failed) process.exit(1);
console.log(`Toegankelijkheid in orde: ${total} pagina's gecontroleerd met axe (WCAG 2.1 A en AA).`);
