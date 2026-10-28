import { describe, it, expect } from 'vitest';
import {
	checkText,
	commitText,
	resolveRules,
	shift,
	startingPoint,
} from './time-field.times.js';

const free = resolveRules('', '', 1);
const office = resolveRules('09:00', '17:00', 15);
const at = (hours: number, minutes: number) => new Date(2026, 0, 1, hours, minutes);

describe('resolveRules', () => {
	it('counts the step from min, or from midnight without one', () => {
		expect(resolveRules('9:07', '', 15)).toEqual({ min: '09:07', max: '', step: 15, base: '09:07' });
		expect(resolveRules('', '', 15).base).toBe('00:00');
	});

	it('keeps the step a whole number of at least one minute', () => {
		expect(resolveRules('', '', 0).step).toBe(1);
		expect(resolveRules('', '', 7.6).step).toBe(8);
	});
});

describe('commitText', () => {
	it('commits a time within the bounds, rounded only when asked', () => {
		expect(commitText('9u10', office, false)).toBe('09:10');
		expect(commitText('9u10', office, true)).toBe('09:15');
	});

	it('commits nothing for text that is no time or a time outside the bounds', () => {
		expect(commitText('Test', office, false)).toBe('');
		expect(commitText('08:00', office, false)).toBe('');
		expect(commitText('18:00', office, true)).toBe('');
	});
});

describe('startingPoint', () => {
	it('starts at min when there is one', () => {
		expect(startingPoint(office, at(20, 0))).toBe('09:00');
	});

	it('starts at now rounded to the step without a min', () => {
		expect(startingPoint(resolveRules('', '', 15), at(10, 8))).toBe('10:15');
		expect(startingPoint(free, at(10, 8))).toBe('10:08');
	});

	it('lands on the last step at or before max when now is past it', () => {
		expect(startingPoint(resolveRules('', '16:50', 15), at(20, 0))).toBe('16:45');
	});
});

describe('shift', () => {
	it('moves one step up or down', () => {
		expect(shift('10:00', 1, office)).toBe('10:15');
		expect(shift('10:00', -1, office)).toBe('09:45');
	});

	it('moves onto the grid first from a time between two steps', () => {
		expect(shift('10:05', 1, office)).toBe('10:00');
	});

	it('stays within the bounds and the day', () => {
		expect(shift('17:00', 1, office)).toBe('17:00');
		expect(shift('09:00', -1, office)).toBe('09:00');
		expect(shift('23:59', 1, free)).toBe('23:59');
	});
});

describe('checkText', () => {
	it('finds nothing wrong with empty text or a valid time', () => {
		expect(checkText('', office)).toBeNull();
		expect(checkText('12:00', office)).toBeNull();
	});

	it('names text that is no time, and the bound a time falls outside', () => {
		expect(checkText('Test', office)).toEqual({ flag: 'badInput' });
		expect(checkText('08:00', office)).toEqual({ flag: 'rangeUnderflow', bound: '09:00' });
		expect(checkText('18:00', office)).toEqual({ flag: 'rangeOverflow', bound: '17:00' });
	});
});
