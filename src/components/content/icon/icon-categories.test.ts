import { describe, expect, it } from 'vitest';
import { ICON_CATEGORIES } from './icon-categories.js';

const files = Object.keys(import.meta.glob('./icons/*.svg')).map((path) => path.replace('./icons/', '').replace('.svg', ''));

describe('icon categories', () => {
	const categorized = Object.values(ICON_CATEGORIES).flat();

	it('puts every icon in a category', () => {
		expect(files.filter((name) => !categorized.includes(name))).toEqual([]);
	});

	it('puts no icon in two categories', () => {
		expect(categorized.filter((name, i) => categorized.indexOf(name) !== i)).toEqual([]);
	});

	it('names only icons that exist', () => {
		expect(categorized.filter((name) => !files.includes(name))).toEqual([]);
	});
});
