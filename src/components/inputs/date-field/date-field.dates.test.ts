import { describe, it, expect } from 'vitest';
import {
	checkEnds,
	commitText,
	formatDisplay,
	joinValue,
	parseDate,
	sortEnds,
	splitValue,
} from './date-field.dates.js';

const noBounds = { min: '', max: '' };
const june = { min: '2026-06-01', max: '2026-06-30' };

describe('parseDate', () => {
	it.each([
		['12-3-2026', '2026-03-12'],
		['12/03/2026', '2026-03-12'],
		['12.03.2026', '2026-03-12'],
		['12032026', '2026-03-12'],
		['2026-03-12', '2026-03-12'],
		[' 12-03-2026 ', '2026-03-12'],
	])('reads %s', (raw, iso) => {
		expect(parseDate(raw)).toBe(iso);
	});

	it.each(['', 'Test', '31-02-2026', '2026x01x01', '12-03-26'])('refuses %j', (raw) => {
		expect(parseDate(raw)).toBeNull();
	});
});

describe('formatDisplay', () => {
	it('writes ISO in the Dutch notation', () => {
		expect(formatDisplay('2026-03-12')).toBe('12-03-2026');
	});

	it('gives nothing for what is no ISO date', () => {
		expect(formatDisplay('')).toBe('');
		expect(formatDisplay('12-03-2026')).toBe('');
	});
});

describe('splitValue and joinValue', () => {
	it('splits a period into its ends and a date into one', () => {
		expect(splitValue('2026-07-06/2026-07-20', 2)).toEqual(['2026-07-06', '2026-07-20']);
		expect(splitValue('2026-07-06', 1)).toEqual(['2026-07-06']);
		expect(splitValue('', 2)).toEqual(['', '']);
	});

	it('makes a date the start of an open period, and a period its start', () => {
		expect(joinValue(splitValue('2026-07-06', 2))).toBe('2026-07-06/');
		expect(joinValue(splitValue('2026-07-06/2026-07-20', 1))).toBe('2026-07-06');
	});

	it('joins empty ends to an empty value', () => {
		expect(joinValue(['', ''])).toBe('');
		expect(joinValue(['', '2026-07-20'])).toBe('/2026-07-20');
	});
});

describe('commitText', () => {
	it('commits a date within the bounds', () => {
		expect(commitText('15-06-2026', june)).toBe('2026-06-15');
	});

	it('commits nothing for text that is no date or a date outside the bounds', () => {
		expect(commitText('Test', june)).toBe('');
		expect(commitText('31-05-2026', june)).toBe('');
		expect(commitText('01-07-2026', june)).toBe('');
	});
});

describe('sortEnds', () => {
	it('puts the earlier date first', () => {
		expect(sortEnds(['2027-01-01', '2026-01-01'])).toEqual(['2026-01-01', '2027-01-01']);
	});

	it('leaves ends in order, open or single alone', () => {
		expect(sortEnds(['2026-01-01', '2027-01-01'])).toBeNull();
		expect(sortEnds(['2027-01-01', ''])).toBeNull();
		expect(sortEnds(['2027-01-01'])).toBeNull();
	});
});

describe('checkEnds', () => {
	it('finds nothing wrong with empty or valid ends', () => {
		expect(checkEnds([''], noBounds, false)).toBeNull();
		expect(checkEnds(['15-06-2026', '20-06-2026'], june, true)).toBeNull();
	});

	it('names text that is no date, in either end', () => {
		expect(checkEnds(['Test'], noBounds, false)).toEqual({ flag: 'badInput' });
		expect(checkEnds(['15-06-2026', 'Test'], noBounds, false)).toEqual({ flag: 'badInput' });
	});

	it('names the bound a date falls outside', () => {
		expect(checkEnds(['31-05-2026'], june, false)).toEqual({ flag: 'rangeUnderflow', bound: '2026-06-01' });
		expect(checkEnds(['01-07-2026'], june, false)).toEqual({ flag: 'rangeOverflow', bound: '2026-06-30' });
	});

	it('wants the end of a required period with a start, and allows an open end otherwise', () => {
		expect(checkEnds(['15-06-2026', ''], noBounds, true)).toEqual({ flag: 'valueMissing' });
		expect(checkEnds(['15-06-2026', ''], noBounds, false)).toBeNull();
		expect(checkEnds(['', ''], noBounds, true)).toBeNull();
	});
});
