import { describe, it, expect, afterEach } from 'vitest';
import { samePageHash } from './focus-target.js';

describe('samePageHash', () => {
	let base: HTMLBaseElement | null = null;

	afterEach(() => {
		base?.remove();
		base = null;
	});

	it('takes a fragment and an absolute link to this page', () => {
		expect(samePageHash('#inhoud')).toBe('#inhoud');
		expect(samePageHash(`${location.origin}${location.pathname}${location.search}#inhoud`)).toBe('#inhoud');
	});

	it('leaves a link to another page', () => {
		expect(samePageHash('/andere-pagina#inhoud')).toBe('');
	});

	it('resolves against the base URL, as the browser does', () => {
		base = document.createElement('base');
		base.href = `${location.origin}/elders/`;
		document.head.prepend(base);
		expect(samePageHash('#inhoud')).toBe('');
	});
});
