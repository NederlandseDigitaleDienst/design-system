/**
 * Registers each nldd-* component the first time it appears on the page.
 *
 * Import it once instead of a list of subpaths:
 *
 *     import '@nldd/design-system/autoloader';
 *
 * or, on a page without a bundler, load the build in `dist/cdn`, which brings
 * lit along:
 *
 *     <script type="module" src="/nldd/autoloader.js"></script>
 *
 * It looks for nldd-* elements that are not defined yet, in the page and in
 * everything added to it later (a fragment from htmx or Turbo, a route a
 * framework renders), and loads the module of each tag once. A page loads only
 * what it shows, and nothing has to keep an import list up to date.
 *
 * It sees the document, not the shadow root of your own components. Call
 * `discover(root)` for such a root yourself.
 */

import { loaders } from './autoloader.generated.js';

const loading = new Map<string, Promise<unknown>>();

function isUndefinedComponent(element: Element): boolean {
	return element.localName.startsWith('nldd-') && !customElements.get(element.localName);
}

/** Loads the module of one tag, once. A tag no module defines is left alone. */
function load(tag: string): Promise<unknown> | undefined {
	const loader = loaders[tag];
	if (!loader) return undefined;
	let pending = loading.get(tag);
	if (!pending) {
		// A failed load (the network, say) may be tried again on the next sighting.
		pending = loader().catch((error: unknown) => {
			loading.delete(tag);
			throw error;
		});
		loading.set(tag, pending);
	}
	return pending;
}

/** For the observer, which has no caller to hand a failed load to. */
function report(error: unknown): void {
	console.error('[nldd] A component module failed to load.', error);
}

/**
 * Loads the modules for every nldd-* element in `root` that is not defined yet,
 * `root` itself included. Resolves once they are all registered.
 */
export async function discover(root: ParentNode = document): Promise<void> {
	const tags = new Set<string>();
	if (root instanceof Element && isUndefinedComponent(root)) tags.add(root.localName);
	for (const element of root.querySelectorAll(':not(:defined)')) {
		if (isUndefinedComponent(element)) tags.add(element.localName);
	}
	await Promise.all([...tags].map(load));
}

let observer: MutationObserver | undefined;

/**
 * Starts watching `root` for nldd-* elements. Runs on import for the document;
 * call it yourself only for another root.
 */
export function startAutoloader(root: Document | ShadowRoot = document): void {
	if (typeof MutationObserver === 'undefined') return;
	if (root === document && observer) return;
	const watcher = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node instanceof Element) discover(node).catch(report);
			}
		}
	});
	watcher.observe(root, { childList: true, subtree: true });
	if (root === document) observer = watcher;
	discover(root).catch(report);
}

/** Stops watching the document. */
export function stopAutoloader(): void {
	observer?.disconnect();
	observer = undefined;
}

if (typeof document !== 'undefined') startAutoloader();
