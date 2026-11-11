import { describe, it, expect } from 'vitest';

/* A file of its own, so nothing has defined nldd-list-item yet. */
describe('nldd-list – loaded on its own', () => {
	it('brings nldd-list-item along, so its rows are never plain elements', async () => {
		expect(customElements.get('nldd-list-item')).toBeUndefined();
		await import('./list.js');
		expect(customElements.get('nldd-list-item')).toBeDefined();
	});
});
