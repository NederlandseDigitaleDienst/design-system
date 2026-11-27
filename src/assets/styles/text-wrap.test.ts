import { describe, it, expect } from 'vitest';
import * as sets from './text-wrap.js';

const { important, ...wrapSets } = sets;

/** `important()` splits a set on `;`, so a set may hold only plain declarations. */
describe('text-wrap sets', () => {
	for (const [name, set] of Object.entries(wrapSets)) {
		it(`${name} holds only plain declarations, so important() can mark each one`, () => {
			const declarations = set.cssText.split(';').map((d) => d.trim()).filter(Boolean);
			for (const declaration of declarations) expect(declaration).toMatch(/^-?[a-z-]+\s*:\s*[^;'"(){}]+$/);
			const marked = important(set).cssText.split(';').map((d) => d.trim()).filter(Boolean);
			expect(marked).toHaveLength(declarations.length);
			for (const declaration of marked) expect(declaration).toMatch(/ !important$/);
		});
	}
});
