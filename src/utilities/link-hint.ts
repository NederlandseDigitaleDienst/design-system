/**
 * Which hidden hint a link carries, as the suffix of a translation key.
 *
 * A link to another origin goes to another website, with a heading, navigation
 * and title of its own, so it says so; a link with `target="_blank"` says it
 * opens in a new tab (WCAG 2.1 SC 3.2.2). Both together make one sentence, so a
 * screen reader reads one hint rather than two. Only `http:` and `https:`
 * links can go to another website: `mailto:`, `tel:`, fragments and relative
 * paths never do. There is no way to switch the hint off: a subdomain is
 * another website too.
 *
 * Returns null when the link needs no hint.
 */
export type LinkHintKey = 'link-hint-external-lowercase-label' | 'link-hint-new-tab-lowercase-label' | 'link-hint-external-new-tab-lowercase-label';

export function linkHintKey(href: string | null | undefined, target: string | null | undefined): LinkHintKey | null {
	if (!href) return null;
	const external = isExternalHref(href);
	const newTab = target === '_blank';
	if (external && newTab) return 'link-hint-external-new-tab-lowercase-label';
	if (external) return 'link-hint-external-lowercase-label';
	if (newTab) return 'link-hint-new-tab-lowercase-label';
	return null;
}

/** Whether `href` points at another origin than the page it is on. */
export function isExternalHref(href: string): boolean {
	if (typeof document === 'undefined' || typeof location === 'undefined') return false;
	let url: URL;
	try {
		url = new URL(href, document.baseURI);
	} catch {
		return false;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
	return url.origin !== location.origin;
}
