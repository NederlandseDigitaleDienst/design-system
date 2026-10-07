/**
 * The spacing scale, for the attributes that take a step of it.
 *
 * Spacing is rhythm: the point of a scale is that the space between things is
 * the same handful of numbers on every page, so a value beside it is not a
 * finer choice but a break in the pattern. These attributes take a step and
 * nothing else, and this is the one place that turns a step into its token.
 *
 * Which also settles what the attribute means. `gap="16"` in a component that
 * expected a CSS length wrote `--_container-gap: 16`, which is not one: the declaration
 * fell away and the gap became zero with nothing said. Anything this cannot
 * place is refused and named in dev instead, a length included — writing an
 * unplaceable value is that same silent zero.
 */

/** Every step there is. `'0'` is a value, not the absence of one. */
export const SPACING_SCALE = [
	'0', '2', '4', '6', '8', '10', '12', '16', '20', '24',
	'28', '32', '40', '44', '48', '56', '64', '80', '96',
] as const;

export type SpacingSize = (typeof SPACING_SCALE)[number];

/** Anything that is not a bare number: a length, a percentage, a calc(). */
function looksLikeLength(value: string): boolean {
	return /[a-z%()]/i.test(value.trim());
}

const warned = new Set<string>();

function warnOnce(element: string, attribute: string, message: string): void {
	const key = `${element}.${attribute}.${message}`;
	if (warned.has(key)) return;
	warned.add(key);
	console.warn(`<${element}>: ${message}`);
}

/**
 * A step of the scale as the token it stands for.
 *
 * Returns null when there is nothing to set, so a caller can remove the
 * property rather than write an empty one. `element` and `attribute` are only
 * there to name the offender in a dev warning.
 */
export function spacingToValue(
	value: string | undefined,
	element: string,
	attribute: string,
): string | null {
	if (value === undefined || value === '') return null;
	const step = String(value).trim();
	if ((SPACING_SCALE as readonly string[]).includes(step)) {
		return step === '0' ? '0' : `var(--primitives-space-${step})`;
	}
	if (import.meta.env?.DEV) {
		const why = looksLikeLength(step)
			? 'is a CSS length, and these attributes take a step of the spacing scale so the rhythm holds across the page'
			: 'is not a step of the spacing scale';
		warnOnce(
			element,
			attribute,
			`${attribute}="${step}" ${why} (${SPACING_SCALE.join(', ')}). Nothing is written, so the default stands.`,
		);
	}
	return null;
}
