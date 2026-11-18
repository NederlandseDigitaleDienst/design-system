import { describe, it, expect } from 'vitest';
import { fragmentId } from './fragment.js';

describe('fragmentId', () => {
	it('decodes the id a fragment names', () => {
		expect(fragmentId('#alle%20regels')).toBe('alle regels');
	});

	it('keeps a fragment that is no valid escape, instead of throwing', () => {
		expect(fragmentId('#50%')).toBe('50%');
	});
});
