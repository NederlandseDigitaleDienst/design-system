/**
 * Makes a fact about a component visible to CSS, as `:state(name)`.
 *
 * Some things are not in the markup: how wide a component turned out, whether a
 * value could be parsed. A component states that fact here and knows nothing about
 * what it means; a rule in src/rules/ reads it with a selector, and styles and
 * tests can too.
 */

const internals = new WeakMap<HTMLElement, ElementInternals>();

/** An element can attach its internals once, so everything that needs them comes here. */
export function internalsOf(element: HTMLElement): ElementInternals {
	let result = internals.get(element);
	if (!result) {
		result = element.attachInternals();
		internals.set(element, result);
	}
	return result;
}

/**
 * Nothing to clear means no internals: most elements never state anything, and
 * this also runs in production. A browser that has no custom states, or takes
 * only dashed names, throws here; a fact is not worth breaking a render for.
 */
export function setState(element: HTMLElement, name: string, on: boolean): void {
	if (!on && !internals.has(element)) return;
	try {
		const { states } = internalsOf(element);
		if (on) states.add(name);
		else states.delete(name);
	} catch {
		// See above.
	}
}
