import { describe, it, expect } from 'vitest';
import { breakpoints, queryBreakpoints } from './breakpoints.js';

describe('breakpoints', () => {
	// Both are written by hand; at the default font size of 16px they must agree.
	it.each(Object.keys(breakpoints) as (keyof typeof breakpoints)[])('%s in rem equals its px value at 16px', (name) => {
		expect(parseFloat(queryBreakpoints[name]) * 16).toBe(parseFloat(breakpoints[name]));
	});
});
