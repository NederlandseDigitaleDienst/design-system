/**
 * Runs the rules from src/rules/ on the live page while developing.
 *
 * The same rules `nldd lint` runs on the source, so a rule has one definition.
 * The two see different things: the linter finds a mistake before anyone opens the
 * page, this sees the values a template only knows at runtime, and everything
 * that different components rendered together.
 *
 * Rules are plain CSS, so the browser evaluates them itself. Only loaded in DEV,
 * through dev-checks-trigger.ts; a production build does not contain it.
 */

import { devRules } from './dev-rules.generated.js';
import { loadingTags } from './loading-tags.js';

export interface DevRule {
	id: string;
	message: string;
	context: string;
	assert?: string;
	report?: string;
	count?: { of: string; min?: number; max?: number };
	/** Properties that count as the attributes `assert` asks for. */
	properties?: string[];
}

/** Long enough for a framework to finish a render, and for most first data. */
const SETTLE_MS = 300;

/** A page that keeps changing still gets checked this often. */
const MAX_WAIT_MS = 1000;

/** A `:state()` changes nothing a MutationObserver sees, so also look regularly. */
const RECHECK_MS = 2000;

function isViolated(rule: DevRule, element: Element): boolean {
	if (rule.assert) {
		// A framework can set a property, which a selector does not see.
		const set = rule.properties?.some((name) => (element as unknown as Record<string, unknown>)[name]);
		return !set && !element.matches(rule.assert);
	}
	if (rule.report) return element.matches(rule.report);
	if (rule.count) {
		const { of, min, max } = rule.count;
		const counted = [...element.children].filter((child) => child.matches(of)).length;
		return (max !== undefined && counted > max) || (min !== undefined && counted < min);
	}
	return true;
}

/** An older browser without `:state()` rejects the selector; that rule then does not run. */
function holdsNot(rule: DevRule, element: Element): boolean {
	try {
		return isViolated(rule, element);
	} catch {
		return false;
	}
}

function selectAll(root: ParentNode, selector: string): NodeListOf<Element> | Element[] {
	try {
		return root.querySelectorAll(selector);
	} catch {
		return [];
	}
}

/** @returns The rules each element breaks, per element in document order. */
export function findViolations(root: ParentNode, rules: DevRule[] = devRules) {
	const found: { rule: DevRule; element: Element }[] = [];
	for (const rule of rules) {
		for (const element of selectAll(root, rule.context)) {
			if (holdsNot(rule, element)) found.push({ rule, element });
		}
	}
	return found;
}

/**
 * The document plus the open shadow roots of an app's own components, which
 * querySelectorAll does not enter. Not our own: what a component renders inside
 * itself is its own business, and a test's.
 */
export function findRoots(root: ParentNode = document): ParentNode[] {
	const roots = [root];
	for (const element of root.querySelectorAll('*')) {
		if (element.shadowRoot && !element.localName.startsWith('nldd-')) roots.push(...findRoots(element.shadowRoot));
	}
	return roots;
}

function createReporter() {
	const reported = new WeakMap<Element, Set<string>>();
	return (rules: DevRule[] = devRules) => {
		for (const { rule, element } of findRoots().flatMap((root) => findViolations(root, rules))) {
			const seen = reported.get(element) ?? new Set();
			if (seen.has(rule.id)) continue;
			reported.set(element, seen.add(rule.id));
			console.warn(`[nldd] ${rule.id}: ${rule.message}`, element);
		}
	};
}

/** A translation has no element to state a fact on, so this one reports itself. */
export async function checkTranslationKeys(keys: string[]): Promise<void> {
	const { nl } = await import('../translations/nl.generated.js');
	const unknown = keys.filter((key) => !(key in nl));
	if (unknown.length > 0) console.warn(`[nldd] setTranslations: no component knows ${unknown.join(', ')}.`);
}

/** Each unknown key once, also when a framework hands the element a new object every render. */
const reportedElementKeys = new Set<string>();

/**
 * The keys in an element's own `translations` that it does not read: a key of another
 * component, or one that was renamed. Like setTranslations(), it has no fact to state.
 */
export function checkElementTranslationKeys(keys: string[], known: string[]): void {
	const unknown = keys.filter((key) => !known.includes(key) && !reportedElementKeys.has(key));
	if (unknown.length === 0) return;
	for (const key of unknown) reportedElementKeys.add(key);
	console.warn(`[nldd] translations: the element has no key ${unknown.join(', ')}, so that text stays Dutch.`);
}

const hasComponents = (root: ParentNode) => [...root.querySelectorAll('*')].some((element) => element.localName.startsWith('nldd-'));

/** The keyframes of fouc.css, which only that stylesheet puts on the body. */
const FOUC_GUARD = 'nldd-fouc-reveal';

/**
 * Whether a page that shows components lacks the FOUC guard. The guard is a
 * stylesheet, which no element can state a fact about, so this reads the body.
 */
export function lacksFoucGuard(root: ParentNode | null = document.body): boolean {
	const { body } = document;
	if (!body || !root || !hasComponents(root)) return false;
	const names = getComputedStyle(body).animationName.split(',').map((name) => name.trim());
	return !names.includes(FOUC_GUARD);
}

/** Like a translation, the guard has no element to state a fact on, so this one reports itself. */
export function checkFoucGuard(): void {
	if (lacksFoucGuard()) {
		console.warn("[nldd] fouc.css: this page has no FOUC guard, so components show unstyled until they load. Import '@nldd/design-system/styles', which includes it, or '@nldd/design-system/styles/fouc' on its own.");
	}
}

/** Checks the guard once, on the first run that finds components: an app may add them only after its first route. */
export function createFoucCheck(): () => void {
	let checked = false;
	return () => {
		if (checked || !document.body || !hasComponents(document.body)) return;
		checked = true;
		checkFoucGuard();
	};
}

/** The rules a MutationObserver cannot see change, because they read a `:state()` anywhere. */
export const stateRulesOf = (rules: DevRule[]) => rules.filter((rule) => [rule.context, rule.assert, rule.report, rule.count?.of].some((selector) => selector?.includes(':state(')));

/** How long to wait after a change: settle, unless the page has kept changing for longer than the maximum wait. */
export const settleDelay = (sinceLastRun: number) => (sinceLastRun >= MAX_WAIT_MS ? 0 : SETTLE_MS);

/**
 * What a component holds in light DOM gets its look from a global stylesheet,
 * because `::slotted` reaches no deeper than a child. Each sheet sets a variable
 * on the host that the component's own styles do not, so its absence shows. The
 * value refers to a token, so it reads empty without the tokens too.
 */
const GLOBAL_SHEETS = [
	{ sheet: 'text', selector: 'nldd-text:has(> :is(p, span))', variable: '--_text-link-color' },
	{ sheet: 'title', selector: 'nldd-title:has(> :is(h1, h2, h3, h4, h5, h6, p))', variable: '--_title-link-color' },
	{ sheet: 'link', selector: 'nldd-link:has(> a)', variable: '--_link-color' },
];

/** The global stylesheets that an element on the page needs and that did not load. */
export function findMissingSheets(roots: ParentNode[] = findRoots()): string[] {
	return GLOBAL_SHEETS.filter(({ selector, variable }) => {
		const element = roots.map((root) => root.querySelector(selector)).find((found) => found !== null) ?? null;
		return element !== null && getComputedStyle(element).getPropertyValue(variable) === '';
	}).map(({ sheet }) => sheet);
}

/**
 * Like the FOUC guard, a stylesheet belongs to the page, so this reports itself,
 * once per sheet.
 * @internal Exported for tests.
 */
export function createGlobalSheetCheck() {
	const reported = new Set<string>();
	return () => {
		for (const sheet of findMissingSheets()) {
			if (reported.has(sheet)) continue;
			reported.add(sheet);
			console.warn(`[nldd] ${sheet}.css: the links, code and other inline elements in nldd-${sheet} have no look of their own, because this page does not load that stylesheet. Import '@nldd/design-system/styles', which includes it, or '@nldd/design-system/styles/${sheet}' on its own.`);
		}
	};
}

/**
 * How long an nldd-* element may stay undefined before it counts as never
 * registered. Long enough for a module that loads on demand, the autoloader's
 * included, over a slow connection.
 */
const UNREGISTERED_MS = 3000;

/** The nldd-* elements in these roots that no module has defined (yet). */
export function findUndefined(roots: ParentNode[] = findRoots()): Element[] {
	return roots.flatMap((root) => [...root.querySelectorAll(':not(:defined)')])
		.filter((element) => element.localName.startsWith('nldd-'));
}

/**
 * An element that is never defined runs no code, so it cannot state a fact for
 * a rule. Like the FOUC guard, this one reports itself: once per tag, after
 * the tag has stayed undefined for a while.
 */
/** @internal Exported for tests. */
export function createRegistrationCheck() {
	const firstSeen = new WeakMap<Element, number>();
	const reported = new Set<string>();
	return () => {
		const now = Date.now();
		for (const element of findUndefined()) {
			const seen = firstSeen.get(element);
			if (seen === undefined) {
				firstSeen.set(element, now);
				continue;
			}
			if (now - seen < UNREGISTERED_MS || reported.has(element.localName) || loadingTags.has(element.localName)) continue;
			reported.add(element.localName);
			console.warn(`[nldd] <${element.localName}> is not registered, so it renders nothing of its own. Import its module from @nldd/design-system, or check the name.`, element);
		}
	};
}

let started = false;

export function startDevChecks(): void {
	if (started || typeof MutationObserver === 'undefined') return;
	started = true;
	const report = createReporter();
	const checkRegistrations = createRegistrationCheck();
	const checkGlobalSheets = createGlobalSheetCheck();
	const checkFouc = createFoucCheck();
	const stateRules = stateRulesOf(devRules);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastRun = Date.now();
	const observer = new MutationObserver(() => schedule());
	// The checks also search open shadow roots, and a change there reaches no observer on the document.
	const observed = new WeakSet<Node>();
	const observeRoots = (roots: ParentNode[]) => {
		for (const root of roots) {
			if (observed.has(root as Node)) continue;
			observed.add(root as Node);
			observer.observe(root as Node, { subtree: true, childList: true, attributes: true });
		}
	};
	const run = () => {
		lastRun = Date.now();
		report();
		checkRegistrations();
		checkGlobalSheets();
		observeRoots(findRoots());
		checkFouc();
	};
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(run, settleDelay(Date.now() - lastRun));
	};
	observeRoots([document.documentElement]);
	setInterval(() => {
		if (document.hidden) return;
		report(stateRules);
		checkRegistrations();
	}, RECHECK_MS);
	schedule();
}
