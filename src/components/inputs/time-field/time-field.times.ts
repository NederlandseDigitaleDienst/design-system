/**
 * The time logic of nldd-time-field, without a DOM: reading what people type,
 * the step and the bounds, and where the arrow keys and the picker start. The
 * component wires these to its input; everything here is a plain function of
 * its arguments.
 */

/** Minutes since midnight of the last time on a day. */
const LAST_MINUTE_OF_DAY = 23 * 60 + 59;

export function toMinutes(time: string): number {
	const [hours, minutes] = time.split(':');
	return Number(hours) * 60 + Number(minutes);
}

export function fromMinutes(total: number): string {
	const hours = Math.floor(total / 60);
	const minutes = total % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toTime(hours: number, minutes: number): string | null {
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
	return fromMinutes(hours * 60 + minutes);
}

/**
 * Read a typed time generously. Deliberately not a mask: reformatting per
 * keystroke moves the caret, breaks backspace mid-value and confuses screen
 * readers, so we accept what people type and normalize once on commit.
 *
 * Accepts 9, 09, 9:30, 9.30, 9,30, 9u30, 930 and 0930. After a letter the
 * minutes may be left off ("9u" is a finished thought), after punctuation they
 * may not: "9:" is halfway through typing and should not produce a value yet.
 */
export function parseTime(raw: string): string | null {
	const trimmed = raw.trim();
	if (trimmed === '') return null;
	const withLetter = /^(\d{1,2})\s*[uh]\s*(\d{1,2})?$/i.exec(trimmed);
	if (withLetter) return toTime(Number(withLetter[1]), Number(withLetter[2] ?? 0));
	const withPunctuation = /^(\d{1,2})\s*[:.,]\s*(\d{1,2})$/.exec(trimmed);
	if (withPunctuation) return toTime(Number(withPunctuation[1]), Number(withPunctuation[2]));
	const bare = /^\d{1,4}$/.exec(trimmed);
	if (bare) {
		const digits = bare[0];
		if (digits.length <= 2) return toTime(Number(digits), 0);
		const split = digits.length === 3 ? 1 : 2;
		return toTime(Number(digits.slice(0, split)), Number(digits.slice(split)));
	}
	return null;
}

/**
 * The nearest time that falls on the step, counted from `base`. Input exactly
 * in between rounds up.
 *
 * Never rolls over the edge of the day: if rounding up would pass 23:59, step
 * back instead. Rolling over to 00:00 silently shifts the day, and a consumer
 * who puts this field next to a date field then has a bug nobody sees
 * coming.
 */
export function roundToStep(time: string, step: number, base = '00:00'): string {
	if (step <= 1) return time;
	const baseMinutes = toMinutes(base);
	const steps = Math.floor((toMinutes(time) - baseMinutes) / step + 0.5);
	let rounded = baseMinutes + steps * step;
	while (rounded > LAST_MINUTE_OF_DAY) rounded -= step;
	while (rounded < 0) rounded += step;
	return fromMinutes(rounded);
}

/**
 * The rules a time has to meet: `min` and `max` as `HH:mm` or '', and the step
 * in whole minutes. The step counts from `min` when there is one, so a series
 * that starts at :07 also works with a step of 15, otherwise from midnight.
 * Taken from `<input type="time">`, which uses `min` the same way.
 */
export interface TimeRules {
	min: string;
	max: string;
	step: number;
	base: string;
}

export function resolveRules(min: string, max: string, step: number): TimeRules {
	const parsedMin = parseTime(min) ?? '';
	return {
		min: parsedMin,
		max: parseTime(max) ?? '',
		step: Math.max(1, Math.round(step) || 1),
		base: parsedMin || '00:00',
	};
}

/** `HH:mm` compares lexically in the same order as it reads on the clock. */
function withinBounds(time: string, rules: TimeRules): boolean {
	if (rules.min && time < rules.min) return false;
	if (rules.max && time > rules.max) return false;
	return true;
}

/**
 * The time a typed text commits to: a real time within the bounds, or ''.
 * Rounding to the step only on commit, not while typing: otherwise "09:1"
 * jumps to 09:00 before anyone can type the 5.
 */
export function commitText(text: string, rules: TimeRules, round: boolean): string {
	const parsed = parseTime(text);
	if (!parsed) return '';
	const time = round ? roundToStep(parsed, rules.step, rules.base) : parsed;
	return withinBounds(time, rules) ? time : '';
}

/** The last time on the step at or before `max`, or null without a max. */
function lastStepAtOrBefore(max: string, rules: TimeRules): string | null {
	if (!max) return null;
	const base = toMinutes(rules.base);
	return fromMinutes(base + Math.max(0, Math.floor((toMinutes(max) - base) / rules.step)) * rules.step);
}

/**
 * Where the arrow keys and the picker start on an empty field: `min` if there
 * is one, otherwise `now` rounded to the step. Starting at midnight would be a
 * long climb from any realistic goal. Past `max` it lands on the last step at
 * or before it: a max that does not fall on the step is not in the wheel, and
 * a value the wheel does not hold shows up as an empty selection.
 */
export function startingPoint(rules: TimeRules, now: Date): string {
	if (rules.min) return rules.min;
	const rounded = roundToStep(fromMinutes(now.getHours() * 60 + now.getMinutes()), rules.step, rules.base);
	if (!rules.max || rounded <= rules.max) return rounded;
	return lastStepAtOrBefore(rules.max, rules) ?? rounded;
}

/**
 * One step up or down from `from`, kept within the day and the bounds. From a
 * time that does not fall on the step, the first press moves onto the grid, so
 * a second press does not land between two valid values again.
 */
export function shift(from: string, direction: 1 | -1, rules: TimeRules): string {
	const { step } = rules;
	const base = toMinutes(rules.base);
	const aligned = toMinutes(roundToStep(from, step, rules.base));
	const moved = aligned === toMinutes(from) || step === 1
		? aligned + direction * step
		: aligned;
	const clamped = Math.min(Math.max(moved, base % step), LAST_MINUTE_OF_DAY);
	const minMinutes = rules.min ? toMinutes(rules.min) : 0;
	const maxMinutes = rules.max ? toMinutes(rules.max) : LAST_MINUTE_OF_DAY;
	return fromMinutes(Math.min(Math.max(clamped, minMinutes), maxMinutes));
}

/** What is wrong with the typed text, in the platform's own terms. */
export type TimeProblem =
	| { flag: 'badInput' }
	| { flag: 'rangeUnderflow'; bound: string }
	| { flag: 'rangeOverflow'; bound: string };

/** The problem with a typed text, or null when it is empty or a valid time. */
export function checkText(text: string, rules: TimeRules): TimeProblem | null {
	if (!text.trim()) return null;
	const parsed = parseTime(text);
	if (!parsed) return { flag: 'badInput' };
	if (rules.min && parsed < rules.min) return { flag: 'rangeUnderflow', bound: rules.min };
	if (rules.max && parsed > rules.max) return { flag: 'rangeOverflow', bound: rules.max };
	return null;
}
