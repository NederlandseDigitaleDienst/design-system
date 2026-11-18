/** The id a fragment names. A `%` that starts no escape (`#50%`) made decodeURIComponent throw, and the page change stopped halfway. */
export function fragmentId(hash: string): string {
	const raw = hash.replace(/^#/, '');
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}
