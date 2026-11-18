/**
 * Loads a component the moment its tag appears on the page.
 *
 * A page loads the components its own markup uses (see the entry that
 * site/build/pages.js writes per page), and an example loads what its story
 * file imports. This covers what is left: a tag that turns up without anyone
 * having imported it, such as a story that relies on a component being there.
 * Without it such a tag would stay an empty, undefined element.
 */

import loaders from 'virtual:site-components';

const requested = new Set<string>();

function request(element: Element): void {
	const tag = element.localName;
	if (requested.has(tag) || !loaders[tag] || customElements.get(tag)) return;
	requested.add(tag);
	void loaders[tag]();
}

function scan(root: ParentNode): void {
	for (const element of root.querySelectorAll(':not(:defined)')) request(element);
}

new MutationObserver((records) => {
	for (const record of records) {
		for (const node of record.addedNodes) {
			if (!(node instanceof Element)) continue;
			if (node.matches(':not(:defined)')) request(node);
			scan(node);
		}
	}
}).observe(document.documentElement, { childList: true, subtree: true });

scan(document);
