import { describe, it, expect } from 'vitest';
import { acceptNames, fileMatches, typeRuledOut } from './file-field.drop.js';

describe('file-field drop', () => {
	it('names what accept takes, one name per format', () => {
		expect(acceptNames('.pdf')).toEqual(['PDF']);
		expect(acceptNames('.jpg,.jpeg,.png')).toEqual(['JPG', 'PNG']);
		expect(acceptNames('application/pdf,image/*')).toEqual(['PDF', { family: 'image' }]);
	});

	it('names nothing when a part has no name', () => {
		expect(acceptNames('.pdf,application/vnd.ms-excel')).toBeNull();
		expect(acceptNames('')).toBeNull();
	});

	it('matches a file on its name or its type', () => {
		const png = new File(['x'], 'foto.PNG', { type: 'image/png' });
		expect(fileMatches('.png', png)).toBe(true);
		expect(fileMatches('image/*', png)).toBe(true);
		expect(fileMatches('.pdf', png)).toBe(false);
	});

	it('rules a dragged type out only when it is sure', () => {
		expect(typeRuledOut('.pdf', 'image/png')).toBe(true);
		expect(typeRuledOut('.pdf', '')).toBe(false);
		expect(typeRuledOut('.xyz', 'image/png')).toBe(false);
	});
});
