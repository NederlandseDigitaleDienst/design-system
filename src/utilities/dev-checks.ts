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
}

/** Long enough for a framework to finish a render, and for most first data. */
const SETTLE_MS = 300;

/** A `:state()` changes nothing a MutationObserver sees, so also look regularly. */
const RECHECK_MS = 2000;

function isViolated(rule: DevRule, element: Element): boolean {
	if (rule.assert) return !element.matches(rule.assert);
	if (rule.report) return element.matches(rule.report);
	if (rule.count) {
		const { of, min, max } = rule.count;
		const counted = [...element.children].filter((child) => child.matches(of)).length;
		return (max !== undefined && counted > max) || (min !== undefined && counted < min);
	}
	return true;
}

/** An older browser without `:state()` rejects the selector; that rule then does not run. */
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
			if (isViolated(rule, element)) found.push({ rule, element });
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
	return () => {
		for (const { rule, element } of findRoots().flatMap((root) => findViolations(root))) {
			const seen = reported.get(element) ?? new Set();
			if (seen.has(rule.id)) continue;
			reported.set(element, seen.add(rule.id));
			console.warn(`[nldd] ${rule.id}: ${rule.message}`, element);
		}
	};
}

let started = false;

export function startDevChecks(): void {
	if (started || typeof MutationObserver === 'undefined') return;
	started = true;
	const report = createReporter();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(report, SETTLE_MS);
	};
	new MutationObserver(schedule).observe(document.documentElement, {
		subtree: true,
		childList: true,
		attributes: true,
	});
	setInterval(report, RECHECK_MS);
	schedule();
}
