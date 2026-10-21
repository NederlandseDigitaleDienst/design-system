import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, adoptedCss } from '../test-utils.js';

// Every cell module, so that whatever registers a custom element is defined
// before the tags are collected below. A cell added later is picked up here
// without anyone remembering to list it.
// The negations belong in the pattern rather than in a filter afterwards: an
// eager glob imports what it matches, and pulling in the sibling .test.ts files
// would run their suites here too.
const modules = import.meta.glob([
	'../components/lists-and-tables/cells/*/*.ts',
	'!**/*.test.ts',
	'!**/*.styles.ts',
	'!**/*.stories.ts',
], { eager: true }) as Record<string, Record<string, unknown>>;

// The elements that actually take hide-below/hide-above. The reactive property
// lives on the prototype, so its presence is what says a class applied the
// mixin; a cell that does not (drag-handle-cell) drops out by itself.
const visibilityTags = Object.values(modules)
	.flatMap((module) => Object.values(module))
	.filter((value): value is CustomElementConstructor => typeof value === 'function')
	.filter((ctor) => ctor.prototype instanceof HTMLElement && 'hideBelow' in ctor.prototype)
	.map((ctor) => customElements.getName(ctor))
	.filter((tag): tag is string => tag !== null);

describe('VisibilityMixin across every cell that applies it', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('finds the cells that use the mixin', () => {
		expect(visibilityTags).toContain('nldd-text-cell');
		expect(visibilityTags).not.toContain('nldd-drag-handle-cell');
		expect(visibilityTags.length).toBeGreaterThan(1);
	});

	// A component that overrides finalizeStyles without calling through, or that
	// stops applying the mixin, would lose the static rules silently: the element
	// simply stays visible at every width. Assert it per cell rather than trust
	// two of them to stand in for the rest.
	it.each(visibilityTags)('%s adopts the static rules and injects no <style>', async (tag) => {
		el = await fixture(`<${tag} hide-below="md"></${tag}>`);
		await waitForUpdate(el);

		expect(adoptedCss(el)).toContain('max-width: 40rem');
		expect(adoptedCss(el)).toContain('cells-container');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	// A custom length is the one threshold that cannot be static, so it is written
	// at runtime. Into an adopted stylesheet, though, so no cell injects a <style>
	// and a consumer needs no 'unsafe-inline' whichever value it writes.
	it.each(visibilityTags)('%s adopts the runtime rule for a custom length', async (tag) => {
		el = await fixture(`<${tag} hide-below="320px"></${tag}>`);
		await waitForUpdate(el);

		expect(adoptedCss(el)).toContain('max-width: 320px');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});
});
