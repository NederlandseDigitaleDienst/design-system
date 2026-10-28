import { describe, it, expect } from 'vitest';
import { downloadLinkHintKey, isExternalHref, linkHintKey } from './link-hint.js';

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
		expect(linkHintKey('https://open.overheid.nl/', null)).toBe('link-hint-external-lowercase-label');
	});

	it('says a link opens in a new tab', () => {
		expect(linkHintKey('/overzicht', '_blank')).toBe('link-hint-new-tab-lowercase-label');
	});

	it('says a link with download downloads the file, on this site only', () => {
		expect(downloadLinkHintKey('/verslag.pdf', null, '')).toBe('link-hint-download-lowercase-label');
		expect(downloadLinkHintKey('/verslag.pdf', '_blank', 'verslag.pdf')).toBe('link-hint-download-lowercase-label');
		expect(downloadLinkHintKey('https://open.overheid.nl/verslag.pdf', null, '')).toBe('link-hint-external-lowercase-label');
		expect(downloadLinkHintKey('/verslag.pdf', null, undefined)).toBeNull();
	});

	it('makes one sentence of both', () => {
		expect(linkHintKey('https://open.overheid.nl/', '_blank')).toBe('link-hint-external-new-tab-lowercase-label');
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
