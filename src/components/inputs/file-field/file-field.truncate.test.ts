import { describe, it, expect } from 'vitest';
import { splitForTruncation, splitName, truncateMiddle } from './file-field.truncate.js';

// One unit per character, so a width is a number of characters.
const length = (text: string) => text.length;

describe('file-field truncation', () => {
	it('splits a name at its last dot, not at a leading one', () => {
		expect(splitName('rapport.v2.pdf')).toEqual(['rapport.v2', '.pdf']);
		expect(splitName('.env')).toEqual(['.env', '']);
	});

	it('keeps the last characters and the extension apart in the first render', () => {
		expect(splitForTruncation('Screenshot 2026-10-27 at 15.42.11.png')).toEqual(['Screenshot 2026-10-27 at ', '15.42.11.png']);
		expect(splitForTruncation('foto.png')).toEqual(['', 'foto.png']);
	});

	it('leaves a name whole that fits', () => {
		expect(truncateMiddle('rapport.pdf', 11, length)).toEqual({ text: 'rapport.pdf', truncated: false });
	});

	it('shares what fits evenly between start and end, before the extension', () => {
		expect(truncateMiddle('abcdefghijklmnop.pdf', 11, length)).toEqual({ text: 'abc…nop.pdf', truncated: true });
	});

	it('drops a space next to the ellipsis', () => {
		expect(truncateMiddle('ab cdefghijk lm.pdf', 10, length).text).toBe('ab…lm.pdf');
	});
});
