/**
 * The `rel` of a link that may open in a new tab.
 *
 * A link with `target="_blank"` gets `noopener noreferrer`: the page it opens
 * gets no handle on this one through `window.opener`, and no referrer. A `rel`
 * the consumer sets is added to, never replaced. `rel="external"` on a `_blank`
 * link describes the link, and it is no reason to leave that door open.
 *
 * Returns an empty string when there is nothing to write, so a template can
 * leave the attribute off with `|| nothing`.
 */
export function linkRel(rel: string | null | undefined, target: string | null | undefined): string {
	const base = rel ?? '';
	if (target !== '_blank') return base.trim();
	const parts = new Set(base.split(/\s+/).filter(Boolean));
	parts.add('noopener');
	parts.add('noreferrer');
	return [...parts].join(' ');
}
