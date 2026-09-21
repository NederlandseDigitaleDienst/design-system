/**
 * Creates a DOM fixture by parsing the given HTML string, appending it to the
 * document body inside a wrapper <div>, and waiting for the first element
 * child to finish its Lit update cycle.
 *
 * Returns the first element child, typed as T.
 */
export async function fixture<T extends HTMLElement = HTMLElement>(html: string): Promise<T> {
	const wrapper = document.createElement('div');
	wrapper.innerHTML = html;
	document.body.appendChild(wrapper);

	const el = wrapper.firstElementChild as T;

	// Wait for the element's Lit lifecycle to settle
	if ('updateComplete' in el) {
		await (el as T & { updateComplete: Promise<boolean> }).updateComplete;
	}

	return el;
}

/**
 * Removes the fixture wrapper (parent div) from the DOM.
 * Call this in `afterEach` to clean up.
 */
export function cleanup(el: Element): void {
	el.parentElement?.remove();
}

/**
 * Walks shadow roots from `document.activeElement` down to the deepest
 * focused element. Use this in tests that assert focus delegation —
 * `document.activeElement` only returns the outermost shadow host, not
 * the inner element that actually received focus.
 */
export function deepActiveElement(): Element | null {
	let active: Element | null = document.activeElement;
	while (active?.shadowRoot?.activeElement) {
		active = active.shadowRoot.activeElement;
	}
	return active;
}

/**
 * Waits for a full MutationObserver → Lit re-render cycle to settle.
 *
 * MO callbacks are microtasks that trigger Lit state changes, which
 * themselves schedule an async `updateComplete`. This helper bridges
 * that gap by:
 *	 1. Awaiting the current updateComplete
 *	 2. Yielding to the macrotask queue (setTimeout 0)
 *	 3. Awaiting updateComplete again (covers MO-triggered re-renders)
 */
export async function waitForUpdate(el: HTMLElement): Promise<void> {
	const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
	await litEl.updateComplete;
	await new Promise(r => setTimeout(r, 0));
	await litEl.updateComplete;
}

/**
 * The CSS a component adopts, as text. Use it to assert that a rule reaches the
 * shadow root through `adoptedStyleSheets` rather than an injected `<style>`,
 * which is the difference between styling that survives a strict `style-src`
 * and styling that needs `'unsafe-inline'`. Nested rules keep their inner
 * blocks in `cssText`, so a `:host(…) { @container … }` rule shows up whole.
 */
export function adoptedCss(el: HTMLElement): string {
	return Array.from(el.shadowRoot!.adoptedStyleSheets)
		.flatMap((sheet) => Array.from(sheet.cssRules, (rule) => rule.cssText))
		.join('\n');
}

/**
 * Installs a consumer-style universal reset in the test document and returns
 * a function that removes it again. Outer-context rules that match a shadow
 * host beat the component's normal \`:host\` declarations (CSS Scoping), so
 * tests use this to verify host layout survives a consuming app's reset.
 *
 * Variants:
 * - 'plain': the classic \`* { margin: 0; padding: 0; border: 0 }\`
 * - 'preflight': Tailwind-preflight-style zeroed borders + box-sizing
 */
export function installUniversalReset(variant: 'plain' | 'preflight' = 'plain'): () => void {
	const style = document.createElement('style');
	style.textContent = variant === 'plain'
		? '* { margin: 0; padding: 0; border: 0; }'
		: '*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; margin: 0; padding: 0; }';
	document.head.appendChild(style);
	return () => style.remove();
}

/**
 * Waits two animation frames — long enough for a ResizeObserver callback to
 * fire and the component's reaction to it to render. Pair with waitForUpdate
 * when a test depends on a ResizeObserver-driven change (e.g. nldd-table's
 * overflow → focusable affordance). Kept separate from waitForUpdate so the
 * frame wait only applies where it is actually needed.
 */
export function nextFrames(): Promise<void> {
	return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

/**
 * Waits until `condition` holds, or gives up after `timeout`.
 *
 * For state that arrives through a timer plus a render rather than on a tick
 * you can count. Waiting a fixed number of ticks passes on a quick machine and
 * fails on a loaded one, which reads as a flaky test rather than as the timing
 * assumption it is. Giving up after a timeout keeps a real regression failing.
 *
 * The budget is generous on purpose. It is not how long the thing takes, it is
 * the ceiling before a test gives up, so raising it slows nothing down: a
 * condition that holds returns on the next poll either way. One second was too
 * tight for a chain of timer, render and popover close on a loaded CI runner,
 * which made the two tooltip tests fail on and off without anything being
 * wrong with them.
 */
export async function until(
	condition: () => boolean,
	{ timeout = 5000, throwOnTimeout = true }: { timeout?: number; throwOnTimeout?: boolean } = {},
): Promise<void> {
	const deadline = performance.now() + timeout;
	while (!condition()) {
		if (performance.now() > deadline) {
			// Returning silently leaves the assertion that follows to report
			// "expected true to be false", which says nothing about the wait
			// having run out and sends you looking at the component instead.
			// A test that waits for something it expects NOT to happen passes
			// `throwOnTimeout: false`, because there the timeout is the point.
			if (!throwOnTimeout) return;
			throw new Error(
				`until(): de voorwaarde werd niet waar binnen ${timeout}ms.\n${condition}`,
			);
		}
		await new Promise(resolve => setTimeout(resolve, 10));
	}
}
