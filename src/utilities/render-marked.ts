import { html, nothing, type TemplateResult } from 'lit';

export type QueryMarkMode = 'match' | 'predictive';

/**
 * Renders text with `**bold**` markdown segments as `<b>` elements.
 * Returns the original string when no markers are present (cheap path).
 */
export function renderBold(text: string): TemplateResult | string {
	if (!text.includes('**')) return text;
	const parts = text.split(/\*\*(.+?)\*\*/g);
	return html`${parts.map((part, i) => i % 2 === 1 ? html`<b>${part}</b>` : part)}`;
}

/** The text of `**bold**` markdown without its markers, for an accessible name. */
export function stripBold(text: string): string {
	return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

/**
 * Renders text with the query (or its complement) wrapped in `<b>`, based on `mode`.
 *
 * - `mode: 'match'` bolds the typed query — useful in long texts where the user
 *   wants to spot the search term quickly (search-result highlighting).
 * - `mode: 'predictive'` bolds all non-matched segments. Named for the ARIA APG
 *   combobox pattern where the query is a prefix, so the non-matched tail
 *   reads as a predictive completion.
 *
 * Uses `<b>` (not `<mark>`) deliberately: `<mark>` triggers a screen-reader
 * "highlight start/end" announcement AND a yellow background by default. We
 * want neither the yellow background (visually disruptive in cell contexts)
 * nor the cherry-picked SR-only semantics without the matching visual. `<b>`
 * gives consistent presentation for sighted and AT users.
 *
 * The match is case-insensitive substring. If the query is empty or does not
 * appear in the text, the text is returned as-is (falls back to `renderBold`
 * so existing `**bold**` syntax still renders).
 */
export function renderQueryMark(
	text: string,
	query: string,
	mode: QueryMarkMode = 'predictive',
): TemplateResult | string | typeof nothing {
	if (!text) return nothing;
	const q = query.trim();
	if (!q) return renderBold(text);

	const qLower = q.toLowerCase();
	const textLower = text.toLowerCase();
	if (!textLower.includes(qLower)) return renderBold(text);

	const segments: Array<{ text: string; bold: boolean }> = [];
	let cursor = 0;
	while (cursor < text.length) {
		const idx = textLower.indexOf(qLower, cursor);
		if (idx === -1) {
			segments.push({ text: text.slice(cursor), bold: mode === 'predictive' });
			break;
		}
		if (idx > cursor) {
			segments.push({ text: text.slice(cursor, idx), bold: mode === 'predictive' });
		}
		segments.push({ text: text.slice(idx, idx + q.length), bold: mode === 'match' });
		cursor = idx + q.length;
	}

	return html`${segments.map(s => s.bold ? html`<b>${s.text}</b>` : s.text)}`;
}
