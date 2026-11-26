import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './sanitize-url.js';

describe('sanitizeUrl', () => {
	it('allows valid relative URLs', () => {
		expect(sanitizeUrl('/page')).toBe('/page');
	});

	it('allows valid https URLs', () => {
		expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
	});

	it('blocks javascript: URLs', () => {
		expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
	});

	it('blocks data: URLs', () => {
		expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
	});

	it('blocks vbscript: URLs', () => {
		expect(sanitizeUrl('vbscript:MsgBox("XSS")')).toBeNull();
	});

	it('blocks blob: URLs', () => {
		expect(sanitizeUrl('blob:https://example.com/uuid')).toBeNull();
	});

	it('blocks uppercase javascript: URLs', () => {
		expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeNull();
	});

	it('blocks mixed case JavaScript: URLs', () => {
		expect(sanitizeUrl('JavaScript:alert(1)')).toBeNull();
	});

	it('blocks whitespace-prefixed javascript: URLs', () => {
		expect(sanitizeUrl('  javascript:alert(1)')).toBeNull();
	});

	it('blocks non-breaking-space-prefixed javascript: URLs', () => {
		expect(sanitizeUrl('\u00A0javascript:alert(1)')).toBeNull();
	});

	it('blocks zero-width-space-prefixed javascript: URLs', () => {
		expect(sanitizeUrl('\u200Bjavascript:alert(1)')).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(sanitizeUrl('')).toBeNull();
	});

	it('returns null for null', () => {
		expect(sanitizeUrl(null)).toBeNull();
	});

	it('trims leading/trailing whitespace from safe URLs', () => {
		expect(sanitizeUrl('  /page  ')).toBe('/page');
	});

	it('trims unicode whitespace from safe URLs', () => {
		expect(sanitizeUrl('\u00A0/page')).toBe('/page');
	});

	it('blocks javascript: with embedded newline', () => {
		expect(sanitizeUrl('java\nscript:alert(1)')).toBeNull();
	});

	it('blocks javascript: with embedded tab', () => {
		expect(sanitizeUrl('java\tscript:alert(1)')).toBeNull();
	});

	it('blocks javascript: with embedded carriage return', () => {
		expect(sanitizeUrl('java\rscript:alert(1)')).toBeNull();
	});

	it('strips embedded control chars from safe URLs', () => {
		expect(sanitizeUrl('/pa\nge')).toBe('/page');
	});

	it('blocks javascript: with embedded null byte', () => {
		expect(sanitizeUrl('java\u0000script:alert(1)')).toBeNull();
	});

	it('allows data: URLs with allowData (download context)', () => {
		expect(sanitizeUrl('data:text/csv,a,b,c', { allowData: true })).toBe('data:text/csv,a,b,c');
	});

	it('allows blob: URLs with allowData (download context)', () => {
		expect(sanitizeUrl('blob:https://example.com/uuid', { allowData: true })).toBe('blob:https://example.com/uuid');
	});

	it('still blocks javascript: with allowData', () => {
		expect(sanitizeUrl('javascript:alert(1)', { allowData: true })).toBeNull();
	});

	it('still blocks vbscript: with allowData', () => {
		expect(sanitizeUrl('vbscript:MsgBox("XSS")', { allowData: true })).toBeNull();
	});
});
