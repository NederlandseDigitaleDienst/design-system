/**
 * Sanitizes a URL for use in href attributes by stripping leading/trailing
 * whitespace (including unicode), removing embedded control characters that
 * browsers strip during URL parsing (tab, newline, carriage return), and
 * blocking dangerous protocols.
 *
 * Blocked protocols: javascript:, data:, vbscript:, blob:. With
 * `{ allowData: true }` the data: and blob: URLs are permitted while
 * javascript: and vbscript: stay blocked: a download link legitimately points
 * at a data: or blob: URL, so a component passes this when its `download`
 * attribute is set. The browser saves such a URL as a file and never runs
 * it, so a `data:text/html` URL is harmless there.
 *
 * Note: tuned for href contexts (<a>, navigation). Do not reuse for <img src>
 * or other contexts without reviewing which protocols are safe there.
 *
 * Returns null for empty or dangerous URLs, the trimmed URL otherwise.
 */
export function sanitizeUrl(url: string | null | undefined, options?: { allowData?: boolean }): string | null {
	if (!url) return null;
	const trimmed = url
		.replace(/^[\s\u00A0\u200B\u2028\u2029]+|[\s\u00A0\u200B\u2028\u2029]+$/g, '')
		.replace(/[\0\t\n\r]/g, '');
	const lower = trimmed.toLowerCase();
	if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
		return null;
	}
	if (!options?.allowData && (lower.startsWith('data:') || lower.startsWith('blob:'))) {
		return null;
	}
	return trimmed;
}
