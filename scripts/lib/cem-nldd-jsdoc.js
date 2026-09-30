/**
 * Feeds this repo's file-level JSDoc into the Custom Elements Manifest.
 *
 * The analyzer reads JSDoc attached to the class declaration. Our components
 * put one block at the top of the file instead, which may document several
 * elements separated by @element lines. Without this plugin the manifest kept
 * the attributes (those come from the decorators) but lost almost everything
 * written by hand: 7 of 112 slots, 9 descriptions, and events guessed from the
 * dispatch call, which for a component emitting through a helper produced the
 * name of the variable rather than the event.
 *
 * It reuses the parser behind skills/nldd-design/reference.md, so the manifest and the
 * reference cannot describe the same component differently.
 */

import { readFileSync } from 'node:fs';
import { extractLeadingBlock, parseComponent } from './component-jsdoc.js';

/** Ships a custom element but is not consumer-facing; the reference skips it too. */
const INTERNAL_TAGS = new Set(['nldd-lqip-encoder']);

export function nlddFileLevelJsdoc() {
	return {
		name: 'nldd-file-level-jsdoc',
		packageLinkPhase({ customElementsManifest }) {
			// Sorted by path: the analyzer emits modules in the order the file system
			// hands them over, which differs between a macOS laptop and the Linux CI
			// runner. Committing the manifest and checking it for drift only works if
			// the same source always produces the same bytes.
			(customElementsManifest.modules ?? []).sort((a, b) => a.path.localeCompare(b.path));

			for (const module of customElementsManifest.modules ?? []) {
				module.declarations = (module.declarations ?? []).filter(
					(d) => !(d.customElement && INTERNAL_TAGS.has(d.tagName)),
				);
				const elements = module.declarations.filter((d) => d.customElement && d.tagName);
				if (elements.length === 0) continue;

				let source;
				try {
					source = readFileSync(module.path, 'utf8');
				} catch {
					continue;
				}
				const block = extractLeadingBlock(source);
				if (!block) continue;

				const documented = new Map(
					parseComponent(block, module.path, elements[0].tagName).map((c) => [c.tag, c]),
				);

				for (const element of elements) {
					// The manifest describes the public API, so the internals go: private
					// and protected members, and the underscore-prefixed ones this repo
					// uses for handlers and for state a parent sets on its children. They
					// are the bulk of the file and mean nothing to a consumer.
					element.members = (element.members ?? []).filter(
						(m) => !m.name?.startsWith('_') && m.privacy !== 'private' && m.privacy !== 'protected',
					);

					const doc = documented.get(element.tagName);
					if (!doc) continue;

					if (doc.summary) element.description = doc.summary;

					// Written documentation wins over inference: the analyzer derives
					// event names from the dispatchEvent call, which is wrong wherever a
					// component emits through a helper.
					if (doc.events.length > 0) {
						element.events = doc.events.map((e) => ({ name: e.name, description: e.description }));
					}

					if (doc.slots.length > 0) {
						element.slots = doc.slots.map((s) => ({ name: s.name, description: s.description }));
					}

					// The decorator carries the type and the attribute name, the JSDoc the
					// prose. Neither replaces the other, so only the description is merged.
					const descriptions = new Map(doc.attrs.map((a) => [a.name, a.description]));
					for (const attribute of element.attributes ?? []) {
						const description = descriptions.get(attribute.name);
						if (description) attribute.description = description;
					}
				}
			}
		},
	};
}
