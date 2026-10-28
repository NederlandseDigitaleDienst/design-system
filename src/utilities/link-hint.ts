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
 * A link with `download` says it downloads the file: a screen reader does not
 * tell on its own. Only on the page's own origin, since a browser ignores
 * `download` for another one and goes there instead; and that is all it says,
 * since a download opens no tab.
 *
 * Returns null when the link needs no hint.
 */
export type LinkHintKey = 'link-hint-external-lowercase-label' | 'link-hint-new-tab-lowercase-label' | 'link-hint-external-new-tab-lowercase-label';
export type DownloadLinkHintKey = LinkHintKey | 'link-hint-download-lowercase-label';

export function linkHintKey(href: string | null | undefined, target: string | null | undefined): LinkHintKey | null {
	if (!href) return null;
	const external = isExternalHref(href);
	const newTab = target === '_blank';
	if (external && newTab) return 'link-hint-external-new-tab-lowercase-label';
	if (external) return 'link-hint-external-lowercase-label';
	if (newTab) return 'link-hint-new-tab-lowercase-label';
	return null;
}

/** The hint of a link that may carry `download`, for the components that take it. */
export function downloadLinkHintKey(href: string | null | undefined, target: string | null | undefined, download: string | null | undefined): DownloadLinkHintKey | null {
	if (href && download !== undefined && download !== null && !isExternalHref(href)) return 'link-hint-download-lowercase-label';
	return linkHintKey(href, target);
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

const warnedDownloadTarget = new WeakSet<Element>();

/** In development, says once per element that `target` does nothing on a
 *  download link: the file is saved, no tab opens. */
export function warnDownloadTarget(element: Element, download: string | null | undefined, target: string | null | undefined): void {
	if (!import.meta.env?.DEV || download === undefined || download === null || !target || target === '_self' || warnedDownloadTarget.has(element)) return;
	warnedDownloadTarget.add(element);
	console.warn(`<${element.localName}>: \`target="${target}"\` does nothing with \`download\`, which saves the file instead of opening it. Remove one of the two.`);
}
