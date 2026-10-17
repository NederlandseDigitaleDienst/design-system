import { describe, it, expect } from 'vitest';
import { isExternalHref, linkHintKey } from './link-hint.js';

describe('linkHintKey', () => {
	it('gives no hint to a link on this site', () => {
		expect(linkHintKey('/overzicht', null)).toBeNull();
		expect(linkHintKey(`${location.origin}/overzicht`, null)).toBeNull();
		expect(linkHintKey('#inhoud', null)).toBeNull();
	});

	it('gives no hint without an href', () => {
		expect(linkHintKey('', '_blank')).toBeNull();
		expect(linkHintKey(undefined, '_blank')).toBeNull();
	});

	it('says a link to another origin goes to another website', () => {
		expect(linkHintKey('https://open.overheid.nl/', null)).toBe('external-site-label');
	});

	it('says a link opens in a new tab', () => {
		expect(linkHintKey('/overzicht', '_blank')).toBe('opens-in-new-tab-label');
	});

	it('makes one sentence of both', () => {
		expect(linkHintKey('https://open.overheid.nl/', '_blank')).toBe('external-site-opens-in-new-tab-label');
	});
});

describe('isExternalHref', () => {
	it('counts another port or a subdomain as another website', () => {
		const port = location.port === '1' ? '2' : '1';
		expect(isExternalHref(`${location.protocol}//${location.hostname}:${port}/`)).toBe(true);
		expect(isExternalHref(`${location.protocol}//docs.${location.hostname}/`)).toBe(true);
	});

	it('only counts web links', () => {
		expect(isExternalHref('mailto:info@example.org')).toBe(false);
		expect(isExternalHref('tel:+31201234567')).toBe(false);
		expect(isExternalHref('javascript:void(0)')).toBe(false);
	});

	it('resolves a protocol-relative link', () => {
		expect(isExternalHref('//open.overheid.nl/')).toBe(true);
	});
});
