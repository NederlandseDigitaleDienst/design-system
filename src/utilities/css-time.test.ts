import { describe, it, expect } from 'vitest';
import { cssTimeToMs } from './css-time.js';

describe('cssTimeToMs', () => {
	it('reads milliseconds and seconds', () => {
		expect(cssTimeToMs('300ms')).toBe(300);
		expect(cssTimeToMs(' 0.3s')).toBe(300);
	});

	it('returns 0 for anything else', () => {
		expect(cssTimeToMs('')).toBe(0);
		expect(cssTimeToMs('300')).toBe(0);
		expect(cssTimeToMs('fast')).toBe(0);
	});
});
