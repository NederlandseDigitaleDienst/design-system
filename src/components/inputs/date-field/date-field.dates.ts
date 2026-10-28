import { toIso, resolveDateBound } from '../../../utilities/resolve-date-bound.js';

/**
 * The date logic of nldd-date-field, without a DOM: reading what people type,
 * writing it back, the bounds, and the halves of a period. The component wires
 * these to its inputs; everything here is a plain function of its arguments.
 */

/** ISO 8601 writes an interval as start/end, so the value needs no invention. */
export const RANGE_SEPARATOR = '/';

/**
 * Read a typed date generously. Deliberately not a mask: reformatting per
 * keystroke moves the caret, breaks backspace mid-value and confuses screen
 * readers, so we accept what people type and normalize once on commit.
 * Accepts 12-3-2026, 12/03/2026, 12.03.2026, 12032026 and ISO yyyy-mm-dd.
 */
export function parseDate(raw: string): string | null {
	const trimmed = raw.trim();
	if (trimmed === '') return null;
	// A leading four-digit group can only be a year, so ISO is checked first.
	const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed);
	if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));
	const dutch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(trimmed);
	if (dutch) return toIso(Number(dutch[3]), Number(dutch[2]), Number(dutch[1]));
	const bare = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
	if (bare) return toIso(Number(bare[3]), Number(bare[2]), Number(bare[1]));
	return null;
}

/** ISO to the Dutch notation shown on screen. */
export function formatDisplay(iso: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return '';
	return `${match[3]}-${match[2]}-${match[1]}`;
}

/**
 * The ends of a value: one for a date, two for a period. A missing end is ''.
 * A period read as one date keeps its start, and a date read as a period
 * becomes its start with an open end.
 */
export function splitValue(value: string, count: number): string[] {
	const parts = value ? value.split(RANGE_SEPARATOR) : [];
	return Array.from({ length: count }, (_, i) => parts[i] ?? '');
}

/** The value made of its ends: '' when all are empty, else start/end. */
export function joinValue(ends: string[]): string {
	if (ends.every((end) => end === '')) return '';
	return ends.join(RANGE_SEPARATOR);
}

/** min and max as ISO dates. They may be relative (today, today+3m). */
export interface Bounds {
	min: string;
	max: string;
}

export function resolveBounds(min: string, max: string): Bounds {
	return {
		min: min ? resolveDateBound(min) : '',
		max: max ? resolveDateBound(max) : '',
	};
}

/**
 * The date a typed text commits to: a real date within the bounds, or ''.
 * A date the calendar would refuse must not commit when typed either.
 * ISO strings compare lexically, so `<` and `>` are the date order.
 */
export function commitText(text: string, bounds: Bounds): string {
	const parsed = parseDate(text);
	if (!parsed) return '';
	if (bounds.min && parsed < bounds.min) return '';
	if (bounds.max && parsed > bounds.max) return '';
	return parsed;
}

/**
 * The ends with the earlier date first, or null when they are in order
 * already or one is empty. A period typed backwards ("van 2027 t/m 2026")
 * otherwise stays backwards, while the calendar sorts a dragged one.
 */
export function sortEnds(ends: string[]): string[] | null {
	const [start, end] = ends;
	if (ends.length !== 2 || !start || !end || start <= end) return null;
	return [end, start];
}

/** What is wrong with the typed ends, in the platform's own terms. */
export type EndsProblem =
	| { flag: 'badInput' }
	| { flag: 'rangeUnderflow'; bound: string }
	| { flag: 'rangeOverflow'; bound: string }
	| { flag: 'valueMissing' };

/**
 * The first problem in the typed texts, or null. A required period with only
 * a start is missing its end; an empty start is the native input's to report.
 */
export function checkEnds(texts: string[], bounds: Bounds, required: boolean): EndsProblem | null {
	for (const text of texts) {
		if (!text.trim()) continue;
		const parsed = parseDate(text);
		if (!parsed) return { flag: 'badInput' };
		if (bounds.min && parsed < bounds.min) return { flag: 'rangeUnderflow', bound: bounds.min };
		if (bounds.max && parsed > bounds.max) return { flag: 'rangeOverflow', bound: bounds.max };
	}
	const [start, ...rest] = texts;
	if (required && start?.trim() && rest.some((text) => !text.trim())) return { flag: 'valueMissing' };
	return null;
}
