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

/** The keyframes of fouc.css, which only that stylesheet puts on the body. */
const FOUC_GUARD = 'nldd-fouc-reveal';

/**
 * Whether a page that shows components lacks the FOUC guard. The guard is a
 * stylesheet, which no element can state a fact about, so this reads the body.
 */
export function lacksFoucGuard(root: ParentNode | null = document.body): boolean {
	const { body } = document;
	if (!body || !root) return false;
	const hasComponents = [...root.querySelectorAll('*')].some((element) => element.localName.startsWith('nldd-'));
	if (!hasComponents) return false;
	const names = getComputedStyle(body).animationName.split(',').map((name) => name.trim());
	return !names.includes(FOUC_GUARD);
}

/** Like a translation, the guard has no element to state a fact on, so this one reports itself. */
export function checkFoucGuard(): void {
	if (lacksFoucGuard()) {
		console.warn("[nldd] fouc.css: this page has no FOUC guard, so components show unstyled until they load. Import '@nldd/design-system/styles', which includes it, or '@nldd/design-system/styles/fouc' on its own.");
	}
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
function createRegistrationCheck() {
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
			if (now - seen < UNREGISTERED_MS || reported.has(element.localName)) continue;
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
	const stateRules = devRules.filter((rule) => rule.context.includes(':state('));
	let timer: ReturnType<typeof setTimeout> | undefined;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			report();
			checkRegistrations();
		}, SETTLE_MS);
	};
	new MutationObserver(schedule).observe(document.documentElement, {
		subtree: true,
		childList: true,
		attributes: true,
	});
	setInterval(() => {
		if (document.hidden) return;
		report(stateRules);
		checkRegistrations();
	}, RECHECK_MS);
	schedule();
	setTimeout(checkFoucGuard, SETTLE_MS);
}
