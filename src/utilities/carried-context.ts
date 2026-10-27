/**
 * The color scheme and language an element had in its place on the page,
 * carried along when a component moves it somewhere else: a submenu into
 * `<body>` for a drill-in, an overflow menu or sheet that lives in `<body>`, a
 * notification into the shared area.
 *
 * Both inherit, so a moved element takes those of its new parent. A submenu
 * from a dark section of the page turns light, and a screen reader reads an
 * English menu with Dutch pronunciation. A theme needs nothing: it sits on
 * `:root`, which is the same everywhere.
 *
 * Only what this helper wrote itself is ever overwritten or taken back: a
 * `lang` or `color-scheme` set on the element by its author stays.
 */

const carried = new WeakMap<HTMLElement, { scheme: string | null; lang: string | null }>();

/** The language of an element, looking past shadow roots to their hosts. */
function langOf(el: Element): string | null {
	let node: Element | null = el;
	while (node) {
		const owner: Element | null = node.closest('[lang]');
		if (owner) return owner.getAttribute('lang');
		const root = node.getRootNode();
		node = root instanceof ShadowRoot ? root.host : null;
	}
	return null;
}

/** Gives `element` the color scheme and language of `origin`. Call it each
 *  time the element shows, since the page around the origin may have changed. */
export function carryContext(element: HTMLElement, origin: Element | null): void {
	if (!origin?.isConnected) return;
	const previous = carried.get(element) ?? { scheme: null, lang: null };
	const next = { scheme: previous.scheme, lang: previous.lang };

	const ownScheme = element.style.colorScheme;
	if (!ownScheme || ownScheme === previous.scheme) {
		const scheme = getComputedStyle(origin).colorScheme;
		if (scheme && scheme !== 'normal') {
			element.style.colorScheme = scheme;
			next.scheme = scheme;
		} else {
			if (previous.scheme) element.style.removeProperty('color-scheme');
			next.scheme = null;
		}
	}

	const ownLang = element.getAttribute('lang');
	if (ownLang === null || ownLang === previous.lang) {
		const lang = langOf(origin);
		if (lang) {
			element.setAttribute('lang', lang);
			next.lang = lang;
		} else {
			if (previous.lang) element.removeAttribute('lang');
			next.lang = null;
		}
	}

	carried.set(element, next);
}

/** Takes back what `carryContext` wrote, for an element returned to its place. */
export function releaseContext(element: HTMLElement): void {
	const previous = carried.get(element);
	if (!previous) return;
	if (previous.scheme && element.style.colorScheme === previous.scheme) element.style.removeProperty('color-scheme');
	if (previous.lang && element.getAttribute('lang') === previous.lang) element.removeAttribute('lang');
	carried.delete(element);
}
