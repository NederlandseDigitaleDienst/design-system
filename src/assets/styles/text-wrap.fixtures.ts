import type { CSSResult } from 'lit';

/**
 * The properties a set in text-wrap.ts decides. A stylesheet that cannot
 * import the sets (rich-text.css, text.css) is compared on these.
 */
const WRAP_PROPERTIES = ['overflow-wrap', 'hyphens', 'hyphenate-limit-chars'];

/** The computed wrap properties of an element. */
export function wrapOf(el: Element): Record<string, string> {
	const style = getComputedStyle(el);
	return Object.fromEntries(WRAP_PROPERTIES.map((p) => [p, style.getPropertyValue(p)]));
}

/** The computed wrap properties that one or more sets give an element of their own. */
export function wrapOfSets(...sets: CSSResult[]): Record<string, string> {
	const host = document.createElement('div');
	document.body.append(host);
	const root = host.attachShadow({ mode: 'open' });
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`span { ${sets.map((s) => s.cssText).join('\n')} }`);
	root.adoptedStyleSheets = [sheet];
	const span = document.createElement('span');
	root.append(span);
	const result = wrapOf(span);
	host.remove();
	return result;
}
